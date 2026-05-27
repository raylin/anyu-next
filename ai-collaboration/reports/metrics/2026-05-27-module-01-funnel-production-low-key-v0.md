# Module 01 Production Funnel Metrics - Low-key Monitoring v0

Date: 2026-05-27

Window: last 24 hours at monitoring time

Traffic scope: production aggregate events, `operatorTest` excluded by default

## Status

WATCH: traffic is too low and smoke/operator-heavy for conversion conclusions. Use this report for health only.

## Event Volume

- Included events: 61
- Excluded operator events: 0

## Funnel Counts

| Step | Count | Note |
|---|---:|---|
| landing_view | 3 | client page views only |
| analyze_clicked | 1 | client analysis_started only |
| analyze_completed | 5 | server completions, includes route/API smoke |
| result_view | 4 | result page views |
| unlock_clicked | 9 | unlock intent events |
| line_fulfillment_started | 13 | fulfillment panel / LINE starts |
| liff_bind_success | 4 | LIFF bind successes |
| short_code_success | 1 | production short-code success recorded |
| paid_generation_requested | 4 | deferred paid generation started |
| paid_generation_completed | 4 | deferred paid generation completed |
| unlocked_result_view | 0 | event not currently emitted / unavailable |

## Health Metrics

- Paid generation completion rate: 100% aggregate (`4 / 4`)
- Provider success rate: 100% aggregate (`4 provider`, `0 fallback`)
- Fallback rate: 0%
- Recorded fulfillment failures: 0
- LINE webhook received events: 1
- Fulfillment link delivered events: 5

## Theme Split

Theme split is not statistically meaningful in this window.

- `classic:ab_assigned`: 3 landing, 1 analyze click, 1 result view
- `riso:manual_override`: 3 result views, 8 unlock clicks
- `classic:manual_override`: 1 unlock click
- `unknown:unknown`: 5 analyze completions, 4 paid generation completions
- Theme switch clicked: 1

## Provider / Fallback Split

- provider: 4
- fallback: 0
- unknown: 0

## Error Categories

- analyze_failed: none in aggregate query
- paid_generation_failed: none in aggregate query
- fulfillment_failed: none in aggregate query

## LINE Fulfillment Summary

- fulfillment_code_shown: 9
- line_add_clicked: 4
- fulfillment_liff_bound: 4
- fulfillment_code_matched: 1
- fulfillment_link_delivered: 5
- fulfillment_failed: 0

## Interpretation

The production system is active and core flows are writing expected aggregate events. Counts are too small and include smoke/operator activity, so do not infer conversion performance yet.

## Privacy

This report contains only aggregate counts and safe category labels. It does not include raw input, redacted input, result JSON, paid result JSON, provider output, LINE IDs, short codes, unlock tokens, tokenized URLs, emails, database URLs, provider keys, LINE secrets, retention secrets, cache secrets, or operator secrets.
