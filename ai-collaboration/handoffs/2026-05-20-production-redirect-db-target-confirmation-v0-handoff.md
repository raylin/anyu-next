# Handoff: Production Redirect + DB Target Confirmation v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Resolve the two remaining production infrastructure blockers after production domain normalization:

1. Enforce / verify `www.anyu.tw → https://anyu.tw` canonical redirect.
2. Confirm, in a secret-safe way, that production `DATABASE_URL` points to the Neon `anyu-next` production branch.

This task should also verify whether production `ANTHROPIC_API_KEY` is usable enough for a future production smoke test.

This is a narrow production infrastructure verification task.

Do not run production DB migrations in this task.

Do not approve production launch.

Do not change app behavior, runtime, model, prompt/schema, DB schema, LINE flow, legal semantics, design system, auth, payment, or portal scope.

## Background

Production Domain Move Approval + Env Finalization v0 completed.

Current verified state:

```text
https://anyu.tw → anyu-next production deployment
https://www.anyu.tw → anyu-next production deployment
production public env values → set on anyu-next
fresh production deployment → healthy
production launch status → No-Go
```

Remaining blockers from that pass:

```text
1. www.anyu.tw serves the app but does not redirect to apex yet.
2. DATABASE_URL target still lacks a clean secret-safe confirmation path.
3. ANTHROPIC_API_KEY exists by name, but actual production analyze usability still requires smoke verification later.
```

Desired domain policy:

```text
Canonical: https://anyu.tw
Redirect: https://www.anyu.tw → https://anyu.tw
```

Desired DB policy:

```text
Production DATABASE_URL must point to Neon anyu-next production branch, not preview/dev/old anyu branch.
```

## Scope

Do:

1. Verify current `anyu.tw` and `www.anyu.tw` behavior.
2. Configure or document how to configure `www.anyu.tw → https://anyu.tw` redirect if possible.
3. Verify redirect result.
4. Confirm production `DATABASE_URL` target in a secret-safe way.
5. Confirm whether production `ANTHROPIC_API_KEY` presence is enough for next smoke, without printing the key.
6. Update production launch decision draft.
7. Update production runbook if needed.
8. Create verification report and execution report.
9. Append summary log.
10. Commit and push to `origin/staging`.

Do not:

- run production migration
- run full production analyze if it would require DB schema/migration not ready
- print `DATABASE_URL`
- print `ANTHROPIC_API_KEY`
- change model strategy
- change production app behavior
- turn on ads
- send LINE messages
- approve launch

## Domain Redirect Requirements

Target:

```text
https://anyu.tw → 200 OK serving anyu-next
https://www.anyu.tw → 301 or 308 redirect to https://anyu.tw
```

If Vercel supports project-domain redirect configuration:

- Set `www.anyu.tw` to redirect to apex if safe and available.
- Document the exact action.

If Vercel requires DNS/domain-dashboard action:

- Document exact manual steps.
- Do not improvise.

If redirect cannot be configured in Vercel but can be implemented via Next.js redirect config:

- Consider whether a tiny app-level redirect is acceptable.
- If implemented, it must be narrow:
  - host `www.anyu.tw`
  - redirect to `https://anyu.tw`
  - preserve path/query if possible
- Run full validation.
- Document that app-level redirect is used.

Do not break `staging.anyu.tw`.

## DB Target Confirmation

Confirm production `DATABASE_URL` target without exposing the secret.

Preferred methods, in order:

### Method A: Vercel + Neon dashboard metadata

Confirm from provider metadata:

```text
Vercel production DATABASE_URL is linked to Neon project anyu-next.
Branch: production.
Region: aws-ap-southeast-1.
```

No secret printed.

### Method B: Masked connection metadata

If tooling can safely parse only host/project/branch identifier without exposing username/password, report masked metadata only.

Example allowed:

```text
host/project appears to match Neon anyu-next production branch
branch: production
```

Forbidden:

```text
full postgres URL
username
password
full host if it embeds secret-like data
```

### Method C: Safe production DB probe without migration

If and only if safe and read-only:

- Use production `DATABASE_URL` to run a read-only query that identifies current database/branch metadata or checks existing tables.
- Do not print connection string.
- Do not write data.
- Do not run migration.

Allowed examples:

```sql
select current_database();
select now();
```

If available, Neon branch metadata is preferred over SQL introspection.

### If confirmation is impossible

Do not claim confirmed.

Mark:

```text
DATABASE_URL target: pending manual confirmation
```

And list exact manual confirmation steps.

## ANTHROPIC_API_KEY Readiness

Do not print key.

Verify one of:

```text
env name exists in Vercel production
or
future production smoke will test actual provider call
```

Do not run full production analyze unless DB/migration readiness is already safe.

If only name exists, mark:

```text
ANTHROPIC_API_KEY: present by env-name; actual provider call pending production smoke.
```

## Production Launch Decision Draft Update

Update:

```text
ai-collaboration/decisions/2026-05-20-production-launch-decision-draft-v0.md
```

Update:

```text
www redirect status
DATABASE_URL target confirmation status
ANTHROPIC_API_KEY smoke readiness
Current Go/No-Go status
Remaining blockers
```

Keep:

```text
No-Go
```

unless production migration and smoke were also approved and completed, which is not expected.

## Production Runbook Update

Update if needed:

```text
docs/operations/production-deployment-runbook.md
```

Add/clarify:

```text
www.anyu.tw must redirect to apex before launch approval.
DATABASE_URL must be confirmed against Neon anyu-next production branch without exposing secrets.
Provider key presence alone is insufficient; production smoke must verify actual provider call after DB migration.
```

Do not rewrite the full runbook.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-20-production-redirect-db-target-confirmation-v0.md
```

Required sections:

```markdown
# Production Redirect + DB Target Confirmation v0

Date: 2026-05-20

## 1. Summary

## 2. Starting State

## 3. Apex Domain Status

## 4. www Redirect Status

## 5. Redirect Action Taken Or Manual Steps

## 6. Production DATABASE_URL Target Status

## 7. ANTHROPIC_API_KEY Readiness

## 8. Production Launch Decision Updates

## 9. Remaining Blockers

## 10. Current Go / No-Go Status

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-production-redirect-db-target-confirmation-v0-execution-report.md
```

Report structure:

```markdown
# Production Redirect + DB Target Confirmation v0 Execution Report

## Summary

## Files Created

## Files Updated

## Domain Redirect Status

## DB Target Confirmation Status

## Provider Key Readiness

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
- www redirect status
- DATABASE_URL target status
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

If code/config redirect change is made, validate after the change.

If only docs/report changed, still run validation.

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
ad launch
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
git commit -m "ops: verify production redirect and db target"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- www redirect status
- whether redirect was configured or remains manual
- DATABASE_URL target confirmation status
- ANTHROPIC_API_KEY readiness status
- current Go/No-Go status
- remaining blockers
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
