# Module 01 Theme Carryover Bridge + Accent Direction Fix v0 Handoff

## Task

Fix two remaining Module 01 visual/theme continuity issues:

1. Move the Theme B quote/insight card accent back to the left edge.
2. Apply the carried Module 01 theme on LINE/LIFF bridge and transition surfaces before users reach paid content.

## Scope

- Visual/theme continuity only.
- Do not change analyze behavior.
- Do not change paid generation behavior.
- Do not change LINE fulfillment logic except for reading and applying existing safe carried theme hints on bridge/transition surfaces.
- Do not change prompt/schema/cache/DB unless strictly necessary.
- Do not deploy production.
- Do not change payment/email/ads.

## Requirements

- Theme B quote-card accent should be a left-edge magenta strip and must not overlap text.
- `/line/fulfill` and `/m/[moduleSlug]/line/fulfill` should apply carried `themeVariant` / token-suffix theme hints.
- Theme resolution priority:
  1. explicit theme from query / LIFF context
  2. theme from unlock-token suffix or fulfillment context
  3. localStorage manual override
  4. A/B assignment
  5. default classic
- Bridge pages should not create a fresh A/B assignment when a safe theme hint exists.
- LIFF URL shape must remain `https://liff.line.me/{LIFF_ID}?<context>` with no appended bridge path after LIFF ID.
- Do not expose theme/debug wording or sensitive fulfillment values in visible UI.

## Validation Plan

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm test:e2e:local`

