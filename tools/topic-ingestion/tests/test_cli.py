from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
TOOLS_ROOT = REPO_ROOT / "tools" / "topic-ingestion"
EXAMPLE_INPUT = TOOLS_ROOT / "examples" / "sample-input.jsonl"


class CliTest(unittest.TestCase):
    def run_cli(self, *args: str) -> subprocess.CompletedProcess[str]:
        env = os.environ.copy()
        env["PYTHONPATH"] = str(TOOLS_ROOT)
        return subprocess.run(
            [sys.executable, "-m", "topic_ingestion.cli", *args],
            cwd=REPO_ROOT,
            env=env,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_extract_command(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            output = Path(tmpdir) / "topics.jsonl"
            result = self.run_cli("extract", "--input", str(EXAMPLE_INPUT), "--output", str(output))
            self.assertEqual(result.returncode, 0, result.stderr)
            lines = [json.loads(line) for line in output.read_text(encoding="utf-8").splitlines() if line.strip()]
            self.assertGreaterEqual(len(lines), 1)
            self.assertIn("topicId", lines[0])

    def test_questions_command(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            topics = Path(tmpdir) / "topics.jsonl"
            questions = Path(tmpdir) / "questions.jsonl"
            extract_result = self.run_cli("extract", "--input", str(EXAMPLE_INPUT), "--output", str(topics))
            self.assertEqual(extract_result.returncode, 0, extract_result.stderr)

            question_result = self.run_cli("questions", "--input", str(topics), "--output", str(questions))
            self.assertEqual(question_result.returncode, 0, question_result.stderr)
            lines = [json.loads(line) for line in questions.read_text(encoding="utf-8").splitlines() if line.strip()]
            self.assertGreaterEqual(len(lines), 1)
            self.assertIn("questionId", lines[0])
