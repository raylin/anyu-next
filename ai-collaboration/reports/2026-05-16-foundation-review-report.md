# Foundation Review Report

## Summary

The Opportunity Radar foundation is clear enough to proceed toward Signal Extraction v1, with a small number of issues that should be resolved or explicitly accepted before implementation.

Signal Extraction v1 is defined as:

```text
raw text file
-> LLM extraction
-> validated structured JSON
-> save output locally
```

The current repository supports that direction: the workflow is markdown-first, local-first, schema-driven, and intentionally constrained against premature product infrastructure. The schema, taxonomy, and prompt are usable for a first manual or lightly scripted extraction milestone.

Recommendation: proceed to Signal Extraction v1 only after resolving the canonical summary log path and making explicit decisions about source boundaries, score calibration, and single-signal versus multi-signal handling.

## What Looks Good

- The ChatGPT -> Codex -> Human collaboration workflow is direct and repeated across `AGENTS.md`, `README.md`, and `WORKING_AGREEMENT.md`.
- Codex's role is appropriately limited to execution and reporting, not strategy or architecture authority.
- The local-first and markdown-first constraints are clear.
- Reporting, handoff, escalation, and schema change expectations are explicit.
- `schemas/signal_schema_v1.json` is valid JSON and is readable by both humans and machines.
- The schema captures the core opportunity-signal fields needed for early research: emotion, pain, behavior, identity, monetization, retention, shareability, possible products, hooks, and patterns.
- The emotion taxonomy is intentionally broad, which is appropriate before sample testing.
- The extraction prompt clearly asks for market signal extraction rather than general summarization.

## Issues Found

- Summary log location is inconsistent. Some repository docs refer to root `summary_log.md`, while current review workflow uses `ai-collaboration/summaries/summary_log.md`.
- The schema allows free-string `emotion`, so extracted values may drift from the taxonomy.
- `pain_frequency`, `platform`, and `category` are free strings, which helps speed but may reduce comparability.
- The prompt does not define whether one raw content item should produce one signal or multiple signal records.
- Scoring guidance is usable but still too coarse for consistent scoring across agents or repeated runs.
- Taiwan-specific consumer and social signal interpretation is not yet addressed in the taxonomy or prompt.
- Source collection boundaries are not yet defined.

## Schema Review

`schemas/signal_schema_v1.json` is usable for Signal Extraction v1.

Required fields are clear enough for an initial extractor. The schema is AI-readable because every field has a simple name, a type, and a description. It is human-readable because the fields map directly to research concepts.

The scoring fields are clear at a structural level:

- `emotion_intensity`
- `shareability_score`
- `monetization_score`
- `retention_score`

All use integer values from 0 to 5. This is simple and good for v1, but the meaning of each score needs better calibration before the scores are treated as comparable across samples.

Fields that may be too vague:

- `pain_frequency`: free text may create inconsistent values.
- `category`: useful but undefined, so it may mix market category, content category, and emotional category.
- `platform`: free text is fine for manual work but may need normalization later.
- `identity_signal`: useful but abstract, so extraction quality may vary.

Potential future fields to consider after testing:

- `confidence_score` for extraction confidence.
- `secondary_emotion` or `emotions` for mixed emotional content.
- `locale` or `market_context` if Taiwan-specific analysis becomes central.
- `language` if sources include Chinese, English, or mixed-language content.
- `evidence_quote` if future review needs traceable support separate from full `raw_text`.

No schema changes are recommended before the first test. The better next step is to run a small sample through the current schema and document where it breaks.

## Emotion Taxonomy Review

The taxonomy is reasonable for v1. It is neither too broad nor too narrow for early extraction.

It covers major emotional opportunity areas:

- relationship anxiety
- loneliness
- social pressure
- identity seeking
- productivity stress
- financial anxiety
- FOMO
- self-worth insecurity

It supports relationship and conversation analysis as an early MVP direction. `relationship anxiety`, `loneliness`, `social pressure`, and `self-worth insecurity` are especially relevant to conversation analysis, dating anxiety, interpersonal uncertainty, and social validation signals.

For Taiwan consumer and social signal analysis, the taxonomy is directionally usable but not localized. It can capture broad emotional patterns, but it does not yet encode Taiwan-specific contexts such as family expectations, education/work pressure, salary stagnation, housing affordability, dating norms, LINE/Threads/Dcard/PTT behaviors, or local status markers. That is acceptable for v1 if localization is handled in source notes or category values, but it should be reviewed after sample testing.

Possible overlap:

- `social pressure`, `identity seeking`, and `self-worth insecurity` may overlap.
- `FOMO` may overlap with `social pressure`.
- `relationship anxiety` may overlap with `loneliness` and `self-worth insecurity`.

Missing categories that may appear later:

- shame
- resentment
- burnout
- distrust
- boredom
- anger
- grief

No taxonomy changes are recommended yet. The first implementation should log taxonomy misses during sample extraction.

## Extraction Prompt Review

The prompt is specific enough for manual Signal Extraction v1.

It clearly instructs the model to extract market signals rather than summarize content. It also avoids overclaiming by telling the model not to invent facts and to treat monetization, retention, and shareability as hypotheses.

The JSON output requirement is clear and matches the schema shape. The prompt also preserves uncertainty by requiring empty strings, empty arrays, or `0` when a field is unknown.

Weaknesses:

- It does not include a filled example.
- The scoring guide is generic, so different agents may score similarly intense signals differently.
- It does not define tie-breaking when multiple emotions are present.
- It does not define what to do when one raw text contains multiple distinct signals.
- It does not mention Taiwan-specific cultural or platform context.

Recommendation: do not change the prompt before the first test. Use the current prompt on a small sample set, then decide whether examples, score anchors, and multi-signal handling should be added.

## Workflow Review

The workflow is clear.

The role model is explicit:

- ChatGPT: strategy, specification, review
- Codex: execution, repository changes, reporting
- Human: clarification, judgment, architecture approval

Reporting requirements are clear. Execution reports must include completed work, architecture decisions, blockers, uncertainties, and suggested next steps.

Escalation rules are clear. They correctly require human judgment for architecture changes, schema changes, source collection boundaries, and additions such as scraping, UI, dashboards, auth, or databases.

Summary log rules are clear in concept, but unclear in file location. This is the main workflow issue to resolve.

Schema change rules are clear and appropriately strict. Schemas are treated as contracts, and changes require human approval, a decision log, versioning or migration notes, and an execution report.

## Implementation Readiness

The repository is mostly ready to start Signal Extraction v1.

Ready:

- raw input and structured output directories exist
- schema exists and validates as JSON
- extraction prompt exists
- taxonomy exists
- collaboration and reporting conventions are in place
- architecture constraints are clear

Not ready without explicit decisions:

- canonical summary log path
- source collection boundaries
- score calibration expectations
- whether one raw file should produce one signal or multiple signals
- whether Taiwan-specific context is required in v1 extraction output

Final readiness assessment: conditionally ready. The implementation can begin after the above ambiguities are either resolved or explicitly deferred.

## Risks Before Signal Extraction v1

- Fragmented memory if future agents append to different summary logs.
- Inconsistent scoring due to broad score definitions.
- Taxonomy drift because `emotion` is not constrained to known taxonomy values.
- Loss of important context if Taiwan-specific market signals are forced into generic fields without guidance.
- Poor handling of content containing multiple signals.
- Overbuilding risk if the first extractor becomes a framework instead of a small local workflow.
- Unclear source boundaries could create inconsistent or inappropriate research inputs.

## Recommended Changes Before Implementation

- Choose one canonical summary log path and update operating docs later through an approved maintenance task.
- Define the initial source policy for manual samples before adding any extractor.
- Decide whether Signal Extraction v1 should produce exactly one JSON object per raw input or allow multiple records.
- Add a small manually curated test set in `outputs/raw/`.
- Run the current prompt and schema against that test set before changing schema or taxonomy.
- Record taxonomy misses and scoring disagreements in a review report.
- Keep the first implementation local and minimal: read raw text, call an LLM, validate JSON, save output locally.

## Open Questions

- Should `ai-collaboration/summaries/summary_log.md` replace root `summary_log.md` as the canonical memory file?
- Should `emotion` remain a free string for v1, or should it be constrained to taxonomy values before automation?
- Should `pain_frequency` use a controlled vocabulary?
- Should Signal Extraction v1 support multiple signals per raw input?
- Should v1 add `locale`, `language`, or `market_context` for Taiwan analysis?
- Which platforms and source types are approved for the first manual test set?
- What score level should count as an actionable opportunity signal?

## Final Recommendation

Proceed to Signal Extraction v1 after resolving the canonical summary log path and documenting the initial source and output-shape decisions.

Do not change schema, taxonomy, or prompt yet. The current foundation is good enough for a small, local, manually reviewed extraction milestone. The next implementation should stay narrow: raw text file -> LLM extraction -> schema validation -> structured JSON saved locally.

