# LINE Fulfillment Env Matrix

Date created: 2026-05-21

Purpose: source-of-truth template for LINE fulfillment environment configuration across Preview / Staging and Production.

## Rules

- Do not store secret values in this file.
- Secret statuses must use status values only: `pending`, `configured`, or `unknown`.
- Implementation must read LINE fulfillment configuration only from env.
- Vercel Preview env should point to the test OA and staging LIFF.
- Vercel Production env should point to the production OA and production LIFF.

## Env Matrix

| Environment | Variable | Source | Public? | Secret? | Status | Notes |
|---|---|---|---|---|---|---|
| Preview / Staging | `LINE_CHANNEL_SECRET` | LINE Developers console, test OA channel | No | Yes | configured | Server-only. Do not record value in repo. |
| Preview / Staging | `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers console, test OA channel | No | Yes | configured | Server-only. Do not record value in repo. |
| Preview / Staging | `LINE_LOGIN_CHANNEL_ID` | LINE Login / LIFF channel | No | No | optional | Used for server-side ID token verification when not derivable from `NEXT_PUBLIC_LINE_LIFF_ID`. |
| Preview / Staging | `NEXT_PUBLIC_LINE_LIFF_ID` | Staging LIFF app | Yes | No | configured | Live unlock response returned staging LIFF ID after 2026-05-21 env sync. |
| Preview / Staging | `NEXT_PUBLIC_LINE_LIFF_URL` | Staging LIFF app | Yes | No | configured | Live unlock response returned staging LIFF URL after 2026-05-21 env sync. |
| Preview / Staging | `NEXT_PUBLIC_LINE_ADD_URL` | Test OA add-friend URL | Yes | No | configured | Live unlock response returned test OA add-friend URL after 2026-05-21 env sync. |
| Production | `LINE_CHANNEL_SECRET` | LINE Developers console, production OA channel | No | Yes | configured | Server-only. Do not record value in repo. |
| Production | `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers console, production OA channel | No | Yes | configured | Server-only. Do not record value in repo. |
| Production | `LINE_LOGIN_CHANNEL_ID` | LINE Login / LIFF channel | No | No | optional | Used for server-side ID token verification when not derivable from `NEXT_PUBLIC_LINE_LIFF_ID`. |
| Production | `NEXT_PUBLIC_LINE_LIFF_ID` | Production LIFF app | Yes | No | configured | Live production unlock response returned production LIFF ID after 2026-05-25 production activation. |
| Production | `NEXT_PUBLIC_LINE_LIFF_URL` | Production LIFF app | Yes | No | configured | Live production unlock response returned production LIFF URL after 2026-05-25 production activation. |
| Production | `NEXT_PUBLIC_LINE_ADD_URL` | Production OA add-friend URL | Yes | No | configured | Live production unlock response returned real production OA URL after 2026-05-25 production activation. |

## Implementation Rules

Implementation must read config only from env:

- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_LOGIN_CHANNEL_ID` optional
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `NEXT_PUBLIC_LINE_LIFF_URL`
- `NEXT_PUBLIC_LINE_ADD_URL`

Do not hard-code staging or production URLs in implementation code except route defaults or documentation.

Vercel Preview env must point to the test OA and staging LIFF.

Vercel Production env must point to the production OA and production LIFF.

Canonical LIFF Console endpoints:

- Preview / Staging: `https://staging.anyu.tw/line/fulfill`
- Production: `https://anyu.tw/line/fulfill`

The global bridge is module-agnostic. Generated LIFF URLs must include `moduleSlug` and fulfillment context so future modules can share the same LIFF app and LINE Console endpoint.

LIFF bind implementation must verify LINE ID tokens server-side and bind only the verified LINE subject. Webhook implementation must use database-backed event dedupe and invalid-code rate guard tables from `apps/web/drizzle/0004_line_webhook_hardening.sql`.

## Review Checklist

- [x] Preview / Staging env status is live-verified against test OA assets.
- [x] Production env status is recorded as configured from operator-provided setup context.
- [x] Preview / Staging env points only to test OA assets.
- [x] Production env points only to production OA assets.
- [ ] Server-only secrets are not exposed through `NEXT_PUBLIC_` variables.
- [ ] No secret values are committed to repo documentation.
- [ ] Implementation code does not hard-code environment-specific LINE URLs.
- [x] Live staging `/api/unlock-intent` response returns staging LIFF URL and test OA add-friend URL.
- [ ] LINE Console LIFF endpoints are updated to the canonical global bridge routes for staging and production.
