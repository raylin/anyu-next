from __future__ import annotations

import unittest

from topic_ingestion.schema import QuestionSeed, TopicCandidate
from topic_ingestion.transformers import question_seeds_to_module_seeds, topic_candidates_to_question_seeds


class TransformersTest(unittest.TestCase):
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
            created_at="2026-05-21T00:00:00+00:00",
        )

    def test_generate_question_seeds_from_topics(self) -> None:
        questions = topic_candidates_to_question_seeds([self.topic])
        self.assertEqual(len(questions), 2)
        self.assertEqual(questions[0].topic_id, "topic-yi-du-bu-hui")
        self.assertEqual(questions[0].module_fit, "ambiguous-temperature")
        self.assertIn("測驗", questions[0].why_it_works)

    def test_generate_module_seeds_from_questions_and_topics(self) -> None:
        questions = topic_candidates_to_question_seeds([self.topic])
        modules = question_seeds_to_module_seeds(questions, [self.topic])
        self.assertEqual(len(modules), 1)
        self.assertEqual(modules[0].topic_id, "topic-yi-du-bu-hui")
        self.assertEqual(modules[0].format, "mini-test")
        self.assertEqual(modules[0].monetization_fit, "paid follow-up reply strategy")
        self.assertTrue(modules[0].input_needed)
        self.assertTrue(modules[0].output_sections)
        self.assertGreaterEqual(modules[0].confidence, 0.4)
        self.assertLessEqual(modules[0].confidence, 0.95)

    def test_generate_module_seeds_without_topics_uses_defaults(self) -> None:
        question = QuestionSeed(
            question_id="question-topic-custom-1",
            topic_id="topic-custom",
            question="這段互動到底算有戲還是沒戲？",
            module_fit="ambiguous-temperature",
            why_it_works="具備高不確定性。",
            tone="warm, subtle, slightly mysterious",
            created_at="2026-05-21T00:00:00+00:00",
        )
        modules = question_seeds_to_module_seeds([question])
        self.assertEqual(len(modules), 1)
        self.assertEqual(modules[0].audience, "22–35 relationship-curious users")
        self.assertEqual(modules[0].input_needed, ["對話片段", "最近互動變化", "見面或邀約情境"])
