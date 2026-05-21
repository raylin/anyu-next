# Handoff: Module 01 Final UI Screenshot Review Pack v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Create the final UI screenshot review pack for Module 01 — 曖昧溫度計 — after the completed UI polish sequence.

This task should prepare review artifacts for ChatGPT and Claude Design to evaluate the final staging UI against the approved ANYU v1.1 design system, brand mark, typography migration, conversion polish, Claude patch reconciliation, and final UI finishing pass.

This is primarily a QA / review packaging task.

Do not implement new UI changes unless a tiny, obvious bug blocks screenshot/review capture.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

The user wants to complete all UI polish tasks while design context is still fresh, then provide final screenshots to ChatGPT and Claude Design for review.

Completed / expected completed UI work:

```text
Design System v1.1 adoption
ANYU Brand Mark v1.1 adoption
Brand mark asset export
Brand Mark Selective UI Rollout + QA
Font Migration Phase 1: Instrument Serif + QA
Font Migration Phase 2: Newsreader + QA
Font Migration Phase 3: LXGW WenKai + QA
Conversion / CTA Rhythm Polish + QA
Claude Patch Reconciliation + Final UI Finishing Plan
Final UI Finishing Pass
```

Reference docs:

```text
docs/design-system/brand/anyu-brand-mark-v1.1.md
docs/design-system/reference/ui-polish-v1.1/STAGING_AUDIT_v1.1.md
docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md
ai-collaboration/research/2026-05-21-claude-patch-reconciliation-final-ui-plan-v0.md
ai-collaboration/research/2026-05-21-module-01-ui-polish-backlog-consolidation-v0.md
```

Expected latest finishing report:

```text
ai-collaboration/reports/2026-05-21-final-ui-finishing-pass-v0-execution-report.md
ai-collaboration/research/2026-05-21-final-ui-finishing-pass-v0-review-bundle.md
```

If the Final UI Finishing Pass report is not present yet, wait or document that the review pack is based on the latest available staging build.

## Scope

Do:

1. Confirm staging is serving the latest final UI finishing commit or document if not.
2. Create a final screenshot/review checklist.
3. Capture screenshots if tool/browser access allows.
4. If screenshots cannot be captured reliably, create an exact manual screenshot checklist for the user.
5. Verify key routes and surfaces.
6. Map final UI against Claude Design audit / patch items.
7. Document remaining minor backlog, if any.
8. Create review pack, execution report, and summary log.
9. Commit and push to `origin/staging`.

Do not:

- implement new UI polish
- change typography
- restore moon icons
- change brand direction
- alter LINE flow
- alter legal text
- change runtime/model/DB
- start ads
- change production status
- add Playwright tests in this task

## Review Targets

Use staging as the review target:

```text
https://staging.anyu.tw/m/ambiguous-temperature
https://staging.anyu.tw/m/ambiguous-temperature/result/demo
```

If a runtime result is needed, use synthetic input only:

```text
他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
```

Do not use real private content.

## Screenshot Checklist

Create a checklist for the following screens/states.

### 1. Landing / first screen

Capture/check:

```text
desktop-ish full view if available
mobile viewport 390x844 or 430x932 if available
header with AnyuMark / wordmark
hero title with editorial font treatment
input card
input guidance / progress
privacy helper
chips
CTA states
footer legal links if visible
```

### 2. Loading state

Capture/check if possible:

```text
animated AnyuMark loading
elapsed wait-state copy
focus/scroll behavior
no old moon/dot ornament
no layout jump
```

If hard to capture, document manual capture instruction.

### 3. Result top / temperature

Capture/check:

```text
result header
temperature card
score
tokenized gradient
no orphan purple dot
quote card
section labels
```

### 4. Signals + Insight

Capture/check:

```text
signal rows
bar height/color
hints
Insight Layer
Newsreader long-form surfaces
LXGW WenKai quote/soft ending if present
spacing rhythm
```

### 5. Inline CTA / next step

Capture/check:

```text
想知道下一句怎麼回？
看下一句怎麼回
scroll/reveal target if practical
tone not too pushy
border/tone after final finishing
```

### 6. Share / Persona card

Capture/check:

```text
mini AnyuMark / lockup
share/persona quote
share-card background/layer polish
no orphan purple dot
share action button
copy for LINE / Threads
```

### 7. Paid preview

Capture/check:

```text
A/B/C cards
A visible sample
B/C locked hints
NT$49
one-time/no-subscription cues
CTA
no real payment claim
```

### 8. LINE / Email panel

Capture/check:

```text
LINE-first copy
primary LINE CTA
Email fallback
hello@anyu.tw support/deletion line if present
no immediate complete-analysis promise
```

### 9. Legal / footer

Capture/check:

```text
footer links
/privacy
/terms
/disclaimer
/legal if applicable
```

### 10. Desktop / wide layout

If available, capture:

```text
landing wide
result wide
full-page result screenshot
```

This is optional because product is mobile-first.

## Claude Audit / Patch Mapping

Create a table mapping final status:

```markdown
| Item | Final Status | Evidence / Route | Notes |
|---|---|---|---|
| Header brand mark | Done | landing/result header | AnyuMark not moon |
| Purple orphan circles | Done | temp/share cards | removed |
| Loading mark | Done | loading state | animated AnyuMark |
| Font Phase 1 | Done | wordmark/numerals | Instrument Serif |
| Font Phase 2 | Done | insight long text | Newsreader |
| Font Phase 3 | Done | quote surfaces | LXGW WenKai |
| Inline CTA | Done | result page | next-step CTA |
| Share affordance | Done | share card | LINE/Threads copy |
| LINE panel compression | Done | contact area | no immediate delivery promise |
| Moon restoration | Rejected | brand decision | adapted to AnyuMark |
```

## QA Checks

Verify:

```text
staging route health
demo result route health
optional synthetic analyze
unlock path if practical
LINE CTA target remains https://lin.ee/S6dnbJO
Email fallback still present
no obvious visual regression
```

Do not run excessive analyze calls.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-21-module-01-final-ui-screenshot-review-pack-v0.md
```

Required sections:

```markdown
# Module 01 Final UI Screenshot Review Pack v0

Date: 2026-05-21

## 1. Summary

## 2. Review Target

## 3. Latest UI State / Commit

## 4. Screenshot Checklist

## 5. Screenshots Captured

## 6. Manual Screenshot Instructions

## 7. Claude Audit / Patch Mapping

## 8. Design System Alignment

## 9. Typography Alignment

## 10. Conversion / CTA Alignment

## 11. LINE / Legal / Trust Alignment

## 12. Issues Found

## 13. Remaining Minor Backlog

## 14. Recommendation

## 15. Recommended Next Step
```

If screenshots are generated and committed, include file paths.

Suggested screenshot folder:

```text
ai-collaboration/research/screenshots/2026-05-21-module-01-final-ui/
```

If screenshots cannot be generated, include manual instructions instead and do not fake screenshots.

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-module-01-final-ui-screenshot-review-pack-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Final UI Screenshot Review Pack v0 Execution Report

## Summary

## Files Created

## Files Updated

## Review Target

## Screenshots / Manual Capture Status

## Audit Mapping Status

## QA Results

## Issues Found

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
- review pack path
- screenshot status
- QA result summary
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If only reports/screenshots are created, still run validation.

If screenshots are generated, ensure no secrets/private input are visible beyond approved synthetic/demo content.

## Constraints

Do not implement:

```text
new UI changes
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
image share / PNG / OG generation
Playwright test suite
```

Do not modify:

```text
product prompt/schema
DB schema
provider/model
legal semantics
LINE funnel behavior
production ops behavior
general app UI
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

Use only demo/synthetic data in screenshots.

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: prepare final ui screenshot review pack"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- review pack path
- screenshot/manual capture status
- audit mapping status
- QA results
- issues found
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
