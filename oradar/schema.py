"""Signal schema validation for Signal Extraction v1."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class SignalValidationError(ValueError):
    """Raised when extracted signal JSON does not match v1 expectations."""


def load_json_schema(schema_path: Path) -> dict[str, Any]:
    return json.loads(schema_path.read_text(encoding="utf-8"))


def validate_signal(signal: dict[str, Any], schema: dict[str, Any]) -> dict[str, Any]:
    """Validate the subset of JSON Schema used by signal_schema_v1.json.

    The project intentionally avoids a runtime dependency for v1. This validator
    enforces required fields, additional property rules, primitive types, enums,
    integer score ranges, and array item types used by the current schema.
    """

    if not isinstance(signal, dict):
        raise SignalValidationError("Signal output must be a JSON object.")

    required = schema.get("required", [])
    missing = [field for field in required if field not in signal]
    if missing:
        raise SignalValidationError(f"Missing required field(s): {', '.join(missing)}")

    properties = schema.get("properties", {})
    if schema.get("additionalProperties") is False:
        extras = sorted(set(signal) - set(properties))
        if extras:
            raise SignalValidationError(f"Unexpected field(s): {', '.join(extras)}")

    for field, rules in properties.items():
        if field not in signal:
            continue
        _validate_field(field, signal[field], rules)

    return signal


def _validate_field(field: str, value: Any, rules: dict[str, Any]) -> None:
    expected_type = rules.get("type")
    if expected_type == "string" and not isinstance(value, str):
        raise SignalValidationError(f"`{field}` must be a string.")
    if expected_type == "integer":
        if not isinstance(value, int) or isinstance(value, bool):
            raise SignalValidationError(f"`{field}` must be an integer.")
        minimum = rules.get("minimum")
        maximum = rules.get("maximum")
        if minimum is not None and value < minimum:
            raise SignalValidationError(f"`{field}` must be >= {minimum}.")
        if maximum is not None and value > maximum:
            raise SignalValidationError(f"`{field}` must be <= {maximum}.")
    if expected_type == "array":
        if not isinstance(value, list):
            raise SignalValidationError(f"`{field}` must be an array.")
        item_type = rules.get("items", {}).get("type")
        if item_type == "string":
            bad_items = [item for item in value if not isinstance(item, str)]
            if bad_items:
                raise SignalValidationError(f"`{field}` must contain only strings.")

    allowed = rules.get("enum")
    if allowed is not None and value not in allowed:
        allowed_values = ", ".join(str(item) for item in allowed)
        raise SignalValidationError(f"`{field}` must be one of: {allowed_values}.")

