# Handoff: Production Project + Domain Normalization v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Resolve the production project/domain ambiguity before any production launch approval.

The previous production readiness verification found that the prepared app lives in the Vercel `anyu-next` project, while `https://anyu.tw` currently serves a different Vercel project named `anyu`.

This task should decide and document the production normalization path, verify what must move/change, and prepare safe manual steps.

This is a verification / planning / normalization-prep task.

Do not deploy production.

Do not change DNS.

Do not move domains unless explicitly approved during the task.

Do not run production migrations.

Do not change production env values unless explicitly approved and documented.

## Background

Production Env Readiness Verification v0 completed.

Key findings:

```text
Prepared app: Vercel project anyu-next
Production-facing domain: https://anyu.tw
Current anyu.tw serves: Vercel project anyu
anyu-next production env: partially configured
production-facing anyu project env: missing multiple required vars for Module 01
Neon anyu-next production branch: ready in aws-ap-southeast-1
active production DATABASE_URL linkage: unconfirmed
https://anyu.tw: returns 200
https://www.anyu.tw: returns 521
Production launch decision: No-Go
```

Recommended direction from ChatGPT review:

```text
Normalize production onto anyu-next.
Make anyu-next the production Vercel project for this app.
Move / assign anyu.tw and www.anyu.tw to anyu-next when approved.
Use https://anyu.tw as canonical.
Redirect https://www.anyu.tw → https://anyu.tw.
```

Reasoning:

```text
anyu-next is the current production foundation with staging workflow, runbook, env docs, legal, LINE, brand, guardrails, and Module 01 readiness.
The old anyu project is production-facing but not the prepared launch candidate.
Moving domains/env toward anyu-next is cleaner than repurposing old anyu unless there is an external dependency.
```

## Scope

Do:

1. Verify current Vercel project/domain ownership state.
2. Compare normalization options:
   - Option A: move anyu.tw / www.anyu.tw to anyu-next
   - Option B: repurpose old anyu project for current app
3. Recommend one option.
4. Create a safe step-by-step normalization plan.
5. Identify what user approval/manual action is required.
6. Update production launch decision draft with current recommendation/blockers.
7. Update production runbook if needed.
8. Create report, append summary log.
9. Commit and push to `origin/staging`.

Do not:

- actually move anyu.tw unless user explicitly approves during this task
- alter DNS
- alter production env
- deploy production
- run production migration
- merge to main
- delete old project
- modify app behavior

## Preferred Recommendation

Unless verification reveals a strong reason otherwise, recommend:

```text
Option A: Make anyu-next the production Vercel project.
```

Target state:

```text
Vercel project: anyu-next
Production domain: anyu.tw
Canonical URL: https://anyu.tw
www redirect: https://www.anyu.tw → https://anyu.tw
Production branch: main or explicitly approved production commit
Staging branch/domain: origin/staging → https://staging.anyu.tw
```

## Verification Checklist

### 1. Current Vercel State

Verify/document:

```text
Which project owns anyu.tw
Which project owns www.anyu.tw if any
Which project owns staging.anyu.tw
Vercel Root Directory for anyu-next
Production branch for anyu-next
Existing production env var names for anyu-next
Existing env var names for old anyu project if accessible
```

Do not print secret values.

### 2. Domain State

Verify/document:

```text
https://anyu.tw response status
https://www.anyu.tw response status
DNS / CNAME / A record state if visible
Vercel domain assignment state if visible
SSL state if visible
```

Do not change DNS.

### 3. Neon State

Verify/document:

```text
Neon anyu-next production branch exists
Expected region aws-ap-southeast-1
Production DATABASE_URL for anyu-next is not yet safely confirmed
```

Do not print connection string.

### 4. Env Gap

For target anyu-next production, verify required env names:

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

Expected values/policies:

```text
NEXT_PUBLIC_APP_URL=https://anyu.tw
NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO
MODEL_STRATEGY=sonnet_default
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ORADAR_PROVIDER=anthropic
```

Do not change env unless explicitly approved.

## Normalization Plan Requirements

Create a step-by-step plan for Option A.

Must include:

```markdown
## Option A Plan: Move Production Domain To anyu-next

1. Confirm no important production dependency remains on old anyu project.
2. Confirm anyu-next production env vars.
3. Confirm Neon production DATABASE_URL points to anyu-next production branch.
4. Confirm production branch / approved commit policy.
5. Add anyu.tw to anyu-next project.
6. Add www.anyu.tw to anyu-next project.
7. Configure canonical redirect: www → apex.
8. Verify SSL.
9. Deploy production from approved commit.
10. Smoke test.
11. Update launch decision.
```

Also include rollback:

```text
If domain move fails, restore domain assignment to previous Vercel project or DNS state.
```

## Option B Analysis

Document why repurposing old anyu project is less preferred unless needed.

Mention possible cases where Option B might be chosen:

```text
old anyu project has production domain locked in
billing/team settings are easier
external integrations depend on old project
user wants to keep Vercel project name exactly anyu
```

If choosing Option B, list required steps.

But do not perform either option.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-production-project-domain-normalization-v0.md
```

Required sections:

```markdown
# Production Project + Domain Normalization v0

Date: 2026-05-20

## 1. Summary

## 2. Current State

## 3. Problem

## 4. Option A: Normalize Production Onto anyu-next

## 5. Option B: Repurpose Old anyu Project

## 6. Recommendation

## 7. Required Manual Approvals

## 8. Target Domain Policy

## 9. Env / DB Implications

## 10. DNS / Vercel Domain Steps

## 11. Rollback Plan

## 12. Updates To Launch Decision

## 13. Remaining Blockers

## 14. Recommended Next Step
```

## Decision Draft Update

Update:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md
```

Reflect:

```text
Production project/domain normalization is required before Go.
Recommended target: anyu-next owns anyu.tw and www.anyu.tw.
Current status remains No-Go.
```

## Production Runbook Update

Update if needed:

```text
docs/operations/production-deployment-runbook.md
```

Add:

```text
Production project/domain normalization must be complete before final launch approval.
Canonical domain policy: anyu.tw primary, www redirects to apex.
```

Do not rewrite the whole runbook.

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-production-project-domain-normalization-v0-execution-report.md
```

Report structure:

```markdown
# Production Project + Domain Normalization v0 Execution Report

## Summary

## Files Created

## Files Updated

## Current Project / Domain State

## Recommendation

## Manual Actions Required

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
- recommendation
- current go/no-go status
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
domain move
DNS change
production DB migration
production env changes unless explicitly approved
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
git commit -m "docs: plan production domain normalization"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- current project/domain state
- recommended normalization option
- manual actions required
- Go/No-Go status
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
