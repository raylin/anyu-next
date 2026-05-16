#!/usr/bin/env python3
"""Dev-only product result sample generator for 曖昧溫度計."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from oradar.product_runtime import (  # noqa: E402
    ProductRuntimeError,
    ProductRuntimeRequest,
    generate_product_result,
)


DEFAULT_OUTPUT_DIR = REPO_ROOT / "outputs" / "product_samples" / "generated"


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
    except ProductRuntimeError as exc:
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
    raw_file = raw_file.resolve()
    if not raw_file.exists() or not raw_file.is_file():
        raise ProductRuntimeError(f"Raw product sample not found: {raw_file}")

    raw_content, situation_type = parse_product_sample(raw_file)
    if not raw_content:
        raise ProductRuntimeError(f"Raw product sample is empty: {raw_file}")

    result = generate_product_result(
        ProductRuntimeRequest(
            raw_content=raw_content,
            situation_type=situation_type,
            variant=variant,
            sample_id=raw_file.stem,
            model_override=model_override,
        )
    )

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{raw_file.stem}.result.json"
    output_path.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
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


if __name__ == "__main__":
    raise SystemExit(main())
