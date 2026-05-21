# Handoff: Final UI Finishing Pass v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Apply the final narrow UI finishing pass for Module 01 based on the reconciled Claude Design patch and ChatGPT review.

This task should close the remaining UI polish items before the final screenshot review pack.

This is a focused UI polishing task.

Do not restore moon icons.

Do not do a full redesign.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE API, auth, payment, portal, production ops behavior, or product logic.

## Background

The current UI polish line is nearly complete.

Completed:

```text
Brand Mark Selective UI Rollout + QA
Font Migration Phase 1 / Instrument Serif + QA
Font Migration Phase 2 / Newsreader + QA
Font Migration Phase 3 / LXGW WenKai + QA
Conversion / CTA Rhythm Polish + QA
Production low-key launch
```

This task should be based on the reconciliation plan from:

```text
ai-collaboration/research/2026-05-21-claude-patch-reconciliation-final-ui-plan-v0.md
```

If that file is missing, stop and run the reconciliation handoff first.

## Scope

Do:

1. Make landing disabled CTA tone softer.
2. Make landing privacy helper quieter / better layered.
3. Soften inline next-step CTA card tone/border.
4. Make result quote card more intentional.
5. Add insight soft ending line if not already present.
6. Normalize section label treatment with tokenized mono label classes.
7. Apply subtle share/persona card background/layer polish.
8. Lightly refine paid B/C locked hierarchy.
9. Review input privacy helper layering.
10. Tighten result section spacing only where clearly aligned with spec.
11. Add/update tests.
12. Create review bundle and execution report.
13. Commit and push to `origin/staging`.

Do not:

- restore moon icons
- add literal moon phase visual system
- remove AnyuMark direction
- rewrite all product copy
- redesign full result page
- implement image share
- change real payment / fake-door backend
- change LINE behavior
- change legal semantics
- change font system
- change runtime / DB / model
- touch production ops behavior

## Design Principles

Keep the current successful direction:

```text
editorial
warm
premium
slightly mysterious
not SaaS
not too decorative
not hard-sell
not wedding/boutique
```

Use current approved brand system:

```text
AnyuMark / ⋯
Instrument Serif
Newsreader
LXGW WenKai for quote only
Noto Serif TC headings
Noto Sans TC UI clarity
JetBrains Mono labels
```

## Implementation Items

### 1. Landing disabled CTA tone softer

Current issue:

```text
Disabled CTA can feel too dead-gray / broken.
```

Goal:

```text
Disabled CTA should feel gently unavailable, not broken.
```

Suggested direction:

```text
background: warm muted / mist-like
text: readable dim
avoid harsh system-disabled gray
```

Keep disabled behavior unchanged.

### 2. Landing privacy helper quieter

Current issue:

```text
Privacy helper may feel like a warning block and interrupt emotional flow.
```

Goal:

```text
Keep privacy boundary clear but visually quieter.
```

Suggested direction:

```text
lower contrast background
smaller visual weight
preserve copy and legal meaning
do not remove privacy notice
```

### 3. Inline next-step CTA tone softer

Current issue:

```text
The inline CTA is useful but card border can feel too form-like or heavy.
```

Goal:

```text
Make it feel like a gentle next-step prompt.
```

Suggested direction:

```text
softer border
warmer surface
button remains clear
```

Do not remove inline CTA.

### 4. Result quote card

Current issue:

```text
The quote/golden sentence should feel more intentional and less like generic body text.
```

Goal:

```text
Use the existing kai quote system and a soft quote-card treatment.
```

Suggested direction:

```text
mist / warm surface
t-quote or t-kai-quote
small decorative quote mark or AnyuMark only if subtle
```

Do not over-decorate.

### 5. Insight soft ending line

Add or verify an insight soft ending line.

Suggested copy:

```text
「現在最不該做的，是把壓力全部丟到自己身上。」
```

Style:

```text
t-quote / t-kai-quote or subtle serif/kai
dim color
divider above if needed
```

Do not alter main insight meaning.

### 6. Section label consistency

Normalize labels like:

```text
MODULE · 01 · 曖昧溫度計
當前溫度
INSIGHT LAYER
NEXT STEP
MY PERSONA
TEMPERATURE
一次性查看
```

Use tokenized mono label treatment.

Suggested class:

```text
t-label
section-label
section-label--accent / --dim / --faint
```

Do not rewrite label copy unless needed.

### 7. Share/persona card subtle layer polish

Current issue:

```text
Share/persona card is acceptable but can gain a little brand/spiritual layer.
```

Goal:

```text
Improve share-card visual richness without full redesign.
```

Allowed:

```text
subtle cream/gold gradient
very subtle tokenized blob/background
mini AnyuMark/lockup remains
spacing adjustment
```

Not allowed:

```text
heavy stamp treatment
full card redesign
literal moon
overly decorative blobs
```

### 8. Paid B/C locked hierarchy

Current issue:

```text
B/C locked states are clearer now but can be refined.
```

Goal:

```text
Make them read as teaser/locked content, not loading or broken.
```

Allowed:

```text
slight blur refinement
subtle lock/AnyuMark hint
copy adjustment between ⋯ 尚未解鎖 / 開放後可查看
```

Do not fully restructure paywall cards.

### 9. Input privacy helper layering

Review whether input card has enough close-by privacy hint and whether external privacy helper is too loud.

Allowed:

```text
tiny dashed divider
short privacy hint inside input card
quieter outside helper
```

Do not create legal over-explanation.

### 10. Spacing rhythm

Review these without overfitting:

```text
temperature card → quote
quote → signals
signals → insight
insight → next step
```

Make tiny spacing tweaks only if clearly improves rhythm.

## Tests

Add/update tests for:

```text
disabled CTA copy/state remains
privacy helper copy remains present
inline CTA remains
insight soft ending line appears
section label class/text remains
share card still has mini brand treatment
paid locked hints remain
LINE panel still appears
Email fallback remains
```

Avoid brittle visual snapshots.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-final-ui-finishing-pass-v0-review-bundle.md
```

Required sections:

```markdown
# Final UI Finishing Pass v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Reconciliation Plan Used

## 3. Landing Finishing Changes

## 4. Result Quote / Insight Changes

## 5. Section Label Changes

## 6. Share / Persona Changes

## 7. Paid Preview Changes

## 8. Privacy Helper Changes

## 9. Spacing Rhythm Changes

## 10. Files Changed

## 11. Validation Results

## 12. Remaining UI Backlog

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-final-ui-finishing-pass-v0-execution-report.md
```

Report structure:

```markdown
# Final UI Finishing Pass v0 Execution Report

## Summary

## Files Created

## Files Updated

## UI Finishing Changes

## Rejected / Deferred Patch Items

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
- finishing changes summary
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If possible, smoke check:

```text
/m/ambiguous-temperature
/m/ambiguous-temperature/result/demo
```

## Constraints

Do not implement:

```text
moon icon restoration
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
image share / PNG / OG generation
```

Do not modify:

```text
product prompt/schema
DB schema
provider/model
legal semantics
LINE funnel behavior beyond visual/copy tone if already approved
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
git commit -m "design: finish module 01 ui polish"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- finishing changes summary
- rejected/deferred Claude patch items
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
