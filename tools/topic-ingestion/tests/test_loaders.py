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
        self.assertEqual(records[0].comments, 0)
        self.assertEqual(records[0].tags, [])

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
