# LIFF Post-bind Unlock Redirect 404 Fix v0 Execution Report

## Completed Work

- Saved the handoff under `ai-collaboration/handoffs/`.
- Inspected the LIFF bind success path, bridge redirect behavior, and unlocked route.
- Replaced environment-derived absolute bind redirect URL with a root-relative `unlockedPath`.
- Added strict client-side normalization so LIFF redirects only to `/m/{moduleSlug}/unlock/{unlockToken}`.
- Preserved compatibility for legacy `unlockedUrl` responses by normalizing them to same-origin path shape before navigation.
- Added tests for root-relative unlock path generation and bind response target.
- Refreshed staging alias to a preview deployment containing the fix.
- Ran sanitized staging route-level smoke for generated unlock route shape.

## Root Cause

The bind API constructed `unlockedUrl` with `getAppBaseUrl(request.url)`. In a LIFF/mobile redirect context, an absolute URL is more fragile than a same-origin root-relative path and can produce a malformed or wrong-host navigation. The bridge now receives `unlockedPath` and only navigates to a validated `/m/{moduleSlug}/unlock/{unlockToken}` path.

## Fix Applied

- Added `buildModuleUnlockPath({ moduleSlug, unlockToken })`.
- LIFF bind response now returns:

```json
{
  "ok": true,
  "unlockedPath": "/m/<moduleSlug>/unlock/<redacted>",
  "paidStatus": "<status>"
}
```

- The LIFF bridge now calls `window.location.assign(redirectTarget)` only after validating the target path shape.
- The final redirect path shape is:

```text
/m/ambiguous-temperature/unlock/<redacted>
```

## Tests Added / Updated

- `line-fulfillment.test.ts`: root-relative module unlock path generation.
- `line-route-hardening.test.ts`: bind success returns `unlockedPath` and module mismatch still rejects before bind/generation.

## Staging Route-Level Result

- Staging alias refreshed to preview deployment `anyu-next-foz0lbuh9-studioanyu-1488s-projects.vercel.app`.
- Synthetic staging analyze returned HTTP 200.
- Unlock intent returned HTTP 200.
- Generated LIFF URL path remained `/2010157793-Q4JeeYv0/line/fulfill`.
- Generated LIFF URL carried `moduleSlug=ambiguous-temperature` and required context params.
- Expected bind redirect path shape: `/m/ambiguous-temperature/unlock/<redacted>`.
- Direct unlocked route for the generated token returned HTTP 200.
- Sanitized heading check showed the unlock page state rendered. The tokenized URL was not recorded.

## Validation

- `python3 -m compileall oradar` passed.
- `python3 -m compileall tools/topic-ingestion` passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` passed: 25 tests.
- `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build` passed: 27 web test files, 141 tests.
- Targeted `cd apps/web && corepack pnpm test -- line-fulfillment line-route-hardening` passed.
- `cd apps/web && corepack pnpm test:e2e:local` build step passed, but Chromium launch failed with the known macOS MachPort permission error before page load.

## Blockers

- Full real LIFF bind cannot be completed from shell because it requires a real LINE ID token from the mobile LINE client.
- Local Playwright browser launch is blocked in this harness by Chromium MachPort permission errors.

## Uncertainties

- Real mobile staging LIFF retest is still required to confirm the LINE client follows the new `unlockedPath` response.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: real LIFF validation depends on external LINE Console/client state.
- Opportunistic cleanup completed: centralized module unlock path generation and client redirect target validation.
- Deferred cleanup candidates: add a component-level bridge test if a lightweight React test renderer is introduced.

## Suggested Next Steps

- Run real mobile staging LIFF smoke again.
- Record only sanitized pass/fail status.
- Keep production untouched until staging mobile LIFF passes and a separate production decision is approved.
