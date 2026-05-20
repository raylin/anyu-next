# Handoff: LINE CTA Env Hotfix + Staging Verification v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Fix and verify the staging LINE CTA behavior.

The user reported that clicking the LINE CTA did not navigate to LINE and instead fell back to Email. This strongly suggests that `NEXT_PUBLIC_LINE_ADD_URL` is missing, misconfigured, or not included in the current Vercel staging build.

This task should make the LINE CTA point to:

```text
https://lin.ee/S6dnbJO
```

on staging, then verify the behavior.

This is a focused env/config + staging verification task.

Do not redesign the contact panel.

Do not implement LINE API, LIFF, webhook, email sending, payment, auth, or portal.

## Background

LINE Funnel Contact UI Implementation v0 completed.

Expected behavior:

```text
Paid unlock
→ LINE-first contact panel
→ primary CTA: 加入 LINE，收到開放通知
→ same-tab navigation to https://lin.ee/S6dnbJO
```

Actual user report:

```text
Clicking LINE CTA did not navigate to LINE.
It fell back to Email.
```

Likely cause:

```text
NEXT_PUBLIC_LINE_ADD_URL is not available in the deployed staging frontend bundle.
```

Important note:

`NEXT_PUBLIC_*` values are baked into the frontend bundle at build time. After setting or changing `NEXT_PUBLIC_LINE_ADD_URL`, staging must be redeployed.

## Scope

Do:

1. Confirm current code uses `NEXT_PUBLIC_LINE_ADD_URL` for LINE CTA.
2. Confirm Vercel Preview/Staging env has `NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO`.
3. If missing, set it for Preview/Staging.
4. Redeploy or trigger staging refresh after env is set.
5. Verify staging bundle now contains/uses the LINE add-friend URL.
6. Verify LINE CTA no longer falls back to Email when clicked.
7. Verify Email fallback is still available as secondary option.
8. Document result.
9. Commit report and push to `origin/staging`.

Do not:

- set/change production env unless explicitly approved
- commit `.env` / secrets
- change DB/schema/runtime/model/prompt
- implement LINE API
- add LIFF/webhook
- change legal semantics

## Required Env

Set/confirm for Vercel Preview/Staging:

```text
NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/S6dnbJO
```

This is public and not secret.

If using Vercel CLI:

```bash
vercel env ls
vercel env add NEXT_PUBLIC_LINE_ADD_URL preview
# value: https://lin.ee/S6dnbJO
```

If the env already exists but is wrong, update it safely.

After env change:

```bash
vercel --cwd apps/web
```

or use the repo’s correct Vercel deployment command.

Do not alter production env.

## Verification

Test staging:

```text
https://staging.anyu.tw/m/ambiguous-temperature/result/demo
```

Flow:

1. Open demo result.
2. Click paid unlock CTA.
3. Confirm LINE-first panel appears.
4. Confirm primary LINE CTA href or click target is `https://lin.ee/S6dnbJO`.
5. Confirm clicking it uses same-tab navigation.
6. Confirm Email fallback does not appear by default due to missing URL.
7. Confirm Email fallback still works when explicitly selected.

If authenticated/protected staging makes true browser click difficult, verify via HTML/JS bundle inspection plus authenticated route checks, and document limitation.

## If Code Bug Is Found

If env is present and fresh deployment still falls back, inspect app code.

Possible issues:

```text
wrong env variable name
client component reading env at runtime incorrectly
empty string guard too strict
href not passed to ContactCapture
button handler always opens fallback
```

Make the smallest safe fix.

Add/update tests if a code fix is needed.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-line-cta-env-hotfix-staging-verification-v0.md
```

Required sections:

```markdown
# LINE CTA Env Hotfix + Staging Verification v0

## 1. Summary

## 2. User-Reported Issue

## 3. Root Cause

## 4. Env Status

## 5. Deployment / Redeploy Result

## 6. Staging Verification

## 7. Email Fallback Verification

## 8. Fixes Applied

## 9. Remaining Limitations

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-line-cta-env-hotfix-staging-verification-v0-execution-report.md
```

Report structure:

```markdown
# LINE CTA Env Hotfix + Staging Verification v0 Execution Report

## Summary

## Files Created

## Files Updated

## Env Status

## Deployment Status

## LINE CTA Verification

## Email Fallback Verification

## Fixes Applied

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
- LINE URL env status
- staging verification result
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If code changed, validate after code change.

If only env/deploy/report changed, still run validation.

## Constraints

Do not implement:

```text
LINE Messaging API
LIFF
webhook
email sending
auth
payment
portal
share PNG / OG generation
model switch
major runtime rewrite
```

Do not modify:

```text
product prompt/schema content
provider architecture
DB schema
legacy prototype behavior
Dcard scripts
design system v1.1 tokens unless necessary
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
raw private user content
raw DB row dumps
real contact values
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "chore: verify line cta staging env"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- root cause
- whether NEXT_PUBLIC_LINE_ADD_URL is configured
- whether staging was redeployed
- LINE CTA behavior after fix
- Email fallback behavior
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
