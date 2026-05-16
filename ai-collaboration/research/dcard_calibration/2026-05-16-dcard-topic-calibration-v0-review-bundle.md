# Dcard Topic Calibration v0 Review Bundle

No real Dcard URLs were provided yet. Calibration workflow is ready, but topic findings are pending.

## 1. Overview

This bundle documents the readiness of the semi-automated Dcard topic calibration workflow for `曖昧溫度計`.

Current product focus to validate:

1. `已讀不回`
2. `忽冷忽熱`
3. `回訊變慢但看限動`

## 2. Collection Method

The workflow is intentionally lightweight:

- human supplies one public Dcard URL per line
- script attempts a normal HTTP fetch only
- workflow stores summarized notes, not full raw posts
- blocked or thin pages are marked `failed` or `manual_needed`

## 3. URLs Processed

- `0`

Input file:

- `ai-collaboration/research/dcard_calibration/dcard_urls.txt`

## 4. Fetch Results

- no URLs were available to process
- no HTTP fetches were attempted
- `dcard_topic_calibration_notes.jsonl` is currently empty

## 5. Theme Distribution

Pending real URL input.

## 6. Action Pressure Patterns

Pending real URL input.

## 7. Social Signal Patterns

Pending real URL input.

## 8. Product Mapping

Pending real URL input.

## 9. Landing Hook Candidates

Pending real URL input.

## 10. Potential MVP Adjustments

No adjustment recommendation yet.

The workflow is ready to test whether any of these should change:

- current three primary situation types
- landing hook `他是真的忙，還是其實在冷掉？`
- whether a fourth situation type is needed
- whether `社群微訊號` should become a broader category

## 11. Data Quality / Limitations

- no real Dcard topic findings yet
- normal HTTP access may fail for some public pages
- default workflow stores only lightweight metadata and summarized notes
- no login, proxying, anti-bot bypass, or large-scale crawling is included

## 12. Issues For ChatGPT Review

1. Is the current lightweight URL-file-plus-JSONL workflow the right pre-stack-selection level of complexity?
2. When real URLs are added, should the note schema capture one more field for monetization strength, or is current `product_mapping` sufficient?
3. Should future calibration stay summary-only, or allow short manually approved snippets when public metadata is too thin?
