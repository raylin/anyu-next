#!/usr/bin/env python3
"""Run synthetic product-runtime evaluation for 曖昧溫度計."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from oradar.config import load_config  # noqa: E402
from oradar.product_runtime import (  # noqa: E402
    ProductRuntimeError,
    ProductRuntimeRequest,
    generate_product_result,
)


DEFAULT_RAW_DIR = REPO_ROOT / "outputs" / "product_eval" / "raw"
DEFAULT_MANIFEST = DEFAULT_RAW_DIR / "eval_manifest.json"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "outputs" / "product_eval" / "generated"
DEFAULT_SUMMARY_PATH = DEFAULT_OUTPUT_DIR / "eval_generation_summary.json"
FORBIDDEN_TERMS = (
    "他一定不喜歡你",
    "他就是不愛你",
    "他是渣男",
    "你就是備胎",
    "你應該分手",
    "他一定在騙你",
    "創傷",
    "焦慮型依附",
    "心理疾病",
    "診斷",
    "操控",
    "PUA",
)
RISKY_SHARE_CARD_TERMS = (
    "你被冷落了",
    "你被吊著",
    "他不在乎你",
    "你是備胎",
    "被溫柔懸掛的人",
    "對方還在，但對你暫時降溫中",
)
DIAGNOSTIC_PATTERN_TERMS = (
    "過度分析",
    "依賴",
    "控制",
    "焦慮型",
    "創傷",
    "焦慮型依附",
    "創傷反應",
    "心理疾病",
    "診斷",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run synthetic product evaluation for 曖昧溫度計.")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--raw-dir", type=Path, default=DEFAULT_RAW_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--summary", type=Path, default=DEFAULT_SUMMARY_PATH)
    parser.add_argument("--variant", default="B")
    parser.add_argument("--model", default=None)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    config = load_config()
    manifest = load_manifest(args.manifest)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    sample_summaries: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []
    temperature_scores: list[int] = []
    state_labels: Counter[str] = Counter()
    share_personas: Counter[str] = Counter()
    situation_counts: Counter[str] = Counter()
    pattern_confidences: Counter[str] = Counter()
    should_store_true_ids: list[str] = []
    risky_language_findings: list[dict[str, str]] = []
    invalid_output_ids: list[str] = []

    for item in manifest:
        sample_id = require_str(item, "id")
        raw_path = args.raw_dir / f"{sample_id}.txt"
        if not raw_path.exists():
            failures.append({"id": sample_id, "error": f"Missing raw file: {raw_path}"})
            continue

        raw_text, situation_type = parse_eval_input(raw_path)
        if not situation_type:
            situation_type = require_str(item, "situation_type")

        try:
            result = generate_product_result(
                ProductRuntimeRequest(
                    raw_content=raw_text,
                    situation_type=situation_type,
                    variant=args.variant,
                    sample_id=sample_id,
                    model_override=args.model,
                ),
                config=config,
            )
        except ProductRuntimeError as exc:
            failures.append({"id": sample_id, "error": str(exc)})
            continue

        output_path = args.output_dir / f"{sample_id}.result.json"
        output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        summary = summarize_result(sample_id=sample_id, raw_text=raw_text, manifest_item=item, result=result)
        sample_summaries.append(summary)
        temperature_scores.append(summary["temperature_score"])
        state_labels[summary["state_label"]] += 1
        share_personas[summary["share_card_persona"]] += 1
        situation_counts[summary["situation_type"]] += 1
        pattern_confidences[summary["pattern_confidence"]] += 1

        if summary["should_store"]:
            should_store_true_ids.append(sample_id)
        if summary["quality_flags"]:
            invalid_output_ids.append(sample_id)
        for finding in summary["risky_language_findings"]:
            risky_language_findings.append({"id": sample_id, **finding})

    bundle_summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "provider": config.provider,
        "model_name": args.model or (config.anthropic_model if config.provider == "anthropic" else config.openai_model),
        "live_generation_performed": len(sample_summaries) > 0,
        "manifest_count": len(manifest),
        "generated_count": len(sample_summaries),
        "failure_count": len(failures),
        "failures": failures,
        "temperature_scores": temperature_scores,
        "temperature_score_range": summarize_temperature_range(temperature_scores),
        "temperature_score_average": round(sum(temperature_scores) / len(temperature_scores), 1) if temperature_scores else None,
        "temperature_bucket_counts": bucket_temperature_scores(temperature_scores),
        "temperature_scores_above_60_count": sum(1 for score in temperature_scores if score > 60),
        "temperature_by_situation_type": summarize_temperature_by_situation(sample_summaries),
        "state_label_counts": dict(state_labels),
        "share_persona_counts": dict(share_personas),
        "share_persona_top_repeated": [
            {"persona": persona, "count": count}
            for persona, count in share_personas.most_common()
            if count > 1
        ],
        "situation_type_counts": dict(situation_counts),
        "pattern_confidence_counts": dict(pattern_confidences),
        "should_store_true_ids": should_store_true_ids,
        "risky_language_findings": risky_language_findings,
        "invalid_output_ids": invalid_output_ids,
        "reply_strategy_format_examples_count": count_reply_strategies_with_examples(sample_summaries),
        "sample_summaries": sample_summaries,
    }
    args.summary.write_text(json.dumps(bundle_summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Manifest count: {len(manifest)}")
    print(f"Generated outputs: {len(sample_summaries)}")
    print(f"Failures: {len(failures)}")
    print(f"Summary: {args.summary}")
    return 0 if not failures else 1


def load_manifest(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Manifest must be a JSON array.")
    validated: list[dict[str, Any]] = []
    for item in data:
        if not isinstance(item, dict):
            raise ValueError("Manifest items must be objects.")
        validated.append(item)
    return validated


def parse_eval_input(path: Path) -> tuple[str, str]:
    text = path.read_text(encoding="utf-8").strip()
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
    return "\n".join(content_lines).strip(), situation_type


def summarize_result(
    *,
    sample_id: str,
    raw_text: str,
    manifest_item: dict[str, Any],
    result: dict[str, Any],
) -> dict[str, Any]:
    free_result = result["free_result"]
    paid_preview = result["paid_preview"]
    share_card = result["share_card"]
    personal_pattern = result["personal_pattern_candidate"]
    reply_strategies = result["paid_result"]["reply_strategies"]

    findings = scan_risky_language(result)
    quality_flags: list[str] = []
    if paid_preview.get("price") != "NT$49":
        quality_flags.append("paid_preview price mismatch")
    if share_card_text_contains_raw(raw_text, share_card):
        quality_flags.append("share_card contains raw text")
    if contains_any(json.dumps(share_card, ensure_ascii=False), RISKY_SHARE_CARD_TERMS):
        quality_flags.append("share_card identity safety risk")
    if contains_any(json.dumps(personal_pattern, ensure_ascii=False), DIAGNOSTIC_PATTERN_TERMS):
        quality_flags.append("personal pattern diagnostic risk")
    if bool(personal_pattern.get("should_store")):
        quality_flags.append("should_store should be false in v0")
    if not all_reply_strategies_have_examples(reply_strategies):
        quality_flags.append("reply strategies missing concrete example")

    return {
        "id": sample_id,
        "situation_type": require_str(manifest_item, "situation_type"),
        "theme": require_str(manifest_item, "theme"),
        "anxiety_intensity": require_str(manifest_item, "anxiety_intensity"),
        "action_pressure": require_str(manifest_item, "action_pressure"),
        "privacy_sensitivity": require_str(manifest_item, "privacy_sensitivity"),
        "expected_quality_focus": require_str(manifest_item, "expected_quality_focus"),
        "temperature_score": int(free_result["temperature_score"]),
        "state_label": require_str(free_result, "state_label"),
        "insight_title": require_str(result["insight_layer"], "title"),
        "insight_explanation": require_str(result["insight_layer"], "explanation"),
        "paid_preview_copy": require_str(paid_preview, "preview_copy"),
        "paid_preview_sections": list(paid_preview.get("included_sections", [])),
        "share_card_persona": require_str(share_card, "relationship_persona"),
        "share_card_sentence": require_str(share_card, "card_sentence"),
        "pattern_confidence": require_str(personal_pattern, "confidence"),
        "should_store": bool(personal_pattern.get("should_store")),
        "reply_strategies": {
            key: require_str(reply_strategies, key)
            for key in ("主動推進", "低壓試探", "暫時拉開")
        },
        "risky_language_findings": findings,
        "quality_flags": quality_flags,
    }


def scan_risky_language(result: dict[str, Any]) -> list[dict[str, str]]:
    findings: list[dict[str, str]] = []
    for path, value in iter_string_fields(result):
        for term in FORBIDDEN_TERMS:
            if term in value:
                findings.append({"field": path, "term": term})
    return findings


def iter_string_fields(value: Any, path: str = "$") -> list[tuple[str, str]]:
    fields: list[tuple[str, str]] = []
    if isinstance(value, dict):
        for key, nested in value.items():
            fields.extend(iter_string_fields(nested, f"{path}.{key}"))
    elif isinstance(value, list):
        for index, nested in enumerate(value):
            fields.extend(iter_string_fields(nested, f"{path}[{index}]"))
    elif isinstance(value, str):
        fields.append((path, value))
    return fields


def share_card_text_contains_raw(raw_text: str, share_card: dict[str, Any]) -> bool:
    share_card_text = json.dumps(share_card, ensure_ascii=False)
    return bool(raw_text and raw_text in share_card_text)


def summarize_temperature_range(scores: list[int]) -> dict[str, int | None]:
    if not scores:
        return {"min": None, "max": None}
    return {"min": min(scores), "max": max(scores)}


def bucket_temperature_scores(scores: list[int]) -> dict[str, int]:
    buckets = {
        "0-20": 0,
        "21-40": 0,
        "41-60": 0,
        "61-75": 0,
        "76-90": 0,
        "91-100": 0,
    }
    for score in scores:
        if score <= 20:
            buckets["0-20"] += 1
        elif score <= 40:
            buckets["21-40"] += 1
        elif score <= 60:
            buckets["41-60"] += 1
        elif score <= 75:
            buckets["61-75"] += 1
        elif score <= 90:
            buckets["76-90"] += 1
        else:
            buckets["91-100"] += 1
    return buckets


def summarize_temperature_by_situation(sample_summaries: list[dict[str, Any]]) -> dict[str, dict[str, float | int | None]]:
    grouped: dict[str, list[int]] = {}
    for summary in sample_summaries:
        grouped.setdefault(summary["situation_type"], []).append(summary["temperature_score"])

    output: dict[str, dict[str, float | int | None]] = {}
    for situation_type, scores in grouped.items():
        output[situation_type] = {
            "count": len(scores),
            "min": min(scores) if scores else None,
            "max": max(scores) if scores else None,
            "average": round(sum(scores) / len(scores), 1) if scores else None,
            "above_60_count": sum(1 for score in scores if score > 60),
        }
    return output


def all_reply_strategies_have_examples(reply_strategies: dict[str, Any]) -> bool:
    for value in reply_strategies.values():
        if not isinstance(value, str):
            return False
        if "可以這樣回：" not in value or "「" not in value or "」" not in value:
            return False
    return True


def count_reply_strategies_with_examples(sample_summaries: list[dict[str, Any]]) -> dict[str, int]:
    total = len(sample_summaries)
    complete = 0
    for summary in sample_summaries:
        if all_reply_strategies_have_examples(summary["reply_strategies"]):
            complete += 1
    return {"complete_count": complete, "total_count": total}


def contains_any(text: str, terms: tuple[str, ...]) -> bool:
    return any(term in text for term in terms)


def require_str(mapping: dict[str, Any], key: str) -> str:
    value = mapping.get(key)
    return value if isinstance(value, str) else ""


if __name__ == "__main__":
    raise SystemExit(main())
