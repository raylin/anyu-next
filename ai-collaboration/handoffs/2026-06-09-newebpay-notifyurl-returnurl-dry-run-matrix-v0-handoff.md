# NewebPay NotifyURL / ReturnURL Dry-Run Matrix v0 Handoff

Shared policy:
Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

## Metadata

- taskStartedAt: 2026-06-09T15:14:45Z
- model / effort: GPT-5 Codex, high effort
- branch: `staging`
- production scope: none

## Goal

Dry-run and harden the NewebPay callback matrix without real production payment. NotifyURL must remain payment truth. ReturnURL must remain UX/recovery only and must not create paid entitlements or generation jobs without verified payment truth.

## Initial Plan

1. Inventory checkout, NotifyURL, ReturnURL, payment intent, entitlement, paid access token, generation job, and paid status recovery paths.
2. Compare current tests against the required callback ordering/duplicate/failure/malformed matrix.
3. Add deterministic unit/integration tests for gaps and fix narrowly only if a safety issue is found.
4. Run required local validation gates and document any staging-safe dry-run skipped reason.

## Hard Constraints

- Do not run production runtime or production payment.
- Do not send real Email or LINE.
- Do not modify Vercel env or NewebPay merchant config.
- Do not mutate production DB.
- Do not enable real payment runtime.
- Do not expose raw provider payloads, tokens, private values, or secrets.
- Do not redesign visual surfaces except route state markers if tests require them.

## Expected Report

Create `ai-collaboration/reports/2026-06-09-newebpay-notifyurl-returnurl-dry-run-matrix-v0.md` with callback flow inventory, dry-run scenario matrix, automated coverage, fixes if any, NotifyURL truth / ReturnURL UX conclusion, validation, production untouched confirmation, and next recommendation.
