# Recovery Link Token Schema / Resolver v0 Handoff

Date: 2026-06-01
Owner task: Recovery Link Token Schema / Resolver v0
Scope: DB schema/migration, server helpers, resolver route/page, tests, and documentation only. No Email sending, LINE messages, production migration, env changes, membership, or payment runtime changes.

## Objective

Implement the foundational paid result recovery link primitive so future Email/LINE saved-result flows can send a safe web return link without exposing raw `pa_` paid access tokens, raw `pcs_` checkout session tokens, full report content, or provider payloads.

## Constraints

- Do not enable production payment runtime.
- Do not change production flags or env.
- Do not apply staging or production DB migrations in this task unless explicitly approved; add migration only.
- Do not run real payments.
- Do not send Email or LINE messages.
- Do not implement membership/login.
- Do not expose raw `pa_` or `pcs_` tokens.
- Do not expose full report content in Email/LINE.
- Do not change payment provider behavior.
- Do not implement Module 02.
- Do not commit secrets or private customer data.

## Planned Work

1. Inspect current Drizzle schema/migration conventions, entitlement access helpers, paid access resolver/page, and recovery contact helpers.
2. Add `paid_result_recovery_links` schema and migration with hash-only token storage, channel/purpose/status fields, expiry, revocation, and send/use metadata.
3. Add server-only recovery link token helpers for generation, hashing, lookup, expiry/revocation, and safe resolution.
4. Add `/r/[recoveryToken]` resolver route/page that validates token server-side and renders/redirects to safe web access without raw `pa_` / `pcs_` exposure.
5. Add targeted tests for token storage, invalid/expired/revoked behavior, route safety, 90-day expiry, and migration presence.
6. Create execution report, update summary log/dashboard, validate, commit, and push to `origin/staging` if safe.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted recovery link / paid access tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm exec drizzle-kit check`
- docs presence check
- secret/private scan
- `git diff --check`

## Notes

Preferred access approach is to reuse the existing paid result rendering path by resolving a recovery link to entitlement/result server-side, while avoiding raw `pa_` or `pcs_` in URLs or HTML. If direct rendering causes broad duplication, use a safe short-lived server-side handoff instead and document the tradeoff.
