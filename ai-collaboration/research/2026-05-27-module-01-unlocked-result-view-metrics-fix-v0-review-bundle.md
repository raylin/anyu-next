# Module 01 Unlocked Result View Metrics Fix v0 Review Bundle

## 1. Summary

Added a safe `unlocked_result_view` event for Module 01 completed unlocked paid-result views and improved the funnel metrics report so smoke-heavy, API-heavy, or non-sessionized event-count data is explicitly flagged.

## 2. Event Semantics

- Event name: `unlocked_result_view`
- Emits only when completed paid content renders on `/m/[moduleSlug]/unlock/[unlockToken]`.
- Does not emit for pending, processing, claimed-missing, not-requested, failed, expired, or free-result states.
- Uses a client-side once-per-mount tracker so the event is closer to an actual rendered paid-content view.

## 3. Safe Metadata

Allowed metadata emitted by the tracker:

- `moduleSlug`
- `themeVariant`
- `themeSource`
- `themeCarryoverSource`
- `paidResultSource`
- `paidStatus`
- `resultAgeBucket`
- `operatorTest` when explicitly supplied

No raw input, full result JSON, paid result JSON, provider output, LINE identifiers, fulfillment codes, unlock tokens, tokenized URLs, emails, or secrets are emitted.

## 4. Paid Result Source Mapping

- Stored completed paid result with provider model: `provider`
- Stored completed paid result with fallback model: `fallback`
- Legacy embedded paid result: `legacy`
- Missing or unclassified paid source: `unknown`

## 5. Metrics Report Changes

- `unlocked_result_view` now maps directly into the final funnel step.
- Report includes `Data Quality Notes`.
- Report flags downstream counts that exceed previous funnel steps or landing count.
- Report flags `landing_view < 30` as too low for conversion conclusions.
- Event mapping notes now describe `unlocked_result_view` as an event-count page view, not a unique-user metric.

## 6. Tests Added / Updated

- Event registry includes `unlocked_result_view`.
- Tracker metadata is sanitized and passes the event metadata guard.
- Completed paid-result source mapping covers provider, fallback, legacy, and unknown.
- Result age bucketing avoids exposing raw timestamps.
- Funnel report maps `unlocked_result_view`, counts it, and warns for smoke-heavy/non-sessionized data.

## 7. Privacy Review

The implementation passes only safe aggregate/classification metadata. The unlock token remains server route context only and is not passed to the event tracker. The paid result content is not passed to event metadata.

## 8. Known Limitations

- The event is client-side, so it requires client JavaScript and may not fire if the user leaves before hydration.
- The metric is an event count, not a unique-user/sessionized conversion metric.
- Operator test preservation is supported by tracker input, but the current unlock route has no stored operator-test field to infer automatically.

## 9. Recommended Next Step

Run production metrics again after the next approved production refresh and interpret `unlocked_result_view` as an aggregate event-count health signal, not a user-level conversion rate.
