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

    def test_new_bucket_coverage_reduces_representative_uncategorized_cases(self) -> None:
        records = [
            self.record("p1", "dcard", "哪個交友app比較適合認真認識", "大家都在比較平台推薦和使用節奏。"),
            self.record("p2", "dcard", "照片怎麼選才不會第一眼被滑掉", "想知道照片怎麼拍和自介怎麼寫比較自然。"),
            self.record("p3", "ptt", "現實認識是不是比交友軟體自然", "朋友介紹和生活圈認識好像比較不尷尬。"),
            self.record("p4", "ptt", "他一直要我給答案是不是承諾壓力", "確認關係和未來規劃讓我很焦慮。"),
            self.record("p5", "mobile01", "收入和買房條件會不會影響交往", "薪水、存款和經濟條件常常被拿來比較。"),
            self.record("p6", "dcard", "假帳號和投資群讓我不敢相信交友軟體", "很怕遇到詐騙或機器人。"),
        ]

        topics = extract_topic_candidates(records)
        topic_ids = {topic.topic_id for topic in topics}
        self.assertNotIn("topic-uncategorized-relationship-uncertainty", topic_ids)
        self.assertIn("topic-dating-app-platform-comparison", topic_ids)
        self.assertIn("topic-dating-app-profile-strategy", topic_ids)
        self.assertIn("topic-real-world-meeting-chance", topic_ids)
        self.assertIn("topic-commitment-pressure", topic_ids)
        self.assertIn("topic-money-and-status-positioning", topic_ids)
        self.assertIn("topic-dating-app-scam-or-fake-account-anxiety", topic_ids)

    def test_source_weight_and_mobile01_cap_create_score_separation(self) -> None:
        dcard_topic = extract_topic_candidates(
            [self.record("d1", "dcard", "哪個交友app比較適合認真認識", "平台比較和交友app推薦讓人困惑。", likes=80, comments=30)]
        )[0]
        mobile_topic = extract_topic_candidates(
            [self.record("m1", "mobile01", "哪個交友app比較適合認真認識", "平台比較和交友app推薦讓人困惑。", likes=80, comments=30)]
        )[0]

        self.assertGreater(dcard_topic.score, mobile_topic.score)
        self.assertLessEqual(mobile_topic.score, 0.62)
        self.assertGreater(dcard_topic.score - mobile_topic.score, 0.08)

    def test_score_distribution_has_separation_for_sample_set(self) -> None:
        topics = extract_topic_candidates(
            [
                self.record("d1", "dcard", "哪個交友app比較適合認真認識", "平台比較和使用節奏", likes=80, comments=30),
                self.record("p1", "ptt", "看臉讓人很焦慮", "照片與第一眼壓力", likes=90, comments=40),
                self.record("m1", "mobile01", "收入買房條件影響交往", "經濟條件比較", likes=90, comments=40),
                self.record("m2", "mobile01", "生活圈哪裡認識人", "現實認識和朋友介紹", likes=20, comments=5),
            ]
        )
        scores = sorted({topic.score for topic in topics}, reverse=True)
        self.assertGreaterEqual(len(scores), 3)
        self.assertLess(max(scores), 0.95)

    @staticmethod
    def record(
        record_id: str,
        source: str,
        title: str,
        content: str,
        *,
        likes: int = 20,
        comments: int = 5,
        tags: list[str] | None = None,
    ) -> GenericRecord:
        weights = {"dcard": 1.0, "ptt": 0.7, "mobile01": 0.35, "manual": 0.8}
        return GenericRecord(
            id=record_id,
            source=source,
            title=title,
            content=content,
            url=None,
            published_at=None,
            likes=likes,
            dislikes=0,
            comments=comments,
            shares=0,
            tags=tags or [],
            comment_texts=[],
            source_weight=weights.get(source, 0.5),
        )
