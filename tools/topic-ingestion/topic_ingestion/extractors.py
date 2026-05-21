"""Deterministic topic extraction heuristics."""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
import re

from .schema import GenericRecord, TopicCandidate


TOPIC_RULES: list[tuple[str, tuple[str, ...], list[str], str]] = [
    ("已讀不回", ("已讀不回", "讀不回", "不回訊息"), ["已讀不回", "等待焦慮", "投入不確定"], "多人討論回覆中斷、等待焦慮與投入不確定的情境。"),
    ("忽冷忽熱", ("忽冷忽熱", "忽熱忽冷", "一下熱一下冷", "若即若離"), ["溫差互動", "投入波動", "關係不確定"], "多人描述互動忽冷忽熱、很難判斷對方真實投入。"),
    ("回訊變慢", ("回訊變慢", "回很慢", "回覆變慢", "回覆速度"), ["回覆變慢", "主動猶豫", "節奏失衡"], "多人討論訊息節奏下降後，是否該繼續主動的困惑。"),
    ("曖昧不確定", ("曖昧", "是不是喜歡", "怎麼分辨", "更進一步", "丟球", "接球"), ["曖昧不確定", "試探投入", "怕誤判"], "多人卡在曖昧階段，想知道對方是否真的有意思。"),
    ("社群微訊號", ("限動", "發文", "按讚", "社群", "上線"), ["社群互動", "低成本訊號", "關係解讀"], "多人用限動、按讚或社群互動來解讀關係狀態。"),
    ("關係邊界", ("拒絕", "界線", "越界", "糾纏", "不舒服"), ["界線模糊", "拒絕失效", "安全感下降"], "多人討論界線不被尊重時，如何判斷關係是否健康。"),
]


def extract_topic_candidates(records: list[GenericRecord]) -> list[TopicCandidate]:
    grouped: dict[str, list[GenericRecord]] = defaultdict(list)
    fallback_records: list[GenericRecord] = []
    for record in records:
        topic_name = infer_topic_name(record)
        if topic_name:
            grouped[topic_name].append(record)
        else:
            fallback_records.append(record)

    if fallback_records:
        grouped["未分類關係不確定"].extend(fallback_records)

    created_at = datetime.now(timezone.utc).isoformat()
    topics: list[TopicCandidate] = []
    for title, grouped_records in grouped.items():
        signals, summary = infer_topic_metadata(title)
        score = score_topic(grouped_records)
        topic_id = f"topic-{slugify(title)}"
        topics.append(
            TopicCandidate(
                topic_id=topic_id,
                source_ids=sorted(record.id for record in grouped_records),
                title=title,
                summary=summary,
                signals=signals,
                audience="22–35 relationship-curious users",
                evidence_count=len(grouped_records),
                score=score,
                created_at=created_at,
            )
        )

    topics.sort(key=lambda topic: (-topic.score, -topic.evidence_count, topic.title))
    return topics


def infer_topic_name(record: GenericRecord) -> str | None:
    text = " ".join([record.title, record.content, " ".join(record.tags)])
    for topic_name, keywords, _, _ in TOPIC_RULES:
        if any(keyword in text for keyword in keywords):
            return topic_name
    return None


def infer_topic_metadata(topic_name: str) -> tuple[list[str], str]:
    for known_name, _, signals, summary in TOPIC_RULES:
        if known_name == topic_name:
            return signals, summary
    return (["關係不確定", "情緒拉扯", "互動解讀"], "多人討論關係不確定與互動解讀問題。")


def score_topic(records: list[GenericRecord]) -> float:
    evidence = len(records)
    metric_weight = sum(record.likes + record.comments * 2 + record.shares * 3 for record in records)
    content_bonus = sum(1 for record in records if len(record.content) >= 30)
    raw_score = evidence * 0.18 + min(metric_weight / 800.0, 0.45) + min(content_bonus * 0.05, 0.15)
    return round(min(0.95, max(0.35, raw_score)), 2)


def slugify(value: str) -> str:
    asciiish = re.sub(r"\s+", "-", value.strip().lower())
    asciiish = re.sub(r"[^a-z0-9\u4e00-\u9fff-]", "-", asciiish)
    asciiish = re.sub(r"-{2,}", "-", asciiish).strip("-")
    if re.search(r"[a-z0-9]", asciiish):
        return asciiish

    fallback_map = {
        "已讀不回": "yi-du-bu-hui",
        "忽冷忽熱": "hu-leng-hu-re",
        "回訊變慢": "hui-xun-bian-man",
        "曖昧不確定": "ai-mei-bu-que-ding",
        "社群微訊號": "she-qun-wei-xun-hao",
        "關係邊界": "guan-xi-bian-jie",
        "未分類關係不確定": "uncategorized-relationship-uncertainty",
    }
    return fallback_map.get(value, "topic")
