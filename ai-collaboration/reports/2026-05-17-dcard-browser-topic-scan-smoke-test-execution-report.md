# Dcard Browser Topic Scan Smoke Test Execution Report

## Summary

Ran a real smoke test for `scripts/dcard_browser_topic_scan.py`.

Outcome:

- Playwright was installed into a local virtualenv
- Chromium was downloaded into a local repo-scoped browser cache
- the browser scan launched successfully
- Dcard returned a Cloudflare block page at the relationship board before any article discovery

## Files Created

- `ai-collaboration/handoffs/2026-05-17-dcard-browser-topic-scan-smoke-test-handoff.md`
- `ai-collaboration/reports/2026-05-17-dcard-browser-topic-scan-smoke-test-execution-report.md`

## Files Updated

- `scripts/dcard_browser_topic_scan.py`
- `ai-collaboration/research/dcard_calibration/2026-05-17-dcard-browser-topic-scan-review-bundle.md`
- `ai-collaboration/summaries/summary_log.md`

Deliberately excluded from this task's commit:

- `ai-collaboration/research/dcard_calibration/dcard_urls.txt`
- `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_notes.jsonl`
- local runtime directories `.venv/` and `.playwright-browsers/`

## Implementation Approach

Used the existing minimal Playwright script and performed the smallest live run:

```bash
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers .venv/bin/python scripts/dcard_browser_topic_scan.py --max-posts 5 --max-comments 3
```

Also tightened the script's block detection after the first runtime diagnostic revealed a Cloudflare page the original heuristic did not recognize.

## Dependency Notes

Installed locally inside the repository:

- Python package: `playwright`
- browser runtime: Chromium for Playwright

Installation path choices:

- Python package: `.venv/`
- browser binaries: `.playwright-browsers/`

This avoided modifying system Python or project dependency metadata.

## Run Results

Initial smoke-test blocker:

- Chromium could not launch inside the sandbox due a browser-permission restriction

Follow-up with local browser launch allowed:

- browser launched
- board page opened
- Dcard immediately returned a Cloudflare block page

Observed browser-page signals:

- title: `Attention Required! | Cloudflare`
- body included:
  - `Sorry, you have been blocked`
  - `You are unable to access dcard.tw`

Final script result after block-detection update:

- URLs discovered: `0`
- articles processed: `0`
- success count: `0`
- blocked count: `0` at article level because the board page blocked before discovery
- failed count: `0`
- output file created successfully

## Data Collected

- no article URLs collected
- no article snippets collected
- no comment snippets collected
- no topic distribution available

## Comment Handling

The script still supports:

- up to `--max-comments 3`
- visible comments only
- no pagination
- no thread expansion
- no usernames

No comment handling occurred in the smoke test because no article pages were reached.

## Privacy Handling

Maintained the original guardrails:

- no login
- no cookie reuse from a human profile
- no proxying
- no anti-bot bypass
- no raw post archiving
- no identity extraction

The smoke test stopped at the board-level access wall.

## Validation Results

Commands run:

```bash
python3 -m py_compile scripts/dcard_browser_topic_scan.py
.venv/bin/python -m pip install playwright
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers .venv/bin/python -m playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers .venv/bin/python scripts/dcard_browser_topic_scan.py --max-posts 5 --max-comments 3
```

Additional diagnostic run:

- confirmed the page title and body text were Cloudflare block content

## Known Technical Debt

None introduced.

The main constraint is platform blocking, not implementation debt.

## Deviations From Handoff

- the smoke test required local dependency setup because Playwright was not installed
- the smoke test exposed a Cloudflare block page, so no topic data could be collected
- the script was updated within the task to recognize the actual block page observed at runtime

## Git Commit

Planned commit message:

```text
research: add Dcard browser topic scan smoke test
```

The final CLI completion summary includes the actual commit hash after commit creation.

## Remaining Uncertainties

- whether the block is environment-specific or a stable response to automated browser traffic
- whether manual browser observation should replace browser automation for Dcard calibration
- whether keeping the browser script is still worthwhile as a diagnostic tool only

## Recommended Next Step

Pivot Dcard calibration toward manual browser reading plus manual note entry unless there is a strong reason to keep testing automated browser access.
