# Oradar Topic Tool Extraction Plan v0 Execution Report

## Summary

Completed a planning-only extraction assessment for `oradar/` and adjacent Dcard/topic-calibration scripts. The main outcome is that `oradar/` is mostly reusable Python extraction plumbing, while the Dcard / Cloudflare-blocked acquisition layer lives mainly in `scripts/`. The strongest future extraction candidate is the structured-input transformation logic in `scripts/external_dcard_json_calibration.py`.

## Files Created

- `ai-collaboration/handoffs/2026-05-21-oradar-topic-tool-extraction-plan-v0-handoff.md`
- `ai-collaboration/research/2026-05-21-oradar-topic-tool-extraction-plan-v0.md`
- `ai-collaboration/reports/2026-05-21-oradar-topic-tool-extraction-plan-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Inventory Coverage

Reviewed:

- all tracked `oradar/` source files
- all adjacent tracked `scripts/` files
- relevant historical Dcard calibration artifacts under `ai-collaboration/research/dcard_calibration/`
- prior cleanup and audit artifacts

## Key Classifications

- `oradar/extractor.py`, `config.py`, `schema.py`, `providers.py`, and `cli.py`: reusable ingestion/tooling candidates
- `oradar/product_runtime.py`: historical Python-side product runtime helper
- `scripts/dcard_browser_topic_scan.py` and `scripts/dcard_topic_calibration.py`: legacy Dcard acquisition paths
- `scripts/external_dcard_json_calibration.py`: strongest current source-agnostic topic/tool extraction candidate

## Proposed Extraction Plan

- future home: `tools/topic-ingestion/`
- language: Python first
- extraction source: begin with `scripts/external_dcard_json_calibration.py`
- keep Dcard/browser acquisition logic out of the extracted tool
- leave historical Python product-runtime helpers untouched during the first extraction pass

## Raw / Fixture Safety Findings

- `oradar/` itself contains no dedicated fixture directory and no raw text fixtures
- remaining relevant calibration `.jsonl` lives under `ai-collaboration/research/dcard_calibration/` and should be treated as historical evidence, not automatically as canonical test fixtures

## Validation Results

- planning/inventory task only; no runtime, schema, or app behavior change was made
- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Known Technical Debt

- `oradar/` still mixes reusable extraction infrastructure with historical Python-side product runtime support
- Dcard/topic-calibration heuristics are spread between multiple one-off scripts instead of a clearly extracted tool boundary

## Tech Debt Review

### New Technical Debt Introduced

- none

### Existing Technical Debt Observed

- source-agnostic topic-ingestion logic is not yet separated from Dcard-specific calibration history
- no dedicated fixtures/tests package exists yet for future topic-ingestion tooling

### Opportunistic Cleanup Completed

- none, this task intentionally stayed planning-only

### Deferred Cleanup Candidates

- extract reusable normalization/topic/question logic from `scripts/external_dcard_json_calibration.py`
- later archive Dcard acquisition scripts and historical Python product-runtime helpers if no longer needed

### Recommended Follow-up

- run `Extract Topic Ingestion Tools v0`

## Deviations From Handoff

- none

## Git Commit

- pending at report-write time

## Staging Push

- pending at report-write time

## Remaining Uncertainties

- whether the future topic-ingestion path should remain heuristic-first or include optional provider-assisted enrichment
- whether the repo wants to keep topic-ingestion in the main workspace long-term or later isolate it further

## Recommended Next Step

- `Extract Topic Ingestion Tools v0`
