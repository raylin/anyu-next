# Module 01 Conversion Trust Copy Polish v0 Review Bundle

## 1. Summary

This pass tightened Module 01 conversion and trust copy without changing product logic, routing, data contracts, prompts schemas, cache, DB, LINE fulfillment behavior, payment, email, ads, or production behavior.

The main change is positioning the free result as a useful but incomplete read, while making the paid result responsible enough to include unequal-investment / lower-priority possibilities when supported. Privacy copy now uses concrete data-use and retention language instead of vague de-identification claims.

## 2. Handoff Source

- Source handoff: `/Users/raylin/Downloads/module-01-conversion-trust-copy-polish-v0-handoff.md`
- Saved handoff: `ai-collaboration/handoffs/2026-05-27-module-01-conversion-trust-copy-polish-v0-handoff.md`

## 3. Free Result Boundary

- Added free prompt guidance that the free result should feel seen and useful, but not complete.
- Clarified that `insight_layer` should be an open diagnostic lens rather than the deepest causal conclusion.
- Updated demo free teaser and insight copy to preserve curiosity and point toward paid-state separation.

## 4. Privacy / Trust Copy

- Replaced vague `盡量先做去識別化` UX copy with concrete statements about:
  - no need to leave name or contact details for analysis
  - avoiding personally identifying details in pasted text
  - content being used for this result
  - no public display or third-party marketing use
  - retention-rule cleanup instead of an overpromised deletion guarantee
- Updated privacy-policy draft sections for handling pasted text, events, and retention timing.

## 5. Paid Result Value Framing

- Added prompt guidance requiring balanced possible states, including lower interest / lower priority / unequal investment when consistent with the input.
- Updated provider fallback and demo paid result to include `投入程度不對等`.
- Kept uncertainty and non-diagnostic language intact.

## 6. Paid Preview / 48-hour Teaser

- Replaced the third locked preview card body with a more specific observation tease:
  - `48 小時內，看他是自然靠近，還是只有在你提醒時才回應。`

## 7. Share / Persona Label

- Softened visible share persona label from `my persona` to `你現在的卡點`.
- No raw input, private text, or user identifiers are shown in share copy.

## 8. Tests Added / Updated

- Updated result rendering tests for the softened share label and stronger 48-hour teaser.
- Updated E2E expectations for privacy and preview copy.
- Added legal-content tests guarding against vague de-identification wording and deletion/anonymity overpromises.
- Added prompt/fallback tests for free-result boundary and unequal-investment paid-state guidance.

## 9. Privacy Review

- No secrets, raw source text, tokenized URLs, LINE user IDs, provider outputs, or `paid_result_json` were added.
- The changes are text/prompt/render/test/docs only.

## 10. Known Limitations

- This pass does not visually QA the new copy on staging.
- Generated provider output will follow the new prompt guidance only after future provider calls.

## 11. Recommended Next Step

Run a staging visual copy QA pass for Module 01 landing, result, share, and paid preview surfaces after the staging deployment is available.
