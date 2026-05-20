# Handoff: Conversion CTA Rhythm Staging QA v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused staging/browser QA pass for Conversion / CTA Rhythm Polish v0.

This task should verify that the new inline CTA, share affordance, paid-preview locked hints, and compressed LINE panel copy improve the result-page flow without making the experience feel pushy, crowded, SaaS-like, or confusing.

This is primarily a QA task.

Do not add new conversion features unless a tiny, obvious bug fix is needed.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE API, auth, payment, portal, production ops behavior, or font migration Phase 2/3.

## Background

Conversion / CTA Rhythm Polish v0 completed.

Commit:

```text
df99f26
```

What changed:

```text
- Added inline result-page CTA:
  想知道下一句怎麼回？
  看下一句怎麼回

- Inline CTA scrolls/reveals existing paid/contact area and reuses the unlock flow.

- Share copy now says:
  複製成 LINE / Threads 可以貼上的文字

- Paid preview now has clearer one-time/no-subscription cues and ⋯ 尚未解鎖 hints.

- LINE panel copy was compressed to reduce repeated explanation.

- paid_unlock_clicked event remains, with safe source metadata:
  inline_result_cta
  paid_preview

- Vitest now runs .test.tsx render tests.
```

No changes were made to:

```text
runtime
model
schema
DB
legal semantics
LINE API / LIFF
payment
auth
portal
font migration Phase 2/3
image share / PNG / OG
```

User direction:

```text
Keep polishing UI before ads/admin launch.
Avoid large UI changes after traffic starts because it raises regression risk and makes funnel data inconsistent.
```

## Scope

Do:

1. Confirm staging is serving commit `df99f26` or newer.
2. QA the inline result CTA rhythm on demo result and if practical a real runtime result.
3. Verify click/scroll/reveal behavior to paid/contact area.
4. Verify paid unlock event source metadata if safely inspectable.
5. QA share affordance copy and success state.
6. QA paid preview hierarchy and locked hints.
7. QA LINE panel compressed copy and Email fallback.
8. Verify no regression to analyze/result/unlock/LINE flow.
9. Document findings.
10. Apply only tiny safe fixes if an obvious bug is found.
11. Commit report and push to `origin/staging`.

Do not:

- add sticky CTA
- add real payment
- change fake-door backend behavior
- change LINE API / LIFF / webhook
- implement image share
- implement font Phase 2/3
- redesign result page
- change production launch status
- start ads
- change DB/schema/runtime

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
staging.anyu.tw serves df99f26 or newer
```

Suggested checks:

```bash
git fetch origin
git log --oneline -5 origin/staging
vercel inspect https://staging.anyu.tw
```

### 2. Inline CTA Rhythm

Check:

```text
Inline CTA appears after an appropriate amount of free-result context.
It does not feel too early, pushy, or ad-like.
Copy reads naturally:
  想知道下一句怎麼回？
  看下一句怎麼回
Button tap/activation scrolls or reveals paid/contact area naturally.
Scroll target lands in a useful position, not too high/low.
No duplicate paid panels or confusing repeated CTAs.
```

### 3. Event / Metadata

If safely inspectable, verify:

```text
paid_unlock_clicked source = inline_result_cta when inline CTA is used
paid_unlock_clicked source = paid_preview when paid-preview CTA is used
```

Privacy:

```text
No raw input
No email
No LINE ID
No full result JSON
No provider raw output
```

If direct DB/event inspection is not available, document limitation.

### 4. Share Affordance

Check:

```text
Share action feels like a real secondary action.
Copy is clear:
  分享這個結果
  複製成 LINE / Threads 可以貼上的文字
Success state is clear:
  已複製，可以貼到 LINE / Threads
Native share / clipboard fallback still works if practical.
It does not compete too much with paid/LINE conversion.
```

### 5. Paid Preview Hierarchy

Check:

```text
A card remains the visible sample.
B/C locked hints with ⋯ 尚未解鎖 feel clear, not like loading.
Locked cards are not overly blurred or confusing.
NT$49 / one-time / no-subscription relationship is clear.
Fake-door no-real-charge note is still visible.
```

### 6. LINE Panel Copy

Check:

```text
LINE panel copy feels shorter and less repetitive.
Main action remains clear:
  加入 LINE，收到開放通知
No copy promises immediate complete-analysis delivery.
Email fallback remains visible but secondary.
hello@anyu.tw deletion/support note remains if applicable.
```

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
Email fallback opens/submits synthetic email if tested
legal footer links remain
```

Do not run excessive analyze calls.

### 8. Mobile Feel

If human/device browser is available, check:

```text
Inline CTA is not too close to top.
Tap target is comfortable.
Scroll/reveal does not feel jarring.
Paid area lands in view.
Share and LINE buttons are not visually competing.
```

If true interactive browser/device is not available, document limitation.

## If Issues Are Found

Classify:

```text
inline CTA too early
inline CTA too pushy
scroll target issue
duplicate CTA confusion
share button too weak/too strong
locked hint unclear
LINE copy still repetitive
event source issue
funnel regression
```

Allowed tiny fixes:

```text
copy tweak
spacing tweak
scroll target adjustment
source metadata bug
test assertion update
minor CSS correction
```

Do not do broad redesigns.

If issue is subjective, document it for human review.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-21-conversion-cta-rhythm-staging-qa-v0.md
```

Required sections:

```markdown
# Conversion CTA Rhythm Staging QA v0

Date: 2026-05-21

## 1. Summary

## 2. Deployment Freshness

## 3. Inline CTA Rhythm QA

## 4. Event / Metadata Verification

## 5. Share Affordance QA

## 6. Paid Preview Hierarchy QA

## 7. LINE Panel Copy QA

## 8. Funnel Regression QA

## 9. Mobile / Browser Feel

## 10. Issues Found

## 11. Fixes Applied

## 12. Remaining Conversion Backlog

## 13. Recommendation

## 14. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-conversion-cta-rhythm-staging-qa-v0-execution-report.md
```

Report structure:

```markdown
# Conversion CTA Rhythm Staging QA v0 Execution Report

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
image share / PNG / OG generation
```

Do not modify:

```text
product prompt/schema
DB schema
provider/model
legal semantics
LINE funnel behavior beyond tiny copy/QA fix
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

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "chore: qa result conversion rhythm"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- inline CTA QA result
- share QA result
- paid preview QA result
- LINE panel QA result
- funnel regression result
- fixes applied if any
- validation results
- report path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
