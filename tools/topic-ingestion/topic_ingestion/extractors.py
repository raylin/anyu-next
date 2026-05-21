"""Deterministic topic extraction heuristics."""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
import math
import re

from .risk import infer_risk_flags
from .schema import GenericRecord, TopicCandidate


TOPIC_RULES: list[tuple[str, tuple[str, ...], list[str], str]] = [
    ("交友平台比較", ("哪個交友軟體", "交友app", "交友 app", "平台比較", "用哪個平台", "軟體推薦", "平台推薦"), ["平台選擇", "使用情境", "投入成本"], "多人比較不同交友平台的使用感、受眾與投入成本。"),
    ("交友檔案策略", ("照片怎麼拍", "照片怎麼選", "自介怎麼寫", "檔案怎麼改", "profile", "個人檔案", "頭貼"), ["檔案優化", "第一印象", "自我呈現"], "多人討論交友檔案、照片與自介如何影響第一步互動。"),
    ("現實認識機會", ("現實認識", "朋友介紹", "活動認識", "共同朋友", "生活圈", "脫單管道", "哪裡認識"), ["現實場域", "低壓認識", "機會稀缺"], "多人討論除了交友平台之外，現實生活中還能在哪裡自然認識人。"),
    ("關係市場自我定位", ("市場定位", "自己幾分", "競爭力", "配得上", "條件差", "條件普通", "定位"), ["自我定位", "比較壓力", "條件焦慮"], "多人試圖判斷自己在關係市場中的位置與可調整方向。"),
    ("承諾壓力", ("承諾", "給答案", "確認關係", "要不要在一起", "未來規劃", "給交代"), ["承諾壓力", "關係定義", "答案焦慮"], "多人在關係推進時感受到承諾、定義與給答案的壓力。"),
    ("家庭婚姻價值衝突", ("家人催婚", "父母催婚", "婆家", "娘家", "家庭價值", "婚後分工", "家務"), ["家庭壓力", "婚姻價值", "分工衝突"], "多人討論家庭期待、婚姻分工與價值觀不一致造成的壓力。"),
    ("伴侶邊界與誤會", ("誤會", "溝通不清", "界線不清", "踩線", "冷戰", "講不清楚", "不讀空氣"), ["邊界溝通", "誤會累積", "互動失焦"], "多人描述伴侶或曖昧對象之間的界線不清與溝通誤會。"),
    ("外貌與個性拉扯", ("外貌重要", "個性重要", "看個性", "只看臉", "外表 vs", "外表還是個性", "外貌還是個性"), ["外貌個性拉扯", "第一眼壓力", "相處價值"], "多人在外貌吸引與個性相處之間來回拉扯。"),
    ("金錢與狀態定位", ("收入", "薪水", "年薪", "存款", "買房", "車", "工程師", "經濟條件", "社經"), ["金錢焦慮", "狀態定位", "條件比較"], "多人把收入、職業與資產條件放進關係選擇與自我定位中。"),
    ("交友詐騙與假帳號焦慮", ("假帳號", "詐騙", "騙感情", "投資群", "殺豬盤", "ai 代聊", "ai代聊", "機器人"), ["詐騙疑慮", "真實性不安", "平台噪音"], "多人擔心交友互動中的假帳號、詐騙或非真人訊號。"),
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
    weighted_engagement = sum(
        ((record.likes + record.comments * 1.6 + record.shares * 2.2 + record.dislikes * 0.25) * record.source_weight)
        for record in records
    )
    source_mix = summarize_source_mix(records)
    average_source_weight = summarize_source_weight(records)
    source_diversity_bonus = min((len(source_mix) - 1) * 0.035, 0.07)
    evidence_score = min(math.log1p(evidence) / math.log(16), 1.0) * 0.24
    engagement_score = min(math.log1p(weighted_engagement) / math.log(1200), 1.0) * 0.26
    content_score = min(sum(1 for record in records if len(record.content) >= 30) / max(evidence, 1), 1.0) * 0.08
    source_score = average_source_weight * 0.16
    risk_penalty = min(len(infer_risk_flags(*(record.title for record in records), *(record.content for record in records))) * 0.018, 0.09)
    raw_score = 0.22 + evidence_score + engagement_score + content_score + source_score + source_diversity_bonus - risk_penalty
    if set(source_mix) == {"mobile01"}:
        raw_score = min(raw_score, 0.62)
    return round(min(0.91, max(0.24, raw_score)), 2)


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
        "交友平台比較": "dating-app-platform-comparison",
        "交友檔案策略": "dating-app-profile-strategy",
        "現實認識機會": "real-world-meeting-chance",
        "關係市場自我定位": "relationship-market-self-positioning",
        "承諾壓力": "commitment-pressure",
        "家庭婚姻價值衝突": "family-marriage-value-conflict",
        "伴侶邊界與誤會": "partner-boundary-and-miscommunication",
        "外貌與個性拉扯": "appearance-vs-personality-debate",
        "金錢與狀態定位": "money-and-status-positioning",
        "交友詐騙與假帳號焦慮": "dating-app-scam-or-fake-account-anxiety",
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
