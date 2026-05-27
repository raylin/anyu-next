# Evidence Anchoring Schema + Prompt Plan v0 Execution Report

## Summary

Created a planning-only schema/prompt/UI plan for adding paid-only evidence anchoring to Module 01 full analysis. No schema, prompt, app code, DB, LINE behavior, payment, ads, legal copy, or production behavior was changed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-evidence-anchoring-schema-prompt-plan-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-evidence-anchoring-schema-prompt-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-evidence-anchoring-schema-prompt-plan-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Planning Decisions

- Evidence anchoring should be paid-only.
- Evidence anchors should be model-generated summaries, not raw quotes.
- Evidence anchors should render only on unlocked paid result surfaces.
- Legacy and fallback results should omit the section if high-quality evidence cannot be generated safely.
- Future implementation should treat this as schema v3 and require human approval before editing schema/prompt contracts.

## Recommended Schema

Recommended future field:

```json
{
  "paid_result": {
    "evidence_summary": {
      "title": "這份分析主要參考了這些線索",
      "items": [
        {
          "label": "回覆節奏",
          "summary": "你描述最近回覆變慢，互動節奏正在變化。",
          "reason": "這會影響對方是忙碌、保留，還是降低優先順序的判斷。"
        }
      ]
    }
  }
}
```

Recommended count: 3-4 items.

## Recommended Prompt Changes

Future paid prompt should instruct the model to summarize user-provided clues without quoting raw text, exposing private identifiers, or inventing details. The prompt should clearly separate evidence summaries from signal interpretation, possible states, and reply strategy.

## UI Recommendation

Render evidence-summary cards after the paid summary/headline and before possible states. Do not show evidence anchors in LINE messages, share cards, free result, landing, or locked paid preview surfaces.

## Privacy / Retention Notes

- Store evidence summaries inside `paid_result_json`.
- Let them follow `analysis_paid_results` retention cleanup.
- Do not add raw quote storage.
- Do not include evidence text in reports, analytics, LINE messages, or share cards.
- Relationship-session reuse of evidence summaries requires a separate retention decision.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 31 files / 197 tests.
- `cd apps/web && corepack pnpm build`: passed.
- Playwright was not run because this was docs/planning-only and no app code changed.

## Known Technical Debt

- Schema v3 is not implemented.
- Prompt changes are not implemented.
- UI rendering is not implemented.
- Relationship-session retention and entitlement models remain unapproved.

## Tech Debt Review

### New Technical Debt Introduced

- None. This task was planning-only.

### Existing Technical Debt Observed

- Paid result schema evolution needs careful compatibility handling.
- Provider output validation must avoid making paid generation brittle.
- Current analytics must not capture generated evidence text.

### Opportunistic Cleanup Completed

- None; no code or runtime files were changed.

### Deferred Cleanup Candidates

- Add schema v3 fixtures.
- Add evidence-summary semantic validation.
- Add legacy/fallback rendering tests.
- Add paid-generation latency/fallback monitoring after implementation.

### Recommended Follow-up

Request human approval for the schema field shape and privacy boundary, then run Evidence Anchoring Schema v3 Implementation v0.

## Deviations From Handoff

- None. The task was kept planning-only.

## Git Commit

- Pending at report creation.

## Staging Push

- Pending at report creation.

## Remaining Uncertainties

- Whether schema v3 should make `evidence_summary` required or optional needs approval; recommendation is optional for compatibility.
- Whether fallback results should ever generate conservative evidence summaries needs implementation-time review.
- Whether privacy copy needs a future update before launch should be reviewed before production exposure.

## Recommended Next Step

Approve the `paid_result.evidence_summary` schema shape and privacy boundary before implementation.
