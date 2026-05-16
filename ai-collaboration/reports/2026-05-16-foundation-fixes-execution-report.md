# Foundation Fixes Execution Report

## Summary

Applied the approved foundation decisions before Signal Extraction v1. This task updated documentation, operating rules, schema metadata, prompt guidance, taxonomy scoring guidance, and persistent memory conventions.

No Signal Extraction v1 implementation was added.

## Files Updated

- `AGENTS.md`
- `WORKING_AGREEMENT.md`
- `README.md`
- `schemas/signal_schema_v1.json`
- `prompts/extraction_prompt_v1.md`
- `schemas/emotion_taxonomy_v1.md`
- `summary_log.md`
- `ai-collaboration/summaries/summary_log.md`
- `templates/handoff_template.md`

Additional governance files created:

- `ai-collaboration/handoffs/2026-05-16-foundation-fixes-before-signal-extraction-v1-handoff.md`
- `ai-collaboration/decisions/2026-05-16-foundation-fixes-decision-log.md`
- `ai-collaboration/reports/2026-05-16-foundation-fixes-execution-report.md`

## Decisions Applied

- Canonical summary log path is now `ai-collaboration/summaries/summary_log.md`.
- Root `summary_log.md` is marked deprecated and should not receive future entries.
- Signal Extraction v1 output boundary is `1 raw input file -> 1 structured signal JSON object`.
- Multiple signal records per raw input are out of scope for v1.
- Allowed v1 source types are `manual_paste`, `dcard_manual`, and `reddit_manual`.
- Scraping and automatic collection remain out of scope.
- Scoring fields now use integer values from 0 to 10.
- Scoring is documented as directional and qualitative, not statistically precise.

## Schema Changes

Updated `schemas/signal_schema_v1.json` to reflect approved v1 decisions:

- Schema description now states the v1 one-input-to-one-object boundary.
- `platform` is now constrained to `manual_paste`, `dcard_manual`, or `reddit_manual`.
- `emotion_intensity` maximum changed from `5` to `10`.
- `shareability_score` maximum changed from `5` to `10`.
- `monetization_score` maximum changed from `5` to `10`.
- `retention_score` maximum changed from `5` to `10`.
- Score descriptions now state that scoring is directional and qualitative.

No new schema fields were added.

## Prompt Changes

Updated `prompts/extraction_prompt_v1.md` to reflect approved v1 decisions:

- Added the v1 output boundary: `1 raw input file -> 1 structured signal JSON object`.
- Instructed the model not to return multiple signal records for one raw input.
- Instructed the model to extract the strongest single opportunity signal if multiple signals appear.
- Added allowed v1 source types.
- Updated score guidance from 0-5 to 0-10.
- Added the approved score interpretation bands.
- Instructed the model to use only an allowed v1 source type in `platform`.

## Remaining Uncertainties

- Exact source formatting conventions for raw input files are not yet defined.
- The first manually curated sample set has not been selected.
- Score calibration still needs to be tested against real examples.
- Taiwan-specific interpretation may need future schema or prompt changes after sample testing.

## Readiness for Signal Extraction v1

Signal Extraction v1 is ready to proceed from a foundation perspective.

The repository now has:

- a canonical summary log path
- a clear one-input-to-one-output boundary
- explicit v1 source boundaries
- updated 0-10 scoring rules
- a valid JSON schema aligned with these decisions
- prompt guidance aligned with these decisions

## Recommended Next Step

Implement the narrow local Signal Extraction v1 workflow:

```text
raw text file
-> LLM extraction using prompts/extraction_prompt_v1.md
-> validate against schemas/signal_schema_v1.json
-> save one structured JSON object locally under outputs/structured/
```

Keep the implementation minimal and do not add scraping, UI, dashboards, databases, auth, vector DBs, or cloud infrastructure.
