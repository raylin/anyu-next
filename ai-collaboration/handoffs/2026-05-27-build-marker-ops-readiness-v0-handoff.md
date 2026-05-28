# Handoff: Build Marker + Ops Readiness v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Add a safe runtime build/version marker and improve ops readiness so staging/production smoke reports can reliably identify which commit/deployment is live.

This task should reduce uncertainty around deployment freshness without exposing secrets or changing product behavior.

This is an ops/readiness task.

Do not change user-facing product behavior.

Do not change LINE behavior.

Do not change payment behavior.

Do not change prompt/schema semantics.

Do not change DB schema unless a tiny metadata-free runtime route needs none.

Do not deploy production by default.

## Background

Recent stabilization audit found no P0 issues, but identified several P1 ops/scaling issues:

```text
- missing runtime build marker
- non-durable paid generation before scale
- non-sessionized metrics
- incomplete secure metrics operator path
- provider contact/applicant uncertainty
```

The recommended immediate follow-up was:

```text
Build Marker + Ops Readiness v0
```

Why this matters:

```text
- Staging and production reports often need behavioral checks to infer freshness.
- Vercel preview/staging deployments do not always expose exact commit at runtime.
- Production smoke reports should clearly identify the build being tested.
- Operator smoke and metrics reports need reliable deployment correlation.
```

## Scope

Do:

1. Add a safe build/version marker mechanism.
2. Expose safe runtime build info through an internal/health endpoint or existing health route.
3. Include commit/ref/build time/environment where safely available.
4. Ensure no secrets/env values are exposed.
5. Update staging/production smoke runbooks to use the marker.
6. Update tests.
7. Create review bundle, execution report, summary log.
8. Commit and push to `origin/staging`.

Do not:

- change product flow
- change UI unless a hidden/internal route is needed
- expose secrets
- expose DATABASE_URL
- expose provider keys
- expose LINE secrets/tokens
- change LINE webhook/LIFF behavior
- change paid generation
- change prompt/schema/cache
- change DB schema
- enable payment
- deploy production by default
- start ads

## Build Marker Requirements

Expose safe fields only.

Recommended fields:

```json
{
  "ok": true,
  "app": "anyu-web",
  "environment": "production|preview|development|unknown",
  "gitCommit": "short-or-full-sha-if-available",
  "gitBranch": "branch/ref-if-available",
  "buildTime": "ISO-8601-if-available",
  "deploymentProvider": "vercel",
  "versionSource": "env|build-time|unknown"
}
```

If some fields are unavailable, return:

```text
unknown
```

Do not fail health route if commit is unavailable.

## Source Of Build Info

Codex should inspect current Vercel/build environment.

Potential safe env vars:

```text
VERCEL
VERCEL_ENV
VERCEL_GIT_COMMIT_SHA
VERCEL_GIT_COMMIT_REF
VERCEL_GIT_REPO_SLUG
NEXT_PUBLIC_* only if already public and safe
```

Do not expose:

```text
all env
secrets
tokens
database URLs
provider keys
```

If build-time injection is preferred, create a tiny helper that reads allowed env vars only.

## Route Design

Preferred options:

### Option A — Extend existing health route

If existing route exists, e.g.:

```text
/api/health
```

Add build marker fields there.

Pros:

```text
simple
existing smoke can use it
```

Cons:

```text
public health endpoint exposes commit; commit SHA is usually safe but should be intentional
```

### Option B — Add internal-ish public-safe route

Example:

```text
/api/ops/build
```

Pros:

```text
clear purpose
can keep health minimal
```

Cons:

```text
another route
```

Expected recommendation:

```text
Use existing health route if present and keep only safe build metadata.
```

If commit SHA exposure is a concern, expose short SHA only.

## Safety Requirements

Must not expose:

```text
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LOGIN_CHANNEL_SECRET
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
NewebPay/ECPay merchant IDs or keys
HashKey/HashIV
private owner info
raw event data
```

Tests should assert forbidden fields do not appear.

## Ops Runbook Updates

Update relevant docs:

```text
docs/operations/production-deployment-runbook.md
docs/operations/module-01-metrics-report.md if useful
```

Add:

```text
- how to check live build marker
- how to record build marker in smoke reports
- how to interpret unknown commit marker
- how to avoid logging secrets
- how to correlate deployment ID, commit, and smoke result
```

Suggested smoke report checklist addition:

```text
Before route/API smoke:
1. GET /api/health or /api/ops/build.
2. Record safe commit/ref/buildTime/deployment env.
3. Confirm it matches expected candidate or document unknown.
```

## Tests

Add/update tests for:

```text
build marker returns ok
build marker returns safe env fields only
missing env vars return unknown and do not fail
health/build route does not expose forbidden secret-like keys
production/preview/development env mapping works
existing health tests still pass
```

If route tests exist, update them.

## Behavior Preservation

After task, these must remain true:

```text
landing loads
free analyze works
paid generation behavior unchanged
LINE/LIFF behavior unchanged
short-code behavior unchanged
payment remains disabled
module01:metrics still works
legal public pages unchanged except docs/runbook
```

No production deploy by default.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-build-marker-ops-readiness-v0-review-bundle.md
```

Required sections:

```markdown
# Build Marker + Ops Readiness v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Build Marker Design

## 3. Safe Fields Exposed

## 4. Forbidden Fields / Secret Safety

## 5. Route / Health Integration

## 6. Runbook Updates

## 7. Tests Added

## 8. Behavior Preservation

## 9. Known Limitations

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-build-marker-ops-readiness-v0-execution-report.md
```

Report structure:

```markdown
# Build Marker + Ops Readiness v0 Execution Report

## Summary

## Files Created

## Files Updated

## Build Marker Implementation

## Safety / Secret Exposure Review

## Runbook Updates

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
build marker summary
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
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort issue, record honestly.

## Production Gate

Default:

```text
staging branch only
```

Do not deploy production unless explicitly approved.

If this reaches production later, smoke reports should use the marker.

## Constraints

Do not implement:

```text
durable queue
sessionized metrics
payment integration
checkout
ads
admin dashboard
membership
new module
```

Do not modify:

```text
production behavior
LINE behavior
payment behavior
prompt/schema semantics
DB schema
legal semantics
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
git commit -m "chore: add build marker"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
build marker route/fields
secret safety result
runbook updates
tests added
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
