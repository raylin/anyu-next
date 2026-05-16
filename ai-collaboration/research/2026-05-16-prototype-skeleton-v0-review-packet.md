# Prototype Skeleton v0 Review Packet

Date: 2026-05-16

## 1. Overview

This packet summarizes the current fake-door prototype for `曖昧溫度計`.

Prototype commit:

- `502477d`

Prototype path:

- `experiments/ambiguous_temperature_v0/`

Purpose:

- validate the fake-door flow locally
- keep prompt/schema/runtime logic separate from UI
- log events, submissions, and contact captures locally as JSONL
- avoid adding product scope before ChatGPT reviews the implementation shape

This is a local prototype only. It is not a production app or final stack choice.

## 2. Prototype Directory Structure

Relevant files:

```text
experiments/ambiguous_temperature_v0/
  README.md
  __init__.py
  app.py
  contact_capture.py
  event_log.py
  product_runtime.py
  static/
    app.js
    styles.css
  templates/
    index.html

oradar/
  product_runtime.py

scripts/
  generate_product_sample.py

outputs/experiments/ambiguous_temperature_v0/
  .gitkeep
  events.jsonl                # generated locally, git-ignored
  submissions.jsonl           # generated locally, git-ignored
  contact_submissions.jsonl   # generated locally, git-ignored
```

Separation of responsibility:

- `app.py`
  - HTTP server
  - route handling
  - static file serving
  - JSON API responses
- `event_log.py`
  - JSONL appenders
  - output paths
  - event schema envelope
- `contact_capture.py`
  - minimal contact normalization
- `product_runtime.py`
  - experiment constants
  - input normalization
  - submission helpers
  - analysis property helpers
- `oradar/product_runtime.py`
  - canonical product prompt loading
  - canonical product schema loading
  - provider call reuse through `oradar.providers`
  - JSON parsing and schema validation
  - share-card privacy validation
- `scripts/generate_product_sample.py`
  - sample generator now reuses `oradar/product_runtime.py`

## 3. How To Run

From the repository root:

```bash
python3 experiments/ambiguous_temperature_v0/app.py
```

Default local URL:

```text
http://127.0.0.1:8010
```

Optional arguments:

```bash
python3 experiments/ambiguous_temperature_v0/app.py --host 127.0.0.1 --port 8010
```

Recommended environment for live generation:

```text
ORADAR_PROVIDER=anthropic
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

## 4. UI Flow

Current client flow:

1. Page loads and logs `page_view`.
2. User selects a situation type:
   - `已讀不回`
   - `忽冷忽熱`
   - `回訊變慢但看限動`
   - `不確定 / 跳過`
3. User starts typing and logs `input_started` once.
4. User submits text with `分析我的曖昧溫度`.
5. Client calls `/api/analyze`.
6. Server logs submission data locally, logs `input_submitted`, runs product runtime analysis, and logs `analysis_completed`.
7. UI renders:
   - free result
   - insight layer
   - share card preview
   - paid preview
8. User can click the share card, which logs `share_card_clicked`.
9. User clicks fake paid CTA `解鎖下一句怎麼回 — NT$49`.
10. Client logs `paid_unlock_clicked`.
11. Contact form is shown with:
    - `目前正在內測。留下 LINE 或 Email，我們會人工送你一次完整分析。`
    - `這次不會真的收費。`
12. User submits LINE or email through `/api/contact`.
13. Server logs `contact_submitted` and appends a local contact submission record.

## 5. API Routes

### `GET /`

Purpose:

- serve the prototype HTML page
- inject runtime config for the frontend

Input:

- no request body

Output:

- HTML document

### `GET /health`

Purpose:

- simple health check

Input:

- no request body

Output shape:

```json
{
  "status": "ok"
}
```

### `POST /api/events`

Purpose:

- append one event record to local JSONL

Input shape:

```json
{
  "event_name": "page_view | situation_selected | input_started | input_submitted | analysis_completed | paid_unlock_clicked | contact_submitted | share_card_clicked",
  "session_id": "string",
  "variant": "B",
  "properties": {}
}
```

Output shape:

```json
{
  "event": {
    "event_name": "",
    "timestamp": "",
    "experiment_id": "ambiguous-temperature-fake-door-v0",
    "session_id": "",
    "variant": "B",
    "properties": {}
  }
}
```

### `POST /api/analyze`

Purpose:

- log one submission
- run product runtime generation
- return the generated product result plus a summary block used by the client

Input shape:

```json
{
  "session_id": "string",
  "variant": "B",
  "situation_type": "已讀不回 | 忽冷忽熱 | 回訊變慢但看限動 | 不確定 / 跳過",
  "input_text": "string"
}
```

Output shape:

```json
{
  "result": {
    "free_result": {},
    "insight_layer": {},
    "paid_preview": {},
    "paid_result": {},
    "share_card": {},
    "personal_pattern_candidate": {},
    "metadata": {}
  },
  "summary": {
    "situation_type": "",
    "input_length": 0,
    "input_length_bucket": "",
    "has_conversation_snippet": true,
    "state_label": "",
    "temperature_score": 0,
    "temperature_band": "",
    "price": "NT$49"
  }
}
```

Error shape:

```json
{
  "error": "string"
}
```

### `POST /api/contact`

Purpose:

- append one contact submission
- log `contact_submitted`

Input shape:

```json
{
  "session_id": "string",
  "variant": "B",
  "contact_type": "line | email",
  "contact_value": "string",
  "situation_type": "string",
  "state_label": "string",
  "temperature_score": 0
}
```

Output shape:

```json
{
  "message": "目前正在內測。留下 LINE 或 Email，我們會人工送你一次完整分析。",
  "recorded": true
}
```

Error shape:

```json
{
  "error": "string"
}
```

## 6. Product Runtime Integration

The prototype uses the product runtime path only.

Canonical files:

- `prompts/product_result_prompt_v0.md`
- `schemas/product_result_schema_v0.json`
- `oradar/product_runtime.py`

Integration path:

1. `experiments/ambiguous_temperature_v0/app.py` receives `/api/analyze`.
2. `experiments/ambiguous_temperature_v0/product_runtime.py` normalizes situation type, variant, and input metadata.
3. `oradar/product_runtime.py`:
   - loads `prompts/product_result_prompt_v0.md`
   - injects `{{RAW_CONTENT}}` and `{{SOURCE_METADATA}}`
   - loads `schemas/product_result_schema_v0.json`
   - calls the configured provider through `oradar.providers.call_provider`
   - parses JSON output
   - validates the result against the product schema
   - validates that `share_card` does not include raw input text
4. the validated result is returned to the prototype API

Important boundary:

- the prototype does not use `prompts/extraction_prompt_v1.md`
- the prototype does not use `schemas/signal_schema_v1.json`

Reuse note:

- `scripts/generate_product_sample.py` also uses `oradar/product_runtime.py`, so the prototype and sample generator share the same product-generation path instead of duplicating provider logic

## 7. Event Logging Schema

Event log path:

- `outputs/experiments/ambiguous_temperature_v0/events.jsonl`

Exact JSON shape:

```json
{
  "event_name": "",
  "timestamp": "",
  "experiment_id": "ambiguous-temperature-fake-door-v0",
  "session_id": "",
  "variant": "B",
  "properties": {}
}
```

Synthetic `page_view` example:

```json
{
  "event_name": "page_view",
  "timestamp": "2026-05-16T13:30:00+00:00",
  "experiment_id": "ambiguous-temperature-fake-door-v0",
  "session_id": "demo-session-001",
  "variant": "B",
  "properties": {
    "entry_point": "prototype",
    "variant": "B"
  }
}
```

Synthetic `input_submitted` example:

```json
{
  "event_name": "input_submitted",
  "timestamp": "2026-05-16T13:31:00+00:00",
  "experiment_id": "ambiguous-temperature-fake-door-v0",
  "session_id": "demo-session-001",
  "variant": "B",
  "properties": {
    "situation_type": "已讀不回",
    "input_length": 72,
    "input_length_bucket": "41-80",
    "has_conversation_snippet": true
  }
}
```

Synthetic `analysis_completed` example:

```json
{
  "event_name": "analysis_completed",
  "timestamp": "2026-05-16T13:31:05+00:00",
  "experiment_id": "ambiguous-temperature-fake-door-v0",
  "session_id": "demo-session-001",
  "variant": "B",
  "properties": {
    "situation_type": "已讀不回",
    "input_length": 72,
    "input_length_bucket": "41-80",
    "has_conversation_snippet": true,
    "state_label": "降溫觀望",
    "temperature_score": 35,
    "temperature_band": "21-40",
    "price": "NT$49"
  }
}
```

Synthetic `paid_unlock_clicked` example:

```json
{
  "event_name": "paid_unlock_clicked",
  "timestamp": "2026-05-16T13:31:12+00:00",
  "experiment_id": "ambiguous-temperature-fake-door-v0",
  "session_id": "demo-session-001",
  "variant": "B",
  "properties": {
    "situation_type": "已讀不回",
    "state_label": "降溫觀望",
    "temperature_score": 35,
    "price": "NT$49"
  }
}
```

Synthetic `contact_submitted` example:

```json
{
  "event_name": "contact_submitted",
  "timestamp": "2026-05-16T13:31:30+00:00",
  "experiment_id": "ambiguous-temperature-fake-door-v0",
  "session_id": "demo-session-001",
  "variant": "B",
  "properties": {
    "contact_type": "email",
    "situation_type": "已讀不回",
    "state_label": "降溫觀望",
    "temperature_score": 35,
    "temperature_band": "21-40"
  }
}
```

## 8. Submission Logging Schema

Submission log path:

- `outputs/experiments/ambiguous_temperature_v0/submissions.jsonl`

Exact JSON shape:

```json
{
  "timestamp": "",
  "session_id": "",
  "variant": "B",
  "situation_type": "",
  "input_text": "",
  "input_length": 0,
  "input_length_bucket": "",
  "has_conversation_snippet": true
}
```

Synthetic example:

```json
{
  "timestamp": "2026-05-16T13:31:00+00:00",
  "session_id": "demo-session-001",
  "variant": "B",
  "situation_type": "已讀不回",
  "input_text": "我昨天問他週末要不要見面，他已讀後沒回，但晚上還在發限動。",
  "input_length": 33,
  "input_length_bucket": "1-40",
  "has_conversation_snippet": false
}
```

## 9. Contact Capture Schema

Contact log path:

- `outputs/experiments/ambiguous_temperature_v0/contact_submissions.jsonl`

Exact JSON shape:

```json
{
  "timestamp": "",
  "session_id": "",
  "contact_type": "line | email",
  "contact_value": "",
  "situation_type": "",
  "state_label": "",
  "temperature_score": 0
}
```

Synthetic example:

```json
{
  "timestamp": "2026-05-16T13:31:30+00:00",
  "session_id": "demo-session-001",
  "contact_type": "email",
  "contact_value": "example@example.com",
  "situation_type": "已讀不回",
  "state_label": "降溫觀望",
  "temperature_score": 35
}
```

Alternative safe example:

```json
{
  "timestamp": "2026-05-16T13:31:30+00:00",
  "session_id": "demo-session-002",
  "contact_type": "line",
  "contact_value": "@example_line_id",
  "situation_type": "忽冷忽熱",
  "state_label": "溫差劇烈",
  "temperature_score": 52
}
```

## 10. Generated / Ignored Files

Generated local files:

- `outputs/experiments/ambiguous_temperature_v0/events.jsonl`
- `outputs/experiments/ambiguous_temperature_v0/submissions.jsonl`
- `outputs/experiments/ambiguous_temperature_v0/contact_submissions.jsonl`

Tracked placeholder:

- `outputs/experiments/ambiguous_temperature_v0/.gitkeep`

Git ignore rule:

```text
outputs/experiments/**/*.jsonl
```

Meaning:

- the output directory exists in git
- real logs, input text, and contact captures are not committed by default

## 11. Privacy Handling

Privacy handling currently includes:

- UI helper text warning users not to paste names, phone numbers, addresses, or other identifying information
- local-only JSONL storage rather than third-party analytics or database storage
- git ignore protection for experiment JSONL output files
- share-card privacy validation in `oradar/product_runtime.py`, which rejects outputs that include the raw input text in `share_card`

Privacy caveat:

- submissions still store raw input text locally for this prototype
- contact submissions still store raw contact values locally for this prototype
- this is acceptable for local-only v0, but should not be treated as production-ready privacy handling

## 12. Technical Debt Review

1. Is UI rendering separated from product runtime logic?

Yes.

- UI rendering lives in `templates/index.html`, `static/app.js`, and `static/styles.css`
- runtime generation lives in `oradar/product_runtime.py`
- experiment-specific input and summary helpers live in `experiments/ambiguous_temperature_v0/product_runtime.py`

2. Is event logging separated from API routing?

Yes.

- `app.py` handles routes
- `event_log.py` owns JSONL append behavior and output paths

3. Are local JSONL outputs git-ignored?

Yes.

- `.gitignore` contains `outputs/experiments/**/*.jsonl`

4. Are prompts and schemas loaded from canonical files?

Yes.

- prompt: `prompts/product_result_prompt_v0.md`
- schema: `schemas/product_result_schema_v0.json`
- the prototype does not duplicate either artifact in UI code

5. Is there any duplicated provider logic?

No known duplicated provider logic in the prototype path.

- `oradar/product_runtime.py` delegates provider calls to `oradar.providers.call_provider`
- `scripts/generate_product_sample.py` reuses `oradar/product_runtime.py`

6. Are there any known hacks that should be cleaned before real user testing?

No explicit known technical debt was documented in the implementation report.

Review caveats still worth discussing before real user testing:

- the server is intentionally local-only and standard-library based
- the `has_conversation_snippet` heuristic is intentionally simple
- there is no aggregate analysis view over the JSONL logs

## 13. Known Limitations

- local-only server
- no real payment
- no login
- no analytics SaaS
- no database
- no production deployment
- no abuse prevention
- no screenshot upload
- no OCR
- no admin dashboard
- no aggregate reporting UI over experiment logs
- simple `has_conversation_snippet` heuristic
- shallow contact validation for v0
- runtime generation depends on configured provider credentials

## 14. Questions For ChatGPT Review

1. Is the current separation between `app.py`, `event_log.py`, experiment helpers, and `oradar/product_runtime.py` the right level of modularity for a local prototype, or should anything be simplified before iteration continues?
2. Is the local JSONL event/submission/contact schema sufficient for reviewing experiment outcomes later, or are there important fields missing for fake-door analysis?
3. Is the standard-library HTTP server the right interim implementation shape, or should the next iteration move to a slightly more structured local stack before any real user testing?
