# Handoff: Topic Ingestion Trend Review Pack v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Add a human-readable trend review pack generator to `tools/topic-ingestion/`.

This task should turn the existing deterministic outputs:

```text
topic candidates
question seeds
module seeds
```

into a lightweight review artifact that the user can inspect weekly/biweekly before deciding what module/theme to build next.

This should complete the first usable v0 loop for the local opportunity-radar workflow:

```text
manual/upstream JSONL
→ topic candidates
→ question seeds
→ module seeds
→ trend review pack
→ human/ChatGPT/Claude product decision
```

This is a local tooling task.

Do not add LLM/provider enrichment.

Do not implement sourcing/crawling.

Do not change app runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

Topic Ingestion Module Seed v0 completed.

Current tool path:

```text
tools/topic-ingestion/
```

Current CLI commands:

```text
extract
questions
modules
pipeline
```

Current capabilities:

```text
source-agnostic JSONL loading
Dcard-like field mapping when present
deterministic heuristic topic extraction
deterministic question seed generation
deterministic module seed generation
synthetic fixtures/tests
```

Current pipeline:

```text
source JSONL → topic candidates → question seeds → module seeds
```

User direction:

```text
Finish this tooling thread while context is hot, then return to main product UX work.
```

This task adds the human review layer.

## Scope

Do:

1. Add a review-pack output contract.
2. Add deterministic review-pack generation from module seeds, with optional topic/question context.
3. Add a CLI command for review-pack generation.
4. Extend pipeline with optional review-pack output.
5. Add synthetic example review pack.
6. Add tests.
7. Update README.
8. Create review bundle, execution report, summary log.
9. Commit and push to `origin/staging`.

Do not:

- call an LLM/provider
- implement provider-assisted ranking
- implement sourcing/crawling
- implement Dcard fetching
- change active app runtime
- change production behavior
- use real raw sourced JSONL
- commit private/raw input data
- overbuild a product CMS

## Desired Output

Prefer Markdown for human review.

Suggested output path:

```text
/tmp/trend-review-pack.md
```

Optional JSON output can be deferred.

The review pack should include:

```markdown
# Topic Ingestion Trend Review Pack

Generated At:

## 1. Summary

## 2. Top Module Seed Candidates

## 3. Best Mini-Test Opportunities

## 4. Relationship / Ambiguity Themes

## 5. Monetization Fit Notes

## 6. Risk / Sensitivity Notes

## 7. Recommended Human Review Questions

## 8. Candidate Table

## 9. Deferred / Low-Fit Candidates
```

## Candidate Fields

Each candidate summary should include:

```text
rank
moduleId
title
topicId
questionIds
format
audience
emotionalHook
userPromise
inputNeeded
outputSections
monetizationFit
tone
confidence
whyItWorks / rationale if available
recommendedAction: build / watch / defer
```

## Ranking Heuristics

Keep ranking deterministic.

Suggested scoring inputs:

```text
confidence
topic evidenceCount
topic score
presence of strong emotionalHook
moduleFit / mini-test fit
monetizationFit
relationship/ambiguity relevance
```

Do not pretend this is objective truth.

Review pack should state:

```text
Scores are heuristic ranking scaffolding, not a truth metric.
```

## Recommended Actions

Assign one of:

```text
build
watch
defer
```

Heuristic:

```text
build: high confidence + strong mini-test fit + clear emotionalHook
watch: medium confidence or promising but needs more evidence
defer: low confidence, weak hook, or poor module fit
```

Keep it explainable.

## CLI Requirements

Add command:

```bash
python -m topic_ingestion.cli review   --modules /tmp/module-seeds.jsonl   --topics /tmp/topic-candidates.jsonl   --questions /tmp/question-seeds.jsonl   --output /tmp/trend-review-pack.md
```

Make `--topics` and `--questions` optional if practical.

Extend pipeline:

```bash
python -m topic_ingestion.cli pipeline   --input tools/topic-ingestion/examples/sample-input.jsonl   --topics-output /tmp/topic-candidates.jsonl   --questions-output /tmp/question-seeds.jsonl   --modules-output /tmp/module-seeds.jsonl   --review-output /tmp/trend-review-pack.md
```

If `--review-output` is omitted, preserve existing pipeline behavior.

## Files Likely To Update

Likely files:

```text
tools/topic-ingestion/README.md
tools/topic-ingestion/topic_ingestion/cli.py
tools/topic-ingestion/topic_ingestion/schema.py
tools/topic-ingestion/topic_ingestion/transformers.py
tools/topic-ingestion/topic_ingestion/exporters.py
tools/topic-ingestion/tests/test_cli.py
tools/topic-ingestion/tests/test_transformers.py
tools/topic-ingestion/examples/trend-review-pack.example.md
```

Add a new module if cleaner:

```text
tools/topic-ingestion/topic_ingestion/review.py
```

## Synthetic Fixtures Only

Use only synthetic examples.

Do not use raw Dcard content.

Do not commit real source JSONL.

## Tests

Add/update tests for:

```text
review pack generation from module seeds
review pack generation with optional topic/question enrichment
review command writes Markdown
pipeline can emit review output when requested
pipeline preserves old behavior when review output is omitted
recommendedAction is one of build/watch/defer
ranking is deterministic
review text includes heuristic disclaimer
no provider/API key required
```

Use standard unittest unless repo tooling suggests otherwise.

## Docs

Update `tools/topic-ingestion/README.md` with:

```markdown
## Trend Review Pack

## review command

## pipeline with review output

## How To Use The Review Pack

## Scores Are Heuristic
```

Clarify:

```text
The review pack is a local decision-support artifact.
It is intended for human/ChatGPT/Claude review.
It is not final product strategy.
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-topic-ingestion-trend-review-pack-v0-review-bundle.md
```

Required sections:

```markdown
# Topic Ingestion Trend Review Pack v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Review Pack Contract

## 3. Ranking / Action Heuristics

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
ai-collaboration/reports/2026-05-21-topic-ingestion-trend-review-pack-v0-execution-report.md
```

Report structure:

```markdown
# Topic Ingestion Trend Review Pack v0 Execution Report

## Summary

## Files Created

## Files Updated

## Review Pack Contract

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
- review-pack output summary
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
git commit -m "tools: add trend review pack output"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- review pack contract summary
- CLI/pipeline changes
- examples/tests added
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
