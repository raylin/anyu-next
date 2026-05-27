# Handoff: Module 01 Unlocked Result View Metrics Fix v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Fix the current Module 01 funnel metrics blind spot by adding a safe `unlocked_result_view` event when completed paid content is actually rendered, and improve the metrics report warning when event-count funnels are smoke-heavy or non-sessionized.

This is a metrics/observability task.

Do not change product flow.

Do not change analyze behavior.

Do not change paid generation behavior.

Do not change LINE fulfillment behavior.

Do not change prompt/schema/cache/DB unless a tiny event type update is necessary.

Do not start ads.

Do not build an admin UI.

## Background

Module 01 Funnel Metrics Report v0 exists.

Recent production report showed:

```text
landing_view: 3
analyze_clicked: 1
analyze_completed: 5
result_view: 4
unlock_clicked: 9
line_fulfillment_started: 13
liff_bind_success: 4
short_code_success: 1
paid_generation_requested: 4
paid_generation_completed: 4
unlocked_result_view: 0
```

Interpretation:

```text
- Production health looks OK.
- Paid generation completed 4/4 via provider.
- Fallback appears 0.
- LINE events exist.
- Conversion readout is not reliable because traffic is smoke-heavy/API-heavy and non-sessionized.
- unlocked_result_view is missing, so the final funnel step cannot be measured.
```

Current issue:

```text
The metrics report includes an unlocked_result_view funnel row, but the app does not yet reliably emit this event when completed paid content is rendered.
```

The report can also show nonsensical >100% conversion rates when smoke/API route checks trigger downstream events without upstream landing events.

## Scope

Do:

1. Add safe `unlocked_result_view` event emission when completed paid content is rendered.
2. Ensure event fires only for completed paid content, not pending/missing/failed states.
3. Include safe metadata only.
4. Ensure operatorTest metadata is preserved if present.
5. Update event type/metadata guard if needed.
6. Update Module 01 funnel metrics report to warn clearly when event-count data is smoke-heavy / non-sessionized.
7. Update tests.
8. Create review bundle, execution report, summary log.
9. Commit and push to `origin/staging`.

Do not:

- expose paid_result_json
- expose unlock token
- expose tokenized URL
- expose LINE user ID
- expose raw input
- expose provider output
- change UI behavior
- change paid generation
- change LINE behavior
- change production deployment
- build dashboard/admin UI

## Event Definition

Add event:

```text
unlocked_result_view
```

Emit when:

```text
A user route renders completed paid content on /m/[moduleSlug]/unlock/[unlockToken]
```

Do not emit when:

```text
- paid result is missing
- paid result is processing
- paid result is claimed_missing/pending
- paid result failed
- paid result expired
- user is only on free result page
```

If legacy embedded paid result is rendered, it may count as unlocked_result_view if the user sees completed paid content.

## Allowed Metadata

Allowed metadata:

```text
moduleSlug
themeVariant: classic | riso | unknown
themeSource: ab_assigned | manual_override | query_hint | unlock_intent | local_storage | default | unknown
themeCarryoverSource if already available
paidResultSource: provider | fallback | legacy | unknown
operatorTest: boolean
```

Optional safe metadata:

```text
resultAgeBucket
paidStatus: completed
```

Forbidden metadata:

```text
raw input
redacted input text
full result JSON
paid_result_json
provider output
LINE user ID
LINE display name
ID token
LINE message text
fulfillment code
short code
unlock token
tokenized URL
email
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
```

## Implementation Notes

Likely files:

```text
apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx
apps/web/src/components/modules/ai-temperature/*
apps/web/src/lib/events/*
apps/web/src/tests/*
apps/web/scripts/module-01-funnel-report.mjs
```

Implementation options:

### Option A — server-side event on completed unlocked route render

Pros:

```text
fires even if client JS disabled
can safely know paid status
```

Cons:

```text
may double-count if server render happens multiple times
```

### Option B — client-side event component once paid content mounts

Pros:

```text
closer to actual view
can use once-per-page-load guard
```

Cons:

```text
requires client event path
```

Codex should choose the safer repo-consistent approach.

Preferred:

```text
client-side once-per-render event if current app event model supports it,
otherwise server-side event with idempotency considerations documented.
```

Avoid duplicate event floods.

If exact idempotency is difficult, document that event-count metrics are not sessionized and use this as page-view count, not unique-user count.

## Metrics Report Warning Improvements

Update `module01:metrics` report to detect smoke-heavy / non-sessionized patterns.

Add warning when:

```text
any downstream step count > previous step count
or any downstream step count > landing_view
```

Suggested warning copy:

```text
This report is event-count based and appears smoke/API-heavy or non-sessionized.
Do not interpret step conversion rates as user funnel conversion.
Use this report for health monitoring until sessionized user traffic is available.
```

Also add a section:

```text
Data Quality Notes
```

Include:

```text
- operatorTest excluded/included
- event-count based, not unique session funnel
- downstream events can exceed upstream events during route/API smoke
- conversion rates are health hints only when counts are low
```

If `landing_view < 30`, add:

```text
Traffic is too low for conversion conclusions.
```

## Tests

Add/update tests for:

```text
unlocked_result_view emitted for completed paid content
unlocked_result_view not emitted for pending/processing state
unlocked_result_view not emitted for failed/expired state
event metadata excludes tokens/raw content/paid_result_json
paidResultSource maps provider/fallback/legacy/unknown safely
operatorTest metadata preserved if present
metrics report includes unlocked_result_view counts
metrics report warns when downstream count exceeds upstream count
metrics report warns when landing_view is low
metrics report handles zero counts without divide-by-zero
```

Use synthetic fixtures only.

Do not use real production data in tests.

## Staging / Production Notes

This task should not deploy production by default.

After staging passes, production can be refreshed later as part of monitoring/ops.

If Codex runs report against production for verification, only aggregate counts may be recorded.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-module-01-unlocked-result-view-metrics-fix-v0-review-bundle.md
```

Required sections:

```markdown
# Module 01 Unlocked Result View Metrics Fix v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Event Definition

## 3. Emission Point

## 4. Metadata / Privacy Guardrails

## 5. Metrics Report Warning Changes

## 6. Tests Added

## 7. Known Limitations

## 8. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-module-01-unlocked-result-view-metrics-fix-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Unlocked Result View Metrics Fix v0 Execution Report

## Summary

## Files Created

## Files Updated

## Event Emission

## Metadata Safety

## Metrics Report Changes

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

```text
date
task completed
unlocked_result_view event summary
metrics warning summary
validation result
commit hash
staging push status
```

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

No Playwright required unless UI behavior is changed. If any client component is added, run Playwright if available:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort issue, record honestly.

## Constraints

Do not implement:

```text
admin UI
public metrics endpoint
dashboard charts
payment provider integration
ads launch
real payment
email delivery
rich menu
broadcast
portal/account system
durable queue
model switch
Module 02
```

Do not modify:

```text
product behavior
paid generation behavior
LINE behavior
prompt/schema/cache/DB schema
legal semantics
production behavior
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
raw production exports
real contact values
raw private user content
font files
screenshots/test artifacts
tokens/tokenized URLs/LINE IDs
paid_result_json dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "feat: track unlocked result views"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
unlocked_result_view event behavior
metadata safety
metrics warning behavior
tests added
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
