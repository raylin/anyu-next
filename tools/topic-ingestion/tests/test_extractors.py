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
                comments=34,
                shares=2,
                tags=["曖昧"],
            ),
            GenericRecord(
                id="post-002",
                source="manual",
                title="已讀不回之後還要不要再主動",
                content="我不知道是不是在冷掉。",
                url=None,
                published_at=None,
                likes=60,
                comments=10,
                shares=0,
                tags=[],
            ),
        ]

        topics = extract_topic_candidates(records)
        self.assertEqual(len(topics), 1)
        self.assertEqual(topics[0].title, "已讀不回")
        self.assertEqual(topics[0].evidence_count, 2)
        self.assertGreaterEqual(topics[0].score, 0.35)
