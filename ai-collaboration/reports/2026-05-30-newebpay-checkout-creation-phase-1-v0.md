# NewebPay Checkout Creation Phase 1 Execution Report

## Summary
Implemented NewebPay Checkout Creation Phase 1 as a gated, pending-only foundation.

Phase 1 now supports:

- creating/reusing a pending `newebpay` payment intent for Module 01,
- marking checkout as started,
- building a server-side NewebPay MPG checkout form contract,
- exposing an operator/staging-gated checkout creation API,
- rendering a ReturnURL pending UX that never marks payment as paid,
- tests for gates, config errors, idempotency, pending-only behavior, and ReturnURL safety.

Phase 1 explicitly does not implement NotifyURL verification, paid transition, entitlement creation, `pa_` token creation, generation job creation, queue trigger integration, LINE delivery, production payment runtime, prompt/result changes, or legal/provider-review copy changes.

## Files Created
- `apps/web/src/lib/payments/newebpay/config.ts`
- `apps/web/src/lib/payments/newebpay/checkout-payload.ts`
- `apps/web/src/lib/payments/newebpay/checkout-service.ts`
- `apps/web/src/app/api/modules/[moduleSlug]/checkout/newebpay/route.ts`
- `apps/web/src/app/m/[moduleSlug]/payment/return/page.tsx`
- `apps/web/src/tests/newebpay-checkout-service.test.ts`
- `apps/web/src/tests/newebpay-checkout-route.test.ts`
- `apps/web/src/tests/newebpay-return-page.test.tsx`
- `ai-collaboration/handoffs/2026-05-30-newebpay-checkout-creation-phase-1-v0-handoff.md`
- `ai-collaboration/reports/2026-05-30-newebpay-checkout-creation-phase-1-v0.md`

## Files Updated
- `apps/web/src/lib/runtime/feature-flags.ts`
- `ai-collaboration/summaries/summary_log.md`

## Gates Added / Used
Checkout creation is unavailable by default.

Gates:

- `ENABLE_NEWEBPAY_CHECKOUT=true` is required for the checkout route to exist as an enabled feature.
- `ENABLE_PAYMENT_RUNTIME=true` allows runtime access in the future, but remains off by default and was not enabled by this task.
- If `ENABLE_PAYMENT_RUNTIME` is false, checkout creation requires the existing operator secret header: `x-operator-test-secret`.

This means staging/operator testing can exercise checkout creation without enabling public payment runtime.

## Required Env Vars
Provider config is read from env only. No values are committed or printed.

Required for checkout contract creation:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEXT_PUBLIC_APP_URL`

Optional:

- `NEWEBPAY_ENVIRONMENT` = `production` / `staging` / `sandbox`; otherwise stored as `unknown`.

Safe config failures:

- missing provider env returns `missing_newebpay_config`, with env names only,
- invalid HashKey/HashIV length returns `invalid_newebpay_config`.

## Payment Intent Pending Behavior
The checkout service creates or reuses a `payment_intents` record:

- `provider`: `newebpay`
- `status`: starts as `created`, then moves to `checkout_started`
- `amountMinor`: `49`
- `currency`: `TWD`
- idempotency: merchant order is derived from module/result or caller idempotency key
- merchant order format is deterministic and provider-safe: `ANYUNP` + 24 hex chars, 30 chars total

The service does not:

- mark payment as `paid`,
- create entitlement,
- create `pa_` token,
- create generation job,
- trigger processor or queue.

## Checkout Route / API Contract
Route:

```text
POST /api/modules/[moduleSlug]/checkout/newebpay
```

Body:

```json
{
  "resultId": "<analysis result id>",
  "idempotencyKey": "optional"
}
```

Operator-gated staging response shape:

```json
{
  "ok": true,
  "mode": "newebpay_checkout_phase_1",
  "moduleSlug": "ambiguous-temperature",
  "resultId": "<result id>",
  "paymentIntentId": "<payment intent id>",
  "paymentIntentStatus": "checkout_started",
  "paymentIntentCreated": true,
  "merchantOrderNo": "<merchant order no>",
  "checkout": {
    "actionUrl": "<provider checkout url>",
    "method": "POST",
    "merchantOrderNo": "<merchant order no>",
    "returnUrl": "<ReturnURL>",
    "fields": {
      "MerchantID": "<merchant id>",
      "TradeInfo": "<encrypted payload>",
      "TradeSha": "<sha256 signature>",
      "Version": "2.0"
    }
  },
  "pendingReturnPath": "/m/ambiguous-temperature/payment/return?merchantOrderNo=<merchant order no>"
}
```

Provider secrets are used only server-side to build `TradeInfo` and `TradeSha`. HashKey and HashIV are not exposed.

## ReturnURL Pending UX
Route:

```text
GET /m/[moduleSlug]/payment/return?merchantOrderNo=<merchant order no>
```

Behavior:

- Shows pending / waiting-for-confirmation copy.
- If a matching payment intent exists, displays safe status only.
- If missing/unknown, shows safe fallback/support copy.
- Never marks payment as paid.
- Never creates entitlement.
- Never creates `pa_` token.
- Never creates generation job.

## Tests Added
- Checkout route disabled when checkout flag is off.
- Checkout route requires operator secret while public payment runtime is off.
- Checkout route creates safe pending checkout contract.
- Missing provider config returns safe categorized error.
- Checkout service creates `checkout_started` payment intent.
- Checkout service reuses existing intent idempotently.
- Checkout service does not create paid delivery artifacts.
- ReturnURL pending page handles known and unknown payment intents safely.
- Existing fake-paid service/route tests still pass.

## Validation Results
- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 46 files / 303 tests.
- `cd apps/web && corepack pnpm build`: passed.
- Targeted checkout/payment tests: passed, 5 files / 19 tests.

Build route output includes:

- `/api/modules/[moduleSlug]/checkout/newebpay`
- `/m/[moduleSlug]/payment/return`

## Staging / Production Notes
No production env was changed. No production deploy was performed. Payment runtime remains disabled unless explicitly enabled through env outside this task.

No staging smoke was run yet because this task has not been deployed after the implementation commit at report-writing time.

## Tech Debt Review
### New Technical Debt Introduced
- Phase 1 returns a checkout form contract but does not yet provide a public UI trigger or auto-submit form; this is intentional until runtime gating and provider review are finalized.
- Provider config names are documented in code/report but not yet in a permanent payment runbook.

### Existing Technical Debt Observed
- Branch-scoped Preview(staging) env precedence must be considered for future payment env work.
- Duplicate Preview/general QA secrets may still exist from fake-paid QA work.

### Opportunistic Cleanup Completed
- Reused existing payment intent primitives and operator gate patterns rather than creating parallel payment state.
- Kept provider-specific NewebPay logic isolated under `lib/payments/newebpay`.

### Deferred Cleanup Candidates
- Add a payment operations runbook section for NewebPay env names and branch-scoped staging env precedence.
- Add Phase 2 NotifyURL verification with idempotent `payment_intent` paid transition.
- Add later UI affordance only after public runtime strategy is approved.

## Deviations From Handoff
None material. The implementation used `ENABLE_NEWEBPAY_CHECKOUT` as the checkout-specific flag and reused the existing `x-operator-test-secret` operator gate while `ENABLE_PAYMENT_RUNTIME` is off.

## Recommended Next Step
NewebPay NotifyURL Verification Phase 2, limited to provider callback verification and idempotent `payment_intent` paid transition. Still do not create entitlement, `pa_` token, generation job, queue trigger, LINE delivery, or broad public runtime until explicitly approved.
