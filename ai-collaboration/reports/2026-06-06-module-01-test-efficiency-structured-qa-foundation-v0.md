# Module 01 Test Efficiency + Structured QA Foundation v0

Date: 2026-06-06

## Model / Effort

- Model: Codex
- Effort: high

## Completed Work

- Added a structured staging known-result artifact from `qa:result-checkout:no-card`.
- Updated `qa:module01:staging` so Admin API and Admin CLI checks can consume the suite-produced `.qa` artifact instead of requiring temp files or external snippets.
- Added `qa:module01:wait-result` for explicit Admin API status polling by staging result ID.
- Added `qa:module01:mock-flow` as a fast no-provider backend/access-link regression tier.
- Added `qa:module01:ui` as a fast Playwright checkout-start UI foundation.
- Added tests for helper summaries, known-result artifact resolution, command registration, and summary redaction.
- Updated the active dashboard with the validation tier policy and new QA commands.

No production runtime, production checkout, payment, Email, LINE, Vercel env, local env mirror, DB migration, theme UI, or Module 02 work was performed.

## Ad Hoc QA Pattern Audit

Active code findings:

| Pattern | Active location | Status |
| --- | --- | --- |
| Structured `spawnSync` orchestration | `apps/web/scripts/module01-release-validation-suite.mjs` | retained as committed suite runner |
| Structured `spawnSync` mock-flow wrapper | `apps/web/scripts/module01-mock-flow-qa.mjs` | added as reusable helper |
| `/private/tmp/anyu-newebpay-smoke` | `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs` | retained for explicit sandbox helper only, not normal Module 01 release validation |
| externally supplied known result ID env | `MODULE01_ADMIN_LOOKUP_RESULT_ID`, `QA_MODULE01_ADMIN_RESULT_ID` | retained as explicit override, no longer the only path |
| `.qa` staging artifact handoff | `apps/web/.qa/module01-staging-artifact.json` | added as normal suite-produced result ID handoff |

Historical-only findings:

- Older reports and handoffs contain `node <<'NODE'` snippets, `/private/tmp/anyu-*` paths, and one-off parsing/polling instructions.
- Those historical reports were not rewritten.
- Future Codex workflow should use committed helpers and `.qa` summaries instead of copying historical snippets.

## Replacements Added

### Structured Known-Result Artifact

`qa:result-checkout:no-card` now writes:

- `apps/web/.qa/module01-staging-artifact.json`

The artifact includes:

- module and environment category
- safe non-token result ID
- `resultIdSourceCategory=staging_runtime_no_card`
- tokenized URL presence flag

The suite summary does not print tokenized URLs or access tokens. Admin CLI command summaries redact the result ID in command strings.

### Structured Wait Helper

New command:

```bash
cd apps/web && corepack pnpm run qa:module01:wait-result -- --env staging --result-id <resultId> --json
```

Properties:

- accepts explicit inputs only
- uses `ADMIN_API_TOKEN` from current process env
- does not parse `apps/web/.env.staging`
- does not read random temp files
- writes `apps/web/.qa/module01-staging-result-wait-summary.json`
- emits `pass`, `partial`, `blocked`, or `timeout`
- outputs paid/generation/access-link status categories only

### Mock-Flow Tier

New command:

```bash
cd apps/web && corepack pnpm run qa:module01:mock-flow
```

Initial coverage:

- Admin API summary tests
- checkout-start page tests
- Email save route tests
- LINE bind route tests
- LINE recipient-secret helper tests
- Email/LINE access-link sender tests
- paid access-link tests
- paid generation service/processor tests

This tier does not hit NewebPay, Vercel, real Email, real LINE, or Production.

Remaining mock-flow gap:

- A future slice should collapse these route/helper tests into a single scenario-style mock integration if the current test set becomes hard to reason about.

### Playwright UI Tier

New command:

```bash
cd apps/web && corepack pnpm run qa:module01:ui
```

Initial coverage:

- desktop checkout-start shows Email only
- desktop does not show LINE CTA
- mobile checkout-start shows LINE above Email fallback
- payment CTA is locked before save
- saved state unlocks payment CTA
- no internal-test/no-charge copy
- no Email/LINE report-body delivery promise

The v0 UI suite uses a fixture/no-server Playwright config to keep it fast and provider-free.

Remaining UI gap:

- A future slice should bind these assertions to a mocked local app route when the test harness can provide stable result/payment fixtures without real providers.

## Validation Tier Policy

Codex should not run a heavier gate unless the changed surface requires it, or should explicitly explain why it is needed.

| Change surface | Default validation |
| --- | --- |
| Code changes | lint, targeted tests, full tests, build if runtime/build surface changed |
| UI flow changes | targeted tests, `qa:module01:ui`, local/mock integration; staging only if deployed checkout/payment/access-link behavior changed |
| Payment/access-link/backend flow changes | unit/route tests, `qa:module01:mock-flow`, staging gate if deployed behavior changed, production-preflight if production gate related |
| Env/Vercel/production gate changes | env/preflight tests and `qa:module01:production-preflight`; no staging smoke unless runtime flow changed |
| Real provider checks | owner-approved only; not default; no real Email/LINE/credit-card without explicit approval |

Operational rule:

- Do not rerun `qa:module01:staging` merely to poll paid status.
- Use `qa:module01:wait-result` with an explicit known result ID when status polling is needed.
- Use `.qa` summary artifacts instead of `/private/tmp` for normal Module 01 release handoffs.

## Release Suite Behavior Changes

- `qa:module01:staging` still runs the existing staging health, access-link smoke, no-card checkout/result path, Admin API lookup, and Admin CLI lookup.
- The no-card subcommand now produces the known-result artifact before Admin API/CLI checks.
- Admin API/CLI checks first use explicit env result IDs if supplied, then fall back to the suite artifact.
- Missing token or missing known result ID still produces partial/skipped categories instead of dynamic retries.
- Unsafe Admin API/CLI output remains blocking.
- Real Email/LINE channel validation remains outside the default suite.

## Commands Added / Updated

- Added `qa:module01:mock-flow`
- Added `qa:module01:ui`
- Added `qa:module01:wait-result`
- Updated `qa:result-checkout:no-card` to write `.qa/module01-staging-artifact.json`
- Updated `qa:module01:staging` to consume the structured known-result artifact

## Validation Results

| Check | Result |
| --- | --- |
| `cd apps/web && corepack pnpm lint` | PASS |
| targeted QA helper/suite tests | PASS, 4 files / 21 tests |
| `cd apps/web && corepack pnpm test` | PASS, 84 files / 595 tests |
| `cd apps/web && corepack pnpm build` | PASS |
| `cd apps/web && corepack pnpm run qa:module01:local` | PASS |
| `cd apps/web && corepack pnpm run qa:module01:mock-flow` | PASS, 11 files / 106 tests |
| `cd apps/web && corepack pnpm run qa:module01:ui` | PASS, 3 Playwright tests |
| `cd apps/web && corepack pnpm run qa:module01:staging` | PASS, run once because staging suite artifact behavior changed |
| `qa:module01:production-preflight` | not run; production-preflight logic did not change |

Staging run notes:

- No real Email was sent.
- No real LINE was sent.
- No production payment was run.
- Production was touched only through existing read-only fail-closed checks inside the safe staging gate.
- The existing no-card command still has internal paid-status polling; future standalone status waits should use `qa:module01:wait-result`.

## Tech Debt Review

New technical debt introduced:

- The Playwright UI tier is fixture-based rather than bound to a mocked local app route.
- `qa:result-checkout:no-card` still contains internal polling for its own staged no-card completion path.

Existing technical debt observed:

- Historical reports contain ad hoc heredoc/temp-file workflow examples.
- Recovery-named routes/helpers/envs remain active compatibility debt.
- `qa:module01:staging:channels` is still not implemented.

Opportunistic cleanup completed:

- Admin CLI staging command-start logging now redacts result ID in suite logs.

Deferred cleanup candidates:

- Convert no-card paid-status polling to shared wait-helper internals.
- Build a scenario-style mock integration runner instead of a broad vitest wrapper.
- Bind Playwright UI assertions to a stable mocked app route.

## Theme Route Preservation

- Theme Architecture assets remain archived under `ai-collaboration/design/theme-architecture-v0/`.
- Hybrid Theme Park Model, Module 01 Riso-only, neutral editorial Core Shell, and shared module-themed flow templates remain adopted.
- No runtime theme/UI implementation was started in this task.

## Recommended Next Task

Return to `LINE Recipient Secret Bind Invariant Fix v0` using the new validation policy:

1. targeted LINE bind/contact-secret tests
2. `qa:module01:mock-flow`
3. `qa:module01:ui` if checkout-start unlock UX changes
4. `qa:module01:staging` only when deployed behavior needs proof

Do not retry production payment until the delivery failure is fixed, Module 01 gates pass, and owner explicitly approves.
