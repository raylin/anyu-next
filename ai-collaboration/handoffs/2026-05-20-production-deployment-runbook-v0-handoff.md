# Handoff: Production Deployment Runbook v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Create a production deployment runbook for `anyu-next` / 暗語 ANYU.

This runbook should define the human-approved process for promoting the current staging-ready Module 01 — 曖昧溫度計 — from `staging.anyu.tw` to production `anyu.tw`.

This is a documentation / operations task only.

Do not deploy to production in this task.

Do not connect or change `anyu.tw` production domain in this task.

Do not run production migrations in this task.

Do not change runtime/model/prompt/schema/DB behavior.

## Background

The project now has a staging-first workflow:

```text
handoff
→ validation
→ commit
→ push origin/staging
→ staging.anyu.tw updates
→ mobile/browser review
```

Production deployment must remain a separate, human-approved workflow.

Current status:

```text
Module 01 UI/design: broadly OK
ANYU Design System v1.1: adopted
Staging runtime: verified
Analyze/result/unlock/contact: verified
Input validation / abuse guard: verified
Legal pages: implemented and verified
LINE-first contact UI: implemented and verified
LINE CTA mobile handoff: manually verified
Model default: Sonnet launch candidate
Guarded Haiku: implemented but not launch default
```

Important recent operational lesson:

```text
NEXT_PUBLIC_* env changes are baked into the frontend bundle at build time.
After changing NEXT_PUBLIC_* env vars, Vercel must rebuild/redeploy and the staging/production alias must be verified.
```

Production must not happen automatically after every handoff.

## Scope

Do:

1. Create a production deployment runbook.
2. Define production approval gates.
3. Define production env checklist.
4. Define Neon production DB checklist.
5. Define Vercel production deployment process.
6. Define `anyu.tw` domain verification.
7. Define pre-launch QA checklist.
8. Define retention cleanup SOP.
9. Define rollback plan.
10. Define post-launch monitoring checklist.
11. Define known launch risks.
12. Define production launch decision template reference.
13. Update workflow docs if needed to clarify production is human-approved only.
14. Commit and push to `origin/staging`.

Do not:

- deploy production
- change production env
- run production DB migration
- change product code unless fixing docs-only references
- change staging behavior
- implement new feature
- alter LINE integration
- alter legal content meaning

## Required Output

Create:

```text
docs/operations/production-deployment-runbook.md
```

Create decision template:

```text
ai-collaboration/templates/production_launch_decision_template.md
```

Create execution report:

```text
ai-collaboration/reports/2026-05-20-production-deployment-runbook-v0-execution-report.md
```

Append summary log:

```text
ai-collaboration/summaries/summary_log.md
```

Optional, if not already present:

```text
docs/operations/README.md
```

## Runbook Required Structure

`docs/operations/production-deployment-runbook.md` must include:

```markdown
# Production Deployment Runbook v0

Date: 2026-05-20

## 1. Purpose

## 2. Production Deployment Principle

## 3. Current Environments

## 4. Production Approval Gate

## 5. Pre-Production Checklist

## 6. Environment Variables Checklist

## 7. Neon Production Database Checklist

## 8. Drizzle Migration Checklist

## 9. Vercel Production Deployment Checklist

## 10. Domain / DNS Checklist

## 11. NEXT_PUBLIC Env Rebuild Rule

## 12. Module 01 Smoke Test

## 13. Legal / Trust Checklist

## 14. LINE Funnel Checklist

## 15. Abuse Guard / Cost Cap Checklist

## 16. Retention Cleanup SOP

## 17. Rollback Plan

## 18. Post-Launch Monitoring

## 19. Known Launch Risks

## 20. What Must Not Happen Automatically

## 21. Production Launch Decision Record

## 22. Recommended Next Step
```

## Content Requirements

### 1. Purpose

State:

```text
This runbook defines the manual, human-approved process for deploying ANYU Module 01 to production.
```

### 2. Production Deployment Principle

State clearly:

```text
Staging push is automatic after completed handoffs.
Production deploy is never automatic.
Production deploy requires explicit human approval and a Production Launch Decision record.
```

### 3. Current Environments

Document:

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

If production branch strategy is not finalized, mark open.

### 4. Production Approval Gate

Production deployment requires all:

```text
staging QA passed
legal routes verified
LINE CTA verified
abuse guards verified
production env configured
production DB migration plan reviewed
retention cleanup SOP defined
rollback plan defined
human approval recorded
```

### 5. Pre-Production Checklist

Include:

```text
latest staging commit selected
all validation passes
no unresolved blockers
no .env/secrets staged
known risks accepted
production launch decision completed
```

### 6. Environment Variables Checklist

List production env vars:

```text
DATABASE_URL=<Neon production pooled connection string>
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ORADAR_PROVIDER=anthropic
MODEL_STRATEGY=sonnet_default
ANTHROPIC_FAST_MODEL=claude-haiku-4-5-20251001 optional / not default
ANTHROPIC_FALLBACK_MODEL=claude-sonnet-4-20250514 optional
NEXT_PUBLIC_APP_URL=https://anyu.tw
NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO
ANALYSIS_SESSION_DAILY_LIMIT=3
ANALYSIS_IP_HOURLY_LIMIT=10
ANALYSIS_GLOBAL_DAILY_LIMIT=200
```

Clarify:

```text
Do not set production MODEL_STRATEGY to haiku_retry_sonnet_fallback unless a separate production approval happens.
```

### 7. Neon Production Database Checklist

Include:

```text
Create / confirm Neon production branch.
Confirm region ap-southeast-1 if using current plan.
Use pooled serverless connection string.
Set DATABASE_URL only in Vercel production env.
Do not reuse dev/ray or preview branch for production.
```

### 8. Drizzle Migration Checklist

Include:

```text
Review generated migration files.
Run migration against production only after approval.
Record migration command and result.
Verify required tables exist.
Do not paste DATABASE_URL in reports.
```

Possible command:

```bash
cd apps/web
corepack pnpm db:migrate
```

But specify:

```text
Only run with production DATABASE_URL intentionally configured.
```

### 9. Vercel Production Deployment Checklist

Include:

```text
Vercel project root directory: apps/web
Production branch: main or approved branch
Build command: corepack pnpm build
Install command: corepack pnpm install --frozen-lockfile
Framework: Next.js
```

Deployment options:

```text
Option A:
merge staging-approved commit into main

Option B:
promote exact deployment if Vercel supports approved promotion path

Recommended:
merge approved staging commit into main after production launch decision.
```

Do not auto-push main.

### 10. Domain / DNS Checklist

Include:

```text
Production domain: anyu.tw
Verify DNS points to Vercel.
Verify SSL active.
Verify https://anyu.tw loads.
Verify https://www.anyu.tw redirect decision if applicable.
```

If `www` decision is open, include open question.

### 11. NEXT_PUBLIC Env Rebuild Rule

Important:

```text
Any change to NEXT_PUBLIC_* env requires rebuild/redeploy.
After redeploy, verify alias/domain points to the new deployment.
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-production-deployment-runbook-v0-execution-report.md
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

## Validation

Run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: add production deployment runbook"
git rev-parse --short HEAD
git push origin HEAD:staging
```
