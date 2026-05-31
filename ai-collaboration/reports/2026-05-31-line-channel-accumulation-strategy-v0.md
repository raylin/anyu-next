# LINE Channel Accumulation Strategy v0

Date: 2026-05-31

## Summary

LINE should be treated as ANYU's consent-based owned channel for Taiwan retention, support, save-for-later, module launch, early access, and future lightweight insight loops.

It should not be positioned as the canonical paid report delivery channel. Paid report delivery remains web-based through the session-bound access flow.

No implementation, schema change, push-message setup, payment behavior change, or env change was made in this task.

## 1. Current LINE / LIFF Infrastructure Inventory

| Area | Current source | Status | Reusable? | Notes |
|---|---|---:|---:|---|
| Public LINE add URL | `NEXT_PUBLIC_LINE_ADD_URL`, `getLineAddUrl(...)` | Existing | Yes | Safe for add-friend CTA and notification capture. |
| ContactCapture | `apps/web/src/components/anyu/ContactCapture.tsx` | Legacy / reusable | Yes, with care | Copy is now notification/support oriented and says paid reports are web-delivered. It should not return as the main paid CTA. |
| Email fallback | `POST /api/contact` | Existing | Partial | Useful fallback, but LINE should be the primary Taiwan owned-channel path if consented. |
| Unlock intent | `POST /api/unlock-intent` | Existing legacy path | Partial | Creates fulfillment code/token and records events. It was built for older unlock/contact flow, not current paid checkout canonical flow. |
| LIFF bridge | `/line/fulfill`, `/m/[moduleSlug]/line/fulfill`, `LineFulfillBridge` | Existing | Yes | Can bind LINE identity to a specific context, but should be reframed as save/notify/support rather than paid delivery. |
| LIFF bind API | `POST /api/line/fulfillment/bind-liff` | Existing | Partial | Currently binds unlock intent and can request deferred paid generation via `line_bind`. Future use needs a narrower channel-consent contract. |
| Short-code fallback | fulfillment code in `unlock_intents` | Existing | Yes | Useful fallback for desktop/QR/OA chat flows. Should avoid exposing result tokens or raw input. |
| LINE webhook | `POST /api/line/webhook` | Existing | Yes | Has signature verification, dedupe, rate-limiting, short-code matching, and safe replies. |
| Webhook hardening | `line_webhook_events`, `line_webhook_rate_limits` | Existing | Yes | Good foundation for idempotency and abuse resistance. |
| Fulfillment DB fields | `unlock_intents.fulfillment_*`, `line_user_id` | Existing | Partial | Current fields are tied to unlock fulfillment. Future channel strategy needs consent/channel records rather than overloading unlock intents. |
| Entitlement LINE ref | `entitlements.line_user_ref` | Existing seam | Future | Could later connect LINE identity hash to paid lifecycle, but not needed now. |
| Funnel reporting | `module-01-funnel-report.mjs`, event names | Existing | Yes | Tracks `line_add_clicked`, LIFF bind, short-code, delivery, and failure categories without raw IDs. |

### Legacy vs Reusable Classification

- Reusable now: LINE add CTA, webhook hardening, short-code matching, LIFF bridge mechanics, safe event taxonomy, reporting guards.
- Reusable after redesign: ContactCapture UI, LIFF bind API, unlock-intent fulfillment fields.
- Legacy assumption to avoid: LINE as "complete paid report delivery".
- Not present yet: consent record, channel preference record, campaign/message log, opt-out state, module-history segmentation table, or personalized insight subscription loop.

## 2. New LINE Positioning

LINE should be positioned as:

- Save-for-later: let users keep a safe pointer back to the result or module without exposing private content in LINE previews.
- Completion notification: tell the user when web result generation is ready, if explicit consent and binding exist.
- Support channel: route help/refund questions to owner-supported channels without replacing `hello@anyu.tw`.
- New module notification: announce Module 02 or future mini-tests to opted-in users.
- Early access / discount channel: invite high-intent users before broader launch.
- Future periodic insight channel: low-frequency, user-consented reflection prompts or cross-module insight updates.

LINE should not be positioned as:

- Paid report canonical delivery.
- A substitute for payment confirmation, NotifyURL, or paid access tokens.
- A place to reveal sensitive result content in push previews.
- A daily broadcast channel before engagement and unsubscribe tolerance are proven.

## 3. CTA Timing Map

| Surface | Priority | Copy direction | Implement now? | Rationale |
|---|---:|---|---:|---|
| Homepage | Secondary | `加入 LINE，接收新測驗與開放通知` | Later | Useful owned-channel entry, but do not distract from merchant-review storefront until Module 02 direction is selected. |
| Free result page | Secondary, below primary paid CTA | `儲存結果 / 接收新測驗通知` | Later | Best early channel capture point, but should not compete with paid unlock. |
| Paid CTA area | Avoid as primary | Only small support/save note if needed | Not now | Payment CTA must stay focused on web unlock and NT$49 value. |
| Checkout-start | Support only | `付款問題可聯絡客服；LINE 通知功能未作為付費交付` | Not now | Adding LINE here can distract from provider handoff. |
| ReturnURL waiting / processing | Optional secondary | `完成後可選擇接收通知；此頁會自動更新` | Later | Strong candidate after payment is stable; useful if generation is slow. |
| Paid ready page | Secondary | `把這份結果存到 LINE，之後方便回來看` | Later | Good save-for-later moment; avoid revealing result content in message. |
| Completed paid result page | Secondary / retention | `接收下一個測驗或後續提醒` | Later | Best consent capture for satisfied users and Module 02 early access. |

Near-term recommendation: do not add new LINE CTAs before Module 02 concept/spec unless owner prioritizes channel capture over product focus.

## 4. Data Model / Event Strategy Plan

Do not implement schema yet. Future records should separate channel consent from payment delivery.

Recommended future channel fields:

- `lineUserIdHash`: store a keyed hash where possible; avoid raw LINE ID in analytics.
- `consentState`: `opted_in`, `pending`, `opted_out`, `blocked_unknown`.
- `consentPurpose`: `save_result`, `completion_notification`, `new_module`, `early_access`, `support`, `insight_loop`.
- `sourceModule`: e.g. `ambiguous-temperature`.
- `sourceEvent`: e.g. `free_result`, `paid_ready`, `completed_result`, `module_launch`.
- `sourceResultId`: nullable, internal only; avoid exposing in LINE copy.
- `paymentIntentId`: nullable, internal only; only link when necessary for completion notification or support.
- `tags`: coarse categories such as `module01_paid`, `module02_interest`, `payment_abandoned`.
- `moduleHistory`: module slugs and coarse completion states, not raw result content.
- `traitSummaryCategory`: future coarse traits only, no raw input or sensitive details.
- `lastContactedAt`: cadence and abuse control.
- `lastConsentAt`: auditability.
- `optOutAt`: stop sends immediately.

Recommended event names, if later implemented:

- `line_channel_cta_viewed`
- `line_channel_opt_in_started`
- `line_channel_opt_in_completed`
- `line_channel_opt_out`
- `line_completion_notification_sent`
- `line_module_launch_notification_sent`
- `line_campaign_failed`

Event metadata should keep the existing privacy stance: no raw input, raw LINE message, raw LINE user ID, tokens, URLs, payment provider payload, or result text.

## 5. Early Segmentation Strategy

Useful early segments:

- Free-only users: completed free result but did not purchase.
- Paid Module 01 users: completed paid report and are likely warm for future modules.
- Payment abandoned users: checkout-start or pending payment without paid completion, if consented.
- Report completed users: result generated and accessed successfully.
- High ambiguity sensitivity: coarse Module 01 trait bucket only, if future trait summary is approved.
- Workplace-interest candidates: users who click or opt into Module 02「職場暗流雷達」early access.
- Module 02 early access candidates: high-intent users from paid result or completed result page.

Avoid early over-segmentation. Start with behavior segments before trait-based personalization.

## 6. Message Types and Cadence

Safe initial message types:

- Completion notification: "你的完整報告已準備好，回到網頁查看。"
- Result saved confirmation: "已幫你保存這次結果入口。"
- New module launch: "新的暗語測驗開放了。"
- Early access: invite opted-in users before public placement.
- Discount / limited invite: only after payment/refund flow is stable.
- Weekly or biweekly insight: future, opt-in only, low-frequency.

Cadence recommendation:

- Completion/save messages: transactional and event-triggered.
- Module launch/early access: no more than one message per module event.
- Insight loop: start biweekly at most; do not run daily push until retention and block rates are known.

## 7. Compliance / Consent / Unsubscribe

Requirements:

- Explicit consent before channel messages beyond immediate requested interaction.
- Clear purpose near CTA: notification, support, save-for-later, new module, or early access.
- Easy user expectation: blocking the LINE OA stops messages; future opt-out link/state should be supported if LINE messaging expands.
- Avoid raw input and sensitive result details in LINE messages.
- Avoid private relationship content in push previews.
- Keep paid result access canonical on web, behind the existing access/session/token model.
- Keep `hello@anyu.tw` as the formal support/refund channel unless owner later makes LINE a staffed support channel.

## 8. Implementation Phases

### Phase 1: LINE Add / Bind / Source Tracking

- Reuse LINE add and LIFF/short-code primitives.
- Add a dedicated consent/channel data model only after approval.
- Track where the user opted in: homepage, free result, paid ready, completed result, or Module 02 waitlist.
- Do not send campaign pushes yet.

### Phase 2: Completion Notification

- After paid delivery is ready, send a minimal LINE notification only if the user explicitly opted in.
- Message should link back to web access and not include private result content.
- Keep ReturnURL polling as the primary UX.

### Phase 3: New Module / Early Access Campaign

- Use Module 01 free/paid/completed segments to invite users to Module 02.
- Start with small manual or semi-automated sends.
- Measure opt-in, click, completion, paid conversion, block, and support burden.

### Phase 4: Personalized Insight Loops

- Use coarse trait summaries and module history only after data policy and schema are approved.
- Keep personalization soft: hypotheses and prompts, not rigid labels.
- Avoid building a heavy Personal Insight Graph database before Module 02 validates need.

## 9. Relation to Module 02

LINE can help launch Module 02 without ads by:

- Inviting Module 01 paid users into Module 02 early access.
- Segmenting by behavior first: paid/completed/free-only/abandoned.
- Later segmenting by coarse traits if approved, e.g. ambiguity sensitivity or workplace-interest intent.
- Testing hooks before homepage redesign, e.g. "職場暗流雷達 early access".
- Creating a small owned audience that can compare Module 01 relationship insight with Module 02 workplace signal insight.

Recommendation: use LINE to support Module 02 waitlist/early-access after Module 02 concept/spec is approved, not before.

## 10. Recommended Next Tasks

1. `Module 02 Concept Spec: 職場暗流雷達 v0`
   - Best next product task if owner wants to move from channel planning into multi-module strategy.
   - Keeps LINE CTA and segmentation grounded in a concrete second module.

2. `LINE Channel Data Model Plan v0`
   - Plan a consent/channel table and event model.
   - Should happen before any implementation that stores new LINE consent state or sends notifications.

3. `LINE Add / Bind CTA Copy Plan v0`
   - Define exact CTA copy and placement for free result, paid ready, completed result, and Module 02 waitlist.
   - Should follow Module 02 concept selection.

4. `LINE Completion Notification Implementation v0`
   - Defer until production payment launch is closer and channel data model is approved.
   - Must keep web access canonical and avoid exposing result content in LINE.

## Architecture Decisions

- LINE is repositioned as owned-channel retention and notification, not canonical paid delivery.
- Existing LINE/LIFF/short-code infrastructure is reusable but should not be broadened until a channel consent model is approved.
- Module 02 concept/spec should precede new LINE growth CTAs so the channel has a concrete reason to exist.

## Blockers

- No LINE channel data model is approved yet.
- No Module 02 concept is approved yet.
- Production payment remains disabled pending NewebPay approval and launch gates.

## Uncertainties

- Whether owner wants LINE to become notification-only, staffed support, or campaign channel first.
- Whether future trait-based segmentation is approved under privacy/product policy.
- Whether existing `unlock_intents` LINE fields should be retained, wrapped, or migrated after a dedicated LINE Channel Data Model Plan.

## Tech Debt Review

### New Technical Debt Introduced

- None. This was documentation-only.

### Existing Technical Debt Observed

- LINE fulfillment infrastructure still carries legacy unlock/fulfillment assumptions that predate web-based paid delivery.
- `unlock_intents.line_user_id` stores a direct LINE user reference; future channel strategy should prefer a hashed/ref model for segmentation and analytics.

### Opportunistic Cleanup Completed

- None. No runtime code was changed.

### Deferred Cleanup Candidates

- `LINE Channel Data Model Plan v0`
- `Legacy LINE Fulfillment Reframe / Deprecation Plan v0`
- `LINE Consent Event Taxonomy v0`

### Recommended Follow-up

- Start with `Module 02 Concept Spec: 職場暗流雷達 v0`, then plan LINE channel data and CTA copy around that module.

## Validation

Validation results are recorded in the completion summary.
