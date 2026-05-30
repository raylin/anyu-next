# Module 01 Launch UX Lock + Multi-State Paid CTA Plan v0

Date: 2026-05-31

## Summary

Module 01 is technically close to launch-gate readiness after NewebPay sandbox E2E v5, but the user-facing paid CTA layer is not launch-locked yet.

Primary finding: production storefront and `/refund` are merchant-review aligned, but the in-result paid preview/contact flow still uses internal-test copy: no real charge, LINE/Email delivery, and contact capture. That is safe while production payment is disabled, but it must be intentionally state-managed before production payment enablement.

Recommendation: implement a small multi-state paid CTA model before production launch. Do not change Module 01 prompt/result semantics, provider behavior, public legal copy, or homepage multi-module direction in this task family.

## 1. Current Module 01 UX State Inventory

| Surface | Current user-facing state | Route / file | Notes |
|---|---|---|---|
| Root homepage / storefront | Product/service/storefront page with NT$49, one-time payment, web delivery, refund/support summary, legal footer. | `apps/web/src/app/page.tsx` | Merchant-review aligned. Keep stable while review pending. |
| Module 01 entry/analyze | Warm guided input; no payment required; recovery and polling for analysis request. | `apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx` | Launch-safe; should be locked except small mobile polish. |
| Free result | Shows temperature, observed signals, insight, next step, share card, and paid preview. | `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx` | Core value surface. Paid CTA wording is the main mismatch. |
| Inline result CTA | `看下一句怎麼回`; scrolls to paid preview/contact capture. | `AiTemperatureResult.tsx` | Should become state-aware before launch. |
| Paid preview CTA | Shows price, included sections, policy notes, and reveal button. Copy says internal-test/no real charge and LINE/Email delivery. | `apps/web/src/components/anyu/PaidPreviewCard.tsx` | Highest-priority launch UX mismatch. |
| Contact capture | Internal-test LINE/Email capture flow for future notification/delivery. | `apps/web/src/components/anyu/ContactCapture.tsx` | Should not be the primary paid flow after production checkout launch. |
| Checkout creation | Operator-gated when runtime disabled; returns NewebPay checkout contract when enabled/authorized. | `apps/web/src/app/api/modules/[moduleSlug]/checkout/newebpay/route.ts` | Production currently fails closed through feature flags. |
| ReturnURL | Non-mutating status page. Shows waiting or ready; links to session-bound access only when ready. | `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx` | Correct architecture. Wording can be warmer/polished later. |
| Payment status | Session-bound POST endpoint maps checkout token to `waiting_for_payment`, `paid_processing`, `paid_ready`, `paid_failed`, `expired`, `invalid_session`. | `apps/web/src/app/api/modules/[moduleSlug]/payment/status/route.ts` | Good foundation for browser polling UI. |
| Payment access page | Session-bound access page renders completed paid result only when state is `paid_ready`; otherwise fallback. | `apps/web/src/app/m/[moduleSlug]/payment/access/page.tsx` | Correct security posture. Fallback copy can be more actionable. |
| Paid unlock page | Supports legacy unlock tokens and `pa_` paid access tokens; pending poller handles processing/failed/expired states. | `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx` | Legacy LINE/contact path still exists; keep but do not foreground for paid launch. |
| Paid result pending | Polls `paid-result/status`, shows 30-60 second processing steps and safe errors. | `apps/web/src/components/modules/ai-temperature/PaidResultPendingPoller.tsx` | Good tone. Separate from `pcs_` status flow. |
| Legal/refund/support | `/refund`, `/legal`, footer links, `hello@anyu.tw`. | `apps/web/src/content/legal.ts`, `LegalFooter.tsx` | Public policy mostly aligned, but terms/privacy still include internal-test/LINE language. Do not change in this task. |

## 2. Payment State Model

| State | User-facing meaning | Primary route/surface | Current behavior |
|---|---|---|---|
| Payment runtime disabled | Production payment not publicly available. | Result paid preview / checkout route | Checkout route fails closed; paid preview still offers internal-test contact capture. |
| Merchant review pending | Public storefront can explain product, but broad payment remains off. | Homepage, result page | Homepage says payment opens by review/status; result page says internal test. |
| Checkout disabled | User should not see an active payment button. | Paid CTA | Currently no public checkout CTA; contact capture appears instead. |
| Checkout enabled but pending | Checkout created, user is on/returning from NewebPay. | Checkout route, ReturnURL | Pending payment_intent and `pcs_` handoff created. |
| Waiting for NotifyURL | Browser returned but provider truth not yet received. | ReturnURL / payment status | ReturnURL says waiting and does not unlock. Correct. |
| Paid but generation queued | Payment paid, artifacts created, generation job queued. | Payment status / access fallback | `paid_processing` until result ready. |
| Paid and processing | Paid result generation in progress. | Status/access/pending UI | Polling state exists. |
| Paid ready | Completed paid result available. | ReturnURL/access | ReturnURL can link to access page; access page renders completed paid result. |
| Paid failed / retryable | Generation or access failed. | Status/access/unlock pending | Some retry wording exists; support guidance should be clearer. |
| Invalid/expired `pcs_` session | Checkout session invalid/expired. | Payment status/access | Returns `invalid_session`/`expired`; fallback is safe but terse. |
| Invalid/expired `pa_` token | Paid access token invalid/expired/revoked/refunded. | Unlock page / paid-result status | Safe errors exist. |
| Already purchased / idempotent access | Existing paid artifacts/result should be reused safely. | Notify/access/queue | Backend is idempotent; UX should say “完整分析已準備好” rather than implying another purchase. |
| Production fail-closed | Public production checkout/fake-paid unavailable until launch. | API routes | JSON 404/not_found confirmed in prior tasks. |

## 3. CTA Copy Recommendations

Tone principles:

- Warm and concrete.
- Premium but not pushy.
- No SaaS-like account language.
- Never imply payment success until NotifyURL truth.
- Keep refund/support link visible around paid states.

| State | Primary CTA | Secondary CTA | Microcopy | Clickable? | Price? | Refund/support? | Polling? |
|---|---|---|---|---:|---:|---:|---:|
| Runtime disabled / review pending | `完整分析即將開放` | `留下通知方式` or `查看退款與補發政策` | `完整報告已完成沙盒驗證，正式付款會在審核通過後開放。` | Primary no; secondary yes | Yes, as `NT$49 預計一次性` | Yes | No |
| Checkout disabled but launch-ready copy desired | `暫時還不能付款` | `先保存這份結果` | `目前付款入口尚未開放；你的免費結果仍可重新查看。` | No | Yes | Yes | No |
| Checkout enabled / before payment | `解鎖完整分析 NT$49` | `先看退款與補發政策` | `一次性付款，非訂閱。付款確認後在網頁查看完整分析。` | Yes | Yes | Yes | No |
| Checkout created / gateway handoff | `前往付款頁` | `回到結果頁` | `付款會在 NewebPay 安全頁面完成；ANYU 不會保存完整卡號。` | Yes | Yes | Yes | No |
| ReturnURL waiting for NotifyURL | `正在確認付款` | `稍後重新整理` | `這頁只顯示確認狀態，不會直接解鎖；我們會等待金流正式通知。` | Primary no | No | Yes | Yes |
| Paid but queued/processing | `正在整理完整分析` | `稍後再回來` | `通常 30-60 秒；完成後會在這個安全連結顯示。` | Primary no | No | Yes | Yes |
| Paid ready | `查看完整分析` | `回到測驗` | `付款已確認，完整分析已準備好。` | Yes | No | Optional | No |
| Paid failed / retryable | `重新檢查完整分析` | `聯絡客服協助` | `付款若已完成但結果未產生，可協助補發或退款。` | Yes | No | Yes | Optional |
| Invalid/expired `pcs_` session | `回到結果頁重新確認` | `聯絡客服` | `這個付款確認連結已失效；若已付款，請保留付款時間或訂單資訊。` | Yes | No | Yes | No |
| Invalid/expired `pa_` token | `回到結果頁重新領取` | `聯絡客服` | `這組完整分析連結無效或過期。若已付款，客服可協助確認。` | Yes | No | Yes | No |
| Already purchased / idempotent access | `查看已解鎖的完整分析` | `重新檢查狀態` | `我們找到這筆付款對應的完整分析，不需要重複付款。` | Yes | No | Yes | No |
| Production fail-closed | No public CTA | `開始免費初步分析` | `付款功能尚未對外開放。` | Secondary yes | Optional | Yes | No |

## 4. Launch UX Lock Recommendations

Lock before production payment launch:

| Surface | Lock decision |
|---|---|
| Product name | Keep `曖昧溫度計`. |
| Price | Keep `NT$49` and ensure checkout amount remains 49 TWD. |
| Charging model | Keep one-time / non-subscription model. |
| Delivery model | Prefer web delivery for launch copy; do not foreground LINE delivery until implemented as paid delivery. |
| Refund/support links | Keep `/refund`, `/legal`, `hello@anyu.tw`. |
| Payment pending wording | Must say waiting for payment confirmation, not payment success. |
| Paid result access wording | Must distinguish payment confirmed, processing, ready, failed, expired. |
| AI limitation disclaimer | Keep visible on free and paid surfaces. |
| Evidence Anchoring / paid result structure | Lock; sandbox E2E has validated the full path. |

Can still optimize:

| Surface | Safe optimization |
|---|---|
| CTA hierarchy | Make disabled/review-pending vs launch-ready state clear. |
| Mobile contrast | Review button visibility, paid card price block, and return/access fallback readability. |
| Preview/value framing | Clarify why paid report is valuable without overpromising relationship certainty. |
| Result shareability | Keep separate from payment CTA; do not turn sharing into a payment funnel. |
| Top-of-page emotional hook | Can be polished if it does not alter product claims or review evidence. |

## 5. Risk / Mismatch Scan

| Risk | Finding | Priority |
|---|---|---:|
| Homepage price vs checkout amount | Homepage says NT$49; checkout service uses `MODULE_01_PRICE_MINOR = 49`. Aligned. | Pass |
| Legal/refund vs payment UX | `/refund` says web delivery; result paid preview says web or LINE. Legal terms/privacy still include LINE/internal-test era language. | P1 before launch |
| Sandbox/staging copy vs production copy | Result page currently reads like internal test even on production. Safe while disabled, not launch-ready. | P1 |
| Payment disabled copy vs launch-ready copy | Homepage handles review/status; result paid CTA does not clearly show “payment unavailable” as a disabled state. | P1 |
| Paid CTA when runtime disabled | Current CTA opens contact capture, not checkout. Safe, but user may interpret price as purchasable soon/current. | P1 |
| Confusing “unlock” copy without checkout | Legacy unlock/contact path remains prominent in result flow. Needs state model. | P1 |
| ReturnURL implying success too early | Current ReturnURL correctly says waiting unless `paid_ready`. | Pass |
| Result page exposing paid promise before payment available | It previews paid value and price while saying internal test/no charge. Acceptable for monitor; needs launch state. | P1 |
| LINE delivery expectation | Multiple surfaces mention LINE delivery/notification, but paid production launch is web delivery. | P1 |
| Support/refund handling window | `/refund` still says specific timing may be updated before formal launch. Owner confirmation needed. | P2 |

## 6. Multi-Module Compatibility Note

Do not implement multi-module cards here. Preserve these Module 01 attributes so it can later coexist with a multi-module homepage:

| Attribute | Recommendation |
|---|---|
| Product identity | Keep `曖昧溫度計` as a standalone module with its own landing route. |
| Module card metadata | Later card should include title, subtitle, status, price, availability, and one-line hook. |
| Price/availability display | Module 01 should show `NT$49` and `已上線` only when production payment launch gate passes; before that, use `付款審核中` or `即將開放`. |
| Status badge | Use simple states: `已上線`, `付款審核中`, `免費體驗`, `即將推出`. |
| Link structure | Keep `/m/ambiguous-temperature` stable. Future homepage cards should link into module-specific landing pages, not payment routes. |
| Legal linkage | Module-specific cards should not hide global `/refund` and `/legal` links. |

## 7. Recommended Implementation Tasks

### P1: Before Production Payment Launch

| Task title | Likely files/routes | Risk | Wait for Claude Design? | Notes |
|---|---|---:|---:|---|
| `Module 01 Multi-State Paid CTA Implementation v0` | `PaidPreviewCard.tsx`, `AiTemperatureResult.tsx`, feature flag helpers if needed | Medium | No | Replace internal-test contact CTA with explicit disabled/review-pending/checkout-enabled states. |
| `Module 01 Paid CTA Copy Alignment v0` | `PaidPreviewCard.tsx`, `ContactCapture.tsx`, `content/legal.ts` if public copy update approved | Low-Medium | No | Remove or gate LINE/no-charge/internal-test language from launch state. |
| `Module 01 Checkout CTA Wiring Plan v0` | Result page and checkout API route integration | Medium | No | Plan exact user action from free result to checkout creation. Implement only after owner approves copy/state behavior. |
| `Payment Return/Access Fallback Copy Polish v0` | `payment/return/page.tsx`, `payment/access/page.tsx`, `PaidResultPendingPoller.tsx` | Low | No | More actionable support guidance for invalid/expired/failed states. |
| `Refund Response Window Owner Confirmation v0` | Owner decision, then `/refund` if approved | Low | No | Confirm 3-7 business days or another window before formal launch. |

### P2: Before Broader Traffic

| Task title | Likely files/routes | Risk | Wait for Claude Design? | Notes |
|---|---|---:|---:|---|
| `Module 01 Mobile CTA Contrast QA v0` | CSS + browser QA | Low | Optional | Focus on paid card, result CTA, ReturnURL/access states. |
| `Module 01 Result Value Framing Polish v0` | Result page / paid preview copy | Low-Medium | Optional | Improve paid value clarity without changing result semantics. |
| `First 10 Payments UX Monitoring Checklist v0` | Docs/tooling | Low | No | Define what to watch during low-key production launch. |

### P3: Defer Until Multi-Module Design Lands

| Task title | Likely files/routes | Risk | Wait for Claude Design? | Notes |
|---|---|---:|---:|---|
| `Homepage Module Card Implementation v0` | `app/page.tsx`, module config | Medium | Yes | Do not implement in this task; needs portal direction. |
| `Module Catalog Metadata Implementation v0` | `content/modules/*`, types | Medium | Yes | Avoid over-abstracting before Module 02 concept locks. |
| `Module 02 Runtime Implementation v0` | New module components/routes/prompts | High | Yes | Do not start before Module 01 launch UX is locked. |
| `LINE Paid Delivery Planning v0` | LINE routes / fulfillment | High | No, but defer | Current launch plan is web delivery. |

## 8. Suggested State Model Shape For Later Implementation

When implementing, prefer an explicit view model over scattered copy checks:

```ts
type PaidCtaAvailability =
  | "review_pending"
  | "payment_disabled"
  | "checkout_available"
  | "checkout_pending"
  | "paid_processing"
  | "paid_ready"
  | "paid_failed";
```

Inputs should be derived from existing feature flags and known route state:

- `ENABLE_PAYMENT_RUNTIME`
- `ENABLE_NEWEBPAY_CHECKOUT`
- module price
- result id
- optional existing payment/access state if available

Avoid making the UI infer payment launch state from provider env presence.

## 9. Documentation / Dashboard

Dashboard did not require a state change. It already shows:

- sandbox E2E passed
- production payment disabled
- merchant approval/formal credentials as blocker
- review-wait sprint direction

This task adds the detailed Module 01 launch UX lock plan as the implementation reference.

## Validation

- Documentation presence check: passed.
- Added-line secret/private scan: passed.
- `git diff --check`: passed.

## Tech Debt Review

- New technical debt introduced: none; planning-only.
- Existing technical debt observed: in-result paid CTA/contact flow is still from internal-test / LINE-or-Email era; legal content includes internal-test/LINE language that may need launch-state gating or copy update.
- Opportunistic cleanup completed: none; no runtime/UI changes were made.
- Deferred cleanup candidates: explicit paid CTA view model, launch-state legal copy update, mobile CTA contrast QA.

## Recommended Next Step

Run `Module 01 Multi-State Paid CTA Implementation v0` only after owner confirms the desired review-pending vs launch-ready copy. If Claude Design is actively exploring homepage multi-module direction, keep that separate and do not block Module 01 CTA state cleanup on portal design.
