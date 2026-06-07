# Module 01 Smoke Fixture Fresh Result Contract v0

## Metadata

- task name: Module 01 Smoke Fixture Fresh Result Contract v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-module-01-smoke-fixture-fresh-result-contract-v0.md`
- commit: not committed at report creation
- branch / push status: not pushed at report creation
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T09:06:19Z
- taskCompletedAt: 2026-06-07T09:11:01Z
- totalWallClockDuration: 4m42s
- humanWaitDuration: 0m
- netCodexWorkDuration: 4m42s

## Context

- why this task exists: Controlled Production Payment Smoke Retry with Scoped Runtime Config v1 stopped before Email/LINE/payment because the tracked smoke fixture returned `cacheHit=true` and reused prior production result `800c88fa-04de-4172-b34a-3bc78cd4d0fa`.
- upstream blocker / mainline context: production smoke cannot continue unless fixture-based result creation is fresh by contract, without ad hoc request bodies.
- out-of-scope items: production runtime, production payment, Email/LINE sends, Vercel env changes, DB mutation, theme UI, and Module 02.

## Scope

- what changed: Module 01 fixture helpers, smoke fixture script, fixture/cache tests, and process docs.
- what did not change: runtime payment behavior, production config, provider/channel behavior, DB schema, deployed routes, and theme route.

## Cache Behavior Findings

- analyze cache key is built by `buildAnalyzeCacheKey`.
- cache-relevant fields:
  - module slug
  - normalized redacted text
  - situation
  - userContext values
  - prompt version
  - schema version
  - model strategy
  - provider
  - primary model
- `anonymousSessionId` is not part of the analyze cache key.
- The previous smoke reused the result because fixture text/context were identical and the production cache key matched the prior result.
- Minimal safe field change for a guaranteed cache miss: append a controlled neutral marker to the fixture text. Changing anonymous session alone is not sufficient.

## Fresh Fixture Contract

- added `createModule01SmokeRunId()`
- added `createModule01SmokeRunMarker(smokeRunId)`
- added `createFreshModule01SmokeAnalyzeText({ smokeRunId })`
- added `createFreshModule01SmokeAnalyzeRequest({ smokeRunId })`
- updated script helper default output to include a generated `smokeRunId`
- updated `.qa/module01-valid-analyze-request.json` generation to include a neutral marker:
  - format: `【系統測試批次：module01-smoke-YYYYMMDDTHHMMSSZ-xxxxxxxx】`
- updated generated anonymous session ID to derive from `smokeRunId`
- kept structure deterministic and tracked while making each smoke artifact fresh.

The marker is neutral, non-private, not token-like, and intentionally cache-relevant. It does not introduce free-form story text.

## Smoke Fixture Command Result

- command: `cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json`
- result: pass
- summary fields:
  - `smokeRunIdPresent=true`
  - `freshDimensionPresent=true`
  - `expectedFreshResult=true`
  - `validationStatus=pass`
  - `containsPrivateData=false`
  - `containsTokenizedUrl=false`
  - `requestTextPrinted=false`
- generated request artifact: `.qa/module01-valid-analyze-request.json`
- generated summary artifact: `.qa/module01-smoke-fixture-summary.json`

## Process Docs Update

- updated `ai-collaboration/process/production-gate-policy.md`
- updated `ai-collaboration/process/qa-validation-policy.md`
- production smoke now must:
  - require `smokeRunIdPresent=true`
  - require `freshDimensionPresent=true`
  - require `expectedFreshResult=true`
  - assert production result creation returns `cacheHit=false`
  - stop with `result_creation_failed / tracked_fixture_cache_hit_reused_previous_result` if `cacheHit=true`
  - rerun `qa:module01:smoke-fixture` instead of inventing a new request body

## Implementation Summary

- files / areas changed:
  - `apps/web/src/tests/fixtures/module01/analyze-inputs.ts`
  - `apps/web/scripts/lib/module01-smoke-fixture.mjs`
  - `apps/web/src/tests/module01-fixtures.test.ts`
  - `apps/web/src/tests/module01-smoke-fixture.test.ts`
  - `ai-collaboration/process/production-gate-policy.md`
  - `ai-collaboration/process/qa-validation-policy.md`
- key design decisions:
  - Text marker is used because text is cache-relevant and anonymous session is not.
  - Suffix is additive to the fresh marker, so optional QA suffixes cannot accidentally remove freshness.
  - Default smoke fixture output is fresh because production smoke requires fresh result identity.
- local / opportunistic cleanup decisions: none beyond directly related fixture contract hardening.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm exec vitest run src/tests/module01-fixtures.test.ts src/tests/module01-smoke-fixture.test.ts src/tests/result-cache.test.ts`: pass, 3 files / 16 tests
  - `cd apps/web && corepack pnpm lint`: pass
  - `cd apps/web && corepack pnpm test`: pass, 97 files / 666 tests
  - `cd apps/web && corepack pnpm build`: pass
  - `cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json`: pass
  - `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass
  - `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 tests
  - `cd apps/web && corepack pnpm run qa:module01:local`: pass, gateStatus `pass`
  - report presence check: pass
  - dashboard HTML sanity: pass
  - targeted private/token scan for new report/dashboard/fixture helpers: pass
  - `git diff --check`: pass
- gateStatus: pass
- commandExitCode: 0 for executed gates
- requiredChecksStatus: pass
- optionalChecksStatus: not_applicable
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why:
  - `qa:module01:staging`: skipped because no deployed behavior changed and no deployed validation is required for the local fixture contract.
  - `qa:module01:production-preflight`: skipped because production/preflight/runtime behavior did not change.
  - production runtime/payment and real Email/LINE: skipped by scope.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: no
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: smoke fixture fresh-result blocker resolved locally

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed: process still relies on the smoke runner checking `cacheHit=false` after result creation; this is now documented as a hard stop.
- opportunistic cleanup completed: suffix behavior is now additive to freshness, preventing accidental freshness removal.
- deferred cleanup candidates: consider adding a dedicated production-smoke result creation helper that validates `cacheHit=false` automatically before returning a result ID.

## Decisions Made

- Did not use production to test freshness.
- Did not delete or mutate DB rows to bypass cache.
- Did not invent new scenario text.
- Did not change the analyze route cache logic.

## Uncertainties / Blockers

- No local blocker remains.
- The next production smoke must still assert `cacheHit=false` after result creation before continuing.

## Recommended Next Step

Controlled Production Payment Smoke Retry with Scoped Runtime Config v2.

## Paste-Back Context

Module 01 smoke fixture now generates a fresh tracked request by default. The fresh dimension is a generated `smokeRunId` included in a neutral text marker and the anonymous session ID. Tests prove anonymousSessionId alone does not change the analyze cache key, while smokeRunId text marker does. `qa:module01:smoke-fixture -- --json` now reports `smokeRunIdPresent=true`, `freshDimensionPresent=true`, and `expectedFreshResult=true`. Local targeted tests, full tests, build, smoke-fixture, mock-flow, UI, and local gate passed. No production runtime, payment, Email, LINE, Vercel env change, DB mutation, or secret exposure occurred.
