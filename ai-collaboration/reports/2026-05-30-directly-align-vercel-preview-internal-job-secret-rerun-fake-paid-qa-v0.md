# Directly Align Vercel Preview INTERNAL_JOB_SECRET and Rerun Fake-Paid QA v0

## Summary
The direct Vercel Preview `INTERNAL_JOB_SECRET` alignment did not proceed. Preflight blocked before any Vercel environment mutation or staging redeploy.

No secrets were printed, generated, updated, written to repo files, or committed. No Vercel env values were changed. No authorized fake-paid QA was run.

## Repo / Branch Preflight
Commands run safely from `/Users/raylin/Projects/anyu-next`:

```bash
pwd
git rev-parse --show-toplevel
git branch --show-current
git status --short --branch
git fetch origin --prune
git rev-parse HEAD
git rev-parse origin/staging
```

Result:

- Working directory: `/Users/raylin/Projects/anyu-next`
- Git root: `/Users/raylin/Projects/anyu-next`
- Branch: `staging`
- Local HEAD: `6c3d45e2e323d5e1cd5a3eaa3bb83cc5695eea3a`
- `origin/staging`: `6c3d45e2e323d5e1cd5a3eaa3bb83cc5695eea3a`
- Local `staging` matched `origin/staging`.
- Worktree was clean before this documentation record was created.

## Vercel CLI Preflight
Command run:

```bash
(command -v vercel && vercel --version && vercel whoami) || true
```

Result:

- `vercel` CLI was not available in this shell.
- Vercel project/account/domain/deployment context could not be verified from CLI.
- Because the CLI was unavailable, no `vercel env` or `vercel deploy` command was run.

## Secret Presence Preflight
Sanitized presence check only:

```text
OPERATOR_TEST_SECRET: missing
INTERNAL_JOB_SECRET: missing
PAID_ACCESS_TOKEN_HASH_SECRET: missing
```

No secret values, lengths, prefixes, suffixes, hashes, or derived values were printed.

## Actions Not Taken
- Did not generate a new `INTERNAL_JOB_SECRET`.
- Did not update Vercel Preview env.
- Did not remove or add any Vercel env var.
- Did not redeploy staging.
- Did not run authorized fake-paid QA.
- Did not update Production env.
- Did not deploy Production.

## Diagnosis
This task is blocked by local shell/tooling prerequisites, not by application code:

1. Vercel CLI is unavailable in the Codex shell.
2. `OPERATOR_TEST_SECRET` is not visible to the Codex process.
3. `INTERNAL_JOB_SECRET` is not visible to the Codex process.

The requested direct alignment requires an authenticated Vercel CLI and local access to the operator secret for the final QA rerun. Without those, proceeding would risk targeting the wrong project or generating an env value that cannot be used for the authorized runner.

## Required Owner / Operator Action
Run from a shell that has Vercel CLI installed/authenticated and the operator secret available:

```bash
cd /Users/raylin/Projects/anyu-next
command -v vercel
vercel --version
vercel whoami
export OPERATOR_TEST_SECRET='<set locally without printing>'
```

Then rerun this task, or manually perform the alignment using the documented safe pattern:

```bash
NEW_INTERNAL_JOB_SECRET="$(python3 - <<'PY'
import secrets
print('anyu_stg_internal_job_' + secrets.token_urlsafe(32))
PY
)"
printf "%s" "$NEW_INTERNAL_JOB_SECRET" | vercel env update INTERNAL_JOB_SECRET preview
export INTERNAL_JOB_SECRET="$NEW_INTERNAL_JOB_SECRET"
```

Do not print the secret. If `vercel env update` is unavailable or the variable does not exist, use the safest Preview-only remove/add flow supported by the installed Vercel CLI. Do not update Production.

## Validation
No code changed. No full app validation was required.

Validation performed:
- Confirmed local branch and remote alignment.
- Confirmed Vercel CLI prerequisite was not met.
- Confirmed required secrets were not visible to this process.

## Tech Debt Review
### New Technical Debt Introduced
None.

### Existing Technical Debt Observed
- Codex shell does not automatically inherit owner/operator shell secrets.
- Vercel CLI is not installed or not on PATH in this Codex shell.
- Fake-paid QA remains blocked on external ops prerequisites rather than code.

### Opportunistic Cleanup Completed
None.

### Deferred Cleanup Candidates
- Add a local ops prerequisite checker that verifies Vercel CLI availability and secret presence before starting env alignment tasks.
- Document exact Vercel CLI install/auth/link steps for this repository.

## Recommended Next Step
Install/authenticate Vercel CLI in the shell used by Codex or run the env alignment manually from the owner/operator shell, then rerun `cd apps/web && corepack pnpm run qa:fake-paid` with `OPERATOR_TEST_SECRET` and the newly aligned `INTERNAL_JOB_SECRET` exported securely.
