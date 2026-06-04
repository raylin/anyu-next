# Production Processor Auth Env Fix + Paid Order Completion Handoff

Date: 2026-06-04

## Task

Fix Production processor authentication env safely, redeploy fail-closed, invoke the paid generation processor once for the already-paid Production smoke order, and verify paid result plus Email/LINE access-link delivery.

## Context

- Controlled Production Payment Smoke v1 reached a real NT$49 NewebPay credit-card payment.
- Payment truth passed: the Production payment intent is paid and NotifyURL was processed.
- Entitlement is active.
- Email access-link contact exists and is linked.
- LINE access-link contact exists and is linked.
- LINE encrypted recipient secret exists.
- Runtime/checkout were disabled again after the smoke stall.
- Paid generation remains queued because processor auth is not usable:
  - `INTERNAL_JOB_SECRET` is absent.
  - `CRON_SECRET` exists by name but is empty.

## Constraints

- Do not enable Production checkout.
- Do not run another payment.
- Do not manually mutate payment/result state.
- Do not print or commit secrets, provider payloads, tokens, hashes, raw Email, raw LINE ID, encrypted recipient, or private result/source content.
- Do not send unrelated Email/LINE messages.
- Keep Production fail-closed after the recovery action.

## Planned Work

1. Confirm processor auth contract and selected endpoint.
2. Set non-empty Production `CRON_SECRET` and `INTERNAL_JOB_SECRET` without printing values.
3. Redeploy Production from repo root to canonical `anyu-next` with runtime/checkout disabled.
4. Reconfirm public pages and checkout/operator fail-closed.
5. Verify the already-paid order state using sanitized DB inspection.
6. Invoke one authenticated processor run.
7. Verify paid result completion and Email/LINE access-link rows/sends.
8. Ask owner to verify Email, LINE, `/r/ links, and browser paid result where needed.
9. Run Production preflight and final fail-closed checks.
10. Document, commit, and push to `origin/staging`.

## Current Known Result

- Production DB target: Neon project `anyu-next`, branch `production`.
- Current paid result id under inspection: known internally from the active smoke, not to be printed with tokenized URLs.
- Current first failure category: `generation_failed` due to processor auth env gap.

## Completion Notes

- Production processor auth env was repaired with non-empty `CRON_SECRET` and `INTERNAL_JOB_SECRET`.
- `ENABLE_PAID_GENERATION_PROCESSOR=true` was activated for authenticated processor execution.
- Production checkout/runtime flags remained disabled.
- One authenticated `/api/cron/paid-generation` invocation processed and completed one queued paid-analysis job.
- Sanitized DB verification showed:
  - payment intent remains paid
  - entitlement remains active
  - paid result is completed
  - Email access-link status is sent/provider-accepted
  - LINE access-link status is sent/provider-accepted
  - LINE recipient secret remains active
- Production preflight returned `pass_ready_for_controlled_smoke`.
- Public pages stayed live; checkout/fake-paid/operator routes fail closed.
- Owner inbox/link/render confirmation remained pending at handoff update time.
