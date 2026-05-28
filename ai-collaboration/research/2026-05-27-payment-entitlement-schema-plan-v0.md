# Payment / Entitlement Schema Plan v0

Date: 2026-05-27

## 1. Summary

Recommendation:

- Add future `payment_intents` as payment/order truth.
- Add future `entitlements` as product access truth.
- Add a neutral, hashed `paid_access_token` on `entitlements` for v0 web access.
- Keep `/m/{moduleSlug}/unlock/{token}` as the v0 user-facing route, but let the token resolver check both legacy `unlock_intents` and new entitlement access tokens.
- Keep `unlock_intents` for LINE/LIFF and short-code fulfillment.
- Keep `generation_jobs` as durable paid-generation lifecycle, linked to `entitlements.id` through its existing `entitlement_ref_id`.
- Keep `analysis_paid_results` as paid-result storage/delivery truth.

This is a planning artifact only. No migration or app code was added.

## 2. Current State

Current tables/assets:

- `analysis_requests` stores request metadata, redacted input, user context, status, cache metadata, and retention.
- `analysis_results` stores free-result output and normalized result JSON.
- `analysis_paid_results` stores paid-result lifecycle, `paid_result_json`, prompt/schema versions, model, status, error, retry, and retention fields.
- `unlock_intents` stores fulfillment code hash, fulfillment token/token hash, LINE binding status, line user identifier, delivery attempts, and expiration.
- `generation_jobs` stores durable job lifecycle for `paid_analysis`, including `trigger_source`, dedupe key, input/output refs, attempts, locks, and `entitlement_ref_id`.
- Current paid request route and LINE fulfillment paths can call `requestDeferredPaidGeneration`.
- Current unlocked route resolves by `unlock_intents.fulfillment_token_hash`.

Current gaps:

- No payment/order table.
- No entitlement/access table.
- No neutral paid-access token model.
- Current web paid-result access is tied to fulfillment token semantics.
- Refund/re-delivery state is not represented.

## 3. Design Principles

- Payment truth, access truth, generation truth, and delivery truth should be separate.
- LINE should never be required for web-paid access.
- Tokens must be hashed at rest.
- Payment provider callbacks must be idempotent and server-verified.
- Queue payloads must be reference-only.
- Support/re-delivery should be possible without storing raw private input in payment tables.
- Early schema should be additive and narrow; do not build membership, packs, or account dashboards yet.

## 4. payment_intents Model

Future table:

```text
payment_intents
- id uuid primary key
- provider text not null
- provider_environment text not null
- merchant_order_no text not null unique
- provider_trade_no text nullable
- module_slug text not null
- analysis_request_id uuid not null references analysis_requests(id)
- analysis_result_id uuid not null references analysis_results(id)
- unlock_intent_id uuid nullable references unlock_intents(id)
- amount integer not null
- currency text not null
- status text not null
- provider_status text nullable
- provider_response_code text nullable
- provider_error_category text nullable
- provider_payment_type text nullable
- checkout_started_at timestamptz nullable
- notify_received_at timestamptz nullable
- last_provider_event_at timestamptz nullable
- paid_at timestamptz nullable
- failed_at timestamptz nullable
- cancelled_at timestamptz nullable
- expired_at timestamptz nullable
- refund_requested_at timestamptz nullable
- refunded_at timestamptz nullable
- expires_at timestamptz nullable
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

Recommended indexes:

- unique index on `merchant_order_no`
- index on `analysis_result_id`
- index on `analysis_request_id`
- index on `status, created_at`
- index on `provider, provider_trade_no`
- index on `module_slug, created_at`

Notes:

- Do not store `checkout_url` unless needed for debugging. It may contain provider/session state and can go stale.
- Do not store full `return_url_used` by default; if needed, store an environment/category, not tokenized URLs.
- Store provider-safe transaction refs needed for reconciliation, not full raw payloads.

## 5. entitlements Model

Future table:

```text
entitlements
- id uuid primary key
- entitlement_type text not null
- source text not null
- status text not null
- module_slug text not null
- analysis_request_id uuid not null references analysis_requests(id)
- analysis_result_id uuid not null references analysis_results(id)
- payment_intent_id uuid nullable references payment_intents(id)
- unlock_intent_id uuid nullable references unlock_intents(id)
- line_user_ref text nullable
- paid_access_token_hash text nullable
- paid_access_token_version text nullable
- access_token_last_rotated_at timestamptz nullable
- remaining_uses integer nullable
- expires_at timestamptz nullable
- revoked_at timestamptz nullable
- refunded_at timestamptz nullable
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

Recommended indexes:

- unique partial index on `paid_access_token_hash` where not null
- index on `analysis_result_id`
- index on `payment_intent_id`
- index on `unlock_intent_id`
- index on `status, created_at`
- index on `module_slug, created_at`

V0 values:

- `entitlement_type = single_paid_analysis`
- `source = payment_single`
- `status = active`
- `remaining_uses = null`

Future values:

- `entitlement_type`: `single_paid_analysis`, `future_relationship_pack`, `future_observation_pass`
- `source`: `payment_single`, `line_first_free`, `operator_test`, `future_pack`, `future_promo`

## 6. Paid Access Token Recommendation

Recommend Option B: store a neutral hashed `paid_access_token` on `entitlements` for v0.

Why:

- It avoids making LINE/short-code `unlock_intents` payment truth.
- It supports web-only payment access.
- It can be rotated/reissued for support without changing payment records.
- It can reuse current unlocked route UI while cleaning up internal semantics.

Token rules:

- Generate high-entropy opaque token.
- Store only `paid_access_token_hash`.
- Show raw token only in the URL/link.
- Allow support rotation by generating a new token and replacing the hash.
- Expire token with entitlement or paid-result retention policy.
- Do not store tokenized URLs.

Option C, a separate `paid_access_tokens` table, is cleaner for multi-device/multiple-link/revocation scenarios but is likely premature for NT$49 single-analysis v0.

## 7. Route / UX Relationship

Recommended v0 route strategy:

```text
/m/{moduleSlug}/unlock/{token}
```

Resolver order:

1. Try `entitlements.paid_access_token_hash`.
2. If not found, try legacy `unlock_intents.fulfillment_token_hash`.
3. If both fail, show safe invalid/expired copy.

Result:

- Existing pending/completed paid-result UI can remain.
- Web payment users do not need LINE.
- Existing LINE/short-code flows remain compatible.

Future cleanup:

- Consider `/m/{moduleSlug}/paid/{token}` only after payment flow is stable and legacy compatibility requirements are understood.

## 8. Relationship To unlock_intents

`unlock_intents` should remain:

- LINE LIFF bind context
- short-code fulfillment context
- delivery attempt tracking
- compatibility link infrastructure

It should not become:

- payment truth
- entitlement truth
- refund truth
- provider reconciliation truth

Allowed relationship:

- `payment_intents.unlock_intent_id` nullable for checkouts started from current fulfillment UI.
- `entitlements.unlock_intent_id` nullable for access originally delivered or later attached through LINE/short-code.

Payment launch should not require `unlock_intents.line_user_id`.

## 9. Relationship To generation_jobs

Payment success should:

```text
1. mark payment_intent paid
2. create entitlement active
3. create/reuse generation_jobs paid_analysis job
4. set generation_jobs.entitlement_ref_id = entitlements.id
5. use trigger_source = payment_success_future initially
6. publish reference-only queue trigger
```

Recommendation:

- Keep existing dedupe by module/result/prompt/schema for content idempotency.
- Add entitlement linkage to jobs created from payment success.
- Do not include payment provider data in job payloads.
- Continue writing completed output ref to `analysis_paid_results`.

Potential future enum cleanup:

- Rename or add `payment_success` once implementation is real. For now, existing `payment_success_future` is acceptable as a planning bridge.

## 10. Relationship To analysis_paid_results

`analysis_paid_results` remains:

- paid-result content lifecycle
- provider/fallback source record
- prompt/schema versioned content storage
- retry/error state
- retention target

It should not store:

- payment provider refs
- payment status
- entitlement status
- raw provider payment payload
- checkout URLs

Access rule:

- An active entitlement grants access to view the paid result when completed.
- If the paid result is pending/processing, the unlocked route polls `analysis_paid_results` and `generation_jobs`.
- If a paid result already exists, a new entitlement can reuse it rather than regenerating.

## 11. NewebPay Provider References

Store only reconciliation-safe provider references:

- `MerchantOrderNo`
- `TradeNo` or equivalent provider transaction ref
- `Amt`
- `ItemDesc` category or sanitized product label
- provider `Status`
- `PaymentType` if available
- `PayTime`
- provider response code/category
- verified notify timestamp

Do not store:

- full card number
- CVV
- raw card data
- HashKey/HashIV
- full unredacted provider payload unless explicitly approved and sanitized/encrypted
- tokenized app URLs
- raw private relationship input

Provider verification:

- Only server-side verified notify/return should mark payment `paid`.
- Client return alone should show "verifying payment" until server confirmation exists.

## 12. Payment Lifecycle

Statuses:

- `created`: local order exists.
- `checkout_started`: user was redirected to NewebPay.
- `paid`: verified server-side payment success.
- `failed`: provider confirms failure.
- `cancelled`: user cancels checkout if detectable.
- `expired`: payment intent expires without success.
- `refund_pending`: refund requested/initiated.
- `refunded`: refund completed.

Idempotency:

- `merchant_order_no` must be unique.
- Provider notify handling must be idempotent.
- A second successful notify for the same order must not create duplicate entitlements or jobs.

## 13. Entitlement Lifecycle

Statuses:

- `active`: user can view or wait for paid result.
- `consumed`: reserved for future limited-use packs.
- `expired`: access window ended or paid-result retention expired.
- `revoked`: support/admin invalidated access.
- `refunded`: payment refunded and access handled according to policy.

Open product decision:

- Whether NT$49 results are accessible indefinitely or only for the current retention window.

Current policy caution:

- Existing public copy and retention behavior should not promise permanent access unless retention policy is changed and approved.

## 14. Failure / Refund / Re-delivery

Payment paid, generation failed final:

- Keep entitlement active or mark a future `needs_support` flag/state.
- Show support/retry/refund/re-delivery copy.
- Allow operator retry or refund after verification.

Duplicate payment:

- Detect by `merchant_order_no`, provider trade no, existing active entitlement for same `analysis_result_id`, or support reconciliation.
- Refund duplicate after verification.

User loses link:

- Verify payment/order.
- Rotate/reissue `paid_access_token_hash`.
- Send new link without needing raw private input.

Refund completed:

- Mark `payment_intent.refunded`.
- Mark entitlement `refunded` or `revoked` depending policy.
- Do not delete audit-safe payment reconciliation refs prematurely.

LINE delivery failed:

- Web entitlement route remains the source of access.
- LINE can be retried as optional delivery only.

## 15. Privacy / Security Rules

Do not store in payment or entitlement tables:

- raw private relationship input
- `paid_result_json`
- full result JSON
- provider output
- full card number
- CVV
- raw card data
- raw provider payload by default
- LINE ID token
- short code
- unlock token
- paid access token
- tokenized URL
- secrets or provider keys

Allowed:

- hashed paid-access token
- sanitized provider refs
- payment status/category
- entitlement status/category
- result/request foreign keys
- hashed or non-reversible LINE reference only if needed later

Queue payload rule:

- safe job reference only.
- no raw content, token, payment payload, provider output, or LINE identifiers.

## 16. Metrics / Observability

Future event candidates:

- `payment_intent_created`
- `checkout_started`
- `payment_paid`
- `payment_failed`
- `entitlement_created`
- `paid_access_link_opened`
- `generation_job_queued`
- `queue_message_published`
- `queue_message_delivered`
- `processor_completed`
- `processor_failed_final`
- `refund_requested`
- `refund_completed`
- `redelivery_requested`
- `redelivery_completed`

Rules:

- Keep events aggregate/sanitized.
- Include `operatorTest` where applicable.
- Do not include order secrets, tokenized URLs, raw input, paid result JSON, LINE user IDs, provider payloads, or secrets.

## 17. Migration Strategy

### Phase 0 - This plan

No schema or code changes.

### Phase 1 - Schema migration plan

Draft exact SQL/Drizzle schema and indexes for `payment_intents` and `entitlements`. Add a decision log because this changes schema contracts.

### Phase 2 - Schema implementation

Add tables and repository helpers only. Runtime behavior remains unchanged behind disabled feature flags.

### Phase 3 - Fake/sandbox payment flow

Operator-only fake or sandbox payment callback creates `payment_intent`, `entitlement`, paid access token, and a `payment_success_future` job. Prove unlocked route polling without real checkout.

### Phase 4 - Queue provider POC

Publish reference-only queue message and process one staging paid-analysis job through signed callback.

### Phase 5 - NewebPay integration

Create checkout, verify notify/return server-side, mark payment paid, create entitlement, publish queue trigger.

### Phase 6 - Production payment smoke

Run controlled real/sandbox payment, verify paid result, duplicate handling, refund/re-delivery SOP, and aggregate metrics.

## 18. What Not To Build Yet

Do not build yet:

- DB migration in this task
- NewebPay API integration
- checkout UI
- queue provider integration
- request-route enqueue-only switch
- LINE enqueue-only switch
- membership system
- relationship session memory
- 3-use pack
- 3-day observation pass
- admin refund console
- public account dashboard
- broad payment-provider abstraction
- ads

## 19. Recommended Next Step

Create `Payment / Entitlement Schema Migration Plan v0` only after human approval of:

- `payment_intents` as payment/order truth
- `entitlements` as access truth
- hashed `paid_access_token` on entitlement for v0
- existing `/unlock/{token}` route compatibility with a dual resolver

Do not write migration files until those schema-level decisions are approved.
