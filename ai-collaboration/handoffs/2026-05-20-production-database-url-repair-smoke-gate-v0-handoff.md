# Handoff: Production DATABASE_URL Repair + Smoke Gate v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Confirm or repair production `DATABASE_URL` readiness for `anyu-next`, then run a tightly scoped production smoke test only if the production DB target is confirmed safe.

The user says `DATABASE_URL` was intentionally configured and should point to the correct Neon production branch, but the previous safe probe could not confirm it.

This task should treat the user's setup as likely correct but use verification results as the source of truth.

Do not approve production launch.

Do not turn on ads.

Do not change product behavior, runtime, model, prompt/schema, legal semantics, LINE flow, design system, auth, payment, or portal scope.

## Background

Production Redirect + DB Target Confirmation v0 completed.

Current verified state:

```text
https://anyu.tw serves healthy anyu-next production deployment.
https://www.anyu.tw returns 308 to https://anyu.tw/.
ANTHROPIC_API_KEY appears present via safe production probe.
DATABASE_URL could not be confirmed via previous safe probe.
Production launch remains No-Go.
```

User clarification:

```text
DATABASE_URL was intentionally configured and should be the correct branch.
Verification/test result should be treated as the source of truth.
```

Key caution:

```text
Do not run production analyze until DATABASE_URL target and production schema state are safe enough.
```

## Scope

Do:

1. Confirm production `DATABASE_URL` exists and is non-empty in production runtime.
2. Confirm, in a secret-safe way, that it points to Neon `anyu-next` production branch.
3. Confirm production DB schema/migration state.
4. If production DB is missing required schema, report and stop unless migration is explicitly approved in this handoff.
5. If DB is confirmed and schema-ready, run a tightly scoped production smoke test with synthetic input.
6. Verify production smoke:
   - landing loads
   - valid analyze succeeds
   - result route loads
   - unlock intent works
   - LINE-first panel appears
   - LINE CTA points to `https://lin.ee/S6dnbJO`
   - Email fallback still works if safe
   - legal routes load
7. Verify production event/privacy safety as much as possible.
8. Update production launch decision draft.
9. Create report, execution report, summary log.
10. Commit and push to `origin/staging`.

Do not:

- print `DATABASE_URL`
- print secrets
- commit `.env`
- run destructive SQL
- run broad production data writes beyond the one synthetic smoke flow
- run migration unless explicitly determined necessary and approved by user
- approve launch
- switch model strategy
- use real user/contact content
- send LINE messages
- turn on ads

## Gate A: DATABASE_URL + DB Target Confirmation

This gate must pass before production smoke.

### Required confirmation

Confirm without exposing secret:

```text
DATABASE_URL exists
DATABASE_URL is non-empty
DATABASE_URL points to Neon anyu-next production branch
DATABASE_URL is not staging/preview/dev branch
production DB is reachable
production schema state is known
```

### Preferred safe methods

Use one or more:

#### Method A: Vercel env/runtime probe

Run a safe production runtime probe that confirms:

```text
DATABASE_URL present: yes
DATABASE_URL non-empty: yes
```

Do not print value.

#### Method B: Masked metadata

If possible, derive only safe metadata:

```text
provider: Neon
project: anyu-next
branch: production
region: aws-ap-southeast-1
```

Do not print full host if it contains secret-like data.

#### Method C: Read-only SQL probe

If using production DATABASE_URL directly is safe:

Run only read-only SQL such as:

```sql
select current_database();
select current_schema();
select now();
```

Optional table presence check:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'sessions',
    'events',
    'analysis_requests',
    'analysis_results',
    'unlock_intents',
    'contact_submissions'
  );
```

Do not dump rows.

Do not include raw connection details.

### If DB target cannot be confirmed

Stop before production smoke.

Update decision draft:

```text
No-Go: production DATABASE_URL target still unconfirmed.
```

Report exact manual confirmation needed.

## Gate B: Production Schema / Migration Readiness

After DB target is confirmed, determine whether the expected schema exists.

Required tables:

```text
sessions
events
analysis_requests
analysis_results
unlock_intents
contact_submissions
```

If tables exist:

```text
schema-ready for smoke: yes
```

If tables are missing:

```text
schema-ready: no
```

Then stop and recommend:

```text
Production Migration v0
```

Do not run migration in this task unless user explicitly approves within the task.

## Gate C: Production Smoke Test

Only run if Gate A and Gate B pass.

Use synthetic input only:

```text
他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
```

Synthetic email if contact fallback is tested:

```text
anyu-production-smoke@example.com
```

Do not use real contact values.

### Smoke checklist

Verify:

```text
https://anyu.tw/m/ambiguous-temperature loads
valid input submit succeeds
result route loads
temperature card renders
observed signals render
paid preview renders
unlock intent succeeds
LINE-first panel appears
LINE CTA href is https://lin.ee/S6dnbJO
Email fallback opens and optionally submits synthetic email
/privacy loads
/terms loads
/disclaimer loads
www.anyu.tw redirects to apex
```

### Privacy/event checks

If accessible, verify:

```text
events do not contain raw input
events do not contain synthetic email
events do not contain full result JSON
events do not contain provider raw output
```

Do not paste DB rows.

## Production Launch Decision Draft Update

Update:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md
```

Record:

```text
DATABASE_URL confirmation result
schema readiness result
production smoke result if run
current Go/No-Go status
remaining blockers
```

Expected status:

- If DB target confirmed, schema exists, and smoke passes:
  ```text
  No-Go pending final human approval / launch decision finalization
  ```
- If DB target or schema not confirmed:
  ```text
  No-Go
  ```

Do not mark Go in this task.

## Production Runbook Update

Update only if needed:

```text
docs/operations/production-deployment-runbook.md
```

Possible additions:

```text
DB target confirmation method used
production smoke gate requirements
synthetic smoke contact values
```

Do not rewrite runbook.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-20-production-database-url-repair-smoke-gate-v0.md
```

Required sections:

```markdown
# Production DATABASE_URL Repair + Smoke Gate v0

Date: 2026-05-20

## 1. Summary

## 2. Starting State

## 3. DATABASE_URL Presence Check

## 4. DATABASE_URL Target Confirmation

## 5. Production Schema / Migration State

## 6. Production Smoke Eligibility

## 7. Production Smoke Result

## 8. Event / Privacy Verification

## 9. Legal / LINE / Redirect Verification

## 10. Actions Taken

## 11. Remaining Blockers

## 12. Current Go / No-Go Status

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-production-database-url-repair-smoke-gate-v0-execution-report.md
```

Report structure:

```markdown
# Production DATABASE_URL Repair + Smoke Gate v0 Execution Report

## Summary

## Files Created

## Files Updated

## DB Target Confirmation

## Schema / Migration State

## Smoke Test Status

## Privacy Verification

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
- DATABASE_URL confirmation status
- schema state
- smoke result
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

If any code/config changes are made, validate after changes.

Docs/probe task, but validation should still pass.

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
DB schema unless separately approved
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
git commit -m "ops: verify production database and smoke gate"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- DATABASE_URL presence/target status
- production schema state
- whether smoke was run
- smoke result if run
- privacy/event result
- current Go/No-Go status
- remaining blockers
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
