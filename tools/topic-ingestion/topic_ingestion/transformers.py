"""Transform topics into question and module seeds."""

from __future__ import annotations

from datetime import datetime, timezone

from .schema import QuestionSeed, TopicCandidate


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
