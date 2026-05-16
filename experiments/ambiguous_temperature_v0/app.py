#!/usr/bin/env python3
"""Local prototype server for the 曖昧溫度計 fake-door experiment."""

from __future__ import annotations

import argparse
import json
import mimetypes
import sys
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from experiments.ambiguous_temperature_v0.contact_capture import (
    ContactSubmissionError,
    build_contact_record,
)
from experiments.ambiguous_temperature_v0.event_log import (
    CONTACT_SUBMISSIONS_PATH,
    EVENT_LOG_PATH,
    SUBMISSIONS_PATH,
    iso_timestamp,
    log_contact_submission,
    log_event,
    log_submission,
)
from experiments.ambiguous_temperature_v0.product_runtime import (
    DEFAULT_VARIANT,
    EXPERIMENT_ID,
    PAID_CTA_LABEL,
    SITUATION_OPTIONS,
    analyze_submission,
    build_analysis_properties,
    build_submission_record,
    normalize_situation_type,
    normalize_variant,
    temperature_band,
)
from oradar.product_runtime import ProductRuntimeError


BASE_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"
INDEX_TEMPLATE = TEMPLATES_DIR / "index.html"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the 曖昧溫度計 prototype server.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8010)
    return parser.parse_args()


class PrototypeHandler(BaseHTTPRequestHandler):
    server_version = "AmbiguousTemperaturePrototype/0.1"

    def do_GET(self) -> None:
        if self.path == "/" or self.path.startswith("/?"):
            self._serve_index()
            return
        if self.path.startswith("/static/"):
            self._serve_static(self.path.removeprefix("/static/"))
            return
        if self.path == "/health":
            self._write_json(HTTPStatus.OK, {"status": "ok"})
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def do_POST(self) -> None:
        if self.path == "/api/events":
            self._handle_event()
            return
        if self.path == "/api/analyze":
            self._handle_analyze()
            return
        if self.path == "/api/contact":
            self._handle_contact()
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def log_message(self, format: str, *args: object) -> None:
        return

    def _serve_index(self) -> None:
        template = INDEX_TEMPLATE.read_text(encoding="utf-8")
        html = template.replace(
            "__APP_CONFIG__",
            json.dumps(
                {
                    "experimentId": EXPERIMENT_ID,
                    "variant": DEFAULT_VARIANT,
                    "paidCtaLabel": PAID_CTA_LABEL,
                    "situationOptions": list(SITUATION_OPTIONS),
                    "eventLogPath": str(EVENT_LOG_PATH.relative_to(BASE_DIR.parents[1])),
                    "submissionLogPath": str(SUBMISSIONS_PATH.relative_to(BASE_DIR.parents[1])),
                    "contactLogPath": str(CONTACT_SUBMISSIONS_PATH.relative_to(BASE_DIR.parents[1])),
                },
                ensure_ascii=False,
            ),
        )
        body = html.encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_static(self, relative_path: str) -> None:
        safe_path = Path(relative_path).name
        file_path = STATIC_DIR / safe_path
        if not file_path.exists() or not file_path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, "Static file not found")
            return

        mime_type, _ = mimetypes.guess_type(str(file_path))
        payload = file_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", f"{mime_type or 'application/octet-stream'}; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _handle_event(self) -> None:
        try:
            payload = self._read_json_body()
        except ValueError as exc:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return
        try:
            record = log_event(
                event_name=str(payload.get("event_name", "")).strip(),
                session_id=str(payload.get("session_id", "")).strip(),
                variant=normalize_variant(str(payload.get("variant", DEFAULT_VARIANT))),
                properties=dict(payload.get("properties", {})),
            )
        except (TypeError, ValueError) as exc:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return
        self._write_json(HTTPStatus.OK, {"event": record})

    def _handle_analyze(self) -> None:
        try:
            payload = self._read_json_body()
        except ValueError as exc:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return
        input_text = str(payload.get("input_text", "")).strip()
        if not input_text:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": "Input text is required."})
            return

        timestamp = iso_timestamp()
        submission = build_submission_record(
            timestamp=timestamp,
            session_id=str(payload.get("session_id", "")).strip(),
            variant=str(payload.get("variant", DEFAULT_VARIANT)),
            situation_type=str(payload.get("situation_type", "")),
            input_text=input_text,
        )
        submission_record = submission.__dict__.copy()
        log_submission(submission_record)

        log_event(
            event_name="input_submitted",
            session_id=submission.session_id,
            variant=submission.variant,
            properties={
                "situation_type": submission.situation_type,
                "input_length": submission.input_length,
                "input_length_bucket": submission.input_length_bucket,
                "has_conversation_snippet": submission.has_conversation_snippet,
            },
        )

        try:
            result = analyze_submission(
                input_text=submission.input_text,
                situation_type=submission.situation_type,
                variant=submission.variant,
            )
        except ProductRuntimeError as exc:
            self._write_json(HTTPStatus.BAD_GATEWAY, {"error": str(exc)})
            return

        properties = build_analysis_properties(submission=submission, result=result)
        log_event(
            event_name="analysis_completed",
            session_id=submission.session_id,
            variant=submission.variant,
            properties=properties,
        )
        response = {
            "result": result,
            "summary": properties,
        }
        self._write_json(HTTPStatus.OK, response)

    def _handle_contact(self) -> None:
        try:
            payload = self._read_json_body()
        except ValueError as exc:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return
        timestamp = iso_timestamp()
        try:
            record = build_contact_record(
                timestamp=timestamp,
                session_id=str(payload.get("session_id", "")).strip(),
                contact_type=str(payload.get("contact_type", "")),
                contact_value=str(payload.get("contact_value", "")),
                situation_type=normalize_situation_type(str(payload.get("situation_type", ""))),
                state_label=str(payload.get("state_label", "")).strip(),
                temperature_score=int(payload.get("temperature_score", 0)),
            )
        except (ContactSubmissionError, TypeError, ValueError) as exc:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return

        log_contact_submission(record)
        log_event(
            event_name="contact_submitted",
            session_id=str(record["session_id"]),
            variant=normalize_variant(str(payload.get("variant", DEFAULT_VARIANT))),
            properties={
                "contact_type": record["contact_type"],
                "situation_type": record["situation_type"],
                "state_label": record["state_label"],
                "temperature_score": record["temperature_score"],
                "temperature_band": temperature_band(int(record["temperature_score"])),
            },
        )
        self._write_json(
            HTTPStatus.OK,
            {
                "message": "目前正在內測。留下 LINE 或 Email，我們會人工送你一次完整分析。",
                "recorded": True,
            },
        )

    def _read_json_body(self) -> dict[str, Any]:
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError as exc:
            raise ValueError("Invalid Content-Length header.") from exc

        raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError("Request body must be valid JSON.") from exc
        if not isinstance(payload, dict):
            raise ValueError("Request body must be a JSON object.")
        return payload

    def _write_json(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> int:
    args = parse_args()
    server = ThreadingHTTPServer((args.host, args.port), PrototypeHandler)
    print(f"Serving 曖昧溫度計 prototype at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down prototype server.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
