# LINE OA Staging Setup Record

Date created: 2026-05-21

Environment: Preview / Staging

Purpose: test LINE OA and LIFF setup for LINE fulfillment automation before production rollout.

## Setup Owner Notes

- This file is a setup record template.
- Do not store secret values in this file.
- Secret fields must use status values only: `pending`, `configured`, or `unknown`.
- Vercel Preview env should point to the test OA and staging LIFF app.

## OA Identity

| Field | Value |
|---|---|
| OA name | @558avbes |
| Display name | 暗語 ANYU Test |
| Add-friend URL | https://lin.ee/5uL4e9q |
| QR URL | <img src="https://qr-official.line.me/gs/M_558avbes_GW.png?oat_content=qr"> |

## Messaging API

| Field | Value |
|---|---|
| Messaging API channel status | enabled |
| Webhook URL | `https://staging.anyu.tw/api/line/webhook` |
| Webhook enabled status | saved |
| Webhook verification status | pending |
| Add friend option / linked bot | pending |

## LIFF App

| Field | Value |
|---|---|
| LIFF app name | 暗語 ANYU - Staging |
| LIFF ID | 2010157793-Q4JeeYv0 |
| LIFF URL | https://liff.line.me/2010157793-Q4JeeYv0 |
| LIFF endpoint URL | `https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill` |
| LIFF size | full |
| LIFF scopes | email, profile |
| Add friend option / linked bot | enabled |

## Vercel Preview Env Status

| Variable | Status | Notes |
|---|---|---|
| `LINE_CHANNEL_SECRET` | configured | Server-only secret. Do not record value here. |
| `LINE_CHANNEL_ACCESS_TOKEN` | configured | Server-only secret. Do not record value here. |
| `NEXT_PUBLIC_LINE_LIFF_ID` | unknown | Public env. Setup record has staging LIFF details, but live unlock response returned no LIFF URL on 2026-05-21 smoke. |
| `NEXT_PUBLIC_LINE_LIFF_URL` | unknown | Public env. Live unlock response returned `liffUrl: null` on 2026-05-21 smoke. |
| `NEXT_PUBLIC_LINE_ADD_URL` | mismatch | Public env. Live unlock response returned the old production OA add-friend URL instead of the test OA URL on 2026-05-21 smoke. |

## Implementation Notes

- LIFF primary path should use `NEXT_PUBLIC_LINE_LIFF_URL` and never hard-code this LIFF ID in app code.
- LINE webhook must verify signatures with `LINE_CHANNEL_SECRET`.
- Short-code fallback should reply with an unlocked result link only after code match.
- Keep this record free of channel secret and access token values.
- 2026-05-21 staging smoke found a live env mismatch: `/api/unlock-intent` returned `liffUrl: null` and the old production OA add-friend URL. Recheck Vercel Preview env and redeploy staging before real test-OA smoke.

## Smoke Checklist

- [ ] Webhook URL configured in LINE console.
- [ ] Webhook verification passes.
- [ ] LIFF endpoint opens on mobile.
- [ ] LIFF endpoint opens from LINE in-app browser.
- [ ] Desktop fallback path can display or use short-code flow after implementation.
- [ ] Test OA add-friend URL is not confused with production OA.
- [ ] No secret values are documented in repo files.
- [ ] Live `/api/unlock-intent` response returns staging LIFF URL and test OA add-friend URL.

## Change Log

| Date | Change | Operator |
|---|---|---|
| 2026-05-21 | Created setup record template. | Codex |
| 2026-05-21 | Recorded staging smoke env mismatch for public LIFF/add URL runtime config. | Codex |
