# Handoff: Brand Mark Selective UI Staging QA v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused staging/browser QA pass for the Brand Mark Selective UI Rollout v0.

This task should verify that the selective AnyuMark rollout improves brand consistency without making the UI feel crowded, overly logo-heavy, or visually unstable.

This is primarily a QA task.

Do not implement new UI polish unless a tiny, obvious bug is found.

Do not start font migration.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, or production ops behavior.

## Background

Brand Mark Selective UI Rollout v0 completed.

Commit:

```text
311c14b
```

What changed:

```text
- Module 01 landing header now uses selective AnyuMark lockup.
- Result header now uses selective AnyuMark lockup.
- Loading state now uses animated AnyuMark.
- Share/persona surface now includes subtle mini brand treatment.
- Old purple orb in TemperatureCard removed.
- Old share dot in ShareCardPreview removed.
- Temperature gradient aligned to accent2 → rose → accent.
- Signal bars aligned to v1.1 token direction.
```

No changes were made to:

```text
font migration
runtime
model
schema
DB
legal
LINE
payment
auth
portal
```

Recommended next step from review:

```text
Brand Mark Selective UI Staging QA v0
```

## Scope

Do:

1. Confirm staging is serving commit `311c14b` or newer.
2. Verify landing header with AnyuMark lockup.
3. Verify result header with AnyuMark lockup.
4. Verify loading state with animated AnyuMark.
5. Verify TemperatureCard after purple orphan orb removal.
6. Verify ShareCardPreview after purple dot removal and mini brand treatment.
7. Verify signal bars and temperature gradient feel aligned and readable.
8. Verify favicon/manifest/app icons remain present.
9. Verify no regression to analyze/result/unlock/LINE flow.
10. Document findings.
11. Apply only tiny safe fixes if there is an obvious bug.
12. Commit report and push to `origin/staging`.

Do not:

- do font migration
- redesign result page
- change CTA rhythm
- change paywall hierarchy
- add stamp treatment
- change legal/LINE copy
- change app behavior
- switch model
- touch production unless route health check is explicitly needed and read-only

## Staging URLs

Use:

```text
https://staging.anyu.tw/m/ambiguous-temperature
https://staging.anyu.tw/m/ambiguous-temperature/result/demo
```

If needed, run one synthetic analyze flow on staging:

```text
他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
```

Do not use real private content.

## QA Checklist

### 1. Deployment Freshness

Verify:

```text
staging.anyu.tw serves 311c14b or newer
```

Suggested checks:

```bash
git fetch origin
git log --oneline -5 origin/staging
vercel inspect https://staging.anyu.tw
```

### 2. Landing Header

Check:

```text
AnyuMark is visible but not overpowering.
Wordmark / text brand remains readable.
Header does not feel cramped on mobile.
Spacing is stable.
No layout jump.
```

### 3. Result Header

Check:

```text
AnyuMark lockup is consistent with landing.
Back/retry action remains clear.
Header does not steal attention from result score.
```

### 4. Loading State

Check:

```text
Animated AnyuMark appears during analysis.
Existing elapsed-time wait copy remains.
Focus/scroll-to-loading still works.
Reduced-motion behavior remains safe if inspectable.
No layout jump.
```

If true interactive browser is not available, verify bundle/source and document limitation.

### 5. Temperature Card

Check:

```text
Purple orphan orb is gone.
Temperature card still feels balanced, not empty.
42 /100 hierarchy remains strong.
Temperature gradient uses softer tokenized colors and remains readable.
COLD / WARM / HOT labels still readable.
```

### 6. Signal Rows

Check:

```text
Signal bars are readable.
Bar height feels intentional, not too thin.
Default fill color aligns with ANYU accent.
Hints remain readable.
```

### 7. Share / Persona Card

Check:

```text
Purple share dot is gone.
Mini brand treatment improves brand recall.
Mini brand does not compete with persona text.
Share card does not feel unfinished or too empty after dot removal.
Share button still works.
```

### 8. Favicon / Manifest / Icons

Verify:

```text
/favicon.svg loads
/manifest.webmanifest loads if public
icon-192.png exists
icon-512.png exists
apple-touch-icon.png exists
```

### 9. Funnel Regression

Verify:

```text
landing loads
analyze still works if tested
result route loads
unlock opens
LINE-first panel still appears
LINE CTA href remains https://lin.ee/S6dnbJO
Email fallback remains available
legal footer links still exist
```

Do not run excessive production/staging analyze calls.

## If Issues Are Found

Classify:

```text
brand lockup too crowded
brand mark too subtle
loading regression
share card visual imbalance
temperature card visual imbalance
signal/gradient readability issue
favicon/manifest issue
funnel regression
```

Allowed tiny fixes:

```text
spacing tweak
mark size tweak
CSS token usage correction
missing aria-label
wrong class
favicon/manifest link fix
```

Do not make broader UI redesigns.

If the issue is subjective or larger, document it as backlog instead.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-21-brand-mark-selective-ui-staging-qa-v0.md
```

Required sections:

```markdown
# Brand Mark Selective UI Staging QA v0

Date: 2026-05-21

## 1. Summary

## 2. Deployment Freshness

## 3. Landing Header QA

## 4. Result Header QA

## 5. Loading State QA

## 6. Temperature Card QA

## 7. Signal / Gradient QA

## 8. Share / Persona Card QA

## 9. Favicon / Manifest QA

## 10. Funnel Regression QA

## 11. Issues Found

## 12. Fixes Applied

## 13. Remaining UI Polish Backlog

## 14. Recommendation

## 15. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-brand-mark-selective-ui-staging-qa-v0-execution-report.md
```

Report structure:

```markdown
# Brand Mark Selective UI Staging QA v0 Execution Report

## Summary

## Files Created

## Files Updated

## Deployment Status

## QA Results

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
font migration
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

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "chore: qa selective brand mark rollout"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- QA result summary
- landing/result header status
- loading status
- temperature/share/signal status
- fixes applied if any
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
