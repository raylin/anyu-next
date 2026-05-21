from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from topic_ingestion.loaders import load_jsonl_records


class LoadersTest(unittest.TestCase):
    def test_load_jsonl_records_tolerates_missing_optional_fields(self) -> None:
        content = '{"id":"1","source":"manual","title":"已讀不回","content":"他突然不回了"}\n'
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "input.jsonl"
            path.write_text(content, encoding="utf-8")
            records = load_jsonl_records(path)

        self.assertEqual(len(records), 1)
        self.assertEqual(records[0].id, "1")
        self.assertEqual(records[0].likes, 0)
        self.assertEqual(records[0].dislikes, 0)
        self.assertEqual(records[0].comments, 0)
        self.assertEqual(records[0].tags, [])
        self.assertEqual(records[0].source_weight, 0.8)

    def test_load_jsonl_records_normalizes_dcard_like_fields(self) -> None:
        content = (
            '{"source_id":"261500001","source":"dcard_external_json","title":"大家都說他有意思",'
            '"content":"我真的看不懂","created_at":"2026-05-20T08:00:00+00:00",'
            '"like_count":55,"comment_count":14,"topics":["曖昧","丟球"]}\n'
        )
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "input.jsonl"
            path.write_text(content, encoding="utf-8")
            records = load_jsonl_records(path)

        self.assertEqual(records[0].id, "261500001")
        self.assertEqual(records[0].published_at, "2026-05-20T08:00:00+00:00")
        self.assertEqual(records[0].likes, 55)
        self.assertEqual(records[0].comments, 14)
        self.assertEqual(records[0].tags, ["曖昧", "丟球"])
        self.assertEqual(records[0].source, "dcard")
        self.assertEqual(records[0].source_weight, 1.0)

    def test_load_jsonl_records_normalizes_ptt_like_fields(self) -> None:
        content = (
            '{"platform":"ptt","platform_post_id":"P001","board":"Boy-Girl",'
            '"title":"Re: [求助] 求推薦工程師宅男交友軟體",'
            '"content":"","content_raw":"<div>※ 發信站: 批踢踢</div>\\n真的覺得交友軟體好累\\nhttps://imgur.com/x",'
            '"created_at":"2026-05-20T08:00:00+00:00","like_count":31,"dislike_count":5,"comment_count":2,'
            '"comments":[{"content":"這種外貌焦慮真的很重"},{"content":"不要再被交友市場淘汰論洗腦"}],'
            '"extra":{"push_count":36,"boo_count":5,"raw_title":"Re: [求助] 求推薦工程師宅男交友軟體"}}\n'
        )
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "input.jsonl"
            path.write_text(content, encoding="utf-8")
            records = load_jsonl_records(path)

        self.assertEqual(records[0].id, "P001")
        self.assertEqual(records[0].source, "ptt")
        self.assertEqual(records[0].title, "求推薦工程師宅男交友軟體")
        self.assertEqual(records[0].likes, 31)
        self.assertEqual(records[0].dislikes, 5)
        self.assertEqual(records[0].comments, 2)
        self.assertIn("求助", records[0].tags)
        self.assertIn("Boy-Girl", records[0].tags)
        self.assertIn("真的覺得交友軟體好累", records[0].content)
        self.assertEqual(records[0].comment_texts[0], "這種外貌焦慮真的很重")
        self.assertEqual(records[0].source_weight, 0.7)
