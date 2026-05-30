# NewebPay Sandbox Staging Checkout Preflight Run v1 Handoff

Date: 2026-05-30

## Task

Configure branch-scoped Preview(`staging`) NewebPay sandbox env from local `apps/web/.env.local` values and run a sanitized checkout preflight without submitting a sandbox payment.

## Scope

In scope:

- Verify repo/source state.
- Read required secret presence from `apps/web/.env.local` without printing values.
- Configure Preview(`staging`) env only.
- Redeploy Preview(`staging`).
- Create a fresh source result and call the operator-gated NewebPay checkout route.
- Record sanitized checkout contract metadata only.
- Verify Production remains disabled.

Out of scope:

- Production env/runtime changes.
- Actual sandbox payment or real payment.
- Public copy, LINE, Module 01 prompt/result, or payment behavior changes.
- Committing credentials, encrypted TradeInfo, TradeSha, raw tokens, tokenized URLs, raw user input, provider payloads, or private values.

## Constraints

- Do not print MerchantID, HashKey, HashIV, `VERCEL_TOKEN`, `OPERATOR_TEST_SECRET`, `PAYMENT_CHECKOUT_SESSION_SECRET`, encrypted `TradeInfo`, `TradeSha`, raw `pa_`, `pcs_`, tokenized URLs, provider payloads, raw user input, or private values.
- Do not set sandbox credentials in Production.
- Do not enable Production payment runtime.

## Validation Plan

- If no code changes: docs presence check, secret/private scan, `git diff --check`.
- If code changes unexpectedly: `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build`.

## Completion Notes

- Required NewebPay sandbox credentials were read from local `apps/web/.env.local` by presence only and were not printed.
- Branch-scoped Preview(`staging`) env was configured for the NewebPay sandbox checkout contract and operator-gated preflight.
- Preview(`staging`) was redeployed and health reported `environment=preview`, `gitBranch=staging`, `routeBundleVersion=payment-foundation-2026-05-29`, and `gitCommit=e8373433a596`.
- Checkout preflight created a fresh source result and returned a NewebPay checkout contract with `paymentIntentStatus=checkout_started`, sandbox `ccore` gateway, MPG `Version=2.0`, and `pcs_` ReturnURL handoff present.
- The preflight did not submit to NewebPay, mark paid, create entitlement, create `pa_`, create `generation_job`, or trigger queue processing.
- Production remained disabled: production health reported `environment=production`, `gitBranch=main`, `gitCommit=1990fc034d74`; production checkout and fake-paid routes returned JSON `404 not_found`.
