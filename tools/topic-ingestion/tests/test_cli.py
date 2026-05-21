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

    def test_modules_command(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            topics = Path(tmpdir) / "topics.jsonl"
            questions = Path(tmpdir) / "questions.jsonl"
            modules = Path(tmpdir) / "modules.jsonl"
            self.assertEqual(
                self.run_cli("extract", "--input", str(EXAMPLE_INPUT), "--output", str(topics)).returncode,
                0,
            )
            self.assertEqual(
                self.run_cli("questions", "--input", str(topics), "--output", str(questions)).returncode,
                0,
            )

            module_result = self.run_cli(
                "modules",
                "--input",
                str(questions),
                "--topics",
                str(topics),
                "--output",
                str(modules),
            )
            self.assertEqual(module_result.returncode, 0, module_result.stderr)
            lines = [json.loads(line) for line in modules.read_text(encoding="utf-8").splitlines() if line.strip()]
            self.assertGreaterEqual(len(lines), 1)
            self.assertIn("moduleId", lines[0])
            self.assertIn("inputNeeded", lines[0])
            self.assertIn("outputSections", lines[0])

    def test_pipeline_command_with_modules_output(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            topics = Path(tmpdir) / "topics.jsonl"
            questions = Path(tmpdir) / "questions.jsonl"
            modules = Path(tmpdir) / "modules.jsonl"

            result = self.run_cli(
                "pipeline",
                "--input",
                str(EXAMPLE_INPUT),
                "--topics-output",
                str(topics),
                "--questions-output",
                str(questions),
                "--modules-output",
                str(modules),
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue(topics.exists())
            self.assertTrue(questions.exists())
            self.assertTrue(modules.exists())

    def test_pipeline_command_preserves_old_behavior_without_modules_output(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            topics = Path(tmpdir) / "topics.jsonl"
            questions = Path(tmpdir) / "questions.jsonl"
            modules = Path(tmpdir) / "modules.jsonl"

            result = self.run_cli(
                "pipeline",
                "--input",
                str(EXAMPLE_INPUT),
                "--topics-output",
                str(topics),
                "--questions-output",
                str(questions),
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue(topics.exists())
            self.assertTrue(questions.exists())
            self.assertFalse(modules.exists())

    def test_review_command_writes_markdown(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            topics = Path(tmpdir) / "topics.jsonl"
            questions = Path(tmpdir) / "questions.jsonl"
            modules = Path(tmpdir) / "modules.jsonl"
            review = Path(tmpdir) / "trend-review-pack.md"
            self.assertEqual(
                self.run_cli("extract", "--input", str(EXAMPLE_INPUT), "--output", str(topics)).returncode,
                0,
            )
            self.assertEqual(
                self.run_cli("questions", "--input", str(topics), "--output", str(questions)).returncode,
                0,
            )
            self.assertEqual(
                self.run_cli("modules", "--input", str(questions), "--topics", str(topics), "--output", str(modules)).returncode,
                0,
            )
            review_result = self.run_cli(
                "review",
                "--modules",
                str(modules),
                "--topics",
                str(topics),
                "--questions",
                str(questions),
                "--output",
                str(review),
            )
            self.assertEqual(review_result.returncode, 0, review_result.stderr)
            text = review.read_text(encoding="utf-8")
            self.assertIn("# Topic Ingestion Trend Review Pack", text)
            self.assertIn("Scores are heuristic ranking scaffolding, not a truth metric.", text)

    def test_pipeline_command_with_review_output(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            topics = Path(tmpdir) / "topics.jsonl"
            questions = Path(tmpdir) / "questions.jsonl"
            modules = Path(tmpdir) / "modules.jsonl"
            review = Path(tmpdir) / "trend-review-pack.md"
            result = self.run_cli(
                "pipeline",
                "--input",
                str(EXAMPLE_INPUT),
                "--topics-output",
                str(topics),
                "--questions-output",
                str(questions),
                "--modules-output",
                str(modules),
                "--review-output",
                str(review),
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue(review.exists())
            self.assertIn("## 1. Summary", review.read_text(encoding="utf-8"))
