# Handoff: Production Migration + Smoke Gate v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Run the approved production database migration and then perform a tightly scoped production smoke test for Module 01 — 曖昧溫度計.

The user has explicitly confirmed that production `DATABASE_URL` was manually set to the intended Neon production branch. Do not keep trying to inspect or reveal the secret value.

This task should treat the user’s manual confirmation as the DB target confirmation source, then proceed with migration and smoke testing.

This task does **not** approve public launch.

Do not turn on ads.

Do not change model strategy.

Do not change app behavior, runtime, prompt/schema, legal semantics, LINE flow, design system, auth, payment, or portal scope.

## Explicit Human Confirmation

The user confirms:

```text
Production DATABASE_URL has been manually configured and is intended to point to the correct Neon anyu-next production branch.
```

Therefore:

```text
Do not print DATABASE_URL.
Do not repeatedly inspect secret value.
Use migration and production logs/smoke results as the source of truth.
```

## Background

Production DATABASE_URL Repair + Smoke Gate v0 completed but remained blocked.

Current known state:

```text
https://anyu.tw serves anyu-next production deployment.
https://www.anyu.tw redirects to https://anyu.tw/.
ANTHROPIC_API_KEY appears present.
DATABASE_URL is manually confirmed by user as the intended production branch.
Neon production branch exists but required runtime tables were not present in the listing used previously.
Production smoke was not run because DB gates had not passed.
Production launch remains No-Go.
```

Next logical step:

```text
Run production migration against the manually confirmed production DATABASE_URL, verify required tables, then run a limited synthetic production smoke.
```

## Scope

Do:

1. Record user’s explicit DATABASE_URL manual confirmation.
2. Run production migration against the configured production DATABASE_URL.
3. Verify required production tables exist after migration.
4. Run a tightly scoped production smoke test using synthetic input only.
5. Verify result route, unlock, LINE CTA, Email fallback if safe, legal routes, and redirect.
6. Verify production events/privacy boundaries as much as safely possible.
7. Capture production logs if migration or smoke fails.
8. Update production launch decision draft.
9. Create report, execution report, summary log.
10. Commit and push to `origin/staging`.

Do not:

- print `DATABASE_URL`
- print provider keys
- commit `.env`
- use real user content
- use real contact values
- run destructive SQL
- run broad load tests
- approve production launch
- enable ads
- switch model
- send LINE messages
- change runtime behavior

## Gate A: Production Migration

### Pre-migration checks

Before migration, verify:

```text
Vercel production env has DATABASE_URL name present.
User has manually confirmed target.
Migration files exist.
Working tree is clean or only expected task files are changed.
```

Do not print secret values.

### Migration command

Run the project migration command in production context.

Preferred:

```bash
cd apps/web
corepack pnpm db:migrate
```

Only run this with the intended production env loaded/configured.

If the command requires a specific Vercel env pull or local env file, use a safe non-committed temp method.

Do not commit `.env.production.local` or any env file.

### Post-migration verification

Verify required tables exist:

```text
sessions
events
analysis_requests
analysis_results
unlock_intents
contact_submissions
```

Do not dump table rows.

Allowed:

```text
table names present yes/no
migration command success/failure
```

If migration fails:

- stop before smoke
- capture sanitized error/log summary
- update launch decision as No-Go
- do not retry blindly if error is destructive or unclear

## Gate B: Production Smoke Test

Only run if migration succeeds and required tables exist.

Use production URL:

```text
https://anyu.tw/m/ambiguous-temperature
```

Use synthetic input only:

```text
他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
```

Synthetic email if needed:

```text
anyu-production-smoke@example.com
```

Do not use real contact values.

### Smoke checklist

Verify:

```text
https://anyu.tw/m/ambiguous-temperature loads
valid synthetic analyze succeeds
result route loads
temperature card renders
observed signals render
paid preview renders
unlock intent succeeds
LINE-first panel appears
LINE CTA target is https://lin.ee/S6dnbJO
Email fallback opens and optionally submits synthetic email
/privacy loads
/terms loads
/disclaimer loads
https://www.anyu.tw redirects to https://anyu.tw/
```

### Model strategy

Confirm production uses:

```text
MODEL_STRATEGY=sonnet_default
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Do not switch to Haiku.

## Event / Privacy Verification

If possible after smoke, verify safely:

```text
analysis_completed event exists
timing metadata is present if expected
events do not contain raw input
events do not contain synthetic email
events do not contain full result JSON
events do not contain provider raw output
contact_submissions contains only synthetic contact if Email fallback was tested
```

Do not paste raw DB rows.

## Logs If Failure

If production smoke fails, collect sanitized logs.

Allowed:

```text
status code
error code
error category
route name
timestamp
sanitized stack summary if no secrets
```

Forbidden:

```text
DATABASE_URL
ANTHROPIC_API_KEY
raw provider response
raw user input
full DB rows
```

## Production Launch Decision Draft Update

Update:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md
```

Record:

```text
production migration result
production table verification result
production smoke result
event/privacy verification result
current Go/No-Go status
remaining blockers
```

Expected status after this task:

If migration and smoke pass:

```text
No-Go pending final human approval / final launch decision.
```

If migration or smoke fails:

```text
No-Go pending fix.
```

Do not mark Go in this task.

## Production Runbook Update

Update only if needed:

```text
docs/operations/production-deployment-runbook.md
```

Possible additions:

```text
migration command actually used
production smoke sequence
sanitized log collection method
```

Do not rewrite the full runbook.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-20-production-migration-smoke-gate-v0.md
```

Required sections:

```markdown
# Production Migration + Smoke Gate v0

Date: 2026-05-20

## 1. Summary

## 2. User DATABASE_URL Confirmation

## 3. Migration Command

## 4. Migration Result

## 5. Table Verification

## 6. Smoke Eligibility

## 7. Production Smoke Result

## 8. Event / Privacy Verification

## 9. Legal / LINE / Redirect Verification

## 10. Logs / Failures

## 11. Production Launch Decision Updates

## 12. Remaining Blockers

## 13. Current Go / No-Go Status

## 14. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-production-migration-smoke-gate-v0-execution-report.md
```

Report structure:

```markdown
# Production Migration + Smoke Gate v0 Execution Report

## Summary

## Files Created

## Files Updated

## Migration Status

## Table Verification Status

## Smoke Test Status

## Event / Privacy Status

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
- migration result
- smoke result
- current Go/No-Go status
- validation result
- commit hash
- staging push status

## Validation

Always run local validation:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

Also document production migration/smoke result separately.

## Constraints

Do not implement:

```text
production launch approval
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
DB schema except applying existing migrations
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
.env.production.local
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
git commit -m "ops: run production migration smoke gate"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- migration result
- table verification result
- whether production smoke was run
- smoke result
- event/privacy verification result
- current Go/No-Go status
- remaining blockers
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
