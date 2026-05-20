# Handoff: Production Launch Decision Draft v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Create the first real production launch decision draft for Module 01 — 曖昧溫度計 — using the new production deployment runbook and decision template.

This task should prepare a human-reviewable Go / No-Go decision record before any production deployment to `anyu.tw`.

This is a documentation / decision-prep task only.

Do not deploy to production.

Do not run production migrations.

Do not change production env.

Do not connect or modify `anyu.tw`.

Do not change app behavior, runtime, model, prompt/schema, DB schema, LINE flow, legal semantics, or design system.

## Background

Production Deployment Runbook v0 completed.

Created:

```text
docs/operations/production-deployment-runbook.md
ai-collaboration/templates/production_launch_decision_template.md
```

Current staging status:

```text
staging domain: https://staging.anyu.tw
Module 01 UI/design: broadly OK
ANYU Design System v1.1: adopted
Analyze/result/unlock/contact: verified
Input validation / abuse guard: verified
Legal pages: implemented and verified
LINE-first contact UI: implemented and verified
LINE CTA mobile handoff: manually verified
Model default: Sonnet launch candidate
Guarded Haiku: implemented but not launch default
Production deployment: not yet approved
```

Production runbook principles:

```text
Normal handoffs push to staging.
Production deployment is never automatic.
Production deployment requires explicit human approval and a Production Launch Decision record.
```

Known open operational questions:

```text
long-term production branch strategy is still open
www.anyu.tw redirect policy should be confirmed
production env readiness is not yet verified
Neon production branch / migration has not yet been executed
```

## Scope

Do:

1. Create a dated production launch decision draft.
2. Use the production launch decision template.
3. Fill in known status from recent handoffs.
4. Mark unknowns / pending human setup clearly.
5. Produce a Go / No-Go recommendation.
6. Identify blockers before production deployment.
7. Commit and push to `origin/staging`.

Do not:

- deploy production
- merge to main
- run production DB migration
- alter Vercel production env
- alter Neon production branch
- change app code
- change legal/product strategy
- change LINE integration
- change model default

## Required Output

Create:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md
```

If `ai-collaboration/decisions/` does not exist, create it.

Use the template at:

```text
ai-collaboration/templates/production_launch_decision_template.md
```

This is a draft, not final approval.

## Required Decision Draft Structure

The decision record must include:

```markdown
# Production Launch Decision Draft v0

Date: 2026-05-20

## 1. Decision Summary

## 2. Approved Production Commit

## 3. Staging QA Status

## 4. Product Scope

## 5. Model Strategy

## 6. Environment Variables

## 7. Database / Migration Status

## 8. Legal / Trust Status

## 9. LINE Funnel Status

## 10. Abuse Guard / Cost Cap Status

## 11. Retention Cleanup Status

## 12. Known Risks Accepted

## 13. Rollback Plan

## 14. Monitoring Plan

## 15. Human Approval

## 16. Go / No-Go
```

## Content Requirements

### 1. Decision Summary

State:

```text
This is a draft production launch decision record for Module 01.
It is not final approval.
Current recommendation should likely be No-Go until production env, production DB, migration, and final human phone/browser smoke are confirmed.
```

### 2. Approved Production Commit

Fill in current candidate commit if known from staging.

If uncertain, write:

```text
Pending: choose exact production commit from origin/staging before launch.
```

Do not invent.

### 3. Staging QA Status

Summarize completed staging checks:

```text
Module 01 staging runtime verified
Design system v1.1 live
Guardrails verified
Legal routes verified
LINE CTA mobile handoff manually verified
Contact/unlock funnel verified
```

Mention remaining:

```text
final human phone/browser pass before production is recommended
```

### 4. Product Scope

State v0 production scope:

```text
Module 01: 曖昧溫度計
Free analysis
Fake-door paid unlock
LINE-first opening notification
Email fallback
No real payment
No auth
No portal
No LINE API automation
No LIFF
No scheduled deletion job yet
```

### 5. Model Strategy

State:

```text
Production launch candidate:
MODEL_STRATEGY=sonnet_default
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Mention:

```text
Guarded Haiku exists but is not launch default.
Do not switch production to Haiku without separate decision.
```

### 6. Environment Variables

List production env vars and status.

Required:

```text
DATABASE_URL=<Neon production pooled connection string> — pending
ANTHROPIC_API_KEY — pending
ANTHROPIC_MODEL=claude-sonnet-4-20250514 — pending
ORADAR_PROVIDER=anthropic — pending
MODEL_STRATEGY=sonnet_default — pending
NEXT_PUBLIC_APP_URL=https://anyu.tw — pending
NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO — pending
ANALYSIS_SESSION_DAILY_LIMIT=3 — pending
ANALYSIS_IP_HOURLY_LIMIT=10 — pending
ANALYSIS_GLOBAL_DAILY_LIMIT=200 — pending
```

Clarify:

```text
NEXT_PUBLIC_* changes require rebuild and domain/alias freshness verification.
```

### 7. Database / Migration Status

State:

```text
Neon production branch not yet verified or migrated.
Production DB migration must be run only after approval.
Do not reuse preview/dev branch for production.
```

### 8. Legal / Trust Status

State:

```text
/privacy, /terms, /disclaimer, /legal implemented and verified on staging.
hello@anyu.tw is public contact/deletion email.
Retention wording remains a 24-hour goal, not fixed promise.
```

### 9. LINE Funnel Status

State:

```text
LINE-first contact UI implemented.
LINE add URL: https://lin.ee/S6dnbJO.
Mobile handoff manually verified.
Desktop QR behavior acceptable.
LINE API / LIFF / webhook not implemented.
```

Pending OA backend setup:

```text
Profile image: pending
Background image: pending / optional
Category: pending
```

### 10. Abuse Guard / Cost Cap Status

State implemented:

```text
min length 30
hard max 4000
prompt injection guard
unrelated content guard
session/global caps
process-local IP hourly cap
Claude API hard limit remains final backstop
```

Mention limitations:

```text
IP cap is best-practical in serverless; shared limiter can be added later if ad traffic grows.
```

### 11. Retention Cleanup Status

State:

```text
Scheduled deletion job is not implemented.
Manual cleanup SOP required for low-key launch.
Broader public launch should require scheduled cleanup.
```

### 12. Known Risks Accepted

List:

```text
Analyze latency around 25–30s with Sonnet.
LINE add click is proxy, not confirmed friend add.
No real payment yet.
No LIFF/automatic LINE mapping.
Manual retention cleanup.
IP limiter is not shared across all serverless instances.
Docs/legal and app legal content require manual sync.
```

### 13. Rollback Plan

Summarize from runbook:

```text
Vercel rollback to previous deployment
disable ads
lower ANALYSIS_GLOBAL_DAILY_LIMIT
switch/confirm MODEL_STRATEGY=sonnet_default
temporarily hide paid/LINE CTA if needed
```

### 14. Monitoring Plan

Include:

```text
analysis_started
analysis_completed
analysis_failed
paid_unlock_clicked
line_add_clicked
email_fallback_opened
contact_submitted
error_seen
daily analysis count
provider error rate
schema validation failures
median latency
API spend
ad spend
```

### 15. Human Approval

Leave unchecked:

```text
Human approval: pending
Approved by:
Approved date:
```

### 16. Go / No-Go

Recommended draft:

```text
Current recommendation: No-Go for production until:
1. Production env vars are configured.
2. Neon production branch is created and migration plan is confirmed.
3. Final production candidate commit is selected.
4. Human browser/phone smoke on staging is accepted.
5. Manual retention cleanup SOP is accepted.
6. www.anyu.tw redirect policy is decided.
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-production-launch-decision-draft-v0-execution-report.md
```

Report structure:

```markdown
# Production Launch Decision Draft v0 Execution Report

## Summary

## Files Created

## Files Updated

## Decision Draft Status

## Current Go / No-Go Recommendation

## Blockers Captured

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
- decision draft path
- current go/no-go recommendation
- main blockers
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
production env changes
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
git status
git add .
git commit -m "docs: draft production launch decision"
git push origin HEAD:staging
git rev-parse --short HEAD
```

If unrelated changes exist, do not commit blindly. Report them.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- decision draft path
- current go/no-go recommendation
- top blockers before production
- whether any production actions were taken
- validation results
- commit hash
- staging push status
- top 3 questions for ChatGPT review

Then stop.
