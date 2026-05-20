# Production Project + Domain Normalization v0

Date: 2026-05-20

## 1. Summary

Current recommendation remains `No-Go` for production launch.

Recommended normalization path is:

- `Option A: normalize production onto Vercel project anyu-next`

Reason:

- `anyu-next` is already the prepared app foundation for Module 01
- `staging.anyu.tw` already points to `anyu-next`
- `anyu-next` uses the correct repo root configuration (`apps/web`)
- Neon `anyu-next` already has a ready `production` branch
- the currently production-facing `anyu` project is older, differently configured, and not aligned with the current launch candidate

This task does not move domains, change DNS, deploy production, or change production env.

## 2. Current State

### Vercel project ownership

- `anyu-next`
  - Root Directory: `apps/web`
  - Framework: `Next.js`
  - Build Command: `corepack pnpm build`
  - Install Command: `corepack pnpm install --frozen-lockfile`
- `anyu`
  - Root Directory: `.`
  - generic/default build and install settings

### Domain / alias ownership

- `https://staging.anyu.tw`
  - currently serves preview deployment `anyu-next-o3553kufr-studioanyu-1488s-projects.vercel.app`
  - therefore staging already belongs to `anyu-next`
- `https://anyu.tw`
  - currently serves production deployment `anyu-gea3n6y6r-studioanyu-1488s-projects.vercel.app`
  - therefore apex production currently belongs to `anyu`
- `https://www.anyu.tw`
  - exists under the same Vercel account/domain record
  - not cleanly normalized to the target project yet
  - HTTPS currently fails certificate matching for `www.anyu.tw`

### Production env state

Verified current `anyu-next` production env names:

- present:
  - `DATABASE_URL`
  - `ANTHROPIC_API_KEY`
  - `ANTHROPIC_MODEL`
  - `ORADAR_PROVIDER`
  - `NEXT_PUBLIC_LINE_ADD_URL`
- missing:
  - `MODEL_STRATEGY`
  - `NEXT_PUBLIC_APP_URL`
  - `ANALYSIS_SESSION_DAILY_LIMIT`
  - `ANALYSIS_IP_HOURLY_LIMIT`
  - `ANALYSIS_GLOBAL_DAILY_LIMIT`

Verified/retained from the immediately prior production-env readiness task for old production-facing project `anyu`:

- present by name:
  - `DATABASE_URL`
  - `ANTHROPIC_API_KEY`
- missing for current Module 01 launch candidate:
  - `ANTHROPIC_MODEL`
  - `ORADAR_PROVIDER`
  - `MODEL_STRATEGY`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_LINE_ADD_URL`
  - `ANALYSIS_SESSION_DAILY_LIMIT`
  - `ANALYSIS_IP_HOURLY_LIMIT`
  - `ANALYSIS_GLOBAL_DAILY_LIMIT`

### Neon state

- Neon project `anyu-next` exists in `aws-ap-southeast-1`
- Neon project `anyu-next` has a ready `production` branch
- active production `DATABASE_URL` linkage is still not safely confirmed

## 3. Problem

Current production ownership is split:

- app-ready project: `anyu-next`
- live apex production domain: `anyu.tw` on `anyu`
- staging domain: `staging.anyu.tw` on `anyu-next`
- production DB candidate: Neon `anyu-next` production branch

That split creates four launch risks:

1. wrong Vercel project may receive production traffic
2. correct env names may exist on the wrong project
3. DB linkage may target the wrong Neon project/branch
4. `www.anyu.tw` redirect/certificate policy is not cleanly finalized

## 4. Option A: Normalize Production Onto anyu-next

### Option A overview

Make `anyu-next` the production Vercel project for this app.

Target state:

- Vercel production project: `anyu-next`
- production domain: `https://anyu.tw`
- canonical URL: `https://anyu.tw`
- redirect: `https://www.anyu.tw` -> `https://anyu.tw`
- staging: `origin/staging` -> `https://staging.anyu.tw`
- production DB: Neon `anyu-next` production branch

### Option A plan: Move Production Domain To anyu-next

1. Confirm no important production dependency remains on old `anyu` project.
2. Confirm `anyu-next` production env vars by name:
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`
   - `ANTHROPIC_MODEL`
   - `ORADAR_PROVIDER`
   - `MODEL_STRATEGY`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_LINE_ADD_URL`
   - `ANALYSIS_SESSION_DAILY_LIMIT`
   - `ANALYSIS_IP_HOURLY_LIMIT`
   - `ANALYSIS_GLOBAL_DAILY_LIMIT`
3. Confirm Neon production `DATABASE_URL` points to the `anyu-next` `production` branch.
4. Confirm production branch / approved commit policy:
   - `main` or explicitly approved production commit path
5. Add `anyu.tw` to `anyu-next` project.
6. Add `www.anyu.tw` to `anyu-next` project.
7. Configure canonical redirect: `www` -> apex.
8. Verify SSL/certificate coverage for both hostnames.
9. Deploy production from the approved commit only after launch approval.
10. Run production smoke test.
11. Update the production launch decision from `No-Go` only after successful verification.

## 5. Option B: Repurpose Old anyu Project

### Option B overview

Keep `anyu.tw` on `anyu` and repurpose that project to host the current app.

### Why Option B is less preferred

- `anyu` does not currently match the repo’s intended app root/settings
- `anyu-next` already owns staging and the current release workflow
- `anyu-next` is the project already aligned with current docs, legal routes, LINE flow, and Module 01 runtime assumptions
- keeping apex on `anyu` preserves the old ambiguity instead of removing it

### Cases where Option B might still be chosen

- the old `anyu` project has an external dependency that should not be moved yet
- billing/team/policy setup is materially easier if the final production project name remains `anyu`
- a domain-lock or integration path makes moving domains temporarily risky
- the human operator explicitly prefers to retain `anyu` as the long-term production container

### If Option B were chosen

Required steps would include:

1. reconfigure `anyu` project root/build/install settings to match the current app
2. import/verify the full required production env set on `anyu`
3. confirm DB linkage points to Neon `anyu-next` production or deliberately migrate to another approved production DB target
4. verify legal/LINE/public env behavior on the repurposed project
5. verify `www` redirect/cert behavior
6. document why `anyu-next` remains staging-only

## 6. Recommendation

Recommended option: `Option A`

Recommended target:

- make `anyu-next` the production Vercel project
- move/assign `anyu.tw` and `www.anyu.tw` to `anyu-next` when the human explicitly approves the domain move
- keep `anyu.tw` canonical
- redirect `www.anyu.tw` to apex

Why this is the cleanest path:

- smallest conceptual gap between staging and production
- least reconfiguration of app/project internals
- best fit with current Neon, LINE, legal, and launch-readiness work already completed

## 7. Required Manual Approvals

Human approval is required for:

1. choosing Option A versus Option B
2. moving or reassigning `anyu.tw`
3. moving or reassigning `www.anyu.tw`
4. confirming the final production project/commit policy
5. confirming the active production `DATABASE_URL` target
6. deciding the final `www` redirect policy if anything other than simple apex redirect is desired

## 8. Target Domain Policy

Recommended domain policy:

- canonical production URL: `https://anyu.tw`
- `https://www.anyu.tw` should 301/308 redirect to `https://anyu.tw`
- staging remains separate at `https://staging.anyu.tw`

Current observed state:

- `anyu.tw` responds with `HTTP 200`
- `www.anyu.tw` does not currently present a valid matching certificate
- Vercel domain records still show nameserver mismatch against the intended Vercel nameserver path

## 9. Env / DB Implications

### Env implications for Option A

Before launch, `anyu-next` production must add the currently missing names:

- `MODEL_STRATEGY=sonnet_default`
- `NEXT_PUBLIC_APP_URL=https://anyu.tw`
- `ANALYSIS_SESSION_DAILY_LIMIT=3`
- `ANALYSIS_IP_HOURLY_LIMIT=10`
- `ANALYSIS_GLOBAL_DAILY_LIMIT=200`

It must also keep:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL=claude-sonnet-4-20250514`
- `ORADAR_PROVIDER=anthropic`
- `NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO`

### DB implications for Option A

- Neon `anyu-next` `production` branch is the expected target
- production `DATABASE_URL` must be confirmed to point there before launch
- no production migration should run until the project/domain normalization path is accepted

## 10. DNS / Vercel Domain Steps

Safe manual sequence once approved:

1. confirm current domain ownership and any external dependency on `anyu`
2. attach `anyu.tw` to `anyu-next`
3. attach `www.anyu.tw` to `anyu-next`
4. ensure DNS records and/or Vercel domain config align with the chosen delegation path
5. wait for certificate issuance/verification
6. verify apex serves the approved production deployment
7. verify `www` redirects cleanly to apex

This task does not perform those steps.

## 11. Rollback Plan

If domain move fails:

- restore domain assignment to the previous Vercel project or prior DNS state
- verify `anyu.tw` resumes serving the previously healthy deployment
- leave production launch in `No-Go`
- record the failure cause before retrying

## 12. Updates To Launch Decision

The production launch decision should explicitly state:

- project/domain normalization is a prerequisite to launch
- recommended target is `anyu-next` owning `anyu.tw` and `www.anyu.tw`
- current status remains `No-Go`

## 13. Remaining Blockers

1. human approval for Option A
2. confirmation that no critical dependency remains on `anyu`
3. final production env completeness on `anyu-next`
4. confirmation of active production `DATABASE_URL` target
5. `www.anyu.tw` redirect/certificate cleanup
6. final production smoke pass after normalization

## 14. Recommended Next Step

`Production Domain Move Approval + Env Finalization v0`
