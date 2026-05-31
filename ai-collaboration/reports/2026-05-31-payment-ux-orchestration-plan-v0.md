# Payment UX Orchestration Plan v0

## Date

2026-05-31

## Completed Work

- Inspected current result page, paid CTA, checkout-start page, NewebPay checkout route, ReturnURL, payment status route, payment access page, paid unlock route, LIFF/LINE fulfillment routes, operator fake-paid route, and sandbox helper.
- Documented the current payment UX journey and current architecture boundaries.
- Recommended LINE/LIFF CTA timing rules that do not promise LINE paid delivery.
- Recommended ReturnURL/polling UX improvements.
- Recommended provider handoff visual bridge improvements.
- Recommended a staging-only QA bypass strategy for checkout UX testing without repeated sandbox card entry.
- Recommended delaying multi-module return abstraction until Module 02 requires it, while preserving a clear direction.

## 1. Current Payment UX Inventory

### Current user journey

```text
result page
→ checkout-start page
→ NewebPay provider page
→ module ReturnURL
→ payment status/access
→ completed paid result
```

### Result page

- Route: `/m/[moduleSlug]/result/[resultId]`
- File: `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`
- Behavior:
  - Loads the free result.
  - Computes paid CTA availability from payment/checkout gates.
  - Passes checkout-start href only when checkout is available.

### Paid CTA

- File: `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- Behavior:
  - Renders launch-aligned paid CTA copy.
  - Disabled in review-pending/payment-unavailable states.
  - Links to checkout-start when `primaryHref` is supplied.
  - Does not use ContactCapture as main paid CTA.

### Checkout-start page

- Route: `/m/[moduleSlug]/result/[resultId]/checkout`
- File: `apps/web/src/app/m/[moduleSlug]/result/[resultId]/checkout/page.tsx`
- Behavior:
  - Server-rendered.
  - Validates gates.
  - Calls `createNewebPayCheckout`.
  - Renders product/payment context and explicit NewebPay submit button.
  - Does not expose `OPERATOR_TEST_SECRET`, HashKey, or HashIV.
  - Renders provider form fields needed by NewebPay.

### NewebPay checkout API

- Route: `POST /api/modules/[moduleSlug]/checkout/newebpay`
- File: `apps/web/src/app/api/modules/[moduleSlug]/checkout/newebpay/route.ts`
- Current role:
  - Used by helper/operator flows.
  - Returns JSON checkout contract including provider form fields.
  - Requires operator secret while payment runtime is off.

### ReturnURL

- Route: `/m/[moduleSlug]/payment/return`
- File: `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`
- Behavior:
  - Resolves `pcs_` checkout session.
  - Non-mutating.
  - Shows pending or ready continuation.
  - Does not currently run a client-side polling loop.

### Payment status route

- Route: `POST /api/modules/[moduleSlug]/payment/status`
- File: `apps/web/src/app/api/modules/[moduleSlug]/payment/status/route.ts`
- Behavior:
  - Accepts checkout session token.
  - Resolves payment access handoff.
  - Returns safe state, retryability, error category, and access path if available.

### Payment access page

- Route: `/m/[moduleSlug]/payment/access`
- File: `apps/web/src/app/m/[moduleSlug]/payment/access/page.tsx`
- Behavior:
  - Resolves `pcs_` handoff.
  - Renders completed paid result only when state is `paid_ready`.
  - Otherwise shows safe fallback.

### `pa_` unlock route

- Route: `/m/[moduleSlug]/unlock/[unlockToken]`
- File: `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx`
- Behavior:
  - Supports paid access token path and legacy unlock-intent path.
  - Already has a polished paid-result pending poller for paid-result generation states.

### LIFF / LINE routes

- Routes:
  - `/line/fulfill`
  - `/m/[moduleSlug]/line/fulfill`
  - `POST /api/line/fulfillment/bind-liff`
  - `POST /api/line/webhook`
- Current role:
  - Legacy unlock/fulfillment binding and LINE short-code support.
  - Not implemented as paid report delivery.
  - Should not be described as paid delivery until a dedicated paid notification/delivery design exists.

### Fake-paid / operator QA path

- Route: `POST /api/operator/fake-paid-success`
- Script: `apps/web/scripts/authorized-fake-paid-qa.mjs`
- Behavior:
  - Operator-gated.
  - Creates paid delivery artifacts and queues paid generation without real payment.
  - Useful for downstream delivery QA, but it currently bypasses the new result-page checkout-start UX.

### Sandbox helper

- Script: `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs`
- Behavior:
  - Creates fresh source result.
  - Creates checkout through API route.
  - Writes a local NewebPay form outside the repo.
  - Polls status/access after manual browser payment.
  - Does not test result-page CTA click path.

## 2. LINE / LIFF CTA Timing

### Principle

Web access is canonical paid delivery. LINE should not be promised as paid report delivery until implemented. LINE can later be positioned as:

- notification when report is ready
- save-for-later reminder
- support/contact channel
- optional account/device continuity helper

### Free result page

Recommendation:

- Avoid placing LINE as a primary CTA before payment.
- If shown, it should be secondary and framed as “save or get updates later,” not paid delivery.
- Do not let LINE compete with the paid unlock CTA.

### Paid CTA area

Recommendation:

- Do not show LINE as a delivery promise.
- If needed later, place below the primary checkout CTA as optional:
  - `完成付款後，也可以選擇用 LINE 收到完成提醒。`
- Only add this after a real paid notification path exists.

### Checkout-start page

Recommendation:

- Do not introduce LINE here in v0.
- Keep focus on payment confidence and provider handoff.
- LINE here would distract from the secure provider jump.

### ReturnURL waiting/processing page

Recommendation:

- This is the best future place for optional LINE notification.
- Copy should say notification, not delivery:
  - `想先離開？之後可用 LINE 收到完成提醒。完整報告仍會在網頁提供查看。`
- Only show if LIFF/LINE context and paid-notification implementation exist.

### Paid ready page

Recommendation:

- Primary CTA should be `查看完整分析`.
- Optional LINE CTA can be “保存 / 稍後提醒 / 聯絡客服,” not “領取報告.”

### Completed paid result page

Recommendation:

- LINE can support sharing/save-for-later if scoped carefully.
- Do not send the paid report content through LINE without a privacy/retention decision.

### LIFF context vs normal browser context

Recommendation:

- In LIFF, consider lighter secondary prompts because the user is already inside LINE.
- In normal browser, do not force LINE login or make it a required step.

## 3. ReturnURL / Polling UX

### Current behavior

ReturnURL is non-mutating and server-rendered. It resolves the checkout handoff once and shows:

- `付款確認中`
- current state if available
- ready link if state is `paid_ready`
- support fallback copy

It does not currently poll or auto-refresh.

### Recommended behavior

Add a client-side ReturnURL poller that uses:

- `POST /api/modules/[moduleSlug]/payment/status`
- checkout session token
- safe state rendering

Recommended states:

- `waiting_for_payment`: “正在等候藍新正式通知”
- `paid_processing`: “付款已確認，完整報告正在生成”
- `paid_ready`: show button `查看完整分析`; optionally auto-refresh or auto-redirect after a short delay
- `paid_failed`: support/refund fallback
- `invalid_session`: safe support fallback

### Auto-redirect vs button

Recommendation:

- v0 should show a clear button when ready.
- Optional: auto-redirect after 2–3 seconds, but only after displaying what is happening.
- Reason: payment flows are trust-sensitive; immediate jumps can feel disorienting after leaving a provider page.

### Polling interval and timeout

Recommendation:

- Poll every 3 seconds for the first 2 minutes.
- Then soften to “still preparing” and let user leave/reopen the page.
- Reuse language and motion style from `PaidResultPendingPoller`.

### Keep ReturnURL non-mutating

ReturnURL must only read state. NotifyURL remains the payment truth.

### Make waiting page feel ANYU-like

Recommended copy direction:

- `我們正在等候藍新的正式付款通知。`
- `付款完成後，暗語會開始整理你的完整報告。`
- `如果 AI 需要一點時間，這頁會自動更新。`

## 4. Provider Jump Visual Bridge

### Current gap

Checkout-start is already ANYU-styled, but the transition to NewebPay can still feel abrupt because the provider page has a very different visual system.

### Checkout-start improvements

Recommended microcopy:

- `你將前往藍新金流完成安全付款`
- `付款完成後，我們會等候藍新的正式通知，再為你準備完整報告`
- `暗語不會保存你的完整卡號或支付驗證碼`

Recommended visual elements:

- small stepper: `確認內容 → 藍新付款 → 等候通知 → 查看完整報告`
- payment summary card: product, price, one-time, non-subscription
- clear third-party transition note

### Provider handoff button

Keep:

- `前往藍新安全付款頁`

Avoid:

- “立即解鎖完成” before NotifyURL
- “付款成功” before provider truth

### Return page

Use matching visual rhythm:

- ANYU mark/loading
- warm progress language
- clear state labels
- support fallback

## 5. QA / Development Bypass

### Options evaluated

| Option | Summary | Risk | Recommendation |
| --- | --- | --- | --- |
| A. Operator-only fake paid button on checkout-start page | Add QA-only button visible in Preview(staging) to simulate paid success | Medium: visible UI branch near payment surface | Not first choice |
| B. QA script drives result-page → checkout-start → fake paid success | Script verifies UI path, then calls operator fake-paid route server-side | Low | Recommended |
| C. Checkout-start test mode query param with operator secret server-side only | Query param triggers fake paid path | Medium/high: easy to misuse and harder to reason about | Avoid for v0 |
| D. Continue helper-only | No new code | Low now, but does not cover result-page CTA UX | Insufficient |

### Recommended bypass

Add a QA script mode later:

```text
qa:newebpay:sandbox -- result-checkout-bypass
```

Flow:

1. Create fresh Module 01 result.
2. Fetch result page and assert checkout CTA link exists.
3. Fetch checkout-start page and assert provider form is present.
4. Do not submit to NewebPay.
5. Call operator fake-paid route server-side with `OPERATOR_TEST_SECRET`.
6. Poll paid status/access.
7. Verify paid result render.
8. Confirm production fail-closed.

Requirements:

- Preview(staging) only.
- Uses local/server-side operator secret; never embeds it in HTML.
- Does not create real provider payment.
- Uses same downstream delivery artifacts as fake-paid.
- Report output stays boolean/category-only.

This provides fast regression coverage for the result-page checkout UX without repeated sandbox card entry.

## 6. Multi-Module Callback / Return Abstraction

### Current architecture

- NotifyURL is already provider-level/unified:
  - `/api/payments/newebpay/notify`
- ReturnURL is currently module-specific:
  - `/m/[moduleSlug]/payment/return`
- Access handoff is session-bound through `pcs_`.
- `pcs_` carries enough state to resolve module/payment access server-side.

### Options

| Option | Summary | Recommendation |
| --- | --- | --- |
| A. Keep module-specific ReturnURL | Simple, branded per module | Good for Module 01 and early Module 02 |
| B. Unified ReturnURL `/payment/return?session=...` | Centralized payment return | Premature before Module 02 |
| C. Hybrid dispatcher | Unified endpoint redirects to module-specific return page | Good future path |
| D. Delay abstraction | Keep current path until a second module exercises it | Recommended now |

### Recommendation before Module 02

Do not refactor yet. Keep:

- unified provider NotifyURL
- module-specific ReturnURL
- session-bound access handoff

When Module 02 reaches payment design, introduce a small payment route descriptor in module metadata:

- module slug
- return path builder
- access path builder
- display name
- price

Avoid a large payment framework until two modules prove the shared shape.

## 7. Risk and Sequencing

| Task | Priority | Why |
| --- | --- | --- |
| Result-Page Checkout Staging Sandbox QA v0 | P1 before launch | Verifies the new real CTA path end-to-end. |
| ReturnURL Polling UX Polish v0 | P1 before launch | Reduces user anxiety after payment and handles queue latency. |
| Checkout-Start Visual Bridge Polish v0 | P1 before launch | Smooths ANYU-to-NewebPay transition and improves trust. |
| Staging Checkout QA Bypass Script v0 | P2 before Module 02 | Speeds future QA without repeated sandbox card entry. |
| LINE/LIFF Notification Plan v0 | P2 before Module 02 | Clarifies future notification/support role without promising delivery. |
| Multi-Module Payment Route Descriptor Plan v0 | P2 before Module 02 implementation | Keeps Module 02 from copying Module 01 route logic blindly. |
| Unified ReturnURL Implementation | P3 later | Premature until Module 02 payment flow exists. |

## Architecture Decisions

- Web access remains canonical paid delivery.
- LINE/LIFF should be notification/save-for-later/support only until a paid notification path is implemented.
- ReturnURL should remain non-mutating and poll status, while NotifyURL remains payment truth.
- Result-page checkout QA bypass should be script-driven, not a visible fake-paid button on the checkout-start page.
- Multi-module return abstraction should be delayed until Module 02 payment design exists.

## Blockers

- None for planning.

## Uncertainties

- Whether owner wants LINE as a notification feature before or after production payment launch.
- Whether ReturnURL should auto-redirect on ready or only show a button.
- Whether Module 02 will use the same paid model or a different artifact/monetization shape.

## Suggested Next Steps

1. Resume or rerun `Result-Page Checkout Staging Sandbox QA v0`.
2. Implement `ReturnURL Polling UX Polish v0`.
3. Implement `Checkout-Start Visual Bridge Polish v0`.
4. Add `Staging Checkout QA Bypass Script v0`.

## Known Technical Debt

- ReturnURL is currently server-only and does not poll.
- Sandbox helper does not yet exercise result-page CTA wiring.
- LIFF/LINE paths are legacy fulfillment-oriented and not payment-notification-ready.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- ReturnURL waiting UX is less polished than the paid unlock pending poller.
- A fast QA bypass for result-page checkout path is missing.
- Payment return structure is not yet explicitly module-metadata-driven.

### Opportunistic Cleanup Completed

- None; planning-only task.

### Deferred Cleanup Candidates

- Extract reusable payment waiting/poller UI.
- Add module payment route descriptors when Module 02 payment design is approved.
- Add script-level result checkout bypass mode.

### Recommended Follow-up

- `ReturnURL Polling UX Polish v0`

## Git Commit

- Commit hash: `pending`
- Commit message: `docs: plan payment ux orchestration`

## Staging Push

- Push status: `pending`
- Push command: `git push origin HEAD:staging`
