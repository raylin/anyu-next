# QA Foundation Follow-up v2

## Metadata

- task name: QA Foundation Follow-up v2
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-qa-foundation-follow-up-v2.md`
- commit: not committed
- branch / push status: not pushed
- model / effort: GPT-5 Codex, high effort
- taskStartedAt: 2026-06-07T15:58:34Z
- taskCompletedAt: 2026-06-07T16:12:43Z
- totalWallClockDuration: 14m09s
- humanWaitDuration: 0m00s
- netCodexWorkDuration: 14m09s

## Context

- why this task exists: Gate 1 functional smoke passed and runtime availability is `owner_controlled_short_window_allowed`; remaining QA/testing/tooling debt needed cleanup before theme or soft-public readiness work.
- upstream blocker / mainline context: low-key soft public remains blocked pending repeated/concurrency paid-generation evidence; production remains fail-closed by default.
- out-of-scope items: production runtime open, production payment, real Email/LINE sends, Vercel env changes, DB mutation, migrations, theme UI, Module 02.

## Scope

- what changed: guarded staging channel plan runner, route-shaped Playwright checkout harness coverage, no-card Admin API readiness wait, lifecycle docs for ops credential migration and diagnostics/events, delivery runtime config policy, ReturnURL compatibility decision, dashboard/summary/report updates.
- what did not change: product payment behavior, sender behavior, production runtime config state, Vercel env, DB schema/data, real provider/channel integrations.

## QA Debt Inventory

| item | classification | decision |
| --- | --- | --- |
| `qa:module01:staging:channels` | fix now as guarded plan runner | default real-send mode blocks with `owner_approval_required`; `--plan` emits non-sending plan; real sends deferred until owner-approved recipient/account scope exists. |
| Playwright Module 01 UI harness | fix now, scoped | Email-saved unlock test now uses actual checkout route shape `/m/ambiguous-temperature/result/<fixture>/checkout`; full local Next route with DB/provider-mocked server remains deferred. |
| no-card / wait-result flow | fix now | no-card readiness wait now prefers Admin API lookup by `resultId`; tokenized paid-access path is isolated to final render/fallback verification. |
| one-time ops credential migration helper | document lifecycle now | kept as owner-approved one-time/local recovery helper; not normal auth path and not a `pnpm ops` command. |
| event / diagnostic surfaces | document lifecycle now | permanent Admin/Ops summaries vs temporary Gate 2 diagnostics are documented; deletion/pruning job deferred until evidence requires it. |
| inactive delivery runtime config keys | no code action needed | `delivery.email.enabled` / `delivery.line.enabled` remain inactive until sender code reads them with tests. |
| legacy module ReturnURL route | explicitly defer strict cleanup | active canonical path remains `/payment/newebpay/return`; old module route is compatibility-only and not active env/provider/runbook path. |
| stale QA/report/dashboard references | fix active docs only | dashboard active blockers/next-task language updated; historical reports not broadly rewritten. |

## Implementation Summary

- files / areas changed:
  - `apps/web/scripts/module01-staging-channels-qa.mjs`
  - `apps/web/scripts/result-checkout-no-card-qa.mjs`
  - `apps/web/e2e/support/module01-checkout-harness.ts`
  - `apps/web/e2e/module-01-checkout-ui.spec.ts`
  - targeted tests under `apps/web/src/tests/`
  - process docs and Admin CLI README
  - dashboard, summary log, handoff, report
- key design decisions:
  - Real staging Email/LINE sends are not implemented inside this task because recipient/account scope and owner approval need a separate high-risk runner decision.
  - Playwright route-shaped harness is a safe incremental improvement; it does not claim full local Next server route coverage.
  - Admin API lookup is now the primary no-card readiness wait source on staging; tokenized access paths remain final render/access checks only.
- local / opportunistic cleanup decisions:
  - active dashboard stale smoke-blocker wording was corrected.
  - no historical reports were rewritten.

## Staging Channels Result

- default command behavior: `qa:module01:staging:channels` exits with `owner_approval_required`, sends no Email, sends no LINE, touches no production.
- plan behavior: `qa:module01:staging:channels -- --plan --json` exits pass and emits planned steps only.
- real-send status: explicitly not implemented; deferred until owner-approved staging recipient/account scope is defined.

## Playwright Route-Backed Improvement Result

- added actual checkout route-shape interception for `**/m/ambiguous-temperature/result/*/checkout**`.
- moved the Email saved/unlock UI test to `gotoCheckoutRouteHarness`.
- remaining gap: the Playwright route is still fulfilled by the local harness, not a full local Next route with DB/provider mocks.

## No-Card Admin API Wait Result

- no-card staging QA now records:
  - `readinessWaitSource=admin_api`
  - `adminApiWaitPrimary=true`
  - `fallbackTokenStatusUsed=false`
- `/r` / paid-access rendering remains a final access verification, not readiness polling.

## Lifecycle Decisions

- credential migration helper: kept as owner-approved one-time/local recovery tool only; not normal auth and not a permanent CLI import command.
- diagnostics/events:
  - permanent: `lookup-result`, `lookup-line-bind`, runtime config summaries, Admin/Ops preflight categories.
  - temporary through Gate 2: detailed Email save categories, LINE bind milestones, benchmark queue recommendations, staging channel plan summaries.
  - retention cleanup job: deferred; future pruning task only if event growth/privacy review requires it.
- delivery runtime config: delivery keys remain inactive until sender integration exists and tests prove behavior.
- legacy ReturnURL route: compatibility-only; strict redirect cleanup deferred because active code/env/provider/runbook alignment is canonical.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm exec vitest run src/tests/module01-staging-channels-qa.test.ts src/tests/result-checkout-no-card-qa.test.ts src/tests/module01-release-validation-suite.test.ts`: pass after one brittle doc-string assertion fix.
  - `corepack pnpm --filter @anyu/admin-cli test`: pass, 5 files / 49 tests.
  - `corepack pnpm --filter @anyu/admin-cli typecheck`: pass.
  - `cd apps/web && corepack pnpm lint`: pass.
  - `cd apps/web && corepack pnpm test`: pass, 104 files / 711 tests.
  - `cd apps/web && corepack pnpm build`: pass.
  - `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 Playwright tests.
  - `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: pass; Admin API wait primary, production fail-closed read-only check pass.
  - `cd apps/web && corepack pnpm run qa:module01:staging:channels`: expected blocked, `owner_approval_required`, exit 2, no sends.
  - `cd apps/web && corepack pnpm run qa:module01:staging:channels -- --plan --json`: pass, no sends.
  - `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass.
  - `cd apps/web && corepack pnpm run qa:module01:local`: pass.
  - `cd apps/web && corepack pnpm exec vitest run src/tests/runtime-config-registry.test.ts src/tests/admin-runtime-config-route.test.ts`: pass.
  - docs presence check: pass.
  - dashboard HTML sanity: pass.
  - secret/private scan: pass; matches were historical safety/redaction terminology and token-prefix names, not new private values.
  - `git diff --check`: pass.
- gateStatus: pass
- commandExitCode: not_applicable for aggregate task; individual command results recorded above
- requiredChecksStatus: pass
- optionalChecksStatus: pass
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why:
  - `qa:module01:staging`: skipped because deployed staging app behavior was not changed; this task changed local QA runners/tests/docs. The staging-safe no-card runner was executed instead.
  - `qa:module01:staging:channels` real sends: skipped because real channel runner remains intentionally unimplemented and requires explicit owner-approved staging recipient/account scope.
  - production runtime/payment gates: skipped by task scope.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: no production DB mutation; staging no-card QA used the existing safe staging fake-paid path
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: QA foundation cleanup completed; real staging channel sends remain intentionally deferred

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed:
  - Full local Next route-backed Playwright checkout remains future work.
  - Real staging channel runner remains deferred until owner-approved recipient/account scope exists.
  - Diagnostic pruning remains deferred until Gate 2/growth/privacy evidence requires it.
  - Legacy module ReturnURL compatibility route remains in code as compatibility-only.
- opportunistic cleanup completed:
  - active dashboard stale smoke-blocker wording corrected.
  - process docs now encode QA foundation decisions.
- deferred cleanup candidates:
  - Owner-approved Staging Channel Runner v0, only if real channel receipt automation is needed.
  - Full Local Route-Backed Module 01 Playwright Harness v0.
  - Gate 2 Diagnostic Retention Pruning v0, if needed.
  - Legacy Module ReturnURL Strict Redirect Cleanup v0, if strict redirect invariant is desired.

## Decisions Made

- Do not implement real staging Email/LINE sends in this follow-up.
- Keep `delivery.email.enabled` and `delivery.line.enabled` inactive.
- Keep the one-time ops credential migration helper but label it as owner-approved/local recovery only.
- Treat legacy module ReturnURL route as compatibility-only, not an active smoke blocker.
- Continue using production only as acceptance, not diagnostics.

## Uncertainties / Blockers

- none blocking this task.
- soft public remains blocked on repeated/concurrency paid-generation evidence.
- real staging channel receipt automation remains intentionally deferred.

## Recommended Next Step

Owner chooses between:

1. Repeated / Concurrency Paid-Generation Benchmark v0 for soft-public readiness.
2. Module Theme Architecture Implementation Plan if staying with owner-controlled short windows.

## Paste-Back Context

QA Foundation Follow-up v2 completed after Gate 1. `qa:module01:staging:channels` now has guarded default behavior and non-sending plan mode; real sends remain deferred. Module 01 Playwright UI now covers the actual checkout route shape for one critical unlock case. No-card staging QA now waits on Admin API result state by `resultId` before final access render. Ops credential migration, diagnostic/event retention, inactive delivery runtime config, and legacy ReturnURL compatibility decisions are documented. Production was not touched.
