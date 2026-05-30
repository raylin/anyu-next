# Secret-safe NewebPay Sandbox E2E Helper / QA Runner Cleanup v0

Date: 2026-05-31

## Summary

Added a dedicated secret-safe NewebPay sandbox E2E helper for future staging sandbox payment smokes. The helper standardizes the previously ad hoc flow:

1. Create a fresh Module 01 source result.
2. Create a fresh NewebPay sandbox checkout through the operator-gated staging route.
3. Write a temporary local NewebPay payment form outside the repo.
4. Let the owner submit sandbox credit-card one-time payment in a browser.
5. Poll session-bound payment status.
6. Verify paid access render after payment is ready.
7. Confirm production remains disabled.

No production runtime, env, provider behavior, public copy, or payment flow behavior was changed.

## Files Changed

- `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs`
- `apps/web/package.json`
- `ai-collaboration/handoffs/2026-05-31-secret-safe-newebpay-sandbox-e2e-helper-qa-runner-cleanup-v0-handoff.md`
- `ai-collaboration/reports/2026-05-31-secret-safe-newebpay-sandbox-e2e-helper-qa-runner-cleanup-v0.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`
- `ai-collaboration/summaries/summary_log.md`

## Existing QA Runner Findings

`apps/web/scripts/authorized-fake-paid-qa.mjs` already provides a good sanitized pattern:

- newline-delimited JSON records
- no raw paid access token printed
- redacted unlock path shape
- queue/manual processor mode support
- production-safe gate checks

The sandbox payment flow needed a separate helper because it must write a real provider form for browser submission. Keeping this separate avoids mixing fake-paid QA with real sandbox checkout artifacts.

## Helper Command

Package script added:

```bash
cd apps/web
corepack pnpm run qa:newebpay:sandbox -- create-checkout
corepack pnpm run qa:newebpay:sandbox -- poll-status
corepack pnpm run qa:newebpay:sandbox -- verify-after-payment
```

## Modes

| Mode | Purpose | Sensitive output policy |
|---|---|---|
| `create-checkout` | Creates fresh source result and checkout, writes a temporary provider form, writes local state file. | Prints only sanitized booleans/statuses plus local file paths. Does not print provider fields or tokens. |
| `poll-status` | Reads local state file and polls payment status once. | Prints status category and whether access path is present, not the access path. |
| `verify-after-payment` | Polls until ready/timeout, verifies paid access page render, checks production disabled posture. | Prints final state categories and safe booleans only. |

## Required Env Names

For `create-checkout`:

- `OPERATOR_TEST_SECRET`

Optional:

- `QA_NEWEBPAY_BASE_URL`
- `QA_NEWEBPAY_INPUT_SUFFIX`
- `QA_NEWEBPAY_STATE_FILE`

The helper calls staging routes and does not require local NewebPay provider credentials. Provider credentials remain configured in Vercel Preview(`staging`) and are never printed by this helper.

## Temporary Files

The helper writes temporary artifacts only outside the repository:

- payment form directory: `/private/tmp/anyu-newebpay-smoke/`
- default state file: `/private/tmp/anyu-newebpay-smoke/latest-sandbox-e2e-state.json`

The payment form and state file must not be committed, copied into reports, or shared. They may contain provider form fields or session material needed for the manual browser step.

## Redaction Guarantees

The helper is designed not to print:

- `OPERATOR_TEST_SECRET`
- MerchantID / HashKey / HashIV
- `TradeInfo`
- `TradeSha`
- raw `pcs_` token
- raw `pa_` token
- tokenized URLs
- raw user input
- card data
- provider payloads

Printed output uses sanitized JSON fields such as:

- `paymentIntentIdPresent`
- `merchantOrderNoPresent`
- `pcsHandoffPresent`
- `tradeInfoPresent`
- `tradeShaPresent`
- `accessPathPresent`
- payment status categories

## Two-Step Sandbox Flow

1. Run `create-checkout` with `OPERATOR_TEST_SECRET` available in the local shell.
2. Open the printed temporary form path immediately in a browser.
3. Use sandbox credit-card one-time payment only.
4. Do not use a real card.
5. After the browser returns to staging, run `verify-after-payment`.
6. Paste only the sanitized helper output into reports or ChatGPT.

## Missing Secret Behavior

Dry run without `OPERATOR_TEST_SECRET` exits safely:

- prints `OPERATOR_TEST_SECRET: "missing"`
- prints `operator_secret_missing`
- does not call checkout
- does not print secrets

## Known Limitations

- The helper does not automate browser payment submission.
- The helper does not inspect Vercel logs or NotifyURL diagnostic categories directly; if payment stays waiting, operator should inspect safe Vercel log category manually.
- The helper stores a session-bound checkout token in the local state file outside the repo so follow-up polling can work without pasting tokenized URLs.
- The helper is staging-oriented; production controlled smoke should get a separate launch-gate task.

## Validation

- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm run qa:newebpay:sandbox -- create-checkout` without secrets: passed expected safe blocked behavior with exit code 2.
- Docs presence check: passed.
- Added-line secret/private scan: passed.
- `git diff --check`: passed.

## Tech Debt Review

- New technical debt introduced: the helper has no unit tests because its value is mostly orchestration around live staging routes and temporary local files.
- Existing technical debt observed: sandbox E2E still requires manual browser submission and Vercel log inspection if payment remains waiting.
- Opportunistic cleanup completed: package script added so future sandbox smoke commands are consistent.
- Deferred cleanup candidates: optional structured log category fetch from Vercel CLI if a safe, payload-free method is identified; production controlled-smoke helper should remain a separate launch-gate task.

## Recommended Next Step

Run `Module 01 Launch UX Lock + Multi-State Paid CTA Plan v0` while NewebPay review is pending, or use the helper for the next sandbox regression only if provider/payment changes are made.
