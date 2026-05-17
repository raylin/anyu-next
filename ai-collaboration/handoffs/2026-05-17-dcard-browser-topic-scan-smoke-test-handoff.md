# Handoff: Dcard Browser Topic Scan Smoke Test

Date: 2026-05-17

Project: Opportunity Radar

## Objective

Run a real smoke test for `scripts/dcard_browser_topic_scan.py`.

## Scope

This task should:

1. install the minimal Playwright dependency if approved and needed
2. run the browser topic scan with a small configuration
3. capture the observed result
4. create an execution report
5. append the summary log
6. commit the smoke-test task artifacts

## Repo-State Note

Pre-existing uncommitted files before this task:

- `ai-collaboration/research/dcard_calibration/dcard_urls.txt`
- `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_notes.jsonl`

These are treated as user-owned changes and should remain isolated from this smoke-test commit unless explicitly requested otherwise.

## Environment Note

Current environment check:

- Playwright Python package: not installed

## Planned Smoke Test

```bash
python3 scripts/dcard_browser_topic_scan.py --max-posts 5 --max-comments 3
```
