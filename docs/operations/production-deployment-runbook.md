# Production Deployment Runbook v0

Date: 2026-05-20

## 1. Purpose

This runbook defines the manual, human-approved process for deploying ANYU Module 01 to production.

Current approved low-key launch record:

- `ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md`

## 2. Production Deployment Principle

Production deployment follows a stricter rule than staging:

- staging push is part of the normal completed-handoff workflow when validation and safety checks pass
- production deploy is never automatic
- production deploy requires explicit human approval
- production deploy requires a completed Production Launch Decision record
- production deploy must be treated as a separate operational action, not an implied outcome of a successful staging pass

## 3. Current Environments

Current environment model:

```text
local/dev:
  developer machine + Neon dev branch

staging:
  branch: origin/staging
  domain: https://staging.anyu.tw
  DB: Neon preview/staging branch
  purpose: QA, review, beta

production:
  branch: main or approved production commit
  domain: https://anyu.tw
  DB: Neon production branch
  purpose: public users
```

Open status:

- the exact long-term production branch strategy is still a repo decision
- current recommendation is `main` or an explicitly approved production commit promoted through a human review step

## 4. Production Approval Gate

Production deployment requires all of the following:

- staging QA passed
- legal routes verified
- LINE CTA verified
- abuse guards verified
- production env configured
- production DB migration plan reviewed
- retention cleanup SOP defined
- rollback plan defined
- human approval recorded in a Production Launch Decision record

If any one of those items is missing, production deployment should not proceed.

## 5. Pre-Production Checklist

Before production deployment:

- latest staging-approved commit selected
- all required validation passes on that commit
- no unresolved blockers remain
- no `.env`, secrets, raw user content, or DB dumps are staged or copied into docs
- known launch risks are explicitly accepted
- Production Launch Decision record is completed and approved by the human operator

## 6. Environment Variables Checklist

Production env vars should include:

```text
DATABASE_URL=<Neon production pooled connection string>
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ORADAR_PROVIDER=anthropic
MODEL_STRATEGY=sonnet_default
ANALYSIS_CACHE_HASH_SECRET=<strong random secret>
ANTHROPIC_FAST_MODEL=claude-haiku-4-5-20251001 optional / not default
ANTHROPIC_FALLBACK_MODEL=claude-sonnet-4-20250514 optional
NEXT_PUBLIC_APP_URL=https://anyu.tw
NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO
ANALYSIS_SESSION_DAILY_LIMIT=3
ANALYSIS_IP_HOURLY_LIMIT=10
ANALYSIS_GLOBAL_DAILY_LIMIT=200
```

Important rule:

- do not set production `MODEL_STRATEGY` to `haiku_retry_sonnet_fallback` unless a separate production approval explicitly approves that model strategy

## 7. Neon Production Database Checklist

Neon production checklist:

- create or confirm a dedicated Neon production branch
- confirm region `ap-southeast-1` if using the current infra plan
- use a pooled serverless connection string for production
- set `DATABASE_URL` only in Vercel production env
- do not reuse a dev, local, or preview branch as production
- verify the production branch contains the expected runtime tables before launch
- confirm the active production `DATABASE_URL` actually targets the Neon `anyu-next` `production` branch without exposing secrets
- if runtime still does not see `DATABASE_URL` after secret update, stop before smoke and resolve env/runtime mismatch first

## 8. Drizzle Migration Checklist

Production migration checklist:

- review generated migration files before production use
- current launch baseline includes the idempotent analyze cache migration `apps/web/drizzle/0001_wooden_king_cobra.sql`
- run migration against production only after explicit approval
- record migration command and result in the launch record or launch report
- verify required tables exist after migration
- never paste `DATABASE_URL` into reports or logs

Expected command shape:

```bash
cd apps/web
corepack pnpm db:migrate
```

Rule:

- only run this command when production `DATABASE_URL` is intentionally configured for that session
- if the safe Vercel `env run` path still behaves as if `DATABASE_URL` is unavailable but a human has explicitly confirmed the target and a production migration is approved, a direct Neon production-branch migration may be used instead, with the fallback documented in the launch report

## 9. Vercel Production Deployment Checklist

Expected Vercel project settings:

- Root Directory: `apps/web`
- Framework Preset: `Next.js`
- Build Command: `corepack pnpm build`
- Install Command: `corepack pnpm install --frozen-lockfile`
- Production branch: `main` or another explicitly approved branch / commit path

Deployment options:

- Option A:
  - merge approved staging commit into `main`
- Option B:
  - promote exact approved deployment if Vercel promotion flow is deliberately chosen and documented

Recommended v0 approach:

- merge the approved staging commit into `main` only after the Production Launch Decision is completed
- complete production project/domain normalization before final launch approval
- current recommended target is `anyu-next` owning `anyu.tw` and `www.anyu.tw`
- after normalization, verify `www.anyu.tw` redirects to `https://anyu.tw` rather than serving a parallel canonical host

Do not auto-push `main`.

## 10. Domain / DNS Checklist

Production domain checklist:

- production domain: `anyu.tw`
- canonical domain policy: `anyu.tw` primary, `www.anyu.tw` redirects to apex
- verify DNS points to Vercel
- verify SSL certificate is active
- verify `https://anyu.tw` loads successfully
- verify redirect policy for `https://www.anyu.tw`

Open question:

- production project/domain normalization should be complete before production launch
- `www.anyu.tw` must redirect to apex before launch approval, whether via Vercel config or a narrow app-level redirect

## 11. NEXT_PUBLIC Env Rebuild Rule

Important operational rule:

- any change to `NEXT_PUBLIC_*` env variables requires rebuild and redeploy
- after redeploy, verify the alias or domain points to the new deployment
- do not assume Vercel env changes affect already-built frontend bundles

This rule applies to staging and production.

## 12. Module 01 Smoke Test

Minimum production smoke test:

Gate before smoke:

- runtime must see non-empty `DATABASE_URL`
- production branch schema must already contain required runtime tables
- production env should include non-empty `ANALYSIS_CACHE_HASH_SECRET` so identical-input cache reuse stays active after deploy

1. open `/m/ambiguous-temperature`
2. confirm landing loads and CTA behavior is correct
3. submit one synthetic analyze input
4. confirm real result route loads
5. confirm paid unlock opens the LINE-first panel
6. confirm LINE CTA exists
7. confirm Email fallback still works
8. confirm legal footer links load
9. confirm `/m/ambiguous-temperature/result/demo` still works if retained intentionally

Use synthetic content only for QA.

For UI-heavy changes, optionally run local Playwright smoke before handoff completion.

Minimal happy-path production smoke evidence should include:

- analyze response success
- real result route `200`
- unlock intent success
- synthetic Email fallback success if tested
- privacy-safe event verification with no raw input or contact leakage

## 13. Legal / Trust Checklist

Before production:

- `/privacy` loads
- `/terms` loads
- `/disclaimer` loads
- `/legal` loads
- `hello@anyu.tw` is visible where expected
- copy does not claim:
  - immediate complete-analysis delivery if not true
  - LINE automation if not true
  - automatic deletion guarantees that are not yet implemented

## 14. LINE Funnel Checklist

Before production:

- `NEXT_PUBLIC_LINE_ADD_URL` is configured in production env
- same-tab handoff to LINE has been browser-verified
- LINE-first contact UI is live
- Email fallback is live
- welcome-message and OA profile basics are set in LINE backend
- product copy still says notification / opening when immediate delivery is not yet true

Reference record:

- `ai-collaboration/research/2026-05-20-anyu-line-oa-setup-record-v0.md`
- profile image asset: `docs/design-system/brand/exports/line-profile-1024.png`
- current public `NEXT_PUBLIC_LINE_ADD_URL`: `https://lin.ee/S6dnbJO`

## 15. Abuse Guard / Cost Cap Checklist

Before production:

- session limit configured
- IP hourly limit configured
- global daily limit configured
- current model default is still the approved launch candidate
- no unapproved model strategy flag is active
- abuse guard behavior has been verified recently on staging
- provider key presence alone is not enough; production smoke should still verify an actual provider call after DB readiness is real

## 16. Retention Cleanup SOP

Until stronger automation exists, production needs an explicit retention cleanup SOP:

- review analysis and contact retention status at least daily or every 48 hours
- identify rows older than `retention_expires_at`
- delete or mark deleted rows according to the approved policy
- verify events still exclude raw input and contact values
- document cleanup completion in an ops log or launch operations note

Pre-launch rule:

- scheduled deletion is still a known risk if not implemented
- manual cleanup is acceptable only if the human operator explicitly accepts that burden for v0

## 17. Rollback Plan

If production deployment misbehaves:

1. stop any additional promotion steps
2. identify the last known-good deployment or commit
3. repoint production alias or redeploy the last known-good commit
4. verify landing, analyze, result, unlock, contact, and legal routes
5. document rollback cause and next remediation task

Rollback must not rely on guessing. Use a known-good staging-approved or previously healthy production deployment.

## 18. Post-Launch Monitoring

First post-launch checks:

- Vercel deployment health
- analyze route success/failure behavior
- contact submission behavior
- event ingestion health
- Neon production DB writes
- model latency and failure rate
- LINE CTA live behavior
- abuse/cost caps not being hit unexpectedly

Recommended early cadence:

- immediate check after deployment
- another check within the first hour
- daily checks during the first low-key launch window

## 19. Known Launch Risks

Known production-launch risks:

- `NEXT_PUBLIC_*` env drift can create invisible frontend bundle mismatch
- production DB migration may still diverge from preview if done carelessly
- LINE CTA flow can be operationally correct in code but still fail if env or alias freshness is wrong
- retention cleanup is still partly manual
- current model remains provider-dominant in latency, which affects perceived responsiveness
- protected staging verification does not fully replace production real-user conditions

## 20. What Must Not Happen Automatically

The following must not happen automatically:

- production deployment after a normal handoff
- production alias switch after a staging push
- production DB migration after a staging validation pass
- production env change without rebuild/redeploy verification
- production model-strategy switch without separate approval

## 21. Production Launch Decision Record

Use the canonical decision template:

- `ai-collaboration/templates/production_launch_decision_template.md`

That record should capture:

- approved commit
- approval status
- env readiness
- DB readiness
- QA outcome
- known risks accepted
- rollback contact/owner

## 22. Recommended Next Step

`Production Launch Decision Draft v0`
