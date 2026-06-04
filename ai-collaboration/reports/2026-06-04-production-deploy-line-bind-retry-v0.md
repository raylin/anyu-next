# Production Deploy + LINE Bind Retry v0

Date: 2026-06-04

## Completed Work

- Deployed the LINE LIFF state parser fix from local source commit `538eccb`.
- Vercel Production deployment completed successfully:
  - deployment id: `dpl_FZiXV9L7EgbwahgSZo6tUF6WLTdV`
  - custom domain alias `https://anyu.tw` was pointed to the new deployment
- Verified Production public pages:
  - `/` returned 200
  - `/refund` returned 200
  - `/legal` returned 200
- Ran production payment runtime preflight in dry-run mode after deploy.
- Verified Production remained fail-closed:
  - checkout route returned `not_found`
  - fake-paid/operator route returned 404
  - payment runtime and checkout were not enabled
- Created one fresh synthetic Production free result with non-private test text to check whether a runtime-disabled LINE bind retry surface was available.
- Verified the runtime-disabled checkout page rendered the checkout-unavailable state and did not expose the LINE save CTA.
- Ran read-only sanitized Production DB aggregate checks.

## Production Deploy Result

- Production deploy result: completed.
- `anyu.tw` alias result: updated to the new deployment.
- Production health result:
  - environment: `production`
  - route bundle: `payment-foundation-2026-05-29`
  - git commit metadata: `unknown`

The commit metadata is `unknown` because this was a local Vercel CLI production deploy rather than a git-integrated deployment. The local workspace source commit at deploy time was `538eccb87e2f40593340ed3b1b19b90f0ab92e89`.

## Fail-Closed Result

- Production checkout remained disabled.
- Production payment runtime remained disabled.
- Queue/processor smoke runtime was not enabled.
- No payment could be started through the fail-closed checkout API.
- Public pages remained live.

## LINE Bind Retry Result

- Owner-assisted LINE bind retry was not run.
- Failure/blocker category: `checkout_unavailable_runtime_disabled`.
- Reason: with Production checkout/runtime disabled, both the prior v1 checkout result and a fresh synthetic Production result rendered the checkout-unavailable state and did not expose the LINE 保存查看連結 CTA.
- No `這個 LINE 查看連結已失效` retry result was observed after the fix because the bind flow could not be opened under the no-checkout constraint.

## Sanitized DB Verification

Read-only aggregate Production DB check:

- LINE contact rows: 0
- LINE recipient secret rows: 0
- Email contact rows: 2
- payment intent rows: 2
- access-link rows: 1

No raw LINE user ID, encrypted recipient, recipient hash, token, provider payload, or raw result content was printed.

## Production Safety

- No production payment was run.
- No production Email was sent.
- No production LINE access-link message was sent.
- No manual Production DB mutation was performed.
- NewebPay dashboard settings were not changed.
- Production runtime remained disabled at the end of the task.

## Architecture Decisions

- Did not enable checkout/runtime to force a LINE bind retry because this task explicitly prohibited enabling production checkout/runtime.
- Treated the missing CTA as an operational constraint blocker rather than a LINE parser failure.
- Kept the deployed parser fix in Production so the next approved retry window can test the LINE bind path immediately.

## Blockers

- A real Production LINE bind retry requires an approved temporary checkout/runtime window or a separate production-safe bind retry helper that exposes only the LINE save flow without enabling payment checkout.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: there is no production-safe LINE bind-only retry surface when checkout is intentionally disabled.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates:
  - add a tightly gated production LINE bind preflight/smoke helper that does not expose payment provider checkout
  - make production deploy metadata include git commit SHA even for local Vercel CLI deploys

## Suggested Next Steps

1. Decide whether to temporarily enable checkout/runtime for a LINE-bind-only retry window, then disable again before payment if desired.
2. Alternatively implement a production-safe LINE bind-only smoke helper.
3. After LINE bind succeeds, rerun Controlled Production Payment Smoke v1 with credit-card one-time payment and Email/LINE access-link delivery.
