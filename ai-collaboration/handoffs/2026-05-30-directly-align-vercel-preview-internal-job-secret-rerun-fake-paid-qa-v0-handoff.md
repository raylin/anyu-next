# Directly Align Vercel Preview INTERNAL_JOB_SECRET and Rerun Fake-Paid QA v0 Handoff

## Task
Attempt to directly align Vercel Preview `INTERNAL_JOB_SECRET` from the local shell, redeploy staging, and rerun the secret-safe fake-paid QA runner.

## Scope
- Environment alignment, staging redeploy, and QA rerun only.
- No payment runtime enablement.
- No NewebPay checkout, notify, or return endpoints.
- No production env or production deploy changes.
- No queue trigger, LINE delivery, Module 01 prompt/result, or public legal/provider-review copy changes.

## Preflight Safety
Before any Vercel env mutation, verify:
- Repo and branch are correct.
- Worktree is clean.
- Local `staging` matches `origin/staging`.
- Vercel CLI is installed/authenticated and project context is clear.
- `OPERATOR_TEST_SECRET` is available locally without printing it.

## Result
Preflight blocked before any env changes because Vercel CLI was not available in this shell and required secrets were not visible to this process.
