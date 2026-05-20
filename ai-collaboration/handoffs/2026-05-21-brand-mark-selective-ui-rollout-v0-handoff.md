# Handoff: Brand Mark Selective UI Rollout v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Apply a narrow, low-risk brand-mark rollout to Module 01 UI so the production/staging experience better aligns with ANYU Brand Mark v1.1 and the Claude Design staging audit.

This task should address the clearest v1.1 visual-system mismatches:

1. Header lacks the new ⋯ mark / lockup.
2. Purple orphan circles remain in result cards.
3. Loading state does not fully use the new animated AnyuMark system.
4. Signal bars and temperature gradient should align more tightly with tokens.
5. Share/persona card can receive a subtle mini brand lockup, without a full redesign.

This is a selective UI polish task.

Do not do font migration in this task.

Do not redesign the result page.

Do not change product runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, or production ops behavior.

## Background

Module 01 UI Polish Backlog Consolidation v0 completed.

Backlog source files are preserved at:

```text
docs/design-system/reference/ui-polish-v1.1/STAGING_AUDIT_v1.1.md
docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md
```

Main backlog doc:

```text
ai-collaboration/research/2026-05-21-module-01-ui-polish-backlog-consolidation-v0.md
```

Brand mark adoption is already complete:

```text
docs/design-system/brand/anyu-brand-mark-v1.1.md
docs/design-system/brand/anyu-mark.svg
apps/web/src/components/anyu/AnyuMark.tsx
apps/web/src/styles/anyu-mark.css
apps/web/public/favicon.svg
```

Brand mark asset exports are already complete:

```text
docs/design-system/brand/exports/
apps/web/public/icon-192.png
apps/web/public/icon-512.png
apps/web/public/apple-touch-icon.png
apps/web/public/manifest.webmanifest
```

Current product status:

```text
Production low-key launch: GO
Ads: not yet
Real payment: not yet
Model: Sonnet default
LINE: notification flow only
```

## Source Fidelity Requirements

Before implementation, read:

```text
docs/design-system/reference/ui-polish-v1.1/STAGING_AUDIT_v1.1.md
docs/design-system/brand/anyu-brand-mark-v1.1.md
```

Use these as high-fidelity guidance.

Do not freely reinterpret the brand mark.

Do not implement items from `FONT_MIGRATION_v1.1.md` in this task.

## Scope

Do:

1. Introduce AnyuMark / mini lockup into the header or brand shell.
2. Remove purple orphan circles from temperature card and persona/share card.
3. Replace or align loading visual with animated AnyuMark.
4. Align signal bars with v1.1 token rules.
5. Align temperature gradient with v1.1 tokens.
6. Add subtle mini mark/lockup to share/persona card if low-risk.
7. Verify favicon / manifest / app icons are still wired.
8. Add/update tests.
9. Create review bundle and execution report.
10. Commit and push to `origin/staging`.

Do not:

- migrate fonts
- implement Newsreader / LXGW WenKai
- change CTA rhythm
- redesign paywall hierarchy
- add stamp treatment unless extremely small and explicitly safe
- change LINE copy
- change legal content
- change runtime/model/DB
- add new product features

## Implementation Items

### 1. Header Mark / Lockup

Current issue:

```text
Header is text-first and does not expose the new ⋯ mark.
```

Goal:

```text
Introduce AnyuMark subtly while preserving brand readability.
```

Recommended approach:

- Keep text-first `暗語 ANYU` brand recognition.
- Add `AnyuMark` to the left of existing wordmark or create a small local lockup.
- Do not fully replace wordmark.
- Keep mobile spacing stable.
- Use `color: var(--anyu-ink)` or `var(--anyu-accent)` per design.

Suggested visual direction:

```text
⋯  暗語 ANYU
```

or

```text
⋯ | 暗語 / ANYU
```

Do not overbuild a full `AnyuLockup` unless it is clean and low-risk.

If adding a reusable lockup is useful, keep it small and documented.

### 2. Remove Purple Orphan Circles

Current issue from audit:

```text
Temperature card and persona/share card have purple solid circles that are no longer part of v1.1 vocabulary.
```

Action:

- Remove both orphan purple circles, or replace with subtle AnyuMark only if it improves hierarchy.
- Preferred first pass: remove from temperature card; use mini mark only where brand recall benefits.
- Avoid adding a new decorative element that competes with score/persona.

### 3. Loading Uses Animated AnyuMark

Current issue:

```text
Loading should use the new ⋯ animated mark system.
```

Action:

- Use `AnyuMark animated` or `.anyu-mark--typing` in the loading panel.
- Keep existing elapsed-time wait-state copy.
- Preserve focus/scroll behavior added earlier.
- Respect reduced motion.
- Do not introduce layout jump.

Expected copy can remain close to current wait-state copy, but visual should include animated mark.

### 4. Signal Bars

Audit guidance:

```text
Signal bar height should be 4px.
Default fill should use var(--anyu-accent), not orphan purple.
```

Action:

- Ensure signal bar height is 4px.
- Ensure default signal fill uses `var(--anyu-accent)`.
- If cold/negative variant exists, use tokenized accent2 only with explicit modifier.
- Do not hardcode purple.

### 5. Temperature Gradient

Audit guidance:

```text
Use tokenized gradient:
var(--anyu-accent2) → var(--anyu-rose) → var(--anyu-accent)
```

Action:

- Replace hardcoded saturated gradient stops with tokenized v1.1 gradient.
- Keep COLD / WARM / HOT labels.

### 6. Share / Persona Mini Lockup

Current issue:

```text
Share/persona card top-left label can use mini lockup; card has brand gap.
```

Action:

- Add subtle AnyuMark / mini lockup.
- Do not implement stamp treatment yet.
- Do not redesign whole card.
- Do not fill the large blank space in this task unless it is a tiny spacing fix.

Preferred:

```text
mini AnyuMark + ANYU label
```

### 7. Favicon / Manifest Verification

Verify:

```text
apps/web/public/favicon.svg exists
apps/web/public/icon-192.png exists
apps/web/public/icon-512.png exists
apps/web/public/apple-touch-icon.png exists
apps/web/public/manifest.webmanifest exists
layout metadata references favicon/manifest appropriately
```

No broad changes needed unless broken.

## Files Likely To Update

Likely files:

```text
apps/web/src/components/anyu/Wordmark.tsx
apps/web/src/components/anyu/AnyuMark.tsx
apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx
apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx
apps/web/src/components/anyu/TemperatureCard.tsx
apps/web/src/components/anyu/ShareCardPreview.tsx
apps/web/src/components/anyu/InputCard.tsx
apps/web/src/lib/modules/ai-temperature-ui.ts
apps/web/src/styles/globals.css
apps/web/src/tests/ai-temperature-ui.test.ts
apps/web/src/tests/anyu-mark.test.tsx
apps/web/src/tests/brand-assets.test.ts
```

Only update files actually needed.

## Tests

Add/update tests for:

```text
header renders AnyuMark or mark-aware wordmark
loading renders animated mark class
purple orphan style/class no longer present if testable
signal bar style helper uses accent/token if helper exists
temperature gradient helper uses tokenized stops if helper exists
share card includes mini brand mark/lockup if implemented
favicon/public icon files still exist
```

Avoid brittle visual snapshot tests.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-brand-mark-selective-ui-rollout-v0-review-bundle.md
```

Required sections:

```markdown
# Brand Mark Selective UI Rollout v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Source Audit Items Addressed

## 3. Header / Lockup Changes

## 4. Orphan Circle Removal

## 5. Loading Mark Changes

## 6. Signal Bar / Temperature Gradient Alignment

## 7. Share / Persona Mini Brand Changes

## 8. Favicon / Manifest Verification

## 9. Files Changed

## 10. Validation Results

## 11. Remaining UI Polish Backlog

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-brand-mark-selective-ui-rollout-v0-execution-report.md
```

Report structure:

```markdown
# Brand Mark Selective UI Rollout v0 Execution Report

## Summary

## Files Created

## Files Updated

## Audit Items Implemented

## Header / Brand Changes

## Loading Changes

## Result Card Changes

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
- brand rollout summary
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If UI changed, validate after changes.

If possible, smoke check:

```text
staging or local landing
demo result route
loading state if testable
```

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

Important:

Do not commit font files.

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "design: selectively roll out ANYU brand mark"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- audit items addressed
- header/brand changes
- orphan circle status
- loading mark status
- signal/gradient alignment
- share/persona changes
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
