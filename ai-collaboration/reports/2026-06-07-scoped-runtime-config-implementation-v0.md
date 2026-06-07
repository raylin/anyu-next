# Scoped Runtime Config Implementation v0

## Metadata

- task name: Scoped Runtime Config Implementation v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-scoped-runtime-config-implementation-v0.md`
- commit: pending
- branch / push status: pending
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T02:51:12Z
- taskCompletedAt: pending
- totalWallClockDuration: pending
- humanWaitDuration: 0m
- netCodexWorkDuration: pending

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
- commands run: `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: blocked before code deploy; Production still served old commit and Admin API runtime-config routes were not live.
- commands run: `cd apps/web && corepack pnpm run qa:module01:production-preflight`: blocked before code deploy due runtime-window config lookup not live.
- gateStatus: partial before deployment
- commandExitCode: production-preflight pre-deploy commandExitCode=1
- requiredChecksStatus: local required checks pass; production live gate pending deploy
- optionalChecksStatus: not_applicable
- targetDeployCommit: pending
- deployedCommitAtGateStart: production pre-deploy commit `f8b2b1f9ac4c`
- deployedCommitAtGateEnd: pending
- freshnessStatus: pending
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

- result: partial before production code deploy
- first failure category: production_runtime_config_api_not_deployed
- blocker status: production runtime-window status remains blocked until the new fail-closed code is deployed

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

- Production needs a fail-closed code deploy for the new Admin API routes and checkout gate before live production-preflight can pass.

## Recommended Next Step

Complete fail-closed production deployment of this implementation, rerun runtime-window status and production-preflight, then run Production Smoke Runbook Update + Runtime Config Dry Run v0.

## Paste-Back Context

Scoped Runtime Config v0 is implemented locally and additive runtime-config tables/seed values are applied to Preview(staging) and Production. Local tests, build, mock-flow, UI, and local Module 01 gate pass. Production remains fail-closed; live runtime-window/preflight are blocked until the new code is deployed fail-closed because current Production still serves an older commit without runtime-config Admin API routes.
