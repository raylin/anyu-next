# Handoff: ANYU Codebase Stabilization + Tech Debt Audit v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused codebase stabilization and technical debt audit after the rapid Module 01 buildout.

This task should review the current app architecture, identify accumulated tech debt, and perform only low-risk cleanup that improves maintainability without changing production behavior.

This is a quality/stabilization task.

Do not change product behavior.

Do not change production behavior.

Do not change LINE fulfillment semantics.

Do not change payment behavior.

Do not change prompt/schema semantics.

Do not start new feature work.

## Background

Over the last several workdays, Module 01 evolved rapidly from initial idea to low-key production:

```text
- free-only analyze
- deferred paid generation
- paid-result schema/versioning
- LINE fulfillment
- LIFF bridge
- short-code delivery
- production activation
- Theme A/B + Riso Theme B
- theme carryover
- input threshold and pending paid UX
- evidenceSummary schema v3
- metrics CLI
- operator test mode
- provider-review legal/payment copy
```

The build has passed validations repeatedly, but rapid iteration likely introduced:

```text
- duplicated helpers
- inconsistent naming
- temporary diagnostics
- scattered version constants
- stale docs or stale handoffs
- untracked design/reference files
- repeated .git lock warnings
- missing runtime build marker
- event/metrics mapping gaps
- schema/prompt version sprawl
- compatibility adapters that need documentation
```

The user wants a quality pass while waiting for NewebPay review, without drawing attention or opening ads.

## Scope

Do:

1. Inspect codebase quality and structure.
2. Identify technical debt across app, AI, LINE, modules, events, metrics, styles, docs.
3. Classify debt into P0/P1/P2 and “defer”.
4. Perform low-risk cleanup if clearly safe.
5. Avoid behavior changes.
6. Improve docs where helpful.
7. Record explicit “do not touch yet” areas.
8. Create review bundle, execution report, summary log.
9. Commit and push to `origin/staging`.

Do not:

- introduce new features
- refactor large architecture
- change UX intentionally
- change paid result prompt/schema semantics
- change cache behavior
- change LINE webhook/LIFF behavior
- change payment/provider behavior
- change production env
- deploy production
- delete compatibility code unless proven unused and safe
- remove docs/design unless owner approves
- rename analytics/event fields without migration plan

## Areas To Inspect

### 1. Module 01 code

Inspect:

```text
apps/web/src/components/modules/ai-temperature/
apps/web/src/lib/modules/
apps/web/src/content/modules/
apps/web/src/app/m/[moduleSlug]/
```

Look for:

```text
- duplicated theme logic
- duplicated module slug logic
- fragile prop drilling
- overgrown components
- copy/constants scattered across files
- legacy compatibility paths not documented
- hidden situation fallback debt
- module numbering hard-coded
```

### 2. AI / prompt / schema / paid generation

Inspect:

```text
apps/web/src/lib/ai/
apps/web/src/lib/ai/assets/
apps/web/src/lib/modules/paid-generation-service.ts
```

Look for:

```text
- schema v1/v2/v3 resolver clarity
- prompt version naming consistency
- paid_result_schema_v3 vs product_result_schema_vX naming consistency
- fallback paid result compatibility
- semantic validation scope
- provider/fallback metadata shape
- output budget comments
- evidenceSummary validation heuristics documented
```

Do not change prompt/schema semantics unless only fixing comments/docs.

### 3. LINE / LIFF / fulfillment

Inspect:

```text
apps/web/src/lib/line/
apps/web/src/app/api/line/
apps/web/src/app/line/fulfill/
apps/web/src/app/m/[moduleSlug]/line/fulfill/
```

Look for:

```text
- duplicate search-param serialization helpers
- old LIFF diagnostic UI still present
- global bridge vs compatibility route documentation
- theme carryover helpers
- token suffix .c/.r documentation
- LINE env matrix docs consistency
```

Do not change security behavior.

Do not bypass signature/ID-token validation.

### 4. Events / metrics / operator mode

Inspect:

```text
apps/web/src/lib/events/
apps/web/scripts/module-01-funnel-report.mjs
apps/web/src/lib/runtime/abuse-guard.ts
docs/operations/module-01-metrics-report.md
docs/operations/production-deployment-runbook.md
```

Look for:

```text
- operatorTest propagation gaps
- unlocked_result_view event limitations
- event-count vs sessionized caveats
- event metadata guard correctness
- metrics CLI docs
- non-sessionized conversion warnings
```

Do not add sessionized reporting now unless trivial; likely document as deferred.

### 5. Styles / themes

Inspect:

```text
apps/web/src/styles/globals.css
apps/web/src/components/modules/ai-temperature/ModuleThemeFrame.tsx
apps/web/src/lib/modules/module-theme.ts
```

Look for:

```text
- scoped .anyu-v2 styles leaking
- repeated color literals
- duplicated theme wrapper rules
- Theme A/B switch visibility logic
- Google font loading notes
- provider-review copy panel styling coupling
```

Do not redesign.

### 6. Legal/payment provider copy

Inspect:

```text
apps/web/src/content/legal.ts
apps/web/src/app/privacy/page.tsx
apps/web/src/app/terms/page.tsx
apps/web/src/app/disclaimer/page.tsx
apps/web/src/app/legal/page.tsx
apps/web/src/components/anyu/PaidPreviewCard.tsx
```

Look for:

```text
- payment-disabled consistency
- no checkout accidentally present
- no owner private info
- no company/studio claim
- provider-review copy duplicated too much
- tests for critical claims
```

Do not change legal meaning unless fixing stale wording.

### 7. Docs / AI collaboration artifacts

Inspect:

```text
ai-collaboration/handoffs/
ai-collaboration/reports/
ai-collaboration/research/
ai-collaboration/summaries/summary_log.md
docs/operations/
docs/design/ if present/untracked
```

Look for:

```text
- stale pending items now resolved
- missing summary log references
- repeated untracked docs/design/ state
- local .git lock warning notes
- production deployment runbook gaps
- NewebPay application status notes
```

Do not delete historical reports.

## Cleanup Rules

Allowed low-risk cleanup:

```text
- extract small duplicated helper if covered by tests
- remove stale comments
- update docs to reflect current production state
- add missing tests around existing behavior
- consolidate constants without behavior change
- improve type names if local and safe
- add TODO/debt registry entry
- update runbook/checklist wording
```

Not allowed without separate approval:

```text
- large component rewrite
- changing public copy meaning
- changing event names
- changing DB schema
- changing prompt/schema behavior
- removing compatibility adapters
- changing LIFF URL generation
- changing token suffix strategy
- changing rate limit behavior
- changing metrics definitions
- deleting untracked design source
```

## Required Debt Classification

Use this format:

```markdown
## Tech Debt Register

### P0 — Must fix before more production traffic
- item
- risk
- recommended fix
- owner/action

### P1 — Should fix before ads/payment expansion
- item
- risk
- recommended fix
- owner/action

### P2 — Quality / maintainability
- item
- risk
- recommended fix
- owner/action

### Deferred / Do not touch yet
- item
- why deferred
- revisit trigger
```

Expected likely P1/P2 examples:

```text
- No safe runtime build/commit marker.
- Next after is not durable queue.
- Metrics are not sessionized.
- Local Playwright/MachPort issue.
- docs/design/ remains untracked.
- Duplicate LIFF search-param serialization helper.
- .c/.r token suffix is pragmatic but not long-term source of truth.
- Provider-review copy lives inside conversion card rather than reusable product-info component.
- Schema/prompt version naming may be confusing.
```

Codex should verify before listing.

## Behavior Preservation

After cleanup, these must remain true:

```text
- landing loads
- free analyze works
- paid generation works
- LINE/LIFF flows are unchanged
- short-code flow unchanged
- Theme A/B unchanged
- operator test mode unchanged
- module01:metrics still works
- payment remains disabled
- no checkout appears
- legal public pages still pass copy safety
```

## Tests

Add or update tests only if useful and low-risk.

Potential tests:

```text
- helper extraction tests
- version resolver tests
- event metadata tests
- legal/payment-disabled copy tests
- theme wrapper tests
- metrics warning tests
```

Do not add brittle tests just to increase count.

## Staging / Production

Default:

```text
staging branch only
```

Do not deploy production.

If cleanup changes runtime behavior accidentally, stop and report.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-anyu-codebase-stabilization-tech-debt-audit-v0-review-bundle.md
```

Required sections:

```markdown
# ANYU Codebase Stabilization + Tech Debt Audit v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Areas Inspected

## 3. Low-risk Cleanup Completed

## 4. Behavior Preservation Notes

## 5. Tech Debt Register

## 6. P0 Items

## 7. P1 Items

## 8. P2 Items

## 9. Deferred / Do Not Touch Yet

## 10. Tests Added / Updated

## 11. Validation Results

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-anyu-codebase-stabilization-tech-debt-audit-v0-execution-report.md
```

Report structure:

```markdown
# ANYU Codebase Stabilization + Tech Debt Audit v0 Execution Report

## Summary

## Files Created

## Files Updated

## Cleanup Completed

## Areas Inspected

## Behavior Preservation

## Tests Added / Updated

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
quality/stabilization summary
P0/P1/P2 debt summary
validation result
commit hash
staging push status
```

## Validation

Run full baseline validation:

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

## Constraints

Do not implement:

```text
new module
membership system
payment integration
checkout
ads
email delivery
admin dashboard
durable queue
follow-up sessions
new public API
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
git commit -m "chore: audit codebase quality"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
areas inspected
cleanup completed
P0/P1/P2 debt summary
behavior preservation status
tests added
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
recommended next step
```

Then stop.
