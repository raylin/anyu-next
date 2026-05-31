# Paid Result Recovery Channel Schema / UX Implementation Plan v0

Date: 2026-05-31

## Summary

This plan turns the paid-result recovery concept into a concrete schema and UX implementation sequence without applying any migration or runtime change.

Recommendation: create a dedicated recovery identity/contact table linked to Module 01 result/payment/entitlement lifecycle, capture transactional recovery consent separately from marketing consent, and add a checkout-start soft gate that lets users choose LINE, Email, or skip with warning. Recovery links should be fresh, short-lived, server-resolved magic links; do not send raw `pcs_` checkout session tokens or raw `pa_` paid access tokens through LINE or Email.

No schema, runtime, UI, LINE push, Email delivery, membership, payment, env, or production behavior was changed.

## 1. Current Architecture Recap

Current paid flow:

```text
payment_intent
→ NotifyURL paid verification
→ entitlement
→ paid access token hash
→ generation_job
→ paid result completed
→ pcs_ checkout session resolves status/access
→ session-bound payment access page renders completed paid result
```

Current access pieces:

- `payment_intents` stores provider, environment, `merchant_order_no`, module/result references, amount, status, provider fields, and payment timestamps.
- `entitlements` stores one paid lifecycle per non-null `payment_intent_id` on staging via partial unique index, paid access token hash, `generation_job_id`, optional `unlock_intent_id`, and `line_user_ref` seam.
- `generation_jobs` owns paid generation and queue/processor state.
- `pcs_` checkout session token is signed, includes module slug and merchant order number, and expires after 24 hours.
- `/m/[moduleSlug]/payment/return` is non-mutating and polls `/api/modules/[moduleSlug]/payment/status` with the `pcs_` token.
- `/m/[moduleSlug]/payment/access?checkoutToken=...` renders paid content only when the handoff resolves to `paid_ready`.
- `pa_` paid access tokens exist as entitlement bearer tokens and are stored only by hash; they should not be sent through LINE/Email.
- Legacy `/m/[moduleSlug]/unlock/[unlockToken]` and LINE fulfillment paths exist, but they are not the canonical paid checkout access path.

Recovery gap:

- A user can lose the ReturnURL, browser history, tab, or device context.
- The paid result is not attached to a reusable recovery identity today.
- Current support recovery is possible only manually through payment time/order reference and internal payment/entitlement lookup.
- Existing `ContactCapture` and `unlock_intents` are semantically tied to the old contact/fulfillment flow, not current paid checkout recovery.

## 2. Data Model Recommendation

### Options Evaluated

| Option | Recommendation | Reason |
|---|---|---|
| A. `payment_recovery_contacts` table | Recommended v0 | Cleanly separates contact/consent from provider state and can link to result, payment intent, and entitlement over time. |
| B. `entitlement_recovery_contacts` table | Not first | Too late for checkout-start capture because entitlement exists only after paid transition. Useful relation later. |
| C. Recovery fields on `payment_intents` | Avoid | Mixes user contact/consent into provider payment lifecycle and limits future cross-module identity. |
| D. `user_identity` / lightweight member seed | Defer | Strategically useful later, but too much membership surface for current launch-risk problem. |
| E. Reuse `ContactCapture` / `unlock_intents` | Avoid for v0 | Fast but semantically wrong: legacy unlock/LINE fulfillment assumptions conflict with web-based paid recovery. |

### Recommended v0 Table

Proposed name:

```sql
payment_recovery_contacts
```

Suggested fields, planning only:

| Field | Type direction | Notes |
|---|---|---|
| `id` | uuid primary key | Internal identifier. |
| `module_slug` | text not null | Start with `ambiguous-temperature`; future module-compatible. |
| `result_id` | uuid not null | Link to `analysis_results.id`. |
| `payment_intent_id` | uuid nullable | Set once checkout/payment intent exists. |
| `entitlement_id` | uuid nullable | Set after paid transition / delivery artifacts. |
| `contact_type` | text enum | `line` or `email`. |
| `contact_hash` | text not null | Stable keyed hash for lookup/dedupe. |
| `contact_encrypted` | text nullable | Reversible value for sending/support if approved. |
| `line_user_id_hash` | text nullable | Prefer hash over raw LINE ID. |
| `email_normalized_hash` | text nullable | Hash of normalized lowercase email. |
| `transactional_consent_at` | timestamptz not null | Required for recovery/completion/support use. |
| `marketing_opt_in_at` | timestamptz nullable | Separate optional consent. |
| `source` | text enum | `checkout_start`, `return_waiting`, `paid_ready`, `completed_result`, `support`. |
| `status` | text enum | `pending`, `verified`, `bound`, `failed`, `revoked`. |
| `created_at` / `updated_at` | timestamptz | Standard audit. |
| `last_used_at` | timestamptz nullable | Set when recovery link is used. |

Suggested indexes/constraints, planning only:

- index on `result_id`
- index on `payment_intent_id`
- index on `entitlement_id`
- unique partial index on `(result_id, contact_type, contact_hash)` where status is not revoked
- index on `(contact_type, contact_hash)` for support lookup
- optional index on `(module_slug, marketing_opt_in_at)` for future campaigns

### Storage Classification

- Raw `pcs_`: never store.
- Raw `pa_`: never store.
- Raw LINE user ID: avoid; use keyed hash. Store encrypted only if LINE Messaging API send requires a reversible target and owner approves.
- Email: store keyed hash plus encrypted normalized email if sending/support recovery is required.
- Merchant order number: already in `payment_intents`; avoid duplicating unless needed for support display or denormalized lookup.
- Result content: never store in recovery contact table.
- User raw input: never store in recovery contact table.

### Future Member Migration Path

Do not implement membership now. Keep recovery identity as a seed that can later map into:

```text
recovery contact
→ channel identity
→ lightweight member identity
→ cross-module module history / consent preferences
```

A future member system can adopt `contact_hash` / `line_user_id_hash` as identity links without making this v0 table an account table.

## 3. Email Storage Decision

### Needs

Support and future recovery require the ability to:

- match a user who writes in by email
- send a completion/recovery link if Email delivery is later approved
- avoid exposing email in analytics/event metadata
- delete or revoke contact if requested

### Options

| Strategy | Pros | Cons |
|---|---|---|
| Hash-only | Lowest exposure and easy dedupe | Cannot send recovery links; support cannot view address from DB. |
| Plain normalized email | Simple operationally | Higher privacy risk and unnecessary broad exposure. |
| Encrypted normalized email + hash | Supports sending/support while preserving lookup safety | Requires encryption key/rotation plan and access minimization. |

Recommendation: encrypted normalized email plus keyed hash.

Implementation notes for future task:

- `email_normalized_hash` for lookup/dedupe.
- `contact_encrypted` for send/support only.
- Do not put raw email into events.
- Do not expose raw email in dashboard/report logs.
- Keep access to decrypted email in service layer only.
- Define deletion/revocation behavior before production usage.

Hash-only is acceptable for Phase 1 hidden/internal tests, but it blocks actual Email recovery. Plain normalized email is not recommended for launch.

## 4. LINE Identity Decision

Current LINE/LIFF infrastructure:

- `ContactCapture` can send users to LINE add or LIFF URL but is legacy UI.
- `/line/fulfill` and `/m/[moduleSlug]/line/fulfill` parse LIFF state/context.
- `POST /api/line/fulfillment/bind-liff` verifies LINE identity and binds it to `unlock_intents` today.
- `/api/line/webhook` supports short-code matching, signature verification, dedupe, rate limiting, and safe replies.
- `unlock_intents.line_user_id` exists, but it belongs to legacy fulfillment state.

Recommended reuse:

- Reuse LIFF identity verification and state parsing patterns.
- Do not reuse `unlock_intents` as the recovery identity store.
- Create a new recovery binding flow that receives a server-issued short-lived `recoveryBindingState`, not raw `pcs_` or `pa_`.
- Store `line_user_id_hash` on the recovery contact record after LIFF bind succeeds.
- Keep LINE as recovery/notification/support channel, not report delivery.

Suggested LIFF flow:

```text
checkout-start
→ create recovery binding state server-side
→ open LIFF with recoveryBindingState only
→ LIFF verifies LINE identity server-side
→ bind hashed LINE user ID to payment_recovery_contacts
→ redirect back to checkout-start with success/failure/cancel state
```

Do not include in LIFF state:

- raw `pcs_`
- raw `pa_`
- provider payloads
- raw result content
- raw user input

Failure/cancel handling:

- if bind succeeds: show "已保存到 LINE"
- if bind fails: make Email primary and show LINE retry as secondary
- if user cancels: return to checkout-start and keep payment available

## 5. Recovery Token / Link Design

Options:

| Option | Recommendation | Reason |
|---|---|---|
| A. Regenerate `pa_` link | Not as direct message | `pa_` is bearer access; server can rotate internally but should not be exposed in LINE/Email. |
| B. Short-lived recovery token | Recommended | Lets server verify entitlement/contact and issue access safely. |
| C. Magic link with expiry | Recommended UX | User receives a safe link that resolves server-side. |
| D. Support-assisted only | Useful fallback | Reduces implementation, but does not solve self-service loss. |
| E. Permanent account history | Defer | Requires membership/login. |

Recommended v0:

- Create a `recoveryToken` only when needed, not at checkout by default.
- Token lifetime: 15-30 minutes for self-service links; up to 24 hours for support-issued links if owner approves.
- Token use: single-use or limited-use, with `last_used_at` and attempt counters.
- Token storage: store only keyed hash of token; never store raw token.
- Token resolution: verify token, contact binding, payment/entitlement status, and module/result match.
- Success behavior: create a fresh server-side access handoff or redirect to the canonical paid access page through a newly issued short-lived session/access path.
- Failure behavior: show safe recovery expired/invalid page with support link and no private content.

Message body rule:

```text
你的完整報告已準備好。請回到暗語 ANYU 網頁查看。
```

Do not include result summary, relationship content, raw access token, or provider data in LINE/Email message previews.

## 6. Checkout-Start Soft Gate UX

### A. Anonymous, No Recovery Identity

Show recovery soft gate before provider submit button.

Priority by context:

- LIFF/LINE in-app: LINE primary, Email secondary.
- Mobile browser: LINE primary or co-primary, Email secondary.
- Desktop: Email primary, LINE secondary with QR/LINE add path later.

Skip allowed with warning.

### B. LINE Binding Started

States:

- `line_binding_pending`: show "正在確認 LINE".
- `line_binding_success`: show "已保存到 LINE".
- `line_binding_failed`: Email becomes primary; LINE retry secondary.
- `line_binding_cancelled`: keep payment available; show Email primary.

### C. Email Entered

State:

- `email_saved`: show "已保存到 Email".
- offer "再加 LINE 備用" as secondary if useful.

### D. Already Has Recovery Identity

State:

- `recovery_saved`: show compact confirmation, not full gate.
- allow "更換 / 加備用方式".

### E. Future Logged-In Member

State:

- `member_saved`: skip soft gate or show "會保存到你的 ANYU 記錄".
- Do not implement now.

## 7. Copy Recommendations

Recovery section title:

```text
保存這次完整報告
```

Intro:

```text
付款完成後，完整報告會在網頁中提供查看。建議先保存一個找回方式，避免關掉瀏覽器或換裝置後找不到結果。
```

LINE option:

```text
用 LINE 保存找回方式
可用於完成通知、找回結果與必要客服協助；不會在 LINE 傳送完整報告內容。
```

Email option:

```text
用 Email 保存找回方式
適合不想使用 LINE 的使用者，可用於完成通知、找回結果與必要客服協助。
```

Skip:

```text
先略過，直接付款
```

Skip warning:

```text
如果略過，請付款後不要關閉完成頁，並建議立刻把結果頁加入書籤。若之後遺失連結，可能需要人工客服協助確認付款紀錄。
```

LINE failed/cancel fallback:

```text
LINE 綁定沒有完成。你可以改用 Email 保存找回方式，或先略過繼續付款。
```

Already saved:

```text
已保存找回方式。付款完成後，如果頁面遺失，我們可以用這個方式協助你找回結果。
```

Paid ready save CTA:

```text
保存這份報告的找回方式
```

Completed result save CTA:

```text
之後想回來看？保存找回方式
```

Avoid:

- `LINE 交付完整報告`
- `Email 交付完整報告`
- `註冊會員` as primary wording
- threatening copy that implies the user will lose access for skipping

## 8. Consent Model

Two categories:

### Transactional / Recovery Consent

Triggered by LINE or Email save action.

Purpose:

- this report recovery
- completion notification
- support around this payment/result

Recommended text:

```text
我同意暗語 ANYU 使用此聯絡方式處理這次完整報告的完成通知、找回結果與必要客服協助。
```

### Marketing / Re-engagement Consent

Separate optional checkbox.

Purpose:

- new modules
- early access
- discounts
- periodic insights

Recommended text:

```text
我也願意接收新測驗、早鳥體驗或優惠通知。
```

Recommendation:

- recovery action implies only transactional consent after explicit copy is shown.
- marketing checkbox is separate and optional.
- marketing can be asked later on completed result page if checkout-start feels too heavy.

## 9. Metrics / Events

Proposed events:

- `recovery_gate_viewed`
- `recovery_line_clicked`
- `recovery_line_bound`
- `recovery_line_failed`
- `recovery_email_submitted`
- `recovery_skipped`
- `recovery_warning_acknowledged`
- `paid_result_recovered`
- `marketing_opt_in`
- `module02_early_access_clicked` future

Dimensions:

- `device_context`: `line_in_app`, `mobile_browser`, `desktop`, `unknown`
- `module_slug`
- `source_page`: `checkout_start`, `return_waiting`, `paid_ready`, `completed_result`
- `paid_state`: `pre_payment`, `waiting`, `paid_ready`, `completed`
- `payment_status`: coarse status only
- `channel_selected`: `line`, `email`, `skip`
- `has_marketing_opt_in`: boolean

Privacy rules:

- no raw email
- no raw LINE user ID
- no tokens
- no URLs
- no result text
- no raw input

## 10. Implementation Phases

### Phase 1: Schema + Safe Service Helpers

- Add migration for `payment_recovery_contacts` and possibly `payment_recovery_tokens` if token support is included early.
- Add hash/encryption helpers.
- Add create/update/find service helpers.
- No public UI required yet, or hidden/internal test only.

### Phase 2: Checkout-Start Recovery Soft Gate UI

- Add UI before provider submit button.
- Start with Email capture if minimizing LINE risk, or Email + LINE entry points if LIFF path is ready.
- Skip allowed; does not block checkout.
- Store transactional consent.

### Phase 3: LIFF Recovery Binding Reframe

- Add recovery-specific LIFF state and bind route.
- Do not reuse unlock intent as recovery state.
- Return success/failure/cancel to checkout-start.

### Phase 4: Paid Ready / Completed Save CTA

- Add secondary save CTA after report is ready/completed.
- Capture recovery identity for users who skipped before payment.

### Phase 5: Recovery Link Sending / Support-Assisted Recovery

- Add short-lived recovery magic link generation.
- Add support-assisted resend/recovery flow.
- Add Email/LINE sending only after explicit approval.

### Phase 6: Future Lightweight Member Path

- Map recovery contacts into member identity if/when account-like history is approved.
- Do not implement full membership now.

## 11. Test Plan

Planned tests:

- recovery contact creation does not create payment intent, entitlement, generation job, or queue trigger.
- skip does not block checkout submit.
- LINE binding failure/cancel falls back to Email and keeps checkout available.
- desktop prioritizes Email.
- mobile/LINE context prioritizes LINE.
- already-saved state shows compact confirmation.
- transactional consent and marketing consent are stored separately.
- marketing unchecked does not block recovery contact creation.
- no raw `pa_` or `pcs_` appears in HTML, logs, events, messages, or reports.
- recovery link messages contain no sensitive report content.
- existing checkout-start rendering tests still pass.
- existing result checkout no-card QA still passes.
- production fail-closed behavior remains unchanged.

## 12. Risks and Open Decisions

Risks:

- Email storage may increase privacy exposure if not encrypted/minimized.
- LIFF recovery state can accidentally become a token leak if raw access/session values are embedded.
- Extra checkout-start step may reduce conversion if too heavy.
- Support workflows need clear owner procedures before launch.
- Recovery identity can drift into membership without explicit product decision.

Open decisions:

- Email storage: encrypted + hash is recommended, but owner must approve reversible contact storage.
- Encryption key and rotation plan are not defined yet.
- Whether Phase 2 should start Email-only or Email+LINE.
- Whether marketing opt-in should appear at checkout-start or only after completed result.
- Whether recovery should be required for any future high-risk payment contexts.

## 13. Recommended Next Task

Recommended next implementation task:

```text
Paid Result Recovery Identity Schema v0
```

Why:

- The schema/service layer is the safest first implementation step.
- UI contact capture without a durable recovery model would recreate the legacy ContactCapture mismatch.
- Schema and service helpers can be validated without enabling LINE push, Email sending, or production payment runtime.

Suggested scope:

- migration for `payment_recovery_contacts`
- hash/encryption strategy finalized
- service helpers and tests
- no public UI yet or internal-only smoke
- no LINE push / Email send
- no membership

Alternate if owner prioritizes UX speed:

```text
Email Recovery Capture v0
```

But only after approving minimal schema/storage rules.

## Architecture Decisions

- Dedicated recovery contact model is recommended over payment fields, entitlement-only fields, lightweight membership, or legacy ContactCapture reuse.
- Encrypted normalized Email + keyed hash is recommended over plaintext or hash-only for v0 if Email recovery/send is planned.
- LINE should reuse LIFF identity verification patterns, but recovery binding should use new recovery state, not raw tokens or legacy unlock intent semantics.
- Recovery access should use fresh short-lived magic/recovery links, not raw `pa_` or `pcs_` tokens.

## Blockers

- No schema/migration approval yet.
- No encryption key/storage decision yet.
- No LINE/Email send approval yet.
- Production payment runtime remains disabled.

## Uncertainties

- Whether recovery identity should be built before NewebPay approval or held until production dry-run.
- Whether owner wants marketing opt-in at checkout-start or later.
- Whether LINE should be implemented alongside Email in the first UX pass.

## Tech Debt Review

### New Technical Debt Introduced

- None. This was documentation-only.

### Existing Technical Debt Observed

- Current paid recovery relies on browser/session continuity and manual support fallback.
- Existing ContactCapture/LINE fulfillment infrastructure remains legacy-shaped and should not be reused directly for paid checkout recovery.

### Opportunistic Cleanup Completed

- None. Runtime code was not changed.

### Deferred Cleanup Candidates

- `Paid Result Recovery Identity Schema v0`
- `Email Recovery Capture v0`
- `LINE Recovery Binding Reframe v0`
- `Support-Assisted Recovery Runbook v0`

### Recommended Follow-up

- Implement schema/service helpers first, then checkout-start UX.

## Validation

Validation results are recorded in the completion summary.
