# Controlled Production Payment Smoke Retry with Scoped Runtime Config v3 Handoff

## Task

Controlled Production Payment Smoke Retry with Scoped Runtime Config v3.

## Context

Staging now validates the pre-payment save path:

- Email save -> mock/no-card paid -> access-link readiness -> paid result render passed.
- Full `qa:module01:staging` passed with Admin API/CLI checks green.
- Staging LINE bind passed with `bind_success`, recipient secret present, and deliverable contact.

Production smoke is final acceptance, not primary diagnostics.

## Scope

- Promote/deploy latest accepted staging code to Production fail-closed if production freshness is stale.
- Run final pre-open gates.
- Open Module 01 production payment window via scoped runtime config only.
- Create one fresh production result from tracked fixture.
- Proceed through Email save, mobile LINE bind, one NT$49 credit-card payment, NotifyURL/processor/paid result, Email/LINE delivery, Admin/Ops lookup, and fail-closed shutdown.

## Safety Rules

- Stop at first hard failure.
- Do not open runtime if production freshness is stale or unknown.
- Do not use production as diagnostics.
- Do not use old Vercel runtime env flags.
- Do not dynamically invent analyze input or reuse old production results.
- Do not expose card data, provider payloads, TradeInfo/TradeSha, tokens, raw Email, raw LINE ID, idToken, LIFF state, encrypted recipient, or hashes.
- Do not run another production attempt after a hard failure in this task.

## Owner Preconditions

Before owner manual payment action:

- NewebPay dashboard must be production credentials, one-time credit card enabled, non-card disabled.
- NotifyURL must be `https://anyu.tw/api/payments/newebpay/notify`.
- ReturnURL must be `https://anyu.tw/payment/newebpay/return`.
- Owner must be ready to pay one NT$49 production card payment immediately after a fresh provider form is generated.
- Owner can check Email and LINE receipt.

## Expected Report

`ai-collaboration/reports/2026-06-07-controlled-production-payment-smoke-scoped-runtime-config-v3.md`
