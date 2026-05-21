"""Export records as JSONL."""

from __future__ import annotations

import json
from dataclasses import asdict, is_dataclass
from pathlib import Path
from typing import Any, Iterable


def _snake_to_camel(value: str) -> str:
    parts = value.split("_")
    if len(parts) == 1:
        return value
    head, *tail = parts
    return head + "".join(part.capitalize() for part in tail)


def _camelize(payload: Any) -> Any:
    if isinstance(payload, dict):
        return {_snake_to_camel(str(key)): _camelize(value) for key, value in payload.items()}
    if isinstance(payload, list):
        return [_camelize(item) for item in payload]
    return payload


def export_jsonl(records: Iterable[Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            payload = asdict(record) if is_dataclass(record) else record
            handle.write(json.dumps(_camelize(payload), ensure_ascii=False) + "\n")
