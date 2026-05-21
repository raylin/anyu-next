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
| Preview / Staging | `NEXT_PUBLIC_LINE_LIFF_ID` | Staging LIFF app | Yes | No | configured | Public client config for staging LIFF. |
| Preview / Staging | `NEXT_PUBLIC_LINE_LIFF_URL` | Staging LIFF app | Yes | No | configured | Should target staging LIFF URL. |
| Preview / Staging | `NEXT_PUBLIC_LINE_ADD_URL` | Test OA add-friend URL | Yes | No | configured | Should target test OA, not production OA. |
| Production | `LINE_CHANNEL_SECRET` | LINE Developers console, production OA channel | No | Yes | configured | Server-only. Do not record value in repo. |
| Production | `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers console, production OA channel | No | Yes | configured | Server-only. Do not record value in repo. |
| Production | `NEXT_PUBLIC_LINE_LIFF_ID` | Production LIFF app | Yes | No | configured | Public client config for production LIFF. |
| Production | `NEXT_PUBLIC_LINE_LIFF_URL` | Production LIFF app | Yes | No | configured | Should target production LIFF URL. |
| Production | `NEXT_PUBLIC_LINE_ADD_URL` | Production OA add-friend URL | Yes | No | configured | Should target real production OA. |

## Implementation Rules

Implementation must read config only from env:

- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `NEXT_PUBLIC_LINE_LIFF_ID`
- `NEXT_PUBLIC_LINE_LIFF_URL`
- `NEXT_PUBLIC_LINE_ADD_URL`

Do not hard-code staging or production URLs in implementation code except route defaults or documentation.

Vercel Preview env must point to the test OA and staging LIFF.

Vercel Production env must point to the production OA and production LIFF.

## Review Checklist

- [x] Preview / Staging env status is recorded as configured from operator-provided setup context.
- [x] Production env status is recorded as configured from operator-provided setup context.
- [ ] Preview / Staging env points only to test OA assets.
- [ ] Production env points only to production OA assets.
- [ ] Server-only secrets are not exposed through `NEXT_PUBLIC_` variables.
- [ ] No secret values are committed to repo documentation.
- [ ] Implementation code does not hard-code environment-specific LINE URLs.
