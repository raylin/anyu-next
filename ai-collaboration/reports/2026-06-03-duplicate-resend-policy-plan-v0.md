# Duplicate / Resend Policy Plan v0

## Date

2026-06-03

## Completed Work

- Audited current Module 01 Email and LINE paid result access-link delivery paths.
- Documented current duplicate prevention and status behavior.
- Defined duplicate/resend scenarios across user actions, paid delivery retries, provider ambiguity, support, and operator tooling.
- Recommended a v0 resend policy for automatic sends, manual support/operator sends, expired links, and channel separation.
- Identified data model gaps and a safe implementation sequence.

## 1. Current Access-Link Delivery Inventory

Current link creation paths:

| Path | Link creation | Send attempt | Current duplicate behavior | Notes |
| --- | --- | --- | --- | --- |
| Completed-result Email save | `createAndSendEmailRecoveryLink` | Resend/noop via `sendRecoveryEmail` | Checks existing non-expired `status=sent` link for same entitlement/contact/channel and returns `duplicate` | Creates new link for noop/failed/no prior sent link |
| Paid delivery auto-send for Email | `sendRecoveryLinksForCompletedPaidResult` after paid result completion | Same Email helper | Same as completed-result Email save | Non-fatal; catch blocks prevent paid delivery failure |
| LINE paid delivery auto-send | `createAndSendLineRecoveryLink` from completed paid result hook | LINE Messaging API/noop via `sendRecoveryLineMessage` | Checks existing non-expired `status=sent` link for same entitlement/contact/channel and returns `duplicate` | Requires encrypted recipient secret; no recipient means no token creation |
| Operator recovery-link smoke | `createPaidResultRecoveryLink` with channel `operator_test` | No Email/LINE send | Creates temporary test link and revokes/deletes after smoke | QA-only, not user resend |
| Operator Email smoke | `POST/PUT /api/operator/email-recovery-smoke` | Sends real Email if provider configured | Uses same Email helper duplicate check | Preview(staging)-only smoke, not support resend |
| Operator LINE smoke | `POST /api/operator/line-recovery-smoke` | Sends real LINE message if provider configured | Uses same LINE helper duplicate check indirectly | Preview(staging)-only smoke, not support resend |

Current status fields:

- `paid_result_recovery_links.status`: `created`, `sent`, `used`, `expired`, `revoked`, `failed`.
- `sent_at` is set only on provider success through `markPaidResultRecoveryLinkSent`.
- `used_at` is set when `/r/[token]` resolves successfully; status becomes `used`.
- `revoked_at` is set when a link is revoked.
- `expires_at` defaults to 90 days from creation.
- `failed` is marked on provider/config failure or missing app URL after link creation.

Current limitations:

- Duplicate prevention only dedupes non-expired `status=sent` links. Once a link becomes `used`, a later send attempt can create a new link.
- `getRecentPaidResultRecoveryLinkForContact` does not order by created time; if multiple rows exist, selection is not guaranteed by recency.
- Provider message IDs are not stored.
- Failure categories and attempt counts are not stored on `paid_result_recovery_links`.
- Bounce/block/unfollow handling is not implemented.
- No public or support-specific resend tool exists.

## 2. Duplicate Scenarios

| Scenario | Current behavior | Policy concern |
| --- | --- | --- |
| User clicks Email save twice | Second action returns duplicate only if an unexpired `sent` link exists | Good enough for automatic duplicate prevention; not enough for explicit resend |
| User clicks LINE save twice | Bind is idempotent; send dedupe applies after paid readiness if sent link exists | Rebinding should not create repeated messages |
| User saved Email before payment and again after payment | Same contact may be updated; send dedupe depends on linked entitlement/contact/channel | Should not send duplicate if a valid sent link exists |
| User saved both Email and LINE | Each channel can receive its own link | Channel-specific links are acceptable |
| Paid delivery hook retries | Current helper dedupes `sent`; failures/noop may create new rows on retry | Need attempt policy to avoid row clutter and storms |
| Queue processor retries | Same as paid delivery hook retries | Must remain non-fatal to paid generation |
| NotifyURL duplicate callback | Payment flow handles duplicate notify and delivery/queue reuse; access-link hook runs after generation completion | Access-link dedupe should absorb repeated completion paths |
| Completed-result save action retried | Same as Email save twice | Should not create unlimited sent messages |
| User asks support to resend | No dedicated support resend tool | Need support/operator-only helper before public UI |
| Email provider succeeds but app receives ambiguous response | Currently success only if adapter returns success; ambiguous failure may mark failed and later retry can send another link | Need provider audit and idempotency strategy |
| LINE send succeeds but user blocks/unfollows later | Future push may fail; no webhook/block state | Need failure category and recipient secret status later |
| Access link expires | `/r/` fails safely with support copy | Support should create fresh link after verification |
| User forwards access link | Link is bearer access until expiry/revocation | Need copy, revocation, and eventual account/member path |

## 3. Recommended v0 Resend Policy

### Automatic Sends

- Automatic paid-delivery sends should dedupe by `entitlement_id + recovery_contact_id + channel`.
- If there is any active non-expired link with `status in ('sent', 'used')` for that key, do not send another automatic message.
- Email and LINE are separate channels and may each have one active sent/used access link for the same report.
- No automatic resend storm: provider/config failures should record failed attempt state and remain non-fatal to paid delivery.
- No automatic resend after expiry; expired link should lead to support/manual flow.

### User-Initiated Save After Payment

- If user saves a new channel after payment, send one access link for that channel if no active sent/used link exists for that contact/channel/report.
- If the same Email/LINE contact already has an active sent/used link, UI should say the link has already been saved/sent and offer support copy rather than sending again.
- If prior send failed or provider was noop, one retry may be allowed after a short cooldown, but this should be explicit in helper logic rather than implicit unlimited retries.

### Manual Support / Operator Resend

- Support/operator resend should create a fresh link after safe verification.
- Support/operator resend should optionally revoke older active support-created links for the same entitlement/contact/channel.
- Do not automatically revoke the original user-sent Email/LINE link unless there is abuse, wrong recipient, or explicit user request.
- Operator/support links should use `channel=support` when sent by support rather than pretending to be the original Email/LINE send.
- Manual resend should require a support reason/category and sanitized operator note in a later audit table/field.

### 90-Day Validity

- Each newly created access link gets its own 90-day validity from creation.
- Expired links do not auto-renew publicly.
- After 90 days, user sees safe support fallback and support can issue a new link if the purchase/report can be verified and retention policy allows.

### Link Reuse vs New Link

- Automatic sends should not create new links when an active sent/used link exists.
- Support/operator resend should create a new token to avoid exposing or needing to retrieve old raw tokens.
- Raw tokens are still one-time-to-caller only; DB remains hash-only.

## 4. Send Status Model

Recommended semantics for current statuses:

- `created`: link row exists, raw token was created, but no provider success has been recorded.
- `sent`: provider accepted the send request; this does not prove inbox/LINE delivery or read.
- `used`: `/r/` successfully resolved at least once; this should still count as an active usable link until expiry/revocation.
- `failed`: provider/config/build URL failure occurred; paid delivery must not fail.
- `revoked`: token must no longer resolve.
- `expired`: optional materialized status; resolver can also infer expiry from `expires_at`.

Clarifications:

- Noop/test adapter must not mark `sent`.
- Provider success means provider accepted the message, not that the user received it.
- Provider message IDs should be persisted later for support audit.
- Bounce/block/unfollow handling should be future provider-webhook work.

## 5. Rate Limiting / Abuse Controls

Recommended v0 guardrails:

- Automatic send limit: one active `sent` or `used` link per `entitlement/contact/channel` until expiry/revocation.
- User self-service resend: defer for v0.
- Support/operator resend: max 3 sends per entitlement per 24 hours across all channels, operator override only with explicit note.
- Per recipient limit: max 3 access-link sends per day per Email hash or LINE recipient hash.
- Public endpoints must not reveal whether an Email/LINE identity exists or has purchased.
- Support/operator responses must be sanitized: no raw token, token hash, raw Email, raw LINE ID, encrypted recipient, `pa_`, `pcs_`, or provider payload.

## 6. Support / Operator Policy

| Support case | Lookup method | Verification | Recommended action |
| --- | --- | --- | --- |
| “I did not receive Email” | Report reference, masked/supplied Email, payment/order context if available | Confirm payment entitlement and contact hash match or collect safe proof | Check spam copy first; if no active sent/used link or after cooldown, create fresh support link and send to verified Email |
| “LINE message disappeared” | Report reference, linked LINE contact with active recipient secret | Confirm entitlement/contact linkage; no raw LINE ID exposure | Send fresh LINE support link if recipient secret active and user has not blocked OA |
| “Link expired” | `/r/` support fallback, report reference, payment context | Verify entitlement/report within retention/support policy | Create fresh support link if allowed; otherwise refund/escalate per policy |
| “I changed phone” | Email or payment context; LINE may no longer be reachable | Verify purchase without requiring intimate raw input | Prefer Email support link; rebind LINE later if needed |
| “I paid but no report” | Payment intent/order reference, report reference if known | Verify payment status and generation job/result | If generation failed, retry generation or refund/escalate; resend only after report exists |
| “I used wrong Email” | Payment/report context plus old/new Email hashes if possible | Verify purchase; avoid exposing existing contact data | Add new Email contact and send support link to new verified address; optionally revoke wrong-recipient link |

Do not require raw intimate source text for lookup unless no other verification path exists.

## 7. Provider-Specific Policies

Email:

- Resend provider is the v0 real sender.
- Resend idempotency currently uses `paid-result-recovery-link/[link-id]`, which is safe but does not dedupe a newly created replacement link.
- Bounce handling, spam-placement telemetry, and provider message ID audit are deferred.
- User copy may later say: “如果沒有收到，請先檢查垃圾信件匣；仍找不到可聯絡 hello@anyu.tw。”

LINE:

- LINE Messaging API push requires encrypted recipient secret; hash-only contact alone cannot send.
- Block/unfollow handling is deferred.
- Do not send marketing/new-module messages through this transactional access-link path.
- If LINE provider reports recipient failure, mark send failed and leave Email/support fallback available.

## 8. Data Model Implications

Current `paid_result_recovery_links` is enough for basic token creation, resolution, expiry, revocation, sent/used state, and coarse failed state.

Recommended future fields or table:

- `provider_message_id`: useful for Resend/LINE support audit.
- `last_send_attempt_at`: needed for cooldown/rate limiting.
- `send_attempt_count`: needed for automatic and support resend limits.
- `failure_category`: distinguish config missing, provider rejected, recipient unavailable, app URL unavailable, rate limited.
- `resend_of_link_id`: chain support-created replacement links.
- `superseded_at`: optional if support resend should revoke/supersede previous links.
- `operator_note` or separate audit table: prefer separate audit table to avoid mixing sensitive support notes into token rows.

Recommendation:

- Do not add schema now in this planning task.
- First implementation should add an internal resend helper that works with existing fields where possible, then add provider/audit fields in a scoped migration before production support ops.

## 9. Public Copy Implications

Recommended now:

- Keep current copy: Email/LINE send a 專屬查看連結, retained for 90 days, no report body.
- Add support fallback on invalid/expired pages only.

Recommended later with resend helper:

- “如果沒有收到，請先檢查垃圾信件匣；仍找不到可聯絡 hello@anyu.tw。”
- “若封鎖 LINE 官方帳號，將無法收到查看連結。”
- “查看連結請勿轉傳給他人。”

Defer public self-service copy:

- “重新寄送” button/copy should wait until resend helper, rate limits, and non-enumerating responses exist.

## 10. QA / Tests To Plan

- Automatic Email send does not send twice when active `sent` or `used` link exists.
- Automatic LINE send does not send twice when active `sent` or `used` link exists.
- Failed provider send remains non-fatal to paid delivery.
- Noop adapter creates no false `sent` claim.
- Manual support resend creates a new support-channel link without exposing raw token.
- Support resend can revoke/supersede older support links if policy says so.
- Expired/revoked links render safe support pages.
- Email and LINE channel links remain independent.
- Wrong/missing recipient does not create orphan LINE token.
- Operator/helper output never includes raw token, token hash, raw Email, raw LINE ID, encrypted recipient, `pa_`, `pcs_`, provider payload, or report content.

## 11. Recommended Implementation Sequence

1. **Access Link Resend Helper v0**
   - Internal server-only helper.
   - Support/operator only.
   - Creates fresh support-channel link after verified entitlement/report.
   - Sanitized return shape.
   - No public UI.

2. **Provider Message ID / Send Attempt Audit v0**
   - Add schema fields or audit table for message ID, attempt count, failure category, and last attempt.
   - Enables rate limits and support diagnostics.

3. **Support Ops Helper v0**
   - Preview/staging first.
   - Operator-gated.
   - Lookup by safe report reference/payment context.
   - Can issue support resend without exposing raw identifiers.

4. **Public Resend UI Later**
   - Only after non-enumerating response model and rate limits exist.

5. **Bounce / Block Webhook Handling Later**
   - Resend bounce/complaint events.
   - LINE block/unfollow or provider failure categorization.

## Dashboard Update

Dashboard was updated to mark Duplicate / Resend Policy Plan v0 as the current policy step after access-link copy alignment and before support ops/public resend implementation.

## Tech Debt Review

### New Technical Debt Introduced

- None; planning-only.

### Existing Technical Debt Observed

- `getRecentPaidResultRecoveryLinkForContact` does not guarantee ordering, so “recent” is currently a naming promise more than a query guarantee.
- Duplicate prevention does not treat `used` links as active, even though `/r/` links remain multi-use until expiry/revocation.
- Provider message IDs and failure categories are not persisted.

### Opportunistic Cleanup Completed

- None; no runtime edits were made.

### Deferred Cleanup Candidates

- Add ordering to recent-link lookup.
- Add send-attempt audit data.
- Split support resend tooling from QA smoke endpoints.

### Recommended Follow-up

- Access Link Resend Helper v0.

## Git Commit

- Commit hash: `pending`
- Commit message: `docs: plan access link resend policy`

## Staging Push

- Push status: `pending`
- Push command: `git push origin HEAD:staging`
