# Scoped Runtime Config Implementation v0

## Metadata

- task name: Scoped Runtime Config Implementation v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-scoped-runtime-config-implementation-v0.md`
- commit: `68f7906`
- branch / push status: pushed to `origin/staging`; deployed fail-closed to Production from repo root
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T02:51:12Z
- taskCompletedAt: 2026-06-07T03:18:58Z
- totalWallClockDuration: 27m46s
- humanWaitDuration: 0m
- netCodexWorkDuration: 27m46s

## Context

- why this task exists: Vercel env runtime toggling was too slow and brittle for controlled production smoke windows.
- upstream blocker / mainline context: Production smoke needs a fast, scoped, auditable runtime window before retry.
- out-of-scope items: production payment, Email send, LINE send, theme UI, Module 02, provider credential changes.

## Scope

- what changed: implemented registry-first DB-backed scoped runtime config, Admin API, `pnpm ops config`, payment gate migration, runtime-window/preflight migration, docs, and tests.
- what did not change: provider credentials, secrets, production payment state, Email/LINE provider runtime, theme UI, Module 02.

## Implementation Summary

- files / areas changed: DB schema/migration, runtime config library, Admin API routes, Admin CLI, Module 01 payment checkout gates, production runtime-window/preflight scripts, QA env checks, process docs, Admin CLI docs.
- key design decisions: Module 01 payment window is keyed by module identity `ai-temperature`; `ambiguous-temperature` remains the route slug only. No implicit global/module override was added. Closing the payment window sets `payment.window.enabled=false` rather than unsetting it so critical config remains present.
- local / opportunistic cleanup decisions: removed active references to replaced `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT` from code, QA scripts, env example, process docs, and ignored local mirrors.

## Schema / Migration Result

- Added `runtime_config_values`.
- Added `runtime_config_events`.
- Seeded Preview(staging) and Production with 12 non-secret fail-closed baseline values.
- Preview(staging) aggregate verification: `runtime_config_values=12`, `runtime_config_events=12`.
- Production aggregate verification: `runtime_config_values=12`, `runtime_config_events=12`.
- Production runtime remained disabled; no payment/Email/LINE occurred.

## Runtime Config v0 Keys

- `payment.window.enabled`
- `payment.global.disabled`
- `delivery.line.enabled`
- `delivery.email.enabled`

## Admin API / CLI Result

- Added Admin API routes:
- `GET /api/admin/runtime-config/registry`
- `GET /api/admin/runtime-config/values`
- `GET /api/admin/runtime-config/get`
- `POST /api/admin/runtime-config/set`
- `POST /api/admin/runtime-config/unset`
- `GET /api/admin/runtime-config/history`
- Added `pnpm ops config` command family with registry/list/get/set/unset/history and help examples.
- CLI uses `ADMIN_API_TOKEN` from shell/process env only and does not read app env mirrors.

## Runtime Integration Result

- Module 01 checkout availability now requires:
- `payment.global.disabled=false`
- `payment.window.enabled=true` for module scope `ai-temperature`
- Missing/invalid runtime config fails closed.
- The old Vercel env flags are no longer primary runtime gates.
- Runtime-window helper now plans/sets scoped runtime config and reports config status.

## Validation

- commands run: `cd apps/web && corepack pnpm lint`: pass.
- commands run: targeted runtime-config/Admin API/checkout/preflight tests: pass, 50 tests.
- commands run: `cd apps/web && corepack pnpm test`: pass, 96 files / 656 tests.
- commands run: `corepack pnpm --filter @anyu/admin-cli test`: pass, 3 files / 28 tests.
- commands run: `corepack pnpm --filter @anyu/admin-cli typecheck`: pass.
- commands run: `cd apps/web && corepack pnpm build`: pass.
- commands run: `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass.
- commands run: `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 tests.
- commands run: `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`.
- commands run: `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass after fail-closed production deploy, `stateCategory=fail_closed_ready`, `currentDeployCommit=68f790601029`.
- commands run: `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass after fail-closed production deploy, `gateStatus=pass`, `commandExitCode=0`.
- gateStatus: pass
- commandExitCode: production-preflight commandExitCode=0
- requiredChecksStatus: pass
- optionalChecksStatus: not_applicable
- targetDeployCommit: `68f7906`
- deployedCommitAtGateStart: `68f790601029`
- deployedCommitAtGateEnd: `68f790601029`
- freshnessStatus: pass_by_runtime_window_health
- gates skipped and why: `qa:module01:staging` skipped so far because code is locally covered and Preview deploy verification will be a separate freshness-gated check if needed.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: yes, additive schema + non-secret baseline runtime config rows/events on Preview(staging) and Production
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: resolved

## Tech Debt / Cleanup Notes

- new technical debt introduced: none known.
- existing technical debt observed: Drizzle meta journal remains older than current manual SQL migration set; manual SQL migrations are still the practical path.
- opportunistic cleanup completed: removed obsolete payment runtime env flag references and mirror entries.
- deferred cleanup candidates: wire delivery.line/email runtime config into send services if owner wants live delivery kill switches in v1.

## Decisions Made

- Use `active=false` only for explicit unset; controlled smoke close uses `payment.window.enabled=false`.
- Keep runtime config primitive-only and non-secret.
- Do not retain the old Vercel env flags as compatibility paths.

## Uncertainties / Blockers

- No remaining implementation blocker. Production is deployed fail-closed on scoped runtime config.

## Recommended Next Step

Run Production Smoke Runbook Update + Runtime Config Dry Run v0 before another controlled production smoke.

## Paste-Back Context

Scoped Runtime Config v0 is implemented, committed as `68f7906`, pushed to `origin/staging`, and deployed fail-closed to Production from the repo root. Additive runtime-config tables/seed values are applied to Preview(staging) and Production. Local tests, build, mock-flow, UI, local Module 01 gate, runtime-window status, and production-preflight pass. Production remains fail-closed with `payment.window.enabled=false`; no payment, Email, or LINE occurred.
