# Module 01 Release Validation Suite v0

## Date

2026-06-06

## Status

Completed.

## Completed Work

- Added reusable Module 01 validation suite script:
  - `apps/web/scripts/module01-release-validation-suite.mjs`
- Added package scripts:
  - `qa:module01:local`
  - `qa:module01:staging`
  - `qa:module01:production-preflight`
  - `qa:module01:release`
- Added generated summary output under ignored local path:
  - `apps/web/.qa/module01-local-summary.json`
  - `apps/web/.qa/module01-staging-summary.json`
  - `apps/web/.qa/module01-production-preflight-summary.json`
  - `apps/web/.qa/module01-release-summary.json`
- Added `.gitignore` coverage for `apps/web/.qa/`.
- Added targeted tests for suite command registration, status aggregation, summary fields, and redaction.
- Kept existing one-off QA commands available as building blocks.

## Command Behavior

### `qa:module01:local`

Runs:

- `corepack pnpm lint`
- targeted Module 01/Admin/payment/access-link tests
- `corepack pnpm test`
- `corepack pnpm build`

Result in this task:

- status: `pass`
- sends real Email: false
- sends real LINE: false
- mutates data: false
- production touched: false

### `qa:module01:staging`

Runs:

- Preview(staging) health/freshness check
- `qa:access-link:smoke`
- `qa:result-checkout:no-card`
- Admin API staging check when `ADMIN_API_TOKEN` is configured
- manual channel acceptance placeholder

Default behavior:

- does not run `qa:line-access-link:smoke`
- does not send real staging Email or LINE by default
- mutates staging test data through existing operator-safe smokes
- includes read-only production fail-closed checks through existing staging smoke helpers

Result in this task:

- status: `partial`
- required staging smokes: pass
- Admin API lookup: partial, `skipped_missing_admin_token`
- real channel checks: partial, not run by default
- sends real Email: false
- sends real LINE: false
- mutates data: true, staging test artifacts only
- production touched: true, read-only fail-closed checks only

### `qa:module01:production-preflight`

Runs:

- `qa:production:payment-preflight -- --source vercel-production --mode dry-run`

Result in this task:

- status: `pass`
- production public/fail-closed preflight: pass
- sends real Email: false
- sends real LINE: false
- mutates data: false
- production touched: true, read-only only

### `qa:module01:release`

Runs:

- `qa:module01:local`
- `qa:module01:staging`
- `qa:module01:production-preflight`

Result in this task:

- status: `partial`
- local: pass
- staging: partial
- production preflight: pass
- next required action: `owner_accept_release_gate_or_fix_partials`

The aggregate is partial because Preview(staging) `ADMIN_API_TOKEN` was not provided and real channel checks are intentionally not run by default.

## Summary Schema

Each summary includes:

- `module`
- `environment`
- `command`
- `status`
- `generatedAt`
- `checks`
- `manualRequired`
- `blockers`
- `warnings`
- `sendsRealEmail`
- `sendsRealLine`
- `mutatesData`
- `productionTouched`
- `ownerApprovalRequired`
- `nextRequiredAction`

Statuses:

- `pass`
- `partial`
- `blocked`
- `skipped`

## Admin API Smoke Placement

Admin API staging smoke is now a check inside `qa:module01:staging`.

Behavior:

- if `ADMIN_API_TOKEN` is missing: `partial` with `skipped_missing_admin_token`
- if token is present:
  - no-token request must return `401`
  - wrong-token request must return `401`
  - valid token plus known result ID can verify sanitized response
- valid result lookup requires `MODULE01_ADMIN_LOOKUP_RESULT_ID` or `QA_MODULE01_ADMIN_RESULT_ID`

No web env mirror files or DB URLs are read for Admin API smoke.

## Manual Channel Validation

Real Email/LINE channel validation is intentionally not part of the default suite.

Future command documented but not implemented in this task:

- `qa:module01:staging:channels`

Manual fields tracked by default staging/release summaries:

- `ownerEmailReceived`
- `ownerEmailLinkOpenedPaidResult`
- `ownerLineReceived`
- `ownerLineLinkOpenedPaidResult`

## Production Safety

- Production runtime was not enabled.
- Production checkout was not enabled.
- No production payment was run.
- No production Email or LINE was sent.
- No Vercel env values were modified.
- Production preflight ran in dry-run mode only.

## Validation Run

- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm exec vitest run src/tests/module01-release-validation-suite.test.ts`: passed
- `cd apps/web && corepack pnpm test`: passed, 83 files / 590 tests
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm run qa:module01:local`: pass
- `cd apps/web && corepack pnpm run qa:module01:staging`: partial
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass
- `cd apps/web && corepack pnpm run qa:module01:release`: partial

## Architecture Decisions

- Existing one-off smokes remain as building blocks.
- Future Module 01 validation handoffs should run `qa:module01:staging` or `qa:module01:release` and report the suite gate result.
- Admin API staging smoke should not be a standalone driver; it belongs inside the staging suite.
- Production controlled smoke remains blocked unless the release suite passes or the owner accepts a documented partial.

## Tech Debt Review

- New technical debt introduced: none known.
- Existing technical debt observed: real channel validation still lacks a dedicated owner-approved suite command.
- Opportunistic cleanup completed: generated QA summary artifacts are ignored under `apps/web/.qa/`.
- Deferred cleanup candidates:
  - implement `qa:module01:staging:channels`
  - add a known staging result fixture/source for Admin API smoke
  - deprecate legacy direct DB support lookup after Admin API/CLI smoke is stable

## Suggested Next Step

Set Preview(staging) `ADMIN_API_TOKEN` and provide a safe known staging result ID, then rerun:

```bash
cd apps/web && corepack pnpm run qa:module01:staging
```

If that passes or the owner accepts the remaining channel-manual partial, use the suite output as the gate for any future production-readiness task.
