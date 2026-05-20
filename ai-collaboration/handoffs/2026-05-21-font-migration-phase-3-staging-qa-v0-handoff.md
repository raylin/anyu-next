# Handoff: Font Migration Phase 3 Staging QA v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused staging/browser QA pass for Font Migration Phase 3 — Kai Quote.

This task should verify that LXGW WenKai improves selected quote / whisper surfaces without making the UI too decorative, too hard to read, or visually inconsistent.

This is primarily a QA task.

Do not expand LXGW WenKai to additional surfaces unless a tiny, clearly justified bug fix is needed.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

Font Migration Phase 3: Kai Quote v0 completed.

Commit:

```text
3d7aa7d
```

What changed:

```text
- App now explicitly loads LXGW WenKai via the approved jsDelivr stylesheet.
- Canonical and app token files now include:
  --anyu-font-kai: "LXGW WenKai", "Kaiti TC", "STKaiti", "Noto Serif TC", serif;
- .t-kai and .t-kai-quote were added.
- .t-quote now uses the kai token without forced italic.
- Kai typography was applied only to:
  - result hook quote
  - share-card quote
```

What did not change:

```text
- Long-form Newsreader surfaces unchanged.
- Paid-preview sample reply unchanged.
- Buttons unchanged.
- Contact / LINE / Email panels unchanged.
- Legal pages unchanged.
- General UI/body text unchanged.
- Runtime/model/schema/DB/legal/LINE behavior unchanged.
```

Current font migration status:

```text
Phase 1: Instrument Serif / Latin display — complete + QA passed
Phase 2: Newsreader / editorial reading — complete + QA passed
Phase 3: LXGW WenKai / quote whisper — implemented, staging QA pending
```

## Scope

Do:

1. Confirm staging is serving commit `3d7aa7d` or newer.
2. Verify LXGW WenKai stylesheet is loaded on staging.
3. Verify `.t-quote` / kai typography is scoped to the intended quote surfaces.
4. Verify result hook quote readability and tone.
5. Verify share-card quote readability and tone.
6. Verify kai typography has not spread to UI/body/legal/contact/LINE surfaces.
7. Verify no obvious layout shift, overflow, or FOUT issue.
8. Verify no funnel regression.
9. Document findings.
10. Apply only tiny safe fixes if an obvious bug is found.
11. Commit report and push to `origin/staging`.

Do not:

- expand kai to long-form text
- expand kai to general UI/body
- change Newsreader surfaces
- change Instrument Serif surfaces
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
staging.anyu.tw serves 3d7aa7d or newer
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
LXGW WenKai stylesheet is present.
Instrument Serif still loads.
Newsreader still loads.
Cormorant is not active.
No font files are committed.
```

### 3. Result Hook Quote QA

Check:

```text
Hook quote feels more private / whisper-like.
It is not too decorative.
It remains readable on mobile.
Line height and spacing are stable.
No overflow or awkward wrapping.
No excessive italic/slant is applied.
```

### 4. Share-card Quote QA

Check:

```text
Share-card quote remains readable.
Kai treatment supports social/share mood.
It does not compete with persona/temperature details.
It does not make the card feel too ornamental.
```

### 5. Scope Verification

Confirm kai typography did not spread to:

```text
insight long paragraphs
reassurance long text
paid-preview sample reply
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
No cramped quote lines.
No excessive decorative feel.
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
LXGW WenKai not loading
kai applied too broadly
quote too hard to read
quote too decorative
layout shift / FOUT issue
route/funnel regression
```

Allowed tiny fixes:

```text
font link typo
token mismatch
class scope correction
minor line-height tweak on .t-quote / .t-kai-quote
test expectation update
```

Do not make broad typography/layout changes.

If visual issue is subjective, document it for human review instead of changing.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-21-font-migration-phase-3-staging-qa-v0.md
```

Required sections:

```markdown
# Font Migration Phase 3 Staging QA v0

Date: 2026-05-21

## 1. Summary

## 2. Deployment Freshness

## 3. Font Loading Verification

## 4. Result Hook Quote QA

## 5. Share-card Quote QA

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
ai-collaboration/reports/2026-05-21-font-migration-phase-3-staging-qa-v0-execution-report.md
```

Report structure:

```markdown
# Font Migration Phase 3 Staging QA v0 Execution Report

## Summary

## Files Created

## Files Updated

## Deployment Status

## Font QA Results

## Quote Readability QA Results

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
additional font migration
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
git commit -m "chore: qa kai quote typography"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- font loading verification
- quote readability QA summary
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
