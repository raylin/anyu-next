#!/usr/bin/env python3
"""Generate a minimal markdown report from local 曖昧溫度計 experiment logs."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from oradar.config import find_repo_root

from experiments.ambiguous_temperature_v0.event_log import (
    CONTACT_SUBMISSIONS_PATH,
    EVENT_LOG_PATH,
    OUTPUT_DIR,
    SUBMISSIONS_PATH,
)
from experiments.ambiguous_temperature_v0.product_runtime import EXPERIMENT_ID


DEFAULT_OUTPUT_PATH = OUTPUT_DIR / "experiment_report.md"
FUNNEL_EVENTS = (
    "page_view",
    "input_started",
    "input_submitted",
    "analysis_completed",
    "paid_unlock_clicked",
    "contact_submitted",
    "share_card_clicked",
)
FUNNEL_RATES = (
    ("input_started / page_view", "input_started", "page_view"),
    ("input_submitted / input_started", "input_submitted", "input_started"),
    ("analysis_completed / input_submitted", "analysis_completed", "input_submitted"),
    ("paid_unlock_clicked / analysis_completed", "paid_unlock_clicked", "analysis_completed"),
    ("contact_submitted / paid_unlock_clicked", "contact_submitted", "paid_unlock_clicked"),
    ("share_card_clicked / analysis_completed", "share_card_clicked", "analysis_completed"),
)
TEMPERATURE_BUCKETS = (
    ("0-20", 0, 20),
    ("21-40", 21, 40),
    ("41-60", 41, 60),
    ("61-80", 61, 80),
    ("81-100", 81, 100),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a local markdown report from experiment JSONL logs.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH)
    return parser.parse_args()


def main() -> int:
    find_repo_root(Path(__file__).resolve().parent)
    args = parse_args()

    events, invalid_events, missing_events = load_jsonl_records(EVENT_LOG_PATH)
    submissions, invalid_submissions, missing_submissions = load_jsonl_records(SUBMISSIONS_PATH)
    contacts, invalid_contacts, missing_contacts = load_jsonl_records(CONTACT_SUBMISSIONS_PATH)

    report = build_report(
        events=events,
        submissions=submissions,
        contacts=contacts,
        invalid_counts={
            "events": invalid_events,
            "submissions": invalid_submissions,
            "contacts": invalid_contacts,
        },
        missing_files={
            "events": missing_events,
            "submissions": missing_submissions,
            "contacts": missing_contacts,
        },
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(report, encoding="utf-8")
    print(f"Experiment report generated: {args.output}")
    return 0


def load_jsonl_records(path: Path) -> tuple[list[dict[str, Any]], int, bool]:
    if not path.exists():
        return [], 0, True

    records: list[dict[str, Any]] = []
    invalid_lines = 0
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        try:
            record = json.loads(line)
        except json.JSONDecodeError:
            invalid_lines += 1
            continue
        if isinstance(record, dict):
            records.append(record)
        else:
            invalid_lines += 1
    return records, invalid_lines, False


def build_report(
    *,
    events: list[dict[str, Any]],
    submissions: list[dict[str, Any]],
    contacts: list[dict[str, Any]],
    invalid_counts: dict[str, int],
    missing_files: dict[str, bool],
) -> str:
    generated_at = datetime.now(timezone.utc).isoformat()
    all_sessions = collect_session_ids(events, submissions, contacts)
    event_counts = Counter(as_str(event.get("event_name")) for event in events if as_str(event.get("event_name")))
    submissions_by_type = Counter(as_str(record.get("situation_type")) or "unknown" for record in submissions)
    input_length_buckets = Counter(as_str(record.get("input_length_bucket")) or "unknown" for record in submissions)
    snippet_counts = Counter(bool(record.get("has_conversation_snippet")) for record in submissions)
    contact_type_counts = Counter(normalize_contact_type(as_str(record.get("contact_type"))) for record in contacts)

    situation_breakdown = build_situation_breakdown(events, submissions, contacts)
    state_breakdown = build_state_breakdown(events)
    temperature_scores = [score for score in extract_temperature_scores(events) if score is not None]

    lines = [
        "# Ambiguous Temperature Experiment Report",
        "",
        "## 1. Overview",
        "",
        f"- Report generated timestamp: `{generated_at}`",
        f"- Experiment id: `{EXPERIMENT_ID}`",
        f"- Total sessions observed: `{len(all_sessions)}`",
        f"- Total events: `{len(events)}`",
        f"- Total submissions: `{len(submissions)}`",
        f"- Total contact submissions: `{len(contacts)}`",
        "",
        "### File Status",
        "",
        f"- Events file missing: `{yes_no(missing_files['events'])}`",
        f"- Submissions file missing: `{yes_no(missing_files['submissions'])}`",
        f"- Contact file missing: `{yes_no(missing_files['contacts'])}`",
        f"- Invalid event lines skipped: `{invalid_counts['events']}`",
        f"- Invalid submission lines skipped: `{invalid_counts['submissions']}`",
        f"- Invalid contact lines skipped: `{invalid_counts['contacts']}`",
        "",
        "## 2. Funnel Counts",
        "",
    ]
    for event_name in FUNNEL_EVENTS:
        lines.append(f"- `{event_name}`: `{event_counts.get(event_name, 0)}`")

    lines.extend(
        [
            "",
            "## 3. Funnel Rates",
            "",
        ]
    )
    for label, numerator_name, denominator_name in FUNNEL_RATES:
        numerator = event_counts.get(numerator_name, 0)
        denominator = event_counts.get(denominator_name, 0)
        lines.append(f"- `{label}`: `{format_rate(numerator, denominator)}`")

    lines.extend(
        [
            "",
            "## 4. Situation Type Breakdown",
            "",
            "| Situation Type | Submissions | Analysis Completed | Paid Unlock Clicked | Contact Submitted | Paid Unlock Rate |",
            "| --- | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for situation_type in sorted(situation_breakdown):
        row = situation_breakdown[situation_type]
        lines.append(
            f"| {situation_type} | {row['submissions']} | {row['analysis_completed']} | "
            f"{row['paid_unlock_clicked']} | {row['contact_submitted']} | "
            f"{format_rate_value(row['paid_unlock_clicked'], row['analysis_completed'])} |"
        )
    if not situation_breakdown:
        lines.append("| none | 0 | 0 | 0 | 0 | n/a |")

    lines.extend(
        [
            "",
            "## 5. State Label Breakdown",
            "",
            "| State Label | Analysis Completed | Paid Unlock Clicked | Paid Unlock Rate |",
            "| --- | ---: | ---: | ---: |",
        ]
    )
    for state_label in sorted(state_breakdown):
        row = state_breakdown[state_label]
        lines.append(
            f"| {state_label} | {row['analysis_completed']} | {row['paid_unlock_clicked']} | "
            f"{format_rate_value(row['paid_unlock_clicked'], row['analysis_completed'])} |"
        )
    if not state_breakdown:
        lines.append("| none | 0 | 0 | n/a |")

    lines.extend(
        [
            "",
            "## 6. Temperature Score Summary",
            "",
            f"- Count: `{len(temperature_scores)}`",
            f"- Min: `{min(temperature_scores) if temperature_scores else 'n/a'}`",
            f"- Max: `{max(temperature_scores) if temperature_scores else 'n/a'}`",
            f"- Average: `{format_average(temperature_scores)}`",
            "",
            "### Buckets",
            "",
        ]
    )
    bucket_counts = count_temperature_buckets(temperature_scores)
    for bucket_label, _, _ in TEMPERATURE_BUCKETS:
        lines.append(f"- `{bucket_label}`: `{bucket_counts.get(bucket_label, 0)}`")

    average_input_length = (
        f"{sum(as_int(record.get('input_length')) for record in submissions) / len(submissions):.1f}"
        if submissions
        else "n/a"
    )
    lines.extend(
        [
            "",
            "## 7. Input Quality Summary",
            "",
            f"- Average input length: `{average_input_length}`",
            "",
            "### Input Length Buckets",
            "",
        ]
    )
    for bucket_label in ("1-40", "41-80", "81-160", "161+", "unknown"):
        count = input_length_buckets.get(bucket_label, 0)
        if count:
            lines.append(f"- `{bucket_label}`: `{count}`")
    if not submissions:
        lines.append("- `none`: `0`")

    lines.extend(
        [
            "",
            "### has_conversation_snippet",
            "",
            f"- `true`: `{snippet_counts.get(True, 0)}`",
            f"- `false`: `{snippet_counts.get(False, 0)}`",
            "",
            "### Situation Type Counts",
            "",
        ]
    )
    for situation_type in sorted(submissions_by_type):
        lines.append(f"- `{situation_type}`: `{submissions_by_type[situation_type]}`")
    if not submissions_by_type:
        lines.append("- `none`: `0`")

    lines.extend(
        [
            "",
            "## 8. Contact Capture Summary",
            "",
            f"- Total contacts: `{len(contacts)}`",
            f"- `line`: `{contact_type_counts.get('line', 0)}`",
            f"- `email`: `{contact_type_counts.get('email', 0)}`",
            f"- `other / unknown`: `{contact_type_counts.get('other / unknown', 0)}`",
            "",
            "## 9. Interpretation Notes",
            "",
            interpretation_notes(events, submissions, contacts),
            "",
        ]
    )
    return "\n".join(lines) + "\n"


def collect_session_ids(
    events: list[dict[str, Any]],
    submissions: list[dict[str, Any]],
    contacts: list[dict[str, Any]],
) -> set[str]:
    session_ids: set[str] = set()
    for record in [*events, *submissions, *contacts]:
        session_id = as_str(record.get("session_id"))
        if session_id:
            session_ids.add(session_id)
    return session_ids


def build_situation_breakdown(
    events: list[dict[str, Any]],
    submissions: list[dict[str, Any]],
    contacts: list[dict[str, Any]],
) -> dict[str, dict[str, int]]:
    rows: dict[str, dict[str, int]] = defaultdict(
        lambda: {
            "submissions": 0,
            "analysis_completed": 0,
            "paid_unlock_clicked": 0,
            "contact_submitted": 0,
        }
    )

    for submission in submissions:
        situation_type = as_str(submission.get("situation_type")) or "unknown"
        rows[situation_type]["submissions"] += 1

    for event in events:
        event_name = as_str(event.get("event_name"))
        props = event.get("properties")
        if not isinstance(props, dict):
            props = {}
        situation_type = as_str(props.get("situation_type")) or "unknown"
        if event_name == "analysis_completed":
            rows[situation_type]["analysis_completed"] += 1
        elif event_name == "paid_unlock_clicked":
            rows[situation_type]["paid_unlock_clicked"] += 1

    for contact in contacts:
        situation_type = as_str(contact.get("situation_type")) or "unknown"
        rows[situation_type]["contact_submitted"] += 1

    return dict(rows)


def build_state_breakdown(events: list[dict[str, Any]]) -> dict[str, dict[str, int]]:
    rows: dict[str, dict[str, int]] = defaultdict(
        lambda: {
            "analysis_completed": 0,
            "paid_unlock_clicked": 0,
        }
    )
    for event in events:
        event_name = as_str(event.get("event_name"))
        props = event.get("properties")
        if not isinstance(props, dict):
            props = {}
        state_label = as_str(props.get("state_label"))
        if not state_label:
            continue
        if event_name == "analysis_completed":
            rows[state_label]["analysis_completed"] += 1
        elif event_name == "paid_unlock_clicked":
            rows[state_label]["paid_unlock_clicked"] += 1
    return dict(rows)


def extract_temperature_scores(events: list[dict[str, Any]]) -> list[int | None]:
    scores: list[int | None] = []
    for event in events:
        if as_str(event.get("event_name")) != "analysis_completed":
            continue
        props = event.get("properties")
        if not isinstance(props, dict):
            scores.append(None)
            continue
        scores.append(as_optional_int(props.get("temperature_score")))
    return scores


def count_temperature_buckets(scores: list[int]) -> Counter[str]:
    counts: Counter[str] = Counter()
    for score in scores:
        for label, minimum, maximum in TEMPERATURE_BUCKETS:
            if minimum <= score <= maximum:
                counts[label] += 1
                break
    return counts


def interpretation_notes(
    events: list[dict[str, Any]],
    submissions: list[dict[str, Any]],
    contacts: list[dict[str, Any]],
) -> str:
    sample_size = len(submissions)
    paid_clicks = sum(1 for event in events if as_str(event.get("event_name")) == "paid_unlock_clicked")
    contact_count = len(contacts)

    notes = [
        "- Interpret early results directionally when sample size is small.",
        "- Paid unlock clicks measure intent, not revenue.",
        "- Contact submissions signal stronger intent than paid unlock clicks alone.",
    ]
    if paid_clicks > 0 and contact_count == 0:
        notes.append("- High paid click activity with no contact submission can indicate curiosity without strong commitment.")
    elif paid_clicks > contact_count:
        notes.append("- A gap between paid clicks and contact submissions can indicate curiosity that does not convert into follow-through.")
    if sample_size < 10:
        notes.append("- Current sample size is below 10 submissions, so treat any rate differences as directional only.")
    return "\n".join(notes)


def format_rate(numerator: int, denominator: int) -> str:
    if denominator == 0:
        return "n/a"
    return format_rate_value(numerator, denominator)


def format_rate_value(numerator: int, denominator: int) -> str:
    if denominator == 0:
        return "n/a"
    return f"{(numerator / denominator) * 100:.1f}% ({numerator}/{denominator})"


def format_average(values: list[int]) -> str:
    if not values:
        return "n/a"
    return f"{sum(values) / len(values):.1f}"


def normalize_contact_type(value: str) -> str:
    candidate = value.strip().lower()
    if candidate in {"line", "email"}:
        return candidate
    return "other / unknown"


def as_str(value: Any) -> str:
    return value if isinstance(value, str) else ""


def as_int(value: Any) -> int:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    return 0


def as_optional_int(value: Any) -> int | None:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    return None


def yes_no(value: bool) -> str:
    return "yes" if value else "no"


if __name__ == "__main__":
    raise SystemExit(main())
