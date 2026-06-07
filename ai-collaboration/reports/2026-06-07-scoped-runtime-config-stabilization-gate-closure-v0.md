# Scoped Runtime Config Stabilization + Gate Closure v0

## Metadata

- task name: Scoped Runtime Config Stabilization + Gate Closure v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-scoped-runtime-config-stabilization-gate-closure-v0.md`
- commit: pending final report commit
- code / deploy commit: `ece5170`
- branch / push status: pushed to `origin/staging`; deployed fail-closed to Production from repo root
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T07:19:48Z
- taskCompletedAt: 2026-06-07T07:35:25Z
- totalWallClockDuration: 15m37s
- humanWaitDuration: 0m
- netCodexWorkDuration: 15m37s

## Context

- why this task exists: Scoped Runtime Config Implementation v0 was functional but not accepted as full release-ready because the staging tail was blocked, delivery config keys were active without sender integration, migration metadata was incomplete, and obsolete Vercel env runtime flag names still existed in Vercel.
- upstream blocker / mainline context: Controlled production smoke should not proceed until scoped runtime config is the single primary runtime gate and deployed checks are cleanly reportable.
- out-of-scope items: production payment, real Email/LINE sends, ads, non-card payment methods, theme UI, Module 02.

## Scope

- what changed: stabilized active runtime config registry, deactivated unwired delivery config rows, removed obsolete runtime env names from Vercel, aligned migration metadata, fixed CLI help grammar, and reran required gates.
- what did not change: provider credentials, secrets, production payment state, Email/LINE provider sends, theme runtime.

## Current State Before Changes

- Scoped runtime config resolver/Admin API/CLI/payment gate existed.
- `payment.window.enabled` and `payment.global.disabled` were wired into Module 01 checkout gating.
- `delivery.email.enabled` and `delivery.line.enabled` were active registry keys but not read by sender code.
- Drizzle SQL migrations existed through `0014`, but `meta/_journal.json` only tracked through `0006`.
- `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT` were absent from active code/env mirrors but still existed in Vercel Production and Preview(staging).
- Previous `qa:module01:staging` summary was blocked by `access_link_smoke_failed` and `staging_freshness_timeout`.

## Implementation Summary

- Removed delivery runtime config keys from the active registry.
- Updated Admin API values listing to return only active registered keys so stale inactive DB rows are not exposed as operational controls.
- Added `0015_deactivate_unwired_delivery_runtime_config.sql` and applied it to Preview(staging) and Production.
- Updated `0014_runtime_config.sql` so fresh installs seed only active payment config baselines.
- Updated Drizzle `_journal.json` to include all checked-in SQL migrations through `0015`.
- Added `apps/web/drizzle/MIGRATIONS.md` and a migration metadata test.
- Removed obsolete `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT` from Vercel Production and Preview(staging), key names only.
- Fixed `pnpm ops config --help` so the documented command works.

## Runtime Config Active Keys

- `payment.window.enabled`
- `payment.global.disabled`

Reserved but inactive / not exposed:

- `delivery.email.enabled`
- `delivery.line.enabled`

## DB / Migration Result

- Preview(staging): delivery keys are inactive; payment keys remain active.
- Production: delivery keys are inactive; payment keys remain active.
- Aggregate verification only was used; no row values or private content were printed.
- Migration metadata now journals every checked-in SQL migration and documents runtime config schema verification.

## Legacy Runtime Flag Cleanup Result

- Removed from Vercel Production:
- `ENABLE_PAYMENT_RUNTIME`
- `ENABLE_NEWEBPAY_CHECKOUT`
- Removed from Vercel Preview(staging):
- `ENABLE_PAYMENT_RUNTIME`
- `ENABLE_NEWEBPAY_CHECKOUT`
- Active code/scripts/env example do not require these names.
- Process docs now state they are obsolete normal runtime-window controls.

## Validation

- `cd apps/web && corepack pnpm lint`: pass.
- targeted runtime-config/Admin API/schema/preflight/runtime-window tests: pass, 38 tests.
- `cd apps/web && corepack pnpm test`: pass, 97 files / 659 tests.
- `corepack pnpm --filter @anyu/admin-cli test`: pass, 3 files / 28 tests.
- `corepack pnpm --filter @anyu/admin-cli typecheck`: pass.
- `corepack pnpm --filter @anyu/admin-cli ops config --help`: pass.
- `cd apps/web && corepack pnpm build`: pass.
- `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass.
- `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 tests.
- `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`.
- `cd apps/web && corepack pnpm run qa:deploy:freshness -- --env staging --expected-commit ece5170 --timeout 0 --interval 10000`: pass, start/end `ece51709f4e3`, `mixedDeploymentDetected=false`.
- `MODULE01_EXPECTED_DEPLOY_COMMIT=ece5170 cd apps/web && corepack pnpm run qa:module01:staging`: commandExitCode=0, `requiredChecksStatus=pass`, `optionalChecksStatus=partial`, `gateStatus=partial`, freshness pass.
- `cd apps/web && corepack pnpm run qa:deploy:freshness -- --env production --expected-commit ece5170 --timeout 0 --interval 10000`: pass, start/end `ece51709f4e3`, `mixedDeploymentDetected=false`.
- `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass, `stateCategory=fail_closed_ready`, `aliasGuardStatus=pass`.
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass, `gateStatus=pass`, `commandExitCode=0`.

## Gate Status

- staging targetDeployCommit: `ece5170`
- staging deployedCommitAtGateStart: `ece51709f4e3`
- staging deployedCommitAtGateEnd: `ece51709f4e3`
- staging freshnessStatus: pass
- staging mixedDeploymentDetected: false
- staging commandExitCode: 0
- staging gateStatus: partial
- staging requiredChecksStatus: pass
- staging optionalChecksStatus: partial
- staging optional partial reason: Admin API/CLI optional checks skipped due missing Preview `ADMIN_API_TOKEN` in process env; no required blocker remains.
- production targetDeployCommit: `ece5170`
- production deployedCommitAtGateStart: `ece51709f4e3`
- production deployedCommitAtGateEnd: `ece51709f4e3`
- production runtime-window stateCategory: `fail_closed_ready`
- production preflight gateStatus: pass

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: yes, removed obsolete runtime flag names only
- DB mutated: yes, applied delivery-key deactivation migration to Preview(staging) and Production
- secrets/private data exposed: no

## Result

- result: pass with accepted optional staging partial
- first failure category: not_applicable
- blocker status: resolved for required scoped runtime config stabilization gates

## Tech Debt / Cleanup Notes

- new technical debt introduced: none known.
- existing technical debt observed: staging optional Admin API/CLI checks still need explicit `ADMIN_API_TOKEN` process env if owner wants `gateStatus=pass` instead of partial.
- opportunistic cleanup completed: fixed documented `pnpm ops config --help` grammar.
- deferred cleanup candidates: implement actual delivery sender kill switches later before reintroducing delivery runtime config keys.

## Decisions Made

- Delivery config keys are not active v0 controls until sender code actually reads them.
- Existing delivery rows are retained for audit but inactive.
- Scoped runtime config remains the single primary payment runtime gate.
- Obsolete Vercel env runtime flags were removed instead of retained as dormant toggles.

## Uncertainties / Blockers

- No required blocker remains.
- Optional staging Admin API/CLI evidence remains partial unless the owner wants a separate process-env token run.

## Recommended Next Step

Production Smoke Runbook Update + Runtime Config Dry Run v0.

## Paste-Back Context

Scoped Runtime Config v0 is stabilized on commit `ece5170` and deployed fail-closed to Production. Active runtime config keys are now limited to `payment.window.enabled` and `payment.global.disabled`; delivery keys are inactive/not exposed until sender integration exists. Old Vercel env runtime flags were removed from Production and Preview(staging). Required staging checks pass on a fresh deployment, with only optional Admin API/CLI partial due missing Preview process token. Production runtime-window status and production-preflight pass; no payment, Email, or LINE occurred.
