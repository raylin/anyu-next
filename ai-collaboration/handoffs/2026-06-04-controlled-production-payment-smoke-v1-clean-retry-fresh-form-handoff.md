# Controlled Production Payment Smoke v1 Clean Retry with Fresh NewebPay Form Handoff

Date: 2026-06-04

## Task

Run one clean controlled Production payment smoke using credit-card one-time payment and the owner's own card, with a fresh NewebPay form and prompt card payment, verifying Module 01 paid result flow end to end.

## Context

- Commit `5e0e1ee` is deployed to Production.
- `anyu.tw` and `www.anyu.tw` serve commit `5e0e1ee924d4`.
- Production preflight passes with `pass_ready_for_controlled_smoke`.
- Expired ReturnURL now shows terminal expired/support copy, not indefinite `付款確認中`.
- Production runtime and checkout are disabled/fail-closed before this task.
- Previous v1 retry reached checkout-start and owner confirmed Email save + LINE bind, but no card payment was completed because the NewebPay form/link expired.

## Constraints

- Do not enable ads or broad traffic.
- Enable only `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT` for the smoke window.
- Do not enable fake-paid/operator smoke routes.
- Deploy from repo root to canonical `anyu-next` only.
- Do not expose card data, provider credentials, provider payloads, `pa_`, `pcs_`, `pal_`, raw Email, raw LINE ID, encrypted recipient values, hashes, tokenized URLs, or private result content.
- If LINE bind fails, abort before payment and disable runtime again.
- Recommended final runtime decision: disable runtime/checkout again after smoke unless owner explicitly chooses soft public availability.

## Planned Work

1. Run Production payment preflight.
2. Enable only the two Production runtime flags.
3. Deploy from repo root to canonical `anyu-next`.
4. Create a fresh Production result and verify checkout-start.
5. Pause for owner Email save and LINE bind checkpoint.
6. Verify sanitized DB checkpoint for Email/LINE contact and LINE recipient secret.
7. Generate fresh provider form and have owner proceed to card payment immediately.
8. Verify ReturnURL, NotifyURL, paid result render, Email/LINE access-link delivery, and sanitized DB state.
9. Disable runtime/checkout again by default, redeploy, and verify fail-closed.
10. Document, commit, and push.

## Current State

- Handoff saved before Production operations.
- Preflight passed with `pass_ready_for_controlled_smoke`.
- Runtime/checkout were temporarily enabled and deployed from repo root to canonical `anyu-next`.
- Runtime-enabled deployment ID: `dpl_D7XTGHTP9HXZPYn2M6eUu99a4LGo`.
- Fresh Production result and checkout-start were created and verified.
- Owner confirmed Email save passed.
- Owner reported LINE bind failed with `LINE 身分確認沒有完成`.
- Failure classification: `line_bind_failed / id_token_missing_or_incomplete_line_identity`.
- Smoke was aborted before card payment.
- Runtime/checkout flags were removed again.
- Final fail-closed deployment ID: `dpl_zEbecCgUq5ARLZg2mF8rxF6QJ8SA`.
- Final Production safety verified:
  - public pages 200
  - checkout 404 `not_found`
  - fake-paid/operator routes 404
  - production preflight still `pass_ready_for_controlled_smoke`
- No card payment, Email send, LINE message, provider payload exposure, or manual DB mutation occurred.
- Local support lookup for the fresh result blocked safely because `SUPPORT_OPS_DATABASE_URL` is missing.
