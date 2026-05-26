# LIFF Fulfillment Redirect Context Fix v0 Execution Report

## Completed Work

- Saved the handoff under `ai-collaboration/handoffs/`.
- Investigated staging LINE setup docs, LIFF URL generation, bridge page parsing, and bind API response behavior.
- Updated LIFF URL generation to include module fulfillment route context for `liff.line.me` URLs.
- Added LIFF bridge context parsing for both direct query parameters and `liff.state`.
- Kept missing-context behavior as safe short-code fallback instead of homepage redirect.
- Added and updated tests for LIFF URL/context and bind response redirect target.
- Refreshed the staging alias to a preview deployment containing the fix.
- Ran route-level staging smoke without recording raw tokens, short codes, LINE IDs, raw input, provider output, paid result JSON, or secrets.

## Root Cause

The LIFF bridge only read direct query parameters. LINE LIFF redirect/login flows can provide the original URL context through `liff.state`, so unlock context could be lost in mobile LIFF. The LIFF URL also did not explicitly include the module fulfillment route as secondary redirect path context.

## Fix Applied

- `buildLineLiffUrl` now appends `/m/<moduleSlug>/line/fulfill` to `liff.line.me/<liffId>` when a module slug is available.
- `getPublicLineConfig` now accepts the module slug from unlock intent creation.
- The LIFF fulfillment page uses a parser that reads:
  - direct `unlockIntentId`, `unlockToken`, and `code` query params
  - `liff.state` containing either query-only or path-plus-query state
- The bind route continues to return `/m/<moduleSlug>/unlock/<token>` as the success target.

## Architecture Decisions

- Keep the fix limited to LIFF context generation/parsing and bind redirect behavior.
- Do not change provider generation, paid-result schema, webhook delivery, payment, email, ads, or production deployment.
- Treat real mobile LINE ID-token verification as a manual smoke step because shell route tests cannot generate a real LINE ID token.

## Staging Route-Level Result

- Staging alias refreshed to preview deployment containing this fix.
- Synthetic staging analyze returned HTTP 200.
- Staging unlock intent returned HTTP 200.
- Sanitized generated LIFF URL:
  - host: `liff.line.me`
  - path includes `/m/ambiguous-temperature/line/fulfill`
  - required context params present: `unlockIntentId`, `unlockToken`, `code`
- Direct fulfillment route check returned HTTP 200 and rendered the LINE fulfillment page.
- `liff.state` fulfillment route check returned HTTP 200 and rendered the LINE fulfillment page.
- Homepage marker was not detected in either route-level fulfillment check.

## Validation

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed: 25 tests.
- `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build` passed: 27 web test files, 136 tests.
- `cd apps/web && corepack pnpm test:e2e:local` initially failed because sandbox denied binding `0.0.0.0:3001`; rerun with port-binding escalation passed: 9 Playwright tests.
- Targeted `cd apps/web && corepack pnpm test -- line-fulfillment line-route-hardening` passed.

## Blockers

- None for code and route-level staging verification.

## Uncertainties

- Real mobile LINE/LIFF smoke still requires human/operator verification because shell cannot produce a real LINE ID token or complete the LINE app auth flow.
- If the LINE Console endpoint differs from the setup record, the console config should be corrected to `https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill`.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: LIFF behavior still depends on LINE Console endpoint correctness; docs now call out the expected endpoint.
- Opportunistic cleanup completed: extracted LIFF context parsing into a focused helper with tests.
- Deferred cleanup candidates: add a browser-level component test for the LIFF bridge if the app test stack gains a lightweight way to mock the LIFF SDK.

## Suggested Next Steps

- Run the real mobile staging LIFF smoke from the test LINE OA.
- Record only sanitized pass/fail status and do not store LINE user IDs, unlock tokens, short codes, or tokenized URLs.
- Keep production untouched until staging mobile LIFF smoke passes and a separate production launch/deploy decision is approved.
