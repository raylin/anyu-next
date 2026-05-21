# Handoff: Extract Topic Ingestion Tools v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Extract reusable topic-ingestion tooling into a clean, source-agnostic `tools/topic-ingestion/` area.

This task should separate useful structured JSONL → topic/question/module-seed transformation logic from legacy Dcard acquisition/crawler code.

The resulting tool should assume that input JSONL is provided manually or by another upstream sourcing tool.

This is a tooling extraction task.

Do not implement sourcing/crawling.

Do not implement Dcard fetching.

Do not implement Cloudflare bypass logic.

Do not merge any external sourcing repo.

Do not change app runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

Oradar Topic Tool Extraction Plan v0 completed.

Key findings:

```text
oradar/ itself is not primarily the Dcard crawler layer.
Blocked Dcard acquisition / browser / fetch scripts mainly live in scripts/.
oradar/ contains reusable extraction infrastructure candidates:
  - cli.py
  - config.py
  - extractor.py
  - schema.py
  - providers.py
The strongest future extraction source is scripts/external_dcard_json_calibration.py.
oradar/product_runtime.py is a historical Python-side product runtime helper, not part of the future topic-ingestion core.
```

User clarification:

```text
JSONL will be manually provided from other tools for now.
This tool should focus on extraction and downstream transformation.
When the sourcing tool is more complete, we may later consider merging repos or creating a full trend-radar tool.
```

Current target:

```text
tools/topic-ingestion/
```

Tool role:

```text
structured JSONL input
→ normalize records
→ extract topic candidates
→ generate question seeds
→ optionally generate module idea seeds
```

Out of scope:

```text
Dcard crawling
browser automation
Cloudflare workaround
login/session/cookie handling
source ranking API
external sourcing repo integration
```

## Scope

Do:

1. Create `tools/topic-ingestion/`.
2. Extract source-agnostic logic from `oradar/` and `scripts/external_dcard_json_calibration.py`.
3. Define JSONL input contract.
4. Define topic candidate output contract.
5. Define question seed output contract.
6. Add a simple Python-first CLI.
7. Add synthetic fixtures only.
8. Add tests.
9. Add README usage docs.
10. Leave `oradar/product_runtime.py` untouched.
11. Do not delete or move legacy crawler code yet.
12. Create review bundle, execution report, summary log.
13. Commit and push to `origin/staging`.

Do not:

- fetch from Dcard
- fetch from any website
- include Cloudflare code
- move/delete all of `oradar/`
- archive crawler scripts in this task
- use real raw posts as fixtures
- commit private/raw input data
- change active app runtime
- change production behavior

## Target Structure

Create:

```text
tools/topic-ingestion/
  README.md
  topic_ingestion/
    __init__.py
    cli.py
    schema.py
    loaders.py
    extractors.py
    transformers.py
    exporters.py
  tests/
    test_loaders.py
    test_extractors.py
    test_transformers.py
  examples/
    sample-input.jsonl
    topic-candidates.example.jsonl
    question-seeds.example.jsonl
```

If a smaller structure is more appropriate, keep it simple but preserve these concepts.

## Input Contract

The tool should accept source-agnostic JSONL records.

Minimum supported fields:

```json
{
  "id": "source-specific-id",
  "source": "manual",
  "title": "文章標題",
  "content": "文章摘要或正文",
  "url": "optional",
  "publishedAt": "optional ISO datetime",
  "metrics": {
    "likes": 123,
    "comments": 45,
    "shares": 0
  },
  "tags": ["optional", "tags"]
}
```

The loader should tolerate missing optional fields.

Do not require Dcard-specific fields.

If existing scripts use Dcard-specific names, map them into generic fields.

## Output Contract: Topic Candidates

Output JSONL should include records like:

```json
{
  "topicId": "stable-id-or-slug",
  "sourceIds": ["..."],
  "title": "曖昧後突然冷掉",
  "summary": "多人討論邀約後冷掉、訊息頻率下降的情境。",
  "signals": ["邀約後沉默", "限動仍互動", "訊息頻率下降"],
  "audience": "22–35 relationship-curious users",
  "evidenceCount": 3,
  "score": 0.74,
  "createdAt": "ISO datetime"
}
```

Keep scoring heuristic simple and documented.

Do not call LLM/provider in v0 unless existing local logic already does so and can be mocked safely.

Preferred v0:

```text
heuristic-first
provider-free
deterministic
```

## Output Contract: Question Seeds

Output JSONL should include records like:

```json
{
  "questionId": "stable-id-or-slug",
  "topicId": "...",
  "question": "他是真的忙，還是其實在冷掉？",
  "moduleFit": "ambiguous-temperature",
  "whyItWorks": "關係不確定性高，容易轉成輕量測驗。",
  "tone": "warm, subtle, slightly mysterious",
  "createdAt": "ISO datetime"
}
```

This is a seed, not final product copy.

## CLI

Add simple commands:

```bash
python -m topic_ingestion.cli extract   --input tools/topic-ingestion/examples/sample-input.jsonl   --output /tmp/topic-candidates.jsonl
```

```bash
python -m topic_ingestion.cli questions   --input /tmp/topic-candidates.jsonl   --output /tmp/question-seeds.jsonl
```

Optional combined command if simple:

```bash
python -m topic_ingestion.cli pipeline   --input tools/topic-ingestion/examples/sample-input.jsonl   --topics-output /tmp/topic-candidates.jsonl   --questions-output /tmp/question-seeds.jsonl
```

Keep CLI small.

## Source Extraction Guidance

Review:

```text
oradar/cli.py
oradar/config.py
oradar/extractor.py
oradar/schema.py
oradar/providers.py
scripts/external_dcard_json_calibration.py
```

Extract only source-agnostic parts.

Do not copy:

```text
Dcard fetch logic
browser automation
Cloudflare workaround
cookies/session logic
real raw post fixtures
private source-specific config
```

If source code is too coupled, implement a clean v0 inspired by it and document what remains deferred.

## oradar Treatment

Do not delete `oradar/`.

Do not move `oradar/product_runtime.py`.

Allowed:

```text
Add a short note to docs/operations/repo-maintenance.md or the review bundle explaining that reusable topic-ingestion has been extracted and oradar legacy/archive cleanup remains future work.
```

Do not modify `oradar/` unless adding a README/deprecation note is clearly useful and safe.

## Tests

Add tests for:

```text
load JSONL records
tolerate missing optional fields
normalize Dcard-like input into generic record if supported
extract topic candidates from synthetic fixture
generate question seeds from topic candidates
export JSONL
CLI extract command
CLI questions command
no raw/private fixtures
```

Use synthetic fixtures only.

Do not require network access.

Do not require provider API keys.

## Docs

Create `tools/topic-ingestion/README.md` with:

```markdown
# Topic Ingestion

## Purpose

## What This Tool Does

## What This Tool Does Not Do

## Input JSONL Contract

## Topic Candidate Output

## Question Seed Output

## CLI Usage

## Examples

## Privacy / Fixture Rules

## Future Integration With Sourcing Tools
```

Mention:

```text
This tool assumes upstream sourcing is handled elsewhere.
Do not commit raw/private input JSONL.
Use synthetic fixtures in repo.
```

Update `docs/operations/repo-maintenance.md` if useful.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-extract-topic-ingestion-tools-v0-review-bundle.md
```

Required sections:

```markdown
# Extract Topic Ingestion Tools v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Source Inputs Reviewed

## 3. Files Created

## 4. Extracted / Reimplemented Logic

## 5. Input Contract

## 6. Output Contracts

## 7. CLI Usage

## 8. Tests Added

## 9. What Was Intentionally Not Moved

## 10. Remaining Legacy Oradar / Scripts Work

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-extract-topic-ingestion-tools-v0-execution-report.md
```

Report structure:

```markdown
# Extract Topic Ingestion Tools v0 Execution Report

## Summary

## Files Created

## Files Updated

## Tool Structure

## CLI Commands

## Tests Added

## Legacy Code Treatment

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
- new tool path
- CLI summary
- validation result
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
```

Run tool tests if added, for example:

```bash
python3 -m pytest tools/topic-ingestion/tests
```

If pytest is not configured or unavailable, use the repo's existing Python test convention or simple script-level smoke tests.

Always run app validation:

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
git commit -m "tools: extract topic ingestion pipeline"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts/raw JSONL are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- new tool path
- CLI commands
- input/output contract summary
- tests added
- legacy code treatment
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
