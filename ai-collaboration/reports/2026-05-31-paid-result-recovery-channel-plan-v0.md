# Paid Result Recovery Channel Plan v0

Date: 2026-05-31

## Summary

Module 01 paid delivery is staging-proven, but the current recovery path is fragile if a user closes the browser, loses the ReturnURL, switches devices, or fails to bookmark the access page after payment.

Recommended direction: add a soft-gated recovery channel step around checkout-start. Users should be strongly encouraged to bind LINE or Email for transactional recovery/completion/support, with an explicit skip option and warning. Web access remains canonical paid delivery. LINE and Email should not receive raw `pa_` or `pcs_` tokens, raw result content, or provider payloads.

This task is planning-only. No runtime, schema, env, payment, LINE push, Email delivery, or production behavior changed.

## 1. Current Access / Recovery Architecture

### Current Access Flow

Current validated flow:

```text
result page CTA
→ /m/[moduleSlug]/result/[resultId]/checkout
→ server creates NewebPay checkout and pcs_ checkout session
→ user submits provider form
→ NewebPay ReturnURL includes checkoutToken
→ /m/[moduleSlug]/payment/return polls payment status
→ NotifyURL verifies payment and creates delivery artifacts
→ status becomes paid_ready
→ access path /m/[moduleSlug]/payment/access?checkoutToken=...
→ completed paid result renders
```

Important source findings:

- Checkout-start creates only pending checkout/payment state, not entitlement or generation job.
- `pcs_` checkout session token is signed and expires after 24 hours.
- ReturnURL and payment status resolve by `checkoutToken` to `merchantOrderNo`, then `payment_intent`.
- Payment access page renders the completed paid result only when the checkout handoff resolves to `paid_ready`.
- `pa_` paid access tokens exist for entitlement/access infrastructure, but result-page checkout flow currently uses the session-bound `pcs_` handoff path.
- Current fallback copy tells users to keep payment time/order information and contact `hello@anyu.tw`.
- Support SOP already covers paid but no result, ReturnURL/access failure, generation failure, duplicate payment, and refund handling.
- No-card QA bypass proves downstream delivery/access without provider payment, but does not add user recovery.

### What Happens If The User Closes The Page

If the user closes the browser before saving the ReturnURL/access page:

- If browser history still has ReturnURL with valid `checkoutToken`, recovery may work.
- If the `checkoutToken` is lost, expired, or on another device, there is no self-service recovery channel today.
- Support can theoretically recover by matching provider order/payment time and internal payment intent, but this is manual and operationally expensive.
- Email/LINE contact capture exists, but it is legacy/fallback-oriented and not bound to the current paid checkout lifecycle.

### Manual Support Recovery Today

Support would need safe user-provided context:

- payment time
- provider order/reference if visible
- email or LINE handle if previously provided
- short description of access issue
- redacted screenshot if needed

Support should not ask for card data, raw `pcs_`, raw `pa_`, tokenized URLs, raw relationship text, passwords, or provider secrets.

## 2. UX Flow Proposal

Recommended soft-gated recovery step on checkout-start:

```text
checkout-start page
→ order summary / provider trust bridge
→ "建議先設定報告找回方式"
→ choose LINE / Email / Skip for now
→ submit NewebPay payment
```

Skip must be allowed, but the warning should be clear.

### Checkout-Start Recovery Copy

Section title:

```text
先設定報告找回方式
```

Body:

```text
付款完成後，完整報告會在網頁中提供查看。若你關掉瀏覽器、換裝置，或付款完成頁沒有回來，找回方式可以協助我們確認並恢復你的報告入口。
```

LINE option:

```text
用 LINE 保存找回方式
適合手機使用。之後可用於付款完成通知、報告找回與客服協助；不會在 LINE 傳送完整報告內容。
```

Email option:

```text
用 Email 保存找回方式
適合不想使用 LINE 的使用者。之後可用於付款完成通知、報告找回與客服協助。
```

Skip option:

```text
先略過，直接前往付款
```

Skip warning:

```text
如果略過找回方式，請不要關閉付款完成頁，並建議付款後立刻把結果頁加入書籤。若之後換裝置或遺失連結，可能需要人工客服協助確認付款紀錄。
```

Completed result save CTA:

```text
保存這份完整報告的找回方式
如果之後換手機或找不到連結，可以透過 LINE 或 Email 協助找回。
```

Tone requirements:

- warm
- explicit
- not threatening
- not overly legalistic
- no LINE paid delivery promise
- no raw token mention

## 3. Consent Model

Separate transactional recovery consent from marketing/re-engagement consent.

### A. Transactional / Recovery Use

Purpose:

- result recovery
- completion notification
- support around paid report access

Recommended UX:

- One required consent sentence if user chooses LINE or Email.
- Example:

```text
我同意暗語 ANYU 使用此聯絡方式處理這次付款後的報告找回、完成通知與必要客服協助。
```

This consent should not imply newsletters, promotions, or future module marketing.

### B. Marketing / Re-engagement Use

Purpose:

- new modules
- early access
- discounts
- periodic insight

Recommended UX:

- Separate optional checkbox.
- Example:

```text
我也願意接收新測驗、早鳥體驗或優惠通知。
```

Recommendation: implement separate consent sections. Do not bundle recovery with future marketing.

## 4. Data Model Options

| Option | Complexity | Privacy risk | Support usefulness | Cross-module value | LINE + Email support | Assessment |
|---|---:|---:|---:|---:|---:|---|
| A. Store recovery contact on `payment_intents` | Low | Medium | High for payment recovery | Low | Yes | Good short-term, but mixes contact/consent into payment provider lifecycle. |
| B. Store recovery contact on checkout session | Medium | Low/Medium | Medium | Low | Yes | `pcs_` is token-based and ephemeral; not ideal for support after expiry. |
| C. Store recovery contact on entitlement | Medium | Medium | High after paid transition | Medium | Yes | Good post-payment, but unavailable before NotifyURL/entitlement exists. |
| D. Dedicated `payment_recovery_contacts` table | Medium | Lowest if designed well | High | High | Yes | Best v0 recommendation. Separates consent/contact from payment/provider state. |
| E. Reuse ContactCapture / LINE binding | Low now, high later | Medium/High | Medium | Medium | Partial | Fastest, but legacy unlock semantics are wrong for paid checkout recovery. |

Recommended v0: dedicated `payment_recovery_contacts` table or equivalent model.

Proposed fields, planning only:

- `id`
- `module_slug`
- `analysis_result_id`
- `payment_intent_id` nullable until checkout is created/linked
- `merchant_order_no` nullable/internal
- `channel`: `line` or `email`
- `channel_contact_hash`
- `channel_contact_encrypted` optional if support needs contact
- `line_user_id_hash` nullable
- `email_normalized_hash` nullable
- `transactional_consent_at`
- `marketing_consent_at` nullable
- `source_surface`: `checkout_start`, `return_waiting`, `paid_ready`, `completed_result`
- `status`: `active`, `opted_out`, `bounced`, `blocked_unknown`
- `last_contacted_at`
- `created_at`, `updated_at`

Privacy recommendation:

- Use hashes for matching/segmentation.
- Store reversible contact only if support or actual sending requires it, with explicit retention policy.
- Never store raw `pcs_` or `pa_` tokens in the recovery contact table.

## 5. Recovery Link / Access Design

Evaluated approaches:

| Approach | Assessment |
|---|---|
| Send/recover via raw `pcs_` token | Not recommended. It is a bearer session token and expires. Do not expose it in LINE/Email. |
| Send raw `pa_` token | Not recommended. Avoid emailing or pushing raw paid access bearer tokens. |
| Issue a new signed recovery token | Recommended v0 direction for self-service recovery. Short-lived, scoped, one-time/limited-use. |
| Support-assisted recovery by order/email/LINE | Recommended as fallback. Support verifies payment and issues fresh recovery path. |
| Regenerate `pa_` link | Possible later, but should be server-issued only after verification. |
| Short-code lookup | Useful for LINE fallback, but should point to secure web recovery, not reveal paid content. |
| Magic link with expiry | Recommended UX form for Email/LINE recovery. |

Recommended v0 access approach:

1. Store recovery contact/consent around checkout-start.
2. After payment is verified and paid result is ready, server can issue a short-lived recovery magic link on demand.
3. LINE/Email messages should say the report is ready and link to a secure web recovery/access page.
4. The recovery page resolves server-side and either creates a fresh session-bound access handoff, or issues a fresh paid access path after verifying entitlement and recovery contact.
5. Support can resend a new short-lived recovery link after verifying order/contact match.

Do not send raw `pa_` or `pcs_` tokens in messages.

## 6. LINE-Specific Positioning

LINE CTA placement:

- Checkout-start: recommended Phase 1 location as recovery/save option.
- ReturnURL waiting/processing: optional Phase 2 fallback if user did not bind before payment.
- Paid ready: good secondary save-for-later CTA.
- Completed paid result: good retention and Module 02 early-access CTA.
- Homepage / module portal: future owned-channel entry after Module 02 direction is clearer.

LINE copy principles:

- Use "保存找回方式", "完成通知", "客服協助".
- Do not say "用 LINE 領取完整報告" or "完整報告會傳到 LINE".
- Do not send private relationship/result content in LINE previews.
- LINE is channel and recovery, not payment truth and not canonical report delivery.

## 7. Email-Specific Positioning

Email should be:

- fallback recovery channel for users who do not want LINE
- suitable for completion notification and support-assisted recovery
- optional and explicitly consented
- not required for payment in v0

Email verification:

- Do not require full email verification in v0 unless abuse/support risk becomes high.
- If magic links are used, the email itself acts as delivery proof for that link, but support-sensitive recovery should still verify payment/order context server-side.
- Later phases can add one-time email confirmation if needed.

## 8. Support / Refund Implications

Recovery channels reduce:

- "paid but cannot access" tickets
- refund disputes after browser close or device switch
- manual order-matching burden
- user anxiety during generation delay

Support fallback:

```text
User provides payment time / provider order reference / recovery email or LINE / issue description.
Support verifies payment_intent and entitlement.
Support issues a new short-lived recovery link or instructs user to retry the recovery page.
```

Support should not ask for:

- full card number
- raw `pa_` token
- raw `pcs_` token
- tokenized URLs
- original private relationship text

## 9. Metrics

Measure:

- recovery opt-in rate at checkout-start
- LINE vs Email selection
- skip rate
- recovery completion rate
- paid result lost/access support rate
- paid result save CTA click rate
- completion notification open/click rate if implemented
- Module 02 re-engage conversion from LINE/Email
- LINE block/unsubscribe rate
- old-user CAC vs new-user ads CAC

Minimum launch dashboard counters:

- `recovery_channel_offered`
- `recovery_channel_selected`
- `recovery_channel_skipped`
- `recovery_link_requested`
- `recovery_link_used`
- `paid_access_support_requested`

## 10. Phased Roadmap

### Phase 1: Checkout-Start Recovery Opt-In UX

- Add recovery section on checkout-start.
- Store recovery contact and transactional consent.
- Allow skip with warning.
- No automated LINE push or Email send yet.

### Phase 2: Completed Report Save CTA + Support-Assisted Recovery

- Add secondary save CTA on paid ready/completed result.
- Allow owner/operator to verify and issue fresh recovery link.
- Define support procedure around contact/order matching.

### Phase 3: Completion Notification

- Send LINE/Email completion notification only for users who opted in.
- Message links to secure web recovery/access page.
- No result content in message body.

### Phase 4: Module 02 Early Access / Re-engage Campaign

- Use opted-in users to test Module 02 hooks without paid ads.
- Keep marketing consent separate from transactional consent.

### Phase 5: Personalized Periodic Insight

- Add low-frequency insight loops only after Module 02 and channel consent are stable.
- Use coarse trait summaries only after privacy/product approval.

## 11. Risks and Guardrails

Privacy risks:

- LINE/Email are personal identifiers.
- Relationship results are sensitive.
- Recovery links are access-bearing if poorly designed.

Guardrails:

- Do not force LINE.
- Always provide Email fallback and skip.
- Keep web access canonical.
- Do not include private result content in messages.
- Do not send raw `pa_` or `pcs_` tokens.
- Keep transactional and marketing consent separate.
- Keep message frequency low.
- Store only what is needed.
- Hash or encrypt contact identifiers where practical.
- Provide support deletion/opt-out expectations.

## 12. Recommended Next Implementation Task

Recommended next task:

```text
Paid Result Recovery Channel Schema / UX Implementation Plan v0
```

Scope should include:

- exact schema proposal and migration plan
- checkout-start UI placement and copy
- consent handling
- server-side recovery contact create/update route
- no automated LINE/Email send in first implementation unless separately approved
- tests for skip, consent separation, no token exposure, and production fail-closed behavior

If owner wants a smaller first implementation:

```text
Checkout-Start Recovery CTA Implementation v0
```

But this should still avoid storing contact data without a clear data model.

## Architecture Decisions

- Recovery channel should be a soft gate, not a hard requirement.
- Recovery contact/consent should not be stored directly as a provider payment detail long-term.
- A dedicated recovery/contact model is preferred over reusing legacy ContactCapture unlock semantics.
- Recovery messages should use fresh short-lived recovery links, not raw paid access or checkout session tokens.

## Blockers

- No recovery channel schema is approved.
- No LINE/Email sending implementation is approved.
- Production payment remains disabled.

## Uncertainties

- Whether owner wants LINE staffed as support or only notification/recovery.
- Whether Email contact should be stored reversibly for support or hashed-only until sending is implemented.
- Whether recovery should be implemented before or after production payment approval.

## Tech Debt Review

### New Technical Debt Introduced

- None. This was documentation-only.

### Existing Technical Debt Observed

- Current paid access is robust while the browser/session is intact, but self-service recovery after token loss is not implemented.
- Legacy LINE/ContactCapture flows are not semantically aligned with current paid checkout recovery.

### Opportunistic Cleanup Completed

- None. Runtime code was not changed.

### Deferred Cleanup Candidates

- `Paid Result Recovery Channel Schema / UX Implementation Plan v0`
- `Support-Assisted Recovery Runbook v0`
- `LINE Channel Data Model Plan v0`

### Recommended Follow-up

- Plan schema and UX together before implementing checkout-start recovery CTA, because contact collection without a recovery model would recreate the legacy ContactCapture mismatch.

## Validation

Validation results are recorded in the completion summary.
