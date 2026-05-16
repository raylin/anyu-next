"""Command-line interface for Opportunity Radar."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .config import load_config
from .extractor import ALLOWED_SOURCE_TYPES, ExtractionError, extract_signal


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="oradar", description="Opportunity Radar local CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    extract_parser = subparsers.add_parser(
        "extract",
        help="Extract one structured signal JSON object from one raw text file.",
    )
    extract_parser.add_argument("raw_file", type=Path, help="Path to the raw input text file.")
    extract_parser.add_argument(
        "--source-type",
        required=True,
        choices=sorted(ALLOWED_SOURCE_TYPES),
        help="Manual source type for Signal Extraction v1.",
    )
    extract_parser.add_argument(
        "--model",
        default=None,
        help="Provider model override. Defaults to OPENAI_MODEL or ANTHROPIC_MODEL based on ORADAR_PROVIDER.",
    )

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "extract":
        config = load_config()
        try:
            result = extract_signal(args.raw_file, args.source_type, config, model_override=args.model)
        except ExtractionError as exc:
            print(f"Extraction failed: {exc}", file=sys.stderr)
            return 1

        print("Extraction complete")
        print(f"Output: {result.output_path}")
        print("Validation: passed")
        return 0

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
