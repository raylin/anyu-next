# LINE OA Production Setup Record

Date created: 2026-05-21

Environment: Production

Purpose: production LINE OA and LIFF setup record for LINE fulfillment automation.

## Setup Owner Notes

- This file is a setup record template.
- Do not store secret values in this file.
- Secret fields must use status values only: `pending`, `configured`, or `unknown`.
- Vercel Production env should point to the real production OA and production LIFF app.

## OA Identity

| Field | Value |
|---|---|
| OA name | @403ttnun |
| Display name | 暗語 ANYU |
| Add-friend URL | https://lin.ee/oX0rbiTf |
| QR URL | <img src="https://qr-official.line.me/gs/M_403ttnun_GW.png?oat_content=qr"> |

## Messaging API

| Field | Value |
|---|---|
| Messaging API channel status | enabled |
| Webhook URL | `https://anyu.tw/api/line/webhook` |
| Webhook enabled status | enabled |
| Webhook verification status | pending |
| Add friend option / linked bot | pending |

## LIFF App

| Field | Value |
|---|---|
| LIFF app name | 暗語 ANYU |
| LIFF ID | 2009959232-LhxoYMDV |
| LIFF URL | https://liff.line.me/2009959232-LhxoYMDV |
| LIFF endpoint URL | `https://anyu.tw/m/ambiguous-temperature/line/fulfill` |
| LIFF size | full |
| LIFF scopes | openid, profile |
| Add friend option / linked bot | enabled |

## Vercel Production Env Status

| Variable | Status | Notes |
|---|---|---|
| `LINE_CHANNEL_SECRET` | configured | Server-only secret. Do not record value here. |
| `LINE_CHANNEL_ACCESS_TOKEN` | configured | Server-only secret. Do not record value here. |
| `LINE_LOGIN_CHANNEL_ID` | optional | Server-side ID token verification derives the channel ID from LIFF ID if this is not set. |
| `NEXT_PUBLIC_LINE_LIFF_ID` | configured | Public env. Should point to production LIFF app. |
| `NEXT_PUBLIC_LINE_LIFF_URL` | configured | Public env. Should point to production LIFF URL. |
| `NEXT_PUBLIC_LINE_ADD_URL` | configured | Public env. Should point to production OA add-friend URL. |

## Implementation Notes

- LIFF primary path should use `NEXT_PUBLIC_LINE_LIFF_URL` and never hard-code this LIFF ID in app code.
- LIFF bind must verify a LINE ID token server-side and bind only the verified LINE subject.
- LINE webhook must verify signatures with `LINE_CHANNEL_SECRET`.
- LINE webhook requires database-backed dedupe and invalid-code rate guard tables from `0004_line_webhook_hardening.sql`.
- Short-code fallback should reply with an unlocked result link only after code match.
- Keep this record free of channel secret and access token values.

## Smoke Checklist

- [ ] Production webhook URL configured in LINE console.
- [ ] Webhook verification passes.
- [ ] Production database has `0004_line_webhook_hardening.sql` applied after explicit approval.
- [ ] LIFF endpoint opens on mobile.
- [ ] LIFF endpoint opens from LINE in-app browser.
- [ ] Production OA add-friend URL is confirmed before launch.
- [ ] Production setup has been tested with one operator-owned LINE account.
- [ ] No secret values are documented in repo files.

## Change Log

| Date | Change | Operator |
|---|---|---|
| 2026-05-21 | Created setup record template. | Codex |
