# Two-tier Free/Paid Result + LINE Fulfillment Architecture v0

Date: 2026-05-25

## 1. Summary

ANYU should move Module 01 from one synchronous generation that creates both free and paid results into a two-tier architecture:

```text
Tier 1: free result first
Tier 2: paid result only after unlock / LINE bind / payment success
```

The target reduces first-result latency, avoids generating expensive paid content for users who never unlock, and lets paid output remain high quality without putting every free analysis near HTTP timeout limits.

Recommended path:

```text
Phase 1 beta: free result first, paid generation after LINE bind / short-code match.
Phase 2: first LINE friend receives one free complete analysis.
Phase 3 paid era: payment success triggers paid generation.
```

## 2. Current Problem

Current production analyze generates free and paid result together. PaidResult v2 improved unlocked value but made fresh analyze take roughly 60-70 seconds, even after the hotfix.

Main problems:

- First-result latency includes paid-result generation.
- Provider cost is spent for every free user even if unlock or LINE conversion is low.
- Synchronous HTTP remains close to route/client timeout ceilings.
- Paid result has to be concise to fit the free-analyze request path, even though unlocked value could benefit from richer generation.

Strategic issue:

```text
If only a small percentage of users enter LINE/payment/unlock, current architecture over-generates paid content.
```

## 3. Current Flow

```text
user submits input + optional context
→ analyze route calls provider
→ provider generates free result + paid result
→ result persisted
→ free result shown with paid preview
→ user may or may not click unlock / LINE
```

Current strengths:

- Simple single request.
- Free and paid result are coherent because they are generated together.
- Existing result page, unlock intent, and LINE fulfillment can assume paid content already exists.

Current weaknesses:

- Slow first response.
- Costly for low unlock rates.
- Hard to keep paid result rich without timeout risk.
- Failure in paid-result validation can block free result delivery.

## 4. Target Two-tier Flow

Target flow:

```text
Tier 1
user submits input + optional context
→ analyze route generates free result only
→ free result persisted
→ free result returned quickly
→ page shows paid teaser / unlock CTA

Tier 2
user clicks unlock / LINE / payment intent
→ unlock intent created or updated
→ paid result generated if not already completed
→ unlocked link delivered through web and/or LINE
```

The product boundary should become:

```text
free = understand
paid = act
```

## 5. Free Result Boundary

Free result should feel useful, emotionally resonant, and fast. It should not feel gutted, but it should leave the action layer for paid.

Free result should include:

- Temperature score.
- Core interpretation.
- 3 signal cards.
- Gentle next-step teaser.
- Paid teaser explaining what the complete analysis adds.

Free result should not include:

- Full 3-state analysis.
- 6-9 copyable messages.
- Full 48-hour action plan.
- Full avoid list.
- Summary card.

Free result generation should optimize for:

- Low latency.
- Stable schema.
- Low cost.
- Enough insight to build trust before asking for LINE/payment.

## 6. Paid Result Boundary

Paid result remains the high-value action layer.

Paid result should include:

- 3 possible states.
- 3 signal deep dives.
- 3 reply strategies.
- 6-9 copyable messages.
- 48-hour action plan.
- Avoid list.
- Soft insight.
- Summary card.

Paid generation can be longer and higher quality once it is no longer blocking every free result. It should use:

- Original normalized/redacted input.
- Optional context chips.
- Free result summary or selected free-result interpretation.
- Paid prompt/schema version.

Paid generation should not happen for every free user.

## 7. Trigger Points: Unlock, LINE, Payment

Option A: trigger on unlock click.

```text
user clicks unlock CTA
→ paid generation starts
```

Pros:

- Captures intent early.
- Works in beta without real payment.
- Simple web-first mental model.

Cons:

- Still generates paid result for users who click but do not complete LINE/payment later.

Option B: trigger on LINE bind.

```text
user completes LINE friend/bind or sends short code
→ paid generation starts
```

Pros:

- Generates paid result only after owned-channel value is captured.
- Fits first-LINE-friend free unlock.
- Aligns with current LINE fulfillment strategy.

Cons:

- User may wait after LINE bind.
- Requires clear pending-state copy and retry behavior.

Option C: trigger on payment success.

```text
payment webhook succeeds
→ paid generation starts
```

Pros:

- Best cost discipline.
- Avoids generating paid output for unpaid users.

Cons:

- Must handle generation delay/failure after payment.
- Requires strong retry, support, and user reassurance.

Recommended phased trigger:

```text
Phase 1 beta: trigger after LINE bind / short-code match.
Phase 2 fake-door/payment-intent: trigger after LINE bind or payment intent depending experiment.
Phase 3 paid era: trigger after payment success.
```

## 8. LINE Friend Acquisition Strategy

LINE should be treated as owned channel and retention infrastructure, not just delivery.

Principles:

- Do not block the free result behind LINE.
- Do encourage LINE before complete analysis delivery.
- Present LINE as save/receive/continue, not as a technical workaround.
- Avoid sending raw input or raw analysis content in LINE messages.

Recommended touchpoints:

- Free result page: `用 LINE 領取完整分析`.
- Paid teaser: explain the complete analysis can be sent through LINE.
- Waiting state: LINE can notify when the complete analysis is ready.
- Future modules: LINE can support reactivation when new modules launch.

## 9. First LINE Friend Free Unlock Strategy

Recommendation:

```text
First verified LINE friend gets one free complete analysis.
```

Rationale:

- Early LINE friend value may exceed one NT$49 unlock.
- Reduces friction before trust is established.
- Creates a clear exchange: add LINE, receive one complete analysis.
- Builds owned-channel base before paid acquisition.

Minimum tracking later:

- `line_user_id`
- `first_free_fulfillment_used_at`
- `free_unlock_source`

Recommended eligibility:

```text
Per verified LINE user, once.
```

Avoid in v0:

- Full account system.
- Cross-device identity graph.
- Complex abuse scoring.

## 10. Mobile LIFF Flow

Mobile should maximize LINE friend conversion with a native-feeling handoff.

Recommended mobile flow:

```text
free result
→ tap 用 LINE 領取完整分析
→ open LIFF or LINE add-friend flow
→ bind LINE user
→ if first-free eligible:
     paid generation starts
     show pending state
     send unlocked link when ready
   else:
     show paywall or paid-intent state
```

Mobile UX notes:

- Use LINE in-app browser friendly copy.
- Detect LIFF availability where feasible.
- Fall back to short code if LIFF fails.
- Keep pending copy explicit: `正在整理完整分析，完成後會傳給你`.
- Do not require users to copy long URLs manually.

## 11. Desktop / QR / Short-code Flow

Desktop should assume the user may need to move from web to phone.

Recommended desktop flow:

```text
free result
→ show LINE QR/add URL
→ show short code
→ user sends short code to OA on phone
→ webhook binds short code to LINE user
→ paid generation starts or fulfillment continues
→ LINE sends unlocked link when ready
```

The short code should feel intentional:

- Explain it as a secure claim code.
- Keep it short and readable.
- Show what the bot will reply after the code is sent.
- Avoid presenting it as a fallback failure unless LIFF/QR is unavailable.

## 12. Future Paywall Flow

Preferred paid-era flow:

```text
free result
→ paid teaser
→ checkout NT$49
→ payment success webhook
→ paid generation starts
→ web waiting/polling + optional LINE notification
→ unlocked result
```

LINE should be optional around payment:

- Save result.
- Receive paid-result notification.
- Claim first-friend free unlock.

Payment identity should not depend on LINE identity. LINE delivery should be a convenience and retention layer, not a required account system.

Payment provider choice should be a separate decision. Candidates for later evaluation:

- NewebPay
- ECPay
- LINE Pay

## 13. Data Model / Schema Implications

Do not change schema in this planning task. Future schema needs should be handled through a separate migration plan.

Likely `analysis_results` direction:

```text
free_result_json
paid_result_json nullable
paid_result_status: not_requested / queued / processing / completed / failed
paid_result_requested_at
paid_result_started_at
paid_result_completed_at
paid_result_error_code
paid_result_prompt_version
paid_result_schema_version
```

Alternative:

```text
analysis_paid_results table
```

Recommended future evaluation:

- Use nullable paid fields on `analysis_results` if v0 needs the smallest migration and one paid result per analysis.
- Use a separate `analysis_paid_results` table if retries, versions, payment records, or multiple paid generations per free result become likely.

Likely `unlock_intents` direction:

```text
unlock_reason: line_first_free / payment / beta_free / operator_test
payment_status: not_started / pending / paid / failed / refunded
paid_generation_status
fulfillment_status
line_user_id
first_free_eligible
```

Future `payment_records` table:

```text
provider
provider_payment_id
checkout_session_id
amount
currency
status
paid_at
refunded_at
result_id
unlock_intent_id
```

## 14. Cache Strategy

Use layered caches:

```text
free_result cache:
  normalized/redacted input + context + freePromptVersion + freeSchemaVersion + model

paid_result cache:
  resultId or normalized/redacted input + context + paidPromptVersion + paidSchemaVersion + model
```

Important rules:

- Free result cache hit must not require paid result existence.
- Paid result can be generated later and cached independently.
- Paid result should reuse free result summary where possible to keep narrative coherence.
- Changing paid prompt/schema should not invalidate free result cache unless free result semantics changed.

Open question:

```text
Should paid result be keyed by source free result ID only, or by normalized input/context?
```

Recommendation:

```text
Use source result ID for fulfillment state, and include normalized input/context/prompt/model in a paid cache key for dedupe.
```

## 15. Fulfillment State Machine

Suggested future unlock intent states:

```text
created
line_binding_pending
line_bound
payment_pending
paid_generation_pending
paid_generation_processing
paid_ready
delivered
failed
expired
```

Key flows:

```text
LINE bound + paid ready → send link immediately
LINE bound + paid pending → reply with pending message, send link later
payment paid + no LINE → web polling page
payment paid + LINE bound → send when ready
paid generation failed → retry or safe operator fallback
```

Keep v0 implementation smaller if possible:

```text
pending → processing → ready → delivered / failed
```

## 16. Failure / Retry Handling

Must handle:

- Free generation fails.
- LINE bind succeeds but paid generation fails.
- Payment succeeds but paid generation fails.
- LINE delivery fails.
- User loses page during generation.
- User repeats the same unlock.
- Short code expires or is reused.

Recommended v0 behavior:

- Free generation failure: return normal analyze failure message.
- Paid generation pending: show web/LINE pending state.
- Paid generation failure: one safe retry, then mark failed and show `收到，我們稍後補送`.
- LINE delivery failure: keep unlocked web link available and mark delivery retryable.
- Repeated unlock: reuse existing paid result or current pending state.
- Expired intent: require a fresh unlock intent.

## 17. Cost / Latency Model

Example:

```text
100 free analyses
5 LINE/unlock intents
2 real payments later
```

Current:

```text
100 full free+paid generations
```

Two-tier beta:

```text
100 free generations
5 paid generations after LINE/unlock
```

Two-tier paid:

```text
100 free generations
2 paid generations after payment success
```

Expected benefits:

- First result latency should drop materially because free generation is smaller.
- Provider cost should drop because paid generation volume follows unlock/payment demand.
- Paid output can become richer again because it no longer blocks every free request.
- Browser timeout risk decreases for first-result users.

Main tradeoff:

```text
Users who unlock may wait for paid generation after they show intent.
```

This requires good pending UX and notification strategy.

## 18. Security / Privacy Notes

Two-tier must preserve:

- No raw input in LINE messages.
- No raw provider output in event metadata.
- No tokenized URLs in logs.
- No LINE user ID in general analytics event metadata.
- Paid result not generated for expired or invalid intents.
- Payment webhook signature verification when payment is introduced.
- Provider raw output retention should stay bounded by existing retention policy.

LINE messages should deliver:

- Safe status copy.
- Short unlocked link or app route.
- No raw private relationship content.

## 19. Analytics / Metrics

Track sanitized funnel events:

- Free analyze started.
- Free analyze completed/failed.
- Free result latency.
- Unlock clicked.
- LINE bind started/completed.
- First-free unlock eligible/used.
- Paid generation started/completed/failed.
- Paid generation latency.
- Paid delivered.
- Paid opened.
- Payment started/succeeded/failed later.

Avoid:

- Raw input.
- Raw output.
- LINE user IDs in analytics payloads.
- Payment secrets or provider payloads.

## 20. Implementation Phases

Phase 1: Two-tier beta without real payment.

```text
free result generated first
paid result generated only after LINE bind / short-code match
LINE sends link when paid result is ready
no real payment
```

Phase 2: First LINE friend free unlock.

```text
per-LINE-user first free complete analysis
basic eligibility tracking
simple abuse controls
```

This can be combined with Phase 1 if the schema/migration impact stays small.

Phase 3: Future paywall.

```text
payment provider integration
payment success triggers paid generation
web polling and LINE delivery
refund/failure handling
```

Phase 4: Growth readiness.

```text
ads
A/B free vs LINE-first CTA
payment conversion metrics
retention/reactivation messaging
```

## 21. What Not To Build Yet

Do not build yet:

- Real payment.
- Payment provider integration.
- Full account system.
- User portal.
- LINE broadcast automation.
- Rich menu.
- Long-term personal insight graph.
- Module 02.
- Complex queue platform unless the implementation plan proves it is required.
- SSE/websocket/token streaming.

## 22. Open Questions

- Should first-free unlock be strictly once per LINE user, or once per LINE user per module?
- Should paid result be generated immediately after LINE bind or after an explicit `claim full analysis` tap inside LIFF?
- Should paid result reuse the free result as structured context or regenerate from original input only?
- Should v0 use nullable paid fields on `analysis_results` or a separate `analysis_paid_results` table?
- What is the acceptable paid-generation wait after LINE bind/payment success?
- What support promise is needed if payment succeeds but paid generation fails?

## 23. Recommended Next Step

Create a detailed implementation plan for Phase 1:

```text
Two-tier Free Analyze + Deferred Paid Generation v0
```

That plan should inspect the current DB schema, unlock intent model, LINE fulfillment code, cache keys, and prompt/schema contracts, then propose the smallest migration and implementation sequence. Do not implement until the schema and architecture plan are approved.
