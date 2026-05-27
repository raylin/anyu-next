# Handoff: Evidence Anchoring Schema + Prompt Plan v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Create a schema/prompt/UI implementation plan for adding paid-only evidence anchoring to Module 01 full analysis.

Evidence anchoring should help users understand how the full analysis connects back to what they wrote, without exposing or over-retaining raw conversation text.

This is a planning task only.

Do not implement schema changes.

Do not change prompts.

Do not change app code.

Do not change DB.

Do not change production.

Do not change LINE/payment/ads.

## Background

Module 01 Follow-up Interaction + Evidence Anchoring Plan v0 Refresh recommended:

```text
- Continue low-key production monitoring.
- Add paid evidence-summary cards next.
- Prefer model-generated evidence summaries, not raw quotes.
- Keep current NT$49 one-time full analysis during beta.
- Explore 3-use relationship pack / follow-up model later after cleaner monitoring signal.
```

Tester feedback motivating this task:

```text
When the full analysis is long, users may forget how each recommendation relates to their original input.
They want a way to connect the advice back to what they described.
```

Important privacy direction:

```text
Use evidence summaries, not raw quotes, for the first version.
Do not replay full private text.
Do not send raw excerpts through LINE.
Do not include evidence anchors in share cards.
```

## Scope

Do:

1. Define the paid-only evidence anchoring product role.
2. Define recommended schema shape.
3. Define prompt requirements.
4. Define UI placement.
5. Define privacy / retention guardrails.
6. Define validation rules.
7. Define legacy compatibility behavior.
8. Define implementation phases.
9. Define tests for future implementation.
10. Create research plan, execution report, summary log.
11. Commit and push to `origin/staging`.

Do not:

- implement schema v3
- modify prompt files
- modify runtime
- modify UI
- modify DB
- deploy production
- implement raw quotes
- implement follow-up sessions
- implement payment packs
- implement LINE commands
- change legal copy unless documenting future copy needs

## Product Role

Evidence anchoring should answer:

```text
「這份分析是根據我寫的哪些線索整理出來的？」
```

It should not answer:

```text
「你貼的原文逐字回顯如下」
```

Evidence anchors should increase:

```text
trust
perceived personalization
readability of paid result
connection between input and recommendation
```

Evidence anchors should avoid:

```text
privacy anxiety
PII repetition
long raw quote display
making paid result feel like surveillance
```

## Recommended UX Copy

Possible section title:

```text
這份分析主要參考了這些線索
```

Alternative:

```text
我看到的幾個關鍵線索
```

Preferred:

```text
這份分析主要參考了這些線索
```

Example evidence summary cards:

```text
1. 你提到最近回訊變慢，代表互動節奏正在變化。
2. 你也提到他仍會看限動、偶爾傳生活小事，表示訊號不是完全中斷。
3. 你最卡的是「忙」和「冷掉」之間的判斷。
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

## Schema Recommendation

Define whether this should be schema v3.

Expected recommendation:

```text
Add paid_result.evidence_summary in product_result_schema_v3.
```

Possible shape:

```json
{
  "paid_result": {
    "evidence_summary": {
      "title": "這份分析主要參考了這些線索",
      "items": [
        {
          "label": "回覆節奏",
          "summary": "你提到最近回訊變慢，這代表互動節奏正在變化。",
          "reason": "這會影響對方是忙、保留，還是降低優先級的判斷。"
        }
      ]
    }
  }
}
```

But the plan should compare simpler alternatives.

### Option A — list of strings

```json
"evidence_summary": [
  "你提到最近回訊變慢，代表互動節奏正在變化。",
  "你也提到他仍會看限動、偶爾傳生活小事，表示訊號不是完全中斷。"
]
```

Pros:

```text
simple
low rendering cost
easier prompt compliance
```

Cons:

```text
less structured
harder to map to UI labels
```

### Option B — structured cards

```json
"evidence_summary": {
  "title": "...",
  "items": [
    { "label": "...", "summary": "...", "reason": "..." }
  ]
}
```

Pros:

```text
better UI
more scannable
can show label chips
```

Cons:

```text
more schema complexity
higher risk of provider missing fields
```

### Option C — attach evidence to each paid section

```json
"signal_deep_dives": [
  {
    "title": "...",
    "evidence": ["..."]
  }
]
```

Pros:

```text
deeply contextual
```

Cons:

```text
large schema change
harder to read
more repetition
```

Expected plan recommendation:

```text
Start with Option B structured cards, 3–4 items, paid-only, shown near top of unlocked result.
```

## Evidence Item Requirements

Recommended item count:

```text
3–4 items
```

Each item:

```text
label: 2–6 Chinese characters
summary: 20–48 Chinese characters
reason: 24–64 Chinese characters
```

Rules:

```text
- Do not quote full raw text.
- Do not include names, phone numbers, addresses, handles, or unique identifiers.
- Do not include exact timestamps unless user input is generic and safe.
- Do not include explicit private sexual content even if user entered it; summarize safely.
- Avoid making evidence look like a transcript.
- Use “你提到…” or “你描述…” sparingly and gently.
```

## Prompt Requirements

Future paid prompt should instruct:

```text
Create evidence_summary from the user's provided situation.
Summarize observed signals rather than quoting raw text.
Do not reproduce private identifiers.
Do not invent details not present in the input.
Do not include more than 4 evidence items.
Each item should connect a user-provided clue to why it matters for interpretation.
Use natural Traditional Chinese.
```

Important negative instructions:

```text
Do not include raw message logs.
Do not quote long sections.
Do not include names, phone numbers, addresses, social handles, or other identifiers.
Do not use evidence_summary to make a final judgment.
```

## UI Placement

Recommended placement in unlocked paid page:

```text
After paid summary / before possible states
```

Rationale:

```text
Users first see a quick paid summary, then see what clues the analysis is grounded in, then read possible states/reply strategies.
```

Alternative:

```text
Before paid summary
```

Risk:

```text
May feel too mechanical before emotional payoff.
```

Expected recommendation:

```text
Place evidence_summary after the paid result headline/summary card and before possible states.
```

Do not show evidence anchors in:

```text
LINE text messages
share card
free result
landing
paid teaser locked cards
```

Maybe show only a teaser in paid preview later:

```text
完整分析會標出 3–4 個判斷線索
```

But do not implement now.

## Privacy / Retention Implications

Evidence summaries are derived from user input.

Plan must address:

```text
Are evidence summaries considered retained user-derived content?
Should they be scrubbed with paid_result_json?
Do they need special retention handling?
Does current privacy copy cover them?
```

Expected recommendation:

```text
Evidence summaries live inside paid_result_json and follow analysis_paid_results retention cleanup.
No separate retention path needed for v1.
```

But if evidence is stored elsewhere, define retention.

Do not add raw quote storage.

## Validation / Semantic Safety

Future implementation should validate:

```text
3–4 items
labels present
summary/reason present
no obvious long quote
no forbidden keys
no raw identifiers if simple detector exists
no English code-switching unless user provided English
```

Avoid over-strict PII detection if it causes false failures, but at minimum prompt and UI should discourage raw identifiers.

Potential runtime check:

```text
reject item if summary or reason is > 100 chars
reject item if it contains phone-like long digit sequences
reject item if it contains email-like pattern
warn/fallback if item appears to include quotation marks with long text
```

Keep this as recommendation, not implementation.

## Legacy Compatibility

For existing paid results without evidence_summary:

```text
Do not show the evidence section.
Do not show empty placeholder.
Do not break unlocked route.
```

For fallback paid results:

```text
Prefer provider-generated evidence_summary.
If fallback is used, either omit evidence_summary or use conservative generic clue summaries based on allowed normalized input signals.
```

Expected recommendation:

```text
Omit evidence_summary for legacy/fallback if high-quality evidence cannot be generated.
```

## Cost / Latency Impact

Plan should estimate impact:

```text
adds 3–4 short items
small output-token increase
paid generation only, not free analyze
no impact on initial free analyze latency
may slightly increase paid generation latency
```

Recommendation:

```text
Acceptable for paid-only route, but monitor paid output truncation and provider parse failures.
```

If adding schema v3 increases output length, ensure output budget is adequate.

## Future Follow-up Interaction Relationship

Evidence anchoring can later support follow-up:

```text
When user updates the situation, the system can compare new evidence against prior evidence summaries.
```

But do not implement follow-up now.

Plan should mention future use:

```text
evidence_summary may become the bridge between one-time analysis and relationship session memory.
```

## Required Research Report

Create:

```text
ai-collaboration/research/2026-05-27-evidence-anchoring-schema-prompt-plan-v0.md
```

Required sections:

```markdown
# Evidence Anchoring Schema + Prompt Plan v0

Date: 2026-05-27

## 1. Summary

## 2. Product Role

## 3. Why Evidence Summary Instead of Raw Quotes

## 4. Recommended Schema Shape

## 5. Prompt Requirements

## 6. UI Placement

## 7. Privacy / Retention Implications

## 8. Validation / Semantic Safety

## 9. Legacy / Fallback Compatibility

## 10. Cost / Latency Impact

## 11. Future Follow-up Relationship

## 12. Recommended Implementation Plan
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-evidence-anchoring-schema-prompt-plan-v0-execution-report.md
```

Report structure:

```markdown
# Evidence Anchoring Schema + Prompt Plan v0 Execution Report

## Summary

## Files Created

## Files Updated

## Planning Decisions

## Recommended Schema

## Recommended Prompt Changes

## UI Recommendation

## Privacy / Retention Notes

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
evidence anchoring recommendation
validation result
commit hash
staging push status
```

## Validation

Docs/planning only. Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

No Playwright required unless code changes, which should not happen.

## Constraints

Do not implement:

```text
schema v3
prompt changes
UI changes
evidence summary generation
raw quote snippets
follow-up sessions
payment packs
credits
LINE commands
DB migrations
payment provider integration
ads launch
real payment
email delivery
admin dashboard
Module 02
```

Do not modify:

```text
app code
production behavior
prompt/schema/cache/DB
LINE behavior
legal copy
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
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: plan paid evidence anchoring"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
recommended schema
raw quote decision
prompt requirements
UI placement
privacy/retention implications
legacy/fallback behavior
validation results
report path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
