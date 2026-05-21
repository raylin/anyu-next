from __future__ import annotations

import unittest

from topic_ingestion.schema import TopicCandidate
from topic_ingestion.transformers import topic_candidates_to_question_seeds


class TransformersTest(unittest.TestCase):
    def test_generate_question_seeds_from_topics(self) -> None:
        topic = TopicCandidate(
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

        questions = topic_candidates_to_question_seeds([topic])
        self.assertEqual(len(questions), 2)
        self.assertEqual(questions[0].topic_id, "topic-yi-du-bu-hui")
        self.assertEqual(questions[0].module_fit, "ambiguous-temperature")
        self.assertIn("測驗", questions[0].why_it_works)
