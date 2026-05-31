# Module 01 Checkout CTA Wiring Plan v0

## Date

2026-05-31

## Completed Work

- Inspected Module 01 result-page paid CTA state handling.
- Inspected `PaidPreviewCard`, `AiTemperatureResult`, result page routing, NewebPay checkout route, checkout service, ReturnURL, status route, access page, tests, and sandbox helper.
- Documented the current checkout route contract and the data gap between result-page CTA rendering and checkout creation.
- Compared implementation options and recommended a v0 wiring approach.
- Defined gate model, test plan, staging QA plan, and production launch dependencies.

## 1. Current Result-Page CTA State

### Current disabled / review-pending behavior

- File: `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`
- Demo result always renders `paidCtaAvailability="review_pending"`.
- Runtime result renders:
  - `checkout_available` only when `isPaymentRuntimeEnabled()` and `isNewebPayCheckoutEnabled()` both return true.
  - `review_pending` otherwise.
- Current production behavior remains fail-closed because production payment runtime is disabled.

### Current checkout-available behavior

- File: `apps/web/src/lib/modules/paid-cta-view-model.ts`
- `checkout_available` copy is already launch-facing:
  - Primary: `解鎖完整報告｜NT$49`
  - Microcopy: one-time payment, non-subscription, web delivery after payment confirmation.
- File: `apps/web/src/components/anyu/PaidPreviewCard.tsx`
- The primary button is only enabled when:
  - `viewModel.primaryEnabled` is true, and
  - `onRevealContact` is provided.
- Current result page does not pass an action into `PaidPreviewCard`, so the checkout-available button copy can render but the button remains disabled.

### Where CTA is rendered

- Result page loads `AiTemperatureResult`.
- `AiTemperatureResult` renders `PaidPreviewCard` inside the paid preview section.
- `PaidPreviewCard` owns the button UX and currently calls `onRevealContact`, a legacy-compatible callback name that is not checkout-specific.

### Data available on result page

- `moduleConfig`
- `record.id` as `resultId`
- normalized free result payload
- payment CTA availability state

This is enough to start checkout because the checkout route requires `moduleSlug` and `resultId`; it does not need raw user input or provider credentials from the client.

### Data checkout route requires

- Route path module slug.
- JSON body with `resultId`.
- Optional `idempotencyKey`.
- Operator header only when payment runtime is disabled.

## 2. Checkout Route Contract

### Route

- Path: `POST /api/modules/[moduleSlug]/checkout/newebpay`
- Source: `apps/web/src/app/api/modules/[moduleSlug]/checkout/newebpay/route.ts`

### Required gates

- `ENABLE_NEWEBPAY_CHECKOUT=true`; otherwise route returns `404 not_found`.
- If `ENABLE_PAYMENT_RUNTIME=false`, route requires `x-operator-test-secret`.
- If `ENABLE_PAYMENT_RUNTIME=true`, operator secret is not required.
- `DATABASE_URL` must be configured.

### Request body

```json
{
  "resultId": "analysis result id",
  "idempotencyKey": "optional client/server generated key"
}
```

### Service behavior

- Verifies the source result exists for the module.
- Loads NewebPay config.
- Creates a signed `pcs_` checkout session token for ReturnURL/access handoff.
- Creates or reuses `payment_intent` by deterministic `merchantOrderNo`.
- Marks the intent `checkout_started`.
- Builds NewebPay MPG form contract.
- Does not mark payment paid.
- Does not create entitlement.
- Does not create generation job.
- Does not enqueue queue.

### Response

Success response includes:

- `ok: true`
- `mode: "newebpay_checkout_phase_1"`
- `moduleSlug`
- `resultId`
- `paymentIntentId`
- `paymentIntentStatus`
- `paymentIntentCreated`
- `merchantOrderNo`
- `checkout`
- `pendingReturnPath`

`checkout` includes provider form fields:

- `MerchantID`
- `TradeInfo`
- `TradeSha`
- `Version`

These are not provider secrets, but they are a live payment form payload and should not be logged, committed, or exposed in reports.

### Safe errors

- `module_not_found`
- `not_found`
- `unauthorized`
- `config_error`
- `invalid_json`
- `invalid_input`
- `source_result_not_found`
- `payment_checkout_session_config_missing`
- `missing_newebpay_config`
- `invalid_newebpay_config`

## 3. Desired User Flow

### Desired staging flow

1. User completes free Module 01 result on `staging.anyu.tw`.
2. Result page shows checkout-enabled CTA when staging flags and chosen staging gate allow it.
3. Clicking CTA starts checkout server-side for the current `resultId`.
4. User is shown or auto-submitted through a NewebPay sandbox MPG form.
5. User pays with sandbox credit-card one-time payment only.
6. NewebPay returns browser to staging ReturnURL with `pcs_` session handoff.
7. NotifyURL verifies payment as truth and marks `payment_intent` paid.
8. Delivery artifacts are created/reused.
9. Vercel Queue generates the paid report.
10. Payment status/access page reaches `paid_ready` and renders completed paid result.

### Desired production-disabled flow

1. Result page renders `review_pending`.
2. CTA says `完整報告即將開放`.
3. No checkout request is sent.
4. No provider form is exposed.
5. Copy remains launch-aligned and review-safe.

## 4. Gate Model

| Gate | Current role | Recommended v0 behavior |
| --- | --- | --- |
| `ENABLE_PAYMENT_RUNTIME` | Broad payment runtime switch | Keep false in production until launch gate. |
| `ENABLE_NEWEBPAY_CHECKOUT` | Checkout route availability | Can be true in staging; false or irrelevant in production while runtime off. |
| `OPERATOR_TEST_SECRET` | Allows checkout route while runtime is off | Keep for helper/operator routes; do not expose to browser. |
| Branch-scoped Preview(staging) env | Authoritative staging env | Continue using sandbox credentials and queue flags only in staging. |
| Production env | Real launch env later | Do not set sandbox credentials or enable runtime in production. |

### Can staging use checkout while production remains disabled?

Yes. Staging can use sandbox checkout because it is a separate Preview(staging) environment and has already passed sandbox E2E. Production remains disabled by production flags and routes.

### Should public staging checkout be allowed or operator-only?

Recommended for v0:

- Keep the current API route operator-gated when `ENABLE_PAYMENT_RUNTIME=false`.
- Add a dedicated checkout-start page or server action that is only enabled when the same gates permit checkout.
- For staging operator smoke before launch, use either:
  - existing `qa:newebpay:sandbox`, or
  - a server-only staging checkout-start path protected by operator auth or explicit staging-only flag.

Avoid putting `OPERATOR_TEST_SECRET` in client code or browser requests.

### What should production render before approval?

- `review_pending`
- Disabled CTA
- No checkout POST
- No NewebPay form

## 5. Implementation Options

### A. Server action / form POST from result page

Pros:

- Keeps initial interaction simple.
- Can call checkout service server-side.
- Avoids client-side secret headers.

Cons:

- Needs careful handling to render provider POST form after server action.
- Server action ergonomics can be awkward for provider form auto-submit.
- Tests must cover action boundary.

Risk: low/medium.

### B. Client-side fetch then redirect/form submit

Pros:

- Simple to add to current client component.
- Matches current route tests and helper route contract.

Cons:

- Response contains live provider form fields in client JSON.
- Cannot use operator secret safely from browser while runtime is off.
- More likely to leak form payloads through devtools/logging/screenshots.

Risk: medium. Not recommended for v0.

### C. Dedicated checkout-start page that creates checkout and renders provider form

Pros:

- Server-side creation keeps checkout initiation and provider form rendering in one controlled boundary.
- Browser receives only the HTML form it must submit to NewebPay.
- No operator secret needs to be embedded in client JavaScript.
- Easier to show safe error pages.
- Compatible with NewebPay MPG POST form flow.
- Easy to test as a page rendering contract.

Cons:

- Requires one additional route/page.
- Needs care to prevent accidental production exposure.
- Provider form fields still reach browser as intended; must not be logged or included in reports.

Risk: low. Recommended.

### D. Continue operator/helper-only until production approval

Pros:

- Lowest immediate runtime risk.
- Existing sandbox helper already works.

Cons:

- Leaves launch UX unproven from result page.
- Pushes critical product wiring into the final launch window.

Risk: low now, higher later. Not recommended if review wait time can be used safely.

## 6. Recommended Approach

Implement v0 as a dedicated checkout-start page/route:

- Example path: `/m/[moduleSlug]/result/[resultId]/checkout`
- Result-page CTA links or posts to this checkout-start route only when `paidCtaAvailability="checkout_available"`.
- Checkout-start route runs on the server.
- It calls existing `createNewebPayCheckout`.
- It renders a minimal provider form page with an auto-submit option and manual fallback button.
- It renders safe errors for unavailable/missing/invalid result states.

Recommended safety rules:

- Production stays `review_pending` until `ENABLE_PAYMENT_RUNTIME=true` and `ENABLE_NEWEBPAY_CHECKOUT=true`.
- Staging can test the page with sandbox credentials.
- Do not place `OPERATOR_TEST_SECRET` in browser.
- Do not log or report `TradeInfo`, `TradeSha`, `pcs_`, tokenized URLs, or provider payloads.
- Do not create entitlement/generation job before NotifyURL.

Open design choice for implementation:

- If staging needs UI checkout before production runtime is enabled, introduce a server-only staging/operator gate that does not require client-side secret exposure. The cleanest version is a staging-only operator session or temporary route guard, but that should be approved in the implementation task because it touches access policy.

## 7. Test Plan

Implementation tests should cover:

- Production-disabled result page renders `review_pending` and does not link/post to checkout.
- Review-pending CTA remains disabled.
- Checkout-available result page renders a real checkout action.
- Checkout-start route validates `moduleSlug` and `resultId`.
- Invalid/missing/expired result renders safe error and does not create payment intent.
- Checkout-start creates `checkout_started` payment intent.
- Provider form renders required NewebPay fields but tests do not snapshot real secrets or payloads.
- No entitlement, paid access token, generation job, or queue trigger exists before NotifyURL.
- ReturnURL remains non-mutating.
- Payment status/access page behavior remains unchanged.
- Existing `qa:newebpay:sandbox` helper still works.
- Homepage, legal, refund, and result copy remain launch-aligned.

Recommended tests/files:

- `newebpay-checkout-route.test.ts`
- new checkout-start page/route test
- `ai-temperature-result.test.tsx`
- `paid-cta-view-model.test.ts`
- `newebpay-checkout-service.test.ts`
- `payment-status-route.test.ts`
- `newebpay-return-page.test.tsx`
- `payment-access-page.test.tsx`

## 8. Staging QA Plan

1. Keep production untouched.
2. Confirm Preview(staging) sandbox env:
   - `ENABLE_NEWEBPAY_CHECKOUT=true`
   - sandbox NewebPay config present
   - queue trigger enabled
   - payment checkout/access secrets present
3. Enable only the approved staging checkout UI gate.
4. Create a fresh Module 01 free result in staging UI.
5. Click the result-page checkout CTA.
6. Confirm checkout-start creates pending payment intent and renders/submits sandbox ccore provider form.
7. Pay with sandbox credit-card one-time payment only.
8. Verify ReturnURL pending/non-mutating behavior.
9. Verify NotifyURL paid transition.
10. Verify entitlement, paid access token hash, generation job, Vercel Queue, `paid_ready`, and access render.
11. Confirm production checkout/fake-paid routes still return `not_found`.

No production DB migration is required for staging UI checkout QA because the staging uniqueness index is already applied.

## 9. Production Launch Dependency

Before enabling production result-page checkout:

- NewebPay merchant review approved.
- Formal production MerchantID / HashKey / HashIV available.
- Production NewebPay gateway, NotifyURL, and ReturnURL confirmed.
- Production payment config dry-run completed with runtime disabled.
- Production entitlement unique index gate completed.
- Controlled production payment smoke approved and executed.
- Refund/support SOP confirmed.
- Stop-loss rules confirmed.
- Launch decision recorded.

## Architecture Decisions

- Planning recommendation only: use a dedicated checkout-start page/route for v0 rather than client-side JSON fetch.
- Keep production disabled and fail-closed until the launch gate explicitly approves runtime flags.
- Avoid exposing operator secrets to browser code.

## Blockers

- None for planning.

## Uncertainties

- Exact staging UI gate for pre-launch browser checkout needs owner approval during implementation.
- Whether the checkout-start page should auto-submit immediately or require one explicit button click should be decided in implementation/design review.

## Suggested Next Steps

1. `Module 01 Checkout CTA Wiring Implementation v0`
2. `Result-Page Checkout Staging Sandbox QA v0`
3. `Production Payment Config Dry-Run v0` only after NewebPay approval/formal credentials.

## Known Technical Debt

- Current `PaidPreviewCard` prop name `onRevealContact` is legacy-shaped and should be renamed or wrapped during checkout implementation.
- Result-page checkout UI is not yet wired, despite checkout service/route and sandbox helper being proven.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Checkout action callback naming still reflects the older contact/unlock era.
- Staging operator checkout from UI needs a safe non-client-secret gate if tested before broad runtime is enabled.

### Opportunistic Cleanup Completed

- None; planning-only task.

### Deferred Cleanup Candidates

- Rename `onRevealContact` to a checkout/action-neutral prop during implementation.
- Add a checkout-start route/page and tests.

### Recommended Follow-up

- `Module 01 Checkout CTA Wiring Implementation v0`

## Git Commit

- Commit hash: `pending`
- Commit message: `docs: plan module checkout cta wiring`

## Staging Push

- Push status: `pending`
- Push command: `git push origin HEAD:staging`
