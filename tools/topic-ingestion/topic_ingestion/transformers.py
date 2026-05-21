"""Transform topics into question and module seeds."""

from __future__ import annotations

from datetime import datetime, timezone

from .schema import ModuleSeed, QuestionSeed, TopicCandidate


QUESTION_TEMPLATES: dict[str, list[str]] = {
    "已讀不回": [
        "他是真的忙，還是其實在冷掉？",
        "已讀不回之後，還要不要再主動一次？",
    ],
    "忽冷忽熱": [
        "昨天很熱今天變冷，這種溫差代表什麼？",
        "忽冷忽熱的人，是真的有意思還是在維持選項？",
    ],
    "回訊變慢": [
        "他回訊變慢了，還要不要繼續主動？",
        "回覆節奏慢下來，是忙還是投入在降溫？",
    ],
    "曖昧不確定": [
        "他是有意思，還是只是享受曖昧感？",
        "這顆球到底該不該接？",
    ],
    "社群微訊號": [
        "他一直看你限動，真的代表在意嗎？",
        "只有按讚沒有靠近，這算訊號還是習慣？",
    ],
    "關係邊界": [
        "你已經拒絕了，為什麼對方還是聽不懂？",
        "這種不舒服，是小事還是紅旗？",
    ],
}

DEFAULT_INPUT_NEEDED = [
    "對話片段",
    "最近互動變化",
    "見面或邀約情境",
]

DEFAULT_OUTPUT_SECTIONS = [
    "溫度分數",
    "三個小訊號",
    "下一句怎麼回",
]


def topic_candidates_to_question_seeds(topics: list[TopicCandidate]) -> list[QuestionSeed]:
    created_at = datetime.now(timezone.utc).isoformat()
    seeds: list[QuestionSeed] = []
    for topic in topics:
        templates = QUESTION_TEMPLATES.get(
            topic.title,
            [
                "這種關係不確定，到底該怎麼解讀？",
                "現在最值得先看懂的是什麼？",
            ],
        )
        for index, question in enumerate(templates, start=1):
            seeds.append(
                QuestionSeed(
                    question_id=f"question-{topic.topic_id}-{index}",
                    topic_id=topic.topic_id,
                    question=question,
                    module_fit="ambiguous-temperature",
                    why_it_works=_why_it_works(topic),
                    tone="warm, subtle, slightly mysterious",
                    created_at=created_at,
                )
            )
    return seeds


def _why_it_works(topic: TopicCandidate) -> str:
    if topic.title in {"已讀不回", "忽冷忽熱", "回訊變慢", "曖昧不確定", "社群微訊號"}:
        return "這類題目帶有高不確定性，容易轉成輕量測驗。"
    if topic.title == "關係邊界":
        return "這類題目有明確情緒張力，也容易延伸成判斷型互動測驗。"
    return "這類題目具備可辨識情境與可轉譯成測驗的情緒拉力。"


def question_seeds_to_module_seeds(
    questions: list[QuestionSeed],
    topics: list[TopicCandidate] | None = None,
) -> list[ModuleSeed]:
    created_at = datetime.now(timezone.utc).isoformat()
    topics_by_id = {topic.topic_id: topic for topic in (topics or [])}
    grouped_questions: dict[str, list[QuestionSeed]] = {}
    for question in questions:
        grouped_questions.setdefault(question.topic_id, []).append(question)

    seeds: list[ModuleSeed] = []
    for topic_id, topic_questions in grouped_questions.items():
        topic_questions = sorted(topic_questions, key=lambda item: item.question_id)
        topic = topics_by_id.get(topic_id)
        primary_question = topic_questions[0]
        title = primary_question.question
        audience = topic.audience if topic else "22–35 relationship-curious users"
        emotional_hook = _emotional_hook(topic, primary_question)
        user_promise = _user_promise(topic, primary_question)
        monetization_fit = _monetization_fit(topic, primary_question)
        confidence = _confidence(topic, topic_questions)
        seeds.append(
            ModuleSeed(
                module_id=_module_id(topic, primary_question),
                topic_id=topic_id,
                question_ids=[item.question_id for item in topic_questions],
                title=title,
                format="mini-test",
                audience=audience,
                emotional_hook=emotional_hook,
                user_promise=user_promise,
                input_needed=list(DEFAULT_INPUT_NEEDED),
                output_sections=list(DEFAULT_OUTPUT_SECTIONS),
                monetization_fit=monetization_fit,
                tone=primary_question.tone,
                confidence=confidence,
                created_at=created_at,
            )
        )

    seeds.sort(key=lambda item: (-item.confidence, item.module_id))
    return seeds


def _module_id(topic: TopicCandidate | None, question: QuestionSeed) -> str:
    base = question.module_fit or "module-seed"
    if topic and topic.title == "已讀不回":
        return f"{base}-followup"
    if topic and topic.title == "回訊變慢":
        return f"{base}-rhythm-check"
    if topic and topic.title == "忽冷忽熱":
        return f"{base}-mixed-signals"
    if topic and topic.title == "社群微訊號":
        return f"{base}-signal-decoder"
    return f"{base}-{topic.topic_id.replace('topic-', '')}" if topic else f"{base}-{question.topic_id.replace('topic-', '')}"


def _emotional_hook(topic: TopicCandidate | None, question: QuestionSeed) -> str:
    if topic and topic.signals:
        return "、".join(topic.signals[:2]) + "的矛盾感"
    if topic:
        return topic.summary
    return f"把「{question.question}」背後的情緒拉扯具體說清楚。"


def _user_promise(topic: TopicCandidate | None, question: QuestionSeed) -> str:
    summary = topic.summary if topic else "這段互動的真實狀態"
    if question.module_fit == "ambiguous-temperature":
        return f"幫你判斷{summary}更接近降溫、觀望，還是只是節奏不同。"
    return f"幫你把 {summary} 轉成更容易判斷的互動線索。"


def _monetization_fit(topic: TopicCandidate | None, question: QuestionSeed) -> str:
    relationship_titles = {"已讀不回", "忽冷忽熱", "回訊變慢", "曖昧不確定", "社群微訊號"}
    if question.module_fit == "ambiguous-temperature":
        return "paid follow-up reply strategy"
    if topic and topic.title in relationship_titles:
        return "paid follow-up reply strategy"
    if topic and topic.title == "關係邊界":
        return "paid boundary-setting guidance"
    return "paid follow-up insight"


def _confidence(topic: TopicCandidate | None, questions: list[QuestionSeed]) -> float:
    topic_score = topic.score if topic else 0.45
    evidence = min((topic.evidence_count if topic else 1) * 0.04, 0.12)
    question_bonus = min(len(questions) * 0.03, 0.08)
    confidence = topic_score * 0.72 + evidence + question_bonus
    return round(min(0.95, max(0.4, confidence)), 2)
