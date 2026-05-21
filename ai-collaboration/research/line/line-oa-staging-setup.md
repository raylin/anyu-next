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
| OA name | pending |
| Display name | pending |
| Add-friend URL | pending |
| QR URL | pending |

## Messaging API

| Field | Value |
|---|---|
| Messaging API channel status | pending |
| Webhook URL | `https://staging.anyu.tw/api/line/webhook` |
| Webhook enabled status | pending |
| Webhook verification status | pending |
| Add friend option / linked bot | pending |

## LIFF App

| Field | Value |
|---|---|
| LIFF app name | pending |
| LIFF ID | pending |
| LIFF URL | pending |
| LIFF endpoint URL | `https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill` |
| LIFF size | pending |
| LIFF scopes | pending |
| Add friend option / linked bot | pending |

## Vercel Preview Env Status

| Variable | Status | Notes |
|---|---|---|
| `LINE_CHANNEL_SECRET` | pending | Server-only secret. Do not record value here. |
| `LINE_CHANNEL_ACCESS_TOKEN` | pending | Server-only secret. Do not record value here. |
| `NEXT_PUBLIC_LINE_LIFF_ID` | pending | Public env. Should point to staging LIFF app. |
| `NEXT_PUBLIC_LINE_LIFF_URL` | pending | Public env. Should point to staging LIFF URL. |
| `NEXT_PUBLIC_LINE_ADD_URL` | pending | Public env. Should point to test OA add-friend URL. |

## Smoke Checklist

- [ ] Webhook URL configured in LINE console.
- [ ] Webhook verification passes.
- [ ] LIFF endpoint opens on mobile.
- [ ] LIFF endpoint opens from LINE in-app browser.
- [ ] Desktop fallback path can display or use short-code flow after implementation.
- [ ] Test OA add-friend URL is not confused with production OA.
- [ ] No secret values are documented in repo files.

## Change Log

| Date | Change | Operator |
|---|---|---|
| 2026-05-21 | Created setup record template. | Codex |
