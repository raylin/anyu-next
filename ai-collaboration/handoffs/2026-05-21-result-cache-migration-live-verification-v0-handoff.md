# Handoff: Result Cache Migration + Live Verification v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Apply and verify the new Result Cache + Idempotent Analyze v0 feature in live target environments.

This task should set/confirm the required cache secret, apply the new DB migration where appropriate, and verify that repeated identical analyze requests reuse the existing result without calling the provider or creating duplicate analysis rows.

This is a migration + live verification task.

Do not change the cache implementation design unless a small blocking bug is found.

Do not change UI, model strategy, prompt/schema semantics, LINE flow, legal semantics, auth, payment, portal, or production launch posture.

## Background

Result Cache + Idempotent Analyze v0 completed.

Commit:

```text
16bd1b6
```

What changed:

```text
- Added idempotent analyze-result cache.
- Cache key uses normalized redacted input plus module/prompt/schema/model context.
- Cache key uses HMAC-SHA256.
- Preferred secret: ANALYSIS_CACHE_HASH_SECRET.
- Production disables cache reuse if ANALYSIS_CACHE_HASH_SECRET is missing.
- Cache hits return existing resultId and route.
- Cache hits skip provider work.
- Cache hits should not create duplicate analysis_requests or analysis_results rows.
- Event metadata remains privacy-safe and includes cacheHit.
- New DB migration: apps/web/drizzle/0001_wooden_king_cobra.sql.
```

Known limitation:

```text
This is not a concurrency-locking solution. Two simultaneous identical misses can still race.
```

Current required follow-up:

```text
Apply migration and verify cache live in target environments before relying on it.
```

## Scope

Do:

1. Confirm `ANALYSIS_CACHE_HASH_SECRET` exists in staging/preview env.
2. Confirm `ANALYSIS_CACHE_HASH_SECRET` exists in production env.
3. If missing and safe/approved, set it without printing the value.
4. Apply migration `0001_wooden_king_cobra.sql` to staging DB.
5. Verify staging cache miss → hit behavior.
6. Apply migration to production DB if staging verification passes and production migration is safe.
7. Verify production cache miss → hit behavior with synthetic input.
8. Verify event/privacy metadata remains safe.
9. Update production/staging docs/runbook if needed.
10. Create review bundle, execution report, summary log.
11. Commit and push to `origin/staging`.

Do not:

- print `ANALYSIS_CACHE_HASH_SECRET`
- print `DATABASE_URL`
- dump raw DB rows
- use real user input
- use real contact values
- run broad load tests
- change model strategy
- change prompt/schema output
- change UI
- change LINE behavior
- approve broader launch / ads

## Environment Secret

Required env:

```text
ANALYSIS_CACHE_HASH_SECRET
```

Rules:

```text
- Must be present in production for cache reuse.
- Should also be present in preview/staging for realistic verification.
- Must not be hardcoded in source.
- Must not be printed in logs or reports.
- Should be a strong random value.
```

If Codex can create a strong random value safely:

```bash
openssl rand -hex 32
```

Then set it in Vercel env as a secret.

If Codex cannot safely set it:

- Document exact manual steps.
- Do not proceed to live cache verification in that environment unless secret is confirmed.

## Migration

Migration file:

```text
apps/web/drizzle/0001_wooden_king_cobra.sql
```

### Staging / Preview

Apply migration to staging DB first.

Verify required new columns/metadata exist.

### Production

Only apply production migration after:

```text
staging migration passes
staging cache verification passes
target DATABASE_URL is the manually confirmed production DB
```

Production is already low-key live, so keep migration disciplined.

Do not run destructive SQL.

Do not dump rows.

## Staging Verification

Use staging:

```text
https://staging.anyu.tw/m/ambiguous-temperature
```

Synthetic input:

```text
他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
```

Verification flow:

```text
1. First analyze submit:
   expected cache miss
   provider call happens
   resultId A returned
   cacheHit false in safe metadata if inspectable

2. Second analyze submit with exact same input:
   expected cache hit
   provider call skipped
   same resultId A returned
   no new analysis_request / analysis_result rows for second call
   cacheHit true in safe metadata if inspectable
```

If the exact same synthetic input has already been used and cache exists, choose a new synthetic input with the same relationship-like pattern.

Do not use private content.

## Production Verification

Only after staging passes.

Use production:

```text
https://anyu.tw/m/ambiguous-temperature
```

Use a distinct synthetic input from staging if needed:

```text
他這幾天還是會主動看我的限動，也偶爾回表情符號，但一提到見面就會轉移話題，讓我不知道該不該繼續等。
```

Same miss → hit verification:

```text
first submit: cache miss, resultId A
second same submit: cache hit, same resultId A
provider skipped
no duplicate rows
privacy-safe metadata
```

Keep total provider calls minimal.

## Event / Privacy Verification

Verify no event metadata contains:

```text
raw input
redacted input text
email
LINE ID
full result JSON
provider raw output
DATABASE_URL
ANTHROPIC_API_KEY
ANALYSIS_CACHE_HASH_SECRET
```

Allowed metadata:

```text
cacheHit true/false
cacheKeyVersion
resultId
moduleSlug
modelStrategy
timing aggregates
source
```

Avoid including raw hash in event metadata unless already implemented and safe.

If unsafe data is found:

- Stop.
- Document severity without copying unsafe content.
- Recommend hotfix.

## Expected Behavior

### Cache hit

```text
same resultId returned
same result route returned
provider not called
no duplicate analysis_requests row
no duplicate analysis_results row
event metadata can record cacheHit true
```

### Cache miss

```text
new provider call
new result persisted
event metadata can record cacheHit false
```

### Expired result

Do not test time expiration live unless there is a safe controlled way.

Document as covered by unit tests if already present.

## Documentation Updates

Update if needed:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md
```

Add:

```text
ANALYSIS_CACHE_HASH_SECRET is required for production cache reuse.
Migration 0001_wooden_king_cobra.sql must be applied before cache metadata exists.
Result cache is live after verified miss/hit behavior.
```

Do not rewrite large docs.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-result-cache-migration-live-verification-v0-review-bundle.md
```

Required sections:

```markdown
# Result Cache Migration + Live Verification v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Environment Secret Status

## 3. Migration Status

## 4. Staging Verification

## 5. Production Verification

## 6. Cache Hit / Miss Evidence

## 7. Event / Privacy Verification

## 8. Documentation Updates

## 9. Remaining Limitations

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-result-cache-migration-live-verification-v0-execution-report.md
```

Report structure:

```markdown
# Result Cache Migration + Live Verification v0 Execution Report

## Summary

## Files Created

## Files Updated

## Secret Status

## Migration Status

## Staging Cache Verification

## Production Cache Verification

## Event / Privacy Status

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
- migration status
- staging cache status
- production cache status
- privacy status
- validation result
- commit hash
- staging push status

## Validation

Always run existing validation:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

Run local UI smoke if any visible analyze behavior changed:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If no UI behavior changed, local Playwright is optional but recommended.

## Constraints

Do not implement:

```text
async polling
streaming
ads launch
real payment
LINE API
LIFF
email sending
auth
portal
scheduled deletion job
model switch
major UI redesign
image share / PNG / OG generation
```

Do not modify:

```text
product prompt/schema semantics
provider/model defaults
legal semantics
LINE funnel behavior
production ops behavior beyond docs
general UI
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "ops: verify live result cache"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- secret status
- migration status
- staging cache verification
- production cache verification
- privacy/event status
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
