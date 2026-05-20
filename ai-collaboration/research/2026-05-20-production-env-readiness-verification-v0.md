# Production Env Readiness Verification v0

Date: 2026-05-20

## 1. Summary

Current production recommendation remains `No-Go`.

The main issue is not app-code readiness. It is production environment drift:

- the prepared app is linked to Vercel project `anyu-next`
- the live production domain `https://anyu.tw` is currently served by a different Vercel project, `anyu`
- the `anyu` project does not currently expose the env shape required for the Module 01 launch candidate
- `www.anyu.tw` is not healthy and currently returns `HTTP 521`

As a result, production deployment should not proceed until project/domain/env ownership is normalized and the production DB target is explicitly confirmed.

## 2. Vercel Production Env Check

Verified project-local production env for the linked app project `anyu-next`:

- present by name:
  - `DATABASE_URL`
  - `ANTHROPIC_API_KEY`
  - `ANTHROPIC_MODEL`
  - `ORADAR_PROVIDER`
  - `NEXT_PUBLIC_LINE_ADD_URL`
- missing by name:
  - `MODEL_STRATEGY`
  - `NEXT_PUBLIC_APP_URL`
  - `ANALYSIS_SESSION_DAILY_LIMIT`
  - `ANALYSIS_IP_HOURLY_LIMIT`
  - `ANALYSIS_GLOBAL_DAILY_LIMIT`

Verified production env for the actual production-facing Vercel project `anyu`:

- present by name:
  - `DATABASE_URL`
  - `ANTHROPIC_API_KEY`
  - several unrelated legacy/auth/kv vars
- missing by name for current Module 01 launch needs:
  - `ANTHROPIC_MODEL`
  - `ORADAR_PROVIDER`
  - `MODEL_STRATEGY`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_LINE_ADD_URL`
  - `ANALYSIS_SESSION_DAILY_LIMIT`
  - `ANALYSIS_IP_HOURLY_LIMIT`
  - `ANALYSIS_GLOBAL_DAILY_LIMIT`

Interpretation:

- `anyu-next` is only partially production-configured
- `anyu.tw` is currently backed by a different project whose production env does not match the prepared app

## 3. Vercel Project Settings Check

Verified settings for `anyu-next`:

- Root Directory: `apps/web`
- Framework Preset: `Next.js`
- Build Command: `corepack pnpm build`
- Install Command: `corepack pnpm install --frozen-lockfile`
- Node.js Version: `24.x`

Verified settings for `anyu`:

- Root Directory: `.`
- generic Next.js build/install defaults
- active production deployment tied to the `anyu` app, not the prepared `anyu-next` app

Operational conclusion:

- the `anyu-next` project settings are aligned with the current repo
- the live production domain is attached to a different Vercel project with different assumptions

## 4. Neon Production Readiness Check

Verified Neon project state:

- project `anyu-next` exists in `aws-ap-southeast-1`
- branch `production` exists and is ready
- branch `production` is the default/primary branch for `anyu-next`
- project `AnYu` also exists, but its only `production` branch is archived

Operational conclusion:

- a plausible production DB target exists for `anyu-next`
- however, the actual `DATABASE_URL` used by the live production-facing Vercel project was not safely confirmed
- because Vercel production currently points at `anyu`, not `anyu-next`, DB linkage cannot be considered trustworthy yet

## 5. DATABASE_URL Readiness Check

Verified by env-name presence only:

- `DATABASE_URL` exists in both the linked `anyu-next` production env and the currently production-facing `anyu` project env

Not safely verified:

- whether the active production `DATABASE_URL` points at the ready `anyu-next` production branch
- whether it instead points at the older `AnYu` Neon project or another branch

Status:

- `configured by name`
- `not production-safe to approve yet`

## 6. Drizzle Migration Readiness

Verified locally:

- `apps/web/package.json` defines:
  - `corepack pnpm db:generate`
  - `corepack pnpm db:migrate`
- migration artifacts already exist:
  - `apps/web/drizzle/0000_short_harrier.sql`
  - `apps/web/drizzle/meta/_journal.json`

Not performed in this task:

- no production migration was run
- no production DB session was opened
- no schema files were changed

Conclusion:

- migration path exists and is reviewable
- production migration must remain a separate approved launch action

## 7. Domain / DNS / HTTPS Readiness

Verified:

- `https://anyu.tw` returns `HTTP 200`
- response is served by Vercel
- `https://www.anyu.tw` currently returns `HTTP 521`
- Vercel domain inspection shows `anyu.tw` attached to project `anyu`
- Vercel domain inspection shows `www.anyu.tw` is not properly configured
- Vercel nameserver guidance does not match the currently observed nameservers
- external DNS resolution still points through Cloudflare-managed records

Operational conclusion:

- apex production domain is reachable
- `www` redirect path is not launch-ready
- domain ownership/configuration is not yet cleanly normalized through the prepared app project

## 8. NEXT_PUBLIC Rebuild Rule

Confirmed operationally:

- `NEXT_PUBLIC_*` env values are build-time inputs
- a stale deployment can continue serving old public env behavior even when Vercel env has already been updated

Implication for production:

- any change to `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_LINE_ADD_URL` must be followed by a fresh production build and alias/domain freshness verification

## 9. Production Launch Decision Update

Decision draft should remain `No-Go`.

Key updated blockers:

1. normalize production project/domain ownership so `anyu.tw` points at the intended app project
2. confirm the final production Vercel env set on the actual production-facing project
3. confirm `DATABASE_URL` points at the ready `anyu-next` production branch
4. decide and fix `www.anyu.tw` redirect behavior
5. verify production DNS readiness after project/domain normalization

## 10. Final Readiness Assessment

Current assessment:

- codebase/build readiness: acceptable
- staging readiness: acceptable
- legal/LINE/brand readiness: largely acceptable for v0
- production env readiness: not acceptable yet
- production infra ownership clarity: not acceptable yet

Recommendation:

- do not promote to production
- resolve project/env/domain drift first

## 11. Exact Next Manual Steps

1. Decide which Vercel project is the true production host for Module 01:
   - either migrate `anyu.tw` to `anyu-next`
   - or fully reconfigure `anyu` to match the current app
2. On the actual production-facing project, ensure these vars exist by name:
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
3. Confirm the active `DATABASE_URL` points at the `anyu-next` Neon `production` branch.
4. Fix `www.anyu.tw` so it redirects or resolves according to the final launch policy.
5. Re-run production readiness verification after the above is complete.
