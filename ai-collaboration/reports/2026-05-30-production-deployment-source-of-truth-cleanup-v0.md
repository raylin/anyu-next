# Production Deployment Source-of-Truth Cleanup v0

Date: 2026-05-30

## Executive Summary

Production is currently safe for the merchant-review public content use case, but production source-of-truth is operationally inconsistent:

- Local `staging` and `origin/staging` match at `ca8275bf69ac7a07a92bd28ea43289cc876136fb`.
- `origin/main` is a strict ancestor of `origin/staging` and is 75 commits behind.
- `https://anyu.tw` currently resolves to the Vercel `anyu-next` production deployment.
- Production health reports `environment: production`, `gitBranch: staging`, and `gitCommit: 3de74ca20c74`, confirming the current production deployment was built from `staging`, not `main`.
- Vercel CLI shows both `anyu-next` and old `anyu` projects in the account, and both list `https://anyu.tw` as latest production URL in project list output. Direct inspection of `https://anyu.tw` resolves to `anyu-next`.
- The previous local git lock/permission issue is not present now; `git fetch origin --prune` succeeded and no lock files were found.

Recommended source-of-truth decision:

- Short term: treat `origin/staging` plus the inspected Vercel production deployment as the operational source of truth.
- Before payment launch or Phase 4B production-impacting work: reconcile `main` to `staging` through an explicit owner-approved fast-forward or PR, then use `main` as canonical production source.
- Clean up or archive the old Vercel `anyu` project/domain association if the Vercel UI still shows `anyu.tw` attached there.

## Git State Audit

Commands run:

- `pwd`
- `git rev-parse --show-toplevel`
- `git branch --show-current`
- `git status --short --branch`
- `find .git -name '*.lock' -maxdepth 5 -ls`
- `ls -le .git/FETCH_HEAD .git/refs/remotes/origin .git/refs/remotes/origin/staging`
- `ps -axo pid,comm,args | rg '[g]it|[s]sh'`
- `git remote -v`
- `git fetch origin --prune`
- `git rev-parse HEAD`
- `git rev-parse origin/staging`
- `git rev-parse origin/main`
- `git log --oneline --decorate -10 origin/staging`
- `git log --oneline --decorate -10 origin/main`
- `git rev-list --left-right --count origin/main...origin/staging`

Findings:

| Check | Result |
| --- | --- |
| Repo root | `/Users/raylin/Projects/anyu-next` |
| Current branch | `staging` |
| Worktree | Clean except this task's new handoff/report/summary docs during execution |
| Local HEAD | `ca8275bf69ac7a07a92bd28ea43289cc876136fb` |
| `origin/staging` | `ca8275bf69ac7a07a92bd28ea43289cc876136fb` |
| `origin/main` | `4c2487a73587b9efee8f4b216cc47675219524c3` |
| Main/staging divergence | `0 75`, meaning `main` is 75 commits behind `staging` with no commits ahead |
| `.git/FETCH_HEAD` permission issue | Not reproduced |
| `.git/refs/remotes/origin/staging.lock` | Not present |
| Other `.git/*.lock` files | None found |
| Git process conflict | None found |
| Cleanup performed | No lock removal needed |

Recent `origin/staging` commits:

- `ca8275b` feat: add paid job queue trigger noop adapter
- `f2356e4` docs: map payment runtime env flags
- `cda089e` chore: remove processor auth diagnostics
- `cd5f16e` docs: scan anyu engineering quality
- `a8a8bb5` docs: plan paid job queue trigger
- `14ccdd1` ops: refresh production merchant review content
- `3de74ca` docs: snapshot anyu current state
- `b40a5d2` docs: draft newebpay supplement email
- `d68bbb7` docs: publish newebpay review content
- `d6051ec` docs: plan newebpay review remediation

Recent `origin/main` commits:

- `4c2487a` feat: track unlocked result views
- `5b5f822` ops: record module production monitoring
- `3e79476` ops: record production short-code smoke
- `092ba20` feat: add module funnel metrics report
- `64e9765` feat: add operator test mode
- `697a16c` docs: plan module follow-up interactions
- `5bbbff0` fix: show pending state for unlocked paid links
- `d1ac8e9` copy: refine module conversion trust
- `091e40c` ops: activate module low-key production
- `7c891c9` docs: decide module production activation

## Production Source-of-Truth Analysis

Observed source-of-truth state:

- `main` looks like the intended canonical production branch historically, because `origin/HEAD` points to `origin/main`.
- `staging` is currently the de facto source of truth for the latest payment foundation and merchant-review public content.
- Production has already been deployed directly from a staging commit using Vercel production deploy, not from `main`.
- Production health confirms this with:
  - `environment: production`
  - `gitBranch: staging`
  - `gitCommit: 3de74ca20c74`
  - `routeBundleVersion: payment-foundation-2026-05-29`

Risk if left unchanged:

- A future production deploy from `main` would likely roll back payment-foundation routes and public merchant-review content.
- ChatGPT/Codex/owner may incorrectly assume production equals `main`.
- Vercel project history contains direct production deploys and preview deploys that are hard to reason about from Git alone.
- `main` being 75 commits behind makes emergency rollback/promotion decisions ambiguous.

Recommendation:

- Do not merge or push `main` automatically from this task.
- Owner should explicitly approve a source-of-truth cleanup task:
  - Fast-forward `main` to `staging`, if the team accepts `staging` as the current production source.
  - Or create a PR from `staging` to `main` and review the 75-commit delta before merging.
  - After reconciliation, production deploys should come from `main` or a documented production promotion command, not ad hoc direct deploys from arbitrary local state.

## Vercel Project / Domain Audit

Commands run:

- `vercel --version`
- `vercel whoami`
- `.vercel/project.json` inspection with IDs redacted
- `vercel projects ls`
- `vercel project inspect anyu-next`
- `vercel project inspect anyu`
- `vercel domains ls`
- `vercel inspect https://anyu.tw`
- `vercel inspect https://anyu.tw --format=json`
- `vercel ls anyu-next`
- `vercel ls anyu`

Findings:

| Item | Result |
| --- | --- |
| Vercel CLI | `54.5.1` |
| Account | `studioanyu-1488` |
| Local Vercel project link | `anyu-next` |
| `anyu-next` root directory | `apps/web` |
| `anyu-next` build command | `corepack pnpm build` |
| `anyu-next` install command | `corepack pnpm install --frozen-lockfile` |
| `https://anyu.tw` inspect result | Production deployment under project `anyu-next` |
| Production deployment URL | `anyu-next-dwm3qv4vi-studioanyu-1488s-projects.vercel.app` |
| Production aliases | `https://anyu.tw`, `https://www.anyu.tw`, and Vercel project aliases |
| Old project `anyu` | Still exists, root directory `.`, last production deployments are 24+ days old |
| Domain list | One domain `anyu.tw` under the account |

Important caveat:

- `vercel projects ls` shows both `anyu-next` and old `anyu` with `https://anyu.tw` in the "Latest Production URL" column.
- Direct deployment inspection of `https://anyu.tw` resolves to `anyu-next`, so live production is currently correct.
- The owner should still verify in Vercel UI that `anyu.tw` and `www.anyu.tw` are attached only where intended, and that the old `anyu` project cannot accidentally receive future aliases or production deploys.

Owner Vercel UI checks:

1. Open Vercel dashboard for `studioanyu-1488`.
2. Open project `anyu-next`.
3. Confirm Domains tab includes `anyu.tw` and `www.anyu.tw`.
4. Confirm the current deployment behind `anyu.tw` is the `anyu-next` production deployment.
5. Open old project `anyu`.
6. Confirm Domains tab does not actively own `anyu.tw` / `www.anyu.tw`, or remove stale domain/alias association if present.
7. Confirm production deployment settings and Git branch settings before the next production deploy.

## Production Route Safety Checks

Commands run:

- `curl https://anyu.tw/`
- `curl https://anyu.tw/refund`
- `curl https://anyu.tw/legal`
- `curl https://anyu.tw/api/health`
- `POST https://anyu.tw/api/modules/ambiguous-temperature/checkout/newebpay`
- `POST https://anyu.tw/api/operator/fake-paid-success`
- `GET https://anyu.tw/m/ambiguous-temperature/payment/return?...` with redacted synthetic query values
- `POST https://anyu.tw/api/modules/ambiguous-temperature/paid-result/status` with synthetic invalid body

Results:

| URL / route | Result |
| --- | --- |
| `https://anyu.tw/` | `200`, homepage contains product/service content, `曖昧溫度計`, `AI 關係互動分析報告`, one-time/non-subscription copy, refund/support references, and `hello@anyu.tw`. |
| `https://anyu.tw/refund` | `200`, refund page contains refund/system/digital-AI/support content and `hello@anyu.tw`. |
| `https://anyu.tw/legal` | `200`, legal page contains legal/service/refund/support references and `hello@anyu.tw`. |
| `https://anyu.tw/api/health` | `200`, production health reports `anyu-web`, production env, staging branch, `3de74ca20c74`, and `payment-foundation-2026-05-29`. |
| Checkout creation route | JSON `404 not_found`, route-controlled, consistent with checkout/runtime disabled. |
| Operator fake-paid route | JSON `404 not_found`, route-controlled, consistent with operator fake-paid disabled. |
| ReturnURL route | `200`, read-only pending/waiting UX renders for synthetic input. |
| Paid-result status synthetic invalid body | JSON `400 invalid_input`, no paid access or private data exposed. |

Payment safety conclusion:

- Production merchant-review public content is live.
- Payment runtime remains effectively disabled for public checkout/fake-paid creation paths.
- No production env values were inspected or changed.
- No real payment attempt was made.

## Recommended Production Workflow

Short-term:

- Treat `origin/staging` as the source branch for active engineering.
- Treat the current production deployment as a direct Vercel production deployment from a known staging commit (`3de74ca20c74`) for merchant-review content only.
- Do not deploy production from `main` until `main` is reconciled.

Before Phase 4B production-impacting work:

1. Decide whether `main` should be canonical production.
2. If yes, reconcile `main`:
   - Preferred: PR from `staging` to `main`, review the 75 commits, merge, then let production deploy from `main`.
   - Fast path if owner accepts: fast-forward `main` to `origin/staging` and push `main` after an explicit approval.
3. Document production deploy command/source in the production runbook.
4. Confirm Vercel `anyu-next` Git settings use the intended production branch.
5. Confirm old `anyu` project has no active `anyu.tw`/`www.anyu.tw` domain ownership.

Branch-scoped Preview note:

- Keep the known caveat in all staging env tasks: branch-scoped Preview(`staging`) env vars override general Preview env vars.

## Blockers

- No technical blocker for continuing local Phase 4A/Phase 4B planning.
- Production source-of-truth remains an owner decision because reconciling/pushing `main` changes release governance.

## Tech Debt / Cleanup Review

- New technical debt introduced: none; no product/runtime code changed.
- Existing technical debt observed:
  - `main` is 75 commits behind `staging`.
  - Direct production deploy from staging is not reflected in Git branch governance.
  - Old Vercel `anyu` project remains present and can confuse project/domain interpretation.
- Opportunistic cleanup completed: verified no current git lock files; no deletion required.
- Deferred cleanup candidates:
  - Owner-approved `main` reconciliation.
  - Vercel domain/project cleanup for old `anyu`.
  - Production deployment runbook update to require source branch/commit verification.

## Recommended Next Task

Production Source-of-Truth Reconciliation v0:

- Owner decides whether to fast-forward `main` to `staging` or use a PR.
- Verify Vercel production branch/project/domain settings.
- Update production deployment runbook with the chosen workflow.

If owner prefers to continue engineering first, the next engineering task can be Queue Provider Selection / Phase 4B Plan v0, but production launch should not proceed until source-of-truth is reconciled.
