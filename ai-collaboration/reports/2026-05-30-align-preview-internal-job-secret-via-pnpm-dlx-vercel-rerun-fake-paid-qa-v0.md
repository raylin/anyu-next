# Align Preview INTERNAL_JOB_SECRET via corepack pnpm dlx vercel and Rerun Fake-Paid QA v0

## Summary
The Vercel Preview `INTERNAL_JOB_SECRET` alignment did not proceed. Preflight blocked before any secret generation, Vercel env mutation, Preview redeploy, or authorized fake-paid QA rerun.

Two required prerequisites failed in this Codex shell:

1. `corepack pnpm dlx vercel` is available, but Vercel authentication is invalid.
2. `OPERATOR_TEST_SECRET` is not available to this process.

No secrets were printed, generated, updated, written to repo files, or committed. No Vercel env values were changed. No deployment was triggered. No authorized QA was run.

## Repo / Branch Preflight
Commands run from `/Users/raylin/Projects/anyu-next`:

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
- Local HEAD: `b813358a6fba6cb424d3794ce53dc6cdd2067c2e`
- `origin/staging`: `b813358a6fba6cb424d3794ce53dc6cdd2067c2e`
- Local branch matched `origin/staging`.
- The only dirty file during preflight was this task's newly-created handoff.

## Vercel CLI Availability / Auth
Command:

```bash
corepack pnpm dlx vercel --version
```

Result:

```text
Vercel CLI 54.5.1
54.5.1
```

Commands:

```bash
corepack pnpm dlx vercel whoami
corepack pnpm dlx vercel env ls preview
```

Result:

```text
Error: The specified token is not valid. Use `vercel login` to generate a new token.
```

Because authentication failed, project context and Preview env scope could not be safely verified. No `vercel env` update/remove/add command was run.

## Secret Presence Preflight
Sanitized presence check only:

```text
OPERATOR_TEST_SECRET: missing
INTERNAL_JOB_SECRET: missing
PAID_ACCESS_TOKEN_HASH_SECRET: missing
```

No values, lengths, prefixes, suffixes, hashes, or derived values were printed.

## Actions Not Taken
- Did not generate `NEW_INTERNAL_JOB_SECRET`.
- Did not update, remove, or add Vercel Preview `INTERNAL_JOB_SECRET`.
- Did not update Production env.
- Did not deploy Preview/Staging.
- Did not deploy Production.
- Did not run authorized fake-paid QA.

## Diagnosis
This task is blocked by local CLI/auth and shell secret prerequisites, not by application code.

`corepack pnpm dlx vercel` can install/run the CLI, but the active Vercel token is invalid. The Codex shell also cannot run the final QA because it does not have `OPERATOR_TEST_SECRET`.

## Required Owner / Operator Action
From the same shell that will run this task, authenticate Vercel and export the operator secret without printing it:

```bash
cd /Users/raylin/Projects/anyu-next
corepack pnpm dlx vercel login
export OPERATOR_TEST_SECRET='<set locally without printing>'
```

Then verify:

```bash
corepack pnpm dlx vercel whoami
test -n "$OPERATOR_TEST_SECRET" && echo "OPERATOR_TEST_SECRET present"
```

After those prerequisites pass, rerun this task. Only then should Codex generate a fresh `INTERNAL_JOB_SECRET`, update Vercel Preview, redeploy Preview/Staging, and rerun `corepack pnpm run qa:fake-paid`.

## Validation
No app code changed. No full app validation was required.

Validation performed:
- Confirmed local branch and remote alignment.
- Confirmed Vercel CLI availability through `corepack pnpm dlx`.
- Confirmed Vercel auth failure.
- Confirmed required secrets were not visible to this process.
- Confirmed no env mutation or deployment occurred.

## Tech Debt Review
### New Technical Debt Introduced
None.

### Existing Technical Debt Observed
- The Codex shell uses an invalid Vercel token and does not inherit owner/operator secrets.
- Secret-dependent deployment operations remain blocked unless Vercel auth and local secret export are done in the same execution environment.

### Opportunistic Cleanup Completed
None.

### Deferred Cleanup Candidates
- Add an ops prerequisite checklist for `corepack pnpm dlx vercel whoami` and secret presence before attempting Vercel env alignment.
- Document how to refresh Vercel CLI authentication for the Codex shell.

## Recommended Next Step
Authenticate Vercel CLI in this shell with `corepack pnpm dlx vercel login`, export `OPERATOR_TEST_SECRET` locally without printing it, then rerun the alignment task.
