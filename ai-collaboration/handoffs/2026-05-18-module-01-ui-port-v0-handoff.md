# Handoff

## Date

2026-05-18

## Task

Implement the Module 01 UI shell for `曖昧溫度計` inside `apps/web`, including a production-quality landing page and a mock/static result page, without implementing provider calls, DB persistence, payment, or auth.

## Context

The migration plan for Module 01 is complete and recommends a UI-first port into the existing Next.js foundation. The current `apps/web` module pages are only placeholders. The legacy prototype remains the visual and product-flow reference, but its Python/HTML/JS architecture must not be copied into the production app.

## Relevant Files

- `ai-collaboration/research/2026-05-18-module-01-migration-plan-v0.md`
- `apps/web/src/app/m/[moduleSlug]/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx`
- `apps/web/src/components/anyu/`
- `apps/web/src/content/modules/ai-temperature.ts`
- `apps/web/src/lib/modules/registry.ts`
- `apps/web/src/styles/globals.css`
- `experiments/ambiguous_temperature_v0/`

## Constraints

- UI port only
- No provider calls
- No DB persistence
- No real analyze route implementation
- No auth
- No payment
- No portal work
- No prompt/schema/token edits unless required for compile

## Planned Work

1. Save this handoff.
2. Replace the placeholder landing and result shells with typed UI components using the ANYU design system.
3. Add local UI state for input/chip selection and CTA enable/disable behavior without calling APIs.
4. Add static/mock result rendering for `/m/ambiguous-temperature/result/demo`.
5. Update tests, app docs, review bundle, execution report, and summary log.
6. Run validation and, if feasible, a local route check.
7. Create a git commit containing the completed UI-shell changes.
8. End the final CLI response with a paste-back completion summary that includes the commit hash.

## Uncertainties

- The exact interaction treatment for revealing the contact capture area can stay local-only in this task.
- Manual browser verification may depend on local dev-server availability, but the code should still be validated with lint, tests, and build.
