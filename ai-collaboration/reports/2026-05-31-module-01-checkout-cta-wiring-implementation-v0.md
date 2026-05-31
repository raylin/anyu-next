# Module 01 Checkout CTA Wiring Implementation v0

## Date

2026-05-31

## Completed Work

- Added a server-rendered checkout-start page:
  - `/m/[moduleSlug]/result/[resultId]/checkout`
- Added a narrow result-checkout gate:
  - production path requires `ENABLE_PAYMENT_RUNTIME=true` and `ENABLE_NEWEBPAY_CHECKOUT=true`
  - staging operator path requires Vercel Preview on branch `staging`, `ENABLE_NEWEBPAY_CHECKOUT=true`, and server-side `OPERATOR_TEST_SECRET` configured
- Wired runtime result-page paid CTA to the checkout-start page when checkout is available.
- Kept review-pending/payment-disabled CTA disabled.
- Rendered an explicit NewebPay submit form with a user-click button instead of auto-submit.
- Added tests for gate behavior, CTA link rendering, checkout-start page rendering, and secret/payload safety boundaries.
- Confirmed production remains fail-closed.

## Checkout-Start Route

Route added:

```text
/m/[moduleSlug]/result/[resultId]/checkout
```

Source:

```text
apps/web/src/app/m/[moduleSlug]/result/[resultId]/checkout/page.tsx
```

Responsibilities:

- Validate `moduleSlug`.
- Respect server-side checkout gates.
- Refuse checkout while production runtime is disabled and no staging operator gate is active.
- Verify DB readiness before checkout creation.
- Call existing `createNewebPayCheckout` server-side.
- Render safe unavailable/error states.
- Render a NewebPay provider form only after checkout creation succeeds.

## Gate Behavior

### Production disabled

Current production remains disabled:

- production health: `environment=production`, branch `main`, route bundle `payment-foundation-2026-05-29`
- production checkout route: JSON `not_found`
- production fake-paid route: JSON `not_found`

When checkout gates are closed, checkout-start page renders launch-aligned unavailable copy and does not call checkout creation.

### Staging/operator

Staging operator checkout-start is allowed only when all are true:

- `VERCEL_ENV=preview`
- `VERCEL_GIT_COMMIT_REF=staging`
- `ENABLE_NEWEBPAY_CHECKOUT=true`
- server-side `OPERATOR_TEST_SECRET` is configured

The operator secret is never sent to the browser and is not part of the provider form.

### Production future

When production launch is explicitly approved later, the same checkout-start page can work with:

- `ENABLE_PAYMENT_RUNTIME=true`
- `ENABLE_NEWEBPAY_CHECKOUT=true`

This task did not enable those flags.

## CTA Wiring Behavior

- Result page computes checkout availability through `canStartNewebPayCheckoutFromResult`.
- Runtime result pages pass `/m/[moduleSlug]/result/[resultId]/checkout` as `checkoutHref` only when checkout is available.
- `PaidPreviewCard` renders the primary CTA as a link only when `primaryHref` is present and the state is enabled.
- Review-pending/payment-unavailable states remain disabled.
- ContactCapture is not reintroduced as the paid CTA.

## Provider Form UX

The checkout-start page shows:

- product name
- NT$49
- one-time / non-subscription copy
- web delivery after provider confirmation
- refund/support copy
- button: `前往藍新安全付款頁`

The form is explicit; it does not auto-submit.

The form includes the NewebPay-required field names for browser submission. Provider secrets such as HashKey/HashIV are never rendered. `OPERATOR_TEST_SECRET` is never rendered. The implementation does not log provider form fields.

## No Pre-Payment Artifacts

Checkout-start uses the existing checkout service. It creates/reuses only:

- `payment_intent` in `checkout_started` state
- signed `pcs_` checkout session handoff

It does not create:

- entitlement
- raw `pa_` token
- generation job
- queue trigger

This behavior remains covered by existing checkout service tests.

## Tests

Added/updated:

- `apps/web/src/tests/newebpay-checkout-start-page.test.tsx`
- `apps/web/src/tests/feature-flags.test.ts`
- `apps/web/src/tests/ai-temperature-result.test.tsx`

Coverage includes:

- production-disabled gate does not create checkout
- checkout-available CTA renders checkout-start link
- checkout-start page calls checkout creation server-side
- operator secret is not rendered
- provider secrets are not rendered
- provider form contains required field names
- invalid/expired result renders safe error
- no entitlement/generation job artifacts before payment

## Staging QA Result

Full staging browser payment smoke was not run in this implementation task. Recommended follow-up:

```text
Result-Page Checkout Staging Sandbox QA v0
```

Minimum follow-up should verify:

- create fresh Module 01 result on staging
- click result-page CTA
- checkout-start confirmation page renders
- submit sandbox credit-card one-time payment
- ReturnURL remains non-mutating
- NotifyURL transitions payment paid
- delivery artifacts, queue, `paid_ready`, and access render pass
- production remains disabled

## Production Safety Result

Production safety checks after implementation:

- `/api/health`: `environment=production`, branch `main`
- production checkout route: JSON `not_found`
- production fake-paid route: JSON `not_found`
- production env not modified
- production DB migration not applied

## Validation

- `cd apps/web && corepack pnpm lint`: passed
- Targeted checkout CTA / checkout-start / payment tests: passed
- `cd apps/web && corepack pnpm test`: passed, 60 files / 384 tests
- `cd apps/web && corepack pnpm build`: passed

## Architecture Decisions

- Used a server-rendered checkout-start page instead of client-side fetch, avoiding browser-side operator secret exposure.
- Added a narrow Preview(`staging`) server-side operator gate rather than broadening production runtime behavior.
- Used explicit user confirmation button rather than auto-submit for v0.

## Blockers

- None for implementation.

## Uncertainties

- Full staging UI checkout smoke remains to be run.
- Production launch still requires NewebPay approval, production env dry-run, production DB unique-index gate, and controlled production smoke.

## Suggested Next Steps

1. `Result-Page Checkout Staging Sandbox QA v0`
2. `Production Payment Config Dry-Run v0` after NewebPay approval/formal credentials
3. `Entitlement Unique Index Production Gate v0` before production payment runtime enablement

## Known Technical Debt

- `PaidPreviewCard` still supports the legacy-compatible `onRevealContact` prop. This was kept for compatibility and augmented with `primaryHref`.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Full staging UI checkout QA is still pending.
- Production payment launch gates remain external and manual.

### Opportunistic Cleanup Completed

- Added reusable checkout gate helpers in `feature-flags.ts`.

### Deferred Cleanup Candidates

- Rename `onRevealContact` to a more neutral action prop after legacy surfaces are fully retired.
- Consider a browser-safe E2E helper mode for the checkout-start page after staging smoke.

### Recommended Follow-up

- `Result-Page Checkout Staging Sandbox QA v0`

## Git Commit

- Commit hash: `pending`
- Commit message: `feat: wire module checkout cta`

## Staging Push

- Push status: `pending`
- Push command: `git push origin HEAD:staging`
