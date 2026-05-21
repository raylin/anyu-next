"""Load and normalize structured JSONL input."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .schema import GenericRecord


def load_jsonl_records(path: Path) -> list[GenericRecord]:
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Input file not found: {path}")

    records: list[GenericRecord] = []
    for lineno, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw_line.strip()
        if not line:
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSONL at line {lineno}: {exc}") from exc
        if not isinstance(value, dict):
            raise ValueError(f"Invalid JSONL at line {lineno}: expected object")
        records.append(normalize_record(value, fallback_id=f"record-{lineno:03d}"))
    return records


def normalize_record(record: dict[str, Any], *, fallback_id: str) -> GenericRecord:
    record_id = _first_non_empty(record, "id", "source_id") or fallback_id
    source = _first_non_empty(record, "source") or "manual"
    title = _clean_text(record.get("title", ""))

    content_parts = [
        _clean_text(record.get("excerpt", "")),
        _clean_text(record.get("content", "")),
    ]
    content = "\n".join(part for part in content_parts if part).strip()

    url = _nullable_text(record.get("url") or record.get("url_or_ref"))
    published_at = _nullable_text(record.get("publishedAt") or record.get("created_at"))

    metrics = record.get("metrics") if isinstance(record.get("metrics"), dict) else {}
    likes = _to_int(metrics.get("likes", record.get("like_count", 0)))
    comments = _to_int(metrics.get("comments", record.get("comment_count", 0)))
    shares = _to_int(metrics.get("shares", record.get("share_count", 0)))
    tags = _normalize_tags(record.get("tags", record.get("topics", [])))

    return GenericRecord(
        id=str(record_id),
        source=str(source),
        title=title,
        content=content,
        url=url,
        published_at=published_at,
        likes=likes,
        comments=comments,
        shares=shares,
        tags=tags,
    )


def _first_non_empty(record: dict[str, Any], *keys: str) -> str | None:
    for key in keys:
        value = _nullable_text(record.get(key))
        if value:
            return value
    return None


def _nullable_text(value: Any) -> str | None:
    text = _clean_text(value)
    return text or None


def _clean_text(value: Any) -> str:
    return " ".join(str(value or "").split()).strip()


def _to_int(value: Any) -> int:
    try:
        return max(0, int(value or 0))
    except (TypeError, ValueError):
        return 0


def _normalize_tags(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    tags: list[str] = []
    for item in value:
        cleaned = _clean_text(item)
        if cleaned:
            tags.append(cleaned)
    return tags
