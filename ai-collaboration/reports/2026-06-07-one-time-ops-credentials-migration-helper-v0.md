# One-Time Ops Credentials Migration Helper v0

## Metadata

- task name: One-Time Ops Credentials Migration Helper v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-one-time-ops-credentials-migration-helper-v0.md`
- commit: pending
- branch / push status: pending
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T14:15:42Z
- taskCompletedAt: 2026-06-07T14:23:53Z
- totalWallClockDuration: 8m11s
- humanWaitDuration: 0m
- netCodexWorkDuration: 8m11s

## Context

- why this task exists: process-env-only Admin/Ops auth was too easy to forget, and the owner approved one-time migration of existing Admin API tokens from app env mirrors into the dedicated `~/.anyu/credentials.json` operator store.
- upstream blocker / mainline context: production Admin/Ops preflight blocked production smoke until local ops credentials were configured. NewebPay URL env alignment is restored; provider dashboard verification remains owner-side.
- out-of-scope items: production runtime open, production payment, Email/LINE sends, Vercel env mutation, DB mutation, migrations, theme UI, and Module 02.

## Scope

- what changed: added one-time migration helper, migration tests, docs, and status artifacts; ran the helper locally with owner-approved confirmation.
- what did not change: normal `pnpm ops` auth sources, app env mirror semantics, runtime/product code, Vercel env values, DB state, provider settings, or secrets.

## Implementation Summary

- migration helper path: `tools/admin-cli/scripts/migrate-admin-token-from-env-mirrors.mjs`.
- test path: `tools/admin-cli/src/migrate-admin-token-from-env-mirrors.test.ts`.
- docs updated: `tools/admin-cli/README.md`, `ai-collaboration/process/admin-ops-boundary.md`, `ai-collaboration/process/env-mirror-policy.md`.
- key design decisions:
  - did not add permanent `pnpm ops auth import-token`.
  - helper requires `--confirm-owner-approved`.
  - helper copies only `ADMIN_API_TOKEN`.
  - normal `pnpm ops` remains pure and does not read app env mirrors.

## Migration Helper Behavior

- reads:
  - `apps/web/.env.staging` `ADMIN_API_TOKEN`
  - `apps/web/.env.production` `ADMIN_API_TOKEN`
- writes:
  - `~/.anyu/credentials.json` `profiles.staging.adminApiToken`
  - `~/.anyu/credentials.json` `profiles.production.adminApiToken`
- preserves existing unrelated credential profile fields.
- creates parent directory and writes credentials file with restrictive permissions where supported.
- reports only:
  - copied profile categories
  - source category
  - destination path
  - permission status
  - redaction booleans

## Migration Run Result

- command: `node tools/admin-cli/scripts/migrate-admin-token-from-env-mirrors.mjs --confirm-owner-approved --json`
- result: pass.
- staging profile copied: yes.
- staging category: `token_copied`.
- production profile copied: yes.
- production category: `token_copied`.
- source categories: `staging_env_mirror`, `production_env_mirror`.
- destination path: `~/.anyu/credentials.json`.
- permission status: `chmod_600`.
- token values printed: no.
- token lengths/prefixes/suffixes/hashes/checksums printed: no.

## Auth Status Result

- `pnpm ops auth status --env staging --json`: pass.
  - tokenAvailable: true.
  - tokenSourceCategory: `credentials_file`.
- `pnpm ops auth status --env production --json`: pass.
  - tokenAvailable: true.
  - tokenSourceCategory: `credentials_file`.
- normal auth resolver proof: targeted tests verify app env mirrors are not read directly by normal auth resolution.

## Production Admin/Ops Preflight Result

- command: `cd apps/web && corepack pnpm run qa:production:admin-ops-preflight`.
- result: pass.
- gateStatus: pass.
- commandExitCode: 0.
- adminOpsStatus: `production_admin_ops_ready`.
- tokenSourceCategory: `credentials_file`.
- mutatesData: false.
- responseSanitized: true.

## Validation

- commands run:
  - `corepack pnpm --filter @anyu/admin-cli test -- migrate-admin-token-from-env-mirrors`: pass.
  - `corepack pnpm --filter @anyu/admin-cli test`: pass.
  - `corepack pnpm --filter @anyu/admin-cli typecheck`: pass after test import suppression for standalone `.mjs` helper.
  - `pnpm ops auth status --env staging --json`: pass.
  - `pnpm ops auth status --env production --json`: pass.
  - `cd apps/web && corepack pnpm run qa:production:admin-ops-preflight`: pass.
- gates skipped and why:
  - production runtime/payment/Email/LINE: skipped by task scope.
  - Vercel env changes: skipped by task scope.
  - app full test/build: skipped because no app runtime code changed.

## Safety

- production runtime enabled: no.
- payment run: no.
- Email sent: no.
- LINE sent: no.
- Vercel env changed: no.
- DB mutated: no.
- secrets/private data exposed: no.
- credentials file committed: no.

## Result

- result: pass.
- first failure category: none.
- blocker status:
  - production Admin/Ops credential blocker resolved locally.
  - remaining blocker: owner must verify/update NewebPay dashboard ReturnURL/NotifyURL alignment before payment smoke.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed: legacy module ReturnURL compatibility route remains non-redirect.
- opportunistic cleanup completed: docs now define the one-time migration helper boundary.
- deferred cleanup candidates: remove or archive the migration helper after Gate 1 if owner wants to avoid future accidental use.

## Decisions Made

- Added helper outside normal CLI command surface.
- Required explicit owner confirmation flag.
- Copied only Admin API tokens from the two approved mirrors.
- Did not copy service env values.
- Did not add `--token` or permanent import command.

## Uncertainties / Blockers

- Provider dashboard alignment cannot be claimed until owner confirms or direct dashboard evidence is provided.

## Recommended Next Step

Owner verifies/updates NewebPay dashboard staging and production ReturnURL/NotifyURL settings. If confirmed, proceed to Controlled Production Payment Smoke Retry with Scoped Runtime Config v4 from full pre-open gates.

## Paste-Back Context

The one-time helper `tools/admin-cli/scripts/migrate-admin-token-from-env-mirrors.mjs` copies only `ADMIN_API_TOKEN` from `.env.staging` and `.env.production` into `~/.anyu/credentials.json` when run with `--confirm-owner-approved`. It was run locally, copied both staging and production profiles, and `qa:production:admin-ops-preflight` now passes with token source `credentials_file`. Normal `pnpm ops` still does not read app env mirrors. No runtime/payment/Email/LINE/Vercel env/DB mutation occurred.
