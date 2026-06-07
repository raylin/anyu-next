# Controlled Production Payment Smoke Retry with Runtime-Window Helper v0 Handoff

## Task

Run one controlled production Module 01 payment smoke using the runtime-window helper, tracked Module 01 fixture, Admin API / `pnpm ops` boundary, and canonical report/completion formats.

## Shared Policy References

Follow:

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`
- `ai-collaboration/process/report-template.md`

## Scope

- Controlled production smoke only.
- Create fresh Module 01 production result from tracked fixture.
- Verify Email save, mobile LINE bind, one NT$49 credit-card payment, NotifyURL/processor/paid result, Email/LINE access-link delivery, and Admin CLI state.
- Restore production fail-closed unless owner explicitly chooses otherwise.

## Do Not

- Do not enable ads or non-card payment methods.
- Do not use sandbox credentials.
- Do not expose card data, provider payloads, provider crypto fields, raw Email, raw LINE identity, idToken, raw bind state, hashes, encrypted recipient, tokenized URLs, or access tokens.
- Do not manually mutate DB/payment/result/access-link state.
- Do not modify Vercel env outside controlled runtime-window flags.
- Do not implement product/theme/Module 02 changes.
- Do not use ad hoc heredoc scripts.

## Validation Selection

Pre-enable required:

- `cd apps/web && corepack pnpm run qa:module01:local`
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`
- `cd apps/web && corepack pnpm run qa:module01:ui`
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`
- `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`
- `cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json`

Run staging only if a deployed staging dependency must be verified.

## Reporting Requirements

Use `ai-collaboration/process/report-template.md` for the report and the canonical Codex Completion Summary schema for the final response.
