# Evidence Anchoring Schema v3 Implementation v0 Review Bundle

## 1. Summary

Implemented paid-only evidence anchoring for Module 01 full analysis. Provider-generated paid results now use paid schema v3 and must include a structured `evidenceSummary` section with 3-4 safe evidence-summary cards.

The user-facing section renders only on unlocked paid-result pages. Free result, share card, and LINE reply surfaces do not expose evidence summaries.

## 2. Schema Contract

- Added `paid_result_schema_v3.json` for deferred paid-result provider output.
- Required `evidenceSummary.title`.
- Required `evidenceSummary.items` with 3-4 entries.
- Required each item to include `label`, `summary`, and `reason`.
- Length limits are enforced in schema and runtime semantic validation.

Note: the planning docs refer to `paid_result.evidence_summary`; the app’s existing paid-result JSON contract uses camelCase, so the implemented field is `paid_result.evidenceSummary`.

## 3. Prompt Updates

- Bumped paid prompt version to `paid_result_prompt_v0.2`.
- Prompt now asks for evidence summaries from the user-provided situation.
- Prompt forbids raw message logs, long quotes, names, phone numbers, addresses, social handles, LINE IDs, links, and final judgments inside the evidence section.
- Prompt keeps output in natural Traditional Chinese and tied to the existing paid-result structure.

## 4. Runtime Validation

- Provider paid-result validation now loads schema v3.
- Diagnostics include `evidenceSummary.items` count.
- Semantic validation rejects unsafe identifier-like evidence text, long quote-like text, invalid item counts, missing fields, and excessive lengths.
- Fallback paid results may omit evidence summaries.
- Legacy completed paid-result rows without evidence summaries remain displayable.

## 5. UI Rendering

- Added an unlocked paid-result evidence section after the paid summary/signal card and before possible states.
- The section renders only when `evidenceSummary` exists and has items.
- Legacy/fallback results without evidence do not render an empty placeholder.

## 6. Privacy Boundaries

- Evidence cards summarize clues; they are not raw quotes.
- No evidence summaries are added to free result, share card, LINE reply, webhook, LIFF, payment, email, or ads flows.
- No raw input, provider output, paid result JSON, tokens, LINE IDs, or secrets were recorded in this review bundle.

## 7. Compatibility

- Current schema/version lookup prefers v3 paid rows for generation and status checks.
- Completed legacy paid rows are still treated as completed for unlocked links and status polling.
- Existing fallback result generation remains usable and does not require evidence.

## 8. Tests Added / Updated

- Provider schema v3 requires `evidenceSummary`.
- Provider output wrapped under `paid_result` validates with evidence.
- Unsafe evidence identifiers are rejected without surfacing source content in diagnostics.
- Long quote-like evidence text is rejected.
- Unlocked paid-result evidence section renders only when evidence exists.
- Free result and LINE reply surfaces do not include evidence summaries.
- Legacy completed paid rows remain completed after schema version rollover.

## 9. Staging Review Notes

Local structural validation and targeted tests passed before full validation. Live staging provider generation review was not run in this implementation turn because the code has not yet been deployed to staging from this commit.

## 10. Known Limitations

- Evidence quality still depends on provider adherence to the new prompt.
- The runtime detector only catches obvious identifier-like patterns; it is not a full PII classifier.
- Fallback results intentionally omit evidence summaries.

## 11. Recommended Next Step

Deploy to staging from this commit and run one synthetic paid-generation review to confirm provider output includes useful, safe evidence cards without fallback.
