# Production Source-of-Truth Reconciliation v0

Date: 2026-05-30

## Executive Summary

`origin/main` was confirmed to be a strict ancestor of `origin/staging`, so the safe reconciliation method is a fast-forward promotion from the final `staging` commit produced by this task to `origin/main`.

No product/runtime code was changed. No production env values were read or modified. No deployment command was run.

## Preflight Results

Commands run:

- `pwd`
- `git rev-parse --show-toplevel`
- `git status --short --branch`
- `git fetch origin --prune`
- `git rev-parse origin/main`
- `git rev-parse origin/staging`
- `git merge-base --is-ancestor origin/main origin/staging && echo "main_is_ancestor_of_staging"`
- `git rev-list --left-right --count origin/main...origin/staging`
- `git log --oneline --decorate -10 origin/main`
- `git log --oneline --decorate -10 origin/staging`

Before reconciliation:

| Ref | SHA |
| --- | --- |
| `origin/main` | `4c2487a73587b9efee8f4b216cc47675219524c3` |
| `origin/staging` | `c3baf12ff51649092669ef0855d5867c19298d21` |

Branch relationship:

- `origin/main` is an ancestor of `origin/staging`.
- Divergence before this task's docs commit: `0 76`.
- There were no `origin/main` commits ahead of `origin/staging`.

Worktree note:

- The only dirty file during preflight was this task's newly created handoff file, required by the repository operating rules.
- No unrelated pre-existing dirty changes were present.

## Reconciliation Method

Chosen method:

1. Commit this task's handoff, report, and summary log on `staging`.
2. Push the final `staging` task commit to `origin/staging`.
3. Fast-forward `origin/main` to the same final commit with a normal non-forced push.

Why this method:

- It keeps the reconciliation documentation in both `staging` and `main`.
- It avoids checking out `main` with task docs in progress.
- It avoids merge commits and preserves the strict fast-forward relationship.
- It does not rewrite history.

Expected after-state:

- `origin/main` and `origin/staging` point to the same final reconciliation commit for this task.
- Future production release source-of-truth can be `main` again.

## Production Deployment Policy

Recommended workflow going forward:

- `staging` remains the development/integration branch.
- `main` is the production release/source-of-truth branch.
- Production deploys should come from `main` promotion, not ad hoc direct staging deploys.
- Direct `vercel deploy --prod` from `staging` should be treated as an emergency/manual exception and documented with the exact branch, commit, and reason.
- Before any payment runtime launch, verify:
  - `origin/main` contains the intended release commit.
  - Vercel production deploy points to the `anyu-next` project.
  - `anyu.tw` and `www.anyu.tw` are attached to `anyu-next`.
  - Payment runtime flags remain explicitly controlled.

## Production Deployment / Safety Status

No production deploy was intentionally triggered by this task before the report was written.

If Vercel automatically deploys from the `main` push, run safe checks after deployment:

- `https://anyu.tw/`
- `https://anyu.tw/refund`
- `https://anyu.tw/legal`
- `https://anyu.tw/api/health`
- checkout route disabled behavior
- fake-paid route disabled behavior

Expected safety posture remains:

- merchant-review public content visible
- payment runtime disabled
- checkout route fail-closed unless explicitly enabled
- operator fake-paid route fail-closed unless explicitly enabled

## Old Vercel Project / Domain Ambiguity

No Vercel domain/project ownership changes were made.

Owner UI action remains:

- Verify `anyu.tw` and `www.anyu.tw` belong only to the intended `anyu-next` project.
- Remove stale domain/alias settings from the old `anyu` project if Vercel UI still shows them.

## Tech Debt / Cleanup Review

- New technical debt introduced: none.
- Existing technical debt addressed: `main` being behind `staging` is addressed by the planned fast-forward promotion in this task.
- Existing technical debt remaining: old Vercel `anyu` project/domain ambiguity still needs owner UI verification.
- Opportunistic cleanup completed: none beyond source-of-truth reconciliation.
- Deferred cleanup candidates:
  - Update production deployment runbook to require `main` promotion and post-deploy health marker checks.
  - Archive or disconnect stale old Vercel project/domain settings if unused.

## Recommended Next Step

Queue Provider Selection / Phase 4B Plan v0 can proceed after confirming the final push makes `origin/main` and `origin/staging` match.
