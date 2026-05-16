# Prototype Skeleton v0 Execution Report

## Summary

Built a local-first prototype skeleton for the `曖昧溫度計` fake-door flow under `experiments/ambiguous_temperature_v0/`.

The prototype uses a Python standard-library web server, shared product runtime generation, local JSONL logging, and a small static UI. It reuses the existing product prompt and schema without mixing prompt logic into the frontend.

## Files Created

- `ai-collaboration/handoffs/2026-05-16-prototype-skeleton-v0-handoff.md`
- `ai-collaboration/reports/2026-05-16-prototype-skeleton-v0-execution-report.md`
- `experiments/__init__.py`
- `experiments/ambiguous_temperature_v0/__init__.py`
- `experiments/ambiguous_temperature_v0/app.py`
- `experiments/ambiguous_temperature_v0/contact_capture.py`
- `experiments/ambiguous_temperature_v0/event_log.py`
- `experiments/ambiguous_temperature_v0/product_runtime.py`
- `experiments/ambiguous_temperature_v0/README.md`
- `experiments/ambiguous_temperature_v0/static/app.js`
- `experiments/ambiguous_temperature_v0/static/styles.css`
- `experiments/ambiguous_temperature_v0/templates/index.html`
- `oradar/product_runtime.py`
- `outputs/experiments/ambiguous_temperature_v0/.gitkeep`

## Files Updated

- `.gitignore`
- `scripts/generate_product_sample.py`
- `ai-collaboration/summaries/summary_log.md`

## Implementation Approach

Chose a small standard-library HTTP prototype instead of adding FastAPI or a frontend build system.

Reasons:

- keeps dependencies at zero
- matches the local-first requirement
- is enough for the fake-door flow
- avoids adding framework complexity before the experiment is validated

Structure:

- `oradar/product_runtime.py`
  - shared product prompt loading
  - provider call reuse through `oradar.providers`
  - product result schema validation
  - share-card privacy validation
- `experiments/ambiguous_temperature_v0/product_runtime.py`
  - experiment constants
  - situation normalization
  - input buckets
  - experiment-specific submission and analysis properties
- `experiments/ambiguous_temperature_v0/event_log.py`
  - reusable JSONL appenders for events, submissions, and contacts
- `experiments/ambiguous_temperature_v0/contact_capture.py`
  - minimal contact normalization and record creation
- `experiments/ambiguous_temperature_v0/app.py`
  - small JSON API and static file serving

## Prototype Flow

Implemented flow:

1. user opens the local page
2. client logs `page_view`
3. user selects situation type and starts typing
4. client logs `situation_selected` and `input_started`
5. user submits input
6. server logs submission data locally
7. server logs `input_submitted`
8. server calls shared product runtime generation using:
   - `prompts/product_result_prompt_v0.md`
   - `schemas/product_result_schema_v0.json`
9. server logs `analysis_completed`
10. UI renders:
   - `free_result`
   - `insight_layer`
   - `share_card`
   - `paid_preview`
11. fake paid CTA click logs `paid_unlock_clicked`
12. contact form is shown with:
   - internal-test message
   - `這次不會真的收費。`
13. contact submit logs `contact_submitted` and appends a contact record locally

## Event Logging

Event log path:

- `outputs/experiments/ambiguous_temperature_v0/events.jsonl`

Implemented events:

- `page_view`
- `situation_selected`
- `input_started`
- `input_submitted`
- `analysis_completed`
- `paid_unlock_clicked`
- `contact_submitted`
- `share_card_clicked`

Each event record includes:

- `event_name`
- `timestamp`
- `experiment_id`
- `session_id`
- `variant`
- `properties`

Useful properties included where applicable:

- `situation_type`
- `input_length`
- `input_length_bucket`
- `has_conversation_snippet`
- `state_label`
- `temperature_score`
- `temperature_band`
- `price`
- `contact_type`

## Submission / Contact Logging

Submission log path:

- `outputs/experiments/ambiguous_temperature_v0/submissions.jsonl`

Contact log path:

- `outputs/experiments/ambiguous_temperature_v0/contact_submissions.jsonl`

Submission records include:

- timestamp
- session id
- variant
- situation type
- input text
- input length
- input length bucket
- conversation-snippet heuristic

Contact records include:

- timestamp
- session id
- contact type
- contact value
- situation type
- state label
- temperature score

## Privacy Handling

- Added UI helper text warning users not to paste names, phone numbers, addresses, or other identifying information.
- Added prototype README warning that local submissions may contain sensitive user text and contact data.
- Added `.gitignore` rule for `outputs/experiments/**/*.jsonl`.
- Kept directory structure with `.gitkeep` so the output area exists without committing generated logs.
- Share-card display does not expose raw conversation text and still depends on runtime-side validation.

## Validation Results

Validation commands:

```bash
python3 -m compileall oradar
python3 -m py_compile experiments/ambiguous_temperature_v0/*.py
python3 -m py_compile scripts/generate_product_sample.py
```

Results:

- all three commands passed
- prototype server started locally
- `/health` returned `{"status": "ok"}`
- HTML smoke test confirmed the headline, privacy copy, and fake paid CTA were present
- live Anthropic-backed analyze request succeeded through `/api/analyze`
- fake-door contact submission succeeded through `/api/contact`

Smoke test notes:

- local server required escalated permission to bind and to receive local HTTP requests from the test shell
- smoke-test logs were written to ignored JSONL files under `outputs/experiments/ambiguous_temperature_v0/`

## Known Technical Debt

None.

## Deviations From Handoff

- Product runtime reuse was implemented by extracting shared code into `oradar/product_runtime.py`, then updating `scripts/generate_product_sample.py` to use that module. This keeps the prototype and sample generator on one generation path.
- OpenAI-backed product runtime calls are supported through the shared provider helper, but live smoke testing was only performed with Anthropic-backed runtime generation.
- Execution artifacts cannot contain the final commit hash before the commit exists without changing that hash. The final CLI completion summary is the authoritative location for the actual hash.

## Git Commit

Planned commit message:

```text
feat: add ambiguous temperature fake-door prototype skeleton
```

Commit hash is added after staging and commit creation. The final CLI completion summary will include the actual hash.

## Remaining Uncertainties

- The current UI is intentionally thin and uninstrumented beyond JSONL logs; future analysis views are still out of scope.
- The conversation-snippet heuristic is simple and may need adjustment after real usage.
- OpenAI-backed runtime behavior was not live-tested in this task.

## Recommended Next Step

Have ChatGPT review the prototype skeleton, especially the experiment flow, local log shape, and whether the standard-library server is the right interim level of complexity before any prototype polish or stack recalibration.
