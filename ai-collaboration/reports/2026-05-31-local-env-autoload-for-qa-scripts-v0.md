# Local Env Autoload for QA Scripts v0

Date: 2026-05-31

## Summary

Added a script-only local env loader so QA scripts can read `apps/web/.env.local` when the required names are not already exported in the shell. This reduces repeated local QA friction without changing Next.js app runtime behavior, Vercel env, production flags, or payment behavior.

## Completed Work

- Added `apps/web/scripts/lib/load-local-env.mjs`.
- Applied the loader to:
  - `apps/web/scripts/qa-env-preflight.mjs`
  - `apps/web/scripts/authorized-fake-paid-qa.mjs`
  - `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs`
- Added regression tests for local env parsing, exported-env precedence, and repo-root web app directory discovery.
- Updated `apps/web/.env.example` comments with local QA autoload behavior.
- Updated the dashboard QA tooling section.

## Local Env Loader Behavior

- Default file: `apps/web/.env.local`.
- Run location support: works when scripts are launched from `apps/web` or the repository root shape.
- Missing `.env.local`: tolerated; scripts keep existing safe blocked behavior.
- Precedence: exported shell env wins over `.env.local`.
- Scope: script-only import; no app runtime code imports the loader.

## Redaction Guarantees

The loader and updated scripts do not print:

- env values
- value lengths
- prefixes
- suffixes
- hashes
- checksums
- provider payloads
- raw tokens
- tokenized URLs

`qa:env:preflight` continues to print env name presence only.

## Dry Run Results

- `cd apps/web && corepack pnpm run qa:env:preflight -- fake_paid`: `.env.local` was present and loaded without printing values; run blocked because `INTERNAL_JOB_SECRET` was still missing in the effective local env.
- `node apps/web/scripts/qa-env-preflight.mjs sandbox_checkout` from repo root: `.env.local` was found and loaded without printing values; sandbox checkout readiness passed by env-name presence.
- `env -i ... node apps/web/scripts/qa-env-preflight.mjs fake_paid` from `/private/tmp`: blocked safely with `.env.local` absent and both fake-paid secrets missing.
- `env -i ... node apps/web/scripts/newebpay-sandbox-e2e-helper.mjs create-checkout` from `/private/tmp`: blocked safely before checkout creation because `OPERATOR_TEST_SECRET` was missing.
- `env -i ... node apps/web/scripts/authorized-fake-paid-qa.mjs` from `/private/tmp`: blocked safely before authorized fake-paid mutation because `OPERATOR_TEST_SECRET` was missing; staging gate checks remained controlled.

## Architecture Decisions

- Did not add `dotenv` dependency; the helper only needs simple local script parsing.
- Did not override exported env values. This preserves explicit shell overrides for one-off QA and avoids surprising operators.
- Did not add `.env.qa.local` loading in v0 to keep precedence simple. It can be added later if a clear convention emerges.

## Validation

- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test -- src/tests/qa-local-env-loader.test.ts`: passed, 59 files / 373 tests
- `cd apps/web && corepack pnpm test`: passed, 59 files / 373 tests
- `cd apps/web && corepack pnpm build`: passed

## Blockers

None.

## Uncertainties

- Local `.env.local` currently made `OPERATOR_TEST_SECRET` present for fake-paid preflight, but `INTERNAL_JOB_SECRET` remained missing. Manual fallback QA still needs that local value or an intentional queue-mode run.
- Local `origin/staging` tracking ref may remain stale due the existing git lock/permission issue even after a successful remote push.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: QA scripts still contain separate HTTP/request/redaction helpers; consolidation may be useful later but is not necessary for this task.
- Opportunistic cleanup completed: central local env loading replaces repeated manual shell export friction.
- Deferred cleanup candidates:
  - Optional `.env.qa.local` convention if multiple local QA profiles become necessary.
  - Shared QA HTTP/redaction helper if script duplication starts causing maintenance issues.

## Suggested Next Steps

1. Add `INTERNAL_JOB_SECRET` to the secure local env source if manual fallback QA should be runnable without shell exports.
2. Continue launch-readiness work while keeping production payment runtime disabled.
3. Consider a future Vercel Preview(staging) env name-only audit helper if branch-scoped env drift recurs.
