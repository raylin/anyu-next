# ANYU Ops CLI Auth Config v0

## Metadata

- task name: ANYU Ops CLI Auth Config v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-anyu-ops-cli-auth-config-v0.md`
- commit: not committed at report creation
- branch / push status: not pushed at report creation
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T13:35:02Z
- taskCompletedAt: 2026-06-07T13:48:02Z
- totalWallClockDuration: 13m00s
- humanWaitDuration: 0m
- netCodexWorkDuration: 13m00s

## Context

- why this task exists: production Admin/Ops preflight correctly blocked when no `ADMIN_API_TOKEN` was present, but process-env-only auth was too easy to forget.
- upstream blocker / mainline context: production smoke v3 stopped before payment after Email/LINE visible success because `pnpm ops` production lookup had no token. The follow-up guard existed but still needed stable operator credential storage.
- out-of-scope items: production runtime open, production payment, Email/LINE sends, Vercel env changes, DB mutation, migrations, theme UI, and Module 02.

## Scope

- what changed: added Admin CLI auth config support, `pnpm ops auth` commands, shared token resolution, credentials-file tests, docs, and guard/report/dashboard updates.
- what did not change: no service env mirror values, Vercel env, runtime config values, product runtime behavior, DB schema, or provider credentials changed.

## Implementation Summary

- files / areas changed: `tools/admin-cli/src/auth.ts`, Admin CLI lookup/config command auth usage, CLI dispatcher, tests, README, app production Admin/Ops preflight helper/tests, process docs, `.gitignore`, dashboard, summary log, handoff, and report.
- key design decisions: implemented `~/.anyu/credentials.json` as the normal operator credential store and skipped a one-time migration script in v0. Manual `pnpm ops auth set-token --env ...` is safer and keeps env-mirror import out of the permanent CLI surface.
- local / opportunistic cleanup decisions: added `.anyu/` to `.gitignore` to prevent accidental repo-local credential commits.

## Credentials Path / Schema

- non-secret config path reserved: `~/.anyu/config.json`.
- credentials path implemented: `~/.anyu/credentials.json`.
- v0 schema:

```json
{
  "version": 1,
  "profiles": {
    "staging": {
      "adminApiToken": "..."
    },
    "production": {
      "adminApiToken": "..."
    }
  }
}
```

- parent directory is created when needed.
- credentials file is written with restrictive permissions when supported by the platform.
- token values and token-derived metadata are not printed.
- credentials file is not committed.

## Token Resolution Behavior

- token resolution order:
  - process env `ADMIN_API_TOKEN`
  - `~/.anyu/credentials.json` profile matching `--env`
  - missing -> `admin_token_missing`
- source categories reported:
  - `process_env`
  - `credentials_file`
  - `missing`
- `--env` remains required.
- no `--token` flag was added.
- normal `pnpm ops` commands do not read `apps/web/.env.staging` or `apps/web/.env.production`.

## Auth Commands Added

- `pnpm ops auth status --env staging`
- `pnpm ops auth status --env production`
- `pnpm ops auth set-token --env staging`
- `pnpm ops auth set-token --env production`
- `pnpm ops auth logout --env staging`
- `pnpm ops auth logout --env production`

Behavior:

- `auth status` prints availability and source category only.
- `auth set-token` prompts for a token and does not accept a token positional argument or `--token`.
- `auth logout` removes only the selected environment profile token and preserves other profiles.

## One-Time Migration Helper Decision

- not implemented in v0.
- reason: manual `pnpm ops auth set-token --env staging` and `pnpm ops auth set-token --env production` is simpler, safer, and avoids normalizing env-mirror reads in tooling.
- no permanent `pnpm ops auth import-token` command was added.

## Production Admin/Ops Preflight Status

- `qa:production:admin-ops-preflight` now calls `pnpm ops auth status --env production --json` first.
- It can pass with `process_env` or `credentials_file`.
- Current environment result: blocked.
- category: `production_admin_token_missing_owner_action_required`.
- tokenSourceCategory: `missing`.
- runtime opened: no.
- data mutated: no.

## Validation

- commands run:
  - `corepack pnpm --filter @anyu/admin-cli test`: pass, 4 files / 40 tests.
  - `corepack pnpm --filter @anyu/admin-cli typecheck`: pass.
  - `cd apps/web && corepack pnpm exec vitest run src/tests/production-admin-ops-preflight.test.ts src/tests/module01-release-validation-suite.test.ts`: pass, 2 files / 23 tests.
  - `corepack pnpm --silent ops auth status --env production --json`: pass, token unavailable, source `missing`.
  - `cd apps/web && corepack pnpm run qa:production:admin-ops-preflight`: blocked as expected with `production_admin_token_missing_owner_action_required`.
  - `cd apps/web && corepack pnpm lint`: pass after removing an unused helper argument.
  - `cd apps/web && corepack pnpm test`: pass, 102 files / 695 tests.
  - `cd apps/web && corepack pnpm build`: pass.
- gateStatus: blocked for live production Admin/Ops preflight; pass for implementation validation.
- commandExitCode: `qa:production:admin-ops-preflight` returned 1 for missing credentials; validation commands returned 0 after lint fix.
- requiredChecksStatus: implementation pass; live production Admin/Ops auth still missing.
- optionalChecksStatus: not_applicable.
- targetDeployCommit: not_applicable.
- deployedCommitAtGateStart: not_applicable.
- deployedCommitAtGateEnd: not_applicable.
- freshnessStatus: not_applicable.
- gates skipped and why:
  - production runtime/payment/Email/LINE: skipped because this task is auth tooling only and live Admin/Ops auth is still missing.
  - migration helper run: skipped because no migration helper was implemented in v0.

## Safety

- production runtime enabled: no.
- payment run: no.
- Email sent: no.
- LINE sent: no.
- Vercel env changed: no.
- DB mutated: no.
- secrets/private data exposed: no.

## Result

- result: pass for implementation; live production Admin/Ops preflight remains blocked pending owner credential setup.
- first failure category: `production_admin_token_missing_owner_action_required`.
- blocker status: owner action required.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed: production smoke remains blocked until operator credentials are configured locally.
- opportunistic cleanup completed: `.anyu/` added to `.gitignore`.
- deferred cleanup candidates: if owner later wants automation, add a clearly separate one-time migration helper requiring explicit owner confirmation.

## Decisions Made

- Implemented dedicated credentials-file auth.
- Kept process env override highest priority.
- Did not add `--token`.
- Did not implement permanent import-token command.
- Did not implement one-time env mirror migration script in v0.
- Kept service env mirrors separate from operator credentials.

## Uncertainties / Blockers

- No staging/production ops credentials are configured in this execution environment.
- `qa:production:admin-ops-preflight` has not passed live production auth yet.

## Recommended Next Step

Owner runs:

```bash
pnpm ops auth set-token --env staging
pnpm ops auth set-token --env production
cd apps/web && corepack pnpm run qa:production:admin-ops-preflight
```

If production Admin/Ops preflight passes, proceed to Controlled Production Payment Smoke Retry with Scoped Runtime Config v4 from full pre-open gates.

## Paste-Back Context

ANYU Admin CLI now supports dedicated operator credentials at `~/.anyu/credentials.json`. `pnpm ops` resolves auth from process env first, then credentials file, and still does not read app service env mirrors. Added `pnpm ops auth status/set-token/logout`, updated lookup-result, lookup-line-bind, and runtime-config commands to use shared auth, and updated production Admin/Ops preflight to use `pnpm ops auth status` before read-only config checks. Current live auth status is missing, so production preflight still blocks safely until owner sets tokens. No runtime/payment/Email/LINE/Vercel env/DB mutation occurred.
