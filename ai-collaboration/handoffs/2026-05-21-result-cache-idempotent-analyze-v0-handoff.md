# Handoff: Result Cache + Idempotent Analyze v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Implement a safe, privacy-conscious result cache / idempotent analyze path for Module 01 — 曖昧溫度計.

This task should prevent repeat analysis for the same recent input/version combination, especially when a user refreshes, retries, or submits the same text again within the retention/cache window.

Primary goals:

```text
- reduce duplicate provider/API cost
- improve refresh/retry UX
- avoid duplicate analysis rows for the same input/version
- preserve privacy boundaries
- keep current UI/funnel behavior stable
```

This is a technical UX / runtime reliability task.

Do not change model strategy.

Do not change prompt/schema semantics.

Do not change UI layout except tiny copy/status if necessary.

Do not change legal semantics, LINE flow, auth, payment, portal, or production launch posture.

## Background

Module 01 UI polish is sealed for now.

Recent completed safety/quality work:

```text
Production low-key launch: GO
Production smoke: passed
Retention cleanup review: passed
UI polish: sealed
Local Playwright UI smoke: added and passing
```

The user raised two technical UX ideas:

```text
1. Result cache: if page refreshes or same input is re-submitted, avoid recomputing.
2. Async/progressive waiting UX: improve perceived wait later.
```

Recommended order:

```text
1. Result Cache + Idempotent Analyze v0
2. Analyze Request State + Polling UX v0
3. Streaming / Progressive Result UX exploration later
```

This task implements #1 only.

## Scope

Do:

1. Design and implement a versioned input cache key.
2. Use normalized/redacted input, not raw input, as hash source.
3. Prefer HMAC-SHA256 with a server-side secret if available.
4. Include module/prompt/schema/model strategy version inputs in cache key.
5. Check for a recent valid cached result before provider call.
6. On cache hit, return existing result route/resultId without calling provider.
7. On cache miss, continue existing analyze path.
8. Record safe cache metadata in events/logs.
9. Preserve retention/privacy boundaries.
10. Add tests for cache hit/miss/version behavior.
11. Run local UI smoke if analyze-facing UI behavior changes.
12. Create review bundle, execution report, summary log.
13. Commit and push to `origin/staging`.

Do not:

- cache raw input directly
- store raw input in event metadata
- expose input hash to client unless absolutely necessary
- change model defaults
- change prompt/schema output
- implement async/polling
- implement streaming
- change result page layout
- change contact/LINE/payment behavior
- start ads
- implement scheduled deletion

## Design Requirements

### Cache key inputs

Cache key should be based on:

```text
moduleSlug
normalized/redacted input
prompt version
schema version
model strategy
runtime/provider version if relevant
```

Recommended conceptual formula:

```text
HMAC_SHA256(
  ANALYSIS_CACHE_HASH_SECRET,
  moduleSlug + normalizedRedactedInput + promptVersion + schemaVersion + modelStrategy
)
```

If a dedicated secret is not currently present, use the best available server-side secret strategy.

Preferred new env var:

```text
ANALYSIS_CACHE_HASH_SECRET
```

If adding a new required env var creates production friction, use a safe fallback only for non-production and document it.

Production should not use a hardcoded public salt.

### Version fields

If explicit prompt/schema version fields exist, use them.

If not, derive stable versions from current asset/version constants, for example:

```text
product_result_prompt_v0
product_result_schema_v0
modelStrategy
```

Do not overbuild versioning, but ensure future prompt/schema/model changes can invalidate cache.

### Cache TTL

Recommended v0:

```text
cache TTL = 24 hours
```

or match the current retention window.

If retention timestamps already exist:

```text
Only reuse cached result if retention_expires_at is in the future.
```

Do not return expired results.

### Cache hit behavior

On cache hit:

```text
return same response shape as successful analyze
include result route/resultId
do not call provider
do not create duplicate analysis_result
record safe cache_hit event/metadata if existing event model supports it
```

If the existing analyze API response can include optional metadata safely:

```json
{
  "cacheHit": true
}
```

Only expose this if it is useful and tested. Otherwise keep it server-side.

### Cache miss behavior

On cache miss:

```text
run current provider path
validate schema
persist result
store cache key/hash with request/result association
record cache_miss metadata safely
```

### Concurrency

If two identical requests arrive simultaneously, v0 may still double-run unless locking is simple.

Do not overbuild distributed locks in v0.

Document concurrency limitation if not solved.

Optional if easy:

```text
unique index on cache key + active version + non-expired result
```

But do not add risky schema changes without migration discipline.

## Schema / Data Model

Review existing schema.

Possible approach:

### Option A: Add cache columns to existing analysis tables

Add to `analysis_requests` or `analysis_results`:

```text
input_hash
cache_key_version
prompt_version
schema_version
model_strategy
cache_expires_at
```

### Option B: Add separate cache table

```text
analysis_result_cache
- id
- module_slug
- input_hash
- prompt_version
- schema_version
- model_strategy
- result_id
- expires_at
- created_at
```

Preferred:

```text
Use the simplest maintainable approach that keeps privacy clear.
```

Given the project already has migration discipline, adding a small cache table is acceptable if cleaner.

### Migration

If schema changes are needed:

- Add migration.
- Validate locally.
- Do not automatically run production migration unless current workflow allows it.
- For staging, migration can be applied if existing staging workflow requires it.
- Update production runbook / launch notes if production migration will be needed later.

Because production is already live, document whether this change requires production migration before deployment.

## Privacy Rules

Must not store in events:

```text
raw input
redacted input content
email
LINE ID
full result JSON
provider raw output
DATABASE_URL
ANTHROPIC_API_KEY
```

Cache hash is allowed in DB if HMAC/keyed and not exposed publicly.

Event metadata may include:

```text
cacheHit: true/false
cacheKeyVersion
cacheAgeMs or cacheAgeBucket
resultId
moduleSlug
modelStrategy
```

Avoid including the raw hash in event metadata unless necessary.

## UX Rules

Do not change UI layout in this task.

If cache hit is user-visible, keep copy subtle:

```text
已找到剛剛的分析，正在帶你回結果。
```

But if current UX simply jumps to result, that is acceptable.

Do not add a new skeleton/progress experience; that belongs to a later async/polling task.

## Files Likely To Update

Likely files:

```text
apps/web/src/app/api/modules/[moduleSlug]/analyze/route.ts
apps/web/src/lib/ai/runtime.ts
apps/web/src/lib/ai/types.ts
apps/web/src/lib/modules/ai-temperature-ui.ts
apps/web/src/lib/runtime/timing.ts
apps/web/src/lib/runtime/abuse-guard.ts
apps/web/src/lib/db/schema.ts
apps/web/src/lib/db/migrations/*
apps/web/src/tests/event-metadata.test.ts
apps/web/src/tests/runtime-model-strategy.test.ts
apps/web/src/tests/abuse-guard.test.ts
apps/web/src/tests/runtime-timing.test.ts
apps/web/README.md
docs/operations/production-deployment-runbook.md
```

Only update files actually required.

## Tests

Add/update tests for:

```text
same normalized input within TTL returns cache hit
cache hit does not call provider
different input returns cache miss
prompt/schema/model version change invalidates cache
expired cache is not reused
cache metadata does not expose raw input
event metadata includes safe cache status only
cache works after input redaction/normalization
```

If DB integration tests are complex, use unit tests around cache key generation and route-level mocks where practical.

## Local Playwright

The new local Playwright layer exists.

If this task changes visible analyze flow, run:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If no visible UI behavior changes, running it is optional but recommended.

Do not update Playwright unless needed.

## Documentation Updates

Update:

```text
apps/web/README.md
docs/operations/production-deployment-runbook.md
```

Document:

```text
result cache purpose
cache TTL
privacy boundary
new env var if added
production migration implication if any
cache invalidation inputs
```

Do not over-document internal implementation details.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-result-cache-idempotent-analyze-v0-review-bundle.md
```

Required sections:

```markdown
# Result Cache + Idempotent Analyze v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Cache Design

## 3. Cache Key Inputs

## 4. Privacy Boundary

## 5. Schema / Migration Changes

## 6. Cache Hit / Miss Behavior

## 7. Event / Metadata Behavior

## 8. Tests Added

## 9. Validation Results

## 10. Known Limitations

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-result-cache-idempotent-analyze-v0-execution-report.md
```

Report structure:

```markdown
# Result Cache + Idempotent Analyze v0 Execution Report

## Summary

## Files Created

## Files Updated

## Cache Design Implemented

## Schema / Migration Changes

## Privacy / Event Metadata

## Tests Added

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
- cache behavior summary
- migration status
- validation result
- commit hash
- staging push status

## Validation

Always run existing validation:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If UI behavior changed or as a final guard, run:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If schema/migration changed, run the appropriate local migration/test command and document it.

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
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
```

## Production Notes

Production is live low-key.

If this task introduces a DB migration:

```text
Do not assume production is updated.
Document that production migration is required before production deploy of this feature.
```

Do not run production migration unless explicitly approved in a separate production migration handoff.

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "feat: add idempotent analysis cache"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- cache design summary
- cache hit/miss behavior
- schema/migration status
- privacy/event metadata status
- validation results
- Playwright result if run
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
