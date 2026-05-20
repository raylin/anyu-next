# Handoff: Production Env Readiness Verification v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Verify production environment readiness for `anyu-next` / 暗語 ANYU before any production launch approval.

This task should confirm what is already configured, what is missing, and what must be completed before `anyu.tw` can be safely deployed.

This is a verification / documentation task only.

Do not deploy to production.

Do not run production database migrations.

Do not change production environment variables unless explicitly needed for verification and already approved.

Do not connect or modify `anyu.tw` / `www.anyu.tw` DNS.

Do not change app behavior, runtime, model, prompt/schema, DB schema, LINE flow, legal semantics, or design system.

## Background

Production Env + Launch Checklist Sync v0 completed.

Current production launch recommendation remains:

```text
No-Go
```

Completed launch-readiness areas:

```text
- legal routes / footer / short notices
- LINE-first UI
- staging LINE URL / mobile handoff
- LINE OA setup record
- brand mark assets
- abuse guard staging verification
- staging QA baseline
- production deployment runbook
- production launch decision draft
```

Remaining blockers currently include:

```text
- production Vercel env readiness not verified
- Neon production branch / migration readiness not verified
- final production candidate commit not selected
- final human smoke not accepted
- retention SOP not accepted
- www.anyu.tw redirect policy not confirmed
- DNS readiness not verified
```

This task should reduce uncertainty around production env, Neon production DB, Vercel project settings, and DNS/domain readiness.

## Scope

Do:

1. Verify Vercel production environment variables by name and status.
2. Verify Vercel project production settings.
3. Verify Neon production branch/database readiness if accessible.
4. Verify whether production `DATABASE_URL` is configured and appears to point to production branch without printing value.
5. Verify Drizzle migration readiness without running production migration.
6. Verify `anyu.tw` / `www.anyu.tw` domain readiness as much as possible.
7. Verify production `NEXT_PUBLIC_*` values and document rebuild implications.
8. Update production launch decision draft with findings.
9. Create verification report and execution report.
10. Append summary log.
11. Commit and push to `origin/staging`.

Do not:

- deploy production
- run production migration
- print secrets
- commit `.env`
- alter DNS
- alter production env unless explicitly approved
- merge to main
- choose final production commit unless user has explicitly provided one
- change app code unless only tiny docs fixes are needed

## Production Env Vars To Verify

Check Vercel Production env has the following names:

```text
DATABASE_URL
ANTHROPIC_API_KEY
ANTHROPIC_MODEL
ORADAR_PROVIDER
MODEL_STRATEGY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_LINE_ADD_URL
ANALYSIS_SESSION_DAILY_LIMIT
ANALYSIS_IP_HOURLY_LIMIT
ANALYSIS_GLOBAL_DAILY_LIMIT
```

Expected values / policy:

```text
DATABASE_URL=<Neon production pooled connection string>
ANTHROPIC_API_KEY=<configured, do not print>
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ORADAR_PROVIDER=anthropic
MODEL_STRATEGY=sonnet_default
NEXT_PUBLIC_APP_URL=https://anyu.tw
NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO
ANALYSIS_SESSION_DAILY_LIMIT=3
ANALYSIS_IP_HOURLY_LIMIT=10
ANALYSIS_GLOBAL_DAILY_LIMIT=200
```

Optional / not launch-default:

```text
ANTHROPIC_FAST_MODEL=claude-haiku-4-5-20251001
ANTHROPIC_FALLBACK_MODEL=claude-sonnet-4-20250514
```

Important:

```text
Do not set MODEL_STRATEGY=haiku_retry_sonnet_fallback for production without a separate launch decision.
```

## Vercel Project Settings To Verify

Verify:

```text
Project: anyu-next
Root Directory: apps/web
Framework: Next.js
Install Command: corepack pnpm install --frozen-lockfile
Build Command: corepack pnpm build
Production branch: main or current configured branch
```

If production branch is not `main`, document current value and do not change it.

## Neon Production DB Readiness

Verify as much as available without exposing secrets:

```text
Neon project exists
production branch exists
region is expected, preferably ap-southeast-1 if current setup uses that
production pooled connection string available
Vercel production DATABASE_URL points to production branch, not preview/dev
```

If direct Neon access is unavailable, document what could not be verified and what the user must confirm manually.

Do not print the actual connection string.

## Drizzle Migration Readiness

Do not run production migration.

Verify:

```text
migration files exist
current schema is known
db:migrate command is documented
no uncommitted schema changes
production migration should be run only after production launch approval
```

If possible, run non-production-safe local checks only:

```bash
cd apps/web
corepack pnpm db:generate
```

Only if this does not require production DB and does not alter intended files unexpectedly.

If it produces changes, stop and report; do not commit migration changes unless explicitly within scope.

## Domain / DNS Readiness

Verify as much as possible:

```text
https://anyu.tw
https://www.anyu.tw
```

Check:

```text
does domain resolve?
does HTTPS work?
does Vercel know the domain?
is SSL active?
is www redirect policy configured?
```

Preferred policy:

```text
canonical: https://anyu.tw
redirect: https://www.anyu.tw → https://anyu.tw
```

Do not change DNS or Vercel domain settings.

If not configured, document manual steps.

## NEXT_PUBLIC Rebuild Rule

Confirm runbook/decision draft states:

```text
Any NEXT_PUBLIC_* production env change requires a production rebuild/redeploy.
After redeploy, verify anyu.tw points to the fresh deployment.
```

Specifically:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_LINE_ADD_URL
```

## Production Launch Decision Draft Update

Update:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md
```

Add/update production env readiness section based on findings.

Keep Go/No-Go as:

```text
No-Go
```

unless all production prerequisites are verified and user has approved launch, which is not expected in this task.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-20-production-env-readiness-verification-v0.md
```

Required sections:

```markdown
# Production Env Readiness Verification v0

Date: 2026-05-20

## 1. Summary

## 2. Vercel Project Settings

## 3. Production Env Var Status

## 4. Neon Production DB Status

## 5. Drizzle Migration Readiness

## 6. Domain / DNS Readiness

## 7. NEXT_PUBLIC Rebuild Rule

## 8. Production Launch Decision Draft Updates

## 9. Issues Found

## 10. Manual Actions Needed

## 11. Current Go / No-Go Status

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-production-env-readiness-verification-v0-execution-report.md
```

Report structure:

```markdown
# Production Env Readiness Verification v0 Execution Report

## Summary

## Files Created

## Files Updated

## Vercel Env Status

## Vercel Project Settings

## Neon Production Status

## Domain / DNS Status

## Decision Draft Updates

## Validation Results

## Known Technical Debt

## Tech Debt Review

### New Technical Debt Introduced

### Existing Technical Debt Observed

### Opportunistic Cleanup Completed

### Deferred Cleanup Candidates

### Recommended Follow-up

## Deviations From Handoff

## Git Commit

## Staging Push

## Remaining Uncertainties

## Recommended Next Step
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

Include:

- date
- task completed
- production env readiness status
- Neon production status
- domain/DNS status
- current Go/No-Go status
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

Docs-only, but validation should still pass.

## Constraints

Do not implement:

```text
production deployment
production DB migration
production env changes unless explicitly needed and approved
DNS changes
LINE API
LIFF
email sending
auth
payment
portal
runtime changes
model switch
```

Do not modify:

```text
product prompt/schema
DB schema
provider/model
legal semantics
design system
app behavior
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
real contact values
raw private user content
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: verify production env readiness"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- production env status
- Vercel project settings status
- Neon production status
- domain/DNS status
- decision draft update summary
- current Go / No-Go status
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
