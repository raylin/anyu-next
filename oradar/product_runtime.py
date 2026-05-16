"""Reusable product runtime helpers for 曖昧溫度計."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .config import Config, find_repo_root, load_config
from .providers import ProviderError, call_provider


REPO_ROOT = find_repo_root(Path(__file__).resolve().parent)
PRODUCT_PROMPT_PATH = REPO_ROOT / "prompts" / "product_result_prompt_v0.md"
PRODUCT_SCHEMA_PATH = REPO_ROOT / "schemas" / "product_result_schema_v0.json"
EXPERIMENT_ID = "ambiguous-temperature-fake-door-v0"


class ProductRuntimeError(RuntimeError):
    """Raised when product runtime generation cannot complete."""


@dataclass(frozen=True)
class ProductRuntimeRequest:
    raw_content: str
    situation_type: str
    variant: str = "B"
    sample_id: str | None = None
    model_override: str | None = None


def generate_product_result(
    request: ProductRuntimeRequest,
    *,
    config: Config | None = None,
) -> dict[str, Any]:
    active_config = config or load_config()
    raw_content = request.raw_content.strip()
    if not raw_content:
        raise ProductRuntimeError("Input text is required.")

    metadata = {
        "sample_id": request.sample_id or "",
        "situation_type": request.situation_type.strip(),
        "input_length": len(raw_content),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "experiment_id": EXPERIMENT_ID,
        "variant": request.variant,
        "model_provider": active_config.provider,
        "model_name": resolve_model_name(active_config, request.model_override),
    }
    prompt = build_product_prompt(raw_content=raw_content, metadata=metadata)

    try:
        response_text = call_provider(
            active_config,
            prompt,
            model_override=request.model_override,
        )
    except ProviderError as exc:
        raise ProductRuntimeError(str(exc)) from exc

    result = parse_json_object(response_text)
    validate_against_schema(result, load_product_schema(), path="$")
    validate_share_card_privacy(result, raw_content)
    return result


def resolve_model_name(config: Config, model_override: str | None) -> str:
    if model_override:
        return model_override
    if config.provider == "anthropic":
        return config.anthropic_model
    return config.openai_model


def load_product_schema() -> dict[str, Any]:
    if not PRODUCT_SCHEMA_PATH.exists():
        raise ProductRuntimeError(f"Product schema not found: {PRODUCT_SCHEMA_PATH}")
    return json.loads(PRODUCT_SCHEMA_PATH.read_text(encoding="utf-8"))


def build_product_prompt(raw_content: str, metadata: dict[str, Any]) -> str:
    if not PRODUCT_PROMPT_PATH.exists():
        raise ProductRuntimeError(f"Product prompt not found: {PRODUCT_PROMPT_PATH}")

    prompt = PRODUCT_PROMPT_PATH.read_text(encoding="utf-8")
    prompt = prompt.replace("{{RAW_CONTENT}}", raw_content)
    prompt = prompt.replace("{{SOURCE_METADATA}}", json.dumps(metadata, ensure_ascii=False, indent=2))
    return prompt


def parse_json_object(text: str) -> dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)

    try:
        parsed = json.loads(stripped)
    except json.JSONDecodeError as exc:
        raise ProductRuntimeError(f"Model output was not valid JSON: {exc}") from exc

    if not isinstance(parsed, dict):
        raise ProductRuntimeError("Model output must be a single JSON object.")
    return parsed


def validate_against_schema(value: Any, schema: dict[str, Any], path: str) -> None:
    expected_type = schema.get("type")
    if expected_type == "object":
        if not isinstance(value, dict):
            raise ProductRuntimeError(f"{path} must be an object.")
        required = schema.get("required", [])
        missing = [field for field in required if field not in value]
        if missing:
            raise ProductRuntimeError(f"{path} missing required field(s): {', '.join(missing)}")
        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            extras = sorted(set(value) - set(properties))
            if extras:
                raise ProductRuntimeError(f"{path} has unexpected field(s): {', '.join(extras)}")
        for field, rules in properties.items():
            if field in value:
                validate_against_schema(value[field], rules, f"{path}.{field}")
        return

    if expected_type == "array":
        if not isinstance(value, list):
            raise ProductRuntimeError(f"{path} must be an array.")
        min_items = schema.get("minItems")
        max_items = schema.get("maxItems")
        if min_items is not None and len(value) < min_items:
            raise ProductRuntimeError(f"{path} must contain at least {min_items} item(s).")
        if max_items is not None and len(value) > max_items:
            raise ProductRuntimeError(f"{path} must contain at most {max_items} item(s).")
        item_schema = schema.get("items")
        if item_schema:
            for index, item in enumerate(value):
                validate_against_schema(item, item_schema, f"{path}[{index}]")
        return

    if expected_type == "string":
        if not isinstance(value, str):
            raise ProductRuntimeError(f"{path} must be a string.")
    elif expected_type == "integer":
        if not isinstance(value, int) or isinstance(value, bool):
            raise ProductRuntimeError(f"{path} must be an integer.")
        minimum = schema.get("minimum")
        maximum = schema.get("maximum")
        if minimum is not None and value < minimum:
            raise ProductRuntimeError(f"{path} must be >= {minimum}.")
        if maximum is not None and value > maximum:
            raise ProductRuntimeError(f"{path} must be <= {maximum}.")
    elif expected_type == "boolean":
        if not isinstance(value, bool):
            raise ProductRuntimeError(f"{path} must be a boolean.")

    if "enum" in schema and value not in schema["enum"]:
        raise ProductRuntimeError(f"{path} must be one of: {schema['enum']}.")
    if "const" in schema and value != schema["const"]:
        raise ProductRuntimeError(f"{path} must equal {schema['const']!r}.")


def validate_share_card_privacy(result: dict[str, Any], raw_content: str) -> None:
    share_card_text = json.dumps(result.get("share_card", {}), ensure_ascii=False)
    if raw_content and raw_content in share_card_text:
        raise ProductRuntimeError("share_card must not include the raw conversation text.")
