# Payment Launch Flow + Queue Trigger Architecture v0

Date: 2026-05-27

## 1. Summary

Recommendation:

- Keep LINE as a delivery/retention channel, not the authority for paid access.
- Add future payment/access truth through `payment_intents` and `entitlements`.
- Keep the existing tokenized unlocked route pattern for v0 paid access, but authorize paid access from entitlement/payment state rather than LINE binding.
- Keep `analysis_paid_results` as the delivery truth for completed paid content.
- Keep `generation_jobs` as the durable paid-analysis work queue table.
- Use a QStash-like signed webhook queue as the preferred payment-launch trigger after a staging proof.
- Keep Vercel Hobby daily cron only as recovery/readiness, not interactive paid delivery.

Target launch flow:

```text
free result
-> user clicks unlock
-> create payment intent/order
-> redirect to NewebPay checkout
-> payment return/webhook confirms server-side success
-> create entitlement
-> create/reuse generation_jobs paid_analysis job
-> publish reference-only queue message
-> signed queue callback triggers processor
-> unlocked route polls status
-> completed paid result renders
-> optional LINE delivery/follow-up bind
```

This task did not implement payment, queue, schema, LINE, prompt, or runtime changes.

## 2. Current Durable Foundation

Current useful foundation:

- `analysis_paid_results` stores paid-result lifecycle and completed `paidResultJson`.
- `unlock_intents` stores fulfillment code/token hashes, LINE binding state, short-code delivery state, and token expiry.
- `POST /api/unlock-intent` creates a current unlock intent, fulfillment code, fulfillment token, and LIFF URL context.
- `POST /api/modules/[moduleSlug]/paid-result/request` calls `requestDeferredPaidGeneration` for current web unlock requests.
- LIFF bind and short-code webhook can trigger paid generation with `line_bind` and `short_code` trigger sources.
- `generation_jobs` supports `paid_analysis`, lifecycle statuses, dedupe key, trigger source, input/output refs, attempts, lock state, and operator-test marking.
- `payment_success_future` already exists as an allowed future generation job trigger source.
- `POST /api/internal/jobs/process` is a secret-gated processor endpoint.
- `GET /api/cron/paid-generation` is a secret-gated cron wrapper around the same processor.
- `POST /api/modules/[moduleSlug]/paid-result/status` maps paid-result rows and generation-job rows into external polling states.
- `/m/[moduleSlug]/unlock/[unlockToken]` is already the user-facing pending/completed paid-result route.

Current limits:

- `unlock_intents` are LINE/short-code fulfillment-shaped and should not become the long-term payment truth.
- Current paid request route still requires an `unlockIntentId`.
- Vercel Hobby Cron can only act as low-frequency recovery, not low-latency post-payment generation.
- There is no payment order model, entitlement model, NewebPay verification model, or queue publisher yet.

## 3. Target Payment Launch Flow

Recommended v0 payment launch sequence:

```text
1. User views free result.
2. User clicks paid unlock.
3. Server creates payment_intent in status created.
4. Server creates or reserves a tokenized paid access path for the result.
5. User is redirected to NewebPay checkout.
6. NewebPay return/notify is verified server-side.
7. Server marks payment_intent paid.
8. Server creates entitlement for single_paid_analysis.
9. Server creates/reuses paid_analysis generation_jobs row with triggerSource payment_success_future.
10. Server publishes a queue message containing only a safe job trigger reference.
11. Queue calls a signed/authenticated endpoint.
12. Processor claims due paid_analysis jobs and writes analysis_paid_results.
13. User lands on /m/{moduleSlug}/unlock/{token}.
14. Pending poller shows queued/processing state until analysis_paid_results is completed.
15. Completed paid content renders.
16. Optional secondary LINE delivery CTA can bind/save/send the completed result.
```

Payment success should be the trigger for entitlement and paid generation. LINE binding should not be required for a paid user to get the full analysis.

## 4. Payment Intent / Order Model

Minimum future model:

```text
payment_intents
- id
- provider
- merchant_order_no
- module_slug
- analysis_request_id
- analysis_result_id
- unlock_intent_id nullable
- amount
- currency
- status
- provider_status
- provider_transaction_ref nullable
- checkout_started_at nullable
- paid_at nullable
- failed_at nullable
- cancelled_at nullable
- expires_at nullable
- created_at
- updated_at
```

Minimum statuses:

- `created`
- `checkout_started`
- `paid`
- `failed`
- `cancelled`
- `expired`
- `refunded`

Rules:

- `merchant_order_no` should be unique and safe to reconcile.
- Store only provider-safe transaction references needed for reconciliation.
- Do not store full card data.
- Do not store unsanitized raw provider payload by default.
- If raw provider webhook evidence is needed for audit, store a sanitized digest or separate encrypted/redacted audit artifact only after explicit design approval.

## 5. Entitlement Model

Minimum future model:

```text
entitlements
- id
- entitlement_type
- module_slug
- analysis_result_id
- payment_intent_id nullable
- unlock_intent_id nullable
- line_user_ref nullable
- status
- source
- remaining_uses nullable
- expires_at nullable
- created_at
- updated_at
```

V0 entitlement:

- `entitlement_type = single_paid_analysis`
- `source = payment_single`
- `status = active`
- `remaining_uses = null`
- tied to one `analysis_result_id`

Future sources:

- `payment_single`
- `line_first_free`
- `operator_test`
- `future_pack`
- `future_promo`

Recommendation:

- Entitlement should be separate from `unlock_intents`.
- `unlock_intents` remain fulfillment/session/link objects.
- `entitlements` become product access grants.

## 6. Relationship To unlock_intents

Recommended relationship:

- Keep `unlock_intents` for current LINE/LIFF and short-code fulfillment.
- Add `payment_intents` as payment/order truth.
- Add `entitlements` as paid-access truth.
- Keep tokenized access route `/m/{moduleSlug}/unlock/{unlockToken}` for v0 user experience.
- Allow a paid access token to be created or reused for a paid entitlement without requiring LINE binding.

V0 access-token recommendation:

- Reuse the current unlocked route and tokenized access pattern.
- Do not require LINE identity for web-paid access.
- Do not make `unlock_intents.line_user_id` the proof of paid access.
- Payment success should create or associate an entitlement and a safe access token.

Open implementation choice for the next phase:

- Either reuse `unlock_intents.fulfillmentToken` as the access token for v0 payment launch.
- Or introduce a neutral `paid_access_tokens` / entitlement access token model.

Recommendation for minimal launch:

- Reuse the current unlocked route and token shape at the UI/routing layer.
- Avoid overloading LINE-specific fields as the long-term authorization source.
- If schema work is approved, prefer a neutral entitlement access token model over adding more payment semantics into `unlock_intents`.

## 7. Queue Trigger Strategy

Preferred payment-launch trigger:

```text
payment success service
-> create/reuse generation_jobs row
-> publish reference-only queue message
-> queue signs callback
-> callback triggers processor
-> processor claims due paid_analysis jobs
```

Recommended provider candidate:

- QStash-like webhook queue.

Reason:

- It is event-triggered rather than polling.
- It fits Vercel serverless callbacks.
- It can keep the current processor as the only paid-generation executor.
- It supports signed delivery and retry concepts that match the current `generation_jobs` idempotency model.

Queue endpoint choice:

- Prefer a dedicated queue callback wrapper, for example `/api/queue/paid-generation`, rather than exposing QStash directly to `/api/internal/jobs/process`.
- The queue wrapper should verify provider signature, reject invalid callbacks, and call `processPaidAnalysisJobs({ limit: 1 })`.
- The existing internal processor endpoint should remain available for operator/internal triggers.
- The cron wrapper should remain recovery/readiness only.

Queue message shape:

```json
{
  "jobType": "paid_analysis"
}
```

Optional if needed:

```json
{
  "jobType": "paid_analysis",
  "jobRef": "server-side-safe-reference"
}
```

Recommendation:

- Start with trigger-only message if the processor can claim due jobs reliably.
- Add `jobRef` only if latency/fairness requires targeted processing.
- Do not include raw job data or tokenized access data.

## 8. Queue Provider POC Requirements

Staging QStash-like POC should prove:

1. A staging-only operator/test route or script can publish a reference-only message.
2. Queue callback reaches a dedicated authenticated endpoint.
3. Invalid/missing queue signature is rejected.
4. Valid callback returns aggregate-only processor results.
5. One `paid_analysis` job can move through queued/processing/completed.
6. Retry behavior is observed with a safe forced failure.
7. Queue dashboard/logs do not contain raw input, paid result JSON, provider output, LINE IDs, unlock tokens, short codes, tokenized URLs, payment secrets, or provider payloads.
8. Cost/free-tier fits expected early launch volume.
9. The callback is idempotent under duplicate delivery.
10. Existing manual/internal processor path still works.

POC should not implement NewebPay or real checkout.

## 9. Web Payment → Polling UX

Recommended UX:

```text
payment success return
-> /m/{moduleSlug}/unlock/{token}
-> immediate pending state
-> status polling
-> completed paid result
```

Copy/state guidance:

- `queued`: "我們已收到付款，正在排隊整理完整分析。"
- `processing`: "正在整理你的完整分析。"
- `retry_scheduled`: "系統正在重試整理，請先保持這個頁面。"
- `completed`: render paid content.
- `failed_final`: show safe support/refund/re-delivery path.
- `expired`: show safe support/re-delivery path if payment can be verified.

Latency expectations:

- 0-90 seconds: acceptable.
- 90-180 seconds: show reassuring delayed copy.
- More than 3 minutes: show support/retry/re-delivery guidance.

The route should not require manual refresh. Polling should be the primary post-payment waiting experience.

## 10. LINE Optional Delivery

LINE should remain available after payment, but optional:

- "Send/save this result to LINE"
- "Use LINE for follow-up"
- "Save this relationship thread"

Recommended post-payment LINE flow:

```text
completed web paid result
-> secondary LINE CTA
-> LIFF bind
-> send/save completed link or future follow-up hook
```

Rules:

- LINE binding should not be required to view web-paid content.
- LINE delivery failure should not block web access.
- LINE user identifiers should stay out of queue payloads.
- Existing LIFF and short-code fulfillment should remain unchanged until a separate implementation handoff.

## 11. Short-code Role

Future role:

- fallback/recovery only.

Use cases:

- Desktop user wants to move delivery to LINE.
- LIFF fails.
- Support needs to re-deliver an already paid result.
- Operator needs a recovery path during early launch.

UX recommendation:

- Primary: web checkout/payment success/polling.
- Secondary: LINE optional delivery.
- Fallback: "無法開啟？使用領取碼".

Do not remove short-code before payment launch. Demote it only after web payment and LINE optional delivery are verified.

## 12. Failure / Refund / Re-delivery States

Plan for these states:

- Payment paid, generation queued too long.
- Payment paid, generation failed final.
- Duplicate payment.
- Payment success but user closes browser.
- LINE delivery failed but web result is available.
- Web result available but user lost link.
- Queue callback failed or delayed.
- Provider fallback used.

Recommended handling:

- Paid but queued too long: keep polling plus support note.
- Paid but failed final: support/retry/refund/re-delivery path.
- Duplicate payment: refund after verification.
- Browser closed: payment intent/entitlement allows support re-delivery.
- LINE failed: web unlocked route remains source of access.
- Lost link: support can re-deliver using order verification.
- Queue delayed: cron/operator processor can recover.
- Provider fallback: mark source safely, keep content if it passes product quality rules.

Do not define final legal/refund policy here. This is product/ops architecture guidance only.

## 13. Security / Privacy

Queue payload must not contain:

- raw input
- `paid_result_json`
- provider output
- LINE user ID
- unlock token
- short code
- tokenized URL
- email
- payment secret
- raw NewebPay payload
- provider keys or signing keys

Queue payload may contain:

- `jobType`
- safe job reference if necessary
- non-sensitive trigger metadata if needed, such as environment or version

Auth requirements:

- NewebPay return/notify verification must be server-side.
- Queue callback must verify provider signature.
- Internal processor endpoint must remain secret-gated.
- Cron wrapper must remain secret-gated.
- Idempotency must be enforced at DB/job layer, not only at queue layer.

Data rules:

- Payment tables should store reconciliation-safe references, not sensitive payment instrument data.
- Entitlements should reference product access, not raw user content.
- Processor should fetch sensitive context server-side from DB using safe refs.
- Events/metrics should remain aggregate/sanitized and operator-test filterable.

## 14. Metrics / Observability

Future event/metric candidates:

- `payment_intent_created`
- `checkout_started`
- `payment_paid`
- `payment_failed`
- `entitlement_created`
- `generation_job_queued`
- `queue_message_published`
- `queue_message_delivered`
- `processor_completed`
- `processor_failed_final`
- `unlocked_result_view`
- `refund_requested`
- `refund_completed`
- `redelivery_requested`
- `redelivery_completed`

Rules:

- Metrics must not include raw input, full result JSON, paid-result JSON, tokenized URLs, LINE IDs, payment secrets, provider output, or raw provider payloads.
- Metrics should include `operatorTest` when applicable so QA traffic can be filtered.
- For early launch, aggregate dashboard/reporting is enough; do not build an admin dashboard yet.

## 15. Implementation Phases

### Phase 0 - This plan

Document target payment launch architecture and queue trigger direction.

### Phase 1 - Payment/entitlement schema plan

Design `payment_intents`, `entitlements`, and access-token relationship. Produce a migration plan only after human approval.

### Phase 2 - QStash staging POC

Implement a staging-only queue publish/callback proof with reference-only payload, signature verification, aggregate-only response, duplicate delivery safety, and one paid-analysis job completion.

### Phase 3 - NewebPay integration

Create payment intent, redirect to checkout, verify return/notify, mark paid, create entitlement, create/reuse job, publish queue message.

### Phase 4 - Web payment polling UX

Wire payment success return to unlocked pending route. Add paid/payment-aware delayed/failure/support states.

### Phase 5 - LINE optional delivery

Add secondary LINE save/send/follow-up CTA after paid web result. Keep short-code as fallback.

### Phase 6 - Production payment smoke

Run a small controlled payment or sandbox payment smoke. Verify refund/re-delivery process before ads or broader traffic.

## 16. What Not To Build Yet

Defer:

- real NewebPay integration
- QStash/Inngest/Trigger.dev integration
- payment DB migrations
- checkout UI
- request-route enqueue-only switch
- LINE enqueue-only switch
- external worker service
- membership system
- relationship session memory
- 3-use packs
- 3-day observation
- admin refund console
- multi-model routing
- Module 02 queue flow
- ads

## 17. Recommended Next Step

Wait for NewebPay review/approval. Then run one of two next handoffs:

- Preferred: `Payment/Entitlement Schema Plan v0`, to lock the payment access model before any migration.
- If payment approval arrives first: `QStash Staging POC v0`, limited to reference-only queue trigger and existing paid-analysis processor.

Do not implement queue provider integration until the owner approves adding the vendor and has reviewed the POC security constraints.
