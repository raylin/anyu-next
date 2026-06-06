# LINE / LIFF Bind Diagnostic Harness v0 Handoff

Date: 2026-06-07

## Task

Build a local/testable LINE / LIFF bind diagnostic harness that can reproduce and classify the bind flow without real LINE, production, or owner manual action.

## Shared Policy References

Follow:

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`

## Mainline Guard

Current owner-defined sequence:

1. Module 01 Fixture + Smoke Prep Foundation v0 ✅
2. LINE / LIFF Bind Diagnostic Harness v0
3. Admin API pre-payment bind diagnostics, if needed
4. LINE production bind fix with targeted/mock/UI/staging validation
5. Controlled Production Payment Smoke retry
6. Module Theme Architecture Implementation Plan

Do not let Codex-recommended next steps override this sequence.

## Scope

- Inventory current LIFF bind flow.
- Add a testable LIFF adapter/state-machine seam.
- Add safe diagnostic categories.
- Add targeted local tests.
- Integrate diagnostics into mock-flow summary if appropriate.
- Update report, summary log, and dashboard.

## Do Not

- Do not enable production runtime or checkout.
- Do not run production payment.
- Do not send production Email or LINE.
- Do not modify Vercel env or rotate secrets.
- Do not mutate production data or apply DB migrations.
- Do not implement theme UI or Module 02.
- Do not expose raw LINE userId, idToken, encrypted recipient, hashes, tokens, or tokenized URLs.
- Do not use ad hoc heredoc scripts.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted LINE/LIFF bind tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:local`

Skip staging and production-preflight unless deployed or production/preflight behavior changes.

## Timing

- taskStartedAt: `2026-06-06T16:18:33Z`
