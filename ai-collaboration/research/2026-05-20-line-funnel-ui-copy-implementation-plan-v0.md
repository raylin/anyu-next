# LINE Funnel UI Copy + Implementation Plan v0

Date: 2026-05-20

Setup record reference:

- `ai-collaboration/research/2026-05-20-anyu-line-oa-setup-record-v0.md`

## 1. Executive Summary

Module 01 should move from generic contact capture to LINE-first conversion after paid-intent click. The user should first see product value, then be invited to add LINE to receive the complete analysis. Email remains a secondary fallback.

This is a hierarchy change, not a channel monopoly:

- LINE becomes the primary CTA and preferred fulfillment path
- Email remains available so the flow does not feel coercive
- v0 should still use manual or semi-manual fulfillment before LINE automation exists

## 2. Current Contact Capture Gap

Current gap in the shipped app:

- the app still presents generic LINE/Email contact capture
- LINE is not yet clearly primary
- there is no dedicated `line_add_clicked` interaction yet
- the product does not yet connect LINE add behavior to a manual fulfillment workflow
- the fake-door copy still describes a generic “leave LINE or Email” state rather than a deliberate LINE-first conversion step

Consequence:

- the current flow can collect contact intent
- it does not yet express the strategic preference that LINE should be the default delivery and retention channel in Taiwan

## 3. Target LINE-First Funnel

Target future flow:

```text
Result page
→ paid preview
→ click 解鎖下一句怎麼回 — NT$49
→ contact / fulfillment panel opens
→ primary CTA: 加入 LINE 領取完整分析
→ secondary link or button: 改用 Email 接收
→ user action tracked
→ manual / semi-manual fulfillment
```

Key product principle:

- the user should see value first
- only after free-result value is established should the app ask for channel-level commitment

## 4. Paid Unlock Copy

Recommended paid-preview copy:

Headline:

```text
解鎖下一句怎麼回 — NT$49
```

Support line:

```text
給你 3 種不失控的回法：主動推進、低壓試探、暫時拉開。
```

Internal-test note:

```text
目前內測中，這次不會真的收費。
```

Optional softer supporting line beneath CTA:

```text
先加入 LINE 領取完整分析；不想用 LINE，也可以改用 Email。
```

Copy intent:

- warm
- premium
- clear
- not spammy
- not hard-sell
- no subscription vibe

## 5. Contact Capture Copy

Recommended future LINE-first panel copy:

Panel title:

```text
加入 LINE，領取完整分析
```

Panel body:

```text
我們會把這次結果整理成一次完整回覆策略，透過 LINE 傳給你。
也會低頻通知新的測驗；你可以隨時封鎖或要求刪除資料。
```

Secondary support line:

```text
不想使用 LINE？也可以改用 Email 接收。
```

If Email fallback is opened:

```text
留下 Email，我們會用這個信箱送你一次完整分析。
不寄日常電子報；未來若有新測驗通知，會先取得你的同意。
```

Recommended UX structure:

- default panel state shows the LINE-first message
- Email fields are not the first thing shown
- Email appears as a calmer secondary action

## 6. Primary LINE CTA

Recommended primary CTA label:

```text
加入 LINE 領取完整分析
```

Recommended implementation behavior:

- CTA type: button-like primary action
- destination: `NEXT_PUBLIC_LINE_ADD_URL`
- source location: contact capture area after paid-intent click

Suggested event:

```text
line_add_clicked
```

Recommended metadata:

- `module_id`
- `theme_slug`
- `experiment_id`
- `result_id` if available
- `unlock_intent_id` if available
- `source = contact_capture`

UX decision note:

- mobile default should likely prefer same-tab open if LINE add opens a native handoff more reliably
- desktop can tolerate new-tab behavior more easily
- this should remain an implementation decision once the real add-friend URL is available

## 7. Secondary Email Fallback

Recommended secondary CTA:

```text
改用 Email 接收
```

Role of Email:

- visible, but clearly secondary
- not hidden behind many steps
- not promoted as equivalent by layout weight

Recommended behavior:

- opening Email fallback reveals the current contact form or a simplified email-only variant
- Email submission can continue to use the existing `/api/contact` path
- `contact_submitted` remains valid for fallback handling

Recommended product stance:

- users who do not want LINE should still be able to receive one complete analysis
- LINE-first should feel like a preference, not a punishment

## 8. LINE OA URL / Configuration

Required v0 config:

```text
NEXT_PUBLIC_LINE_ADD_URL=
```

Purpose:

- holds the official LINE add-friend URL
- allows product UI to enable the primary CTA without needing full LINE API integration

Future optional config, not needed for v0:

```text
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_MESSAGING_ACCESS_TOKEN=
```

If `NEXT_PUBLIC_LINE_ADD_URL` is not configured:

- primary CTA should not pretend to work
- recommended fallback copy:

```text
LINE 連結暫時還沒準備好，你可以先用 Email 接收。
```

## 9. Event Tracking Requirements

Preferred event model:

- `paid_unlock_clicked`
- `line_add_clicked`
- `email_fallback_opened`
- `email_contact_submitted`
- `contact_submitted`

If event taxonomy should stay minimal in the short term:

- keep `paid_unlock_clicked`
- keep `contact_submitted`
- add safe metadata to distinguish:
  - `contact_method = line_click | email`
  - `source = contact_capture`

Privacy rule:

- do not store LINE ID or Email in events
- do not store result text or provider output in events
- only store method, source, anonymous IDs, and safe result context

Recommended metadata:

- `module_id`
- `theme_slug`
- `experiment_id`
- `result_id`
- `unlock_intent_id`
- `contact_method`
- `source`

## 10. Manual / Semi-Manual Fulfillment Workflow

Recommended v0 workflow:

1. user clicks LINE add CTA
2. user adds LINE OA
3. user sees welcome message
4. user replies a keyword such as `完整分析` or taps rich menu entry
5. operator checks recent unlock/contact records manually
6. operator sends the complete analysis manually or semi-manually

If there is no direct user mapping yet:

- ask the user to send a short code copied from the result or confirmation view

Suggested future short code format:

```text
ANYU-XXXX
```

Do not build code generation in this task. This is a later implementation milestone only.

## 11. Privacy / Legal Copy Alignment

The implementation plan should stay aligned with:

- `/privacy`
- `/terms`
- `/disclaimer`
- `docs/legal/ui-notices-v0.md`
- `docs/legal/line-funnel-disclosure-v0.md`

Recommended aligned short copy:

```text
加入 LINE 後，我們會用於傳送完整分析、內測通知與新測驗提醒。
你可以隨時封鎖官方帳號或透過 hello@anyu.tw 要求刪除資料。
```

Hard rule:

- do not imply LINE automation already exists if v0 is still manual or semi-manual

## 12. Error / Edge States

Required edge states:

- LINE URL missing
- popup or external-open blocked
- user does not want LINE
- Email invalid
- contact API fails
- unlock intent missing

Recommended copy:

LINE URL missing:

```text
LINE 連結暫時還沒準備好，你可以先用 Email 接收。
```

Email fallback submit failure:

```text
目前表單暫時無法送出，請稍後再試一次。
```

Unlock record missing but UI should continue:

```text
內測記錄暫時無法建立，但你仍可留下聯絡方式。
```

UX principle:

- failures should degrade toward Email fallback, not dead-end the user

## 13. Implementation Milestones

### Milestone A: LINE-first Contact UI v0

Scope:

```text
primary LINE CTA
secondary Email fallback
NEXT_PUBLIC_LINE_ADD_URL
line_add_clicked event
no LINE API
```

### Milestone B: LINE OA Setup v0

Scope:

```text
create OA
welcome message
rich menu
privacy links
manual fulfillment workflow
```

### Milestone C: Fulfillment Code v0

Scope:

```text
short code shown after unlock
user sends code in LINE
operator maps code to result / unlockIntent
```

### Milestone D: Automation Later

Scope:

```text
LIFF / webhook
automatic result lookup
LINE message delivery
```

## 14. What Not To Build Yet

Do not build yet:

- LINE Messaging API automation
- LIFF
- webhooks
- CRM segmentation
- daily push
- full account system
- paid membership
- referral system

Also avoid:

- pretending there is a complete LINE backend before it exists
- forcing LINE so hard that the fallback feels deceptive

## 15. Open Questions

- What is the final LINE OA add-friend URL?
- Should Email fallback be shown immediately or behind a smaller text link?
- Should users send a short code in LINE for manual matching?
- Should LINE CTA open in a new tab or the same tab on mobile?
- How many manual complete-analysis deliveries per day are acceptable?
- Should the v0 fake-door continue to allow Email-only users on equal functional terms, even if LINE stays visually primary?

## 16. Recommended Next Step

`LINE Funnel Contact UI Implementation v0`

Reason:

- the strategy and copy are now concrete enough to implement a scoped LINE-first contact surface without yet building LINE API, LIFF, webhook automation, or payment.
