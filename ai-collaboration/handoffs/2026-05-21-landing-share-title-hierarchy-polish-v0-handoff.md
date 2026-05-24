# Handoff: Landing / Share Title Hierarchy Polish v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Adjust Module 01 landing/share title hierarchy so the module name is the primary title and the emotional question becomes the subtitle.

Target hierarchy:

```text
Primary title: 曖昧溫度計
Subtitle: 他是真的忙，還是其實在冷掉？
```

This task should improve first-glance comprehension, share-card readability, and future module-family consistency.

This is a narrow UI/copy polish task.

Do not change paid result prompt/schema.

Do not change LINE fulfillment.

Do not activate production.

Do not start ads.

## Background

Paid result optimization has now completed:

```text
Paid Result Value + Context Input Plan v0
Paid Result Prompt/Schema Upgrade v0
Paid Result Prompt Safety / Value Refinement v0
```

Latest paid result status:

```text
Prompt: product_result_prompt_v0.4
Schema: product_result_schema_v2
Semantic validation: added
Staging synthetic review: passed
Paid-result JSON chars: 2,246
3 states / 3 signal dives / 3 strategies / 6 messages: passed
```

The user previously received feedback that the landing/share hierarchy should make the module name easier to scan.

User decision:

```text
Make「曖昧溫度計」the primary title.
Make「他是真的忙，還是其實在冷掉？」the subtitle.
Do this after paid result optimization.
```

Rationale:

```text
- 曖昧溫度計 is faster to scan.
- It immediately communicates the function.
- The emotional question works better as subtitle/product flavor.
- Share/ad readability improves because users understand the product in one glance.
- This establishes a scalable module naming pattern:
  - Module name as primary title
  - Emotional question as subtitle
```

Future pattern example:

```text
Module 01 title: 曖昧溫度計
Subtitle: 他是真的忙，還是其實在冷掉？

Module 02 title: 答案壓力計
Subtitle: 你們是在靠近未來，還是在互相要答案？
```

## Scope

Do:

1. Review current Module 01 landing title/subtitle usage.
2. Review result/share/persona card title usage.
3. Review metadata/Open Graph/title copy if present.
4. Adjust primary title to「曖昧溫度計」where appropriate.
5. Adjust emotional hook to subtitle「他是真的忙，還是其實在冷掉？」where appropriate.
6. Preserve current visual style and ANYU tone.
7. Update tests.
8. Run local validation including Playwright.
9. Create review bundle, execution report, summary log.
10. Commit and push to `origin/staging`.

Do not:

- change paidResult schema/prompt/cache
- change context chips
- change analyze behavior
- change LINE fulfillment / webhook / LIFF
- change production env
- activate production
- change legal text
- change real payment/email/ads
- redesign the landing page
- modify Module 02 concept

## Target Surfaces

Review and update if applicable:

```text
apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx
apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx
apps/web/src/components/anyu/ShareCardPreview.tsx
apps/web/src/components/anyu/Wordmark.tsx if title composition uses it
apps/web/src/app/m/ambiguous-temperature/page.tsx
apps/web/src/app/m/ambiguous-temperature/result/demo/page.tsx
metadata / OG / app route config if present
tests referencing title text
```

Adjust paths based on actual repo.

## Copy Direction

### Landing hero

Preferred:

```text
曖昧溫度計
他是真的忙，還是其實在冷掉？
```

Support copy can remain unchanged unless it now feels repetitive.

### Share / persona card

Prefer module name to appear earlier / stronger.

Possible treatment:

```text
曖昧溫度計
他是真的忙，還是其實在冷掉？
```

Do not over-decorate.

### Metadata / OG

If there is a route title or metadata title:

Preferred:

```text
曖昧溫度計｜暗語 ANYU
```

Description can use:

```text
他是真的忙，還是其實在冷掉？貼上一段互動，讓暗語幫你讀出曖昧裡的微訊號。
```

Avoid making metadata too long.

## Visual Guidelines

Keep current design direction:

```text
warm / gentle / premium
gender-neutral, slightly female-leaning
not overly SaaS
not overly pink
AnyuMark selective usage preserved
Instrument Serif / Newsreader / LXGW WenKai typography preserved
```

Do not introduce new fonts or design tokens.

Do not bring back moon icon.

Do not add more mark usage unless needed.

## Compatibility

Ensure tests and copy remain consistent with:

```text
local Playwright UI smoke
paid result v2
LINE fulfillment UI
final UI polish direction
```

Do not make context chips or paid preview regress.

## Tests

Add/update tests for:

```text
landing primary title is 曖昧溫度計
landing subtitle contains 他是真的忙，還是其實在冷掉？
share/persona preview uses the new hierarchy if applicable
metadata title/description if tested
local Playwright still finds expected landing/result content
```

Avoid brittle exact full-page text assertions where possible.

## Staging / Visual Review

If staging deploy is triggered by push, verify route health if feasible:

```text
/m/ambiguous-temperature
/m/ambiguous-temperature/result/demo
```

Optional visual notes:

```text
hero still feels balanced
subtitle not too small
share card still readable
no mobile overflow
```

Do not run production.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-landing-share-title-hierarchy-polish-v0-review-bundle.md
```

Required sections:

```markdown
# Landing / Share Title Hierarchy Polish v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Rationale

## 3. Surfaces Updated

## 4. Landing Hierarchy

## 5. Share / Result Hierarchy

## 6. Metadata / OG Notes

## 7. Tests Updated

## 8. Validation Results

## 9. Visual Review Notes

## 10. Known Limitations

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-landing-share-title-hierarchy-polish-v0-execution-report.md
```

Report structure:

```markdown
# Landing / Share Title Hierarchy Polish v0 Execution Report

## Summary

## Files Created

## Files Updated

## Copy / UI Changes

## Tests Updated

## Validation Results

## Visual / Staging Notes

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
- title hierarchy summary
- validation result
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

Run Playwright because landing UI copy changes.

## Constraints

Do not implement:

```text
LINE production activation
production migration
real payment
email delivery
rich menu
broadcast
portal/account system
new second-call LLM generation
ads launch
model switch
queue/worker
SSE/websocket/token streaming
Module 02
paidResult prompt/schema/cache changes
```

Do not modify:

```text
legal semantics
LINE production behavior
production ops behavior
paid result schema/prompt
design system tokens unless tiny copy layout requires it
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LOGIN_CHANNEL_SECRET
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
raw sourced JSONL
private batch generated outputs
codes/tokens/tokenized URLs/LINE user IDs
full raw provider output
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "copy: update module title hierarchy"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- title hierarchy changes
- surfaces updated
- metadata/OG changes if any
- tests updated
- validation results
- staging/visual notes
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
