# Handoff

## Date

2026-05-18

## Task

Implement Module 01 runtime and database integration in `apps/web`, connecting the current UI shell to a minimal real backend flow for analyze, result loading, paid intent, and contact capture without adding auth, payment, portal work, or share-image generation.

## Context

The Module 01 UI shell is complete in `apps/web`. The current app still uses placeholder API handlers, starter DB schema, and demo-only result routing. This handoff upgrades that shell into a narrow end-to-end v0 flow: landing submit, provider call, schema validation, normalized result persistence, DB-backed result page, unlock intent, and contact submission.

## Relevant Files

- `apps/web/src/app/api/modules/[moduleSlug]/analyze/route.ts`
- `apps/web/src/app/api/events/route.ts`
- `apps/web/src/app/api/unlock-intent/route.ts`
- `apps/web/src/app/api/contact/route.ts`
- `apps/web/src/app/m/[moduleSlug]/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- `apps/web/src/lib/db/`
- `apps/web/src/lib/ai/`
- `apps/web/src/lib/privacy/pii.ts`
- `apps/web/src/lib/modules/ai-temperature-ui.ts`
- `prompts/product_result_prompt_v0.md`
- `schemas/product_result_schema_v0.json`
- `oradar/product_runtime.py`
- `oradar/providers.py`

## Constraints

- No auth
- No real payment
- No portal
- No share PNG / OG generation
- No legacy prototype behavior changes
- No Python runtime changes
- No prompt/schema canonical file edits unless strictly required for compile
- Build/tests must pass without `DATABASE_URL`

## Planned Work

1. Save this handoff.
2. Implement server-only AI helpers for prompt loading, provider calling, JSON parsing, and schema validation.
3. Replace the placeholder DB schema/client usage with minimal runtime tables and typed persistence helpers.
4. Implement analyze, event, unlock-intent, and contact API routes with config-safe error handling.
5. Wire the landing and result UI to the real APIs while preserving `result/demo`.
6. Add tests for validation, privacy, score buckets, schema validation, and metadata guards.
7. Update docs, review bundle, execution report, and summary log.
8. Run validation and create a git commit containing the completed integration changes.
9. End the final CLI response with a paste-back completion summary including the commit hash.

## Uncertainties

- Live analyze smoke testing depends on whether `DATABASE_URL` and provider keys are configured locally.
- `provider_raw_json` may remain nullable or omitted from the first implementation if keeping the normalized result path cleaner materially reduces risk.
