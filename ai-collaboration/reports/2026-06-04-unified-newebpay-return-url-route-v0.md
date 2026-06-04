# Unified NewebPay ReturnURL Route v0

## Completed Work

- Added provider-level NewebPay ReturnURL route:
  - `/payment/newebpay/return`
- Kept existing module ReturnURL route compatible:
  - `/m/[moduleSlug]/payment/return`
- Factored shared non-mutating ReturnURL UX into `NewebPayReturnExperience`.
- Updated NewebPay checkout creation to generate provider-level ReturnURL values.
- Preserved NotifyURL payment-truth behavior unchanged:
  - `/api/payments/newebpay/notify`
- Added tests for unified ReturnURL rendering, missing-context safe state, legacy module route behavior, and checkout ReturnURL generation.
- Did not enable production checkout/runtime, run payment, send Email, or send LINE.

## Architecture Decisions

- ReturnURL remains UX/polling only. It does not mark payments paid, create entitlements, trigger generation, or mutate payment state.
- Unified route resolves module context from the signed `pcs_` checkout session token.
- Legacy module route remains strict: it passes its route module slug as a hint, and the existing handoff resolver rejects token/module mismatch.
- `merchantOrderNo` remains present in ReturnURL query for provider/operator context, but the trusted module context comes from the signed checkout session.
- `/r/` access-link route and access-link token behavior are unchanged.

## Route Behavior

| Route | Status |
| --- | --- |
| `/payment/newebpay/return` | New preferred provider-level ReturnURL |
| `/m/[moduleSlug]/payment/return` | Preserved compatibility route |
| `/api/payments/newebpay/notify` | Unchanged payment truth endpoint |

## Checkout Payload Result

New checkout contracts now use:

```text
{NEXT_PUBLIC_APP_URL}/payment/newebpay/return?merchantOrderNo=...&checkoutToken=...
```

The task required spelling is `newebpay`; no `newbpay` spelling was introduced.

## Safety

- ReturnURL does not trust arbitrary user-provided module slug on the unified route.
- Missing or invalid checkout session renders support/refund-safe invalid-session UX.
- Tests assert rendered output does not expose `TradeInfo`, `TradeSha`, `pa_`, or `pal_`.
- Existing `pcs_` behavior is preserved for polling and session-bound access.
- Production runtime remains disabled/fail-closed.

## Validation

- `cd apps/web && corepack pnpm lint`: passed.
- Targeted ReturnURL/payment tests:
  - `src/tests/newebpay-return-page.test.tsx`
  - `src/tests/payment-return-poller.test.tsx`
  - `src/tests/newebpay-checkout-service.test.ts`
  - `src/tests/newebpay-checkout-route.test.ts`
  - `src/tests/newebpay-checkout-start-page.test.tsx`
  - `src/tests/payment-status-route.test.ts`
  - passed, 30 tests.
- `cd apps/web && corepack pnpm test`: passed, 79 files / 553 tests.
- `cd apps/web && corepack pnpm build`: passed; route manifest includes `/payment/newebpay/return`.
- `cd apps/web && corepack pnpm run qa:access-link:smoke`: passed against currently deployed Preview(staging) baseline commit `61d5cfe`; production fail-closed passed.
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed against currently deployed Preview(staging) baseline commit `61d5cfe`; production fail-closed passed.

## Staging Note

The staging QA commands ran before this commit was pushed, so they validated the current deployed staging baseline rather than the new route deployment. The new route is covered by local tests/build in this task and should be smoke-checked after the staging deployment for this commit is live.

## Production Dashboard Recommendation

Owner-side NewebPay dashboard should use:

- ReturnURL: `https://anyu.tw/payment/newebpay/return`
- NotifyURL: `https://anyu.tw/api/payments/newebpay/notify`

Credit-card one-time payment remains the first controlled production smoke method. Apple Pay / Google Pay / Samsung Pay remain non-blocking and separate.

## Blockers

- None for code implementation.
- Owner-side provider dashboard confirmation is still required before controlled production smoke.

## Uncertainties

- None at implementation level.
- Staging deployment freshness should be verified after push if the owner wants live confirmation that checkout payloads now point to `/payment/newebpay/return`.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: the polling status API remains module-scoped (`/api/modules/[moduleSlug]/payment/status`), which is acceptable because the unified ReturnURL resolves module context before polling.
- Opportunistic cleanup completed: removed duplicated ReturnURL page shell logic from the module route by factoring a shared server component.
- Deferred cleanup candidates: a provider-level payment status endpoint could be added later if Module 02 needs a fully provider-neutral polling API.

## Suggested Next Steps

1. Push/deploy staging and verify Preview(staging) serves this commit.
2. Confirm NewebPay production dashboard ReturnURL is updated to `https://anyu.tw/payment/newebpay/return`.
3. Proceed to Controlled Production Payment Smoke v0 only after dashboard confirmation and explicit runtime-enable approval.
