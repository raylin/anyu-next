"""Signal Extraction v1 orchestration."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .config import Config
from .providers import ProviderError, call_provider
from .schema import SignalValidationError, load_json_schema, validate_signal


ALLOWED_SOURCE_TYPES = {"manual_paste", "dcard_manual", "reddit_manual"}


class ExtractionError(RuntimeError):
    """Raised when extraction cannot complete."""


@dataclass(frozen=True)
class ExtractionResult:
    output_path: Path
    signal: dict[str, Any]


def extract_signal(
    raw_path: Path,
    source_type: str,
    config: Config,
    model_override: str | None = None,
) -> ExtractionResult:
    if source_type not in ALLOWED_SOURCE_TYPES:
        allowed = ", ".join(sorted(ALLOWED_SOURCE_TYPES))
        raise ExtractionError(f"Unsupported source type `{source_type}`. Allowed: {allowed}")

    raw_path = raw_path.resolve()
    if not raw_path.exists():
        raise ExtractionError(f"Raw input file not found: {raw_path}")
    if not raw_path.is_file():
        raise ExtractionError(f"Raw input path is not a file: {raw_path}")

    raw_text = raw_path.read_text(encoding="utf-8").strip()
    if not raw_text:
        raise ExtractionError(f"Raw input file is empty: {raw_path}")

    source_id = source_id_for(raw_path)
    prompt = build_prompt(
        prompt_path=config.prompt_path,
        raw_text=raw_text,
        source_type=source_type,
        raw_path=raw_path,
        source_id=source_id,
    )
    try:
        response_text = call_provider(config=config, prompt=prompt, model_override=model_override)
    except ProviderError as exc:
        raise ExtractionError(str(exc)) from exc

    signal = parse_json_object(response_text)
    normalize_signal(signal=signal, source_id=source_id, source_type=source_type, raw_text=raw_text)

    schema = load_json_schema(config.schema_path)
    try:
        validated = validate_signal(signal, schema)
    except SignalValidationError as exc:
        raise ExtractionError(f"Model output failed schema validation: {exc}") from exc

    output_path = output_path_for(raw_path, config.structured_output_dir)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(validated, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    return ExtractionResult(output_path=output_path, signal=validated)


def build_prompt(
    prompt_path: Path,
    raw_text: str,
    source_type: str,
    raw_path: Path,
    source_id: str | None = None,
) -> str:
    if not prompt_path.exists():
        raise ExtractionError(f"Prompt file not found: {prompt_path}")

    clean_source_id = source_id or source_id_for(raw_path)
    source_metadata = {
        "source_id": clean_source_id,
        "source_type": source_type,
        "source_file": raw_path.name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "output_boundary": "1 raw input file -> 1 structured signal JSON object",
    }
    prompt = prompt_path.read_text(encoding="utf-8")
    prompt = prompt.replace("{{RAW_CONTENT}}", raw_text)
    prompt = prompt.replace("{{SOURCE_METADATA}}", json.dumps(source_metadata, ensure_ascii=False, indent=2))
    return prompt


def source_id_for(raw_path: Path) -> str:
    return raw_path.stem


def normalize_signal(signal: dict[str, Any], source_id: str, source_type: str, raw_text: str) -> dict[str, Any]:
    signal["source"] = source_id
    signal.setdefault("platform", source_type)
    signal.setdefault("raw_text", raw_text)
    return signal


def parse_json_object(text: str) -> dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)

    try:
        parsed = json.loads(stripped)
    except json.JSONDecodeError as exc:
        raise ExtractionError(f"Model output was not valid JSON: {exc}") from exc

    if not isinstance(parsed, dict):
        raise ExtractionError("Model output must be a single JSON object.")
    return parsed


def output_path_for(raw_path: Path, output_dir: Path) -> Path:
    return output_dir / f"{raw_path.stem}.signal.json"
