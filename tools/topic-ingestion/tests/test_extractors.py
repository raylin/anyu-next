from __future__ import annotations

import unittest

from topic_ingestion.extractors import extract_topic_candidates
from topic_ingestion.schema import GenericRecord


class ExtractorsTest(unittest.TestCase):
    def test_extract_topic_candidates_groups_records(self) -> None:
        records = [
            GenericRecord(
                id="post-001",
                source="manual",
                title="他已讀不回但還會看我限動",
                content="前幾天聊天很熱，這兩天突然已讀不回，可是還是一直看我限動。",
                url=None,
                published_at=None,
                likes=120,
                dislikes=0,
                comments=34,
                shares=2,
                tags=["曖昧"],
                comment_texts=[],
                source_weight=0.8,
            ),
            GenericRecord(
                id="post-002",
                source="manual",
                title="已讀不回之後還要不要再主動",
                content="我不知道是不是在冷掉。",
                url=None,
                published_at=None,
                likes=60,
                dislikes=0,
                comments=10,
                shares=0,
                tags=[],
                comment_texts=[],
                source_weight=0.8,
            ),
        ]

        topics = extract_topic_candidates(records)
        self.assertEqual(len(topics), 1)
        self.assertEqual(topics[0].title, "已讀不回")
        self.assertEqual(topics[0].evidence_count, 2)
        self.assertGreaterEqual(topics[0].score, 0.35)
        self.assertEqual(topics[0].source_mix, {"manual": 2})
        self.assertEqual(topics[0].source_weight, 0.8)

    def test_extract_topic_candidates_applies_source_weight_and_risk_flags(self) -> None:
        records = [
            GenericRecord(
                id="dcard-001",
                source="dcard",
                title="交友軟體好累，照片跟自介到底怎麼改",
                content="我真的覺得交友很疲勞，照片跟自介都不知道哪裡有問題。",
                url=None,
                published_at=None,
                likes=40,
                dislikes=0,
                comments=12,
                shares=0,
                tags=["交友軟體"],
                comment_texts=[],
                source_weight=1.0,
            ),
            GenericRecord(
                id="ptt-001",
                source="ptt",
                title="看臉這件事是不是讓很多人越聊越焦慮",
                content="大家都說看臉，第一印象與照片壓力讓很多人很焦慮。",
                url=None,
                published_at=None,
                likes=100,
                dislikes=20,
                comments=50,
                shares=0,
                tags=["Boy-Girl"],
                comment_texts=["這種顏值焦慮很嚴重"],
                source_weight=0.7,
            ),
        ]

        topics = extract_topic_candidates(records)
        titles = {topic.title: topic for topic in topics}
        self.assertIn("交友疲勞", titles)
        self.assertIn("外貌焦慮", titles)
        self.assertIn("appearance_discrimination", titles["外貌焦慮"].risk_flags)
