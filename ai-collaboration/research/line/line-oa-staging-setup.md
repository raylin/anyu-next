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
| Webhook verification status | working in manual staging smoke |
| Add friend option / linked bot | working in manual staging smoke |

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
| `LINE_LOGIN_CHANNEL_ID` | optional | Server-side ID token verification derives the channel ID from LIFF ID if this is not set. |
| `NEXT_PUBLIC_LINE_LIFF_ID` | configured | Public env. Live unlock response returned staging LIFF ID `2010157793-Q4JeeYv0` after 2026-05-21 env sync. |
| `NEXT_PUBLIC_LINE_LIFF_URL` | configured | Public env. Live unlock response returned the staging LIFF URL after 2026-05-21 env sync. |
| `NEXT_PUBLIC_LINE_ADD_URL` | configured | Public env. Live unlock response returned the test OA add-friend URL after 2026-05-21 env sync. |

## Implementation Notes

- LIFF primary path should use `NEXT_PUBLIC_LINE_LIFF_URL` and never hard-code this LIFF ID in app code.
- LIFF bind must verify a LINE ID token server-side and bind only the verified LINE subject.
- LINE webhook must verify signatures with `LINE_CHANNEL_SECRET`.
- LINE webhook uses database-backed dedupe and invalid-code rate guard tables from `0004_line_webhook_hardening.sql`.
- Short-code fallback should reply with an unlocked result link only after code match.
- Keep this record free of channel secret and access token values.
- 2026-05-21 staging smoke initially found a live env mismatch; the public Vercel Preview env was synced and redeployed, and `/api/unlock-intent` now returns the staging LIFF URL and test OA add-friend URL.
- 2026-05-21 real staging smoke verified route-level LINE fulfillment behavior on staging.
- 2026-05-21 manual staging/test OA short-code smoke passed. Record only sanitized pass status; do not store LINE user IDs, codes, tokens, tokenized URLs, raw input, or private message content.
- 2026-05-24 hardening smoke verified staging serves the hardened LIFF bind route, rejects client-only user IDs, rejects invalid ID tokens, preserves staging/test OA public env, and keeps event metadata safe.

## Smoke Checklist

- [x] Webhook URL configured in LINE console.
- [x] Webhook verification passes in manual staging smoke.
- [ ] LIFF endpoint opens on mobile.
- [ ] LIFF endpoint opens from LINE in-app browser.
- [x] Desktop fallback / short-code flow works through the staging/test OA.
- [x] Test OA add-friend URL is not confused with production OA.
- [x] No secret values are documented in repo files.
- [x] Live `/api/unlock-intent` response returns staging LIFF URL and test OA add-friend URL.

## Change Log

| Date | Change | Operator |
|---|---|---|
| 2026-05-21 | Created setup record template. | Codex |
| 2026-05-21 | Recorded staging smoke env mismatch for public LIFF/add URL runtime config. | Codex |
| 2026-05-21 | Synced Vercel Preview public LINE env and verified live staging unlock response. | Codex |
| 2026-05-21 | Verified staging LIFF bind, unlocked route, invalid-signature webhook handling, and event privacy. | Codex |
| 2026-05-21 | Recorded sanitized manual staging/test OA short-code smoke pass; production was not touched. | Codex |
| 2026-05-21 | Applied staging webhook hardening migration and documented ID-token verification requirement. | Codex |
| 2026-05-24 | Recorded hardened staging route smoke pass for public env, missing/invalid LIFF ID token rejection, invalid webhook signature, unlocked route, and event privacy. | Codex |
