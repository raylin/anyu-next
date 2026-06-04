# Controlled Production Payment Smoke v0

Date: 2026-06-04

## Completed Work

- Ran one controlled production NewebPay payment smoke using credit-card one-time payment only.
- Temporarily enabled the minimum production payment runtime flags needed for the smoke.
- Deployed production on the unified ReturnURL build.
- Verified production health during the smoke:
  - `environment=production`
  - commit `48028426da61`
  - route bundle `payment-foundation-2026-05-29`
  - `/payment/newebpay/return` present
- Created one fresh production Module 01 result and started checkout.
- Owner completed one NT$49 production card payment.
- Verified the payment intent reached paid state through NewebPay NotifyURL.
- Diagnosed and corrected missing production runtime env required for checkout session signing, paid access signing, and queue/processor execution.
- Owner resent the NotifyURL from NewebPay after env alignment.
- Verified the resent NotifyURL completed the production delivery chain:
  - entitlement active
  - generation job completed
  - paid result completed
  - Email access link row created
  - Email provider status accepted
- Returned production runtime to fail-closed state after the smoke.

## Provider Dashboard Checklist

- Owner confirmed the controlled-smoke provider checklist before runtime enablement:
  - credit-card one-time payment path
  - production credentials
  - production NotifyURL
  - provider-level production ReturnURL
  - no sandbox/staging URL intended for the smoke
- Apple Pay, Google Pay, Samsung Pay, and non-card payment methods remain separate/non-blocking for this task.

## Runtime Enablement Window

- Production payment runtime and checkout were temporarily enabled for the controlled smoke only.
- Additional runtime env discovered during the smoke and added to Production:
  - `PAYMENT_CHECKOUT_SESSION_SECRET`
  - `PAID_ACCESS_TOKEN_HASH_SECRET`
  - `ENABLE_PAID_JOB_QUEUE_TRIGGER`
  - `PAID_JOB_QUEUE_PROVIDER`
  - `PAID_JOB_QUEUE_TOPIC`
  - `ENABLE_PAID_GENERATION_PROCESSOR`
- No env values, prefixes, suffixes, lengths, hashes, or checksums were printed.
- After the smoke, production was redeployed with runtime/checkout/queue/processor flags set back to disabled.

## Production Payment Result

- Payment method: credit-card one-time payment.
- Browser returned from NewebPay successfully.
- NotifyURL payment truth succeeded and marked the payment intent paid.
- The first post-payment browser experience remained stuck at payment confirmation because downstream delivery artifacts were initially blocked by missing runtime env.
- After adding the missing env and owner resending NotifyURL, the idempotent NotifyURL path created the entitlement, generation job, paid result, and Email access link.

## ReturnURL Result

- Unified provider-level ReturnURL was deployed and available at `/payment/newebpay/return`.
- ReturnURL remained UX-only and non-mutating.
- Browser return succeeded, but the visible return/polling state did not recover automatically during the first attempt because the delivery job did not exist until after env correction and NotifyURL resend.

## NotifyURL Result

- Initial NotifyURL received and processed provider payment success.
- Initial downstream delivery failed before entitlement/job creation due to missing production runtime env.
- Resent NotifyURL after env alignment completed the delivery chain.
- NotifyURL behavior remained the payment truth and was idempotent enough to recover after the env fix.

## Paid Result Render Result

- Sanitized DB verification confirmed:
  - one active entitlement linked to the payment intent
  - one completed generation job
  - one completed paid result with paid result JSON present
- Owner-facing paid-result refresh confirmation was requested after recovery; no tokenized URL or private result content was recorded.

## Email Access-Link Result

- One checkout-start Email contact was bound to the payment/entitlement context after NotifyURL recovery.
- One Email access-link row was created with:
  - channel `email`
  - status `sent`
  - provider status `accepted`
  - send attempt count `1`
  - `sent_at` present
- No raw Email, access-link token, token hash, provider payload, or report body was printed.
- Owner initially reported no Email before the env fix. Post-fix provider acceptance is verified; final owner inbox confirmation after recovery remains a follow-up confirmation item.

## LINE Access-Link Result

- LINE access-link delivery was not completed in this production smoke.
- Sanitized production DB showed only an Email contact for the paid context.
- No LINE contact/recipient secret was linked to this production payment context, so no LINE access-link send was expected after recovery.
- No production LINE message was sent by this smoke after runtime shutdown.

## Sanitized DB Verification

- Production clean access-link schema was used:
  - `payment_access_link_contacts`
  - `paid_result_access_links`
  - `payment_access_link_contact_secrets`
- Sanitized final state for the smoke artifact:
  - payment intent paid
  - provider environment production
  - entitlement active
  - generation job completed
  - paid result completed
  - one Email contact bound
  - one Email access link sent/accepted
- No raw customer data, source text, provider payload, tokens, token hashes, raw Email, raw LINE ID, or encrypted recipient values were printed.

## Final Runtime Status

- Production was redeployed after the smoke with runtime flags disabled again.
- Final checks:
  - `/` returned 200
  - `/refund` returned 200
  - `/legal` returned 200
  - checkout API returned `not_found`
  - fake-paid POST returned 404
  - health reported production commit `48028426da61`
- Production public content remains live.
- Production checkout/runtime is disabled.

## Architecture Decisions

- Kept NotifyURL as payment truth.
- Used NotifyURL resend as the recovery path after missing env was corrected instead of mutating DB manually.
- Disabled runtime again by default because the smoke produced operational findings and LINE was not fully covered.

## Blockers

- The first production payment exposed missing Production runtime env not caught by prior presence-only gates.
- LINE was not covered because no LINE contact existed in the production payment context.
- Owner inbox confirmation after the recovered Email provider acceptance remains pending in this report.

## Uncertainties

- Whether the owner browser polling state recovered after refresh once DB delivery completed.
- Whether the owner wants a second controlled production smoke specifically covering LINE bind/message on the production paid result context.

## Tech Debt Review

- New technical debt introduced: none in code; operational debt remains around production preflight coverage.
- Existing technical debt observed: production preflight did not verify all runtime env needed by checkout session signing, paid access signing, queue trigger, and processor execution.
- Opportunistic cleanup completed: production runtime was shut back down after the controlled smoke.
- Deferred cleanup candidates:
  - add a production payment runtime preflight helper that checks all required env names by category
  - add a controlled-smoke runbook step for NotifyURL resend recovery
  - add a production LINE contact binding smoke step before expecting LINE access-link delivery

## Suggested Next Steps

1. Production Payment Runtime Preflight Helper v0.
2. Controlled Production Payment Smoke v1 with explicit Email inbox confirmation and production LINE bind/message coverage.
3. Production Soft Availability Decision Record v0 only after the v1 smoke passes without recovery intervention.
