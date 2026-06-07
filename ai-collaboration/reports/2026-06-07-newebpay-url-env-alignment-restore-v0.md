# NewebPay URL Env Alignment Restore v0

## Metadata

- task name: NewebPay URL Env Alignment Restore v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-newebpay-url-env-alignment-restore-v0.md`
- commit: pending
- branch / push status: pending
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T14:04:18Z
- taskCompletedAt: 2026-06-07T14:13:00Z
- totalWallClockDuration: 8m42s
- humanWaitDuration: 0m
- netCodexWorkDuration: 8m42s

## Context

- why this task exists: NewebPay ReturnURL Alignment Check v0 found the code/local mirror canonical ReturnURL aligned, but Vercel URL-bearing env values pulled blank for Preview(staging) and Production.
- upstream blocker / mainline context: production payment smoke remains blocked until Vercel runtime URL envs are restored, the provider dashboard is owner-verified, and production Admin/Ops credentials are configured.
- out-of-scope items: production runtime open, payment, Email/LINE sends, provider credential changes, DB mutation, migrations, theme UI, and Module 02.

## Scope

- what changed: restored only two non-secret URL-bearing Vercel env keys in Preview(staging) and Production; redeployed Preview(staging) and Production fail-closed; updated docs/status artifacts.
- what did not change: no provider secrets, DB URLs, API tokens, crypto secrets, scoped runtime config values, old runtime flags, provider dashboard settings, or product code changed.

## Implementation Summary

- files / areas changed: report, handoff, summary log, dashboard.
- key design decisions: used `vercel env add --force --no-sensitive` for public URL-bearing values so future `vercel env pull` alignment checks can verify them deterministically.
- local / opportunistic cleanup decisions: deleted temporary Vercel env pull files after verification.

## Local Mirror URL State

- staging local mirror:
  - `NEXT_PUBLIC_APP_URL`: staging domain
  - `NEWEBPAY_NOTIFY_URL`: staging NotifyURL path
- production local mirror:
  - `NEXT_PUBLIC_APP_URL`: production domain
  - `NEWEBPAY_NOTIFY_URL`: production NotifyURL path
- local mirror result: pass.
- canonical derived ReturnURLs:
  - staging: `https://staging.anyu.tw/payment/newebpay/return`
  - production: `https://anyu.tw/payment/newebpay/return`

## Vercel Sync Result

- synced key names:
  - `NEXT_PUBLIC_APP_URL`
  - `NEWEBPAY_NOTIFY_URL`
- targets:
  - Vercel Preview(staging)
  - Vercel Production
- sync method:
  - `vercel env add <key> preview staging --value <url> --yes --force --no-sensitive`
  - `vercel env add <key> production --value <url> --yes --force --no-sensitive`
- result: pass.
- verification: `vercel env pull` for Preview(staging) and Production now returns non-blank URL values matching local mirrors for the two target keys.
- note: first overwrite without `--no-sensitive` still pulled blank because Vercel treats Preview/Production env values as sensitive by default. The final overwrite used `--no-sensitive` because these URLs are public/non-secret and need deterministic alignment verification.

## Redeploy Result

- Preview(staging) redeploy:
  - result: pass.
  - alias: `https://staging.anyu.tw`.
  - deployment id: `dpl_7zr6KUsUhJA7APReSiqtiuzsZ3zN`.
  - deployedCommitAtGateStart: `84e2a4af116d`.
  - deployedCommitAtGateEnd: `84e2a4af116d`.
  - freshnessStatus: pass.
- Production redeploy:
  - result: pass.
  - alias: `https://anyu.tw` and `https://www.anyu.tw`.
  - deployment id: `dpl_5u3gc691wcG3gD4BHFCdmnFMAPQ5`.
  - deployedCommitAtGateStart: `fe300e84f3a3`.
  - deployedCommitAtGateEnd: `fe300e84f3a3`.
  - freshnessStatus: pass.
- production runtime posture after redeploy: fail-closed.

## Alignment Check Result

- code canonical ReturnURL: `/payment/newebpay/return`.
- local mirrors aligned: pass.
- Vercel Preview(staging) URL env values non-blank and aligned: pass.
- Vercel Production URL env values non-blank and aligned: pass.
- process docs aligned: pass from prior policy update.
- production gate no longer blocked by `vercel_returnurl_env_blank`.

## Owner Dashboard Action Required

Codex did not inspect or mutate the NewebPay dashboard.

Owner must verify/update:

- staging ReturnURL: `https://staging.anyu.tw/payment/newebpay/return`
- staging NotifyURL: `https://staging.anyu.tw/api/payments/newebpay/notify`
- production ReturnURL: `https://anyu.tw/payment/newebpay/return`
- production NotifyURL: `https://anyu.tw/api/payments/newebpay/notify`

Codex must not claim the provider dashboard is updated until owner confirms or direct dashboard evidence is provided.

## Old Module Route Decision

- old module route exists: `/m/[moduleSlug]/payment/return`.
- active checkout generation does not reference it.
- active generated checkout contract is provider-level `/payment/newebpay/return`.
- status: compatibility-only, not a smoke blocker once canonical Vercel/provider config is aligned.
- recommended later cleanup: convert legacy module route to an explicit compatibility redirect if owner wants the stricter invariant.

## Validation

- commands run:
  - local mirror key check for `NEXT_PUBLIC_APP_URL` and `NEWEBPAY_NOTIFY_URL`: pass.
  - Vercel env overwrite for Preview(staging) and Production target keys: pass.
  - Vercel env pull verification for Preview(staging) and Production target keys: pass.
  - `vercel inspect https://staging.anyu.tw`: pass, ready Preview deployment.
  - `vercel inspect https://anyu.tw`: pass, ready Production deployment.
  - `curl -sS https://staging.anyu.tw/api/health`: pass.
  - `curl -sS https://anyu.tw/api/health`: pass.
  - `cd apps/web && corepack pnpm run qa:deploy:freshness -- --env staging --expected-commit 84e2a4af116d`: pass.
  - `cd apps/web && corepack pnpm run qa:deploy:freshness -- --env production --expected-commit fe300e84f3a3`: pass.
  - `cd apps/web && corepack pnpm run qa:production:runtime-window -- --action status`: pass, `stateCategory=fail_closed_ready`.
  - `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass, `gateStatus=pass`.
  - `corepack pnpm --silent ops auth status --env production --json`: pass, token unavailable, source `missing`.
  - `corepack pnpm --silent ops auth status --env staging --json`: pass, token unavailable, source `missing`.
- gateStatus: pass for URL/env alignment; production Admin/Ops preflight not run because credentials are not configured locally.
- commandExitCode: all executed commands returned 0 after the scoped redeploy retry with explicit Vercel scope.
- requiredChecksStatus: pass for URL/env alignment and production fail-closed gates.
- optionalChecksStatus: Admin/Ops preflight skipped due missing local ops credentials.
- gates skipped and why:
  - `qa:production:admin-ops-preflight`: skipped because `pnpm ops auth status` reports no staging/production token available locally.
  - production payment/runtime open/Email/LINE: skipped by task scope.
  - `qa:module01:staging:channels`: skipped by task scope.

## Safety

- production runtime enabled: no.
- payment run: no.
- Email sent: no.
- LINE sent: no.
- Vercel env changed: yes, only `NEXT_PUBLIC_APP_URL` and `NEWEBPAY_NOTIFY_URL`.
- Vercel provider secrets changed: no.
- DB mutated: no.
- secrets/private data exposed: no.
- temporary Vercel env pull files deleted: yes.

## Result

- result: pass for Vercel URL env alignment restore.
- first failure category: none for URL/env alignment.
- blocker status:
  - owner dashboard verification remains required.
  - ops credentials remain missing locally for `qa:production:admin-ops-preflight`.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed: legacy module ReturnURL route is compatibility-only but not an explicit redirect.
- opportunistic cleanup completed: URL env values are now non-sensitive/readable in Vercel for deterministic future alignment checks.
- deferred cleanup candidates: strict compatibility redirect for `/m/[moduleSlug]/payment/return` if owner wants it.

## Decisions Made

- Restored Vercel URL-bearing env values from local mirrors.
- Made those two public URL values non-sensitive in Vercel.
- Redeployed Preview(staging) and Production fail-closed.
- Did not claim NewebPay dashboard alignment without owner confirmation.
- Did not change runtime config, provider secrets, DB data, or product code.

## Uncertainties / Blockers

- NewebPay dashboard staging ReturnURL currently appears to use the old module route per owner context; owner must verify/update it to canonical provider-level route.
- Local ops credentials are still missing for staging and production, so `qa:production:admin-ops-preflight` remains unavailable until owner configures `pnpm ops auth`.

## Recommended Next Step

Owner verifies/updates NewebPay dashboard ReturnURL/NotifyURL settings, then configures ops credentials with `pnpm ops auth set-token --env staging` and `pnpm ops auth set-token --env production`, reruns `qa:production:admin-ops-preflight`, and only then proceeds to Controlled Production Payment Smoke Retry with Scoped Runtime Config v4.

## Paste-Back Context

Vercel Preview(staging) and Production now have non-blank, aligned `NEXT_PUBLIC_APP_URL` and `NEWEBPAY_NOTIFY_URL` values restored from local mirrors. Preview(staging) and Production were redeployed without opening runtime; production remains fail-closed and production-preflight passes. The remaining blockers are owner verification/update of NewebPay dashboard ReturnURL/NotifyURL and local ops credential setup for `qa:production:admin-ops-preflight`.
