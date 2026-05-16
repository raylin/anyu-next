"""Experiment-specific runtime helpers for the 曖昧溫度計 prototype."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from oradar.product_runtime import ProductRuntimeRequest, generate_product_result


EXPERIMENT_ID = "ambiguous-temperature-fake-door-v0"
DEFAULT_VARIANT = "B"
DEFAULT_PRICE = "NT$49"
PAID_CTA_LABEL = "解鎖下一句怎麼回 — NT$49"
SITUATION_OPTIONS = (
    "已讀不回",
    "忽冷忽熱",
    "回訊變慢但看限動",
    "不確定 / 跳過",
)


@dataclass(frozen=True)
class SubmissionRecord:
    timestamp: str
    session_id: str
    variant: str
    situation_type: str
    input_text: str
    input_length: int
    input_length_bucket: str
    has_conversation_snippet: bool


def normalize_situation_type(value: str) -> str:
    candidate = value.strip()
    if candidate in SITUATION_OPTIONS:
        return candidate
    return "不確定 / 跳過"


def normalize_variant(value: str) -> str:
    candidate = value.strip().upper()
    if candidate:
        return candidate
    return DEFAULT_VARIANT


def input_length_bucket(length: int) -> str:
    if length <= 40:
        return "1-40"
    if length <= 80:
        return "41-80"
    if length <= 160:
        return "81-160"
    return "161+"


def has_conversation_snippet(text: str) -> bool:
    markers = ("：", ":", "\n", "「", "」", "哈哈", "嗯嗯")
    if any(marker in text for marker in markers):
        return True
    return bool(re.search(r"[A-Za-z0-9]+\s*[:：]\s*", text))


def temperature_band(score: int) -> str:
    if score <= 20:
        return "0-20"
    if score <= 40:
        return "21-40"
    if score <= 60:
        return "41-60"
    if score <= 80:
        return "61-80"
    return "81-100"


def build_submission_record(
    *,
    timestamp: str,
    session_id: str,
    variant: str,
    situation_type: str,
    input_text: str,
) -> SubmissionRecord:
    normalized_input = input_text.strip()
    return SubmissionRecord(
        timestamp=timestamp,
        session_id=session_id.strip(),
        variant=normalize_variant(variant),
        situation_type=normalize_situation_type(situation_type),
        input_text=normalized_input,
        input_length=len(normalized_input),
        input_length_bucket=input_length_bucket(len(normalized_input)),
        has_conversation_snippet=has_conversation_snippet(normalized_input),
    )


def analyze_submission(
    *,
    input_text: str,
    situation_type: str,
    variant: str,
) -> dict[str, Any]:
    return generate_product_result(
        ProductRuntimeRequest(
            raw_content=input_text.strip(),
            situation_type=normalize_situation_type(situation_type),
            variant=normalize_variant(variant),
        )
    )


def build_analysis_properties(
    *,
    submission: SubmissionRecord,
    result: dict[str, Any],
) -> dict[str, Any]:
    free_result = result["free_result"]
    return {
        "situation_type": submission.situation_type,
        "input_length": submission.input_length,
        "input_length_bucket": submission.input_length_bucket,
        "has_conversation_snippet": submission.has_conversation_snippet,
        "state_label": free_result["state_label"],
        "temperature_score": free_result["temperature_score"],
        "temperature_band": temperature_band(free_result["temperature_score"]),
        "price": result["paid_preview"]["price"],
    }
