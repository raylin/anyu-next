# Paid Ready / Completed Result Save CTA Plan v0

Date: 2026-06-01

## Scope

Plan the post-payment recovery/save CTA behavior for Module 01 paid-ready and completed paid result surfaces. This task did not implement UI, schema, Email sending, LINE push, membership, env changes, production DB migration, payment behavior, or Module 02 work.

## Current Recovery State Inventory

- Checkout-start now shows the only active recovery UI: Email-first save, separate optional marketing opt-in, deferred LINE recovery/support option, and skip-with-warning acknowledgement.
- Checkout-start can read saved state through `getPaymentRecoveryContactsByResultId(resultId)` and can link Email recovery contacts to module, result, and checkout-created payment intent.
- The Email recovery route is currently scoped to pre-payment checkout-start: `/api/modules/[moduleSlug]/result/[resultId]/recovery/email`.
- The recovery service layer already supports the sources `checkout_start`, `return_waiting`, `paid_ready`, `completed_result`, `support`, and `operator_test`.
- Recovery contacts can be fetched by payment intent, entitlement, or result through existing helper functions.
- `bindRecoveryContactsToEntitlement` exists to attach pre-payment recovery contacts to the entitlement after paid transition, but post-payment UI should not assume binding unless the paid path confirms it.
- ReturnURL status uses `pcs_` checkout session resolution and `PaymentReturnPoller`; it knows payment intent state and access path but does not currently fetch recovery contact status.
- Payment access page resolves `pcs_` to a ready paid result and renders `UnlockCompleted`.
- Paid access token route resolves entitlement server-side through `resolvePaidAccessToken`, but `UnlockCompleted` currently receives only display data, not a sanitized recovery status summary.

## Current Recovery Gap

A user can still close the browser or switch devices after payment without confirming a recovery identity. Checkout-start now reduces this risk before payment, but paid-ready and completed-result pages do not yet:

- confirm that a recovery method is saved
- remind skipped users to save the completed report
- allow Email recovery identity to be added after payment
- distinguish recovery identity from paid report delivery
- prepare for future LINE/member identity states

## Post-Payment User States

### A. Email Saved Before Payment

Show only a subtle confirmation. Do not interrupt the completed report.

Recommended state: `已保存到 Email`

### B. Recovery Skipped Before Payment

Show a stronger but non-blocking reminder on paid-ready and completed-result surfaces. The user should still be able to open/read the report immediately.

Recommended state: `尚未保存`

### C. Email Attempt Failed

Allow retry without blocking access. Use safe copy that says saving failed, not payment or report delivery failed.

Recommended state: `保存暫時失敗，可稍後再試`

### D. Email Saved, LINE Not Saved

Show Email confirmation and optionally offer LINE later as a backup only after recovery-specific LIFF binding exists.

Recommended state: `已保存到 Email，可稍後新增 LINE 備用`

### E. Future LINE Bound

Show `已保存到 LINE` and optionally allow Email backup. Do not call this LINE delivery.

### F. Future Member Logged In

Show `已保存到你的 ANYU 紀錄` or suppress the save CTA. Do not introduce membership wording before a real member model exists.

## Paid-Ready CTA Recommendation

Recommended option: non-blocking reminder plus completed-result save section.

- Primary CTA remains `查看完整報告`.
- Recovery CTA is secondary and should not delay access.
- If recovery is missing or skipped, show: `建議先保存這份報告，之後換裝置也能找回。`
- If recovery is already saved, show a small confirmation only.
- Do not add a blocking modal before the report.
- Do not add Email/LINE delivery language.
- Do not send Email or LINE messages in this phase.

Implementation note: paid-ready currently has `checkoutToken` and `accessPath`. A first implementation can show a reminder on ReturnURL but defer the actual save form to the completed result page, where server-side entitlement/result context can be resolved more cleanly.

## Completed Result CTA Recommendation

Add a non-sticky save/recovery section to the completed paid result page.

Recommended placement:

- Small status card near the top if the user is unsaved.
- Secondary reminder near the bottom for users who dismiss the top prompt or scroll through the report.
- No sticky, modal, or aggressive interruption.

Recommended behavior:

- Saved Email: show confirmation and do not require action.
- Unsaved: show Email save as primary.
- LINE: show as deferred/future option until recovery-specific LIFF binding is implemented.
- Marketing opt-in: optional and separate, preferably later in the same save section or after the user has read enough of the report.

## Copy Direction

Use protective, calm recovery language.

### Already Saved Email

`已保存到 Email。之後若換裝置或找不到頁面，可透過這個方式協助找回。`

### Paid-Ready Unsaved Reminder

`建議先保存這份報告，之後換裝置也能找回。`

### Completed Result Save Section

Title: `保存這份完整分析`

Body: `如果之後關閉頁面、換裝置或找不到連結，我們可以用你保存的方式協助找回這份完整報告。`

Primary CTA: `用 Email 保存找回方式`

### Email Retry

`保存暫時沒有成功，但不影響你查看完整報告。可以稍後再試，或需要時來信客服協助。`

### LINE Future/Deferred

`LINE 找回稍後支援。上線後可用於完成通知、保存與客服協助，不作為完整報告交付方式。`

### Skip/Dismiss

`先閱讀，稍後再保存`

Avoid:

- `LINE 交付完整報告`
- `Email 交付完整報告`
- `註冊會員` as primary wording
- refund/legal threat framing
- any wording that implies Email or LINE is canonical paid report delivery

## Data And Helper Needs

Existing helpers are mostly sufficient for lookup and creation, but implementation should add a small server-only summary layer to prevent leaking raw recovery rows into UI code.

Recommended helper:

`getPaidRecoveryStatusSummary({ moduleSlug, resultId, paymentIntentId, entitlementId })`

Suggested return shape:

- `hasAny`
- `hasEmail`
- `hasLine`
- `hasMarketingOptIn`
- `latestSource`
- `needsSaveReminder`
- `canAddEmail`
- `canAddLine`

Do not return raw Email, raw LINE identifiers, encrypted values, hashes, or token values.

Recommended post-payment save path:

- Use a server action or server-only route that resolves entitlement/result context from the current paid access page without rendering raw `pa_` or raw `pcs_` into form fields.
- For `/m/[moduleSlug]/payment/access`, resolve through the existing checkout session on the server.
- For `/m/[moduleSlug]/unlock/[unlockToken]`, resolve paid access server-side and avoid logging or echoing the token.
- Save post-payment Email contacts with source `completed_result` or `paid_ready` depending on surface.
- Link to `entitlement_id` when available.
- Continue to store normalized Email as encrypted value plus keyed hash only.

Potential helper follow-up:

- Ensure paid transition calls `bindRecoveryContactsToEntitlement` after entitlement creation/reuse, if it does not already do so.

## Consent Model

- Adding a post-payment recovery contact is transactional/recovery consent for that report.
- Marketing and new-module consent remains separate and optional.
- Recovery action can be explicit consent for result recovery and completion/support contact.
- Marketing can be asked later on the completed result page, but default should remain conservative.

## LINE And Email Priority After Payment

- Desktop: Email first.
- Mobile browser: Email first until recovery-specific LINE binding is implemented; LINE can appear as deferred.
- LIFF context: LINE may become primary only after recovery-specific LIFF state exists.
- Completed result: show Email and future LINE gently, not as a blocking decision.

## Metrics And Events

Recommended events:

- `paid_ready_save_cta_viewed`
- `completed_result_save_cta_viewed`
- `recovery_email_added_after_payment`
- `recovery_line_added_after_payment`
- `recovery_save_dismissed`
- `saved_status_seen`
- `recovery_retry_failed`

Recommended dimensions:

- `module_slug`
- `source_page`
- `paid_state`
- `has_existing_recovery`
- `channel`
- `device_context`
- `marketing_opt_in_selected`

Do not include raw contact values, raw tokens, free-text result content, or private input.

## Implementation Options

### A. Completed Result Save CTA Only

Low risk and easiest to implement. It misses the paid-ready moment where a user may still leave before opening the report.

### B. Paid-Ready Reminder Plus Completed Result Save Section

Recommended. It protects both the handoff moment and the reading moment without blocking access.

### C. Blocking Modal Before Report If Unsaved

Not recommended. It adds friction immediately after payment and can feel like a second gate.

### D. Wait Until Email Sending / Magic Links Exist

Not recommended. Saving recovery identity now still reduces support friction and prepares for later recovery links.

## Test Plan

Plan tests for the future implementation:

- saved user sees subtle confirmation
- unsaved user sees paid-ready reminder
- completed result page shows save section without implying Email/LINE delivery
- saving after payment links contact to entitlement/payment/result context
- raw Email is not echoed in response or rendered HTML
- raw `pa_` and raw `pcs_` are not stored in recovery rows or rendered in new hidden fields
- marketing opt-in remains separate
- access render remains unchanged
- no-card QA still passes
- production disabled behavior remains fail-closed

## Phased Recommendation

### Phase 1: Post-Payment Recovery Helper Methods v0

Add a server-only recovery status summary helper and confirm entitlement binding behavior. This keeps UI implementation small and secret-safe.

### Phase 2: Paid Result Save CTA Implementation v0

Add non-blocking paid-ready reminder and completed result save section with Email save only. Keep LINE deferred.

### Phase 3: Recovery Link Sending Plan / Implementation

Design and implement short-lived server-resolved recovery links. Do not send raw `pa_` or raw `pcs_`.

### Phase 4: LINE Recovery Binding Reframe

Add recovery-specific LIFF state and binding behavior. Keep LINE as save/recovery/notification/support, not paid report delivery.

## Recommended Next Implementation Task

Recommended next task: **Post-Payment Recovery Helper Methods v0**.

Why:

- It avoids mixing sensitive paid access token handling into UI work.
- It gives paid-ready and completed-result pages a safe, sanitized recovery status contract.
- It can verify whether pre-payment recovery contacts are bound to entitlements after payment.
- It reduces the chance that the next UI task leaks raw recovery records or token context.

If speed is prioritized over separation, combine helper methods with **Paid Result Save CTA Implementation v0**, but keep the server-only status summary as the first implementation step.

## Validation

This was a documentation/planning task. No runtime code, schema, env, payment provider behavior, Email sending, LINE push, membership, or production configuration was changed.
