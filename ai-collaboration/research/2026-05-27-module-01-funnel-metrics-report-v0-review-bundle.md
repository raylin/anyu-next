# Module 01 Funnel Metrics Report v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Implemented a read-only Module 01 funnel metrics CLI for aggregate production/staging monitoring without building an admin console.

The tool reads existing DB `events` rows, excludes operator-test traffic by default, and writes a privacy-safe markdown or JSON report.

## 2. Data Source / Event Mapping

Data source:

- `events` table
- Module filter: `module_id = ai-temperature`
- Theme filter: `theme_slug = ambiguous-temperature`
- Time filter: `created_at >= from` and `created_at < to`

Canonical mapping:

- `landing_view`: `page_view` with `pageType=landing`
- `analyze_clicked`: `analysis_started`
- `analyze_completed`: `analysis_completed`
- `result_view`: `page_view` with `pageType=result_runtime`
- `unlock_clicked`: `paid_unlock_clicked`
- `line_fulfillment_started`: `fulfillment_code_shown`, `line_add_clicked`, or `fulfillment_liff_opened`
- `liff_bind_success`: `fulfillment_liff_bound`
- `short_code_success`: successful `fulfillment_code_matched`
- `paid_generation_requested`: `paid_generation_started`
- `paid_generation_completed`: `paid_generation_completed`
- `unlocked_result_view`: future `page_view` with `pageType=unlock_completed` or `pageType=unlocked_result`

## 3. Funnel Definitions

The report outputs count, conversion from previous step, and conversion from landing for each canonical funnel row.

Derived metrics include:

- `landing_to_analyze_rate`
- `analyze_completion_rate`
- `result_to_unlock_rate`
- `unlock_to_line_success_rate`
- `paid_generation_completion_rate`
- `unlocked_view_rate`
- `overall_unlocked_per_landing`
- `fallback_rate`
- `provider_success_rate`

## 4. Operator/Test Traffic Handling

Default behavior excludes events where `metadataJson.operatorTest === true`.

The `--include-operator` flag includes operator events and marks the report with `OPERATOR TRAFFIC INCLUDED`.

## 5. Theme A/B Split

The report splits by safe metadata:

- `themeVariant`
- `themeSource`

Only rows where `themeSource = ab_assigned` should be used for A/B comparison. Manual overrides are counted separately.

## 6. Provider/Fallback Split

Paid generation completion is split by safe `metadataJson.source`:

- `provider`
- `fallback`
- `unknown`

Fallback reasons and paid-generation failure categories are aggregated only as safe category labels.

Category labels are normalized to short machine-style values; unsafe free-text category values are treated as `unknown`.

## 7. LINE Fulfillment Metrics

The report includes aggregate LINE fulfillment counts for:

- LIFF bind started/success/failed where events exist
- short-code received/success/failed
- paid pending started/completed
- LINE failure categories

Known gap: invalid webhook signatures are rejected before DB event persistence, so they are documented as unavailable from the events table.

## 8. Error Summary

The report aggregates:

- `analysis_failed` by safe reason/category
- `paid_generation_failed` by safe error category
- `fulfillment_failed` by safe error code/category

No raw error payloads are included.

Unsafe free-text category values are collapsed to `unknown`.

## 9. Privacy Guardrails

The report outputs only aggregate counts, rates, safe event names, safe theme labels, safe provider/fallback labels, safe error categories, time ranges, and operator event counts.

It does not output raw event rows, raw input, redacted input text, full result JSON, paid result JSON, provider output, LINE IDs, display names, ID tokens, LINE message text, fulfillment codes, unlock tokens, tokenized URLs, emails, database URLs, provider keys, LINE secrets, retention secrets, or cache secrets.

## 10. Tests Added

Added synthetic-fixture tests for:

- event-to-funnel mapping
- funnel counts and conversion rates
- division-by-zero markdown formatting
- operator exclusion and explicit inclusion
- theme split and manual override separation
- provider/fallback split
- safe error category summaries
- privacy guard against fixture raw values
- markdown output
- date range filtering
- CLI range/flag parsing

## 11. Usage

Run from `apps/web`:

```bash
corepack pnpm module01:metrics --last 24h
corepack pnpm module01:metrics --from 2026-05-27 --to 2026-05-28
corepack pnpm module01:metrics --include-operator
corepack pnpm module01:metrics --format json
```

## 12. Known Limitations

- The current app may not emit an unlocked-result page-view event yet.
- Webhook invalid-signature attempts are not persisted as events.
- Low-key production traffic may be too sparse for strong conversion claims.
- The v0 tool is a CLI only, not an admin dashboard.

## 13. Recommended Next Step

Use the CLI for aggregate low-key monitoring after staging/production event data exists. Do not use low-volume results for hard A/B conclusions without enough sample size.
