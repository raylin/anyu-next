# Foundation Fixes Before Signal Extraction v1 Handoff

## Date

2026-05-16

## Task

Apply approved foundation decisions before implementing Signal Extraction v1.

## Context

This is documentation and operating-rules work only. Signal Extraction v1 must not be implemented in this task.

## Decisions to Apply

- Canonical summary log path is `ai-collaboration/summaries/summary_log.md`.
- Root `summary_log.md` is deprecated.
- Signal Extraction v1 uses one raw input file to one structured signal JSON object.
- Signal Extraction v1 supports only manual or semi-manual source types: `manual_paste`, `dcard_manual`, `reddit_manual`.
- Scoring fields use integer values from 0 to 10.

## Relevant Files

- `AGENTS.md`
- `WORKING_AGREEMENT.md`
- `README.md`
- `schemas/signal_schema_v1.json`
- `prompts/extraction_prompt_v1.md`
- `schemas/emotion_taxonomy_v1.md`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Do not add scraping, UI, dashboard, database, vector DB, cloud infrastructure, auth, production app code, or Signal Extraction v1 implementation.
- Do not change the overall repository architecture.
- Document schema changes clearly in the execution report.

## Planned Work

1. Update operating docs with canonical summary log path.
2. Update schema scoring ranges and v1 source/output-boundary descriptions.
3. Update prompt scoring/source/output-boundary instructions.
4. Update taxonomy scoring guidance if needed.
5. Mark root `summary_log.md` as deprecated.
6. Generate the required execution report.
7. Append `ai-collaboration/summaries/summary_log.md`.

## Uncertainties

- No unresolved decision blockers for this foundation-fix task.

