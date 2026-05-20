# Handoff: Font Migration Phase 1 Staging QA v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused staging/browser QA pass for Font Migration Phase 1 — Latin Display.

This task should verify that the Instrument Serif swap improves the visual tone of ANYU wordmark, big numbers, price numerals, and Latin display accents without causing layout, readability, or loading issues.

This is primarily a QA task.

Do not implement Newsreader.

Do not implement LXGW WenKai.

Do not change typography beyond tiny bug fixes.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, or production ops behavior.

## Background

Font Migration Phase 1: Latin Display v0 completed.

Commit:

```text
7bb4e91
```

What changed:

```text
- App now explicitly loads Instrument Serif in apps/web/src/app/layout.tsx.
- --anyu-font-latin now uses Instrument Serif in canonical and app token files.
- Active Cormorant Garamond references were removed from current app/source-of-truth paths.
- Newsreader was not introduced.
- LXGW WenKai was not introduced.
- Chinese heading/body typography was not changed.
```

Affected surfaces:

```text
ANYU wordmark Latin
large temperature number
/100 numeric treatment
NT$49 / price-like numerals
Latin italic display accents
```

No changes were made to:

```text
runtime
model
schema
DB
legal
LINE
payment
auth
portal
layout behavior beyond font loading/token changes
```

## Scope

Do:

1. Confirm staging is serving commit `7bb4e91` or newer.
2. Verify Instrument Serif is loaded on staging.
3. Verify Cormorant Garamond is no longer active in app bundle/source-of-truth paths.
4. Verify visual feel on landing and result/demo result.
5. Verify wordmark, large numerals, price numerals, and italic accents.
6. Verify no obvious layout shift or spacing regression.
7. Verify no obvious font-loading / FOUT issue.
8. Verify app routes and funnel still work.
9. Document findings.
10. Apply only tiny safe fixes if a clear bug is found.
11. Commit report and push to `origin/staging`.

Do not:

- add Newsreader
- add LXGW WenKai
- change `.t-quote`
- add `.t-reading`
- change body typography
- change Chinese heading typography
- change conversion/CTA layout
- redesign cards
- make broad layout changes
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
staging.anyu.tw serves 7bb4e91 or newer
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
Instrument Serif font request is present
Cormorant Garamond is not loaded by active app layout
Google Fonts link is valid
No font files are committed
```

If possible, inspect generated HTML / bundle.

### 3. Landing Visual QA

Check:

```text
ANYU wordmark Latin feels editorial and not too fragile.
Header lockup with AnyuMark still feels balanced.
Hero italic accent remains readable.
CTA and input guidance are unchanged.
No text wrapping regression.
No layout jump.
```

### 4. Result / Demo Result Visual QA

Check:

```text
Large score number still has strong hierarchy.
`/100` numeric treatment remains readable.
NT$49 looks premium, not too thin.
Paid-preview labels and headings are unchanged.
Share/persona mini brand treatment still works.
No card height/layout regression from new font metrics.
```

### 5. Mobile Readability

If a true browser/device pass is available, check:

```text
Header does not feel cramped.
Large numbers do not overflow.
Price numerals remain clear.
No obvious flash/jump from font load.
```

If not, document limitation.

### 6. Funnel Regression

Verify:

```text
landing loads
demo result loads
analyze route works if tested
unlock/contact/LINE panel still appears
LINE CTA still points to https://lin.ee/S6dnbJO
legal footer links remain
```

Do not run excessive analyze calls.

### 7. Source Search

Confirm active source paths do not contain Cormorant as active font.

Allowed:

```text
historical/reference docs may still contain Cormorant
FONT_MIGRATION_v1.1.md may mention Cormorant as before-state
```

Forbidden:

```text
apps/web active token/app layout still loads Cormorant
current docs/design-system/tokens-v1.1.css still uses Cormorant as active --anyu-font-latin
```

## If Issues Are Found

Classify:

```text
font not loading
wrong font still active
wordmark too fragile
large number regression
price readability issue
layout shift / FOUT issue
route/funnel regression
```

Allowed tiny fixes:

```text
font link typo
font token mismatch
test expectation mismatch
minor letter-spacing tweak if obviously needed and localized
```

Do not make broad typography/layout changes.

If visual issue is subjective, document it for human review instead of changing.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-21-font-migration-phase-1-staging-qa-v0.md
```

Required sections:

```markdown
# Font Migration Phase 1 Staging QA v0

Date: 2026-05-21

## 1. Summary

## 2. Deployment Freshness

## 3. Font Loading Verification

## 4. Landing Visual QA

## 5. Result / Demo Result Visual QA

## 6. Mobile / Browser Readability

## 7. Funnel Regression QA

## 8. Source Search Results

## 9. Issues Found

## 10. Fixes Applied

## 11. Remaining Typography Backlog

## 12. Recommendation

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-font-migration-phase-1-staging-qa-v0-execution-report.md
```

Report structure:

```markdown
# Font Migration Phase 1 Staging QA v0 Execution Report

## Summary

## Files Created

## Files Updated

## Deployment Status

## Font QA Results

## Visual QA Results

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
Newsreader
LXGW WenKai
font migration phase 2
font migration phase 3
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
git commit -m "chore: qa latin display font migration"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- font loading verification
- landing/result visual QA summary
- funnel regression result
- fixes applied if any
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
