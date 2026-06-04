# Production Vercel Project / Env Source-of-Truth Reconciliation v0

Date: 2026-06-04

## Completed Work

- Inspected local Vercel linking metadata.
- Compared root project, app-directory project, Production env metadata source, and live `anyu.tw` alias target.
- Confirmed the production smoke blocker was a project/env/deploy target mismatch.
- Added a preflight guard so `qa:production:payment-preflight` blocks when root and app Vercel project links diverge.
- Verified the updated preflight now returns `blocked_project_link_mismatch`.
- Verified Production remains fail-closed:
  - public pages are live
  - checkout API returns `not_found`
  - fake-paid route returns 404
- No env values, provider credentials, payment payloads, tokens, or private data were printed.

## Source-of-Truth Inventory

### Local Vercel Link Files

- Repo root `.vercel/project.json`:
  - project name: `anyu-next`
  - project id: `prj_2iqtdQsS9si0Fs9aU9dqchiArYuZ`
  - root directory: `apps/web`
  - status: canonical candidate
- App directory `apps/web/.vercel/project.json`:
  - project name: `web`
  - project id: `prj_DSFwCYwshqUmiaY6JrxwZh6G48iv`
  - root directory: not set
  - status: non-canonical / unsafe for production payment deploys

The link files are local Vercel metadata and are not tracked by git, but they determine which project `vercel` commands use from each working directory.

### Env Metadata Source

- `vercel env ls production` from repo root reads project `anyu-next`.
- `anyu-next` has the required Production env names for:
  - NewebPay
  - payment runtime flags
  - checkout session
  - paid access
  - queue/processor
  - access-link crypto
  - Email provider
  - LINE provider
  - database
- `vercel env ls production` from `apps/web` reads project `web`.
- `web` has no required Production env names after the temporary flags were removed.

No env values, lengths, prefixes, suffixes, hashes, or checksums were printed.

### Deploy Target

- `vercel deploy --prod` from `apps/web` deploys project `web`.
- This was the source of the failed v1 retry: checkout runtime became reachable but provider config was missing because `web` did not have the production provider env set.
- Future production deploys must not run from `apps/web` unless that directory is relinked to the canonical project.

### Alias Target

- `https://anyu.tw` currently points to a `web-*` deployment:
  - deployment id: `dpl_AqQJTe1mAZf7R6csYNuNY4F1QAV2`
  - deployment project name: `web`
- This deployment is fail-closed and public pages are live, but it is not the canonical production payment/env project.

### Health Metadata

- Production health reports:
  - environment: `production`
  - route bundle: `payment-foundation-2026-05-29`
  - git branch: `unknown`
  - git commit: `unknown`
- The unknown branch/commit comes from local Vercel CLI deployments rather than git-integrated deployments with commit metadata.

## Candidate Comparison

| Candidate | Project | Result |
| --- | --- | --- |
| Env metadata/preflight source | `anyu-next` | Has full Production env names |
| Local CLI deploy from repo root | `anyu-next` | Recommended deploy path if CLI deploy is used |
| Local CLI deploy from `apps/web` | `web` | Unsafe for payment smoke; missing Production env |
| Live `anyu.tw` alias target | `web` | Currently fail-closed but non-canonical |
| Production health | `web` deployment | Environment ok, commit metadata unknown |
| GitHub production integration | not proven | Needs Vercel console or git-integrated deployment verification |

## Root Cause

The preflight command resolved Vercel env metadata from the repo-root project `anyu-next`, but operational deploy commands were run from `apps/web`, where Vercel was linked to a different project named `web`.

As a result:

1. preflight saw the correct Production env names on `anyu-next`
2. deploy used project `web`
3. `web` lacked NewebPay checkout/notify config
4. runtime-enabled checkout failed before Email save, LINE bind, or payment

## Preflight Helper Update

Updated `apps/web/scripts/production-payment-runtime-preflight.mjs`:

- reads repo-root `.vercel/project.json`
- reads `apps/web/.vercel/project.json`
- compares project IDs
- returns `blocked_project_link_mismatch` if they differ
- includes sanitized project-link metadata in the output

Updated tests:

- project link metadata reader
- mismatch readiness classification

Targeted validation passed:

- `cd apps/web && corepack pnpm test src/tests/production-payment-runtime-preflight.test.ts`

Updated live dry-run result:

- `cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run`
- result: `blocked_project_link_mismatch`

## Recommended Canonical Production Deploy Method

Use one canonical path:

1. Preferred near-term CLI path:
   - run Vercel env/preflight/deploy commands from the repo root
   - root project must be `anyu-next`
   - root project rootDirectory must be `apps/web`
   - do not run production deploy from `apps/web`
2. Safer longer-term path:
   - use Vercel Git integration for the canonical `anyu-next` project
   - require health/build metadata to include commit SHA
   - alias `anyu.tw` only to verified `anyu-next` deployments

Do not run another payment smoke while `anyu.tw` points to `web` and preflight blocks on project-link mismatch.

## Remediation Plan

Recommended next operational fix:

1. Relink or remove `apps/web/.vercel/project.json` so `apps/web` no longer points to `web`, or prohibit production deploys from `apps/web`.
2. Verify root-level `vercel deploy --prod --scope studioanyu-1488s-projects` targets project `anyu-next`.
3. Deploy `anyu-next` fail-closed.
4. Alias `https://anyu.tw` to the verified `anyu-next` deployment only after public/fail-closed checks pass.
5. Rerun `qa:production:payment-preflight`; expected result after reconciliation is no `blocked_project_link_mismatch`.
6. Only then retry Controlled Production Payment Smoke v1.

## Production Safety Result

- Production runtime was not enabled in this task.
- Production checkout was not enabled in this task.
- No payment was run.
- No Email was sent.
- No LINE message was sent.
- No Production env values were modified.
- No aliases were changed in this task.
- Final known live state remains fail-closed from the previous abort recovery.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed:
  - two local Vercel links point to different projects
  - `anyu.tw` currently points to the non-canonical `web` project
  - local CLI deploy health metadata lacks git commit SHA
- Opportunistic cleanup completed:
  - preflight now detects project-link mismatch before runtime enablement
- Deferred cleanup candidates:
  - remove/relink `apps/web/.vercel/project.json`
  - add a canonical project ID assertion to deployment scripts
  - add git commit/build marker enforcement for production smoke

## Suggested Next Steps

1. Production Vercel Project Relink / Canonical Deploy v0.
2. Run root-project fail-closed deploy and alias `anyu.tw` to verified `anyu-next`.
3. Rerun production payment preflight.
4. Retry Controlled Production Payment Smoke v1 only after preflight passes without project mismatch.
