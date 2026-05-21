"""CLI for topic ingestion tooling."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from .exporters import export_jsonl
from .extractors import extract_topic_candidates
from .loaders import load_jsonl_records
from .review import build_trend_review_pack
from .schema import ModuleSeed, QuestionSeed, TopicCandidate
from .transformers import question_seeds_to_module_seeds, topic_candidates_to_question_seeds


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Source-agnostic topic ingestion tooling.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    extract_parser = subparsers.add_parser("extract", help="Extract topic candidates from generic JSONL input.")
    extract_parser.add_argument("--input", type=Path, required=True)
    extract_parser.add_argument("--output", type=Path, required=True)

    questions_parser = subparsers.add_parser("questions", help="Generate question seeds from topic-candidate JSONL.")
    questions_parser.add_argument("--input", type=Path, required=True)
    questions_parser.add_argument("--output", type=Path, required=True)

    modules_parser = subparsers.add_parser("modules", help="Generate module seeds from question-seed JSONL.")
    modules_parser.add_argument("--input", type=Path, required=True)
    modules_parser.add_argument("--topics", type=Path, required=False)
    modules_parser.add_argument("--output", type=Path, required=True)

    review_parser = subparsers.add_parser("review", help="Generate a human-readable trend review pack from module seeds.")
    review_parser.add_argument("--modules", type=Path, required=True)
    review_parser.add_argument("--topics", type=Path, required=False)
    review_parser.add_argument("--questions", type=Path, required=False)
    review_parser.add_argument("--output", type=Path, required=True)

    pipeline_parser = subparsers.add_parser("pipeline", help="Run extract and questions in sequence.")
    pipeline_parser.add_argument("--input", type=Path, required=True)
    pipeline_parser.add_argument("--topics-output", type=Path, required=True)
    pipeline_parser.add_argument("--questions-output", type=Path, required=True)
    pipeline_parser.add_argument("--modules-output", type=Path, required=False)
    pipeline_parser.add_argument("--review-output", type=Path, required=False)

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

    if args.command == "modules":
        questions = load_question_seeds(args.input)
        topics = load_topic_candidates(args.topics) if args.topics else None
        modules = question_seeds_to_module_seeds(questions, topics)
        export_jsonl(modules, args.output)
        print(f"Module seeds: {len(modules)}")
        print(f"Output: {args.output}")
        return 0

    if args.command == "review":
        modules = load_module_seeds(args.modules)
        topics = load_topic_candidates(args.topics) if args.topics else None
        questions = load_question_seeds(args.questions) if args.questions else None
        pack = build_trend_review_pack(modules, topics=topics, questions=questions)
        write_text_output(args.output, pack)
        print(f"Module seeds reviewed: {len(modules)}")
        print(f"Output: {args.output}")
        return 0

    if args.command == "pipeline":
        records = load_jsonl_records(args.input)
        topics = extract_topic_candidates(records)
        questions = topic_candidates_to_question_seeds(topics)
        export_jsonl(topics, args.topics_output)
        export_jsonl(questions, args.questions_output)
        modules = question_seeds_to_module_seeds(questions, topics) if (args.modules_output or args.review_output) else None
        if args.modules_output and modules is not None:
            export_jsonl(modules, args.modules_output)
        if args.review_output and modules is not None:
            pack = build_trend_review_pack(modules, topics=topics, questions=questions)
            write_text_output(args.review_output, pack)
        print(f"Topic candidates: {len(topics)}")
        print(f"Questions: {len(questions)}")
        print(f"Topics output: {args.topics_output}")
        print(f"Questions output: {args.questions_output}")
        if args.modules_output and modules is not None:
            print(f"Module seeds: {len(modules)}")
            print(f"Modules output: {args.modules_output}")
        if args.review_output and modules is not None:
            print(f"Review output: {args.review_output}")
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


def load_question_seeds(path: Path) -> list[QuestionSeed]:
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Question seed file not found: {path}")
    questions: list[QuestionSeed] = []
    for lineno, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw_line.strip()
        if not line:
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSONL at line {lineno}: {exc}") from exc
        if not isinstance(value, dict):
            raise ValueError(f"Invalid question seed at line {lineno}: expected object")
        questions.append(
            QuestionSeed(
                question_id=str(value["question_id"] if "question_id" in value else value["questionId"]),
                topic_id=str(value["topic_id"] if "topic_id" in value else value["topicId"]),
                question=str(value["question"]),
                module_fit=str(value["module_fit"] if "module_fit" in value else value["moduleFit"]),
                why_it_works=str(value["why_it_works"] if "why_it_works" in value else value["whyItWorks"]),
                tone=str(value["tone"]),
                created_at=str(value["created_at"] if "created_at" in value else value["createdAt"]),
            )
        )
    return questions


def load_module_seeds(path: Path) -> list[ModuleSeed]:
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Module seed file not found: {path}")
    modules = []
    for lineno, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw_line.strip()
        if not line:
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSONL at line {lineno}: {exc}") from exc
        if not isinstance(value, dict):
            raise ValueError(f"Invalid module seed at line {lineno}: expected object")
        modules.append(
            ModuleSeed(
                module_id=str(value["module_id"] if "module_id" in value else value["moduleId"]),
                topic_id=str(value["topic_id"] if "topic_id" in value else value["topicId"]),
                question_ids=list(value["question_ids"] if "question_ids" in value else value["questionIds"]),
                title=str(value["title"]),
                format=str(value["format"]),
                audience=str(value["audience"]),
                emotional_hook=str(value["emotional_hook"] if "emotional_hook" in value else value["emotionalHook"]),
                user_promise=str(value["user_promise"] if "user_promise" in value else value["userPromise"]),
                input_needed=list(value["input_needed"] if "input_needed" in value else value["inputNeeded"]),
                output_sections=list(value["output_sections"] if "output_sections" in value else value["outputSections"]),
                monetization_fit=str(value["monetization_fit"] if "monetization_fit" in value else value["monetizationFit"]),
                tone=str(value["tone"]),
                confidence=float(value["confidence"]),
                created_at=str(value["created_at"] if "created_at" in value else value["createdAt"]),
            )
        )
    return modules


def write_text_output(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit(main())
