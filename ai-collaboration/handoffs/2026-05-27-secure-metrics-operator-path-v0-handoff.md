# Handoff: Secure Metrics Operator Path v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Improve the operational safety and repeatability of Module 01 metrics reporting.

This task should define and implement a safer operator workflow for running aggregate-only staging/production funnel metrics without exposing raw connection strings, secrets, raw event rows, user content, tokens, LINE IDs, or paid result JSON.

This task should build on:

```text
- module01:metrics CLI
- operatorTest metadata
- /api/health build marker
- low-key production monitoring docs
```

This is an ops/metrics safety task.

Do not build an admin dashboard.

Do not expose public metrics endpoint.

Do not change product behavior.

Do not change event semantics unless only adding safe guardrails.

Do not change DB schema unless absolutely necessary.

Do not start ads.

Do not enable payment.

## Background

Current state:

```text
- Module 01 low-key production is active/monitor.
- module01:metrics CLI exists and aggregates events.
- operatorTest traffic is excluded by default.
- /api/health now exposes a safe build marker.
- Production metrics have been run using aggregate-only Neon production queries, but the workflow still relies on careful operator DB-target confirmation.
```

Current friction / risk:

```text
- Running local metrics requires knowing which DATABASE_URL is active.
- Local environment pulls may intentionally not expose usable DB URLs.
- Production DB connection handling should not become casual or copy-pasted.
- Reports should stay aggregate-only and never dump raw rows.
- Operators need a repeatable runbook that makes environment targeting explicit.
```

Goal:

```text
Make metrics reporting safer, harder to misuse, and easier to audit.
```

## Scope

Do:

1. Inspect current `module01:metrics` CLI.
2. Inspect DB connection behavior and docs.
3. Design a safer operator workflow for staging/production metrics.
4. Add explicit environment targeting / guardrails if appropriate.
5. Add dry-run / target confirmation behavior if appropriate.
6. Add output safety checks if appropriate.
7. Update operations docs.
8. Add tests for guardrails.
9. Create review bundle, execution report, summary log.
10. Commit and push to `origin/staging`.

Do not:

- expose a public metrics web route
- build admin UI
- expose raw DB connection strings
- print DATABASE_URL
- dump raw event rows
- export raw production data
- add new product tracking semantics unless separately approved
- change existing event names
- change LINE behavior
- change payment behavior
- change production product behavior

## Design Goals

The operator path should be:

```text
explicit
safe by default
aggregate-only
operator-test aware
environment-aware
hard to run accidentally against wrong DB
easy to record in reports
```

## Preferred Direction

Codex should evaluate repo constraints and choose the safest low-complexity path.

Possible options:

### Option A — Enhanced CLI guardrails

Keep CLI local but add:

```text
--target staging|production
--confirm-production
--dry-run
--show-target
--redact-check
```

Behavior:

```text
- Default refuses to run if target is unknown.
- Production requires explicit --target production and --confirm-production.
- CLI prints only safe target label, never DB URL.
- CLI prints /api/health build marker if a base URL is provided.
- CLI refuses raw row output.
```

Pros:

```text
low complexity
no public endpoint
keeps data local/operator-controlled
```

Cons:

```text
still requires secure DB access in operator environment
```

### Option B — Secure internal cron/operator endpoint

Add a secret-gated route that returns aggregate metrics only.

Example:

```text
GET /api/ops/module-01/metrics?last=24h
x-ops-secret: <secret>
```

Pros:

```text
no local DB URL required
uses runtime production DB safely
easier for operator
```

Cons:

```text
new sensitive endpoint
requires strong auth/rate limiting
must avoid public exposure
more security review
```

### Option C — Vercel/Neon operator script

Document a runbook to run aggregate SQL via approved Neon/Vercel environment without exposing connection string.

Pros:

```text
no app endpoint
clear ops path
```

Cons:

```text
less ergonomic
harder to automate
```

Expected recommendation:

```text
Start with Option A enhanced CLI guardrails and runbook.
Defer secret-gated metrics endpoint until admin/ops needs justify it.
```

If Codex believes Option B is safer in this repo, document why and keep it heavily secret-gated. Do not implement Option B without clear justification.

## Required CLI Guardrails If Using Option A

Enhance `module01:metrics` with:

```text
--target staging|production|local
--confirm-production
--base-url https://anyu.tw or https://staging.anyu.tw
--dry-run
--format markdown|json
--include-operator
```

Required behavior:

```text
1. If --target production is used without --confirm-production, refuse.
2. If target is omitted, show a warning and require explicit confirmation or default to local only.
3. Never print DATABASE_URL.
4. Print safe target name only.
5. If --base-url is provided, fetch /api/health and include safe build marker in report.
6. If /api/health fetch fails, continue only if explicitly allowed or document unknown.
7. Operator traffic excluded by default.
8. Reports include Data Quality Notes.
9. Reports remain aggregate-only.
```

If fetching `/api/health` from CLI would introduce dependency complexity, document as manual step instead.

## Output Requirements

Metrics report should include:

```text
target: production|staging|local|unknown
time window
operatorTest excluded/included
health marker if provided:
  environment
  gitCommit
  gitBranch
  buildTime
  deploymentProvider
funnel aggregate counts
theme split
provider/fallback split
error categories
data quality notes
```

Never include:

```text
DATABASE_URL
raw event rows
raw input
paid_result_json
provider output
LINE user ID
tokenized URL
short code
unlock token
secrets
```

## Safety / Privacy Guard

Add explicit forbidden-output checks if practical.

Report generation should guard against these keys/strings in generated report content:

```text
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
paid_result_json
raw_input
lineUserId
idToken
unlockToken
fulfillmentCode
```

If the app has existing metadata scrubbers, reuse them.

Do not overfit to one report format.

## Documentation Requirements

Update or create:

```text
docs/operations/module-01-metrics-report.md
docs/operations/production-deployment-runbook.md
```

Document:

```text
How to run staging metrics safely.
How to run production metrics safely.
How to confirm target.
How to record /api/health build marker.
How to exclude operatorTest.
How to include operatorTest for QA-only review.
What metrics mean / do not mean.
Why event-count funnel is not sessionized.
What not to paste into reports.
```

Example safe production command:

```bash
cd apps/web
corepack pnpm module01:metrics --target production --confirm-production --last 24h --base-url https://anyu.tw --format markdown
```

If command shape differs, document final version.

## Tests

Add/update tests for:

```text
production target requires explicit confirmation
staging target does not require production confirmation
DATABASE_URL is never printed
unknown target handling
health marker fields are included when provided
health marker failure is handled safely
operatorTest excluded by default
--include-operator includes operator traffic
markdown report includes target and data quality notes
json report includes target metadata
forbidden key guard catches unsafe output if implemented
```

Use synthetic fixtures only.

Do not use real DB.

Do not require network in unit tests; mock health marker fetch if implemented.

## Behavior Preservation

After this task:

```text
module01:metrics still works for local/staging/production aggregates when configured
existing report calculations unchanged unless adding target metadata/warnings
product runtime unchanged
event collection unchanged
payment disabled
LINE unchanged
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-secure-metrics-operator-path-v0-review-bundle.md
```

Required sections:

```markdown
# Secure Metrics Operator Path v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Current Metrics Workflow Risk

## 3. Chosen Operator Path

## 4. CLI / Runbook Changes

## 5. Target Confirmation Behavior

## 6. Health Marker Integration

## 7. Output Privacy Guardrails

## 8. Tests Added

## 9. Known Limitations

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-secure-metrics-operator-path-v0-execution-report.md
```

Report structure:

```markdown
# Secure Metrics Operator Path v0 Execution Report

## Summary

## Files Created

## Files Updated

## Chosen Approach

## CLI / Runbook Changes

## Safety Guardrails

## Tests Added

## Validation Results

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

```text
date
task completed
secure metrics operator path summary
validation result
commit hash
staging push status
```

## Validation

Run full validation:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

No Playwright required unless UI/runtime behavior changes, which should not happen.

## Production Gate

Do not deploy production by default.

This task may be used immediately for production metrics once merged and the operator environment is configured.

## Constraints

Do not implement:

```text
admin dashboard
public metrics endpoint
payment integration
checkout
ads
email delivery
durable queue
sessionized metrics
membership
new module
```

Do not modify:

```text
production product behavior
LINE behavior
payment behavior
prompt/schema semantics
DB schema
legal semantics
event names
```

Do not commit:

```text
.env
.env.local
merchant IDs
payment API keys
HashKey
HashIV
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
business registration documents
bank documents
identity documents
owner personal email
owner personal phone
private address
raw production exports
raw private user content
tokens/tokenized URLs/LINE IDs
paid_result_json dumps
raw provider output
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "chore: secure metrics reporting"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
chosen approach
how to run production metrics safely
target confirmation behavior
health marker integration
privacy guardrails
tests added
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
