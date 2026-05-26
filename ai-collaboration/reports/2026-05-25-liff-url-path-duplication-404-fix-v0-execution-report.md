# LIFF URL Path Duplication 404 Fix v0 Execution Report

## Completed Work

- Saved the task handoff under `ai-collaboration/handoffs/`.
- Updated LIFF URL generation so `liff.line.me` URLs keep only the LIFF ID path and carry fulfillment context as query params.
- Added defensive normalization for stale LIFF base env values that include route suffixes.
- Added optional debug propagation from the result page into `/api/unlock-intent` and generated LIFF query context.
- Updated LINE fulfillment tests for base-only LIFF URLs, route-path stripping, debug propagation, direct query parsing, and `liff.state` parsing.
- Refreshed staging alias to a preview deployment containing the fix.

## Root Cause

The generated LIFF URL appended `/line/fulfill` after the LIFF ID. Because LINE Console already points the LIFF app to the global app endpoint, the extra LIFF URL path could become a malformed Next.js path in the real LINE runtime, causing a generic 404 before the bridge or diagnostic panel rendered.

## Before / After

Before:

```text
https://liff.line.me/{LIFF_ID}/line/fulfill?<context>
```

After:

```text
https://liff.line.me/{LIFF_ID}?<context>
```

## Staging Verification

- Staging preview deployment: `anyu-next-7cz7kxcfn-studioanyu-1488s-projects.vercel.app`
- Staging alias: `https://staging.anyu.tw`
- `/line/fulfill?debug=1`: HTTP 200, diagnostic panel rendered, homepage marker absent.
- Live unlock-intent LIFF URL shape:
  - host: `liff.line.me`
  - path shape: `/{LIFF_ID}`
  - query keys: `code`, `debug`, `moduleSlug`, `unlockIntentId`, `unlockToken`
  - no `/line/fulfill` path after LIFF ID
  - no `/m/` path after LIFF ID
  - `debug=1` carried through query context

## Validation

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed: 25 tests.
- `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build` passed: 27 web test files, 147 tests, build passed.
- Targeted `cd apps/web && corepack pnpm test -- line-fulfillment` passed.
- `cd apps/web && corepack pnpm test:e2e:local` build step passed, but Chromium launch failed with the known macOS MachPort permission error before page load.

## Safety Notes

- No production deployment was run.
- No LINE secrets, provider secrets, raw inputs, provider outputs, paid result JSON, LINE user IDs, short-code values, token values, or tokenized URLs were recorded.
- Staging shape checks reported only host, path shape, query-key names, and booleans.

## Tech Debt Review

- New technical debt introduced: none beyond retaining temporary LIFF diagnostic mode from the prior diagnostic task.
- Existing technical debt observed: real mobile LINE runtime still requires manual verification outside route-level tests.
- Opportunistic cleanup completed: LIFF URL builder now defensively normalizes stale LIFF base URLs.
- Deferred cleanup candidates: remove temporary LIFF diagnostic mode after mobile verification passes.

## Suggested Next Steps

- Run real mobile staging LIFF smoke from a fresh result page with `debug=1`.
- If 404 persists, capture only the rendered sanitized diagnostic panel.
