# Handoff: Module 01 Funnel Metrics Report v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Create a safe, repeatable Module 01 funnel metrics report that aggregates existing DB events for low-key production monitoring.

This task should provide an internal reporting tool/report format before building any admin console.

This is a reporting/observability implementation task.

Do not build an admin UI.

Do not change product behavior.

Do not change production funnel logic.

Do not change prompt/schema/cache/DB unless a read-only reporting helper requires a tiny safe type addition.

Do not start ads.

Do not implement payment/email.

## Background

Module 01 is entering low-key production activation.

Relevant current state:

```text
- Free-only analyze is implemented.
- Deferred paid generation is implemented.
- LINE/LIFF and short-code fulfillment are implemented.
- Pending paid UX polls and auto-refreshes.
- Dual Theme A/B exists.
- Operator Test Mode exists.
- Operator events include safe metadata:
  operatorTest: true
  testModeSource: "header"
```

Need:

```text
A simple way to review funnel health from DB events without building an admin console yet.
```

Key principle:

```text
Collect cleanly first, understand clearly second, build visual dashboard later.
```

## Scope

Do:

1. Inspect existing event table/schema and safe metadata shape.
2. Define Module 01 funnel event names and mapping.
3. Implement a read-only funnel metrics report.
4. Support date/time range filtering.
5. Exclude operatorTest traffic by default.
6. Support including operatorTest via explicit flag.
7. Split results by themeVariant/themeSource where available.
8. Split paid generation by provider/fallback source where available.
9. Include error category summaries.
10. Include LINE fulfillment summaries.
11. Output markdown report and console table/JSON if useful.
12. Add tests.
13. Document usage.
14. Create review bundle, execution report, summary log.
15. Commit and push to `origin/staging`.

Do not:

- build admin dashboard
- expose web route publicly
- expose raw event rows
- show raw input
- show paid_result_json
- show tokenized URLs
- show LINE IDs
- show emails
- show provider output
- change event collection semantics unless a bug is found and explicitly documented
- run ads
- deploy production by default

## Required Output

Preferred implementation:

```text
tools/reporting/module-01-funnel-report.ts
```

or repo-consistent path.

If the repo primarily uses scripts under apps/web, use a path like:

```text
apps/web/scripts/module-01-funnel-report.ts
```

Codex should choose the repo-consistent location.

The tool should output:

```text
console summary
markdown report file
optional JSON output
```

Example report path:

```text
ai-collaboration/reports/metrics/2026-05-27-module-01-funnel.md
```

Generated reports should not include raw user content.

## CLI Interface

Recommended CLI options:

```bash
pnpm module01:metrics --from 2026-05-27 --to 2026-05-28
pnpm module01:metrics --last 24h
pnpm module01:metrics --include-operator
pnpm module01:metrics --format markdown
pnpm module01:metrics --format json
```

If adding package scripts is too much, document the direct command.

Minimum required:

```text
--from
--to
--include-operator
```

Default:

```text
last 24 hours
operatorTest excluded
markdown + console output
```

## Core Funnel

Aggregate counts and conversion rates for:

```text
landing_view
analyze_clicked
analyze_completed
result_view
unlock_clicked
line_fulfillment_started
liff_bind_success
short_code_success
paid_generation_requested
paid_generation_completed
unlocked_result_view
```

If exact event names differ, map existing event names into these canonical report rows.

Report should show:

```text
count
conversion from previous step
conversion from landing_view
```

Example:

```text
landing_view: 100
analyze_clicked: 35 | 35.0% from previous | 35.0% from landing
analyze_completed: 30 | 85.7% from previous | 30.0% from landing
```

## Important Derived Metrics

Include:

```text
landing_to_analyze_rate
analyze_completion_rate
result_to_unlock_rate
unlock_to_line_success_rate
paid_generation_completion_rate
unlocked_view_rate
overall_unlocked_per_landing
fallback_rate
provider_success_rate
```

Definitions:

```text
landing_to_analyze_rate = analyze_clicked / landing_view
analyze_completion_rate = analyze_completed / analyze_clicked
result_to_unlock_rate = unlock_clicked / result_view
unlock_to_line_success_rate = (liff_bind_success + short_code_success) / unlock_clicked
paid_generation_completion_rate = paid_generation_completed / paid_generation_requested
unlocked_view_rate = unlocked_result_view / paid_generation_completed
overall_unlocked_per_landing = unlocked_result_view / landing_view
fallback_rate = paid_generation_completed where source=fallback / paid_generation_completed
provider_success_rate = paid_generation_completed where source=provider / paid_generation_completed
```

Avoid division-by-zero errors; show `n/a` if denominator is zero.

## Theme Split

Include split for:

```text
themeVariant: classic | riso | unknown
themeSource: ab_assigned | manual_override | query_hint | unlock_intent | local_storage | default | unknown
```

Most important:

```text
Only compare A/B performance using themeSource = ab_assigned.
```

Report:

```text
classic vs riso:
- landing → analyze
- result → unlock
- unlocked_result_view / landing
```

Separate manual override users:

```text
manual_override counts
theme_switch_clicked count
```

## Operator/Test Traffic

Default:

```text
exclude operatorTest = true
```

Add section:

```text
Excluded operator events: N
```

If `--include-operator`:

```text
include operator events but mark report clearly:
OPERATOR TRAFFIC INCLUDED
```

Never mix operator traffic silently.

## Paid Generation Source / Fallback

Aggregate:

```text
paid_generation_completed by source:
- provider
- fallback
- unknown
```

Also aggregate failure categories if available:

```text
paid_generation_failed by errorCategory
output_validation
provider_error
timeout
unknown
```

Set warning if:

```text
fallback_rate > 10%
paid_generation_completion_rate < 90%
```

## LINE Fulfillment Health

Aggregate:

```text
liff_bind_started
liff_bind_success
liff_bind_failed
short_code_received
short_code_success
short_code_failed
webhook_invalid_signature
paid_pending_started
paid_pending_completed
paid_pending_stuck if event exists
```

If exact events do not exist, use available closest events and document gaps.

Derived:

```text
liff_success_rate
short_code_success_rate
line_fulfillment_success_rate
```

## Error Summary

Include aggregate error counts by safe category:

```text
analyze_failed by errorCategory
paid_generation_failed by errorCategory
line_fulfillment_failed by errorCategory
```

Do not include raw error payloads if they may contain content.

## Threshold Hints

Add interpretation hints, not hard claims.

Suggested warning thresholds:

```text
analyze_completion_rate < 80% → WARN
paid_generation_completion_rate < 90% → WARN
fallback_rate > 10% → WARN
line_fulfillment_success_rate < 70% → WARN
result_to_unlock_rate < 5% → WATCH
landing_to_analyze_rate < 15% → WATCH
```

Report should include:

```text
status: OK / WATCH / WARN
```

## Privacy Requirements

The report must never include:

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
```

Allowed:

```text
event counts
conversion rates
safe event names
safe theme labels
safe source labels provider/fallback
safe error categories
time range
operatorTest counts
```

## Tests

Add tests for:

```text
funnel count aggregation
conversion rate calculation
division-by-zero handling
operatorTest excluded by default
operatorTest included only with explicit flag
theme split by variant/source
manual override separated from A/B comparison
provider/fallback split
error category summary
privacy guard: report does not include forbidden raw fields
markdown output format
date range filter
```

Use synthetic fixture events only.

Do not use real DB data in tests.

## Documentation

Update:

```text
docs/operations/production-deployment-runbook.md
```

or create:

```text
docs/operations/module-01-metrics-report.md
```

Document:

```text
how to run report
default time range
operator traffic exclusion
how to read funnel metrics
what thresholds mean
what not to infer from low traffic
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-module-01-funnel-metrics-report-v0-review-bundle.md
```

Required sections:

```markdown
# Module 01 Funnel Metrics Report v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Data Source / Event Mapping

## 3. Funnel Definitions

## 4. Operator/Test Traffic Handling

## 5. Theme A/B Split

## 6. Provider/Fallback Split

## 7. LINE Fulfillment Metrics

## 8. Error Summary

## 9. Privacy Guardrails

## 10. Tests Added

## 11. Usage

## 12. Known Limitations

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-module-01-funnel-metrics-report-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Funnel Metrics Report v0 Execution Report

## Summary

## Files Created

## Files Updated

## Report Capabilities

## Event Mapping

## Operator/Test Filtering

## Theme / Provider Splits

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
metrics report summary
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

No Playwright required unless UI code changes, which should not happen.

## Production Gate

This task can be merged before/after production activation because it is read-only reporting.

Do not run production data report unless explicitly safe and sanitized.

If running against production DB, record only aggregate counts.

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
event semantics unless documenting mapping only
prompt/schema/cache/DB schema
LINE behavior
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
git commit -m "feat: add module funnel metrics report"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
report capabilities
how to run
operator filtering
theme split
provider/fallback split
privacy guardrails
tests added
validation results
report path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
