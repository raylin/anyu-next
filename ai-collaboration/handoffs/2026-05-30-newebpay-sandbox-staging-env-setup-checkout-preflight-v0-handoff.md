# NewebPay Sandbox Staging Env Setup + Checkout Preflight v0 Handoff

Date: 2026-05-30

## Task

Configure branch-scoped Preview(`staging`) NewebPay sandbox env safely and run a checkout/payload preflight without submitting a sandbox payment.

## Scope

In scope:

- Inspect current checkout implementation and env/route contracts.
- Configure Preview(`staging`) env only if required sandbox credentials are available in the shell.
- Redeploy Preview(`staging`) after env changes when applicable.
- Run sanitized checkout creation preflight without payment submission.
- Verify Production remains disabled.
- Document sanitized results.

Out of scope:

- Production env/runtime changes.
- Actual sandbox payment or real payment.
- Public copy, LINE, Module 01 prompt/result, checkout/notify behavior changes.
- Committing provider credentials, raw provider payloads, raw tokens, tokenized URLs, or private values.

## Constraints

- Do not print MerchantID, HashKey, HashIV, encrypted TradeInfo, raw `pa_`, `pcs_`, tokenized URLs, raw user input, provider payloads, or private values.
- Do not set sandbox credentials in Production.
- Stop before env setup if provider credentials are not available securely in the shell.

## Validation Plan

- If no code changes: docs presence check, secret/private scan, `git diff --check`.
- If code changes unexpectedly: `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build`.

## Completion Notes

- Source inspection completed; current implementation uses `NEWEBPAY_CHECKOUT_URL`, `NEWEBPAY_ENVIRONMENT`, `NEXT_PUBLIC_APP_URL`, `NEWEBPAY_NOTIFY_URL`, and hard-coded MPG `Version=2.0`.
- Env setup and authorized checkout preflight were blocked because NewebPay sandbox credentials were not available in the Codex shell.
- No Vercel env values were modified and no redeploy/payment was run.
- Production safety check passed: production health remained `main/1990fc034d74`, and production fake-paid/checkout routes returned JSON `404 not_found`.
