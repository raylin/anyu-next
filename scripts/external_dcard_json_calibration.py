#!/usr/bin/env python3
"""Transform external Dcard-like JSON into calibration notes."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = REPO_ROOT / "ai-collaboration" / "output-0517.jsonl"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "ai-collaboration" / "research" / "dcard_calibration" / "external_json"

NOTES_PATH = DEFAULT_OUTPUT_DIR / "external_dcard_calibration_notes.jsonl"
SUMMARY_PATH = DEFAULT_OUTPUT_DIR / "external_dcard_calibration_summary.json"
BUNDLE_PATH = DEFAULT_OUTPUT_DIR / "2026-05-17-external-dcard-json-calibration-v0-review-bundle.md"


THEME_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("已讀不回", ("已讀不回", "讀不回", "不回訊息")),
    ("忽冷忽熱", ("忽冷忽熱", "忽熱忽冷", "一下熱一下冷", "若即若離")),
    ("回訊變慢", ("回訊變慢", "回很慢", "回覆變慢", "回覆速度")),
    ("曖昧不確定", ("暈", "更進一步", "怎麼分辨", "是不是喜歡", "曖昧", "丟球", "接球", "有沒有料")),
    ("關係邊界", ("拒絕", "糾纏", "看不懂", "界線", "越界", "不舒服")),
    ("伴侶價值觀落差", ("內涵", "價值觀", "收入", "薪水", "工作", "金錢", "財務")),
    ("婚前財務透明", ("薪水", "婚前", "財務", "存款", "透明")),
    ("親密需求落差", ("做愛", "性愛", "高潮", "炮友", "一夜情", "親密", "保險套", "欲求不滿", "性成癮", "色色")),
    ("外遇罪惡感", ("小三", "外食", "外約", "罪惡感", "外遇")),
    ("開放式關係", ("開放式關係", "半開放式關係")),
    ("年齡差關係", ("高中生", "大叔", "年上", "年齡差")),
    ("交友軟體策略", ("交友軟體", "dating app", "配對")),
    ("家人順位落差", ("妹妹", "家人", "排行", "順位")),
    ("擇偶條件焦慮", ("身高", "受歡迎", "男生歡迎", "女生歡迎")),
    ("社群微訊號", ("限動", "發文", "按讚", "社群", "上線")),
]

QUESTION_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("他是什麼意思", ("是不是喜歡", "怎麼分辨", "是什麼意思", "到底")),
    ("我該怎麼做", ("怎麼做", "怎麼辦", "該不該", "要不要", "要怎麼回")),
    ("這正常嗎", ("正常嗎", "是不是正常", "合理嗎")),
    ("要不要繼續", ("要不要繼續", "還要不要", "值不值得", "繼續嗎", "分手")),
    ("我是不是想太多", ("想太多", "是不是我", "是不是我太敏感")),
    ("大家怎麼看", ("大家怎麼看", "你們覺得", "請益")),
    ("經驗分享", ("心得", "分享", "文長", "送給", "為什麼很多人")),
]

STAGE_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("婚姻", ("老婆", "老公", "婚姻", "外遇", "開放式關係")),
    ("婚前", ("結婚", "婚前", "薪水", "財務", "生小孩")),
    ("交往", ("男友", "女友", "另一半", "交往", "包容性")),
    ("分手後", ("前任", "分手", "復合")),
    ("曖昧", ("暈", "曖昧", "不敢更進一步", "怎麼分辨", "年上", "大叔")),
    ("casual", ("交友軟體", "炮友", "一夜情")),
]

SENSITIVE_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("explicit_adult_content", ("做愛", "性愛", "高潮", "口交", "保險套", "一夜情", "炮友", "sex", "性成癮", "色色")),
    ("legal_or_age_gap_ambiguity", ("高中生", "未成年")),
    ("harassment_or_boundary_risk", ("拒絕", "糾纏", "騷擾", "不懂")),
    ("infidelity_or_open_relationship", ("小三", "外食", "外約", "外遇", "開放式關係")),
]

SOCIAL_SIGNAL_TERMS = ("限動", "社群", "發文", "按讚", "已讀", "回訊息", "回覆")
EMPATHY_TERMS = ("我也", "辛苦", "懂", "抱抱", "很正常", "超常見")
ADVICE_PATTERNS: list[tuple[str, tuple[str, ...]]] = [
    ("直接溝通", ("直接講", "講清楚", "溝通", "問清楚")),
    ("趁早分開", ("分手", "離開", "不要繼續", "快逃")),
    ("設立界線", ("界線", "拒絕", "封鎖", "斷聯")),
    ("降低期待", ("不要想太多", "不要期待", "先觀察")),
]


@dataclass
class ParsedInput:
    records: list[dict[str, Any]]
    format_name: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="External Dcard JSON calibration.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.input.exists():
        raise FileNotFoundError(f"Input file not found: {args.input}")

    parsed = parse_input(args.input)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    notes_path = args.output_dir / NOTES_PATH.name
    summary_path = args.output_dir / SUMMARY_PATH.name
    bundle_path = args.output_dir / BUNDLE_PATH.name

    notes: list[dict[str, Any]] = []
    skipped_posts = 0
    for record in parsed.records:
        if not isinstance(record, dict):
            skipped_posts += 1
            continue
        try:
            notes.append(calibrate_record(record))
        except Exception:
            skipped_posts += 1

    write_jsonl(notes_path, notes)
    summary = build_summary(parsed=parsed, notes=notes, skipped_posts=skipped_posts, input_path=args.input)
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    bundle_path.write_text(build_review_bundle(parsed=parsed, notes=notes, summary=summary, input_path=args.input), encoding="utf-8")

    print(f"Input posts: {summary['input_posts']}")
    print(f"Processed posts: {summary['processed_posts']}")
    print(f"Skipped posts: {summary['skipped_posts']}")
    print(f"Notes: {notes_path}")
    print(f"Summary: {summary_path}")
    print(f"Bundle: {bundle_path}")
    return 0


def parse_input(path: Path) -> ParsedInput:
    text = path.read_text(encoding="utf-8", errors="replace").strip()
    if not text:
        return ParsedInput(records=[], format_name="empty")

    # JSON array
    try:
        value = json.loads(text)
        if isinstance(value, list):
            return ParsedInput(records=[record for record in value if isinstance(record, dict)], format_name="json_array")
        if isinstance(value, dict):
            return ParsedInput(records=[value], format_name="single_json_object")
    except json.JSONDecodeError:
        pass

    # JSONL
    records: list[dict[str, Any]] = []
    jsonl_ok = True
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        try:
            value = json.loads(stripped)
        except json.JSONDecodeError:
            jsonl_ok = False
            break
        if not isinstance(value, dict):
            jsonl_ok = False
            break
        records.append(value)
    if jsonl_ok and records:
        return ParsedInput(records=records, format_name="jsonl")

    # Concatenated JSON objects
    decoder = json.JSONDecoder()
    index = 0
    concatenated: list[dict[str, Any]] = []
    length = len(text)
    while index < length:
        while index < length and text[index].isspace():
            index += 1
        if index >= length:
            break
        try:
            value, next_index = decoder.raw_decode(text, index)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Could not parse input as JSON array, JSONL, or concatenated JSON objects: {exc}") from exc
        if not isinstance(value, dict):
            raise ValueError("Parsed non-object JSON item while reading concatenated JSON objects.")
        concatenated.append(value)
        index = next_index
    if concatenated:
        return ParsedInput(records=concatenated, format_name="concatenated_json_objects")

    raise ValueError("Unsupported input format.")


def calibrate_record(record: dict[str, Any]) -> dict[str, Any]:
    title = clean_text(record.get("title", ""))
    excerpt = clean_text(record.get("excerpt", ""))
    content = clean_text(record.get("content", ""))
    text = " ".join(part for part in [title, excerpt, content[:600]] if part)
    topics = normalize_topics(record.get("topics"))
    comments = sorted(
        [comment for comment in (record.get("comments") or []) if isinstance(comment, dict)],
        key=lambda item: int(item.get("like_count") or 0),
        reverse=True,
    )
    top_comments = comments[:5]
    comment_texts = [clean_text(str(comment.get("content", "")))[:160] for comment in top_comments if clean_text(str(comment.get("content", "")))]

    stage = infer_stage(text)
    primary_theme = infer_primary_theme(text)
    secondary_themes = infer_secondary_themes(text, primary_theme)
    core_question_type = infer_question_type(text)
    emotional_trigger = infer_emotional_trigger(text, primary_theme)
    action_pressure = infer_action_pressure(text, core_question_type)
    social_signal = infer_social_signal(text)
    comment_signal_summary = infer_comment_signal_summary(comment_texts)
    top_comment_advice_pattern = infer_top_comment_advice_pattern(comment_texts)
    comment_disagreement_pattern = infer_comment_disagreement_pattern(comment_texts)
    shareability_strength = infer_shareability(title, excerpt, int(record.get("like_count") or 0), int(record.get("comment_count") or 0), comment_texts)
    monetization_strength = infer_monetization_strength(primary_theme, core_question_type, action_pressure, stage, comment_texts)
    product_family = infer_product_family(primary_theme, stage, action_pressure, monetization_strength)
    mvp_relevance = infer_mvp_relevance(product_family, primary_theme, action_pressure)
    should_adjust_mvp = bool(
        mvp_relevance == "high"
        and product_family not in {"曖昧溫度計", "下一句怎麼回", "社群微訊號分析"}
    )
    hook_candidate = infer_hook_candidate(primary_theme, text)
    sensitive_flags = infer_sensitive_flags(text)
    content_summary = build_content_summary(
        title=title,
        text=text,
        primary_theme=primary_theme,
        relationship_stage=stage,
        core_question_type=core_question_type,
    )

    notes_parts = [
        f"summary: {content_summary}",
        f"top_comment_signal: {comment_signal_summary or 'none'}",
    ]
    if sensitive_flags:
        notes_parts.append("sensitive_topic: true")
        notes_parts.append(f"reason: {', '.join(sensitive_flags)}")

    return {
        "source": "dcard_external_json",
        "source_id": str(record.get("id", "")),
        "title": title,
        "board": "relationship",
        "created_at": str(record.get("created_at", "")),
        "like_count": int(record.get("like_count") or 0),
        "comment_count": int(record.get("comment_count") or 0),
        "topics": topics,
        "relationship_stage": stage,
        "primary_theme": primary_theme,
        "secondary_themes": secondary_themes,
        "core_question_type": core_question_type,
        "emotional_trigger": emotional_trigger,
        "action_pressure": action_pressure,
        "shareability_strength": shareability_strength,
        "monetization_strength": monetization_strength,
        "social_signal": social_signal,
        "comment_signal_summary": comment_signal_summary,
        "top_comment_advice_pattern": top_comment_advice_pattern,
        "comment_disagreement_pattern": comment_disagreement_pattern,
        "hook_candidate": hook_candidate,
        "product_family": product_family,
        "mvp_relevance": mvp_relevance,
        "should_adjust_mvp": should_adjust_mvp,
        "notes": " | ".join(part for part in notes_parts if part),
    }


def normalize_topics(value: Any) -> list[str]:
    if isinstance(value, list):
        return [clean_text(str(item)) for item in value if clean_text(str(item))]
    return []


def infer_stage(text: str) -> str:
    for stage, keywords in STAGE_RULES:
        if any(keyword in text for keyword in keywords):
            return stage
    return "uncertain"


def infer_primary_theme(text: str) -> str:
    for theme, keywords in THEME_RULES:
        if any(keyword in text for keyword in keywords):
            return theme
    return "uncertain"


def infer_secondary_themes(text: str, primary_theme: str) -> list[str]:
    themes: list[str] = []
    for theme, keywords in THEME_RULES:
        if theme == primary_theme:
            continue
        if any(keyword in text for keyword in keywords):
            themes.append(theme)
    return themes[:3]


def infer_question_type(text: str) -> str:
    for label, keywords in QUESTION_RULES:
        if any(keyword in text for keyword in keywords):
            return label
    if "？" in text or "?" in text:
        return "大家怎麼看"
    return "uncertain"


def infer_emotional_trigger(text: str, primary_theme: str) -> str:
    if primary_theme in {"已讀不回", "回訊變慢", "忽冷忽熱", "曖昧不確定"}:
        return "投入不對等帶來的不確定感"
    if primary_theme in {"伴侶價值觀落差", "婚前財務透明", "家人順位落差"}:
        return "價值觀或承諾落差引發的不安"
    if primary_theme in {"關係邊界", "外遇罪惡感", "開放式關係"}:
        return "界線被挑戰或信任被拉扯"
    if primary_theme == "親密需求落差":
        return "親密需求不對等帶來的自我懷疑"
    if primary_theme == "交友軟體策略":
        return "配對效率與自我價值的不確定"
    return "關係期待與現實落差"


def infer_action_pressure(text: str, question_type: str) -> str:
    high_terms = ("要不要", "該不該", "怎麼回", "分手", "拒絕", "繼續", "問清楚", "坦白")
    medium_terms = ("不知道", "很累", "怎麼看", "會不會", "想確認", "請益")
    if any(term in text for term in high_terms):
        return "high"
    if question_type in {"我該怎麼做", "要不要繼續", "他是什麼意思"}:
        return "high"
    if any(term in text for term in medium_terms) or question_type in {"這正常嗎", "我是不是想太多", "大家怎麼看"}:
        return "medium"
    return "low"


def infer_social_signal(text: str) -> str:
    found = [term for term in SOCIAL_SIGNAL_TERMS if term in text]
    return "、".join(found[:3])


def infer_comment_signal_summary(comments: list[str]) -> str:
    if not comments:
        return ""
    found_empathy = sum(1 for comment in comments if any(term in comment for term in EMPATHY_TERMS))
    advice = infer_top_comment_advice_pattern(comments)
    signals: list[str] = []
    if found_empathy:
        signals.append(f"高讚留言有{found_empathy}則偏共感/代入")
    if advice:
        signals.append(f"高讚留言常見建議偏向{advice}")
    if not signals:
        signals.append("高讚留言以個人立場或經驗回應為主")
    return "；".join(signals)


def infer_top_comment_advice_pattern(comments: list[str]) -> str:
    counts: Counter[str] = Counter()
    for comment in comments:
        for label, keywords in ADVICE_PATTERNS:
            if any(keyword in comment for keyword in keywords):
                counts[label] += 1
    if not counts:
        return ""
    return counts.most_common(1)[0][0]


def infer_comment_disagreement_pattern(comments: list[str]) -> str:
    combined = " ".join(comments)
    if any(term in combined for term in ("分手", "直接講")) and any(term in combined for term in ("不要想太多", "先觀察")):
        return "留言同時存在強硬切割與先觀察兩派"
    if any(term in combined for term in ("正常", "不正常")):
        return "留言對是否正常可能有分歧"
    return ""


def infer_shareability(title: str, excerpt: str, like_count: int, comment_count: int, comments: list[str]) -> str:
    relatable = any(term in f"{title} {excerpt}" for term in ("大家", "很多人", "是不是", "為什麼", "最受"))
    empathy_count = sum(1 for comment in comments if "我也" in comment or "超常見" in comment)
    if like_count >= 200 or comment_count >= 80 or empathy_count >= 2:
        return "high"
    if like_count >= 50 or comment_count >= 25 or relatable:
        return "medium"
    return "low"


def infer_monetization_strength(primary_theme: str, question_type: str, action_pressure: str, stage: str, comments: list[str]) -> str:
    if primary_theme in {"已讀不回", "忽冷忽熱", "回訊變慢", "曖昧不確定", "關係邊界"}:
        return "high" if action_pressure in {"high", "medium"} else "medium"
    if primary_theme in {"伴侶價值觀落差", "婚前財務透明", "家人順位落差", "交友軟體策略"}:
        return "high" if action_pressure == "high" else "medium"
    if primary_theme in {"親密需求落差", "外遇罪惡感", "開放式關係"}:
        return "medium"
    if question_type == "經驗分享" and stage in {"casual", "uncertain"}:
        return "low"
    if any("怎麼做" in comment or "直接講" in comment for comment in comments):
        return "medium"
    return "low"


def infer_product_family(primary_theme: str, stage: str, action_pressure: str, monetization_strength: str) -> str:
    if primary_theme in {"已讀不回", "忽冷忽熱", "回訊變慢", "曖昧不確定"}:
        if action_pressure == "high":
            return "下一句怎麼回"
        return "曖昧溫度計"
    if primary_theme == "社群微訊號":
        return "社群微訊號分析"
    if primary_theme in {"關係邊界", "外遇罪惡感", "開放式關係"}:
        return "關係紅旗雷達"
    if primary_theme in {"婚前財務透明"}:
        return "婚前信任檢查"
    if primary_theme in {"伴侶價值觀落差", "家人順位落差"}:
        return "伴侶價值觀雷達"
    if primary_theme == "親密需求落差":
        return "親密落差解讀" if monetization_strength != "low" else "Not suitable"
    if primary_theme == "交友軟體策略":
        return "交友軟體策略"
    if stage in {"交往", "婚前", "婚姻"}:
        return "Relationship Radar general"
    return "Not suitable"


def infer_mvp_relevance(product_family: str, primary_theme: str, action_pressure: str) -> str:
    if product_family in {"曖昧溫度計", "下一句怎麼回", "社群微訊號分析"}:
        return "high"
    if product_family in {"關係紅旗雷達", "伴侶價值觀雷達", "婚前信任檢查"} and action_pressure != "low":
        return "medium"
    if primary_theme == "uncertain":
        return "low"
    return "medium"


def infer_hook_candidate(primary_theme: str, text: str) -> str:
    if primary_theme == "已讀不回":
        return "他不回你，是忙還是在降溫？"
    if primary_theme == "忽冷忽熱":
        return "昨天很熱，今天又冷掉，這種溫差到底代表什麼？"
    if primary_theme == "回訊變慢":
        return "他回訊變慢了，還要不要繼續主動？"
    if primary_theme == "社群微訊號":
        return "他有在看你，卻沒真的靠近，這種微訊號要怎麼解讀？"
    if primary_theme == "婚前財務透明":
        return "談到薪水和存款時，關係的信任感開始變形了嗎？"
    if primary_theme == "關係邊界":
        return "你已經拒絕了，為什麼對方還是聽不懂？"
    if primary_theme == "伴侶價值觀落差":
        return "相處很久了，才發現你們其實在看不同的未來？"
    if primary_theme == "交友軟體策略":
        return "交友軟體不是沒機會，而是很多人不知道怎麼玩得不內耗。"
    return ""


def infer_sensitive_flags(text: str) -> list[str]:
    flags: list[str] = []
    for label, keywords in SENSITIVE_RULES:
        if any(keyword in text for keyword in keywords):
            flags.append(label)
    return flags


def build_content_summary(
    *,
    title: str,
    text: str,
    primary_theme: str,
    relationship_stage: str,
    core_question_type: str,
) -> str:
    if primary_theme == "曖昧不確定":
        return "曖昧互動中的投入度不確定，卡在想推進又怕誤判。"
    if primary_theme == "已讀不回":
        return "對方回應中斷後，使用者被迫反覆解讀投入度。"
    if primary_theme == "忽冷忽熱":
        return "互動溫差反覆出現，讓人難以判斷關係方向。"
    if primary_theme == "回訊變慢":
        return "回覆節奏下降帶來拉扯，使用者在主動與退開間猶豫。"
    if primary_theme == "社群微訊號":
        return "社群或低成本互動訊號與實際關係投入不一致。"
    if primary_theme == "關係邊界":
        return "拒絕或界線沒有被好好接住，安全感與尊重感正在流失。"
    if primary_theme == "伴侶價值觀落差":
        if "薪水" in text or "財務" in text or "結婚" in text:
            return "伴侶在金錢透明與未來承諾上的期待出現落差。"
        if "妹妹" in text or "家人" in text:
            return "家人順位與伴侶順位的衝突，讓關係邊界開始失衡。"
        return "伴侶成長節奏、責任感或未來想像開始不同步。"
    if primary_theme == "婚前財務透明":
        return "婚前討論財務與責任分配時，信任感開始被檢驗。"
    if primary_theme == "親密需求落差":
        return "親密互動中的需求與回饋不對等，讓人開始懷疑關係品質。"
    if primary_theme == "外遇罪惡感":
        return "忠誠、誘惑與罪惡感糾纏在一起，關係穩定性被挑戰。"
    if primary_theme == "開放式關係":
        return "關係定義被重新打開後，安全感與規則感變得不穩。"
    if primary_theme == "年齡差關係":
        return "年齡差與權力差讓關係期待更難對齊。"
    if primary_theme == "交友軟體策略":
        return "交友軟體中的選擇、效率與自我定位成為主要壓力來源。"
    if primary_theme == "擇偶條件焦慮":
        return "外在條件被放大討論，帶來自我價值與市場感的焦慮。"
    if relationship_stage in {"交往", "婚前", "婚姻"}:
        return "長期關係中的期待、責任與投入分配正在被重新評估。"
    if core_question_type == "經驗分享":
        return "以經驗分享為主，但背後仍指向關係規則與價值判斷。"
    return f"{title[:36]}帶出關係互動中的不確定感。"


def build_summary(*, parsed: ParsedInput, notes: list[dict[str, Any]], skipped_posts: int, input_path: Path) -> dict[str, Any]:
    theme_counts = Counter(note["primary_theme"] for note in notes)
    stage_counts = Counter(note["relationship_stage"] for note in notes)
    question_counts = Counter(note["core_question_type"] for note in notes)
    product_family_counts = Counter(note["product_family"] for note in notes)
    action_counts = Counter(note["action_pressure"] for note in notes)
    shareability_counts = Counter(note["shareability_strength"] for note in notes)
    monetization_counts = Counter(note["monetization_strength"] for note in notes)
    high_mvp = [note for note in notes if note["mvp_relevance"] == "high"]
    sensitive_count = sum(1 for note in notes if "sensitive_topic: true" in note["notes"])

    recommended_adjustments: list[str] = []
    if product_family_counts.get("曖昧溫度計", 0) + product_family_counts.get("下一句怎麼回", 0) >= 4:
        recommended_adjustments.append("Keep 曖昧溫度計 + 下一句怎麼回 as the first narrow MVP.")
    if product_family_counts.get("關係紅旗雷達", 0) >= 2 or product_family_counts.get("伴侶價值觀雷達", 0) >= 2:
        recommended_adjustments.append("Broader Relationship Radar families look promising after the first MVP.")
    if product_family_counts.get("社群微訊號分析", 0) >= 1:
        recommended_adjustments.append("社群微訊號 can stay as an adjacent future expansion rather than the first standalone MVP.")

    return {
        "input_posts": len(parsed.records),
        "processed_posts": len(notes),
        "skipped_posts": skipped_posts,
        "input_path": str(input_path),
        "input_format": parsed.format_name,
        "theme_counts": dict(theme_counts),
        "relationship_stage_counts": dict(stage_counts),
        "core_question_type_counts": dict(question_counts),
        "product_family_counts": dict(product_family_counts),
        "action_pressure_counts": dict(action_counts),
        "shareability_strength_counts": dict(shareability_counts),
        "monetization_strength_counts": dict(monetization_counts),
        "high_mvp_relevance_count": len(high_mvp),
        "sensitive_topic_count": sensitive_count,
        "top_candidate_product_families": [family for family, _ in product_family_counts.most_common(5)],
        "recommended_mvp_adjustments": recommended_adjustments,
    }


def build_review_bundle(*, parsed: ParsedInput, notes: list[dict[str, Any]], summary: dict[str, Any], input_path: Path) -> str:
    non_sensitive_notes = [note for note in notes if "sensitive_topic: true" not in note["notes"]]
    top_mvp_source = non_sensitive_notes or notes
    top_mvp_notes = sorted(
        top_mvp_source,
        key=lambda item: (
            item["mvp_relevance"] == "high",
            item["monetization_strength"] == "high",
            item["shareability_strength"] == "high",
            item["like_count"],
        ),
        reverse=True,
    )[:5]
    top_family_notes = [
        note
        for note in (non_sensitive_notes or notes)
        if note["product_family"] not in {"曖昧溫度計", "下一句怎麼回", "Not suitable"}
    ][:5]
    sensitive_notes = [note for note in notes if "sensitive_topic: true" in note["notes"]][:5]

    def format_counts(mapping: dict[str, Any]) -> str:
        if not mapping:
            return "- none"
        return "\n".join(f"- `{key}`: `{value}`" for key, value in mapping.items())

    def format_examples(items: list[dict[str, Any]]) -> str:
        if not items:
            return "- none"
        lines: list[str] = []
        for item in items:
            lines.append(
                f"- `{item['title']}`\n"
                f"  - signal: {extract_signal_from_notes(item['notes'])}\n"
                f"  - action pressure: `{item['action_pressure']}`\n"
                f"  - monetization: `{item['monetization_strength']}`\n"
                f"  - product family: `{item['product_family']}`\n"
                f"  - why it matters: {item['hook_candidate'] or item['primary_theme']}"
            )
        return "\n".join(lines)

    remain_narrow = summary["product_family_counts"].get("曖昧溫度計", 0) + summary["product_family_counts"].get("下一句怎麼回", 0)
    expansion_promising = summary["product_family_counts"].get("關係紅旗雷達", 0) + summary["product_family_counts"].get("伴侶價值觀雷達", 0) + summary["product_family_counts"].get("Relationship Radar general", 0)

    return f"""# External Dcard JSON Calibration v0 Review Bundle

## 1. Overview

This bundle calibrates the product direction using externally collected Dcard-like JSON rather than further Dcard automation.

## 2. Input Source And Parsing

- input path: `{input_path}`
- parsed format: `{parsed.format_name}`
- input posts: `{summary['input_posts']}`
- processed posts: `{summary['processed_posts']}`
- skipped posts: `{summary['skipped_posts']}`

## 3. Data Minimization / Privacy Handling

- did not store `school`
- did not store `department`
- did not store comment ids
- did not store full raw posts
- did not store full raw comment threads
- stored only title, ids, counts, short summaries, and comment-signal abstractions

## 4. Dataset Summary

- top candidate product families:
{format_counts({family: summary['product_family_counts'].get(family, 0) for family in summary['top_candidate_product_families']})}

## 5. Theme Distribution

{format_counts(summary['theme_counts'])}

## 6. Relationship Stage Distribution

{format_counts(summary['relationship_stage_counts'])}

## 7. Core Question Type Distribution

{format_counts(summary['core_question_type_counts'])}

## 8. Product Family Mapping

{format_counts(summary['product_family_counts'])}

## 9. Action Pressure vs Monetization Strength

- action pressure:
{format_counts(summary['action_pressure_counts'])}
- monetization strength:
{format_counts(summary['monetization_strength_counts'])}

## 10. Shareability Strength

{format_counts(summary['shareability_strength_counts'])}

## 11. Comment Signal Findings

Common signals seen in high-like comment summaries:

{format_examples(sorted(notes, key=lambda item: item['like_count'], reverse=True)[:4])}

## 12. Top MVP-Relevant Posts

{format_examples(top_mvp_notes)}

## 13. Top Future Product Families

{format_examples(top_family_notes)}

## 14. Sensitive / Unsuitable Topic Notes

- sensitive topic count: `{summary['sensitive_topic_count']}`
{format_examples(sensitive_notes)}

## 15. Impact On 曖昧溫度計 MVP

- current narrow MVP signal count (`曖昧溫度計` + `下一句怎麼回`): `{remain_narrow}`
- broader adjacent family signal count (`關係紅旗雷達` + `伴侶價值觀雷達` + `Relationship Radar general`): `{expansion_promising}`

Assessment:

- the current MVP should remain `曖昧溫度計 + 下一句怎麼回` as the first focused entry point
- however, the dataset is broad enough to suggest the opportunity space extends beyond ambiguous messaging alone

## 16. Potential Relationship Radar Expansion

Promising adjacent families from this dataset:

{format_counts({family: count for family, count in summary['product_family_counts'].items() if family not in {'曖昧溫度計', '下一句怎麼回', 'Not suitable'}})}

Interpretation:

- `Relationship Radar` expansion looks promising after the first MVP
- strongest adjacent tracks appear to be values/trust, red-flag/boundary cases, and broader relationship dynamics

## 17. Issues For ChatGPT Review

1. Should the first MVP remain narrowly centered on ambiguous romantic messaging, or should `關係紅旗雷達` already be elevated into the first product family set?
2. Are explicit-adjacent intimacy topics better treated as `親密落差解讀`, or should they stay outside the initial paid consumer surface?
3. Is `Relationship Radar general` too broad as a future family label, and should it be broken into narrower families sooner?

## 18. Recommendation Before Formal Tech Stack Selection

- keep the first MVP unchanged: `曖昧溫度計 + 下一句怎麼回`
- do not resume Dcard automation for now
- use external JSON and manual curation to refine:
  - `關係紅旗雷達`
  - `伴侶價值觀雷達`
  - `婚前信任檢查`
  - `親密落差解讀`
"""


def extract_signal_from_notes(notes: str) -> str:
    match = re.search(r"summary: (.*?) \|", notes)
    if match:
        return match.group(1)
    return notes[:120]


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "")
    return text.strip()


if __name__ == "__main__":
    raise SystemExit(main())
