# Paid Access Token Resolver Plan v0

Date: 2026-05-27

## 1. Summary

The `pa_` paid access token resolver should be implemented before NewebPay checkout/provider runtime.

Reasoning:

- Checkout success must land users on a stable paid access route.
- NewebPay notify should not need to know UI details; it should create/reuse entitlement, issue a `pa_` token, enqueue paid generation, and return a route target.
- The existing unlocked route currently resolves legacy LINE/short-code fulfillment tokens only.
- A minimal resolver can be tested with operator-only fake paid success before real payment provider risk is introduced.

Recommended implementation order:

1. Minimal `pa_` token resolver plan and tests.
2. Operator-only fake paid success to create entitlement + token.
3. Unlock route dual resolver: `pa_` entitlement token first, legacy unlock intent token second.
4. Generation job recovery behavior for entitlement-backed access.
5. NewebPay checkout/notify/return after provider approval.

## 2. Token Model

### What a `pa_` token represents

A `pa_` token is a private bearer access proof for one paid entitlement.

It proves access to a specific paid analysis entitlement, not identity, account ownership, LINE binding, or payment provider trust by itself.

The payment truth remains `payment_intents`. Access truth remains `entitlements`.

### Token shape

Use opaque random tokens.

Current helper shape:

- Prefix: `pa_`
- Randomness: 32 random bytes.
- Encoding: base64url.
- Expected visible length: `pa_` plus 43 base64url characters.
- Pattern: `pa_[A-Za-z0-9_-]{43}`.

This is sufficient entropy for bearer-link access when paired with rate limiting and hash-at-rest storage.

### Signed vs derived vs opaque

Recommendation: keep opaque random tokens.

Do not derive tokens from payment IDs, entitlement IDs, order IDs, analysis result IDs, or LINE IDs.

Do not use signed tokens for v0. Signed tokens are self-describing and make accidental data exposure more likely. Opaque tokens keep all access state server-side.

### Hash-at-rest

`pa_` tokens must be hash-at-rest.

Current helper uses HMAC-SHA256 with `PAID_ACCESS_TOKEN_HASH_SECRET`. This is the right model:

- Raw token is returned once to link creation/redirect code.
- DB stores only `paid_access_token_hash`.
- Lookup hashes the incoming raw token and compares by hash.

### Storage location

Store token hash on `entitlements.paid_access_token_hash`.

Related entitlement fields:

- `paid_access_token_expires_at`
- `paid_access_token_last_used_at`
- `paid_access_token_last_rotated_at`
- `remaining_uses`
- `expires_at`
- `status`

### Token creation ownership

Token creation belongs to an entitlement access-token service, not directly to NewebPay notify code.

Recommended future service boundary:

```text
createOrReusePaidEntitlementAccess(input)
```

Responsibilities:

- Create or reuse entitlement.
- Generate or rotate raw `pa_` token according to policy.
- Store hash only.
- Return normalized access object and raw token only to caller.

## 3. Resolver Contract

### Route contract

Use the existing route shape:

```text
/m/{moduleSlug}/unlock/{token}
```

Resolver behavior:

1. If token matches `pa_` token shape, resolve entitlement.
2. Otherwise, resolve existing legacy unlock intent token.

This preserves current LINE/short-code behavior while allowing checkout return to land on the same user-facing unlocked route.

### Internal resolver contract

Recommended internal function:

```text
resolvePaidAccessToken(input: {
  moduleSlug: string;
  rawToken: string;
  now?: Date;
}): PaidAccessResolution
```

### Normalized access object

The resolver should return a normalized access object, not raw DB rows.

Recommended shape:

```text
{
  ok: true,
  accessKind: "paid_access_token",
  moduleSlug,
  entitlementId,
  paymentIntentId,
  analysisRequestId,
  analysisResultId,
  generationJobId,
  entitlementStatus,
  accessStatus,
  paidResultStatus,
  result,
  paidResult,
  theme
}
```

The route can use this object to decide render state without leaking payment internals to the client.

### What not to return

Do not return:

- Raw token.
- Token hash.
- Provider raw payload.
- Provider response payload.
- Merchant secrets.
- LINE IDs.
- Dedupe keys.
- Internal job lock data.
- Full payment provider records.

### Public error states

Safe public states:

- `invalid`
- `expired`
- `revoked`
- `refunded`
- `pending`
- `processing`
- `failed`
- `completed`

Internal details can be logged as sanitized categories only.

## 4. Access State Handling

### Valid entitlement + paid result ready

Render paid content immediately.

Resolver state:

- `accessStatus = completed`
- `paidResultStatus = completed`

### Valid entitlement + generation pending

Render pending poller.

Resolver state:

- `accessStatus = pending`
- `paidResultStatus = pending`

### Valid entitlement + generation processing

Render processing poller.

Resolver state:

- `accessStatus = processing`
- `paidResultStatus = processing`

### Valid entitlement + generation failed

Render support/retry/refund copy.

Resolver state:

- `accessStatus = failed`
- Include safe category such as `paid_generation_failed`.
- Do not expose provider error details.

### Valid entitlement + no generation job yet

Recommended v0 behavior:

- Resolver may create/reuse a `generation_jobs` row only through a dedicated recovery service, not inline route logic.
- If resolver remains read-only in first implementation, show pending and rely on operator/processor recovery.

Preferred implementation after operator fake-paid path:

- Add an idempotent recovery helper that can create/reuse a `paid_analysis` job for active entitlement when missing.
- Keep this helper side-effect small and covered by tests.

### Invalid token

Render safe invalid/expired copy.

Do not reveal whether token format was close, hash lookup missed, module mismatched, or entitlement existed.

### Expired token

If `paid_access_token_expires_at` is used and expired:

- Return `expired`.
- Do not rotate automatically in public route.
- Support can reissue if payment/entitlement is valid.

### Revoked/refunded entitlement

Return:

- `revoked` for revoked entitlement.
- `refunded` for refunded entitlement.

User copy should explain access is no longer active and provide support direction.

### Duplicate/replayed access

Treat `pa_` URLs as bearer links. Multiple opens are allowed unless `remaining_uses` is explicitly set.

Do not consume single-use access in v0. Paid result is expected to be re-openable.

### Short-code fallback access

Legacy short-code access remains through `unlock_intents`, not `pa_` tokens.

Future support can reissue a `pa_` token for paid entitlement recovery, but short-code should not become the primary paid access proof.

### LINE optional delivery access

LINE binding can attach later as delivery/retention metadata.

LINE should not be required to resolve a `pa_` token.

## 5. Security / Privacy

### Token guessing

Opaque 32-byte random tokens make guessing infeasible.

Required protections:

- Hash-at-rest.
- Constant public error copy for invalid/missing tokens.
- Rate limiting for unlock route/status API lookup attempts.
- No raw token in event metadata or logs.

### Logs

Token values should never appear in logs.

Allowed logs:

- `tokenKind = paid_access`
- `lookupResult = miss | hit | expired | refunded | revoked`
- `moduleSlug`
- aggregate counts
- sanitized error category

Forbidden logs:

- Raw `pa_` token.
- Token hash.
- Full URL.
- Payment provider payload.
- Provider secrets.
- LINE IDs.
- Raw input or paid result JSON.

### Bearer link policy

Treat `pa_` URLs as private bearer links.

They may be re-openable by the purchaser and shareable in the technical sense, but product copy should not encourage broad sharing.

If account-based access is added later, `pa_` token can become a bootstrap/recovery link rather than the only access proof.

## 6. Idempotency / Recovery

### Entitlement exists but generation job is missing

Recommended behavior:

- Resolver should not fail.
- User should see pending state.
- Recovery path should create/reuse `generation_jobs` idempotently.

Implementation options:

1. Read-only resolver v0 plus operator/manual recovery.
2. Resolver calls a narrow recovery helper to create/reuse missing job.

Recommendation:

- Start with read-only resolver for minimal risk.
- Add idempotent recovery helper in the operator fake-paid implementation phase if missing-job cases are common.

### Manual recovery

Support/operator recovery should:

- Verify payment intent and entitlement are active.
- Rotate/reissue `pa_` token if needed.
- Create/reuse missing paid generation job if needed.
- Trigger processor manually or through signed internal endpoint.

### Processor interaction

The resolver should not directly run provider generation.

It can rely on:

- Existing processor endpoint for job execution.
- Trigger-only queue wrapper when available.
- Cron/manual fallback for recovery.

## 7. Web Polling Contract

### Frontend polling

The unlocked route should render one of:

- Completed paid content.
- Pending poller.
- Processing poller.
- Failed/support state.
- Expired/revoked/refunded state.

Status API should accept a token and return only safe states.

Recommended future API:

```text
POST /api/modules/[moduleSlug]/paid-result/status
```

It can be extended to resolve both:

- legacy unlock token
- `pa_` paid access token

### Public statuses

Use:

- `pending`
- `processing`
- `completed`
- `failed`
- `expired`
- `revoked`
- `refunded`

### Retry intervals

Conceptual defaults:

- First 30 seconds: 2-3 second interval.
- 30-120 seconds: 5 second interval.
- Beyond 120 seconds: 10-15 second interval and show delayed copy.

### User-facing copy

Pending:

```text
正在整理你的完整分析，通常需要一小段時間。
```

Delayed:

```text
系統還在整理中。你可以先保留這個頁面，稍後再回來。
```

Failed:

```text
這次完整分析沒有順利產生。請聯絡客服，我們可以協助補發或退款。
```

Revoked/refunded:

```text
這個完整分析連結目前已停止使用。若你認為這是錯誤，請聯絡客服。
```

Expired:

```text
這個完整分析連結已過期。若已付款，請聯絡客服協助補發。
```

### ReturnURL landing

ReturnURL can safely land on:

- `/m/{moduleSlug}/unlock/{paidAccessToken}` if notify has already verified payment and issued token.
- A temporary payment pending route if notify has not arrived.

Do not let ReturnURL mark paid without server-side verification.

## 8. DB Constraints And Follow-up Migrations

### Token hash uniqueness

Already covered:

- `entitlements_paid_access_token_hash_idx`
- Partial unique index where hash is not null.

This should remain mandatory before payment launch.

### Entitlement/payment intent uniqueness

Current state:

- Service-level uniqueness recommendation only.

Recommendation:

- Add a DB-level unique partial index before payment runtime launch:

```text
unique entitlements.payment_intent_id where payment_intent_id is not null
```

Reasoning:

- Duplicate provider notify should never create duplicate paid access.
- DB-level protection is safer than service-only idempotency for payment callbacks.

This requires a separate migration task and decision log.

### Analysis result duplicate purchases

Do not add a unique index on `analysis_result_id` yet.

Reasoning:

- Duplicate purchase/refund policy is product/support behavior.
- A user may technically start multiple payment attempts for the same result.
- Enforce active-access reuse at service level first.

## 9. Integration Boundaries

### Future NewebPay notify

Notify should call a payment access service:

```text
handleVerifiedPaymentSuccess(paymentIntent)
```

Responsibilities:

- Idempotently mark payment paid if needed.
- Create/reuse entitlement.
- Issue or reuse/rotate `pa_` token per policy.
- Create/reuse `paid_analysis` generation job.
- Publish trigger-only queue event if enabled.
- Return safe redirect/access information to caller.

### Generation jobs

Generation job should reference:

- `input_ref_type = analysis_result`
- `input_ref_id = analysis_result_id`
- `entitlement_ref_id = entitlement.id`
- `trigger_source = payment_success_future` initially

Payment intent ID can be reached through entitlement if needed.

### Queue trigger

Queue trigger should not receive sensitive payload.

Recommended payload:

```json
{
  "jobType": "paid_analysis"
}
```

The processor claims due jobs from DB.

### Refunds and revocations

Refund/revocation should:

- Mark payment/entitlement state.
- Make resolver return `refunded` or `revoked`.
- Avoid deleting paid result immediately; retention cleanup can handle old records.
- Prevent access through the `pa_` token after state change.

## 10. Recommended Implementation Phases

### Phase 1 — Resolver Design Tests

Add unit tests for token shape, hash lookup, resolver states, and legacy fallback preservation.

### Phase 2 — Minimal `pa_` Resolver

Implement internal resolver and unlocked route dual-resolution.

No checkout. No provider code.

### Phase 3 — Operator-only Fake Paid Success

Secret-gated operator route or script creates:

- payment intent
- entitlement
- `pa_` token
- generation job

Used for staging QA only.

### Phase 4 — Status API Extension

Allow paid result status polling through `pa_` token and legacy token.

### Phase 5 — Queue Trigger POC

Trigger-only signed queue wrapper calls processor.

### Phase 6 — NewebPay Runtime

Add checkout/return/notify behind flags after provider approval.

### Phase 7 — Production Payment Smoke

Controlled payment, paid generation, refund/re-delivery SOP.

## 11. Recommendation

Implement the minimal `pa_` token resolver before NewebPay checkout creation.

Do not implement checkout first.

The resolver is the safer next seam because it proves:

- paid web access can work without LINE,
- entitlement tokens can resolve securely,
- pending/completed/failed states render correctly,
- operator fake payment can exercise the core post-payment path before provider integration.

## 12. Recommended Next Step

Run `Paid Access Token Resolver Implementation v0` with no payment provider integration and no checkout.

Then run `Operator-only Fake Paid Success v0` on staging before NewebPay runtime work.
