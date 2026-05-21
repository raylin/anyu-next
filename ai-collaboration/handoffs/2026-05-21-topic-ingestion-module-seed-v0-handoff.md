# Handoff: Topic Ingestion Module Seed v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Extend the new `tools/topic-ingestion/` pipeline so it can generate deterministic `module idea seeds` from topic candidates and/or question seeds.

This task should complete the first useful post-sourcing transformation loop:

```text
source-agnostic JSONL
→ topic candidates
→ question seeds
→ module idea seeds
```

The output should be useful as input for future ANYU module ideation, weekly/biweekly trend review, and lightweight product opportunity radar workflows.

This is a local tooling task.

Do not add provider/LLM enrichment in this task.

Do not implement sourcing/crawling.

Do not change app runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

Extract Topic Ingestion Tools v0 completed.

Current tool path:

```text
tools/topic-ingestion/
```

Current CLI commands:

```text
extract
questions
pipeline
```

Current capabilities:

```text
source-agnostic JSONL loading
Dcard-like field mapping when present
deterministic heuristic topic extraction
deterministic question seed generation
synthetic fixtures/tests
```

Current limitation:

```text
module-idea seed generation was intentionally left out.
```

The user wants to finish this tooling thread before returning to other product work.

Goal:

```text
Add module seed output that is closer to ANYU's product pipeline.
```

## Scope

Do:

1. Add module seed output contract.
2. Add deterministic module seed generation from topic candidates and/or question seeds.
3. Add a CLI command for module seed generation.
4. Update the existing `pipeline` command to optionally output module seeds.
5. Add synthetic examples.
6. Add tests.
7. Update README.
8. Create review bundle, execution report, summary log.
9. Commit and push to `origin/staging`.

Do not:

- call an LLM/provider
- implement provider-assisted enrichment
- implement Dcard/source fetching
- change active app runtime
- change production behavior
- use real raw sourced JSONL
- commit private/raw input data
- overbuild a product CMS

## Desired Output Contract

Module seed JSONL should produce records like:

```json
{
  "moduleId": "ambiguous-temperature-followup",
  "topicId": "ambiguous-temperature",
  "questionIds": ["busy-or-cooling-down"],
  "title": "他是真的忙，還是其實在冷掉？",
  "format": "mini-test",
  "audience": "22–35 relationship-curious users",
  "emotionalHook": "訊息變慢但限動還在互動的矛盾感",
  "userPromise": "幫你判斷這段互動是在降溫、觀望，還是只是節奏不同。",
  "inputNeeded": [
    "對話片段",
    "最近互動變化",
    "見面或邀約情境"
  ],
  "outputSections": [
    "溫度分數",
    "三個小訊號",
    "下一句怎麼回"
  ],
  "monetizationFit": "paid follow-up reply strategy",
  "tone": "warm, subtle, slightly mysterious",
  "confidence": 0.72,
  "createdAt": "ISO datetime"
}
```

Keep the contract stable and documented.

Use camelCase keys.

## Module Seed Generation Rules

Keep v0 deterministic and heuristic-first.

Inputs may be:

```text
topic candidates
question seeds
or both
```

Preferred:

```text
questions command output → modules command input
```

Generation should use existing fields:

```text
topic title
topic summary
signals
audience
score
question
moduleFit
whyItWorks
tone
```

Suggested heuristics:

```text
format = mini-test by default
audience = inherited from topic if present
emotionalHook = derived from topic summary / signals
userPromise = derived from question + topic summary
inputNeeded = default relationship-oriented input set, unless topic suggests otherwise
outputSections = default ANYU sections
monetizationFit = paid follow-up reply strategy if relationship/response topic
confidence = bounded combination of topic score + evidenceCount + question seed confidence if present
```

Do not pretend the module seed is final product copy.

It should be a product ideation seed.

## CLI Requirements

Add command:

```bash
python -m topic_ingestion.cli modules   --input /tmp/question-seeds.jsonl   --topics /tmp/topic-candidates.jsonl   --output /tmp/module-seeds.jsonl
```

If `--topics` is optional, document behavior.

Update pipeline:

```bash
python -m topic_ingestion.cli pipeline   --input tools/topic-ingestion/examples/sample-input.jsonl   --topics-output /tmp/topic-candidates.jsonl   --questions-output /tmp/question-seeds.jsonl   --modules-output /tmp/module-seeds.jsonl
```

If `--modules-output` is omitted, preserve existing behavior.

## Files Likely To Update

Likely files:

```text
tools/topic-ingestion/README.md
tools/topic-ingestion/topic_ingestion/cli.py
tools/topic-ingestion/topic_ingestion/schema.py
tools/topic-ingestion/topic_ingestion/transformers.py
tools/topic-ingestion/topic_ingestion/exporters.py
tools/topic-ingestion/tests/test_cli.py
tools/topic-ingestion/examples/module-seeds.example.jsonl
```

Add tests as needed.

## Synthetic Fixtures Only

Use only synthetic examples.

Do not use raw Dcard content.

Do not commit real source JSONL.

If examples need relationship content, keep it clearly synthetic.

## Tests

Add/update tests for:

```text
module seed generation from question seeds
module seed generation with topic candidates
pipeline can output modules when requested
pipeline preserves old behavior when modules output is omitted
module seed output uses camelCase keys
confidence is bounded
inputNeeded/outputSections defaults are present
no provider/API key required
```

Use standard unittest unless repo tooling suggests otherwise.

## Docs

Update `tools/topic-ingestion/README.md` with:

```markdown
## Module Seed Output

## modules command

## pipeline with modules output

## How Module Seeds Should Be Used

## What Is Not Final Product Copy
```

Clarify:

```text
Module seeds are ideation inputs for ChatGPT/Claude/Codex, not final module specs.
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-topic-ingestion-module-seed-v0-review-bundle.md
```

Required sections:

```markdown
# Topic Ingestion Module Seed v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Output Contract

## 3. Generation Heuristics

## 4. CLI Changes

## 5. Pipeline Changes

## 6. Examples Added

## 7. Tests Added

## 8. What Is Still Out Of Scope

## 9. Validation Results

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-topic-ingestion-module-seed-v0-execution-report.md
```

Report structure:

```markdown
# Topic Ingestion Module Seed v0 Execution Report

## Summary

## Files Created

## Files Updated

## Module Seed Contract

## CLI / Pipeline Changes

## Tests Added

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

- date
- task completed
- module seed output summary
- CLI summary
- validation result
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
```

Always run app validation too:

```bash
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

No need to run Playwright unless app code changes, which should not happen.

## Constraints

Do not implement:

```text
Dcard crawler
Cloudflare workaround
browser automation
external sourcing integration
provider-assisted enrichment
runtime app changes
DB schema changes
model switch
async polling
streaming
ads launch
real payment
LINE API
LIFF
auth
portal
UI changes
```

Do not modify:

```text
active production app code
product prompt/schema
DB schema
provider/model
legal semantics
design system assets
LINE funnel behavior
production ops behavior
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
raw sourced JSONL
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "tools: add module seed generation"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- module seed contract summary
- CLI/pipeline changes
- examples/tests added
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
