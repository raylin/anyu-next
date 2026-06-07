# Production Admin/Ops Token Preflight + Smoke Resume Guard v0

## Metadata

- task name: Production Admin/Ops Token Preflight + Smoke Resume Guard v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-production-admin-ops-token-preflight-smoke-resume-guard-v0.md`
- commit: not committed at report creation
- branch / push status: not pushed at report creation
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T13:01:24Z
- taskCompletedAt: 2026-06-07T13:07:36Z
- totalWallClockDuration: 6m12s
- humanWaitDuration: 0m
- netCodexWorkDuration: 6m12s

## Context

- why this task exists: production smoke v3 reached owner-visible Email and LINE save success but stopped before payment because mandatory production Admin/Ops lookup failed with `admin_token_missing`.
- upstream blocker / mainline context: production Admin/Ops authentication was not checked before runtime open/result creation/owner manual action. The next smoke must catch this before any production mutation or owner standby.
- out-of-scope items: production runtime open, payment, real Email/LINE sends, Vercel env changes, DB migrations, direct DB fallback, theme UI, and Module 02.

## Follow-Up Auth Config Note

- 2026-06-07 follow-up: ANYU Ops CLI Auth Config v0 added `~/.anyu/credentials.json` as a normal `pnpm ops` auth source after process env.
- Where this report says owner must export `ADMIN_API_TOKEN`, the current accepted path is either process env or `pnpm ops auth set-token --env production`.
- This note does not rewrite the original blocked result; it updates the remediation path.

## Scope

- what changed: added a read-only production Admin/Ops preflight helper, package command, tests, process docs, handoff, report/dashboard/summary updates, and a v3 report classification note.
- what did not change: no runtime/product route behavior, provider credentials, Vercel env, database schema, or production runtime config values were changed.

## Implementation Summary

- files / areas changed: `apps/web/scripts/production-admin-ops-preflight.mjs`, `apps/web/package.json`, targeted tests, process docs, v3 report note, dashboard, summary log, handoff, and this report.
- key design decisions: implemented a separate `qa:production:admin-ops-preflight` command instead of making general `qa:module01:production-preflight` require an operator token. Production-preflight remains a read-only provider/env/runtime readiness check; production smoke now requires both production-preflight and Admin/Ops preflight before opening runtime.
- local / opportunistic cleanup decisions: none beyond directly related report classification wording.

## Production Token Policy

- `pnpm ops` remains pure and reads `ADMIN_API_TOKEN` only from shell/process env.
- Production smoke must prove `ADMIN_API_TOKEN` is present and authorized before runtime open.
- Missing token fails with `production_admin_token_missing_owner_action_required`.
- Wrong or unauthorized token fails with `production_admin_auth_failed`.
- The helper does not load `.env.production` into `pnpm ops`.
- Direct DB is not an allowed fallback for missing Admin token.
- Token values, lengths, prefixes, suffixes, hashes, checksums, and raw Admin API payloads are not printed.

## Preflight Command Result

- command: `cd apps/web && corepack pnpm run qa:production:admin-ops-preflight`
- result: blocked as expected in the current shell.
- category: `production_admin_token_missing_owner_action_required`.
- `adminOpsStatus`: `production_admin_token_missing`.
- commandExitCode: 1.
- runtime opened: no.
- payment/result created: no.
- data mutated: no.

The missing-token result is the correct behavior for this task because production `ADMIN_API_TOKEN` was not present in process env.

## Smoke Runbook Update

- production smoke pre-open order now requires:
  - production deploy freshness
  - local/mock/UI/smoke-fixture gates
  - production runtime-window status
  - production-preflight
  - `qa:production:admin-ops-preflight`
  - runtime open only after all above pass
- process docs now state that if Admin/Ops preflight fails, Codex must not open runtime, create a result, ask owner for Email/LINE/payment action, or use direct DB as fallback.
- v3 smoke report now includes a follow-up classification note that v3 was blocked by production Admin/Ops token availability after owner-visible Email/LINE save success.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm exec vitest run src/tests/production-admin-ops-preflight.test.ts src/tests/module01-release-validation-suite.test.ts src/tests/admin-token-for-qa.test.ts`: pass, 3 files / 24 tests.
  - `corepack pnpm --filter @anyu/admin-cli test`: pass, 3 files / 29 tests.
  - `cd apps/web && corepack pnpm run qa:production:admin-ops-preflight`: blocked as expected with `production_admin_token_missing_owner_action_required`.
  - `cd apps/web && corepack pnpm lint`: pass.
  - `corepack pnpm --filter @anyu/admin-cli typecheck`: pass.
  - `cd apps/web && corepack pnpm test`: pass, 102 files / 694 tests.
  - `cd apps/web && corepack pnpm build`: pass.
  - `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass, `stateCategory=fail_closed_ready`.
  - `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass, `gateStatus=pass`, `requiredChecksStatus=pass`.
- gateStatus: blocked for `qa:production:admin-ops-preflight` in this shell; pass for code validation/runtime-window/production-preflight.
- commandExitCode: preflight missing-token command returned 1; all validation commands returned 0.
- requiredChecksStatus: implementation validation pass; production Admin/Ops live preflight blocked due missing owner-provided process token.
- optionalChecksStatus: not_applicable.
- targetDeployCommit: not_applicable.
- deployedCommitAtGateStart: not_applicable.
- deployedCommitAtGateEnd: not_applicable.
- freshnessStatus: not_applicable.
- gates skipped and why:
  - production smoke/payment/runtime open: skipped because this task is guard-only and Admin/Ops preflight is blocked until owner provides process-env token.
  - real Email/LINE: skipped because not allowed for this guard task.

## Safety

- production runtime enabled: no.
- payment run: no.
- Email sent: no.
- LINE sent: no.
- Vercel env changed: no.
- DB mutated: no.
- secrets/private data exposed: no.

## Result

- result: partial / blocked by owner action for live production Admin/Ops preflight.
- first failure category: `production_admin_token_missing_owner_action_required`.
- blocker status: remaining blocker. Owner must export production `ADMIN_API_TOKEN` into process env and rerun only the Admin/Ops preflight before another smoke.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed: runtime-window status can still use the production mirror internally, but production smoke now has a separate process-env `pnpm ops` proof gate so this no longer hides the smoke-readiness blocker.
- opportunistic cleanup completed: v3 report classification note added.
- deferred cleanup candidates: consider adding this Admin/Ops preflight to a future composite smoke-readiness command, while keeping `pnpm ops` pure.

## Decisions Made

- Kept Admin/Ops preflight separate from general production-preflight.
- Did not automatically fall back to `.env.production`.
- Did not use direct DB.
- Did not open runtime or run another production smoke.

## Uncertainties / Blockers

- Production `ADMIN_API_TOKEN` is still missing from the current process env.
- The preflight has not passed live production auth yet; only missing-token and mocked success/auth-failure cases are validated.

## Recommended Next Step

Owner exports `ADMIN_API_TOKEN` into process env, then rerun only:

```bash
cd apps/web && corepack pnpm run qa:production:admin-ops-preflight
```

If it passes, proceed to Controlled Production Payment Smoke Retry with Scoped Runtime Config v4, starting from the full pre-open gates.

## Paste-Back Context

Added `qa:production:admin-ops-preflight`, a read-only production smoke guard that proves `pnpm ops` can authenticate with explicit process-env `ADMIN_API_TOKEN` before runtime open/result creation/owner action. The command checks production runtime config get/history through `pnpm ops` and reports sanitized categories. In this shell it correctly blocked with `production_admin_token_missing_owner_action_required`, so no runtime/payment/Email/LINE/DB mutation occurred. Runtime-window status and production-preflight still pass fail-closed. Next action is owner exporting production `ADMIN_API_TOKEN` into process env, then rerunning only the Admin/Ops preflight before another smoke.
