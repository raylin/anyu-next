# Unified NewebPay ReturnURL Route v0 Handoff

Date: 2026-06-04

## Task

Add a provider-level unified NewebPay ReturnURL route at `/payment/newebpay/return`, preserve the existing module ReturnURL route, and update checkout payload generation to prefer the unified route.

## Constraints

- Do not enable production payment runtime or checkout.
- Do not run real payment.
- Do not send Email or LINE messages.
- Do not change NotifyURL payment-truth behavior.
- ReturnURL must remain UX/polling only and non-mutating.
- Do not expose `pcs_`, `pa_`, `pal_`, provider payloads, or secrets.
- Do not implement Module 02.

## Plan

1. Inspect current module ReturnURL, poller, status route, checkout payload, and tests.
2. Extract or reuse shared ReturnURL component/helper.
3. Add `/payment/newebpay/return`.
4. Keep `/m/[moduleSlug]/payment/return` compatibility.
5. Update checkout payload ReturnURL to `/payment/newebpay/return`.
6. Add/update tests for route rendering, checkout payload, NotifyURL unchanged, and token redaction.
7. Run lint, targeted tests, full tests, build, access-link smoke, and no-card QA.
8. Update report, summary log, dashboard, commit, and push.

## Expected Report

`ai-collaboration/reports/2026-06-04-unified-newebpay-return-url-route-v0.md`

