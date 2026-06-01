# LINE Recovery Binding Reframe v0

Date: 2026-06-01
Branch: `staging`
Scope: investigation and plan; no runtime implementation

## Summary

LINE recovery binding should not reuse the current legacy fulfillment flow directly. The current LIFF/webhook infrastructure has useful primitives, but it is still organized around unlock-intent fulfillment, short codes, unlock tokens, and link delivery. The safer v0 path is to introduce recovery-specific LIFF state helpers and tests first, then implement a staging LINE recovery bind flow in a separate task.

Recommended path: Option B, add recovery-specific LIFF state helpers and tests next. Do not implement full LINE recovery binding, LINE push, Email sending, membership, or paid report delivery in this task.

## 1. Existing LINE / LIFF Infrastructure Inventory

### Reusable

| Area | Current file(s) | Reuse value |
| --- | --- | --- |
| LINE identity verification | `apps/web/src/lib/line/liff.ts` | `verifyLineIdToken` can verify LIFF ID token and return LINE subject. The recovery route can reuse this, then immediately hash and avoid storing raw LINE user ID. |
| LIFF environment config | `apps/web/src/lib/line/config.ts` | `getLineLiffId`, `getLineLiffBaseUrl`, and app-base helpers can be adapted for recovery-specific LIFF URLs. |
| LIFF client bridge pattern | `apps/web/src/components/line/LineFulfillBridge.tsx` | Shows existing LIFF SDK init/login/token flow and failure fallback patterns. Recovery should use a separate bridge, not this one directly. |
| Webhook signature/dedupe/rate-limit primitives | `apps/web/src/lib/line/webhook.ts`, `apps/web/src/lib/line/webhook-hardening.ts`, `line_webhook_events`, `line_webhook_rate_limits` | Useful for future short-code/support interactions. Not needed for LIFF recovery bind v0 unless short-code fallback is added. |
| Recovery contact service | `apps/web/src/lib/db/payment-recovery-contacts.ts` | Already supports `contact_type=line`, hash-only `line_user_hash`, statuses, transactional consent, marketing opt-in, and result/payment/entitlement linkage. |
| Recovery UI slots | checkout-start and completed-result save sections | Already show deferred LINE option as recovery/support only. Good insertion points after a real recovery bind exists. |
| Privacy/event guards | `apps/web/src/lib/events/types.ts`, tests | Existing forbidden metadata keys reject raw LINE IDs, tokens, URLs, and codes in analytics metadata. |

### Legacy / fulfillment-specific

| Area | Current behavior | Why it should not be reused directly |
| --- | --- | --- |
| `LineFulfillBridge` | Parses `unlockIntentId`, `unlockToken`, and `code`; calls `/api/line/fulfillment/bind-liff`; redirects to unlock path. | It is built for claiming/opening an unlock result, not saving a paid-result recovery identity. It carries token-bearing semantics. |
| `buildLineLiffUrl` | Builds LIFF URL with `unlockIntentId`, `unlockToken`, and fulfillment code in query/state. | Recovery-specific state must not include raw `pa_`, `pcs_`, tokenized access URLs, or legacy unlock tokens. |
| `/api/line/fulfillment/bind-liff` | Verifies ID token, binds `unlock_intents` to raw `lineUserId`, triggers deferred paid generation, emits fulfillment events, returns unlock path. | Recovery binding should create/update `payment_recovery_contacts`, should not trigger paid generation, should not deliver a link, and should not store raw LINE user ID. |
| `/api/line/webhook` | Matches short-code text, replies with a pending/access URL, binds `unlock_intents`, and stores raw `lineUserId` on `unlock_intents`. | Useful for legacy fallback only. Recovery v0 should not send result links in LINE messages or expand raw ID storage. |
| `unlock_intents.line_user_id` | Stores raw LINE user ID. | Legacy privacy debt. Do not expand this pattern for recovery. Use `payment_recovery_contacts.line_user_hash` instead. |
| `ContactCapture` | Marketing/notification capture; can redirect to LIFF/add URL and show short code. | Copy is cleaned up, but it is not tied to paid entitlement/recovery context and should not become the paid recovery bind surface. |

### Safe for recovery binding

- Reuse LINE ID token verification.
- Reuse LIFF SDK init/login pattern.
- Reuse recovery contact hash-only LINE service helper.
- Reuse recovery summary state to show saved/unsaved.
- Reuse existing no-delivery copy constraints.

### Should not be reused

- Do not reuse unlock-intent token state for recovery.
- Do not reuse fulfillment short-code delivery as paid recovery v0.
- Do not call `requestDeferredPaidGeneration` from LINE recovery bind.
- Do not reply with paid report links in LINE messages.
- Do not store raw LINE user ID in new recovery records.

## 2. New LINE Product Semantics

Replace:

- `LINE 領取完整分析`
- `LINE 交付完整報告`
- `完整分析連結送給你`

With:

- `用 LINE 保存這份報告`
- `之後可以透過 LINE 找回`
- `完成通知 / 新測驗通知之後可選擇開啟`

Principles:

- Web access remains canonical paid report delivery.
- LINE does not receive full report content.
- LINE is a recovery identity and future owned channel.
- Transactional recovery consent is separate from marketing/new-module opt-in.
- LINE failure must never block checkout or paid result access.

## 3. Recovery-Specific LIFF State Design

Recommended design: short-lived server-side recovery bind state.

### State creation

Create a server-side bind intent before redirecting into LIFF.

Candidate table or server-side store:

- `payment_recovery_bind_states`

Fields:

- `id`
- `state_hash`
- `module_slug`
- `analysis_result_id`
- `payment_intent_id` nullable
- `entitlement_id` nullable
- `source`: `checkout_start | paid_ready | completed_result`
- `return_path`
- `marketing_opt_in_at` nullable
- `status`: `pending | bound | failed | canceled | expired`
- `expires_at`
- `created_at`
- `updated_at`

Only the opaque bind state token is sent to LIFF. Store only its hash server-side.

### What LIFF state may include

Allowed:

- opaque recovery bind state token
- optional non-sensitive `source`
- optional UI hint like `module=ambiguous-temperature`

Not allowed:

- raw `pcs_`
- raw `pa_`
- tokenized result/access URL
- unlock token
- raw report content
- raw source text
- Email
- raw LINE user ID

### Successful callback

Recovery bind API verifies:

- state token exists and is not expired
- state status is `pending`
- LINE ID token verifies
- module/result/payment/entitlement context is known from server-side state

Then it calls `createOrUpdateLineRecoveryContact`:

- `contact_type=line`
- `line_user_hash`
- `contact_hash`
- `source`
- `status=bound` when entitlement exists; otherwise `verified`
- `transactional_consent_at=now`
- optional `marketing_opt_in_at` only if separately selected

Then it marks bind state `bound` and redirects back to `return_path?recovery=line_saved`.

### Failure/cancel callback

Return to `return_path?recovery=line_failed` or `line_canceled`.

Do not leak state tokens in visible copy. Do not block checkout or report access.

## 4. Jump Failure / Fallback Behavior

### Mobile / LINE-friendly context

Initial priority:

- LINE primary
- Email secondary
- skip tertiary

If LINE bind succeeds:

- Show `已保存到 LINE`.
- Let user continue to NewebPay or return to completed report.
- Offer Email backup later.

If LINE bind fails/cancels:

- Return to same recovery surface.
- Show safe copy: `LINE 保存暫時沒有完成，你仍然可以繼續付款 / 查看報告。`
- Make Email primary.
- Keep LINE retry secondary.
- Keep skip/continue available.

### Desktop

Initial priority:

- Email primary.
- LINE secondary.
- Future option: QR or “用手機開啟 LINE 保存”.

Do not make desktop LIFF primary unless a QR/deep-link path is tested.

## 5. Data Model Mapping

Map successful LINE recovery bind to `payment_recovery_contacts`:

| Field | Value |
| --- | --- |
| `module_slug` | from server-side bind state |
| `analysis_result_id` | from server-side bind state |
| `payment_intent_id` | from state if available |
| `entitlement_id` | from state if available |
| `contact_type` | `line` |
| `contact_hash` | keyed hash of LINE user ID with recovery contact purpose |
| `contact_encrypted` | null |
| `line_user_hash` | same keyed hash |
| `email_hash` | null |
| `transactional_consent_at` | bind success time |
| `marketing_opt_in_at` | only if separate opt-in was selected |
| `source` | `checkout_start`, `paid_ready`, or `completed_result` |
| `status` | `verified` before entitlement; `bound` after entitlement |

Do not store raw LINE user ID in recovery tables. Existing raw `unlock_intents.line_user_id` is legacy fulfillment debt and should not be expanded.

## 6. API / Route Plan

Recommended route shape:

1. `POST /api/modules/[moduleSlug]/result/[resultId]/recovery/line/start`
   - Creates short-lived recovery bind state.
   - Requires recovery context and a safe return path.
   - Returns a LIFF URL or redirect URL.
   - Does not include `pa_`, `pcs_`, tokenized URLs, raw report content, or source text.

2. `GET /m/[moduleSlug]/recovery/line/bind`
   - Client LIFF bridge page.
   - Initializes LIFF, logs in if needed, obtains ID token.
   - Posts opaque state token and ID token to bind API.
   - Displays safe fallback if LIFF cannot run.

3. `POST /api/modules/[moduleSlug]/recovery/line/bind`
   - Verifies opaque state and LINE ID token.
   - Creates/updates LINE recovery contact.
   - Marks state success/failure.
   - Returns sanitized redirect target or status.

4. Optional `GET /api/modules/[moduleSlug]/recovery/line/status?state=...`
   - Only if a polling UX is needed.
   - Returns state category, never raw contact or token values.

How this differs from legacy unlock intent:

- Recovery bind state is not an unlock/access token.
- It does not deliver a paid report link.
- It does not trigger paid generation.
- It stores hashed LINE identity in `payment_recovery_contacts`, not raw LINE ID on `unlock_intents`.

## 7. UI Insertion Points

### Checkout-start recovery soft gate

Mobile/LIFF:

- Primary CTA: `用 LINE 保存這份報告`
- Secondary: `改用 Email 保存`
- Skip: `先略過，繼續付款`

Desktop:

- Primary: Email save.
- Secondary: `稍後用 LINE 保存` or QR/deep-link after tested.

Copy:

- `完整報告仍會在網頁中查看。LINE 只作為找回、完成通知與客服協助。`

Failure fallback:

- `LINE 保存暫時沒有完成，你仍然可以繼續付款。建議先用 Email 保存。`

### Paid-ready reminder

Primary CTA remains:

- `查看完整報告`

Secondary LINE CTA when unsaved:

- `用 LINE 保存找回方式`

Fallback:

- LINE failure does not block access; Email becomes primary.

### Completed result save section

If unsaved:

- Show Email primary on desktop.
- Show LINE primary only in reliable mobile/LIFF context.
- Copy: `保存這份完整分析，之後換裝置也能協助找回。`

If saved to LINE:

- `這份完整分析已保存到 LINE`
- Optional backup: `新增 Email 備用保存方式`

## 8. Test Plan

Plan tests before full staging bind:

- Recovery LIFF state builder does not include raw `pa_`, `pcs_`, unlock token, tokenized URL, raw source text, or report content.
- Recovery bind state expires and fails closed.
- Successful LINE bind creates/updates `payment_recovery_contacts` with `contact_type=line`, `line_user_hash`, and no encrypted/raw LINE payload.
- Failure/cancel returns safe fallback state.
- Email fallback remains available.
- LINE copy does not say paid report delivery.
- Marketing consent remains separate from transactional recovery consent.
- Existing Email recovery still works.
- `qa:result-checkout:no-card` still passes.
- Production routes remain fail-closed.

## 9. Implementation Recommendation

### Option A: plan only

Risk: lowest.

Value: clarifies direction, but does not make the route testable.

### Option B: recovery-specific LIFF state helpers and tests only

Risk: low.

Value: creates the safety boundary before any LINE bind UI or route. This is the recommended next implementation task.

Scope:

- Add bind-state token generation/parsing/hash helpers.
- Add safe return-path validation.
- Add tests proving forbidden token/contact fields cannot be embedded.
- No LIFF UI, no LINE push, no webhook change, no DB migration unless a bind-state table is separately approved.

### Option C: full staging LINE recovery bind path

Risk: medium.

Value: validates actual LINE recovery route before Module 02.

Concern:

- Existing LIFF reliability, state handling, and legacy unlock route assumptions need a safer foundation first.
- A bind-state table or equivalent server-side state store should be approved before full implementation.

Recommendation:

1. Implement Option B next.
2. Then run `LINE Recovery Bind State Schema / Route v0` if bind-state persistence is approved.
3. Then run `Checkout-Start LINE Recovery Bind Staging QA v0`.

## 10. Documentation / Dashboard Update

Dashboard updated to reflect:

- LINE should move from broad owned-channel planning into recovery-bind-state planning.
- The next LINE implementation should be recovery-specific state helpers, not legacy fulfillment reuse.

## Validation

Documentation-only validation:

- docs presence check: passed.
- dashboard HTML sanity: passed.
- secret/private scan: passed.
- `git diff --check`: passed.

No app code changed; app lint/test/build are not required unless code changes unexpectedly.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed:
  - `unlock_intents.line_user_id` stores raw LINE user ID for legacy fulfillment.
  - Legacy LIFF URLs include unlock tokens and fulfillment codes.
  - The current webhook can reply with result/access links, which should not be the recovery v0 model.
  - ContactCapture remains a generic notification capture component, not a paid recovery identity surface.
- Opportunistic cleanup completed: dashboard LINE roadmap wording updated.
- Deferred cleanup candidates:
  - Recovery-specific LIFF bind state helpers and tests.
  - Bind-state persistence design.
  - Legacy raw LINE ID storage retirement plan.
  - Recovery-specific LINE bind staging QA.

## Suggested Next Step

Run `LINE Recovery Bind State Helpers v0` before Module 02 implementation. If product strategy takes priority over channel infrastructure, Module 02 Concept Spec can follow after the helper boundary is defined.
