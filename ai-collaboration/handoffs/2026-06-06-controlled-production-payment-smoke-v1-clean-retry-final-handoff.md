# Controlled Production Payment Smoke v1 Clean Retry Final Handoff

Date: 2026-06-06

## Task

Run one owner-approved controlled production payment smoke for Module 01 using NT$49 credit-card one-time payment.

## Shared Policy References

Follow:

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`

## Critical Hard Rules

- Do not enable production runtime until `qa:module01:local`, `qa:module01:mock-flow`, `qa:module01:ui`, `qa:module01:staging`, and `qa:module01:production-preflight` pass.
- Assert production environment, base URL `https://anyu.tw`, canonical Vercel project `anyu-next`, and repo-root deploy before reporting production result IDs.
- Do not ask the owner to pay until environment and provider preflight are prepared.
- Use Admin API + `pnpm ops` for support state before direct DB.
- Stop at first hard failure.
- Do not expose card data, provider payloads, raw Email/LINE ID, encrypted recipient, hashes, tokens, tokenized URLs, or secret values.
- Default final posture is production fail-closed unless owner explicitly chooses soft availability.

## Scope

- Final preflight gates.
- Temporary production runtime enablement.
- One fresh production Module 01 result and checkout-start verification.
- Owner-assisted Email save, mobile LINE bind, and one card payment.
- ReturnURL / NotifyURL / processor / paid result / access-link delivery verification.
- Admin CLI lookup.
- Final runtime shutdown and report.

## Do Not

- Do not enable ads or broad traffic.
- Do not enable non-card payment methods.
- Do not use sandbox credentials.
- Do not manually mutate payment/result/access-link state.
- Do not implement Module 02 or theme UI.
- Do not commit secrets/private data.

## Validation Intent

Run before enablement:

- `qa:module01:local`
- `qa:module01:mock-flow`
- `qa:module01:ui`
- `qa:module01:staging`
- `qa:module01:production-preflight`

Run after shutdown:

- `qa:module01:production-preflight`

## Timing

- taskStartedAt: `2026-06-06T15:11:16Z`

## Outcome Snapshot

- Preflight gates passed before runtime enablement:
  - `qa:module01:local`
  - `qa:module01:mock-flow`
  - `qa:module01:ui`
  - `qa:module01:staging`
  - `qa:module01:production-preflight`
- Production runtime was enabled temporarily with only:
  - `ENABLE_PAYMENT_RUNTIME=true`
  - `ENABLE_NEWEBPAY_CHECKOUT=true`
- Fresh production Module 01 result creation succeeded after correcting an operator-created synthetic input validation issue.
- Fresh production result and checkout pages returned 200.
- Owner attempted mobile LINE bind before payment.
- First hard failure: `line_bind_failed`.
- Payment was not run.
- Email/LINE delivery was not sent.
- Production runtime was disabled again and redeployed fail-closed.
- Final `qa:module01:production-preflight` passed after shutdown.
