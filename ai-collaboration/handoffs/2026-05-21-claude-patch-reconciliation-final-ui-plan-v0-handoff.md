# Handoff: Claude Patch Reconciliation + Final UI Finishing Plan v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Reconcile Claude Design's latest polish patch with the current ANYU v1.1 implementation, the AnyuMark brand direction, and the completed typography migration.

This task should produce a balanced implementation plan for the final UI finishing pass.

This is a planning / reconciliation task only.

Do not implement UI changes in this task.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

The user wants to finish the current UI polish line while the design context is still fresh, then produce final screenshots for ChatGPT and Claude Design review.

Completed UI polish work:

```text
Brand Mark Selective UI Rollout: complete + QA passed
Font Migration Phase 1: Instrument Serif Latin Display complete + QA passed
Font Migration Phase 2: Newsreader Editorial Reading complete + QA passed
Font Migration Phase 3: LXGW WenKai Quote complete + QA passed
Conversion / CTA Rhythm Polish: complete + QA passed
Production low-key launch: live and acceptable
```

Relevant source/reference files:

```text
docs/design-system/reference/ui-polish-v1.1/STAGING_AUDIT_v1.1.md
docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md
```

New user-provided Claude Design patch should be preserved and read from the inbox if present, or copied into a stable reference path.

Expected source:

```text
ai-collaboration/inbox/2026-05-21-ui-polish-v1.1/POLISH_PATCH_v1.1.md
```

If the file has a different name, locate the uploaded markdown patch content and preserve it under:

```text
docs/design-system/reference/ui-polish-v1.1/POLISH_PATCH_v1.1.md
```

## Important Reconciliation Decision

Claude's patch refers to restoring `moon` icons as a brand-signature element.

Do **not** implement moon icons as the primary brand symbol.

Current approved brand direction is:

```text
AnyuMark three-dot ⋯ system is the canonical ANYU brand mark.
Moon/crescent ornaments from earlier iterations should not return as primary brand language.
```

Interpret Claude's moon-icon request as:

```text
The surface needs a stronger brand/spiritual accent.
```

Translate that into:

```text
AnyuMark / mini lockup / subtle tokenized glow
```

not literal moon icon restoration.

## Scope

Do:

1. Locate and preserve the Claude Design polish patch.
2. Read the patch together with existing STAGING_AUDIT and FONT_MIGRATION docs.
3. Create a reconciliation table for every patch item.
4. Classify each item as:
   - Already Done
   - Adopt
   - Adapt to AnyuMark
   - Defer
   - Reject due to conflict
5. Produce a final implementation plan for the next handoff.
6. Keep the plan narrow and safe.
7. Create report, execution report, and summary log.
8. Commit and push to `origin/staging`.

Do not:

- implement UI changes
- restore moon icons
- reverse AnyuMark direction
- revert Instrument Serif / Newsreader / LXGW WenKai
- change product copy broadly
- change runtime/model/DB/LINE/legal
- start ads
- change production launch status

## Reconciliation Guidance

### Items likely to adopt

Adopt or adapt these:

```text
- Result quote card should feel more like a quote / golden sentence card.
- Insight card should have a soft italic/kai ending line.
- Section labels should be consistently mono and token-colored.
- Share/persona card can receive subtle background/layer polish.
- Paid preview locked hierarchy can be made clearer.
- Input privacy helper can be better layered.
- Some spacing rhythm can be tightened.
```

### Items to adapt, not adopt literally

Adapt these to the current system:

```text
- Moon icon requests → AnyuMark / mini lockup / glow.
- Old serif italic quote specs → current LXGW WenKai / t-quote system.
- Cormorant references → Instrument Serif where Latin display is intended.
- “Moon phase corresponding to temperature” → avoid unless explicitly re-approved; temperature can use current gradient + AnyuMark accent.
```

### Items likely to reject

Reject or defer these:

```text
- Literal moon icon restoration.
- Large share-card redesign that fights the current AnyuMark system.
- Rewriting all copy if current copy is already approved.
- Major paywall layout rewrite.
- Full-page visual redesign.
```

## Required Output

Create:

```text
ai-collaboration/research/2026-05-21-claude-patch-reconciliation-final-ui-plan-v0.md
```

Required sections:

```markdown
# Claude Patch Reconciliation + Final UI Finishing Plan v0

Date: 2026-05-21

## 1. Summary

## 2. Source Inputs

## 3. Current UI State

## 4. Reconciliation Principle

## 5. Patch Item Reconciliation Table

## 6. Items Already Completed

## 7. Items To Adopt

## 8. Items To Adapt To AnyuMark

## 9. Items To Defer

## 10. Items To Reject

## 11. Final UI Finishing Pass Scope

## 12. What Must Not Change

## 13. Risks

## 14. Recommended Implementation Handoff

## 15. Recommended Next Step
```

## Patch Item Reconciliation Table

Create a table like:

```markdown
| Claude Patch Item | Decision | Final Interpretation | Implementation Task |
|---|---|---|---|
| Moon icon in header | Adapt to AnyuMark | Use approved AnyuMark/lockup; do not restore moon | Already mostly done / maybe tune |
| Share card background/blob | Adopt lightly | Add subtle cream/gold layering, avoid full redesign | Final UI Finishing |
| Quote card | Adopt | Make quote card more intentional with t-quote/kai | Final UI Finishing |
```

## Recommended Final Implementation Scope

The plan should recommend a final implementation handoff with these narrow items:

```text
1. Landing disabled CTA tone softer.
2. Landing privacy helper quieter / better hierarchy.
3. Inline next-step CTA card border/tone softer.
4. Result quote card more intentional.
5. Insight soft ending line.
6. Section label token consistency.
7. Share/persona card subtle background/layer polish.
8. Paid B/C locked hierarchy small refinement.
9. Input privacy helper layering review.
10. Spacing rhythm review for result sections.
```

Do not include:

```text
moon icon restoration
full share-card redesign
font migration
runtime changes
LINE changes
legal semantics changes
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-claude-patch-reconciliation-final-ui-plan-v0-execution-report.md
```

Report structure:

```markdown
# Claude Patch Reconciliation + Final UI Finishing Plan v0 Execution Report

## Summary

## Files Created

## Files Updated

## Source Inputs Reviewed

## Reconciliation Decisions

## Recommended Final UI Scope

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
- reconciliation plan path
- source inputs reviewed
- recommended final implementation
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

Docs-only, but validation should still pass.

## Constraints

Do not implement:

```text
UI changes
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

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: reconcile final ui polish patch"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- reconciliation plan path
- source inputs reviewed
- moon/AnyuMark decision
- final implementation scope
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
