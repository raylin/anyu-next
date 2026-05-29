# NewebPay Runtime Integration Plan v0

Date: 2026-05-27

## 1. Summary

This plan defines the future NewebPay payment runtime architecture for Module 01 after provider approval.

No runtime payment code was implemented in this task.

Recommended launch architecture:

- `payment_intents` is the order/payment truth.
- `entitlements` is the paid access truth.
- `paid_access_token` is the web access proof for completed payment.
- `generation_jobs` is the paid analysis work lifecycle.
- NewebPay `NotifyURL`, after server-side verification, is the primary payment truth.
- `ReturnURL` is a user experience route and must not be trusted alone.
- Queue trigger should be trigger-only at first: call the existing processor to claim due work rather than putting sensitive job references in queue payloads.
- LINE remains optional delivery/retention, not required for paid web access.

## 2. Current Foundation

Completed foundation:

- `payment_intents` production/staging schema is applied.
- `entitlements` production/staging schema is applied.
- Merchant order helper exists and generates `ANYU`-prefixed order numbers.
- Paid access token helper exists and produces `pa_` tokens with HMAC-SHA256 hashing.
- Payment intent repository helpers exist for create and status transitions.
- Entitlement repository helpers exist for creating, looking up, rotating, and marking entitlement states.
- `generation_jobs` schema/repository and paid analysis processor exist.
- Internal processor endpoint and cron wrapper exist behind secrets and feature flags.
- Current unlocked route resolves legacy LINE/short-code unlock tokens only.

Current gaps:

- No NewebPay checkout route.
- No NewebPay return route.
- No NewebPay notify route.
- No paid access token resolver in `/m/{moduleSlug}/unlock/{token}`.
- No queue provider integration.
- No payment runtime feature flag.
- No payment UI button is enabled.

## 3. Route Architecture

Recommended future routes:

### `POST /api/modules/[moduleSlug]/payment/checkout`

Creates an order and redirects/prepares NewebPay checkout.

Responsibilities:

- Require payment runtime flag.
- Validate module supports payment.
- Validate analysis result exists and is purchasable.
- Reject expired/missing analysis results.
- Detect existing active entitlement for the same analysis result.
- Create `payment_intents` row with status `created`.
- Generate and store MerchantOrderNo.
- Build NewebPay checkout payload.
- Mark payment intent `checkout_started`.
- Return a redirect/form strategy for NewebPay.

### `GET|POST /api/payments/newebpay/return`

Handles user browser return from NewebPay.

Responsibilities:

- Record safe return receipt if possible.
- Verify return payload only if NewebPay provides sufficient signed data.
- Never trust return alone as final payment truth.
- Redirect to a payment pending page or paid access route if notify has already verified payment.
- Avoid exposing raw provider payload.

### `POST /api/payments/newebpay/notify`

Handles server-to-server NewebPay notification.

Responsibilities:

- Require payment runtime flag.
- Verify NewebPay checksum/hash.
- Parse provider payload into a sanitized shape.
- Look up `payment_intents` by MerchantOrderNo.
- Confirm amount/currency/order/provider environment.
- Idempotently transition payment to `paid`, `failed`, `cancelled`, `expired`, or refund states.
- On verified paid: create/reuse entitlement, issue `pa_` token, create/reuse paid analysis generation job, and trigger queue/processor.
- Return provider-compatible acknowledgement.

### `GET /api/payments/[paymentIntentId]/status`

Optional. Prefer avoiding this initially if the paid access route and unlocked pending route can cover user polling.

If added, it should return only external statuses:

- `created`
- `checkout_started`
- `paid_pending_generation`
- `completed`
- `failed`
- `expired`
- `refunded`

No job IDs, provider raw payloads, or internal attempts should be returned.

## 4. Checkout Creation Flow

Recommended flow:

1. User is on free result / paid preview.
2. User clicks the future payment CTA.
3. Server validates result/module/payment runtime.
4. Server checks whether active entitlement already exists.
5. Server creates `payment_intents`:
   - `provider = newebpay`
   - `provider_environment = sandbox | production`
   - `amount_minor = 49`
   - `currency = TWD`
   - `status = created`
   - `module_slug = ambiguous-temperature`
   - linked `analysis_request_id`
   - linked `analysis_result_id`
   - optional `unlock_intent_id` only if payment started from an existing LINE/free unlock context
6. Server builds MerchantOrderNo and NewebPay checkout parameters.
7. Server marks `checkout_started`.
8. User redirects/submits to NewebPay.

Do not create entitlement before verified payment.

Do not create generation job before verified payment for real paid checkout.

## 5. Return vs Notify Trust Model

`NotifyURL` is the primary payment truth.

`ReturnURL` is useful for UX, but it is browser-mediated and must not mark payment paid unless the return payload is independently verified and all order checks pass.

Recommended behavior:

- Notify verified paid first: return route redirects to `/m/{moduleSlug}/unlock/{paidAccessToken}`.
- Return arrives before notify: show pending verification and poll.
- Return indicates failure: show safe failure/pending copy, but avoid downgrading a payment that notify already marked paid.
- Duplicate return: idempotent no-op.

## 6. NewebPay Verification Requirements

Future implementation must verify:

- NewebPay checksum/hash.
- MerchantOrderNo exists and belongs to a known `payment_intents` row.
- Provider environment matches current runtime mode.
- Amount matches expected `amount_minor`.
- Currency matches expected `TWD`.
- Provider success status is exactly accepted.
- Failed/cancelled/expired statuses are mapped safely.
- Paid cannot be downgraded by later failed/cancelled callback.
- Duplicate notify is idempotent.

Future secrets/env, never committed:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_ENV`

## 7. Payment Intent State Transitions

Recommended transitions:

- `created -> checkout_started`
- `checkout_started -> paid`
- `checkout_started -> failed`
- `checkout_started -> cancelled`
- `checkout_started -> expired`
- `paid -> refund_pending`
- `refund_pending -> refunded`

Idempotency rules:

- Repeated paid notify for the same order returns success and reuses entitlement/job.
- Failed after paid must not downgrade paid.
- Cancelled after paid must not downgrade paid.
- Refund events can only move paid records into refund states.
- Expiry job should only expire `created` or `checkout_started` rows that are past `expires_at`.

## 8. Entitlement Creation

On verified paid notify:

1. Create or reuse `payment_single` entitlement.
2. Use `entitlement_type = single_paid_analysis`.
3. Use `source = payment_single`.
4. Use `status = active`.
5. Link `payment_intent_id`.
6. Link `analysis_request_id`.
7. Link `analysis_result_id`.
8. Generate one raw `pa_` paid access token.
9. Store only token hash.
10. Return raw token only to redirect/link creation code.

Idempotency:

- Unique entitlement per `payment_intent_id` should be enforced at service level in v0.
- If an entitlement already exists for the payment intent, reuse it and rotate token only under explicit reissue policy.
- Do not create multiple entitlements for duplicate notify.

Future schema consideration:

- If duplicate entitlement prevention becomes critical at DB level, add a unique partial index on `payment_intent_id` where not null in a separate migration decision.

## 9. Paid Access Token / Unlock Route Integration

Future unlock route should support dual resolver behavior:

- `pa_` token: resolve through `entitlements`.
- Legacy token: resolve through `unlock_intents`.

Recommended route remains:

```text
/m/{moduleSlug}/unlock/{token}
```

Resolver priority:

1. If token matches `pa_` shape, resolve entitlement by token hash.
2. Validate entitlement is active and not expired/refunded/revoked.
3. Resolve linked analysis result.
4. Render completed paid result if available.
5. If generation job is queued/processing, render pending poller.
6. If failed final, render support/retry/refund copy.
7. Otherwise, fall back to legacy unlock intent resolver.

Raw `pa_` tokens must not be stored in DB, logs, events, reports, queue payloads, or provider payloads.

## 10. Generation Job Creation

After entitlement is active:

1. Create or reuse `generation_jobs` row.
2. Use `job_type = paid_analysis`.
3. Use `input_ref_type = analysis_result`.
4. Use `input_ref_id = analysis_result_id`.
5. Set `output_ref_type = analysis_paid_result`.
6. Set `entitlement_ref_id = entitlement.id`.
7. Use existing prompt/schema versions.
8. Set trigger source.

Trigger source recommendation:

- Keep `payment_success_future` for first integration to avoid churn.
- Rename to `payment_success` only in a deliberate constants/test migration task.

## 11. Queue Trigger Strategy

Recommended initial queue strategy:

- Use QStash-like signed webhook queue after staging POC.
- Queue message should be trigger-only, not job-specific.
- Queue calls a wrapper endpoint that asks the processor to claim due `paid_analysis` jobs with `limit = 1`.

Recommended payload:

```json
{
  "jobType": "paid_analysis"
}
```

Avoid queue payloads containing:

- job IDs
- dedupe keys
- analysis result IDs
- entitlement IDs
- tokens
- raw content
- LINE IDs

Reasoning:

- Existing processor already has claim/recovery logic.
- Trigger-only payload avoids leaking identifiers.
- It is easier to make idempotent.
- Job-specific dispatch can be added later if required.

## 12. Queue Failure Handling

If payment is paid but queue publish fails:

- Keep `payment_intent = paid`.
- Keep entitlement active.
- Keep `generation_job = queued`.
- Do not mark payment failed.
- Do not auto-refund.
- Return user to the paid access route/pending state.
- Recovery can happen through manual processor, cron fallback, or queue publish retry.

Recommended safe event category:

- `queue_publish_failed`

This should be aggregate-only and must not include job ID, token, provider payload, or raw content.

## 13. Web Polling / Pending UX

After payment return:

- Redirect user to `/m/{moduleSlug}/unlock/{paidAccessToken}` if a token is available.
- The unlocked route resolves entitlement and paid result state.
- Completed result renders immediately.
- Queued/processing generation renders pending copy.
- Failed final renders support/retry/refund copy.

External user statuses should remain simple:

- `pending`
- `processing`
- `completed`
- `failed`
- `expired`
- `refunded`

No internal job IDs, attempts, locks, dedupe keys, or provider payload should be shown.

## 14. LINE Optional Delivery

LINE should remain optional after payment.

Recommended post-completion behavior:

- Show secondary CTA: save/send result to LINE.
- If user binds LINE, link delivery to entitlement or a delivery record.
- LINE is not required for paid access.
- Short-code remains fallback/recovery, not primary paid access.

Do not change current LINE fulfillment until payment web access is stable.

## 15. Failure / Duplicate / Expired Handling

### Duplicate payment

If the same analysis result already has an active entitlement:

- Before checkout: avoid creating a new payment intent and send user to existing access path if safe.
- After duplicate paid notify: mark duplicate order for support/refund handling, but do not create second entitlement unless product intentionally allows multiple purchases.

### Expired checkout

If payment is not verified by `expires_at`:

- Mark payment intent expired.
- Do not create entitlement.
- Do not create generation job.
- Let user start a new checkout.

### Paid but generation failed

If payment is paid but generation fails final:

- Payment remains paid.
- Entitlement remains active.
- Job is `failed_final`.
- User sees support/retry/refund copy.
- Operator can retry job or refund.

### Lost link

Support can reissue a `pa_` token by rotating the entitlement token after verifying payment/entitlement state.

Do not require raw relationship input for support re-delivery.

## 16. Feature Flags

Recommended flags:

- `ENABLE_PAYMENT_RUNTIME=false` by default.
- `ENABLE_NEWEBPAY_CHECKOUT=false` if separating provider checkout from fake/operator payment tests is useful.
- `ENABLE_PAID_GENERATION_QUEUE_TRIGGER=false` until queue POC passes.

Avoid over-flagging v0. The top-level runtime flag must gate every payment route.

Existing flags remain:

- `ENABLE_PAID_GENERATION_JOBS`
- `ENABLE_PAID_GENERATION_PROCESSOR`

## 17. Staging / Sandbox Strategy

Recommended sequence:

1. Operator-only fake paid success on staging to test entitlement + `pa_` resolver.
2. Staging paid access route resolves `pa_` token and preserves legacy token behavior.
3. Queue trigger staging POC with trigger-only payload.
4. NewebPay sandbox/test checkout if available.
5. NewebPay return/notify staging smoke.
6. Controlled production payment smoke only after provider approval and staging pass.
7. Refund/re-delivery SOP rehearsal.

Production payment remains disabled until all staging gates pass.

## 18. Tests For Future Implementation

Required future tests:

- Checkout route creates `payment_intent`.
- Checkout route generates valid MerchantOrderNo.
- Checkout route does not create entitlement.
- Checkout route is disabled without payment runtime flag.
- Notify rejects missing/invalid signature.
- Notify rejects amount mismatch.
- Notify rejects currency mismatch.
- Notify rejects unknown MerchantOrderNo.
- Notify paid transition is idempotent.
- Notify paid creates entitlement and stores token hash only.
- Notify paid creates/reuses paid analysis generation job.
- Queue publish failure leaves payment paid, entitlement active, and job queued.
- Return route does not trust unverified browser return.
- `pa_` unlock resolver works.
- Legacy unlock token resolver still works.
- Duplicate payment is handled safely.
- Expired checkout does not create entitlement.
- Refunded payment marks entitlement refunded.
- No raw provider payload/card data is stored.
- No raw `pa_` token is stored.
- No tokens, job IDs, dedupe keys, raw input, paid result JSON, LINE IDs, or provider payloads appear in events.

## 19. Security / Privacy

Do not store:

- Full card numbers.
- CVV.
- Raw provider payload.
- Raw paid access token.
- Raw user input in payment tables.
- Paid result JSON in payment/entitlement tables.
- Queue payload with raw content.
- LINE user ID in queue payload.
- Provider secrets.

Do require:

- Server-side provider verification.
- Amount/currency/order checks.
- HMAC hashing for paid access tokens.
- Signed internal queue/processor callbacks.
- Aggregate-only metrics.
- Feature flag off by default.

## 20. Implementation Phases

### Phase 0 — Planning

This task. No code.

### Phase 1 — Fake Payment Runtime Architecture

Operator-only fake paid success creates entitlement + paid token and resolves unlock route. No real checkout.

### Phase 2 — Paid Access Token Resolver

Add `pa_` token resolver to unlocked route while preserving legacy unlock intent tokens.

### Phase 3 — Queue Trigger Staging POC

Add QStash-like trigger-only queue wrapper and staging-only smoke.

### Phase 4 — NewebPay Checkout / Notify / Return

Provider integration behind feature flags after approval.

### Phase 5 — Web Polling Access

Payment success lands on paid access route and pending poller until completed.

### Phase 6 — LINE Optional Delivery

Add secondary LINE save/delivery path after paid web result is stable.

### Phase 7 — Production Payment Smoke

Controlled small payment/refund SOP before broader traffic or ads.

## 21. Recommended Next Step

Run `Paid Access Token Resolver Plan v0`, then implement an operator-only fake payment success path before adding NewebPay provider code.

This keeps payment runtime disabled while validating the entitlement and web access architecture.
