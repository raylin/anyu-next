# Handoff: Evidence Anchoring Schema v3 Implementation v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Implement paid-only evidence anchoring for Module 01 full analysis.

This task should add `paid_result.evidence_summary` to a new paid result schema version, update the paid prompt to generate safe evidence-summary cards, validate the new field, and render evidence cards on the unlocked paid result page.

Evidence anchoring must use model-generated summaries of user-provided clues, not raw quotes.

This is a paid-result schema/prompt/UI implementation task.

Do not change free analyze behavior.

Do not change LINE fulfillment behavior.

Do not change payment/email/ads.

Do not implement follow-up sessions.

Do not implement raw quote snippets.

Do not deploy production by default.

## Background

Evidence Anchoring Schema + Prompt Plan v0 completed.

Decision:

```text
Add paid-only paid_result.evidence_summary in future schema v3.
Use structured cards with title and 3–4 { label, summary, reason } items.
Use model-generated summaries, not raw quotes.
Render only on unlocked paid result after paid summary and before possible states.
Store inside paid_result_json and follow existing analysis_paid_results retention cleanup.
Legacy/fallback should omit evidence if unavailable or unsafe.
```

Planning commit:

```text
09df8ee
```

Product problem:

```text
When the full analysis is long, users may forget how each recommendation relates to the original situation they described.
Evidence anchoring should increase trust and perceived personalization without replaying private text.
```

## Scope

Do:

1. Add paid result schema v3.
2. Add `paid_result.evidence_summary`.
3. Update paid prompt to generate evidence summaries safely.
4. Update paid generation runtime / parser / resolver for schema v3.
5. Add validation for evidence_summary.
6. Update unlocked paid result UI to render evidence cards.
7. Ensure legacy paid results without evidence_summary still render.
8. Ensure fallback paid results omit evidence_summary unless safe.
9. Update demo/fixtures/tests.
10. Run staging synthetic paid generation review if feasible.
11. Create review bundle, execution report, summary log.
12. Commit and push to `origin/staging`.

Do not:

- implement raw quote snippets
- show raw user text
- expose evidence in LINE messages
- expose evidence in share cards
- expose evidence in free result
- change free result schema
- change analyze endpoint behavior
- change LINE webhook / LIFF behavior
- change payment/email/ads
- implement relationship sessions
- implement follow-up credits/packs
- add DB migration unless absolutely necessary
- deploy production unless explicitly approved after staging review

## Schema Requirements

Add a new schema version, recommended:

```text
product_result_schema_v3
```

Add:

```json
{
  "paid_result": {
    "evidence_summary": {
      "title": "這份分析主要參考了這些線索",
      "items": [
        {
          "label": "回覆節奏",
          "summary": "你提到最近回訊變慢，代表互動節奏正在變化。",
          "reason": "這會影響對方是忙、保留，還是降低優先級的判斷。"
        }
      ]
    }
  }
}
```

### Field constraints

```text
evidence_summary.title:
  required
  8–24 Chinese chars recommended
  default expected: 這份分析主要參考了這些線索

evidence_summary.items:
  required for schema v3 provider result
  3–4 items

item.label:
  required
  2–8 Chinese chars
  no identifiers

item.summary:
  required
  20–60 Chinese chars
  summarize a clue from the user-provided situation
  not a raw quote

item.reason:
  required
  24–80 Chinese chars
  explain why this clue matters
  not a final judgment
```

If existing JSON schema cannot enforce all length/PII rules cleanly, enforce core structure in schema and semantic validation in runtime.

## Prompt Requirements

Update paid prompt to generate evidence_summary.

Prompt must instruct:

```text
Create evidence_summary from the user's provided situation.
Summarize observed clues rather than quoting raw text.
Do not reproduce private identifiers.
Do not invent details not present in the input.
Generate 3–4 evidence items.
Each item connects a user-provided clue to why it matters for interpretation.
Use natural Traditional Chinese.
```

Negative instructions:

```text
Do not include raw message logs.
Do not quote long sections.
Do not include names, phone numbers, addresses, social handles, LINE IDs, or other identifiers.
Do not make final judgments inside evidence_summary.
Do not send evidence_summary to LINE.
Do not include evidence_summary in share card.
```

Tone:

```text
grounded
gentle
specific
not clinical
not legalistic
not too long
```

## Validation / Semantic Safety

Add runtime validation for evidence_summary.

Required:

```text
- evidence_summary exists for provider-generated schema v3 paid result.
- title exists.
- items count is 3–4.
- each item has label, summary, reason.
- summary/reason are within configured maximum length.
- no obvious phone-like long digit sequences.
- no email-like pattern.
- no token-like URL pattern.
- avoid long quotation blocks.
- no raw identifiers if simple detector already exists.
```

Suggested max lengths:

```text
label <= 12 chars
summary <= 80 chars
reason <= 100 chars
```

Long quote heuristic:

```text
reject or warn if summary/reason contains quotation marks around long text > 24 chars
```

Keep validation conservative enough to avoid false failures.

If validation fails:

```text
follow existing output validation retry path
fallback may omit evidence_summary
do not expose raw output
```

## UI Placement

Render evidence_summary only on unlocked paid result page.

Placement:

```text
after paid summary / headline summary card
before possible states
```

Section title:

```text
這份分析主要參考了這些線索
```

UI style:

```text
3–4 compact evidence cards
label as small chip/label
summary as primary line
reason as quieter explanation
Theme A and Theme B both supported
No raw quote styling
No transcript feel
```

Do not show evidence_summary in:

```text
LINE reply
share card
free result
landing
paid teaser locked cards
loading/pending page
```

## Legacy / Fallback Behavior

Existing paid results without evidence_summary:

```text
do not render evidence section
do not show empty placeholder
do not break unlocked route
```

Fallback paid results:

```text
Prefer omit evidence_summary unless fallback can produce safe, high-quality evidence summaries.
If fallback includes evidence_summary, it must pass the same safety constraints.
```

Recommended v0:

```text
provider v3 requires evidence_summary
fallback may omit evidence_summary
legacy adapts without evidence_summary
```

## Cache / Versioning

Update versions so cached paid results do not mix old/new schema incorrectly.

Codex should inspect existing cache key behavior.

Expected:

```text
paid prompt/schema version participates in cache hash
schema v3 or prompt version bump creates separate paid generation cache
```

Do not break legacy cached results.

## Retention / Privacy

Evidence summaries are user-derived content.

Retention recommendation:

```text
Store inside paid_result_json.
Follow existing analysis_paid_results retention cleanup.
No separate retention table/path in v0.
```

Ensure privacy copy remains accurate.

Do not store raw quotes separately.

## Cost / Latency

Expected impact:

```text
small increase in paid output tokens
no impact on free analyze latency
slight paid generation latency increase possible
monitor provider parse/truncation
```

Check paid provider output token budget.

If current budget is tight, adjust carefully and document.

Do not reduce paid result quality elsewhere without review.

## Tests

Add/update tests for:

```text
schema v3 accepts valid evidence_summary
schema v3 rejects missing evidence_summary for provider result if intended
evidence items count must be 3–4
evidence item requires label/summary/reason
semantic validation rejects phone-like/email-like evidence
semantic validation rejects long raw quote-like evidence
fallback paid result may omit evidence_summary safely
legacy paid result without evidence_summary renders
unlocked route renders evidence section for v3 provider result
unlocked route does not render evidence section for legacy result
evidence section not present in free result
evidence section not present in share card
LINE reply does not include evidence_summary
provider retry path handles evidence validation failure
Theme A/B render evidence cards
```

Use synthetic data only.

Do not include private raw conversation in fixtures.

## Staging Review

If feasible, run one staging synthetic paid generation.

Verify:

```text
paid result schema v3
evidence_summary exists
3–4 items
items are summaries, not raw quotes
no identifiers
unlocked route renders evidence cards
possible states still render
reply strategies still render
48-hour plan still renders
paid generation source provider if possible
fallback not used unless provider fails
```

Do not record full paid_result_json in docs.

Record only safe structural facts.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-evidence-anchoring-schema-v3-implementation-v0-review-bundle.md
```

Required sections:

```markdown
# Evidence Anchoring Schema v3 Implementation v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Schema v3 Changes

## 3. Prompt Changes

## 4. Validation / Semantic Safety

## 5. UI Rendering

## 6. Legacy / Fallback Compatibility

## 7. Cache / Versioning

## 8. Privacy / Retention

## 9. Tests Added

## 10. Staging Review

## 11. Known Limitations

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-evidence-anchoring-schema-v3-implementation-v0-execution-report.md
```

Report structure:

```markdown
# Evidence Anchoring Schema v3 Implementation v0 Execution Report

## Summary

## Files Created

## Files Updated

## Schema Changes

## Prompt Changes

## Validation Changes

## UI Changes

## Legacy / Fallback Compatibility

## Cache / Versioning

## Staging Review

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
evidence_summary implementation summary
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
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort issue, record honestly.

## Production Gate

Default:

```text
staging only
```

Do not deploy production unless explicitly approved after staging review.

## Constraints

Do not implement:

```text
raw quote snippets
follow-up sessions
payment packs
credits
LINE commands
DB migrations unless absolutely necessary
payment provider integration
ads launch
real payment
email delivery
admin dashboard
Module 02
```

Do not modify:

```text
free analyze behavior
LINE fulfillment behavior
LIFF bind behavior
webhook behavior
legal semantics beyond docs note if needed
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
real contact values
raw private user content
font files
screenshots/test artifacts
tokens/tokenized URLs/LINE IDs
paid_result_json dumps
raw provider output
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "feat: add paid evidence anchoring"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
schema v3 summary
prompt changes
validation changes
UI rendering
legacy/fallback compatibility
cache/versioning
staging review result
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
