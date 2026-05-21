"""Normalization helpers for multi-source topic-ingestion input."""

from __future__ import annotations

import re
from typing import Any


SOURCE_WEIGHTS: dict[str, float] = {
    "dcard": 1.00,
    "ptt": 0.70,
    "mobile01": 0.35,
    "manual": 0.80,
    "unknown": 0.50,
}

TITLE_PREFIX_RE = re.compile(r"^\s*Re:\s*", re.IGNORECASE)
TITLE_TAG_RE = re.compile(r"\[([^\]]+)\]")
HTML_RE = re.compile(r"<[^>]+>")
URL_ONLY_RE = re.compile(r"^\s*(https?://\S+)\s*$", re.IGNORECASE)
PTT_METADATA_PREFIXES = (
    "發信站:",
    "※ 發信站:",
    "來自:",
    "※ 文章網址:",
    "--",
    "Sent from",
)


def canonical_source(value: Any) -> str:
    source = clean_inline_text(value).lower()
    if not source:
        return "manual"
    if "dcard" in source:
        return "dcard"
    if "ptt" in source:
        return "ptt"
    if "mobile01" in source:
        return "mobile01"
    if source == "manual":
        return "manual"
    return source


def source_weight_for(source: str) -> float:
    return SOURCE_WEIGHTS.get(source, SOURCE_WEIGHTS["unknown"])


def normalize_title(title: Any, raw_title: Any = None) -> tuple[str, list[str]]:
    base = clean_inline_text(title) or clean_inline_text(raw_title)
    base = TITLE_PREFIX_RE.sub("", base)
    tags = [match.group(1).strip() for match in TITLE_TAG_RE.finditer(base) if match.group(1).strip()]
    base = TITLE_TAG_RE.sub("", base)
    base = clean_inline_text(base)
    return base, tags


def clean_inline_text(value: Any) -> str:
    return " ".join(str(value or "").split()).strip()


def clean_multiline_text(value: Any) -> str:
    text = str(value or "")
    lines = [clean_inline_text(line) for line in text.splitlines()]
    return "\n".join(line for line in lines if line).strip()


def clean_content_text(content: Any, content_raw: Any = None) -> str:
    preferred = clean_multiline_text(content)
    if preferred:
        return preferred
    raw = str(content_raw or "")
    cleaned_lines: list[str] = []
    for raw_line in raw.splitlines():
        line = HTML_RE.sub(" ", raw_line)
        line = clean_inline_text(line)
        if not line:
            continue
        if URL_ONLY_RE.match(line):
            continue
        if any(line.startswith(prefix) for prefix in PTT_METADATA_PREFIXES):
            continue
        if line.startswith(">") or line.startswith("※ 引述"):
            continue
        if "imgur" in line.lower() or "iframe" in line.lower():
            continue
        cleaned_lines.append(line)
    return "\n".join(cleaned_lines).strip()


def normalize_comment_texts(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    comments: list[str] = []
    for item in value:
        if isinstance(item, dict):
            text = clean_inline_text(item.get("content") or item.get("text") or item.get("body"))
        else:
            text = clean_inline_text(item)
        if text:
            comments.append(text)
    return comments


def normalize_tags(value: Any, extra_tags: list[str] | None = None) -> list[str]:
    tags: list[str] = []
    if isinstance(value, list):
        for item in value:
            cleaned = clean_inline_text(item)
            if cleaned:
                tags.append(cleaned)
    for item in extra_tags or []:
        cleaned = clean_inline_text(item)
        if cleaned:
            tags.append(cleaned)
    deduped: list[str] = []
    seen: set[str] = set()
    for tag in tags:
        if tag not in seen:
            seen.add(tag)
            deduped.append(tag)
    return deduped


def to_int(value: Any) -> int:
    try:
        return max(0, int(value or 0))
    except (TypeError, ValueError):
        return 0
