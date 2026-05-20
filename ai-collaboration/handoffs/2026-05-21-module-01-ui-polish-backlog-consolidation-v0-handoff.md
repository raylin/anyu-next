# Handoff: Module 01 UI Polish Backlog Consolidation v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Consolidate the Module 01 UI polish backlog by combining:

1. Claude Design `STAGING_AUDIT_v1.1.md`
2. Claude Design `FONT_MIGRATION_v1.1.md`
3. ChatGPT's previous UI polish / conversion / brand rollout notes
4. The current production low-key launch constraints

This task should produce a prioritized, implementation-ready UI polish backlog.

This is a planning/documentation task only.

Do not implement UI changes in this task.

Do not change app code, runtime, DB, model, legal, LINE, or production behavior.

## Background

Module 01 is now approved for low-key production launch.

Current status:

```text
Production technical gate: passed
Human production smoke: passed
Final launch decision: GO for low-key launch
Ads: not yet
Real payment: not yet
Model: Sonnet default
LINE: notification flow only
```

The user wants to return to UI polish after production readiness work.

Claude Design provided two high-fidelity references:

```text
STAGING_AUDIT_v1.1.md
FONT_MIGRATION_v1.1.md
```

Expected inbox location:

```text
ai-collaboration/inbox/2026-05-21-ui-polish-v1.1/
```

Expected files:

```text
STAGING_AUDIT_v1.1.md
FONT_MIGRATION_v1.1.md
```

If these files are not present there, search for them in the repo or ask for their location.

## Scope

Do:

1. Locate and read `STAGING_AUDIT_v1.1.md`.
2. Locate and read `FONT_MIGRATION_v1.1.md`.
3. Preserve high-fidelity references in a stable reference location if not already preserved.
4. Create a consolidated UI polish backlog.
5. Prioritize into P0 / P1 / P2.
6. Separate planning from implementation.
7. Define the first recommended implementation handoff.
8. Create execution report and summary log.
9. Commit and push to `origin/staging`.

Do not:

- implement UI changes
- change tokens
- migrate fonts
- change components
- change runtime/model/prompt/schema/DB
- change LINE behavior
- change legal content
- change production env
- run production actions
- turn on ads

## Source Files

Primary input files:

```text
ai-collaboration/inbox/2026-05-21-ui-polish-v1.1/STAGING_AUDIT_v1.1.md
ai-collaboration/inbox/2026-05-21-ui-polish-v1.1/FONT_MIGRATION_v1.1.md
```

If files are currently elsewhere, copy them into a stable reference folder:

```text
docs/design-system/reference/ui-polish-v1.1/STAGING_AUDIT_v1.1.md
docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md
```

Do not delete inbox files unless repo policy requires inbox untracked. If inbox is untracked, it is okay to leave it untracked and commit only stable reference copies.

## Key Inputs To Preserve

### From STAGING_AUDIT_v1.1.md

Capture these themes:

```text
- staging is roughly 75% aligned with v1.1
- header lacks new ⋯ brand mark / lockup
- purple solid circles are orphan elements
- new ⋯ system is not yet used in header / loading / share / paywall
- temperature card mostly correct but gradient should use tokens
- signal rows are structurally correct but bars need accent/height alignment
- persona/share card has excess blank space and needs mark/stamp/lockup treatment
- paywall locked cards need clearer locked hint
- loading should use .anyu-loading / animated mark
- favicon / asset wiring should be verified
```

### From FONT_MIGRATION_v1.1.md

Capture these themes:

```text
- shift from Cormorant Garamond to Instrument Serif
- add Newsreader for reading/long-form editorial body
- add LXGW WenKai for Chinese quote / private whisper tone
- keep Noto Serif TC for Chinese headings
- keep Noto Sans TC for UI/body clarity
- keep JetBrains Mono for labels/data
- recommended phased rollout:
  Phase 1: Latin display only
  Phase 2: Newsreader reading body
  Phase 3: LXGW WenKai quotes
```

### From ChatGPT prior notes

Capture these backlog items:

```text
- Result Page CTA Rhythm v0
- LINE Funnel Copy Compression v0
- Share Action Affordance v1
- Paid Preview Hierarchy Polish v0
- Brand Mark Selective UI Rollout v0
- Footer Legal Link Readability Check v0
- Result Summary / Expand Mode
- Desktop Layout Enhancement
```

## Required Output

Create:

```text
ai-collaboration/research/2026-05-21-module-01-ui-polish-backlog-consolidation-v0.md
```

Required sections:

```markdown
# Module 01 UI Polish Backlog Consolidation v0

Date: 2026-05-21

## 1. Summary

## 2. Source Inputs

## 3. Current Product / Launch Context

## 4. Claude Design Audit Summary

## 5. Font Migration Summary

## 6. ChatGPT UI Polish Notes Summary

## 7. Consolidated Backlog

## 8. P0 Items

## 9. P1 Items

## 10. P2 Items

## 11. Font Migration Rollout Plan

## 12. Brand Mark Rollout Plan

## 13. Conversion / CTA Polish Plan

## 14. What Not To Do Yet

## 15. Recommended First Implementation Handoff

## 16. Open Questions

## 17. Recommended Next Step
```

## Backlog Priority Guidance

### P0: Low-risk brand/system alignment

Recommended P0:

```text
1. Header lockup / mark introduction
2. Remove orphan purple circles
3. Loading uses AnyuMark animated system
4. Verify favicon / manifest / app icon wiring
5. Signal bar height/color token alignment
6. Temperature gradient token alignment
```

These are mostly alignment fixes and should not disturb funnel logic.

### P1: Conversion and share polish

Recommended P1:

```text
1. Result Page CTA Rhythm
2. Share / Persona Card spacing and mini lockup
3. Paywall locked hints using ⋯
4. Share Action Affordance v1
5. LINE copy compression
6. Paid Preview hierarchy
```

These affect conversion and should be implemented carefully after P0.

### P2: Larger or later refinements

Recommended P2:

```text
1. Full font migration Phase 2/3
2. Result Summary / Expand Mode
3. Desktop layout enhancement
4. Scheduled retention cleanup before ads
5. LIFF / LINE automation
```

## Font Migration Guidance

Do not recommend a full one-shot font migration.

Recommended phased plan:

### Font Phase 1: Latin Display

```text
- Replace Cormorant Garamond with Instrument Serif.
- Update --anyu-font-latin.
- Keep body typography mostly unchanged.
- Verify wordmark, big numbers, price, score.
```

### Font Phase 2: Editorial Reading

```text
- Add --anyu-font-reading.
- Use Newsreader only in selected long-form / insight surfaces.
- Do not replace UI body globally.
```

### Font Phase 3: Quote / Whisper

```text
- Add --anyu-font-kai.
- Use LXGW WenKai for quotes / private whisper text.
- Verify load/performance and Traditional Chinese rendering.
```

## Brand Mark Rollout Guidance

Do not replace all wordmarks at once.

Recommended first implementation:

```text
Brand Mark Selective UI Rollout v0
```

Scope:

```text
- header lockup / mark introduction
- remove orphan purple circles
- loading animated mark
- persona/share card mini lockup or mark
- optional paywall locked mark hint
```

Do not:

```text
- redesign all cards
- insert mark everywhere
- alter LINE/legal/runtime behavior
```

## Conversion / CTA Guidance

Do not implement this before P0 unless user prefers conversion-first.

Capture for future:

```text
Result Page CTA Rhythm v0
Share Action Affordance v1
LINE Funnel Copy Compression v0
Paid Preview Hierarchy Polish v0
```

## What Not To Do Yet

Must include:

```text
Do not start ads yet.
Do not do a broad public launch.
Do not do a full UI redesign.
Do not replace all typography globally in one pass.
Do not implement LIFF / LINE automation.
Do not switch model.
Do not change DB schema or legal semantics.
```

## Recommended First Implementation Handoff

Recommend:

```text
Brand Mark Selective UI Rollout v0
```

or if the font migration should go first:

```text
Font Migration Phase 1: Latin Display v0
```

Choose one and explain why.

Suggested recommendation:

```text
Brand Mark Selective UI Rollout v0 first, because Claude audit identifies missing mark/orphan purple dots as the main visual-system mismatch and the app already has AnyuMark assets/components ready.
Font migration should follow as a separate phased task.
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-module-01-ui-polish-backlog-consolidation-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 UI Polish Backlog Consolidation v0 Execution Report

## Summary

## Files Created

## Files Updated

## Source Inputs Reviewed

## Backlog Created

## Recommended First Implementation

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
- backlog path
- source files reviewed
- first recommended implementation
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
brand rollout
ads launch
real payment
LINE API
LIFF
email sending
auth
portal
runtime changes
model switch
scheduled deletion job
```

Do not modify:

```text
product prompt/schema
DB schema
provider/model
legal semantics
design system tokens except reference copies if needed
LINE funnel behavior
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

Do not commit font files. Only reference external font sources or docs.

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: consolidate module 01 ui polish backlog"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- backlog path
- source inputs reviewed
- P0/P1/P2 summary
- font migration plan summary
- recommended first implementation
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
