"""CLI for topic ingestion tooling."""

from __future__ import annotations

import argparse
from dataclasses import asdict
import json
from pathlib import Path

from .exporters import export_jsonl
from .extractors import extract_topic_candidates
from .loaders import load_jsonl_records
from .schema import QuestionSeed, TopicCandidate
from .transformers import topic_candidates_to_question_seeds


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Source-agnostic topic ingestion tooling.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    extract_parser = subparsers.add_parser("extract", help="Extract topic candidates from generic JSONL input.")
    extract_parser.add_argument("--input", type=Path, required=True)
    extract_parser.add_argument("--output", type=Path, required=True)

    questions_parser = subparsers.add_parser("questions", help="Generate question seeds from topic-candidate JSONL.")
    questions_parser.add_argument("--input", type=Path, required=True)
    questions_parser.add_argument("--output", type=Path, required=True)

    pipeline_parser = subparsers.add_parser("pipeline", help="Run extract and questions in sequence.")
    pipeline_parser.add_argument("--input", type=Path, required=True)
    pipeline_parser.add_argument("--topics-output", type=Path, required=True)
    pipeline_parser.add_argument("--questions-output", type=Path, required=True)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "extract":
        records = load_jsonl_records(args.input)
        topics = extract_topic_candidates(records)
        export_jsonl(topics, args.output)
        print(f"Topic candidates: {len(topics)}")
        print(f"Output: {args.output}")
        return 0

    if args.command == "questions":
        topics = load_topic_candidates(args.input)
        questions = topic_candidates_to_question_seeds(topics)
        export_jsonl(questions, args.output)
        print(f"Question seeds: {len(questions)}")
        print(f"Output: {args.output}")
        return 0

    if args.command == "pipeline":
        records = load_jsonl_records(args.input)
        topics = extract_topic_candidates(records)
        questions = topic_candidates_to_question_seeds(topics)
        export_jsonl(topics, args.topics_output)
        export_jsonl(questions, args.questions_output)
        print(f"Topic candidates: {len(topics)}")
        print(f"Questions: {len(questions)}")
        print(f"Topics output: {args.topics_output}")
        print(f"Questions output: {args.questions_output}")
        return 0

    parser.print_help()
    return 1


def load_topic_candidates(path: Path) -> list[TopicCandidate]:
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Topic candidate file not found: {path}")
    topics: list[TopicCandidate] = []
    for lineno, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw_line.strip()
        if not line:
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSONL at line {lineno}: {exc}") from exc
        if not isinstance(value, dict):
            raise ValueError(f"Invalid topic candidate at line {lineno}: expected object")
        topics.append(
            TopicCandidate(
                topic_id=str(value["topic_id"] if "topic_id" in value else value["topicId"]),
                source_ids=list(value["source_ids"] if "source_ids" in value else value["sourceIds"]),
                title=str(value["title"]),
                summary=str(value["summary"]),
                signals=list(value["signals"]),
                audience=str(value["audience"]),
                evidence_count=int(value["evidence_count"] if "evidence_count" in value else value["evidenceCount"]),
                score=float(value["score"]),
                created_at=str(value["created_at"] if "created_at" in value else value["createdAt"]),
            )
        )
    return topics


if __name__ == "__main__":
    raise SystemExit(main())
