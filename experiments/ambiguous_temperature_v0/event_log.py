"""Local JSONL logging for the 曖昧溫度計 prototype."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from oradar.config import find_repo_root

from .product_runtime import DEFAULT_VARIANT, EXPERIMENT_ID


REPO_ROOT = find_repo_root(Path(__file__).resolve().parent)
OUTPUT_DIR = REPO_ROOT / "outputs" / "experiments" / "ambiguous_temperature_v0"
EVENT_LOG_PATH = OUTPUT_DIR / "events.jsonl"
SUBMISSIONS_PATH = OUTPUT_DIR / "submissions.jsonl"
CONTACT_SUBMISSIONS_PATH = OUTPUT_DIR / "contact_submissions.jsonl"
ALLOWED_EVENTS = {
    "page_view",
    "situation_selected",
    "input_started",
    "input_submitted",
    "analysis_completed",
    "paid_unlock_clicked",
    "contact_submitted",
    "share_card_clicked",
}


def iso_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def append_jsonl(path: Path, record: dict[str, Any]) -> None:
    ensure_output_dir()
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def log_event(
    *,
    event_name: str,
    session_id: str,
    variant: str = DEFAULT_VARIANT,
    properties: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if event_name not in ALLOWED_EVENTS:
        raise ValueError(f"Unsupported event name: {event_name}")

    record = {
        "event_name": event_name,
        "timestamp": iso_timestamp(),
        "experiment_id": EXPERIMENT_ID,
        "session_id": session_id.strip(),
        "variant": variant.strip().upper() or DEFAULT_VARIANT,
        "properties": properties or {},
    }
    append_jsonl(EVENT_LOG_PATH, record)
    return record


def log_submission(record: dict[str, Any]) -> None:
    append_jsonl(SUBMISSIONS_PATH, record)


def log_contact_submission(record: dict[str, Any]) -> None:
    append_jsonl(CONTACT_SUBMISSIONS_PATH, record)
