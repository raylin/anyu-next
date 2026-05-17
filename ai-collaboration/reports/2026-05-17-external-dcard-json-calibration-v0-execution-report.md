# External Dcard JSON Calibration v0 Execution Report

## Summary

Created an external Dcard JSON calibration workflow that ingests Dcard-like JSON records from a local file, strips identifiers, produces structured calibration notes, generates a summary JSON, and writes a compact ChatGPT review bundle.

Completed work:

- added `scripts/external_dcard_json_calibration.py`
- created the external JSON output directory and artifacts
- ran calibration on `ai-collaboration/output-0517.jsonl`
- updated the Dcard calibration README
- validated privacy minimization on the generated notes

## Files Created

- `ai-collaboration/handoffs/2026-05-17-external-dcard-json-calibration-v0-handoff.md`
- `scripts/external_dcard_json_calibration.py`
- `ai-collaboration/research/dcard_calibration/external_json/external_dcard_calibration_notes.jsonl`
- `ai-collaboration/research/dcard_calibration/external_json/external_dcard_calibration_summary.json`
- `ai-collaboration/research/dcard_calibration/external_json/2026-05-17-external-dcard-json-calibration-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-17-external-dcard-json-calibration-v0-execution-report.md`

## Files Updated

- `.gitignore`
- `ai-collaboration/research/dcard_calibration/README.md`
- `ai-collaboration/summaries/summary_log.md`

Also included in this commit by explicit user instruction:

- `ai-collaboration/research/dcard_calibration/dcard_urls.txt`
- `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_notes.jsonl`

## Input Source

Used:

- `ai-collaboration/output-0517.jsonl`

Input characteristics:

- local file in JSONL format
- `20` Dcard-like relationship records
- each record includes post metadata plus a comment list

The raw input file was not committed.

## Parsing Results

Run command:

```bash
python3 scripts/external_dcard_json_calibration.py --input ai-collaboration/output-0517.jsonl
```

Results:

- input posts: `20`
- processed posts: `20`
- skipped posts: `0`
- parsed format: `jsonl`

## Calibration Method

The workflow is rule-based and local-only.

For each record it:

- extracts title, ids, timestamps, counts, and topic tags
- ignores school, department, and comment ids
- uses title plus a trimmed body window for classification only
- outputs abstract summaries instead of raw content excerpts
- classifies:
  - relationship stage
  - primary/secondary theme
  - core question type
  - action pressure
  - shareability strength
  - monetization strength
  - product family
  - MVP relevance

## Comment Signal Handling

Top comments are sorted by `like_count` and only lightweight signals are kept.

Stored comment-derived fields:

- `comment_signal_summary`
- `top_comment_advice_pattern`
- `comment_disagreement_pattern`

Not stored:

- full comment threads
- comment ids
- usernames
- school or department values

## Privacy / Data Minimization

Privacy checks passed.

Confirmed:

- no `school` fields in output notes
- no `department` fields in output notes
- no comment ids in output notes
- no full raw posts in output notes
- no full raw comment threads in output notes

The generated notes keep only:

- title
- source id
- created date
- aggregate counts
- structured relationship signals
- abstract content summaries
- lightweight comment-pattern summaries

## Sensitive Topic Handling

Sensitive topics were not discarded automatically.

Instead they were flagged in `notes` with:

- `sensitive_topic: true`
- a short `reason`

Examples of flagged categories:

- explicit adult content
- legal or age-gap ambiguity
- harassment or boundary risk
- infidelity or open-relationship risk

The review bundle avoids reproducing explicit details.

## Review Bundle

Output bundle:

- `ai-collaboration/research/dcard_calibration/external_json/2026-05-17-external-dcard-json-calibration-v0-review-bundle.md`

High-level findings:

- top product families:
  - `伴侶價值觀雷達`
  - `關係紅旗雷達`
  - `親密落差解讀`
- current MVP families:
  - `曖昧溫度計`
  - `下一句怎麼回`
  - combined count: `5`
- broader adjacent family count:
  - `11`

Interpretation:

- current MVP should remain `曖昧溫度計 + 下一句怎麼回`
- broader `Relationship Radar` expansion looks promising after the first MVP

## Validation Results

Commands run:

```bash
python3 -m compileall oradar
python3 -m py_compile scripts/external_dcard_json_calibration.py
python3 -m py_compile scripts/dcard_topic_calibration.py
python3 -m py_compile scripts/dcard_browser_topic_scan.py
python3 -m py_compile scripts/run_product_eval.py
python3 scripts/external_dcard_json_calibration.py --input ai-collaboration/output-0517.jsonl
```

Additional validation:

- `external_dcard_calibration_notes.jsonl` parses and contains `20` rows
- `external_dcard_calibration_summary.json` parses successfully
- privacy minimization check passed

## Known Technical Debt

None introduced.

Remaining limitations are calibration-heuristic quality issues, not implementation debt.

## Deviations From Handoff

- The raw input file was present locally at `ai-collaboration/output-0517.jsonl`, so no fallback path was needed.
- Added `.gitignore` protection for `ai-collaboration/output-*.jsonl` to avoid accidentally committing raw external Dcard inputs.
- Some records appear semantically messy or mixed in the source export, so the bundle should be interpreted as directional calibration rather than clean ground truth.

## Git Commit

Planned commit message:

```text
research: add external Dcard JSON calibration v0
```

The final CLI completion summary includes the actual commit hash after commit creation.

## Remaining Uncertainties

- whether the current rule-based theme mapping is strong enough for noisy or mismatched title/body exports
- whether `親密落差解讀` should stay in the future-family set or be treated as too sensitive for an early paid consumer product
- whether `Relationship Radar general` is too broad and should be broken into more specific families sooner

## Recommended Next Step

Use the review bundle in ChatGPT to decide whether to:

1. keep the first MVP unchanged
2. elevate `關係紅旗雷達` or `伴侶價值觀雷達` into the next product family after `曖昧溫度計`
3. continue future calibration through external JSON and manual curation rather than Dcard automation
