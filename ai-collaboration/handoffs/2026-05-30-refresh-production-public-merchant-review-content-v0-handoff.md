# Refresh Production Public Merchant Review Content v0 Handoff

Date: 2026-05-30
Branch: staging

## Task
Refresh production with the latest public merchant-review content so NewebPay can review official production URLs.

## Scope
Production public content deployment and verification only.

## Constraints
- Do not enable payment runtime.
- Do not change production flags or env values.
- Do not modify NewebPay checkout/notify/payment behavior.
- Do not run real payment attempts.
- Do not add queue trigger or LINE delivery.
- Do not change Module 01 prompt/result behavior or schemas.
- Do not commit private proof documents, screenshots with private data, provider credentials, raw user input, tokenized URLs, or secrets.

## Planned Steps
1. Verify git state and remote refs, including stale `origin/staging` tracking issue.
2. Confirm source contains storefront, `/refund`, footer/legal links, NT$49 one-time price, and `hello@anyu.tw`.
3. Inspect production deployment path and Vercel project context.
4. Verify production payment runtime safety as far as non-secret route/env visibility allows.
5. Deploy latest public content to production only if project context and method are unambiguous.
6. Verify `https://anyu.tw/`, `/refund`, and `/legal` after deploy.
7. Record report and summary log.

## Validation
If no code changes are made, use prior validation from `d68bbb7` plus live production HTTP checks. If code changes unexpectedly, run web lint/test/build.
