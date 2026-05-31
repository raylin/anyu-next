# Local Git Remote-Tracking Ref Permission Repair v0 Handoff

## Date

2026-05-31

## Task

Safely repair local Git remote-tracking ref / `FETCH_HEAD` permission issues so `git fetch`, local remote-tracking refs, and `git status` work normally again.

## Context

The repository repeatedly shows:

- Push reaches GitHub successfully.
- `git ls-remote` confirms the remote SHA.
- Local `origin/staging` cannot update.
- `git status` reports stale `[ahead N]`.
- Errors reference `.git/refs/remotes/origin/staging.lock` or `.git/FETCH_HEAD` permission problems.

## Constraints

- Local Git hygiene only.
- Do not force push.
- Do not rewrite history.
- Do not delete uncommitted work.
- Do not reset hard.
- Do not modify app/runtime behavior, Vercel env, production flags, or deploy.
- Only remove stale lock files if no Git process is running.
- Only repair ownership/permissions on narrow `.git` paths if inspection confirms it is safe.

## Planned Work

1. Capture current Git state and remote SHAs.
2. Inspect `.git/FETCH_HEAD`, origin remote-tracking refs, lock files, packed refs, and active Git processes.
3. Determine minimal safe repair.
4. Run `git fetch origin --prune` after repair and verify local refs.
5. Document root cause, repair actions, before/after status, and residual risk.
6. Commit and push documentation if validation passes.

## Initial Observed State

- Working directory: `/Users/raylin/Projects/anyu-next`
- Branch: `staging`
- Initial status: `## staging...origin/staging [ahead 2]`

## Uncertainties

- Whether the issue is stale lock files, file ownership/mode, macOS file flags/ACLs, or sandbox restrictions from prior commands.
