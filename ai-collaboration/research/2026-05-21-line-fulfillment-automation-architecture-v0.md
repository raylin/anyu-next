# LINE Fulfillment Automation Architecture v0

Date: 2026-05-21

## 1. Summary

Module 01 should move from a notification-oriented LINE capture to a fulfillment-oriented flow before growth spend. The recommended MVP is a controlled dual path:

- Mobile primary: LIFF opens with fulfillment context, binds the LINE user to the unlock intent, then sends the user to an unlocked result route.
- Desktop and fallback: the app shows a short code after unlock intent creation; the user sends that code to the LINE OA, and the webhook replies with the unlocked result link.

This plan does not add payment, CRM, rich menu, membership, email delivery, new model generation, or production behavior changes. It defines the architecture for a later implementation task.

## 2. Current Funnel Gap

Current flow:

```text
free result
-> unlock intent
-> LINE add / Email fallback
-> opening notification promise
```

Observed implementation state:

- `PaidPreviewCard` triggers `revealContact`.
- `AiTemperatureResult` calls `POST /api/unlock-intent` with result/module/session context, receives `unlockIntentId`, and then shows `ContactCapture`.
- `ContactCapture` tracks `line_add_clicked` and sends the user to `NEXT_PUBLIC_LINE_ADD_URL`.
- Email fallback posts to `/api/contact`.
- `unlock_intents` stores result/module/session context only; it does not store fulfillment codes, tokens, LINE binding state, delivery state, or expiration.
- The current LINE OA setup is documented, but LINE API, LIFF, webhook, and automated delivery are deferred.

The gap is user-value delivery. A user can express paid/unlock intent and join LINE, but the system cannot automatically match that LINE user to the result or deliver a complete analysis link.

## 3. Target MVP Flow

Target flow:

```text
free result
-> unlock intent
-> LINE fulfillment panel
-> mobile LIFF path or short-code fallback
-> system binds unlock intent
-> user opens complete analysis link
```

The MVP remains fake-door/internal-test compatible: no real charge is taken, but the unlock action should return a real unlocked-result experience. The complete analysis should be based on already persisted analysis result data in v0, not a new provider call.

## 4. Mobile LIFF Path

Recommended mobile path:

1. User clicks the unlock CTA.
2. `/api/unlock-intent` creates an unlock intent with a short-code hash, token hash, expiration, and pending fulfillment state.
3. The fulfillment panel shows `用 LINE 領取完整分析`.
4. The CTA opens a LIFF URL with fulfillment token context.
5. LIFF initializes and requests the minimum LINE identity needed to bind the request.
6. The LIFF page calls `POST /api/line/liff/bind` with the fulfillment token and LINE identity proof.
7. The backend verifies the identity proof server-side, binds the LINE user ID, marks the intent fulfilled, and returns the unlocked route URL.
8. LIFF redirects to `/m/ambiguous-temperature/unlock/[unlockToken]` or shows a single confirmation link to that route.

Redirect decision:

- Prefer `/m/ambiguous-temperature/unlock/[unlockToken]` as the canonical unlocked route.
- Avoid making the LIFF page itself the long-term result page; keep LIFF as a binding bridge.
- Do not require LINE push delivery for the LIFF path in v0. Returning or redirecting to the unlocked web route is simpler and avoids push-message configuration risk.

## 5. Short-code Fallback Path

Recommended fallback path:

1. User clicks unlock.
2. The app creates an unlock intent and displays a short code.
3. User joins the LINE OA by button, QR, or existing add-friend link.
4. The LINE welcome or page copy asks the user to paste the short code.
5. User sends the code to the LINE OA.
6. `/api/line/webhook` verifies the LINE signature.
7. The backend normalizes and hashes the code, finds a pending unexpired unlock intent, binds `line_user_id`, marks fulfillment state, and replies with the complete analysis link.
8. Invalid or expired codes receive a safe recovery message.

Code properties:

- Short enough to type or paste, e.g. 6-8 uppercase characters using a non-ambiguous alphabet.
- Random; it must not encode `resultId`, `unlockIntentId`, or module data.
- Expiring, one-time or limited-use, and safe to regenerate.
- Stored hashed where practical so the database does not contain reusable live codes.

## 6. Matching Strategy

Each unlock intent should get both:

- A high-entropy fulfillment token for LIFF context and unlocked route access.
- A short fulfillment code for LINE OA message matching.

Recommended matching:

- LIFF path matches by fulfillment token plus verified LINE identity.
- Short-code path matches by normalized code text plus webhook-provided LINE user ID.
- The unlocked route resolves by high-entropy token, not by short code.
- Do not rely solely on LINE add-friend URL parameters unless future testing proves they are reliable across mobile, desktop, QR, and browser contexts.

Fulfillment must be idempotent. If a user repeats the same valid code or opens LIFF twice, return the same unlocked link instead of creating duplicate delivery state.

## 7. Unlocked Result Route

Recommended route:

```text
/m/ambiguous-temperature/unlock/[unlockToken]
```

Requirements:

- Token must be unguessable and expiring.
- The route should not require auth in v0.
- The route renders unlocked content associated with the stored `resultId`.
- The route must not expose raw user input.
- Expired, invalid, or revoked tokens should show a recovery path back to result regeneration or contact capture.

Content decision:

- Use already persisted `analysis_results.normalizedResultJson` as the source of truth.
- If the current normalized result already contains paid or premium fields, render those.
- If full paid content is not yet generated, define v0 "complete analysis" as a deterministic expanded rendering of existing result fields. Do not add a new LLM generation step, prompt contract, or schema semantics in the fulfillment MVP unless a separate approved schema/prompt task defines it.

## 8. DB / Schema Proposal

Recommendation: extend `unlock_intents` for the MVP.

Rationale:

- `unlock_intents` already owns result/module/session context.
- The MVP has one fulfillment lifecycle per unlock intent.
- A separate `line_fulfillments` table would be useful later for multi-delivery history, audits, broadcast workflows, or multiple channels, but that is not needed for the first automated funnel.

Proposed minimal fields:

- `fulfillment_code_hash`
- `fulfillment_token_hash`
- `fulfillment_status`
- `fulfillment_channel`
- `line_user_id`
- `line_bound_at`
- `fulfilled_at`
- `fulfillment_expires_at`
- `delivery_attempt_count`
- `last_delivery_error`
- `last_delivery_at`

Optional future fields:

- `fulfillment_revoked_at`
- `fulfillment_code_rotated_at`
- `last_invalid_attempt_at`
- `line_webhook_event_id` for idempotency if duplicate LINE events become a problem.

Avoid storing:

- LINE display name
- LINE profile image URL
- arbitrary LINE message text
- raw user input
- full result JSON in fulfillment tables or events

This is a schema proposal only. A future migration task must create a decision log or migration note if repository schema policy requires it.

## 9. API Routes Proposal

Recommended implementation routes:

- `POST /api/unlock-intent`: extend existing route to create fulfillment code/token and pending state.
- `POST /api/line/liff/bind`: verify LIFF identity proof, bind LINE user ID, and return unlocked URL.
- `POST /api/line/webhook`: verify LINE signature, parse code messages, bind matching intents, and reply with the unlocked URL.
- `GET /m/ambiguous-temperature/unlock/[unlockToken]`: render unlocked result content from persisted result data.
- Optional `POST /api/unlock-intent/[id]/refresh-code`: regenerate an expired fallback code if the user is still on the result page.

Route behavior:

- Webhook must reject invalid signatures before parsing payloads.
- Bind and webhook routes should never log raw LINE message text.
- Invalid code replies should be generic and recoverable.
- Successful routes should record safe analytics events only.

## 10. LINE Console / Env Requirements

Server-only env:

- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `FULFILLMENT_TOKEN_SECRET`

Public env:

- `NEXT_PUBLIC_LINE_ADD_URL`
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `NEXT_PUBLIC_LINE_LIFF_URL`

Existing or shared env likely needed:

- canonical app URL for absolute unlocked links
- database URL for persistence

LINE Console setup checklist:

- Confirm the existing OA / Messaging API channel relationship.
- Enable webhook delivery.
- Set webhook URL to production and staging equivalents of `/api/line/webhook`.
- Verify webhook signature behavior with LINE test events.
- Create a LIFF app for the Module 01 fulfillment endpoint.
- Configure minimal LIFF scopes required for identity binding.
- Confirm mobile browser, LINE in-app browser, desktop browser, and QR fallback behavior.
- Update OA welcome copy only after the backend path is live and smoke-tested.

No console or env changes should be made during this architecture task.

## 11. Copy Direction

Panel CTA:

```text
用 LINE 領取完整分析
```

Support copy:

```text
目前內測中，這次不會真的收費。加入 LINE 後，我們會把完整分析連結送給你。
```

Fallback copy:

```text
如果沒有自動帶入，請把這組短碼貼給暗語 ANYU：
A7K2Q9
```

LINE welcome:

```text
歡迎來到暗語 ANYU。
請貼上剛剛頁面上的短碼，我會把完整分析連結送給你。
```

Success reply:

```text
收到，這是你的完整分析連結：
{url}
```

Invalid or expired code:

```text
我找不到這組短碼。請回到剛剛的結果頁重新產生一次，或改用 Email 接收。
```

Tone should remain warm, direct, and internal-test safe. Do not imply real payment has been processed.

## 12. Email Fallback Decision

Email fallback should eventually align with the same fulfillment promise, but the MVP should not promise email delivery until an email sending provider and delivery path exist.

Recommended v0 decision:

- Keep Email fallback capture-only until a separate email-delivery task is approved.
- If the user has an active unlocked route in the browser, the page can offer to copy/open the unlocked link immediately.
- Do not add email sending, transactional provider setup, or email templates inside the LINE fulfillment MVP.

## 13. Security / Privacy Boundaries

Required security boundaries:

- Verify LINE webhook signatures with `LINE_CHANNEL_SECRET`.
- Keep `LINE_CHANNEL_ACCESS_TOKEN` server-only.
- Use high-entropy fulfillment tokens.
- Store hashes for short codes and fulfillment tokens where practical.
- Expire codes and tokens.
- Make fulfillment idempotent.
- Rate-limit webhook code attempts if practical.
- Return safe generic messages for invalid or expired codes.
- Never include secrets, raw input, or full result data in logs or analytics metadata.

Required privacy boundaries:

- Store only `line_user_id`, result/intent IDs, fulfillment status, channel, and timestamps.
- Do not store LINE display names, profile images, arbitrary messages, raw source text, or raw user input.
- LINE replies should contain a link, not the full analysis text.
- The unlocked route should render from stored structured result data without exposing raw input.

## 14. Event / Metrics Plan

Recommended safe events:

- `fulfillment_liff_opened`
- `fulfillment_liff_bound`
- `fulfillment_code_shown`
- `fulfillment_code_matched`
- `fulfillment_link_delivered`
- `fulfillment_failed`
- `line_webhook_received`

Allowed metadata:

- `unlockIntentId`
- `resultId`
- `moduleId`
- `channel`
- `status`
- `errorCode`
- `elapsedMs`
- `source`

Forbidden metadata:

- raw user input
- LINE message text
- email address
- LINE display name
- LINE profile image URL
- full result JSON
- provider output
- secrets or tokens

## 15. Testing Plan

Implementation-phase tests:

- Unit: short-code generation avoids ambiguous characters and produces sufficient uniqueness.
- Unit: code and token hashing/lookup works.
- Unit: expiration behavior rejects old codes and tokens.
- Unit: webhook signature verification accepts valid signatures and rejects invalid signatures.
- Unit: code normalization and matching are safe and deterministic.
- Route: LIFF bind endpoint handles valid, invalid, expired, and already-fulfilled intents.
- Route: webhook message event handles valid code, invalid code, duplicate event, expired code, and non-message event.
- Route: unlocked result token renders valid content and handles invalid/expired tokens.
- Component: fulfillment panel shows LIFF CTA and short-code fallback copy.
- Playwright: result page unlock flow reveals the fulfillment panel without exposing raw input.

## 16. Production Smoke Plan

Staging smoke:

- Create a synthetic result and unlock intent.
- Confirm LIFF opens with fulfillment context.
- Confirm LIFF bind returns or redirects to unlocked route.
- Confirm short code appears and expires correctly.
- Confirm LINE webhook validates signature in a test channel or with a trusted fixture.
- Send one valid code from a test LINE user and confirm reply contains the unlocked link.
- Send one invalid code and confirm safe recovery copy.
- Confirm unlocked route loads and does not expose raw input.
- Scan analytics/event records for forbidden metadata.

Production smoke after explicit launch approval:

- Use one synthetic result.
- Use one test LINE account.
- Execute one LIFF bind.
- Execute one short-code match.
- Confirm link delivery.
- Confirm no raw input or secret-like values appear in events/logs.
- Confirm rollback path is to return CTA to current LINE add URL behavior.

## 17. Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| LINE user cannot be matched | Medium | Use short-code fallback and idempotent manual retry. |
| LIFF desktop behavior inconsistent | Medium | Treat LIFF as mobile primary and keep desktop short-code path. |
| Webhook spoofing | High | Verify LINE signature before parsing or acting on payloads. |
| Token guessing | High | Use high-entropy tokens, hash at rest where practical, and expire access. |
| Raw content appears in LINE | Medium | Send only links and generic status replies, not analysis body or raw input. |
| User expects payment delivery | Medium | Keep internal-test copy explicit and avoid real-charge language. |
| Duplicate webhook delivery | Medium | Make fulfillment idempotent and consider event ID dedupe later. |
| Short code brute force | Medium | Use random codes, expiry, attempt limits, and generic failure replies. |
| Email fallback promise mismatch | Medium | Keep email capture-only until delivery exists, or avoid promising email delivery. |

## 18. Implementation Scope Recommendation

Recommended build sequence:

1. Fulfillment foundation: extend `unlock_intents`, add code/token generation, add token hashing, define statuses, and create the unlocked route from existing result data.
2. Mobile LIFF path: add LIFF bridge page, bind endpoint, LINE identity verification, and redirect to unlocked route.
3. Short-code fallback: add webhook endpoint, signature verification, code matching, LINE reply delivery, and invalid-code recovery.
4. UI copy update: replace notification-oriented panel copy with fulfillment-oriented LIFF CTA and short-code fallback copy.
5. Staging and production smoke: test with a LINE test account before any ad or growth work.

The implementation should ship as one gated funnel improvement, but each slice should be independently testable.

## 19. What Not To Build Yet

Do not build yet:

- real payment
- CRM
- LINE rich menu
- broadcast campaigns
- membership account system
- admin portal
- email sending
- queue/worker infrastructure
- new LLM generation step
- model routing changes
- schema/prompt semantic changes for paid content
- profile storage
- analytics dashboard
- scraping or external source collection

## 20. Open Questions

- Which LINE channel and LIFF scope combination reliably exposes the identity needed for binding in the current OA setup?
- What exact expiration should be used for code and unlocked-token access? Initial recommendation: short code 15-30 minutes, unlocked token 24 hours unless product/legal review chooses otherwise.
- Is the current `normalizedResultJson` sufficient for a credible "complete analysis" view, or does the product need a separate approved content expansion plan?
- Should token hashes be mandatory from the first implementation, or is direct token storage acceptable for a very short-lived internal MVP? Recommendation: hash from the start.
- Should already fulfilled intents allow repeated access until token expiry, or rotate tokens after first view?
- Should Email fallback show an immediate browser unlock link once the user is already on the result page?

## 21. Recommended Next Step

Proceed to a focused implementation handoff for LINE Fulfillment Automation MVP v0:

- no payment
- no new provider generation
- extend `unlock_intents`
- add unlocked route
- add LIFF bind path
- add short-code webhook fallback
- update fulfillment panel copy
- test on staging with a LINE test account before any growth launch
