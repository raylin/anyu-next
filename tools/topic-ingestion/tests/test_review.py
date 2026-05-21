from __future__ import annotations

import unittest

from topic_ingestion.review import HEURISTIC_DISCLAIMER, build_trend_review_pack, rank_module_seeds
from topic_ingestion.schema import ModuleSeed, QuestionSeed, TopicCandidate


class ReviewTest(unittest.TestCase):
    def setUp(self) -> None:
        self.topic = TopicCandidate(
            topic_id="topic-yi-du-bu-hui",
            source_ids=["post-001"],
            title="已讀不回",
            summary="多人討論回覆中斷與等待焦慮。",
            signals=["已讀不回", "等待焦慮", "投入不確定"],
            audience="22–35 relationship-curious users",
            evidence_count=1,
            score=0.46,
            risk_flags=[],
            source_mix={"dcard": 1},
            source_weight=1.0,
            created_at="2026-05-21T00:00:00+00:00",
        )
        self.question = QuestionSeed(
            question_id="question-topic-yi-du-bu-hui-1",
            topic_id="topic-yi-du-bu-hui",
            question="他是真的忙，還是其實在冷掉？",
            module_fit="ambiguous-temperature",
            why_it_works="這類題目帶有高不確定性，容易轉成輕量測驗。",
            tone="warm, subtle, slightly mysterious",
            created_at="2026-05-21T00:00:00+00:00",
        )
        self.module = ModuleSeed(
            module_id="ambiguous-temperature-followup",
            topic_id="topic-yi-du-bu-hui",
            question_ids=["question-topic-yi-du-bu-hui-1"],
            title="他是真的忙，還是其實在冷掉？",
            format="mini-test",
            audience="22–35 relationship-curious users",
            emotional_hook="已讀不回、等待焦慮的矛盾感",
            user_promise="幫你判斷這段互動更接近降溫、觀望，還是只是節奏不同。",
            input_needed=["對話片段", "最近互動變化", "見面或邀約情境"],
            output_sections=["溫度分數", "三個小訊號", "下一句怎麼回"],
            monetization_fit="paid follow-up reply strategy",
            tone="warm, subtle, slightly mysterious",
            confidence=0.45,
            risk_flags=[],
            source_mix={"dcard": 1},
            created_at="2026-05-21T00:00:00+00:00",
        )

    def test_rank_module_seeds_is_deterministic_and_action_bounded(self) -> None:
        ranked_first = rank_module_seeds([self.module], {self.topic.topic_id: self.topic}, {self.question.question_id: self.question})
        ranked_second = rank_module_seeds([self.module], {self.topic.topic_id: self.topic}, {self.question.question_id: self.question})
        self.assertEqual(ranked_first, ranked_second)
        self.assertIn(ranked_first[0].recommended_action, {"build", "watch", "defer"})

    def test_build_trend_review_pack_includes_required_sections_and_disclaimer(self) -> None:
        pack = build_trend_review_pack(
            [self.module],
            topics=[self.topic],
            questions=[self.question],
            generated_at="2026-05-21T00:00:00+00:00",
        )
        self.assertIn("# Topic Ingestion Trend Review Pack", pack)
        self.assertIn("## 2. Top Module Seed Candidates", pack)
        self.assertIn("## 8. Candidate Table", pack)
        self.assertIn(HEURISTIC_DISCLAIMER, pack)
        self.assertIn("recommendedAction", pack)
        self.assertIn("source mix note", pack)

    def test_build_trend_review_pack_without_optional_context_still_renders(self) -> None:
        pack = build_trend_review_pack([self.module], generated_at="2026-05-21T00:00:00+00:00")
        self.assertIn(self.module.module_id, pack)
        self.assertIn("## 9. Deferred / Low-Fit Candidates", pack)

    def test_high_toxicity_candidate_is_not_build(self) -> None:
        risky_module = ModuleSeed(
            module_id="ambiguous-temperature-appearance",
            topic_id="topic-dating-market-appearance-anxiety",
            question_ids=["question-topic-appearance-1"],
            title="你卡住的是照片、自介，還是聊天節奏？",
            format="mini-test",
            audience="22–35 relationship-curious users",
            emotional_hook="被挑選感與比較焦慮的矛盾感",
            user_promise="幫你判斷卡住的是平台節奏還是第一印象呈現。",
            input_needed=["對話片段", "最近互動變化", "見面或邀約情境"],
            output_sections=["溫度分數", "三個小訊號", "下一句怎麼回"],
            monetization_fit="paid follow-up reply strategy",
            tone="warm, subtle, slightly mysterious",
            confidence=0.62,
            risk_flags=["high_toxicity", "appearance_discrimination"],
            source_mix={"ptt": 1},
            created_at="2026-05-21T00:00:00+00:00",
        )
        ranked = rank_module_seeds([risky_module])
        self.assertIn(ranked[0].recommended_action, {"watch", "defer"})
