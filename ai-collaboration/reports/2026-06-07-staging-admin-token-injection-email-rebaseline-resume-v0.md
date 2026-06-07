# Staging Admin Token Injection + Email Rebaseline Resume v0

## Metadata

- task name: Staging Admin Token Injection + Email Rebaseline Resume v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-staging-admin-token-injection-email-rebaseline-resume-v0.md`
- commit: pending at report creation; final commit is in completion summary
- branch / push status: pending
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T11:00:14Z
- taskCompletedAt: 2026-06-07T11:15:42Z
- totalWallClockDuration: 15m28s
- humanWaitDuration: 0m
- netCodexWorkDuration: 15m28s

## Context

- why this task exists: Staging Pre-Payment Save + Access-Link E2E Rebaseline v1 stopped before result creation because `pnpm ops config get --env staging ...` returned `admin_token_missing`.
- upstream blocker / mainline context: Missing Preview Admin token in process env was a repeated QA foundation blocker and prevented staging evidence after the pre-payment Email/access-link fix.
- out-of-scope items: production runtime, production payment, real Email, real LINE, manual LINE, Vercel env changes, direct DB, theme UI, and Module 02.

## Scope

- what changed: added a safe staging QA Admin token resolver, wired it into staging QA/Admin helpers, documented the approved token injection policy, and resumed the focused staging Email save -> mock paid -> access-link evidence path.
- what did not change: `pnpm ops` still does not read app env mirrors; no product route behavior, payment behavior, runtime config behavior, provider credentials, or Vercel env changed.

## Implementation Summary

- files / areas changed: staging QA token helper, staging release-validation Admin checks, staging runtime-config QA helper, staging result wait helper, tests, process docs, handoff, dashboard, summary log, and this report.
- key design decisions: staging QA runners may resolve `ADMIN_API_TOKEN` from process env first, then `apps/web/.env.staging`; they inject the token into subprocess env before invoking `pnpm ops`; only the safe source category is reported.
- local / opportunistic cleanup decisions: extended `qa:module01:wait-result` to use the same token resolver so focused Admin/Ops evidence does not require manual shell export.

## Token Source Policy

- process env token wins when `ADMIN_API_TOKEN` is already present.
- if missing and target env is staging, the QA runner loads `ADMIN_API_TOKEN` from the approved local staging mirror through the shared env parser.
- if still missing, the runner stops with `staging_admin_token_unavailable_owner_action_required`.
- token values, lengths, prefixes, suffixes, hashes, and checksums are never printed.
- `.env.production` is never loaded for staging QA token injection.
- `pnpm ops` remains a pure Admin API client and does not read app env mirror files.

## Focused Staging Rebaseline Result

- targetDeployCommit: `9edcd43`
- deployedCommitAtGateStart: `9edcd431a91d`
- deployedCommitAtGateEnd: `9edcd431a91d`
- freshnessStatus: `pass`
- mixedDeploymentDetected: `false`
- staging runtime config: `payment.window.enabled=true`, `payment.global.disabled=false`
- smoke fixture: `status=pass`, `smokeRunIdPresent=true`, `freshDimensionPresent=true`, `expectedFreshResult=true`
- fresh staging result: created through tracked fixture, `cacheHit=false`, result ID present, tokenized URL not printed
- checkout-start: HTTP 200, mandatory save before payment, Email save route present, payment locked before save
- Email save: `pass`, HTTP 303, `recovery=email_saved`, raw Email not printed
- checkout unlock: `pass`, saved confirmation and provider fields visible after Email save
- mock/no-card paid transition: `pass`, payment intent paid, entitlement active, generation queued and completed through polling
- access-link readiness: `pass`, paid access render completed
- `/r` resolution: covered by the full staging gate access-link smoke; resolver passed without raw token output
- Admin/Ops evidence: `qa:module01:wait-result` passed using `adminToken.sourceCategory=staging_mirror`; paid result, payment, and generation were completed; Email access link was saved/sent/active; LINE was absent by design
- real channel receipt: not verified; no real Email/LINE send was run

## Validation

- commands run:
- `cd apps/web && corepack pnpm exec vitest run src/tests/admin-token-for-qa.test.ts src/tests/staging-runtime-config-qa.test.ts src/tests/module01-staging-result-wait.test.ts src/tests/module01-release-validation-suite.test.ts`: pass, 4 files / 26 tests.
- `cd apps/web && corepack pnpm run qa:module01:staging-runtime-config`: pass, token source `staging_mirror`.
- `cd apps/web && corepack pnpm run qa:deploy:freshness -- --env staging --expected-commit 9edcd43`: pass.
- `cd apps/web && corepack pnpm run qa:module01:smoke-fixture -- --json`: pass.
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: pass.
- `cd apps/web && corepack pnpm run qa:module01:wait-result -- --env staging --result-id <safe-result-id> --timeout 30000 --interval 2000 --json`: pass.
- `cd apps/web && MODULE01_EXPECTED_DEPLOY_COMMIT=9edcd43 corepack pnpm run qa:module01:staging`: pass.
- `cd apps/web && corepack pnpm lint`: pass.
- `cd apps/web && corepack pnpm test`: pass, 99 files / 681 tests.
- `corepack pnpm --filter @anyu/admin-cli test`: pass, 3 files / 29 tests.
- `corepack pnpm --filter @anyu/admin-cli typecheck`: pass.
- `cd apps/web && corepack pnpm build`: pass.
- docs presence check: pass.
- dashboard HTML sanity check: pass.
- secret/private scan: pass; matches were literal policy/history references and regex guard constants only, not secret values or tokenized URLs.
- `git diff --check`: pass.
- gateStatus: `pass`
- commandExitCode: `0` for `qa:module01:staging`
- requiredChecksStatus: `pass`
- optionalChecksStatus: `skipped` because real channel checks remain manual/owner-approved; Admin API and Admin CLI lookup checks both passed.
- targetDeployCommit: `9edcd43`
- deployedCommitAtGateStart: `9edcd431a91d`
- deployedCommitAtGateEnd: `9edcd431a91d`
- freshnessStatus: `pass`
- gates skipped and why: manual LINE and real staging Email/LINE channel sends were skipped by task scope; production smoke/preflight was skipped because this was staging-only rebaseline work.

## Safety

- production runtime enabled: no
- payment run: no real provider payment; staging no-card/operator fake-paid path only
- Email sent: no real Email send intentionally run; staging Admin summary marks the access link active/sent as part of fake-paid readiness state
- LINE sent: no
- Vercel env changed: no
- DB mutated: staging QA result/payment/access-link data yes; production data no
- secrets/private data exposed: no
- production contact: only existing staging gate read-only fail-closed checks queried production health/disabled routes; no production runtime, payment, result creation, Email, LINE, Vercel env, or data mutation occurred

## Result

- result: pass
- first failure category: not_applicable
- blocker status: Preview Admin token injection blocker resolved; focused staging Email save -> mock paid -> access-link path passed

## Tech Debt / Cleanup Notes

- new technical debt introduced: none known.
- existing technical debt observed: `qa:module01:staging` still reports real channel checks as skipped by default, which is intentional until owner-approved channel validation exists.
- opportunistic cleanup completed: `qa:module01:wait-result` now uses the same approved staging Admin token resolver as the release suite.
- deferred cleanup candidates: LINE staging bind validation remains a separate next step after the Email/access-link path is stable.

## Decisions Made

- Used staging token source category reporting instead of token output.
- Kept `pnpm ops` free of app env mirror loading.
- Ran the full staging gate once after focused evidence to verify suite-level Admin API/CLI checks no longer remain partial because of missing token.
- Did not run manual LINE or real channel sends.

## Uncertainties / Blockers

- No blocker remains for the Email save -> mock paid -> access-link staging path.
- LINE staging bind remains unverified in this task by design.

## Recommended Next Step

Add LINE staging bind validation only after Email path stability is accepted, then consider production only after staging evidence is complete and owner approves.

## Paste-Back Context

Staging Admin token injection is now implemented for QA runners without changing `pnpm ops`. The focused staging Email save -> mock paid -> access-link path passed on deployed commit `9edcd43`, Admin/Ops evidence passed using `staging_mirror` token injection, and the full staging gate passed with required checks and Admin API/CLI checks green. No production runtime/payment/data mutation, real Email, or real LINE occurred.
