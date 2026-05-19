# Handoff: ANYU Design System v1.1 Adoption + Staging Reapplication v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Adopt the new Claude Design v1.1 files as the canonical ANYU design system and reapply the staging UI according to the stricter v1.1 rules.

This task should preserve the uploaded design files as faithfully as possible, place them in stable repo locations, update app tokens, and fix staging UI drift by following the new v1.1 component rules.

This is a design-system adoption + controlled UI reapplication task.

Do not treat this as a free redesign.

Do not change product runtime, provider, model, prompt/schema, DB schema, auth, payment, or portal scope.

## User Context

The user wants to preserve the Claude Design v1.1 outputs as much as possible and use them as the new design baseline.

Uploaded design files to incorporate:

```text
DESIGN_SYSTEM_v1.1.md
UX_FLOW.md
anyu-tokens-v1.1.css
handoff.html
design-canvas.jsx
ui.jsx
screens.jsx
reference.jsx
audit.jsx
ios-frame.jsx
```

The user also noted staging currently diverges from the intended visual direction:

- observed signal cards are still unreadable
- paid preview cards have low contrast
- loading status panel looks inconsistent
- button/chip contrast has been unstable
- local CSS fixes are drifting from the intended Claude Design direction

## Recommended Repo Placement

Store the files as follows.

### Canonical design docs

```text
docs/design-system/anyu-design-system-v1.1.md
docs/design-system/ux-flow-v1.1.md
docs/design-system/tokens-v1.1.css
```

These are the canonical engineering source of truth.

### Current stable app token copy

```text
apps/web/src/styles/tokens.css
```

This should be synced from:

```text
docs/design-system/tokens-v1.1.css
```

Keep the file name `tokens.css` inside the app so imports do not need broad rewiring.

### High-fidelity reference bundle

```text
docs/design-system/reference/v1.1/handoff.html
docs/design-system/reference/v1.1/design-canvas.jsx
docs/design-system/reference/v1.1/ui.jsx
docs/design-system/reference/v1.1/screens.jsx
docs/design-system/reference/v1.1/reference.jsx
docs/design-system/reference/v1.1/audit.jsx
docs/design-system/reference/v1.1/ios-frame.jsx
```

These files are reference-only and should not be imported by the production app.

### Optional archived v1.0 docs

If existing v1.0 files exist:

```text
docs/design-system/anyu-design-system-v1.md
docs/design-system/tokens.css
```

Do not delete them. Either:

1. leave them as historical files, or
2. move/copy them to:

```text
docs/design-system/archive/v1.0/
```

Only move if safe and references are updated. Otherwise leave them in place and clearly document that v1.1 supersedes v1.0.

## Design System Source-of-Truth Rule

Update `docs/design-system/README.md` to say:

```text
ANYU Design System v1.1 is the current implementation source of truth.

Canonical:
- docs/design-system/anyu-design-system-v1.1.md
- docs/design-system/ux-flow-v1.1.md
- docs/design-system/tokens-v1.1.css

App copy:
- apps/web/src/styles/tokens.css

Reference-only high-fidelity files:
- docs/design-system/reference/v1.1/

When v1.1 tokens change, update docs/design-system/tokens-v1.1.css first, then sync apps/web/src/styles/tokens.css.
```

Also update root README or apps/web README if they currently refer to v1.0 as canonical.

## Important v1.1 Rules To Enforce

Read the v1.1 design docs before editing UI.

Follow these rules strictly:

1. v1.1 replaces v1.0 as engineering source of truth.
2. Token pairing is mandatory.
3. Premium feeling must come from typography, spacing, letter-spacing, and composition, not low contrast.
4. No pale text on light cards.
5. If a card uses a light surface, text must use dark ink tokens.
6. If text is light, the card must stay dark.
7. Default chip uses surface background + ink text.
8. Active chip uses solid accent background + surface text.
9. Observed signals must not be rendered as pale text inside light cards.
10. Paid preview Card A should be a dark readable sample; B/C should be light locked cards where only body is blurred, not titles/labels.
11. Loading should match the v1.1 loading language and should not use the current visually inconsistent light status panel.
12. Do not use inline arbitrary hex/color/font-family if tokens/utilities exist.

## Staging Drift To Fix

Use the current staging problems and v1.1 audit as the implementation target.

### 1. Observed Signals

Current problem:

- signal cards are still hard to read
- previous light card approach made them worse

v1.1 target:

- signals should be a clear list treatment, not pale text on light cards
- labels/value/hints must be readable
- if using the v1.1 spec exactly, signals are not wrapped in individual white cards; they sit as rows with ink text and clear bars

Implement the closest practical production UI following v1.1.

### 2. Paid Preview Cards

Current problem:

- readable preview card is low contrast
- paid sample looks like disabled/washed out content

v1.1 target:

- Card A = dark surface with readable `ink-onDark`
- B/C = light locked cards
- only body is blurred/locked, not label/title
- price and CTA follow v1.1 contrast rules

### 3. Loading State

Current problem:

- rotating loading text works, but the status panel feels visually inconsistent

v1.1 target:

- loading should use the same visual language
- moon / dot pulse / tip-card approach if practical
- no technical spinner
- no exact time promise unless the app actually meets it

If full-screen loading is too large a change for this task, at minimum redesign the inline loading panel to use v1.1 dark/light pairings and consistent typography.

### 4. Chips / CTA

Current target:

- default chip = surface bg + ink text
- active chip = solid accent bg + surface text
- CTA = ink-dark bg + ink-onDark text, or accent bg + ink-dark text for accent CTA
- disabled state visually clear but not confused with unselected chips

### 5. Typography / Token Usage

Ensure:

- serif for hero / quote / persona / CTA / important emotional text
- sans for body / form / chips
- latin italic for numbers and price
- mono uppercase tracking for labels
- no arbitrary inline colors or font families unless unavoidable and documented

## Implementation Steps

### Step 1: Copy uploaded files into repo

Copy uploaded files from the working input location into the recommended repo paths.

Preserve file contents as much as possible.

If exact uploaded files are available in the Codex workspace, copy them directly. If not, ask the user for the files or stop and report missing inputs.

### Step 2: Update docs

Update:

```text
docs/design-system/README.md
README.md
apps/web/README.md
```

as needed to reference v1.1 as current canonical design system.

Do not remove v1.0 unless explicitly safe.

### Step 3: Sync tokens

Replace app token copy:

```text
apps/web/src/styles/tokens.css
```

with the v1.1 token file content, while preserving any required app-specific imports if needed.

If app relies on old token names, either:

- adapt app CSS/components to v1.1 token names, or
- keep compatibility aliases with a clear comment.

Do not silently keep stale v1.0 token values.

### Step 4: Reapply v1.1 to components

Update the current Module 01 UI to follow v1.1:

Likely files:

```text
apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx
apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx
apps/web/src/components/anyu/InputCard.tsx
apps/web/src/components/anyu/SituationChips.tsx
apps/web/src/components/anyu/Button.tsx
apps/web/src/components/anyu/ShareCardPreview.tsx
apps/web/src/components/anyu/ContactCapture.tsx
apps/web/src/components/anyu/TemperatureCard.tsx
apps/web/src/styles/globals.css
apps/web/src/lib/modules/ai-temperature-ui.ts
apps/web/src/tests/ai-temperature-ui.test.ts
```

Only edit files that are necessary.

### Step 5: Add design drift guard notes/tests if practical

At minimum add docs notes.

If easy, add tests or lint-like assertions for:

- share text does not include raw input
- module UI helper still outputs expected labels
- token file contains v1.1 required tokens:
  - `--anyu-ink-dark`
  - `--anyu-ink-onDark`
  - `--anyu-dim-onDark`
  - `--anyu-line-onDark`

Do not add heavy custom lint infra in this task unless trivial.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-anyu-design-system-v1-1-adoption-review-bundle.md
```

Required sections:

```markdown
# ANYU Design System v1.1 Adoption Review Bundle

## 1. Summary

## 2. Files Adopted

## 3. New Canonical Design Locations

## 4. Token Sync Result

## 5. Staging Drift Fixed

## 6. Component Changes

## 7. Remaining Drift / Not Yet Implemented

## 8. Validation Results

## 9. Staging Smoke Result

## 10. Issues For ChatGPT Review
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-anyu-design-system-v1-1-adoption-execution-report.md
```

Report structure:

```markdown
# ANYU Design System v1.1 Adoption + Staging Reapplication v0 Execution Report

## Summary

## Files Created

## Files Updated

## Design Files Adopted

## Token Sync

## Staging UI Reapplication

## Validation Results

## Staging Push

## Known Technical Debt

## Deviations From Handoff

## Git Commit

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
- design system v1.1 adopted
- canonical paths
- app token sync path
- staging UI summary
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

After push/deploy, if possible, verify staging quickly:

```text
https://staging.anyu.tw/m/ambiguous-temperature
```

Check:

- landing loads
- chips readable
- analyze still works or demo route loads
- observed signals readable
- paid preview readable
- loading state no longer looks inconsistent
- no runtime/model/provider breakage

## Constraints

Do not implement:

```text
auth
real payment
portal
share PNG / OG generation
email sending
LINE integration
advanced PII
scheduled deletion job
model switch to Haiku
```

Do not modify:

```text
product prompt/schema content
DB schema
provider architecture
legacy prototype behavior
Dcard scripts
```

Exception:

- Copying design reference prompt/schema-like visual docs is allowed.
- App-local visual/design files may be updated.

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
raw private user content
raw DB row dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "design: adopt ANYU design system v1.1"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if:

- validation failed
- unrelated uncommitted changes exist
- secrets are staged
- raw user content is staged
- QA report contains secrets or raw DB rows

If push is skipped or fails, report exact reason.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- files adopted and where they were placed
- canonical design paths
- token sync result
- UI drift fixed
- remaining drift
- whether runtime/model/schema/DB changed
- validation results
- staging smoke result
- commit hash
- staging push status
- exact next step

Then stop.
