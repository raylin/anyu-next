# Handoff: LINE Webhook Verification Empty Events Fix v0

Date: 2026-05-25

## Objective

Fix LINE Console webhook URL verification for `https://anyu.tw/api/line/webhook`.

## Context

LINE Console verification can send a POST body with an empty events array:

```json
{
  "destination": "test",
  "events": []
}
```

The hardened webhook route must allow this verification ping to return HTTP 200 without requiring `X-Line-Signature`, while continuing to require valid signatures for all non-empty webhook event deliveries.

## Scope

- Modify only `/api/line/webhook` route behavior and related tests.
- Do not change LIFF bind.
- Do not change paid result.
- Do not change LINE env.
- Do not change prompt/schema/cache.
- Do not run production smoke before the fix is deployed.

## Expected Behavior

- Empty `events: []` request returns HTTP 200 without signature.
- Empty `events: []` request does not process events, write fulfillment events, or record raw body.
- Non-empty events without signature reject.
- Non-empty events with invalid signature reject.
- Existing duplicate/idempotency/rate guard behavior remains valid.

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

## Commit / Deploy

- Commit: `fix: allow line webhook verification ping`
- Push: `git push origin HEAD:staging`
- Deploy production after the fix commit.
