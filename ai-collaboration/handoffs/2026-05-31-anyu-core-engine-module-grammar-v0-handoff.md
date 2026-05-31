# ANYU Core Engine & Module Grammar v0 Handoff

## Date

2026-05-31

## Task

Create a product/architecture specification for ANYU Core Engine and Module Grammar v0, then use that grammar to reason backward into the recommended Module 02 direction.

## Context

ANYU / anyu-next has reached a product-architecture checkpoint:

- Module 01「曖昧溫度計」is low-key production active / monitor.
- NewebPay sandbox E2E v5 passed end-to-end.
- Production payment runtime remains disabled and fail-closed.
- NewebPay merchant review is pending.
- Claude Design is exploring multi-module homepage / entry portal directions.
- Module 02 is concept-stage only and must not be implemented in this task.

The owner direction is that ANYU should become an AI-native personal insight system, not a collection of isolated AI tests. The spec should define a reusable core engine and module grammar, while explicitly avoiding premature code abstractions or a full plugin framework.

## Relevant Files

- `ai-collaboration/reports/`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`
- `ai-collaboration/research/2026-05-17-product-map-calibration-note-v0.md`
- `ai-collaboration/research/2026-05-21-module-seed-concept-development-v0.md`
- `apps/web/src/lib/ai/assets/product_result_prompt_v0.md`

## Constraints

- Documentation / product architecture only.
- Do not implement Module 02.
- Do not implement homepage multi-module portal changes.
- Do not change Module 01 prompt/result behavior.
- Do not change payment behavior, production flags, Vercel env, or deployment.
- Do not add database schemas or runtime abstractions.
- Do not commit secrets, credentials, raw tokens, raw user input, private billing, or proof documents.

## Tech Debt Policy For This Task

Small documentation alignment is allowed. Do not introduce runtime architecture, schema changes, or UI behavior under this planning task.

## Planned Work

1. Save this handoff.
2. Inspect recent product-map, multi-module, Module 01, and dashboard context.
3. Create the Core Engine / Module Grammar report.
4. Update dashboard only enough to reflect the new architecture/spec status.
5. Append `ai-collaboration/summaries/summary_log.md`.
6. Run docs presence, dashboard sanity, secret/private scan, and `git diff --check`.
7. Commit changes with a clear docs message.
8. Push the completed commit to `origin/staging`.
9. End with the required paste-back completion summary.

## Uncertainties

- Module 02 should remain a recommendation, not an approved implementation decision.
- Claude Design output may later change homepage visual direction; this spec should define product grammar without pre-empting that design work.
