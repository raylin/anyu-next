# Admin Paid Result Lookup API v0

## Date

2026-06-05

## Status

Completed.

## Completed Work

- Added read-only Admin API route:
  - `GET /api/admin/paid-results/[resultId]`
- Added strict Admin API auth:
  - requires `x-admin-api-token`
  - compares against server runtime env `ADMIN_API_TOKEN`
  - fails closed when `ADMIN_API_TOKEN` is missing on the server
  - returns `401` for missing or invalid caller token
  - performs auth before result lookup, so result existence is not leaked pre-auth
- Added sanitized paid-result lookup helper for `resultId` only.
- Added stable v0 JSON response with safe support summaries for:
  - result/module state
  - payment state
  - entitlement state
  - generation job state
  - paid result state
  - Email access-link saved/sent/active state
  - LINE access-link saved/recipient-secret/sent/active state
  - provider audit presence summaries
  - diagnosis categories
  - recommended action categories
- Added tests for auth, missing result, ready result, pending delivery, saved-contact/missing-link diagnosis, and redaction.

## Route

```txt
GET /api/admin/paid-results/[resultId]
```

## Auth Behavior

- Header: `x-admin-api-token`
- Server env: `ADMIN_API_TOKEN`
- Missing server env: `503` with safe `admin_api_not_configured`
- Missing caller token: `401` with safe `admin_auth_failed`
- Invalid caller token: `401` with safe `admin_auth_failed`
- Missing result after auth: `404` with safe `result_not_found`

The route does not read `.env.staging`, `.env.production`, DB URLs, Vercel env metadata, or CLI env files manually. It relies on normal server runtime env.

## Response Schema

The v0 response is JSON-only and includes:

- `ok`
- `result`
- `payment`
- `entitlement`
- `generation`
- `accessLinks.email`
- `accessLinks.line`
- `diagnosis`
- `recommendedActions`

Provider message IDs and merchant order numbers are represented only as presence booleans:

- `providerMessageIdPresent`
- `merchantOrderNoPresent`

## Redaction Guarantees

The response must not include:

- raw Email
- raw LINE user ID
- encrypted recipient
- recipient hash
- contact hash
- token hash
- raw `pal_` / `prl_` token
- tokenized URL
- source text or raw user input
- paid result content
- provider payload
- `TradeInfo` / `TradeSha`
- card or payment-sensitive data
- raw provider message ID
- raw merchant order number

Tests include explicit string checks for token, provider-message, and merchant-order leakage.

## Diagnosis Categories

Implemented minimal safe categories:

- `result_not_found`
- `payment_not_started`
- `payment_waiting`
- `payment_paid_delivery_pending`
- `paid_processing`
- `paid_result_ready`
- `paid_failed`
- `entitlement_missing`
- `no_saved_contact`
- `email_contact_saved`
- `line_contact_saved`
- `email_access_link_sent`
- `line_access_link_sent`
- `email_access_link_failed`
- `line_access_link_failed`
- `access_link_missing`
- `unknown`

## Recommended Actions

Implemented minimal enum-like actions:

- `wait_for_processing`
- `ask_user_open_email_or_line_view_link`
- `ask_user_check_email_inbox`
- `ask_user_check_line_message`
- `support_review_required`
- `refund_review_needed`
- `retry_processor_if_safe`
- `no_action_needed`

## Validation

- `cd apps/web && corepack pnpm exec vitest run src/tests/admin-paid-result-lookup.test.ts src/tests/admin-paid-result-lookup-route.test.ts`: passed
- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test`: passed, 82 files / 586 tests
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm run qa:access-link:smoke`: passed
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed
- `cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run`: passed with `pass_ready_for_controlled_smoke`

## Production Safety

- Production runtime was not enabled.
- Production checkout was not enabled.
- No production payment was run.
- No Email or LINE messages were sent by this task.
- Vercel env values were not modified.
- Production dry-run preflight confirmed public pages live and checkout/fake-paid fail-closed.

## Architecture Decisions

- Admin API is the operational boundary for support lookup.
- The first Admin API surface is read-only and lookup-by-resultId only.
- Direct DB support lookup remains legacy and is not the target ops path.
- CLI remains out of scope for this task and should be implemented as a pure Admin API client later.

## Tech Debt Review

- New technical debt introduced: none known.
- Existing technical debt observed: legacy direct DB support lookup still exists and should be deprecated after Admin API/CLI smoke passes.
- Deferred cleanup: remaining recovery-named envs/modules and `rlb_` bind prefix are still tracked from the staging baseline tech-debt list.

## Remaining Next Steps

1. Add `ADMIN_API_TOKEN` to Preview(staging) through Vercel env in a separate approved smoke task.
2. Run a staging Admin API lookup smoke directly against `https://staging.anyu.tw/api/admin/paid-results/[resultId]`.
3. Implement Admin CLI Lookup Client v0:
   - `pnpm ops lookup-result --env staging --id <resultId>`
   - `pnpm ops lookup-result --env production --id <resultId>`
   - `ADMIN_API_TOKEN` from shell/process env only
4. Add Production `ADMIN_API_TOKEN` later for read-only production Admin lookup smoke.
