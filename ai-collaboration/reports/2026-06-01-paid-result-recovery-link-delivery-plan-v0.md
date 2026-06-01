# Paid Result Recovery Link Delivery Plan v0

Date: 2026-06-01
Task: Paid Result Recovery Link Delivery Plan v0
Scope: planning only; no Email sending, LINE messages, token routes, schema changes, membership, payment changes, env changes, or production migration.

## 1. Clarify Delivery Promise

The corrected product promise is:

- If a user saves by Email, ANYU should eventually send an Email containing a safe link back to ANYU after the paid result is ready.
- If a user saves by LINE, ANYU should eventually send a LINE message containing a safe link back to ANYU after the paid result is ready.
- Email and LINE should not contain the full paid report body, private source text, detailed analysis, or hidden payment/session tokens.
- Web access remains the canonical paid report delivery surface.
- Email and LINE deliver the report entry link, not the report content.

This means current copy should evolve from only "save a recovery identity" toward "save a way to receive a safe return link." It should still avoid promising that the report itself is delivered through Email or LINE.

Recommended product language:

> 保存後，完整報告準備好時，我們會把回到 ANYU 查看報告的連結寄給你。Email / LINE 不會包含完整報告內容。

## 2. Retention / Access Window

Recommended v0 window: 90 days.

Rationale:

- 90 days is long enough for most consumer expectations around a paid NT$49 digital report.
- It limits indefinite bearer-link risk.
- It gives support a concrete policy for "I paid but lost the page."
- It avoids prematurely implementing permanent membership/history.
- It leaves room for future member account or PDF/export features.

Recommended copy:

- `完整報告找回連結預計保留 90 天。這不是永久會員保存；若超過期限仍需要協助，請來信 hello@anyu.tw。`
- Short version for UI: `找回連結將保留 90 天，請勿轉傳給他人。`

Clarification:

- This should initially mean recovery-link validity.
- Report retention should be aligned to at least the same 90-day window if the link resolves to existing paid result data.
- Support-assisted recovery can remain best effort after expiry.
- This is not a promise of permanent report history or account storage.

Legal/support impact:

- Refund/support copy should not be changed until the recovery link implementation is ready.
- Before production launch, legal/support pages should eventually mention the report recovery window in plain terms.

## 3. Current Access Mechanisms

Current relevant mechanisms:

- `pa_` paid access token: raw bearer token generated once and stored only as a hash on the entitlement.
- `pcs_` checkout session token: signed checkout/payment handoff token with short session semantics.
- Payment access page: uses payment/checkout context to resolve paid access.
- Entitlement: durable paid access record with status, result/module references, and paid access token hash.
- Paid result render: web page remains the canonical report surface.
- `payment_recovery_contacts`: stores recovery identity by Email encrypted+hash and LINE hash-only design.
- Paid access resolver: resolves a paid access token to entitlement, result, generation job, and paid result status.

Why not send raw `pa_`:

- It is a bearer access token.
- It was not designed as a user-facing long-lived Email/LINE link.
- Sending it creates log, forwarding, and support-copy risks.
- It cannot be safely rotated or audited per channel/contact without additional structure.

Why not send raw `pcs_`:

- It is payment-session oriented, not a durable report recovery artifact.
- It can carry payment handoff semantics that should stay browser/session scoped.
- It is not appropriate for 90-day saved-result recovery.

Conclusion:

Recovery delivery needs a new purpose-specific link token that resolves server-side into safe web access.

## 4. Recovery Link Token Design

Options considered:

- A. Short-lived recovery token with DB hash.
- B. 90-day report access token.
- C. Magic link that exchanges into session-bound access.
- D. Regenerate `pa_` behind a server action.
- E. Support-assisted only.

Recommended v0: DB-backed recovery link token with server-side resolver.

Properties:

- Raw token is generated once and sent once through Email/LINE.
- Only `token_hash` is stored.
- Purpose is explicit: `paid_result_recovery`.
- Default expiry is 90 days.
- Link resolves server-side to entitlement/result context.
- Link never exposes raw `pa_` or `pcs_`.
- Link can be revoked.
- Send attempts and status can be tracked.
- Rate limiting and audit events can be added later.

Recommended token behavior:

- High-entropy random token with a recognizable non-secret prefix, for example `prl_`.
- Hash with a dedicated purpose, either a new secret or a purpose-separated derivation from an explicit recovery-link secret.
- Raw token must not be logged, stored, reported, or included in docs.
- Resolver should consume the token by hash lookup only.

Use pattern:

1. Paid result is ready or user saves after payment.
2. Server creates a recovery link row and raw token.
3. Email/LINE message sends a URL containing the raw token.
4. Resolver hashes token, validates row, and creates/uses a safe paid access handoff.
5. User lands on ANYU web paid result.

## 5. Link Resolver Route

Recommended route: `/r/[recoveryToken]`

Reasons:

- Short enough for Email/LINE.
- Channel-neutral.
- Keeps module-specific paths behind the resolver.
- Avoids exposing result/payment IDs in the visible URL.

Alternative: `/m/[moduleSlug]/recovery/[token]`

- More explicit but longer and leaks module context in the URL.

Resolver requirements:

- Validate token shape before lookup.
- Hash token and look up active recovery link.
- Reject expired/revoked/unknown tokens with a generic recovery failure page.
- Check entitlement exists and is active.
- Check paid result is ready or show a safe processing state if generation is still finishing.
- Create a short-lived server-side handoff or directly render paid access without exposing `pa_`.
- Update `used_at` and `last_used_at` metadata without making payment state changes.
- Never log raw token.
- Never reveal whether a specific token exists in unsafe ways.
- Show support copy on failure:
  - `這個找回連結已失效或無法使用。請聯絡 hello@anyu.tw，我們會於 3–7 個工作天內回覆處理結果。`

Recommendation:

Use `/r/[recoveryToken]` and exchange into a server-side access handoff before redirecting to the existing paid access/result page. This keeps report rendering centralized and avoids turning the recovery token into a second permanent access path with duplicated logic.

## 6. Token Creation Triggers

### A. Email saved before payment

- Store Email recovery contact at checkout-start.
- After payment is verified and paid result is ready, create a recovery link.
- Send Email with link.
- Mark send status.

### B. Email saved after payment

- Create/update Email recovery contact immediately.
- Create recovery link immediately if entitlement/result are ready.
- Send Email or queue Email send.
- UI can show "saved, link will be sent" if send worker is asynchronous.

### C. LINE saved before payment

- Store hash-only LINE recovery contact after LIFF bind.
- After payment is verified and paid result is ready, create recovery link.
- Send LINE message with link.

### D. LINE saved after payment

- Bind LINE recovery contact.
- Create recovery link immediately if entitlement/result are ready.
- Send LINE message or queue send.

### E. User skipped recovery

- Do not create/send a link.
- Completed result can still offer Email/LINE save later.
- Support fallback remains available.

Operational note:

Recovery link send should be triggered after paid result readiness, not merely after provider ReturnURL. Provider ReturnURL is not payment truth.

## 7. Email Sending Plan

Provider choice can be deferred.

Email requirements:

- Dedicated transactional sender should be configured before production.
- `hello@anyu.tw` can remain support/reply-to; do not assume it is the final transactional sender until deliverability is configured.
- Email includes a safe web return link only.
- Email does not include full report content, raw source text, private analysis, payment payloads, or hidden tokens.
- Subject should be clear and not overly promotional.

Recommended subject:

- `你的 ANYU 完整報告已準備好`

Recommended body:

```text
你的完整報告已準備好。

請回到 ANYU 查看：
{recovery_link}

這個找回連結預計保留 90 天。請勿轉傳給他人。

如果你無法開啟連結，請回覆此信或聯絡 hello@anyu.tw。
```

Resend behavior:

- Allow resend from completed result/support tooling later.
- Limit resend frequency per contact/result.
- Reuse active recovery link when safe, or revoke old link and issue a new one depending final security policy.
- Track `send_status` and error category without storing provider payloads.

Failure handling:

- If Email send fails, keep recovery contact but mark send failure.
- UI should show "saved but delivery failed" only where actionable; otherwise support can inspect status later.

## 8. LINE Sending Plan

LINE requirements:

- Send only after explicit LINE recovery binding.
- Use LINE Messaging API only for transactional recovery/completion notification unless marketing consent is separately present.
- Message includes short copy and a safe link back to ANYU.
- Message does not include full report content, source text, private analysis, or payment data.
- If the user blocks the account or message send fails, mark send failure and preserve Email fallback.

Recommended LINE message:

```text
你的 ANYU 完整報告已準備好。
點此回到 ANYU 查看：
{recovery_link}

找回連結預計保留 90 天，請勿轉傳給他人。
```

Marketing separation:

- New module notices, early access, discounts, and periodic insights require separate marketing/re-engagement consent.
- Do not bundle marketing into transactional recovery messages.

Cadence:

- One completion/recovery message per saved paid result.
- No daily push.
- Future reminder/resend behavior should be explicit and rate-limited.

## 9. User-Facing Copy

Checkout-start recovery promise:

- `建議先保存這次完整報告。付款完成、報告準備好後，我們會把回到 ANYU 查看報告的連結寄給你。`
- `Email / LINE 不會包含完整報告內容，只會提供回到 ANYU 的安全連結。`

Completed-result save/send CTA:

- Title: `保存這份完整分析`
- Copy: `之後換裝置、關閉頁面或清除瀏覽資料時，可以用 Email 或 LINE 協助找回。`
- Button: `寄送找回連結`
- Saved state: `這份完整分析已保存。報告準備好後，你可以透過已保存的方式回到 ANYU 查看。`

Email message:

- `你的完整報告已準備好。點此回到 ANYU 查看：`
- `這個連結會保留 90 天，請勿轉傳給他人。`

LINE message:

- `你的 ANYU 完整報告已準備好。點此回到 ANYU 查看：`
- `找回連結預計保留 90 天，請勿轉傳給他人。`

Expired link page:

- `這個找回連結已失效`
- `請聯絡 hello@anyu.tw，我們會於 3–7 個工作天內回覆處理結果。`

Avoid:

- `完整報告已傳到 LINE`
- `Email 內含完整分析`
- `LINE 交付完整報告`
- raw-token or session language
- overly legalistic warnings

## 10. Security / Privacy

Boundaries:

- No full paid content in Email/LINE messages.
- No raw `pa_` or `pcs_` tokens in Email/LINE.
- No raw recovery token in logs.
- Store only token hash.
- Use expiry, default 90 days.
- Support revocation.
- Track send status without storing provider payloads.
- Generic failure pages should avoid token enumeration.
- Resend should be rate-limited.
- Messages should avoid sensitive result previews.

Bearer-link risk:

- A recovery link is still a bearer credential while valid.
- Mitigations: high entropy, 90-day expiry, revocation, generic failures, no content in message previews, no raw token logs, and support for future account-bound upgrade.

Future hardening:

- Optional one-time exchange into short browser session.
- Optional device/browser confirmation for higher-risk reports.
- Audit events for send/resolve/revoke.
- Member account upgrade for durable history.

## 11. Data Model

Recommended new table: `paid_result_recovery_links`

Planned fields:

- `id`
- `contact_id` nullable, references `payment_recovery_contacts`
- `entitlement_id`, references `entitlements`
- `payment_intent_id`, references `payment_intents`
- `result_id`
- `module_slug`
- `token_hash`
- `purpose`, e.g. `paid_result_recovery`
- `channel`: `email | line | support`
- `expires_at`
- `used_at` nullable
- `revoked_at` nullable
- `sent_at` nullable
- `send_status`: `pending | queued | sent | failed | skipped`
- `send_attempt_count`
- `last_send_error_category` nullable
- `created_at`
- `updated_at`

Indexes/constraints to plan:

- unique `token_hash`
- index by `entitlement_id`
- index by `contact_id`
- index by `result_id, module_slug`
- partial index for active unexpired links can be considered later

Do not add this schema until a separate implementation task.

## 12. QA / Test Plan

Planned tests:

- Recovery token is stored only as hash.
- Raw recovery token is returned only at creation/send boundary.
- Valid token resolves an active entitlement/result.
- Expired token fails with support copy.
- Revoked token fails with support copy.
- Unknown token failure is generic.
- Raw `pa_` and `pcs_` are never generated into Email/LINE templates.
- Email template contains link only, no report content.
- LINE template contains link only, no report content.
- Link is created after paid result readiness for pre-payment saved contacts.
- Link is created immediately for post-payment saved contacts when result is ready.
- Resend respects rate limits.
- Recovery contact save still does not block checkout.
- Existing no-card QA still passes.
- Production fail-closed checks remain unchanged.

Staging QA after implementation:

- Use fake Email test domain only.
- Use owner-assisted test LINE account only.
- Do not print recovery tokens.
- Do not print Email, LINE ID, encrypted values, hashes, provider payloads, or paid content.

## 13. Phased Roadmap

Phase 1: Recovery Link Token Schema + Resolver

- Add `paid_result_recovery_links`.
- Add token creation/hash/expiry/revocation helpers.
- Add `/r/[recoveryToken]` resolver.
- No Email/LINE sending yet.

Phase 2: Email Recovery Link Sending v0

- Add transactional Email provider integration.
- Send link after paid result readiness or post-payment save.
- Add resend/failure handling.

Phase 3: LINE Recovery Link Sending v0

- Wire visible LINE recovery CTA.
- Complete owner-assisted LIFF bind smoke.
- Send LINE recovery link after explicit bind.

Phase 4: Resend / Support Tooling

- Support can regenerate/revoke/re-send recovery links.
- Add audit-safe status views.

Phase 5: Member / Report History / Export

- Future lightweight membership.
- Report history.
- Possible PDF/export or share-safe artifact.

## 14. Relationship To Delivery Artifact

The delivery artifact plan and recovery link delivery plan solve different but connected problems:

- Delivery artifact improves perceived ownership: the paid report feels like a concrete delivered object.
- Recovery link delivery fulfills the "save" promise: Email/LINE can actually bring the user back to the report.

Both are useful. However, the corrected owner direction makes recovery link delivery foundational. A delivery artifact can make the report feel more complete, but it does not by itself make Email/LINE save meaningful unless saved channels can receive a return link.

Recommendation:

Implement the recovery link token/resolver foundation before the delivery artifact UI, then return to the delivery artifact once link delivery semantics are concrete.

## 15. Recommended Next Task

Recommended next task: Recovery Link Token Schema / Resolver v0.

Why:

- It is the minimal foundation needed before Email or LINE can honestly promise saved-result link delivery.
- It avoids prematurely choosing an Email provider or enabling LINE push.
- It creates a safe access primitive that support tooling and delivery artifact UI can reference later.
- It preserves web as canonical delivery and avoids sending raw `pa_` / `pcs_`.

Recommended task scope:

- Add `paid_result_recovery_links` migration/schema.
- Add token creation/hash/expiry/revocation helpers.
- Add server-side resolver route `/r/[recoveryToken]`.
- Add tests for expiry, revocation, generic failure, and no raw token leakage.
- Do not send Email or LINE yet.

## 16. Documentation / Validation

Files created or updated:

- `ai-collaboration/handoffs/2026-06-01-paid-result-recovery-link-delivery-plan-v0-handoff.md`
- `ai-collaboration/reports/2026-06-01-paid-result-recovery-link-delivery-plan-v0.md`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

Validation:

- Documentation presence check: passed.
- Dashboard HTML sanity: passed.
- Secret/private scan: passed for new handoff/report; broad scan hits only existing historical provider-field references in dashboard/summary, not secret values.
- `git diff --check`: passed.

## Tech Debt Review

New technical debt introduced:

- None; this task is planning-only.

Existing technical debt observed:

- Recovery contact save now captures identity, but no recovery link/token/send layer exists yet.
- LINE recovery has route/page foundations but no visible CTA wiring or owner-assisted staging LIFF smoke.
- Email provider choice and transactional sender identity remain undefined.
- Public retention/access copy is not yet aligned to a 90-day recovery window.

Opportunistic cleanup completed:

- Dashboard roadmap language updated to put recovery link delivery ahead of artifact/support tooling.

Deferred cleanup candidates:

- Retire or further isolate legacy LINE unlock/fulfillment semantics after recovery LINE flow is fully proven.
- Add support/runbook language for expired recovery links once resolver exists.
- Add resend/rate-limit/audit design when Email/LINE sending is implemented.

## Blockers / Uncertainties

- Final recovery retention policy needs owner approval before public legal copy changes.
- Email provider/sender domain remains undecided.
- LINE visible CTA and owner-assisted LIFF smoke remain pending.
- Whether resolver directly renders paid access or exchanges into a short-lived server-side handoff should be finalized during implementation.
