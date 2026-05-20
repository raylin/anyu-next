# Handoff: Production Domain Move Approval + Env Finalization v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Execute the approved production project/domain normalization preparation for `anyu-next` by finalizing production env readiness and moving/assigning the production domains to the correct Vercel project when explicitly safe.

This task should move the project closer to production launch, but it should **not** deploy production product traffic beyond domain/env normalization unless explicitly scoped below.

Do not run production database migrations in this task.

Do not mark production launch as approved.

Do not change app runtime, model, prompt/schema, DB schema, legal semantics, LINE behavior, design system, auth, payment, or portal scope.

## Human Approval

The user approves the following production normalization direction:

```text
Production project for this launch: anyu-next
Canonical production domain: https://anyu.tw
www redirect policy: https://www.anyu.tw → https://anyu.tw
```

The old Vercel project `anyu` should not remain the production-facing project for this Module 01 launch, unless verification finds a hidden dependency that requires a pause.

## Background

Production Project + Domain Normalization v0 completed.

Key findings:

```text
staging.anyu.tw serves anyu-next
anyu.tw currently serves older anyu project
recommended path: Option A — normalize production onto anyu-next
canonical: https://anyu.tw
www: redirect to apex
Neon anyu-next production branch exists in aws-ap-southeast-1
anyu-next production env is missing some required vars
production launch decision remains No-Go
```

Current blocker:

```text
Production domain/project/env ownership is not normalized yet.
```

## Scope

Do:

1. Verify no obvious hidden dependency requires keeping `anyu.tw` on old `anyu` project.
2. Confirm `anyu-next` Vercel project settings.
3. Complete missing `anyu-next` production env vars if safe and approved.
4. Confirm production `DATABASE_URL` points to Neon `anyu-next` production branch without printing secrets.
5. Assign/move `anyu.tw` to `anyu-next` if Vercel access and domain state allow.
6. Assign/move `www.anyu.tw` to `anyu-next` if Vercel access and domain state allow.
7. Configure/verify `www.anyu.tw → https://anyu.tw` redirect policy if available through Vercel/domain config.
8. Verify SSL/domain status after assignment as much as possible.
9. Update production launch decision draft and runbook.
10. Create execution report and summary log.
11. Commit and push to `origin/staging`.

Do not:

- run production DB migration
- deploy approved production launch
- merge to main
- change app code unless docs/config metadata only
- delete old `anyu` project
- modify old project env unless strictly needed to detach domain and explicitly documented
- expose secret values
- print connection strings
- change model strategy away from Sonnet default
- turn on ads
- send LINE broadcasts

## Required Production Env For anyu-next

Ensure `anyu-next` production env has these names and expected policies.

Required:

```text
DATABASE_URL=<Neon anyu-next production pooled connection string>
ANTHROPIC_API_KEY=<configured; do not print>
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ORADAR_PROVIDER=anthropic
MODEL_STRATEGY=sonnet_default
NEXT_PUBLIC_APP_URL=https://anyu.tw
NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO
ANALYSIS_SESSION_DAILY_LIMIT=3
ANALYSIS_IP_HOURLY_LIMIT=10
ANALYSIS_GLOBAL_DAILY_LIMIT=200
```

Optional, not production default:

```text
ANTHROPIC_FAST_MODEL=claude-haiku-4-5-20251001
ANTHROPIC_FALLBACK_MODEL=claude-sonnet-4-20250514
```

Important:

```text
Do not set MODEL_STRATEGY=haiku_retry_sonnet_fallback in production.
```

If env values are missing and Codex can set Vercel env safely, set them only where values are known and public/non-secret.

For secrets:

- Do not invent values.
- Do not print values.
- If missing, report manual action required.

Known public envs safe to set:

```text
NEXT_PUBLIC_APP_URL=https://anyu.tw
NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO
MODEL_STRATEGY=sonnet_default
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ORADAR_PROVIDER=anthropic
ANALYSIS_SESSION_DAILY_LIMIT=3
ANALYSIS_IP_HOURLY_LIMIT=10
ANALYSIS_GLOBAL_DAILY_LIMIT=200
```

Secrets/manual confirmation likely required:

```text
DATABASE_URL
ANTHROPIC_API_KEY
```

## Neon Production DATABASE_URL

Verify without printing:

```text
DATABASE_URL exists in anyu-next production env
DATABASE_URL points to Neon anyu-next production branch
DATABASE_URL is not preview/dev branch
DATABASE_URL is pooled/serverless suitable if that is current standard
```

If verification is impossible due to encrypted env output:

```text
Do not claim confirmed.
Mark as pending manual confirmation.
```

Do not run migration.

## Domain Move / Assignment

Target:

```text
anyu.tw → anyu-next
www.anyu.tw → anyu-next
www.anyu.tw redirects to https://anyu.tw
```

Before moving:

1. Record current owner/project if visible.
2. Confirm old `anyu` project has no hidden dependency found from accessible metadata.
3. Document that user approved Option A.

If Vercel CLI/dashboard allows safe assignment:

- Add/assign `anyu.tw` to `anyu-next`.
- Add/assign `www.anyu.tw` to `anyu-next`.
- Configure redirect if supported.
- Do not deploy launch content beyond normal Vercel project behavior.

If domain is blocked by existing assignment:

- Document exact manual Vercel steps.
- Do not force destructive changes unless explicitly safe and approved.

If DNS requires external registrar changes:

- Document required records.
- Do not change DNS unless tool access and approval are present.

## Vercel / Build Notes

Remember:

```text
NEXT_PUBLIC_* env changes require rebuild/redeploy.
After any env/domain change, verify domain points to fresh deployment.
```

This task may trigger a Vercel deployment only if necessary to refresh env/domain state, but it should not call that a production launch.

If a production deployment is triggered by Vercel domain assignment/build mechanics, document it as environment/domain verification, not launch approval.

## Verification

Verify as much as possible:

```text
https://anyu.tw
https://www.anyu.tw
```

Expected after normalization:

```text
https://anyu.tw resolves to anyu-next
https://www.anyu.tw redirects to https://anyu.tw or is ready to do so
SSL valid
```

If `anyu.tw` starts serving current app, do only safe smoke checks with synthetic input if explicitly safe. Do not run migration unless required and approved.

Preferred verification:

```text
domain assignment status
SSL status
Vercel inspect
HTTP status
project/deployment target
```

## Production Launch Decision Draft Update

Update:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md
```

Record:

```text
Domain/project normalization status
Production env status
DATABASE_URL confirmation status
www redirect status
Current Go/No-Go status
```

Keep `No-Go` unless:

- production env fully verified
- DB migration plan approved
- production migration complete
- final human smoke accepted
- human approval given

This task is expected to keep No-Go unless all those happen, which is unlikely.

## Production Runbook Update

Update if needed:

```text
docs/operations/production-deployment-runbook.md
```

Add notes:

```text
Production normalization target is anyu-next.
anyu.tw canonical; www redirects to apex.
NEXT_PUBLIC_* env rebuild rule applies.
```

Do not rewrite entire runbook.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-20-production-domain-move-env-finalization-v0.md
```

Required sections:

```markdown
# Production Domain Move Approval + Env Finalization v0

Date: 2026-05-20

## 1. Summary

## 2. Human Approval

## 3. Starting State

## 4. Vercel Project Status

## 5. Production Env Status

## 6. Neon DATABASE_URL Status

## 7. Domain Assignment Status

## 8. www Redirect Status

## 9. Actions Taken

## 10. Manual Actions Still Needed

## 11. Production Go / No-Go Status

## 12. Updates To Launch Decision

## 13. Remaining Risks

## 14. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-production-domain-move-env-finalization-v0-execution-report.md
```

Report structure:

```markdown
# Production Domain Move Approval + Env Finalization v0 Execution Report

## Summary

## Files Created

## Files Updated

## Env Actions

## Domain Actions

## Verification Results

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
- domain normalization status
- env finalization status
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

Docs/env/domain task, but validation should still pass.

## Constraints

Do not implement:

```text
production launch approval
production DB migration
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
git commit -m "ops: normalize production domain plan"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- whether domain was moved/assigned
- whether production env was finalized
- whether DATABASE_URL target was confirmed
- www redirect status
- current Go/No-Go status
- manual actions remaining
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
