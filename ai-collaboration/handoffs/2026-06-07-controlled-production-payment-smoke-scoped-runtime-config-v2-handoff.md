# Controlled Production Payment Smoke Retry with Scoped Runtime Config v2 Handoff

## Task

Run one controlled production Module 01 payment smoke using scoped runtime config and the fresh smoke fixture contract.

## Shared Policy References

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`
- `ai-collaboration/process/report-template.md`

## Scope

- Run final pre-open gates.
- Confirm smoke fixture freshness fields.
- Open Module 01 production payment window via scoped runtime config only if gates pass and owner confirms preconditions.
- Create a fresh production result from `.qa/module01-valid-analyze-request.json`.
- Require `cacheHit=false` and a non-reused result ID.
- Continue to Email save, mobile LINE bind, card payment, delivery, and Admin/Ops only if each previous step passes.
- Always close `payment.window.enabled` unless owner explicitly chooses soft availability.

## Do Not

- Do not use Vercel env toggles or redeploy for runtime open/close.
- Do not dynamically invent analyze input.
- Do not reuse a previous production result.
- Do not expose card data, provider payloads, raw Email/LINE identity, idToken, state, hashes, encrypted recipient, or tokenized URLs.
- Do not mutate DB manually.
- Do not implement theme UI or Module 02.

## Stop Conditions

- Stop before runtime open if any pre-open gate fails.
- Stop immediately if result creation returns `cacheHit=true` or reuses known failed result `800c88fa-04de-4172-b34a-3bc78cd4d0fa`.
- Stop before payment if Email save or LINE bind fails.
- Stop after any hard failure and close runtime config.

## Reporting Requirements

- Use canonical report and completion summary.
- Include smoke fixture freshness fields and `cacheHit` assertion.
- Include runtime open/close, first failure category if any, Admin/Ops state, and final production status.

## Recommended Next Task

- Clean pass: Controlled Production Payment Smoke Final Assessment / Gate 1 Decision v0.
- Failure: resolve first failure category with targeted tests/Admin-Ops diagnostics before another production attempt.
