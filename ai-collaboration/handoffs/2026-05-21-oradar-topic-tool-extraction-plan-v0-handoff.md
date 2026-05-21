# Handoff: Oradar Topic Tool Extraction Plan v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Create a focused extraction plan for the reusable topic/question tooling currently mixed inside `oradar/`.

This task should separate likely legacy Dcard/cloudflare crawler code from reusable structured-data transformation tools, especially anything that can support the future ANYU trend-driven module pipeline:

```text
structured jsonl input
→ topic candidates
→ question seeds
→ module/theme ideas
```

This is a planning / inventory task only.

Do not move files in this task.

Do not delete files in this task.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

Repo Architecture + MVP Leftover Audit v0 and Repo Cleanup Pass v0 completed.

Repo Cleanup Pass v0 findings:

```text
oradar/ was not moved or deleted.
oradar/ is now classified as mostly reusable extraction tooling plus one historical Python-side product runtime helper.
Raw fixture privacy risk was reduced separately.
```

User clarification:

```text
oradar was originally intended to run Dcard fetching/scraping, but Cloudflare blocked that path.
The user later obtained hot article lists using other tools.
The Dcard crawler/fetching path is unlikely to be reused.
However, reusable structured jsonl → topic/question tooling remains valuable.
```

Implication:

```text
Do not delete oradar/ wholesale.
Extract or preserve reusable structured transformation/topic tooling.
Archive or de-emphasize Dcard crawler / Cloudflare acquisition code later.
```

Recommended later implementation:

```text
Extract Topic Ingestion Tools v0
```

## Scope

Do:

1. Inventory `oradar/` internals.
2. Identify Dcard crawler / acquisition / Cloudflare-blocked code.
3. Identify reusable jsonl parsing / structured transformation code.
4. Identify topic/question generation code.
5. Identify useful fixtures/tests.
6. Identify historical runtime helper(s), including `oradar/product_runtime.py` if present.
7. Propose target architecture for reusable tooling.
8. Propose file moves for a future extraction pass.
9. Propose CLI/API shape for future `jsonl → topic/question` workflow.
10. Create report, execution report, summary log.
11. Commit and push to `origin/staging`.

Do not:

- move files
- delete files
- change imports
- change active app code
- rewrite oradar code
- add new CLI implementation
- change tests
- touch production
- run crawler against Dcard
- use real private data

## Source Inputs

Read:

```text
ai-collaboration/research/2026-05-21-repo-architecture-mvp-leftover-audit-v0.md
ai-collaboration/research/2026-05-21-repo-cleanup-pass-v0-review-bundle.md
oradar/
```

If paths differ, locate the latest audit/cleanup artifacts.

## Inventory Requirements

Produce a table covering all significant `oradar/` files/folders.

Use classifications:

```text
LEGACY_DCARD_CRAWLER
LEGACY_CLOUDFLARE_ACQUISITION
RAW_INGESTION_HELPER
KEEP_JSONL_TOOLING
KEEP_TOPIC_EXTRACTION
KEEP_QUESTION_GENERATION
KEEP_FIXTURE_OR_TEST
HISTORICAL_PRODUCT_RUNTIME
NEEDS_HUMAN_REVIEW
SAFE_DELETE_CANDIDATE
ARCHIVE_CANDIDATE
```

For each file/folder:

```markdown
| Path | Classification | Current Role | Reuse Potential | Proposed Future Action |
|---|---|---|---|---|
```

## Desired Future Architecture

Recommend a new home for reusable tools.

Preferred target:

```text
tools/topic-ingestion/
```

Possible structure:

```text
tools/topic-ingestion/
  README.md
  package or python module
  cli/
  src/
  fixtures/
  tests/
  examples/
```

If the current tooling is Python-heavy, propose:

```text
tools/topic-ingestion/python/
```

or simply:

```text
tools/topic-ingestion/
  pyproject.toml
  topic_ingestion/
  tests/
```

If TypeScript is better aligned with `apps/web`, explain why.

Do not implement this structure yet.

## Future Workflow Requirements

The extraction plan should support:

```text
input: structured jsonl from any source, not only Dcard
output: topic candidates / question seeds / module ideas
no dependency on Dcard fetching
no Cloudflare bypass logic
works with synthetic or sanitized fixtures
safe for future trend radar pipeline
```

Possible CLI shape:

```bash
python -m topic_ingestion.from_jsonl   --input data/hot-posts.jsonl   --output outputs/topic-candidates.jsonl   --mode question-seeds
```

or:

```bash
pnpm topic:ingest --input data/hot-posts.jsonl --output outputs/topic-candidates.jsonl
```

Do not implement CLI in this task; just propose.

## Dcard / Crawler Treatment

For Dcard crawler / Cloudflare acquisition code, recommend one of:

```text
archive under archive/2026-05-dcard-crawler/
keep historical only with README
delete later after human approval
```

Do not delete now.

Include rationale:

```text
Dcard fetching is unlikely to be reused because Cloudflare blocked the original path and the user now obtains hot article lists through other tools.
```

## product_runtime.py

If `oradar/product_runtime.py` exists:

1. Determine what it does.
2. Determine whether it overlaps with current `apps/web` runtime.
3. Classify as:
   - historical helper
   - reusable generator helper
   - archive candidate
   - needs human review

Do not move/delete it.

## Raw / Fixture Safety

Check whether oradar fixtures contain raw/private-like text.

Do not paste content.

Report only:

```text
fixture path
risk level
recommendation
```

If raw private-like content remains, flag for cleanup.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-21-oradar-topic-tool-extraction-plan-v0.md
```

Required sections:

```markdown
# Oradar Topic Tool Extraction Plan v0

Date: 2026-05-21

## 1. Summary

## 2. Source Context

## 3. Current oradar Structure

## 4. File Classification Table

## 5. Reusable JSONL / Topic Tooling

## 6. Legacy Dcard / Acquisition Code

## 7. product_runtime.py Assessment

## 8. Fixtures / Raw Data Safety

## 9. Proposed Target Architecture

## 10. Proposed CLI / API Shape

## 11. Future Extraction Pass Scope

## 12. Archive / Delete Candidates

## 13. Items Needing Human Review

## 14. Risks

## 15. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-oradar-topic-tool-extraction-plan-v0-execution-report.md
```

Report structure:

```markdown
# Oradar Topic Tool Extraction Plan v0 Execution Report

## Summary

## Files Created

## Files Updated

## Inventory Coverage

## Key Classifications

## Proposed Extraction Plan

## Raw / Fixture Safety Findings

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
- extraction plan path
- oradar classification summary
- recommended next step
- validation result
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

This is docs/report only, but validation should still pass.

No need to run Playwright unless app code changes, which should not happen.

## Constraints

Do not implement:

```text
file moves
file deletion
topic-ingestion CLI
runtime changes
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
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: plan oradar topic tool extraction"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- extraction plan path
- oradar classification summary
- reusable tooling candidates
- Dcard/archive candidates
- product_runtime.py assessment
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
