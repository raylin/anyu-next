# Evidence Anchoring Schema + Prompt Plan v0

Date: 2026-05-27

## 1. Summary

Module 01 should add paid-only evidence anchoring in the next schema/prompt revision, but not as raw quotes. The recommended v0 implementation is a structured `paid_result.evidence_summary` object in a future `product_result_schema_v3`, rendered as 3-4 short cards near the top of the unlocked paid result.

The feature should answer: “這份分析是根據我寫的哪些線索整理出來的？” It should increase trust and perceived personalization without replaying private text or making the page feel like a transcript.

Recommended direction:

- Add `paid_result.evidence_summary` in schema v3.
- Use structured cards: `title` plus 3-4 `{ label, summary, reason }` items.
- Generate summaries from the user situation, not raw quotes.
- Render only on unlocked paid results.
- Do not show evidence anchors in LINE messages, share cards, free results, landing, or locked paid previews.
- Store evidence summaries inside paid result JSON and let them follow existing paid-result retention cleanup.

## 2. Product Role

Evidence anchoring should make the full analysis feel grounded.

User-facing purpose:

- Show the few clues the analysis used.
- Help users connect advice back to their situation.
- Make long paid analysis easier to trust and scan.
- Reduce the feeling that the recommendation is generic.

What it should not do:

- Reprint the user’s private message.
- Act as a transcript.
- Make a final judgment by itself.
- Appear in public/shareable surfaces.
- Create new retention of raw personal text.

Recommended section title:

```text
這份分析主要參考了這些線索
```

Tone:

- grounded
- gentle
- specific
- Traditional Chinese
- not clinical
- not legalistic
- not surveillance-like

## 3. Why Evidence Summary Instead of Raw Quotes

Evidence summaries are safer than raw quotes for the first implementation.

Raw quote risks:

- May repeat names, phone numbers, social handles, addresses, or other identifiers.
- May expose sensitive relationship details on the unlocked page.
- Makes retention and cleanup harder to reason about.
- Can feel invasive if the product repeats private wording too directly.
- Is unsafe for LINE, share cards, analytics, reports, and screenshots.

Evidence-summary benefits:

- Gives users enough grounding without replaying private text.
- Allows redaction and abstraction by default.
- Keeps UI concise.
- Fits future relationship-session memory better than raw text.

Decision:

- Do not implement raw quote snippets in v0.
- Do not include raw excerpts in LINE messages or share cards.
- If raw snippets are ever considered later, require a separate privacy review, redaction design, and explicit schema decision.

## 4. Recommended Schema Shape

Recommended schema: Option B, structured cards.

Future schema location:

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

Field guidance:

- `title`: fixed or model-returned title, defaulting to `這份分析主要參考了這些線索`.
- `items`: 3-4 items.
- `label`: 2-6 Chinese characters.
- `summary`: 20-48 Chinese characters.
- `reason`: 24-64 Chinese characters.

Why not list of strings:

- Simpler, but less scannable.
- Harder to design strong cards.
- Harder to test label quality.

Why not attach evidence to every paid section:

- Too large a schema change.
- Increases repetition.
- Higher provider compliance risk.
- Makes paid result harder to scan.

Compatibility:

- Existing schema v2 paid results should continue to render without evidence section.
- Missing `evidence_summary` should omit the section entirely.

## 5. Prompt Requirements

Future paid prompt should instruct the provider to create evidence summaries from the user’s provided situation.

Positive instructions:

- Summarize observed signals rather than quoting raw text.
- Connect each user-provided clue to why it matters for interpretation.
- Use natural Traditional Chinese.
- Keep 3-4 evidence items.
- Use concise labels.
- Avoid inventing details not present in the input.
- Keep the evidence section descriptive, not judgmental.

Negative instructions:

- Do not include raw message logs.
- Do not quote long sections.
- Do not include names, phone numbers, addresses, social handles, links, or other identifiers.
- Do not include exact timestamps unless generic and safe.
- Do not include explicit private sexual content; summarize safely if needed.
- Do not use `evidence_summary` to make the final relationship judgment.
- Do not make the section sound like surveillance.

Prompt shape should clearly distinguish:

- `evidence_summary`: what clues the analysis noticed.
- `signalDeepDive`: what those clues may mean.
- `possibleStates`: possible interpretations.
- `replyStrategies`: what the user can do next.

## 6. UI Placement

Recommended placement on unlocked paid result:

```text
paid headline / summary
→ evidence_summary cards
→ possible states
→ signal dives
→ reply strategies
→ guardrails / 48-hour plan / summary card
```

Rationale:

- The user gets emotional payoff first.
- Then they see the clues behind the analysis.
- Then they continue into interpretations and reply actions.

Do not show evidence anchors in:

- LINE text messages
- share cards
- free result
- landing
- locked paid teaser cards
- analytics or reports

Optional future locked teaser:

```text
完整分析會標出 3–4 個判斷線索
```

Do not implement that teaser until the paid evidence section exists and is validated.

## 7. Privacy / Retention Implications

Evidence summaries are user-derived content. They should be treated as part of the paid result.

Recommended v0 retention:

- Store `evidence_summary` inside `paid_result_json`.
- Let it follow `analysis_paid_results` retention cleanup.
- Do not create a separate evidence table.
- Do not store raw quote snippets.
- Do not add a separate raw evidence retention path.

Privacy implications:

- Current privacy copy may be acceptable if it already covers generated analysis output, but future implementation should review copy before launch.
- If evidence summaries become part of relationship sessions, retention needs a separate decision.
- If raw quotes are ever introduced, current retention/privacy assumptions are not enough.

Safe reporting rule:

- Reports may count whether evidence exists.
- Reports must not include evidence text.

## 8. Validation / Semantic Safety

Future implementation should validate the field without making provider output too brittle.

Recommended validation:

- `items` count is 3-4.
- Each item has `label`, `summary`, and `reason`.
- `label` length is short.
- `summary` and `reason` are concise.
- Reject or repair items over 100 characters.
- Reject obvious email-like patterns.
- Reject phone-like long digit sequences.
- Warn or fallback if an item contains long quoted text.
- Avoid English code-switching unless the user provided English.

Avoid over-strict validation:

- Do not fail paid generation for harmless punctuation.
- Do not require exact character counts if content is otherwise safe.
- Prefer sanitized omission over showing unsafe evidence.

Fallback strategy:

- If provider output is otherwise valid but `evidence_summary` fails safety checks, omit the evidence section and keep the paid result.
- Do not block full paid result rendering only because evidence anchors are missing.

## 9. Legacy / Fallback Compatibility

Legacy paid results:

- Do not show evidence section.
- Do not show empty placeholder.
- Do not break unlocked route.

Fallback paid results:

- Prefer omitting `evidence_summary` if high-quality provider-generated evidence is unavailable.
- A template fallback may include conservative generic clue summaries only if they are based on normalized safe signals, not raw text.
- If unsure, omit the section.

Schema migration:

- Treat this as `product_result_schema_v3`.
- Keep v2 rendering compatible.
- Do not backfill old paid results.

## 10. Cost / Latency Impact

Expected impact:

- Adds 3-4 short items to paid generation only.
- No impact on initial free analyze latency.
- Small output-token increase.
- Slight paid-generation latency increase is acceptable because paid generation is deferred/polled.

Risks:

- Longer output may increase truncation risk.
- New schema field may increase provider validation failures.
- More prompt constraints may require careful test fixtures.

Mitigation:

- Keep summaries concise.
- Keep item count fixed at 3-4.
- Monitor provider parse failures, semantic validation failures, fallback rate, and paid-generation duration after implementation.

## 11. Future Follow-up Relationship

Evidence anchoring can become the bridge from one-time analysis to relationship-session memory.

Future use:

- Compare new follow-up updates against prior evidence summaries.
- Show “新的線索和上次不同的地方” without retaining raw history.
- Use evidence summaries as compact relationship-session memory.

Do not implement follow-up behavior in the evidence v0 implementation.

Future session design still needs:

- retention decision
- entitlement model
- LINE identity model
- abuse prevention for repeated tiny updates
- payment/credit policy

## 12. Recommended Implementation Plan

Phase 1: schema/prompt implementation plan approval.

- Approve schema v3 field shape.
- Approve privacy/retention treatment.
- Approve UI placement.

Phase 2: schema and fixtures.

- Add `paid_result.evidence_summary` to schema v3.
- Add synthetic fixtures covering 3-4 evidence items.
- Add legacy v2 fixture ensuring section is omitted.

Phase 3: prompt update.

- Add evidence-summary instructions to paid prompt.
- Add negative instructions against raw quotes and identifiers.
- Keep paid result concise enough to avoid truncation.

Phase 4: parser/validator.

- Validate item count and required fields.
- Add lightweight identifier/long-quote checks.
- Omit evidence section if unsafe rather than failing the full paid result when possible.

Phase 5: UI render.

- Render evidence cards after paid summary and before possible states.
- Hide on LINE, share, free result, and locked preview surfaces.
- Ensure Theme A and Theme B styling both work.

Phase 6: staging QA.

- Verify provider output quality.
- Verify fallback/legacy compatibility.
- Verify no raw input or identifiers appear in evidence.
- Verify paid generation latency and fallback rate remain acceptable.

Recommended next task:

```text
Evidence Anchoring Schema v3 Implementation v0
```

Only proceed after human approval of the schema field shape and privacy boundary.
