# Controlled Production Payment Smoke v1 Clean Retry After LINE Fix Handoff

Date: 2026-06-04

## Task

Run one clean controlled Production payment smoke using credit-card one-time payment and the owner's own card, after the Production mobile LINE bind identity fix passed.

## Context

- Production LINE bind failure `LINE 身分確認沒有完成` was fixed.
- `NEXT_PUBLIC_LINE_LIFF_URL` is now the primary LIFF ID source.
- Owner confirmed mobile LINE bind succeeds on Production.
- Desktop browser LINE bind remains non-blocking because it is not a reliable LIFF identity context.
- Production runtime and checkout are disabled/fail-closed before this task.
- Production preflight passes.
- No clean end-to-end Production card payment has passed yet.

## Constraints

- No ads or broad traffic.
- Enable only `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT` for the smoke window.
- Do not enable fake-paid/operator smoke routes.
- Deploy from repo root to canonical `anyu-next` only.
- Do not expose card data, provider credentials, provider payloads, `pa_`, `pcs_`, `pal_`, tokenized URLs, raw Email, raw LINE ID, encrypted recipient values, hashes, or private source/result content.
- Use mobile LINE context for LINE bind.
- If LINE bind fails, abort before payment and disable runtime/checkout.
- Recommended final state: runtime/checkout disabled again unless owner explicitly chooses soft public availability.

## Planned Work

1. Run Production preflight and verify fail-closed.
2. Enable only the two runtime flags.
3. Deploy from repo root to canonical `anyu-next`.
4. Create a fresh Production result and verify checkout-start.
5. Pause for owner Email save and mobile LINE bind checkpoint.
6. After checkpoint passes, generate/refresh a fresh NewebPay form and owner pays immediately.
7. Verify ReturnURL, NotifyURL, paid result render, Email/LINE access-link delivery, and sanitized state.
8. Disable runtime/checkout again by default, redeploy, verify fail-closed.
9. Document, commit, and push.

## Current State

- Handoff saved before Production operations.
- Smoke reached real Production payment after Email save and mobile LINE bind passed.
- NewebPay payment truth and NotifyURL processing succeeded.
- Downstream paid generation initially blocked because processor auth/gating was not usable.
- Runtime/checkout were disabled again and Production fail-closed was verified.
- Follow-up recovery task `Production Processor Auth Env Fix + Paid Order Completion v0` repaired processor auth, completed the queued paid job, and verified Email/LINE access-link provider acceptance.
