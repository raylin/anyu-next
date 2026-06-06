# Module 01 Fixture + Smoke Prep Foundation v0

Date: 2026-06-07

## Model / Effort

- Model used: GPT-5 Codex
- Reasoning effort used: high
- taskStartedAt: `2026-06-06T16:03:33Z`
- taskCompletedAt: `2026-06-06T16:12:56Z`
- totalWallClockDuration: about 9 minutes
- humanWaitDuration: about 0 minutes
- netCodexWorkDuration: about 9 minutes

## Scope

Implemented a reusable Module 01 fixture and smoke-prep foundation. This task did not enable production runtime, run payment, send Email/LINE, mutate DB data, modify Vercel env, implement LINE/LIFF fixes, implement theme UI, or implement Module 02.

## Fixture Inventory Findings

Duplicated Module 01 analyze request bodies existed in active QA helpers:

| Location | Previous pattern | Action |
|---|---|---|
| `apps/web/scripts/result-checkout-no-card-qa.mjs` | local `SYNTHETIC_INPUT` plus duplicated context | migrated to shared fixture helper |
| `apps/web/scripts/authorized-fake-paid-qa.mjs` | local `SYNTHETIC_INPUT` plus duplicated context | migrated to shared fixture helper |
| `apps/web/scripts/recovery-link-smoke-qa.mjs` | local `SYNTHETIC_INPUT` plus duplicated context | migrated to shared fixture helper |
| `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs` | local `SANDBOX_INPUT` plus duplicated context | migrated to shared fixture helper |
| `apps/web/src/tests/ai-temperature-ui.test.ts` | inline validation examples | left as focused validator examples |
| `apps/web/e2e/module-01-smoke.spec.ts` | inline UI input text | left as UI smoke input; lower priority than production-smoke path |
| Historical reports/handoffs | older ad hoc curl/body examples | unchanged by policy |

## Fixture Directory Created

Created:

- `apps/web/src/tests/fixtures/module01/valid-analyze-request.json`
- `apps/web/src/tests/fixtures/module01/analyze-inputs.ts`
- `apps/web/src/tests/fixtures/module01/checkout-contexts.ts`
- `apps/web/src/tests/fixtures/module01/line-liff-contexts.ts`
- `apps/web/src/tests/fixtures/module01/access-link-states.ts`
- `apps/web/src/tests/fixtures/module01/admin-lookup-responses.ts`
- `apps/web/src/tests/fixtures/module01/payment-contexts.ts`
- `apps/web/src/tests/fixtures/module01/index.ts`

Shared fixture names:

- `module01_valid_smoke_analyze_request_v0`
- `createValidModule01AnalyzeRequest()`
- `createValidModule01AnalyzeText()`
- `createValidModule01AnonymousSessionId()`
- `MODULE01_CHECKOUT_HARNESS_STATES`
- `MODULE01_LINE_LIFF_FIXTURES`
- `MODULE01_ACCESS_LINK_STATES`
- `createModule01AdminReadySummaryFixture()`
- `createModule01AdminPartialLineBindSummaryFixture()`
- `MODULE01_PAYMENT_CONTEXT`

The canonical analyze fixture is generic fictional content, passes the current 80 visible-character minimum, uses current Module 01 situation/context chip values, and contains no private owner/user story.

## Smoke Prep Helper

Added command:

```bash
cd apps/web && corepack pnpm run qa:module01:smoke-fixture
```

Added implementation:

- `apps/web/scripts/lib/module01-smoke-fixture.mjs`
- `apps/web/scripts/module01-smoke-fixture.mjs`

Command result:

- status: pass
- output request artifact: `apps/web/.qa/module01-valid-analyze-request.json`
- output summary artifact: `apps/web/.qa/module01-smoke-fixture-summary.json`
- `requestTextPrinted=false`
- `containsPrivateData=false`
- `containsTokenizedUrl=false`
- `sendsRealEmail=false`
- `sendsRealLine=false`
- `mutatesData=false`
- `productionTouched=false`

The request artifact contains the generic fixture text by design for controlled smoke prep. The command output and summary avoid printing raw fixture text, tokenized URLs, provider payloads, or private values.

## Scripts / Tests Migrated

Updated active QA helpers to use `createModule01AnalyzeRequest()`:

- `qa:result-checkout:no-card`
- `qa:fake-paid`
- `qa:access-link:smoke`
- `qa:newebpay:sandbox`

Updated `qa:module01:mock-flow` summary to record:

- `fixtureName=module01_valid_smoke_analyze_request_v0`
- `fixtureSource=src/tests/fixtures/module01/valid-analyze-request.json`

Added/updated tests:

- `apps/web/src/tests/module01-fixtures.test.ts`
- `apps/web/src/tests/module01-smoke-fixture.test.ts`
- `apps/web/src/tests/result-checkout-no-card-qa.test.ts`
- `apps/web/src/tests/module01-mock-flow-qa.test.ts`

## Production Smoke Policy Update

Updated:

- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`

New rule:

- Production smoke must run `qa:module01:smoke-fixture` before runtime enablement.
- Production smoke must use the tracked fixture artifact or shared fixture helper.
- Codex must not dynamically invent analyze request bodies during a production runtime window.
- If fixture prep fails, stop and classify `production_smoke_fixture_unprepared`.

## Opportunistic Cleanup

Completed directly related cleanup:

- Removed duplicated active synthetic analyze text/context from four QA helpers.
- Centralized smoke-prep request construction in a single script helper that can be consumed by Node QA scripts.

No unrelated cleanup or runtime refactor was performed.

## Validation

Run:

| Command | Result |
|---|---|
| `cd apps/web && corepack pnpm exec vitest run src/tests/module01-fixtures.test.ts src/tests/module01-smoke-fixture.test.ts src/tests/result-checkout-no-card-qa.test.ts src/tests/module01-mock-flow-qa.test.ts` | pass, 4 files / 17 tests |
| `cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json` | pass |
| `cd apps/web && corepack pnpm lint` | pass |
| `cd apps/web && corepack pnpm test` | pass, 88 files / 615 tests |
| `cd apps/web && corepack pnpm build` | pass |
| `cd apps/web && corepack pnpm run qa:module01:mock-flow` | pass |
| `cd apps/web && corepack pnpm run qa:module01:ui` | pass |
| `cd apps/web && corepack pnpm run qa:module01:local` | pass |

Skipped:

- `qa:module01:staging`: skipped because this task changed local fixtures, local QA scripts, and process docs only. No deployed runtime behavior changed.
- `qa:module01:production-preflight`: skipped because this task did not change production env, Vercel guard, production preflight, runtime flags, or fail-closed behavior.
- `qa:module01:staging:channels`: not run; real Email/LINE is owner-approved only.

## Remaining Fixture / Test Foundation Debt

- `apps/web/e2e/module-01-smoke.spec.ts` still has inline UI input text; lower risk, but should later import a fixture-derived text if Playwright config supports it cleanly.
- `ai-temperature-ui.test.ts` still keeps inline validator examples; acceptable because those tests intentionally cover validation behavior.
- The smoke fixture is not yet wired into a production-runtime-window helper because controlled smoke automation is intentionally deferred.
- The next mainline task should build the LINE/LIFF bind diagnostic harness, using these fixtures where useful.

## Theme Route Preservation

Theme Architecture remains archived and preserved. This fixture foundation does not implement theme UI and does not change the Module 01 Riso-only future implementation track.

## Final Status

Module 01 Fixture + Smoke Prep Foundation v0 is complete. Future production smoke prep has a tracked, validated request artifact and a gateable command, removing the prior need for ad hoc curl bodies during runtime enablement.

Recommended next task: **LINE / LIFF Bind Diagnostic Harness v0**.
