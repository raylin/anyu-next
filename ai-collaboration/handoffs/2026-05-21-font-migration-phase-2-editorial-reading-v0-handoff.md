# Handoff: Font Migration Phase 2: Editorial Reading v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run Font Migration Phase 2 for Module 01 by introducing Newsreader as a selective editorial reading font for long-form result content.

This task should make insight/persona/result explanation text feel more editorial and magazine-like, while preserving UI clarity by keeping Noto Sans TC for general UI/body surfaces.

This is a narrow typography rollout task.

Do not implement LXGW WenKai in this task.

Do not modify quote typography in this task.

Do not change all body text globally.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

Font Migration Phase 1: Latin Display v0 completed and passed QA.

Completed:

```text
- --anyu-font-latin now uses Instrument Serif.
- Active Cormorant Garamond references were removed from current app/source-of-truth paths.
- Wordmark / large numerals / price-like surfaces now use Instrument Serif.
```

Current UI polish status:

```text
Brand Mark Selective UI Rollout: complete and QA passed
Font Migration Phase 1: complete and QA passed
Conversion / CTA Rhythm Polish: complete and QA passed
Production low-key launch: live and acceptable
```

Claude Design font migration source:

```text
docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md
```

Relevant Phase 2 guidance from Claude Design:

```text
Add --anyu-font-reading: Newsreader
Use Newsreader for insight / long-form editorial body
Do not replace Noto Sans TC globally
Keep Noto Serif TC for Chinese headings
Keep Noto Sans TC for UI/body clarity
Keep JetBrains Mono for labels/data
```

## Scope

Do:

1. Read `FONT_MIGRATION_v1.1.md`.
2. Add Newsreader to app font loading.
3. Add `--anyu-font-reading` token to canonical and app token files.
4. Add `.t-reading` and `.t-reading-lg` utility classes.
5. Apply `.t-reading` only to selected long-form result surfaces.
6. Add/update tests.
7. Update docs/reports.
8. Commit and push to `origin/staging`.

Do not:

- add LXGW WenKai
- add `--anyu-font-kai`
- change `.t-quote`
- change all body text globally
- change legal page typography
- change CTA/button/input/contact typography
- change headers to Newsreader
- change runtime/model/DB/LINE/legal/product logic
- implement conversion redesign
- alter production launch status

## Source Fidelity Requirements

Before implementation, read:

```text
docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md
```

Use only Phase 2 guidance:

```text
Phase 2 — Editorial Reading:
- Add --anyu-font-reading.
- Add Newsreader loading.
- Use .t-reading for selected long-form / insight surfaces.
- Do not replace UI body globally.
```

Do not implement Phase 3.

## Font Loading Requirements

Update app font loading to include Newsreader.

Current Phase 1 should already load Instrument Serif.

Add Newsreader only.

Preferred Google Fonts family:

```text
Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400
```

Do not add LXGW WenKai in this phase.

Do not commit font files.

If font loading is centralized in `apps/web/src/app/layout.tsx`, update it there.

## Token Updates

Update canonical:

```text
docs/design-system/tokens-v1.1.css
```

Update app copy:

```text
apps/web/src/styles/tokens.css
```

Add:

```css
--anyu-font-reading: "Newsreader", "Noto Serif TC", serif;
```

Keep:

```css
--anyu-font-serif: "Noto Serif TC", "Songti TC", serif;
--anyu-font-sans: "Noto Sans TC", "PingFang TC", "Inter", system-ui, -apple-system, sans-serif;
--anyu-font-latin: "Instrument Serif", "Noto Serif TC", serif;
--anyu-font-mono: "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
```

Do not add `--anyu-font-kai` yet unless already present and unused; if already present, do not use it.

## Utility Classes

Add to canonical/app token CSS:

```css
.t-reading {
  font: 400 16px/1.75 var(--anyu-font-reading);
  font-variation-settings: "opsz" 16;
  color: var(--anyu-ink);
}

.t-reading-lg {
  font: 400 18px/1.7 var(--anyu-font-reading);
  font-variation-settings: "opsz" 18;
  color: var(--anyu-ink);
}
```

If the app uses CSS modules or component classes rather than utilities, add equivalent scoped classes, but keep token utilities as the source-of-truth pattern.

## Where To Apply

Apply `.t-reading` selectively to long-form result/editorial content only.

Likely surfaces:

```text
Insight body paragraphs
Persona/share card longer explanatory paragraphs
Result explanation paragraphs
Maybe paid-preview visible sample long text if it reads like editorial content
```

Do not apply to:

```text
Buttons
Input helper text
Contact panel copy
Legal pages
Footer links
Labels
Small captions
Mono metadata
Headings
Temperature numeric score
Signal row labels/values
```

If uncertain, leave the surface unchanged and document it as deferred.

## Files Likely To Update

Likely files:

```text
apps/web/src/app/layout.tsx
apps/web/src/styles/tokens.css
docs/design-system/tokens-v1.1.css
docs/design-system/anyu-design-system-v1.1.md
docs/design-system/README.md
apps/web/README.md
apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx
apps/web/src/components/anyu/ShareCardPreview.tsx
apps/web/src/components/anyu/PaidPreviewCard.tsx
apps/web/src/lib/modules/ai-temperature-ui.ts
apps/web/src/tests/ai-temperature-ui.test.ts
```

Only update files actually needed.

## Visual Acceptance

Expected:

```text
Long-form insight paragraphs feel more editorial / literary.
UI does not become harder to scan.
Chinese UI labels remain clear.
No full-page serif-body effect.
No wedding / boutique feel.
No layout overflow from Newsreader metrics.
```

Do not chase perfect typography in this pass; keep it scoped.

## Tests

Add/update tests for:

```text
tokens.css contains --anyu-font-reading: "Newsreader"
Newsreader is included in app font loading path
.t-reading utility exists
selected result surfaces use reading class / reading style
buttons/contact/legal do not use .t-reading
Phase 3 / LXGW WenKai is not active
```

Avoid brittle visual snapshots.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-font-migration-phase-2-editorial-reading-v0-review-bundle.md
```

Required sections:

```markdown
# Font Migration Phase 2: Editorial Reading v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Source Guidance Used

## 3. Font Loading Changes

## 4. Token / Utility Changes

## 5. Surfaces Updated

## 6. Surfaces Not Changed

## 7. Validation Results

## 8. Remaining Font Migration Phases

## 9. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-font-migration-phase-2-editorial-reading-v0-execution-report.md
```

Report structure:

```markdown
# Font Migration Phase 2: Editorial Reading v0 Execution Report

## Summary

## Files Created

## Files Updated

## Font Loading Changes

## Token / Utility Changes

## Surface Application

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
- font migration phase
- surfaces changed
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If font loading or UI classes changed, validate after changes.

If possible, smoke check:

```text
/m/ambiguous-temperature
/m/ambiguous-temperature/result/demo
```

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
general app layout beyond selective reading typography
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

Do not commit font files. Use external font loading / existing font strategy only.

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "design: add editorial reading font"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- font loading changes
- token / utility changes
- surfaces updated
- surfaces intentionally not changed
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
