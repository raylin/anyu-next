"""Load and normalize structured JSONL input."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .normalizers import (
    canonical_source,
    clean_inline_text,
    clean_multiline_text,
    clean_content_text,
    normalize_comment_texts,
    normalize_tags,
    normalize_title,
    source_weight_for,
    to_int,
)
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
    extra = record.get("extra") if isinstance(record.get("extra"), dict) else {}
    record_id = _first_non_empty(record, "platform_post_id", "id", "source_id") or fallback_id
    source = canonical_source(_first_non_empty(record, "platform", "source") or "manual")
    title, title_tags = normalize_title(record.get("title", ""), extra.get("raw_title"))

    excerpt = clean_multiline_text(record.get("excerpt", ""))
    content = clean_content_text(record.get("content", ""), record.get("content_raw"))
    if excerpt and excerpt not in content:
        content = "\n".join(part for part in [excerpt, content] if part).strip()

    url = _nullable_text(record.get("url") or record.get("url_or_ref"))
    published_at = _nullable_text(record.get("publishedAt") or record.get("created_at"))

    metrics = record.get("metrics") if isinstance(record.get("metrics"), dict) else {}
    likes = to_int(metrics.get("likes", record.get("like_count", extra.get("push_count", 0))))
    dislikes = to_int(metrics.get("dislikes", record.get("dislike_count", extra.get("boo_count", 0))))
    comment_texts = normalize_comment_texts(record.get("comments", []))
    comments = to_int(metrics.get("comments", record.get("comment_count", len(comment_texts))))
    shares = to_int(metrics.get("shares", record.get("share_count", 0)))
    board = clean_inline_text(record.get("board"))
    tags = normalize_tags(record.get("tags", record.get("topics", [])), extra_tags=title_tags + ([board] if board else []))
    source_weight = source_weight_for(source)

    return GenericRecord(
        id=str(record_id),
        source=str(source),
        title=title,
        content=content,
        url=url,
        published_at=published_at,
        likes=likes,
        dislikes=dislikes,
        comments=comments,
        shares=shares,
        tags=tags,
        comment_texts=comment_texts,
        source_weight=source_weight,
    )


def _first_non_empty(record: dict[str, Any], *keys: str) -> str | None:
    for key in keys:
        value = _nullable_text(record.get(key))
        if value:
            return value
    return None


def _nullable_text(value: Any) -> str | None:
    text = clean_inline_text(value)
    return text or None


def _clean_text(value: Any) -> str:
    return clean_inline_text(value)


def _to_int(value: Any) -> int:
    return to_int(value)


def _normalize_tags(value: Any) -> list[str]:
    return normalize_tags(value)
