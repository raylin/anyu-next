# Admin Paid Result Lookup API v0 Handoff

## Date

2026-06-05

## Task

Implement a read-only Admin API endpoint for paid result lookup by `resultId` with strict `x-admin-api-token` auth and sanitized response.

## Scope

Apps/web API implementation, tests, docs, dashboard, summary. No CLI, no Admin UI, no env mutation, no payment/runtime changes.

## Constraints

- Do not implement CLI or Admin UI.
- Do not enable production runtime or checkout.
- Do not run payment.
- Do not send Email or LINE messages.
- Do not modify Vercel env values.
- Do not apply DB migrations.
- Do not implement resend/mutations.
- Do not expose raw Email, LINE userId, encrypted recipient, hashes, raw tokens, tokenized URLs, source text, provider payloads, TradeInfo/TradeSha, or card/payment sensitive data.
- Do not commit secrets/private data.

## Planned Work

1. Inspect existing DB schema and legacy support summary logic.
2. Add `GET /api/admin/paid-results/[resultId]`.
3. Implement `ADMIN_API_TOKEN` env gate via `x-admin-api-token`.
4. Build sanitized response with diagnosis/action enums.
5. Add route/helper tests for auth, missing result, ready result, pending delivery, no contact, redaction, and no mutation.
6. Run required validation.
7. Create execution report, update summary/dashboard, commit, and push.

## Validation

- `cd apps/web && corepack pnpm lint`
- targeted admin API tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:access-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- `cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run`
