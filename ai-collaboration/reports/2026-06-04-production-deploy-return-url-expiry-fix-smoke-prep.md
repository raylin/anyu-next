# Production Deploy ReturnURL Expiry Fix + Controlled Smoke v1 Retry Prep

Date: 2026-06-04

## Completed Work

- Saved the handoff before Production operations.
- Confirmed local source was commit `5e0e1ee`.
- Ran Production payment runtime preflight before deploy.
- Deployed from the repo root to canonical Vercel Production project `anyu-next`.
- Verified `anyu.tw` and `www.anyu.tw` serve the fixed deployment.
- Verified Production remains fail-closed.
- Safely tested ReturnURL expired/failure UX without real payment or tokenized URL.
- Ran Production payment runtime preflight after deploy.
- Updated dashboard and summary log.

## Production Deployment Result

- Deployment method: Vercel CLI from repo root.
- Canonical project: `anyu-next`.
- Deployment ID: `dpl_CnJumu2bAeJTR9mT9FTs3ofumTbJ`.
- Deployment URL category: canonical Vercel Production deployment.
- Alias result:
  - `https://anyu.tw` points to the new canonical deployment.
  - `https://www.anyu.tw` health also reports the new fixed deployment.

No deployment was run from `apps/web`.

## Production Freshness

Health checks:

- `https://anyu.tw/api/health`: 200.
- `https://www.anyu.tw/api/health`: 200.
- `environment`: `production`.
- `gitCommit`: `5e0e1ee924d4`.
- `gitBranch`: `staging`.
- `routeBundleVersion`: `payment-foundation-2026-05-29`.

Public page checks:

- `/`: 200.
- `/refund`: 200.
- `/legal`: 200.

## Fail-Closed Verification

Production remained disabled after deploy:

- Checkout API returned 404 `not_found`.
- Fake-paid route returned 404.
- Operator access-link smoke route returned 404.
- No provider form was generated.
- No payment was run.
- No Email was sent.
- No LINE message was sent.

Runtime flag status from preflight:

- `ENABLE_PAYMENT_RUNTIME`: absent/disabled.
- `ENABLE_NEWEBPAY_CHECKOUT`: absent/disabled.

## ReturnURL Expired/Failure UX Verification

Safe test used a non-tokenized provider-return URL with failure/expiry status fields only.

Result:

- HTTP 200.
- Terminal expired/support copy appeared.
- `付款確認中` did not appear.
- No payment mutation was performed.
- No provider payload, token, or tokenized URL was printed.

This verifies commit `5e0e1ee` is active on Production for the observed expired-link bug.

## Production Preflight Result

Command:

```bash
cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run
```

Result:

- `ok`: true.
- `readiness`: `pass_ready_for_controlled_smoke`.
- Canonical project linking: aligned.
- Production safety checks: passed.
- Runtime disabled/fail-closed: passed.
- Redaction: no values, lengths, prefixes, suffixes, hashes, checksums, provider payloads, or tokens printed.

## Next Controlled Smoke Instructions

Recommended next task:

Controlled Production Payment Smoke v1 Clean Retry with Fresh NewebPay Form.

Before owner card payment:

- Run Production preflight.
- Enable only `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT`.
- Deploy from repo root to canonical `anyu-next`.
- Create a fresh result and fresh checkout-start provider form.
- Owner should complete Email save and LINE bind.
- Owner should proceed to card payment promptly after the provider form is generated to avoid another provider form expiry.
- If provider expiry happens again, the ReturnURL should now show terminal expired/support state, not indefinite payment checking.

## Architecture Decisions

- Kept Production runtime disabled after deploying the fix.
- Verified expiry UX through a safe non-tokenized ReturnURL request rather than generating or exposing a real payment token.
- Did not modify NewebPay dashboard settings.
- Did not send Email or LINE messages.

## Blockers

- No blocker for retry prep.
- Controlled Production Payment Smoke v1 remains incomplete until a clean card payment run passes end to end.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed:
  - NewebPay provider form can expire during a slow owner-assisted smoke; the next run should minimize time between form generation and card payment.
  - Some internal env names still use recovery terminology.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates:
  - Add a smoke-run checklist timer or explicit “fresh form generated now” checkpoint.
  - Expand provider-return categories if additional NewebPay failure messages appear.

## Suggested Next Steps

1. Run Controlled Production Payment Smoke v1 Clean Retry with Fresh NewebPay Form.
2. Keep no ads and no broad traffic during the smoke.
3. Decide final runtime status only after Email, LINE, NotifyURL, paid result render, and access-link checks pass.
