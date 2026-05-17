# Dcard Topic Calibration

This folder is for topic calibration only. It is not a production scraper and not a bulk-ingestion pipeline.

## Purpose

Use this workflow to check whether the current `曖昧溫度計` product direction matches real public Dcard relationship-topic signals.

Current focus:

- `已讀不回`
- `忽冷忽熱`
- `回訊變慢但看限動`

## Collection Method

This workflow is semi-automated:

1. the human pastes one public Dcard URL per line into `dcard_urls.txt`
2. `scripts/dcard_topic_calibration.py` attempts a normal public HTTP fetch
3. the script stores summarized calibration notes in JSONL
4. if fetches fail or metadata is too thin, the note is left partial and marked for manual follow-up

## Privacy Handling

- Do not collect personal data.
- Do not store names, usernames, phone numbers, addresses, or identifying details.
- Prefer summarized notes over full raw post text.
- Do not commit sensitive raw content.
- Do not bypass login, anti-bot protections, or platform restrictions.
- Use only public content or manually supplied public URLs or snippets.

## Files

- `dcard_urls.txt`
  - one public Dcard URL per line
  - `#` comments are ignored
- `dcard_topic_calibration_schema.json`
  - structured note schema
- `dcard_topic_calibration_template.md`
  - manual note template
- `dcard_topic_calibration_notes.jsonl`
  - generated summarized notes from the script
- `dcard_browser_topic_scan_notes.jsonl`
  - generated notes from the minimal Playwright browser scan
- `external_json/`
  - privacy-minimized notes, summary JSON, and review bundle generated from externally collected Dcard-like JSON
- `2026-05-16-dcard-topic-calibration-v0-review-bundle.md`
  - current review bundle
- `2026-05-17-dcard-browser-topic-scan-review-bundle.md`
  - current browser-scan review bundle

## How To Run

Default run:

```bash
python3 scripts/dcard_topic_calibration.py
```

Browser-assisted scan:

```bash
python3 scripts/dcard_browser_topic_scan.py --max-posts 10 --max-comments 3
```

External JSON calibration:

```bash
python3 scripts/external_dcard_json_calibration.py --input ai-collaboration/output-0517.jsonl
```

Manual setup for the browser script:

```bash
python3 -m pip install playwright
python3 -m playwright install chromium
```

The script reads:

```text
ai-collaboration/research/dcard_calibration/dcard_urls.txt
```

And writes:

```text
ai-collaboration/research/dcard_calibration/dcard_topic_calibration_notes.jsonl
```

The external JSON calibration writes:

```text
ai-collaboration/research/dcard_calibration/external_json/external_dcard_calibration_notes.jsonl
ai-collaboration/research/dcard_calibration/external_json/external_dcard_calibration_summary.json
ai-collaboration/research/dcard_calibration/external_json/2026-05-17-external-dcard-json-calibration-v0-review-bundle.md
```

If no URLs are present, the script exits cleanly, prints a clear message, and creates an empty JSONL output file.

## Current Limitations

- This is topic calibration only.
- It does not log in, bypass restrictions, or crawl at scale.
- It only stores lightweight metadata and summarized notes.
- Default behavior does not use an LLM for structuring.
- If Dcard blocks normal HTTP access, the workflow records that and leaves the item for manual note entry later.
- The browser scan depends on a manual Playwright + Chromium setup and may still hit a browser-visible access wall.
- External JSON calibration is currently the preferred path when Dcard automation is blocked.
- External raw JSON inputs may contain real content and should stay uncommitted; only the minimized calibration outputs should be reviewed or committed.
