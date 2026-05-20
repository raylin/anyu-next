# Handoff: Font Migration Phase 2 Staging QA v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused staging/browser QA pass for Font Migration Phase 2 — Editorial Reading.

This task should verify that Newsreader improves selected long-form result surfaces without hurting mobile readability, layout stability, or the clarity of surrounding UI.

This is primarily a QA task.

Do not implement LXGW WenKai.

Do not implement Font Migration Phase 3.

Do not expand Newsreader to more surfaces unless a tiny, clearly justified bug fix is needed.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

Font Migration Phase 2: Editorial Reading v0 completed.

Commit:

```text
d8bef11
```

What changed:

```text
- App now explicitly loads Newsreader alongside Instrument Serif.
- Canonical and app token files now include:
  --anyu-font-reading: "Newsreader", "Noto Serif TC", serif;
- .t-reading and .t-reading-lg utilities were added.
- .t-reading was applied only to selected long-form result surfaces:
  - insight body
  - reassurance / explanatory long-form result copy
  - paid-preview sample reply
```

What did not change:

```text
- No LXGW WenKai.
- No Phase 3.
- Quote typography unchanged.
- Legal pages unchanged.
- Buttons unchanged.
- Contact/LINE/Email surfaces unchanged.
- Headings unchanged.
- General UI/body text unchanged.
- Runtime/model/schema/DB/legal/LINE behavior unchanged.
```

Recommended next step:

```text
Font Migration Phase 2 Staging QA v0
```

## Scope

Do:

1. Confirm staging is serving commit `d8bef11` or newer.
2. Verify Newsreader is loaded on staging.
3. Verify `.t-reading` is present and scoped to selected long-form result surfaces.
4. Verify result/demo result readability.
5. Verify paid-preview sample reply readability.
6. Verify surrounding UI still uses correct non-reading typography.
7. Verify no obvious layout shift, overflow, or FOUT issue.
8. Verify no funnel regression.
9. Document findings.
10. Apply only tiny safe fixes if an obvious bug is found.
11. Commit report and push to `origin/staging`.

Do not:

- add LXGW WenKai
- add `--anyu-font-kai`
- change `.t-quote`
- expand `.t-reading` globally
- change legal typography
- change button/contact/LINE typography
- change headings
- redesign cards
- change conversion/CTA layout
- change production behavior

## Staging URLs

Use:

```text
https://staging.anyu.tw/m/ambiguous-temperature
https://staging.anyu.tw/m/ambiguous-temperature/result/demo
```

If needed, run one synthetic staging analyze flow:

```text
他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
```

Do not use real private content.

## QA Checklist

### 1. Deployment Freshness

Verify:

```text
staging.anyu.tw serves d8bef11 or newer
```

Suggested checks:

```bash
git fetch origin
git log --oneline -5 origin/staging
vercel inspect https://staging.anyu.tw
```

### 2. Font Loading

Verify:

```text
Newsreader font request is present in staging HTML/bundle.
Instrument Serif still loads.
LXGW WenKai is not loaded.
Cormorant is not active.
No font files are committed.
```

### 3. Insight / Long-form Result Readability

Check:

```text
Insight body feels more editorial / magazine-like.
Chinese fallback remains natural enough.
Line height remains comfortable.
Text is not too thin on mobile.
Paragraphs do not feel slower to scan.
No overflow or wrapping regression.
```

### 4. Paid Preview Sample Reply

Check:

```text
Paid-preview sample reply is more refined.
It remains readable.
It does not feel like a blog article where UI clarity is needed.
Locked B/C cards are unaffected.
NT$49 / CTA / labels remain unchanged.
```

### 5. Surrounding UI Scope

Confirm Newsreader did not spread to:

```text
buttons
contact panel
LINE panel
Email fallback
legal pages
footer links
mono labels
headings
input helper text
general UI body
```

If it did, fix scope.

### 6. Mobile / Browser Rendering

If true browser/device is available, check:

```text
No obvious font-loading jump.
No cramped paragraphs.
No excessive contrast/weight issue.
No scroll rhythm issue.
```

If not available, document limitation.

### 7. Funnel Regression

Verify:

```text
landing loads
demo result loads
analyze route works if tested
runtime result loads
unlock intent works
LINE-first panel appears
LINE CTA target remains https://lin.ee/S6dnbJO
Email fallback remains available
legal footer links remain
```

Do not run excessive analyze calls.

## If Issues Are Found

Classify:

```text
Newsreader not loading
Newsreader applied too broadly
long-form text too hard to read
paid sample readability issue
layout shift / FOUT issue
route/funnel regression
```

Allowed tiny fixes:

```text
font link typo
token mismatch
class scope correction
minor line-height tweak on .t-reading
test expectation update
```

Do not make broad typography/layout changes.

If visual issue is subjective, document it for human review instead of changing.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-21-font-migration-phase-2-staging-qa-v0.md
```

Required sections:

```markdown
# Font Migration Phase 2 Staging QA v0

Date: 2026-05-21

## 1. Summary

## 2. Deployment Freshness

## 3. Font Loading Verification

## 4. Insight / Long-form Readability QA

## 5. Paid Preview Sample QA

## 6. Scope Verification

## 7. Mobile / Browser Rendering

## 8. Funnel Regression QA

## 9. Issues Found

## 10. Fixes Applied

## 11. Remaining Typography Backlog

## 12. Recommendation

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-font-migration-phase-2-staging-qa-v0-execution-report.md
```

Report structure:

```markdown
# Font Migration Phase 2 Staging QA v0 Execution Report

## Summary

## Files Created

## Files Updated

## Deployment Status

## Font QA Results

## Readability QA Results

## Funnel Regression Status

## Fixes Applied

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
- QA result summary
- fixes applied if any
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If tiny code/CSS fixes are made, validate after fixes.

If only reports/docs are created, still run validation.

## Constraints

Do not implement:

```text
LXGW WenKai
font migration phase 3
quote typography migration
ads launch
real payment
LINE API
LIFF
email sending
auth
portal
scheduled deletion job
model switch
major runtime rewrite
conversion redesign
image share / PNG / OG generation
```

Do not modify:

```text
product prompt/schema
DB schema
provider/model
legal semantics
LINE funnel behavior
production ops behavior
general app layout beyond tiny bug fixes
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
real contact values
raw private user content
font files
```

Important:

Do not commit font files.

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "chore: qa editorial reading font"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- font loading verification
- readability QA summary
- scope verification
- funnel regression result
- fixes applied if any
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
