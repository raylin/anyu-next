#!/usr/bin/env python3
"""Dev-only product result sample generator for 曖昧溫度計."""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from oradar.config import load_config  # noqa: E402


PROMPT_PATH = REPO_ROOT / "prompts" / "product_result_prompt_v0.md"
SCHEMA_PATH = REPO_ROOT / "schemas" / "product_result_schema_v0.json"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "outputs" / "product_samples" / "generated"
EXPERIMENT_ID = "ambiguous-temperature-fake-door-v0"


class ProductGenerationError(RuntimeError):
    """Raised when product sample generation cannot complete."""


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate one dev-only product result sample.")
    parser.add_argument("raw_file", type=Path, help="Path to product sample raw input.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--variant", default="B")
    parser.add_argument("--model", default=None)
    args = parser.parse_args()

    try:
        output_path = generate_product_sample(
            raw_file=args.raw_file,
            output_dir=args.output_dir,
            variant=args.variant,
            model_override=args.model,
        )
    except ProductGenerationError as exc:
        print(f"Product sample generation failed: {exc}", file=sys.stderr)
        return 1

    print("Product sample generation complete")
    print(f"Output: {output_path}")
    print("Validation: passed")
    return 0


def generate_product_sample(
    raw_file: Path,
    output_dir: Path,
    variant: str,
    model_override: str | None,
) -> Path:
    config = load_config()
    if not config.anthropic_api_key:
        raise ProductGenerationError("ANTHROPIC_API_KEY is not set.")

    raw_file = raw_file.resolve()
    if not raw_file.exists() or not raw_file.is_file():
        raise ProductGenerationError(f"Raw product sample not found: {raw_file}")

    raw_content, situation_type = parse_product_sample(raw_file)
    if not raw_content:
        raise ProductGenerationError(f"Raw product sample is empty: {raw_file}")

    model_name = model_override or config.anthropic_model
    metadata = {
        "sample_id": raw_file.stem,
        "situation_type": situation_type,
        "input_length": len(raw_content),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "experiment_id": EXPERIMENT_ID,
        "variant": variant,
        "model_provider": "anthropic",
        "model_name": model_name,
    }
    prompt = build_prompt(raw_content=raw_content, metadata=metadata)
    response_text = call_anthropic(
        api_key=config.anthropic_api_key,
        model=model_name,
        prompt=prompt,
    )
    result = parse_json_object(response_text)
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    validate_against_schema(result, schema, path="$")
    validate_share_card_privacy(result, raw_content)

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{raw_file.stem}.result.json"
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return output_path


def parse_product_sample(raw_file: Path) -> tuple[str, str]:
    text = raw_file.read_text(encoding="utf-8").strip()
    situation_type = ""
    content_lines: list[str] = []

    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("Situation type:"):
            situation_type = stripped.split(":", 1)[1].strip()
            continue
        if stripped.startswith("Theme:"):
            continue
        content_lines.append(line)

    raw_content = "\n".join(content_lines).strip()
    return raw_content, situation_type


def build_prompt(raw_content: str, metadata: dict[str, Any]) -> str:
    if not PROMPT_PATH.exists():
        raise ProductGenerationError(f"Product prompt not found: {PROMPT_PATH}")

    prompt = PROMPT_PATH.read_text(encoding="utf-8")
    prompt = prompt.replace("{{RAW_CONTENT}}", raw_content)
    prompt = prompt.replace("{{SOURCE_METADATA}}", json.dumps(metadata, ensure_ascii=False, indent=2))
    return prompt


def call_anthropic(api_key: str, model: str, prompt: str) -> str:
    payload = {
        "model": model,
        "max_tokens": 4096,
        "messages": [
            {
                "role": "user",
                "content": (
                    "Return only one valid JSON object matching the provided schema. "
                    "Do not include markdown fences or commentary.\n\n"
                    f"{prompt}"
                ),
            }
        ],
    }
    request = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise ProductGenerationError(f"Anthropic API request failed with HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise ProductGenerationError(f"Anthropic API request failed: {exc.reason}") from exc

    text_parts: list[str] = []
    for content in data.get("content", []):
        if content.get("type") == "text" and isinstance(content.get("text"), str):
            text_parts.append(content["text"])

    if not text_parts:
        raise ProductGenerationError("Anthropic API response did not include text content.")
    return "\n".join(text_parts)


def parse_json_object(text: str) -> dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)

    try:
        parsed = json.loads(stripped)
    except json.JSONDecodeError as exc:
        raise ProductGenerationError(f"Model output was not valid JSON: {exc}") from exc

    if not isinstance(parsed, dict):
        raise ProductGenerationError("Model output must be a single JSON object.")
    return parsed


def validate_against_schema(value: Any, schema: dict[str, Any], path: str) -> None:
    expected_type = schema.get("type")
    if expected_type == "object":
        if not isinstance(value, dict):
            raise ProductGenerationError(f"{path} must be an object.")
        required = schema.get("required", [])
        missing = [field for field in required if field not in value]
        if missing:
            raise ProductGenerationError(f"{path} missing required field(s): {', '.join(missing)}")
        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            extras = sorted(set(value) - set(properties))
            if extras:
                raise ProductGenerationError(f"{path} has unexpected field(s): {', '.join(extras)}")
        for field, rules in properties.items():
            if field in value:
                validate_against_schema(value[field], rules, f"{path}.{field}")
        return

    if expected_type == "array":
        if not isinstance(value, list):
            raise ProductGenerationError(f"{path} must be an array.")
        min_items = schema.get("minItems")
        max_items = schema.get("maxItems")
        if min_items is not None and len(value) < min_items:
            raise ProductGenerationError(f"{path} must contain at least {min_items} item(s).")
        if max_items is not None and len(value) > max_items:
            raise ProductGenerationError(f"{path} must contain at most {max_items} item(s).")
        item_schema = schema.get("items")
        if item_schema:
            for index, item in enumerate(value):
                validate_against_schema(item, item_schema, f"{path}[{index}]")
        return

    if expected_type == "string":
        if not isinstance(value, str):
            raise ProductGenerationError(f"{path} must be a string.")
    elif expected_type == "integer":
        if not isinstance(value, int) or isinstance(value, bool):
            raise ProductGenerationError(f"{path} must be an integer.")
        minimum = schema.get("minimum")
        maximum = schema.get("maximum")
        if minimum is not None and value < minimum:
            raise ProductGenerationError(f"{path} must be >= {minimum}.")
        if maximum is not None and value > maximum:
            raise ProductGenerationError(f"{path} must be <= {maximum}.")
    elif expected_type == "boolean":
        if not isinstance(value, bool):
            raise ProductGenerationError(f"{path} must be a boolean.")

    if "enum" in schema and value not in schema["enum"]:
        raise ProductGenerationError(f"{path} must be one of: {schema['enum']}.")
    if "const" in schema and value != schema["const"]:
        raise ProductGenerationError(f"{path} must equal {schema['const']!r}.")


def validate_share_card_privacy(result: dict[str, Any], raw_content: str) -> None:
    share_card_text = json.dumps(result.get("share_card", {}), ensure_ascii=False)
    if raw_content and raw_content in share_card_text:
        raise ProductGenerationError("share_card must not include the raw conversation text.")


if __name__ == "__main__":
    raise SystemExit(main())
