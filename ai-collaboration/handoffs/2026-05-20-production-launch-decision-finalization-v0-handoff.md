# Handoff: Production Launch Decision Finalization v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Finalize the production launch decision for Module 01 — 曖昧溫度計 — after technical production smoke and human production browser/phone smoke both passed.

This task should update the production launch decision record from draft No-Go to the user-approved final status.

This is a decision/documentation task only.

Do not deploy production.

Do not run migrations.

Do not change env.

Do not change app behavior, runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, design system, auth, payment, or portal scope.

## Human Context

The user manually tested production and reported:

```text
測起來跟 staging 一樣, 沒什麼問題
```

ChatGPT recommendation:

```text
GO for low-key production launch only.
No ads yet.
Manual retention cleanup accepted for the first low-key launch.
Monitor 24–48h.
Keep Sonnet default.
No real payment.
LINE-first notification flow only.
Before paid ads / broader traffic, scheduled cleanup job should be implemented or explicitly re-approved.
```

## Background

Production Migration + Smoke Gate v0 completed.

Technical production gate status:

```text
Production DB migration: complete
Required runtime tables: present
https://anyu.tw production smoke: passed
analyze → result: passed
unlock intent: passed
Email fallback: passed
legal routes: passed
www → apex redirect: passed
event/privacy: passed
technical production gate: green
```

Human production smoke:

```text
User confirmed production behaves like staging and no obvious issue was found.
```

Current launch decision draft:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md
```

Current production status before this task:

```text
No-Go pending final human approval / final launch decision.
```

## Scope

Do:

1. Create a finalized production launch decision record.
2. Update the existing draft or create a final copy.
3. Record user human smoke acceptance.
4. Record final low-key launch scope.
5. Record accepted known risks.
6. Record manual retention cleanup SOP acceptance.
7. Record post-launch monitoring expectations.
8. Keep explicit constraints: no ads, no real payment, no model switch.
9. Update production runbook only if needed with a short reference.
10. Create execution report.
11. Append summary log.
12. Commit and push to `origin/staging`.

Do not:

- deploy production
- run migration
- change production env
- change app code
- alter DNS
- approve ads
- enable real payment
- switch model strategy
- add scheduled cleanup
- implement new features

## Required Decision Record

Create:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md
```

Optionally keep the draft file as-is or update it to reference the final decision.

Do not delete the draft.

## Required Structure

```markdown
# Production Launch Decision Final v0

Date: 2026-05-20

## 1. Decision Summary

## 2. Approved Production Scope

## 3. Approved Production Commit

## 4. Technical Smoke Status

## 5. Human Browser / Phone Smoke Status

## 6. Model Strategy

## 7. Database / Migration Status

## 8. Legal / Trust Status

## 9. LINE Funnel Status

## 10. Abuse Guard / Cost Cap Status

## 11. Retention Cleanup SOP

## 12. Known Risks Accepted

## 13. Launch Constraints

## 14. Rollback Plan

## 15. Monitoring Plan

## 16. Human Approval

## 17. Final Go / No-Go
```

## Content Requirements

### 1. Decision Summary

State:

```text
Decision: GO for low-key production launch of Module 01.
This is not an ads launch, not a paid launch, and not a broad public campaign.
```

### 2. Approved Production Scope

Include:

```text
Module 01: 曖昧溫度計
Free analysis
Fake-door NT$49 paid intent
LINE-first opening notification
Email fallback
Legal pages
Abuse guards
No real payment
No auth
No portal
No LINE API automation
No LIFF
No ads yet
```

### 3. Approved Production Commit

Use the latest known production/smoke commit if clear.

Current relevant technical smoke commit from user paste-back:

```text
d8aa8ab
```

But note there may be later docs-only commits. The decision should clearly distinguish:

```text
Technical production smoke passed after commit d8aa8ab.
Final decision record commit will be this task's commit.
```

If Codex can determine the exact current HEAD, record:

```text
Approved production app state: current anyu-next production deployment already serving smoke-passed app.
Decision record commit: <new commit>
```

Do not invent if uncertain.

### 4. Technical Smoke Status

Record:

```text
Passed.
Production DB migration complete.
Required tables present.
Production smoke passed for analyze, result load, unlock, Email fallback, legal routes, and redirect.
Event/privacy verification passed.
```

### 5. Human Browser / Phone Smoke Status

Record:

```text
Passed.
User manually tested production and confirmed it behaves like staging with no obvious issue.
```

### 6. Model Strategy

Record:

```text
MODEL_STRATEGY=sonnet_default
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Explicitly:

```text
Guarded Haiku exists but is not approved for production default.
```

### 7. Database / Migration Status

Record:

```text
Production migration complete.
Required runtime tables present.
Production DB is being used for production smoke.
```

Do not include secrets.

### 8. Legal / Trust Status

Record:

```text
/privacy, /terms, /disclaimer, /legal implemented and verified.
hello@anyu.tw is public contact/deletion/support email.
```

### 9. LINE Funnel Status

Record:

```text
LINE-first notification flow implemented.
LINE add URL: https://lin.ee/S6dnbJO
Mobile LINE handoff manually verified.
Desktop QR fallback accepted.
No immediate complete-analysis delivery promised.
LINE API / LIFF / webhook deferred.
```

### 10. Abuse Guard / Cost Cap Status

Record:

```text
30-char minimum
4000-char hard max
relationship-content guard
prompt-injection/misuse guard
session/global caps
process-local IP hourly cap
Claude API hard limit remains final backstop
```

### 11. Retention Cleanup SOP

Record explicit acceptance:

```text
For the first low-key launch, manual retention cleanup every 24–48h is accepted.
Before paid ads or broader public traffic, scheduled cleanup should be implemented or explicitly re-approved.
```

Mention:

```text
Privacy wording remains a 24-hour goal, not hard automated promise.
```

### 12. Known Risks Accepted

Include:

```text
Analyze latency around 25–30s with Sonnet.
No real payment yet.
LINE add click is a proxy, not confirmed friend-add completion.
No LIFF / automatic LINE mapping.
Manual retention cleanup for low-key launch.
Process-local IP limiter is not a distributed limiter.
Docs/legal and app legal content require manual sync.
www redirect implemented at app layer; can move to platform later.
Safe Vercel env-run probe inconsistency for DATABASE_URL remains known, but production migration/smoke passed.
```

### 13. Launch Constraints

Must include:

```text
No ads yet.
No paid campaign yet.
No mass LINE broadcast.
No real payment.
No model switch.
No broad public announcement without another decision.
Monitor first 24–48h.
```

### 14. Rollback Plan

Include:

```text
Vercel rollback to previous deployment
disable/hide paid/LINE CTA if needed
lower ANALYSIS_GLOBAL_DAILY_LIMIT
disable ads if any accidentally started
keep MODEL_STRATEGY=sonnet_default
```

### 15. Monitoring Plan

Monitor:

```text
analysis_started
analysis_completed
analysis_failed
paid_unlock_clicked
line_add_clicked
email_fallback_opened
contact_submitted
error_seen
provider error rate
schema validation failures
median latency
daily analysis count
API spend
LINE CTA clicks
```

### 16. Human Approval

Record:

```text
Human approval: approved by user in chat
Approval wording: "ok" after final human production smoke was accepted
Approval date: 2026-05-20
```

### 17. Final Go / No-Go

State:

```text
Final decision: GO for low-key production launch.
```

## Decision Draft Update

Update:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md
```

Add a note at top or bottom:

```text
Superseded by final decision:
ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md
```

Do not delete original draft.

## Production Runbook Update

Update only if useful:

```text
docs/operations/production-deployment-runbook.md
```

Add a short reference to the final decision record if appropriate.

Do not rewrite runbook.

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-production-launch-decision-finalization-v0-execution-report.md
```

Report structure:

```markdown
# Production Launch Decision Finalization v0 Execution Report

## Summary

## Files Created

## Files Updated

## Final Decision

## Launch Scope

## Accepted Risks

## Retention SOP

## Monitoring Plan

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
- final decision
- launch scope
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
ads launch
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
LINE funnel behavior
general app UI
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
git commit -m "docs: finalize low-key production launch decision"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- final decision path
- final Go / No-Go
- launch scope
- accepted risks
- retention SOP
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
