# NewebPay Sandbox NotifyURL Debug v0 Handoff

Date: 2026-05-30

## Task

Investigate why NewebPay sandbox NotifyURL was not received by Preview(`staging`) after owner confirmed a sandbox credit-card one-time payment returned to staging.

## Scope

In scope:

- Inspect current NewebPay checkout payload builder, NotifyURL verifier, route, and tests.
- Verify safe route reachability with malformed non-secret requests.
- Review provider docs/assumptions for NotifyURL behavior.
- Prepare owner backend checklist and likely root-cause recommendation.
- Document findings with no secrets or provider payloads.

Out of scope:

- Production runtime/env changes.
- Real card use.
- Valid provider payload submission.
- Recording provider secrets, `TradeInfo`, `TradeSha`, raw payloads, decrypted payloads, raw `pa_`, raw `pcs_`, tokenized URLs, raw input, card data, or private values.
- Public copy, Module 01 prompt/result behavior, LINE delivery, or broad payment behavior changes.

## Safety Constraints

- Do not enable or modify Production payment runtime.
- Do not commit credentials, provider payloads, tokenized URLs, card data, raw input, or private values.
- Do not add diagnostics that log raw provider payloads or secrets.

## Validation Plan

- If no code changes: docs presence check, secret/private scan, `git diff --check`.
- If code changes unexpectedly: `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build`.

## Completion Notes

- Checkout builder inspection confirmed `NotifyURL` is included inside encrypted `TradeInfo`; `ReturnURL`, `MerchantOrderNo`, `Amt`, `ItemDesc`, `Version=2.0`, `RespondType=JSON`, and sandbox gateway are present.
- Actual fresh checkout form for run `20260530-230023` was safely inspected locally by field shape only: `NotifyURL` was present and matched `https://staging.anyu.tw/api/payments/newebpay/notify`; `ReturnURL` had staging + `pcs_`; amount was 49.
- Current checkout does not include `ClientBackURL`, `LoginType`, `Email`, or explicit `CREDIT` payment method flag.
- Notify route reachability passed: `GET` returned 405; malformed POST returned provider-compatible `0|ERROR` with safe categories; route is not generic 404 and does not require operator auth.
- Recent Vercel logs showed only deliberate malformed NotifyURL reachability tests, plus ReturnURL/status traffic; no provider-originated NotifyURL request was visible in the checked window.
- Likely root cause: NewebPay sandbox did not send the server-to-server callback, or sandbox backend/transaction settings prevented callback delivery.
- Recommended next step is owner backend transaction/callback inspection before code changes.
