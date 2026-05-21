"""Deterministic topic extraction heuristics."""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
import re

from .risk import infer_risk_flags
from .schema import GenericRecord, TopicCandidate


TOPIC_RULES: list[tuple[str, tuple[str, ...], list[str], str]] = [
    ("已讀不回", ("已讀不回", "讀不回", "不回訊息"), ["已讀不回", "等待焦慮", "投入不確定"], "多人討論回覆中斷、等待焦慮與投入不確定的情境。"),
    ("忽冷忽熱", ("忽冷忽熱", "忽熱忽冷", "一下熱一下冷", "若即若離"), ["溫差互動", "投入波動", "關係不確定"], "多人描述互動忽冷忽熱、很難判斷對方真實投入。"),
    ("回訊變慢", ("回訊變慢", "回很慢", "回覆變慢", "回覆速度"), ["回覆變慢", "主動猶豫", "節奏失衡"], "多人討論訊息節奏下降後，是否該繼續主動的困惑。"),
    ("曖昧不確定", ("曖昧", "是不是喜歡", "怎麼分辨", "更進一步", "丟球", "接球"), ["曖昧不確定", "試探投入", "怕誤判"], "多人卡在曖昧階段，想知道對方是否真的有意思。"),
    ("社群微訊號", ("限動", "發文", "按讚", "社群", "上線"), ["社群互動", "低成本訊號", "關係解讀"], "多人用限動、按讚或社群互動來解讀關係狀態。"),
    ("關係邊界", ("拒絕", "界線", "越界", "糾纏", "不舒服"), ["界線模糊", "拒絕失效", "安全感下降"], "多人討論界線不被尊重時，如何判斷關係是否健康。"),
    ("交友疲勞", ("交友軟體好累", "交友疲勞", "沒救", "滑到累", "聊到累"), ["交友疲勞", "期待耗損", "平台倦怠"], "多人在交友平台上反覆投入卻感到越來越疲憊。"),
    ("外貌焦慮", ("看臉", "外貌", "顏值", "普男", "條件", "照片"), ["外貌焦慮", "自我呈現壓力", "被挑選感"], "多人把卡關原因歸在外貌、照片與第一眼條件壓力。"),
    ("線下介紹懷疑", ("介紹認識", "相親", "介紹對象", "媒人", "配對"), ["線下配對懷疑", "期待落差", "互相審視"], "多人對介紹認識與線下配對抱持懷疑與期待落差。"),
    ("自介與檔案包裝", ("自介", "プロフィール", "照片", "簡介", "bio"), ["自我包裝壓力", "第一印象", "檔案優化"], "多人討論照片、自介與檔案包裝是否拖慢了互動起點。"),
    ("聊天能力落差", ("不會聊天", "聊不下去", "句點", "接話", "不知怎麼聊"), ["聊天能力落差", "互動卡住", "接話壓力"], "多人困在聊天節奏、接話方式與互動延續能力。"),
    ("回覆節奏控制", ("故意晚回", "回覆節奏", "吊著", "控制回覆", "養魚"), ["回覆節奏控制", "主導權焦慮", "猜測策略"], "多人把回覆時間視為關係中的控制與試探訊號。"),
    ("婚姻與價值壓力", ("逼婚", "結婚", "生小孩", "價值", "年紀"), ["未來壓力", "價值交換", "人生節奏衝突"], "多人在婚姻與未來規劃上感受到壓力、交換感與不對等。"),
    ("算命當感情工具", ("算命", "塔羅", "占卜", "紫微", "月老"), ["情感求解外包", "不確定放大", "命運依賴"], "多人把占卜、算命或玄學當成關係判讀工具。"),
    ("AI 詐騙戀愛焦慮", ("ai 女友", "ai男友", "假帳號", "詐騙", "機器人"), ["AI 戀愛焦慮", "詐騙疑慮", "真實性不安"], "多人擔心對方不是真人，或互動背後帶有詐騙風險。"),
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
        source_mix = summarize_source_mix(grouped_records)
        source_weight = summarize_source_weight(grouped_records)
        risk_flags = infer_risk_flags(*(record.title for record in grouped_records), *(record.content for record in grouped_records), *[comment for record in grouped_records for comment in record.comment_texts])
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
                risk_flags=risk_flags,
                source_mix=source_mix,
                source_weight=source_weight,
                created_at=created_at,
            )
        )

    topics.sort(key=lambda topic: (-topic.score, -topic.evidence_count, topic.title))
    return topics


def infer_topic_name(record: GenericRecord) -> str | None:
    text = " ".join([record.title, record.content, " ".join(record.tags), " ".join(record.comment_texts)])
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
    weighted_engagement = sum(((record.likes + record.comments * 2 + record.shares * 3 + record.dislikes * 0.5) * record.source_weight) for record in records)
    content_bonus = sum(1 for record in records if len(record.content) >= 30)
    source_bonus = sum(record.source_weight for record in records) / max(evidence, 1) * 0.08
    raw_score = evidence * 0.18 + min(weighted_engagement / 900.0, 0.45) + min(content_bonus * 0.05, 0.15) + source_bonus
    return round(min(0.95, max(0.28, raw_score)), 2)


def summarize_source_mix(records: list[GenericRecord]) -> dict[str, int]:
    mix: dict[str, int] = {}
    for record in records:
        mix[record.source] = mix.get(record.source, 0) + 1
    return dict(sorted(mix.items(), key=lambda item: (-item[1], item[0])))


def summarize_source_weight(records: list[GenericRecord]) -> float:
    if not records:
        return 0.5
    return round(sum(record.source_weight for record in records) / len(records), 2)


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
        "交友疲勞": "dating-app-fatigue",
        "外貌焦慮": "dating-market-appearance-anxiety",
        "線下介紹懷疑": "offline-matchmaking-skepticism",
        "自介與檔案包裝": "profile-self-presentation",
        "聊天能力落差": "conversation-skill-gap",
        "回覆節奏控制": "reply-time-control",
        "婚姻與價值壓力": "marriage-labor-value-conflict",
        "算命當感情工具": "fortune-telling-as-relationship-tool",
        "AI 詐騙戀愛焦慮": "ai-dating-scam-fear",
        "未分類關係不確定": "uncategorized-relationship-uncertainty",
    }
    return fallback_map.get(value, "topic")
