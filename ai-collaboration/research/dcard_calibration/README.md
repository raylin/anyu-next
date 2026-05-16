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
- `2026-05-16-dcard-topic-calibration-v0-review-bundle.md`
  - current review bundle

## How To Run

Default run:

```bash
python3 scripts/dcard_topic_calibration.py
```

The script reads:

```text
ai-collaboration/research/dcard_calibration/dcard_urls.txt
```

And writes:

```text
ai-collaboration/research/dcard_calibration/dcard_topic_calibration_notes.jsonl
```

If no URLs are present, the script exits cleanly, prints a clear message, and creates an empty JSONL output file.

## Current Limitations

- This is topic calibration only.
- It does not log in, bypass restrictions, or crawl at scale.
- It only stores lightweight metadata and summarized notes.
- Default behavior does not use an LLM for structuring.
- If Dcard blocks normal HTTP access, the workflow records that and leaves the item for manual note entry later.
