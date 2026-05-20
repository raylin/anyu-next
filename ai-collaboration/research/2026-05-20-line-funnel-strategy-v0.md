# LINE Funnel Strategy v0

Date: 2026-05-20

Setup record reference:

- `ai-collaboration/research/2026-05-20-anyu-line-oa-setup-record-v0.md`

## 1. Executive Summary

LINE should become the primary v0 retention and complete-analysis delivery channel for Taiwan. Email remains a secondary fallback. v0 should avoid heavy community management and use LINE mainly as a conversion and retention funnel, not as a daily content channel.

## 2. Why LINE First

LINE-first is the most pragmatic v0 choice for this product in Taiwan:

- add-friend friction is culturally normal and lower than asking users to trust an unknown email sender
- re-contact through LINE is typically stronger than email open behavior for a tiny brand
- new module notifications fit LINE better than a newsletter-style email program
- beta delivery of complete analysis is easier through manual or semi-manual LINE handling than through email deliverability setup
- it avoids early email stack overhead such as sender reputation, bounce handling, templates, and automation vendors
- it matches a one-person-company operating model better because the same channel can handle delivery, support, and low-frequency follow-up

## 3. Role Of Email

Email should remain in v0, but only as a secondary fallback:

- optional, not primary
- offered when the user does not want to add LINE
- suitable for backup delivery or users outside the preferred Taiwan LINE pattern
- not the default conversion path in product copy

Recommendation:

- product copy should present LINE first
- Email should remain visible but secondary
- Email should not be removed entirely because fallback matters for trust and accessibility

## 4. v0 Funnel Design

Recommended v0 funnel:

```text
User sees result
→ clicks 解鎖下一句怎麼回 — NT$49
→ sees internal-test explanation
→ primary CTA: 加入 LINE 領取完整分析
→ secondary option: 使用 Email 接收
```

Recommended copy direction:

```text
目前內測中，這次不會真的收費。
加入 LINE 後，我們會送你一次完整分析，也會低頻通知新測驗。
你可以隨時封鎖或要求刪除資料。
```

Interpretation for v0:

- fake-door paid intent still does its job as an intent filter
- LINE add becomes the preferred next step after that intent signal
- Email remains available so the product does not feel coercive

## 5. Module 01 Touchpoints

LINE should appear in these Module 01 touchpoints:

- paid preview card
  - primary path should eventually become `加入 LINE 領取完整分析`
- contact capture area
  - LINE first, Email second
- post-submit confirmation
  - clarify what the user should expect next and how soon
- footer or legal references if needed
  - light cross-reference only, not aggressive CTA repetition
- future result follow-up
  - once result delivery and revisit flow are more structured

LINE should not appear too early on landing. Users should first experience value, receive the free result, then encounter the retention/delivery ask.

## 6. LINE Official Account Minimum Setup

Minimum non-code LINE OA setup for v0:

- account name: `暗語 ANYU`
- profile image: ANYU mark or recognizable brand mark
- cover image: optional, not required for launch
- greeting / welcome message
- rich menu
- privacy link
- `測曖昧溫度` link
- support / contact note referencing `hello@anyu.tw`

Operational standard:

- no daily posting requirement
- no high-effort social calendar
- treat the OA as a delivery and low-frequency retention tool first

## 7. Welcome Message Draft

Draft A:

```text
歡迎來到暗語 ANYU。
我們會把那些說不清的互動，翻譯成一點方向。

如果你是從曖昧溫度計來的，
回覆「完整分析」或點下方選單，我們會接著處理。
```

Draft B:

```text
歡迎加入暗語 ANYU。
如果你剛做完曖昧溫度計，完整分析會從這裡接續。

你之後也只會收到低頻的新測驗或重要更新。
不需要時，隨時可以封鎖或來信要求刪除資料。
```

Draft C:

```text
這裡是暗語 ANYU。
我們不會每天打擾你，只會在完整分析準備好，或真的有值得看的新測驗時通知你。

如果你是從曖昧溫度計進來的，請回覆「完整分析」。
```

Recommended v0 choice:

- Draft B as the default greeting
- Draft A as a lighter alternative if the product wants a softer first impression

## 8. Rich Menu Draft

Recommended low-maintenance menu:

- `測曖昧溫度`
- `領取完整分析`
- `最新測驗`
- `隱私與刪除資料`

Notes:

- `測曖昧溫度` returns users to the main product entry
- `領取完整分析` reduces inbox confusion
- `最新測驗` supports future module reuse
- `隱私與刪除資料` improves trust and reduces support ambiguity

## 9. Complete Analysis Delivery Model

### Option A: Manual / semi-manual delivery

Characteristics:

- lowest complexity
- good for beta and low volume
- user adds LINE
- operator sends complete analysis manually or from a prepared template

Pros:

- fastest path to launch
- minimal code and legal complexity
- easy to observe user questions directly

Cons:

- limited scalability
- operator discipline required

### Option B: Link-based delivery

Characteristics:

- result or unlock context maps to a secure-ish follow-up link
- LINE message sends the user back into the app

Pros:

- lower manual fulfillment burden
- cleaner measurement

Cons:

- more implementation work
- needs clearer identity/context handling

### Option C: LIFF / webhook automation

Characteristics:

- true automation path
- future state, not v0 unless manual volume becomes painful

Pros:

- scalable
- cleaner attribution

Cons:

- significantly more moving parts
- larger legal and operational surface

### Recommendation

```text
v0: manual or semi-manual delivery first
v1: link-based delivery
v2: LIFF/webhook
```

## 10. Retention / Revisit Loop

Recommended low-frequency retention loop:

- 3-day follow-up when appropriate:
  - `後來有新的互動嗎？如果你願意，也可以再貼一段新的變化。`
- new module notification:
  - once per meaningful new module or test
- weekly or biweekly digest:
  - only if there is enough genuine value to justify it
- no daily push
- no chatty pseudo-friend persona

Retention principle:

- ANYU should feel useful, selective, and calm
- avoid turning LINE into a noisy content channel

## 11. Ad Traffic Integration

Recommended ad funnel:

```text
Meta / IG ad
→ Module 01 landing
→ analyze
→ result
→ paid-intent click
→ LINE add
```

Why this matters:

- cold traffic should first see product value, not a channel request
- LINE works better as a downstream conversion and retention step
- routing ads straight to LINE weakens product proof and makes attribution messier

## 12. Cost And Message Guardrails

Guardrails:

- LINE push or broadcast should remain low frequency
- avoid mass push until there is clear product value and response quality
- prioritize greeting, replies, and manual or semi-manual delivery before broadcast-heavy behavior
- track LINE add count originating from paid intent
- do not over-message
- do not invent elaborate nurture flows before there is proof of return

Operationally:

- treat broadcast as scarce
- treat direct reply and delivery as higher-value than generic push
- if exact pricing changes, revisit policy with real platform pricing rather than assumptions

## 13. Privacy / Consent Requirements

The LINE strategy should stay aligned with current legal drafts:

- tell users why they are joining LINE
- explain what messages they may receive
- provide privacy and deletion contact: `hello@anyu.tw`
- do not sell LINE data
- allow blocking or unsubscribe behavior through normal LINE behavior
- keep Email available as backup
- do not imply that full LINE automation already exists if it does not

Minimum product-trust rule:

- users should understand that LINE is mainly for complete-analysis delivery, low-frequency test updates, and support-like follow-up

## 14. Metrics

Primary funnel metrics:

- `result_view → paid_unlock_clicked`
- `paid_unlock_clicked → LINE CTA click`
- `LINE CTA click → actual LINE friend/add confirmation` if measurable
- `LINE add → complete analysis delivered`
- `LINE add → later module return`
- `LINE unsubscribe / block` if available

Fallback metrics:

- `paid_unlock_clicked → Email fallback selected`
- `Email fallback selected → contact submitted`

If true LINE add confirmation is not available in v0:

- use `LINE CTA click` as the first proxy
- separately log manual delivered count

## 15. Operational Workflow For One-Person Company

Recommended v0 operating model:

- check LINE inbox once daily on active launch days
- send promised complete analyses in batches or within a stated response window
- tag or label beta users manually if the OA supports light segmentation
- export or log minimal metrics outside the app if needed
- no daily content obligation
- only notify when a new module or follow-up is genuinely useful

Practical rule:

- if the workflow starts to feel like full-time chat support, pause complexity growth and tighten the funnel before adding more channels or modules

## 16. What Not To Build Yet

Do not build yet:

- LINE webhook automation
- LIFF app
- advanced CRM segmentation
- daily push content calendar
- full account system
- paid membership
- complex referral system

Also avoid:

- high-frequency broadcast experiments
- automated branching chat trees unless manual delivery clearly breaks down

## 17. Implementation Milestones

### Milestone A: LINE Funnel Copy + UI Plan

```text
update contact capture copy
primary LINE CTA
secondary Email option
legal copy alignment
```

### Milestone B: LINE OA Setup

```text
create OA
profile image
welcome message
rich menu
privacy links
```

### Milestone C: LINE Funnel App Implementation

```text
add LINE add-friend link
track LINE CTA click
contact capture fallback
resultId context
```

### Milestone D: Post-launch Retention

```text
manual delivery
3-day follow-up
new module notification
```

## 18. Open Questions

- What is the final LINE OA add-friend URL?
- Should LINE add be required for complete analysis, or should Email fallback remain equally available?
- Should the user need to send a keyword after adding LINE, or should the rich menu handle that?
- How should `resultId` or `unlockIntentId` be connected to a LINE user manually in v0?
- How much manual response volume is acceptable before the delivery model must evolve?
- Should the first broadcast after launch be module-based only, or also include a re-engagement prompt for previous users?

## 19. Recommended Next Step

`LINE Funnel UI Copy + Implementation Plan v0`

Reason:

- the strategic direction is now clear enough to design the product copy, CTA hierarchy, and fallback behavior without yet building LINE API or automation.
