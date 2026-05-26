# Handoff: Module 01 Dual Theme Fidelity + Theme Carryover v0

Date: 2026-05-25

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused follow-up pass after Module 01 Dual Theme v2 Riso Implementation v0.

This task should:

1. Fix the remaining Theme B visual fidelity issues found in staging screenshots.
2. Fix shared share-card/button alignment issues that affect both themes.
3. Simplify the visible theme switch UI so it feels like a small visual control, not an experiment/debug control.
4. Ensure the active theme carries reliably into fulfillment / paid-content routes, especially web → LIFF → unlocked result and short-code → unlocked result.

This is a visual fidelity + theme continuity task.

It may include minimal additive metadata/storage needed specifically for theme carryover, but it must not change product logic.

Do not change analyze logic.

Do not change paid generation logic.

Do not change LINE fulfillment behavior except for carrying/restoring the selected theme visually.

Do not change prompt/schema/cache/DB unless a minimal additive theme carryover field is necessary and explicitly documented.

Do not implement payment/email/ads.

Do not deploy production by default.

## Background

Module 01 Dual Theme v2 Riso Implementation v0 completed.

Commit:

```text
ec34345
```

What is working:

```text
- Theme A / 柔和 is preserved as the current control.
- Theme B / 鮮明 Riso Editorial exists as a scoped visual variant.
- First-visit 50/50 theme assignment is implemented.
- localStorage persistence is implemented.
- Manual theme toggle exists.
- themeVariant/themeSource metadata and theme_switch_clicked exist.
- Product behavior/data contracts are preserved.
```

Staging visual QA found that Theme B is broadly in the right direction, but several fidelity and shared layout issues remain.

User also raised an important question:

```text
How do we preserve the selected theme through paid content / LIFF fulfillment?
```

Answer:

```text
Do not rely only on localStorage because LIFF / LINE in-app browser may be a different runtime context.
Theme must be carried through unlock / fulfillment context so the paid/unlocked experience remains visually consistent.
```

## User Feedback To Address

### Visual fidelity issues

1. **Temperature insight card accent overlap**

In the result page, the card under the main temperature summary has a pink accent that visually overlaps the text.

Expected:

```text
The accent should behave like a right-edge / border accent from the design.
It should not intrude into readable text.
```

2. **Share card CTA spacing**

The CTA below the share card is too tight against the card/bottom edge.

Expected:

```text
The share CTA should use the same margin and spacing rhythm as other buttons.
```

3. **Editorial background shapes missing**

Claude Design v2 includes irregular background color blocks / editorial bleed shapes.

Expected:

```text
Theme B should restore subtle decorative background blocks behind content.
They should not harm readability or interaction.
```

4. **Theme switch is too explicit**

Current visible theme switch exposes too much textual labeling / experiment feel.

Expected:

```text
Make it a small visual indicator/control.
Do not show theme names.
Do not show manual / AB / experiment wording.
```

5. **Theme carryover into fulfillment**

When user goes through LIFF or short-code flow, the active theme should carry into the unlocked paid-content experience.

Expected:

```text
A user who starts in Theme B should see Theme B on the unlocked route after LIFF/short-code.
A user who starts in Theme A should see Theme A.
```

6. **Shared share-card width alignment**

Share card width has long-standing mismatch with other major cards, especially visible on desktop.

Expected:

```text
Share card should align with other major card/container widths in both themes.
Mobile must remain safe.
```

7. **Shared share CTA button style**

The share CTA should use the correct shared button token/variant. This issue affects both themes.

Expected:

```text
Use the shared/common button treatment rather than one-off styling.
Theme B should match the black CTA design from Claude v2 where applicable.
Theme A should remain visually consistent with its own button system.
```

8. **Paid preview / unlocked block color mismatch**

In the paid preview area, the “保留主動權” block should match Claude Design:

```text
dark/black card body
white text
title/accent should not incorrectly become purple
small note/accent at bottom should be pink/magenta, not purple
```

## Scope

Do:

1. Fix the Theme B visual fidelity issues listed above.
2. Fix shared share CTA spacing and share card width alignment across both themes.
3. Replace visible theme switch with a compact visual indicator/toggle.
4. Preserve manual theme override behavior.
5. Preserve first-visit A/B assignment behavior.
6. Add robust theme carryover into unlock/fulfillment context.
7. Ensure unlocked route / paid content restores the correct theme.
8. Ensure LIFF and short-code flows can preserve/restore theme.
9. Add/update tests.
10. Update review bundle, execution report, summary log.
11. Commit and push to `origin/staging`.

Do not:

- change analyze behavior
- change paid generation behavior
- change provider/model/prompt/schema semantics
- change LINE webhook / LIFF bind logic except theme restoration/carryover
- change payment/email/ads behavior
- change legal semantics
- change DB broadly beyond minimal additive theme carryover if required
- deploy production by default
- remove Theme A
- remove Theme B
- remove A/B assignment
- remove manual override

## Theme Switch Redesign

Replace current explicit toggle with a compact visual control.

### Requirements

```text
- No visible “Theme A / Theme B”
- No visible “manual”
- No visible “AB”
- No visible “Classic / Riso” unless hidden in aria-label only
- Small and secondary in the UI
- Must remain tappable on mobile
- Must have accessible labels
- Must preserve existing manual override behavior
```

### Recommended visual treatment

Use two small swatches / dots / mini buttons.

Example:

```text
[ small cream/brown dot ] [ small purple/magenta dot ]
```

Active state:

```text
outline / halo / thicker border / small offset shadow
```

Aria labels:

```text
切換為柔和主題
切換為鮮明主題
```

Internal values remain:

```text
classic
riso
```

Preferred visible design:

```text
two small visual swatches, no text label
```

If two dots are too ambiguous, a tiny two-segment icon toggle is acceptable, but no theme names should appear.

## Theme Carryover Requirements

### Problem

LocalStorage alone is not reliable across:

```text
normal browser → LINE LIFF webview
normal browser → short-code link → LINE in-app browser
direct unlocked route open
```

Therefore the active theme must be carried through fulfillment context.

### Required behavior

When creating unlock intent, store or pass the current active theme.

Preferred implementation:

```text
Persist themeVariant and optionally themeSource on unlock intent / fulfillment context.
```

If DB migration is needed, it must be additive and clearly documented.

Possible fields:

```text
unlock_intents.theme_variant
unlock_intents.theme_source
```

or a safe JSON metadata field if already available.

Allowed values:

```text
theme_variant: classic | riso
theme_source: ab_assigned | manual_override | query_hint | unknown
```

If adding DB fields is not desired, use a non-DB carryover strategy only if robust:

```text
theme hint in LIFF / unlocked URL
theme hint in fulfillment context
server-side validation of allowed theme values
```

Recommended final priority order on unlocked route:

```text
1. theme carried by unlock intent / fulfillment context
2. safe query hint if present
3. localStorage manual override
4. existing A/B assignment
5. default classic
```

### Required flow coverage

Theme carryover must work for:

```text
result page → unlock intent → unlocked route
result page → LIFF → unlocked route
result page → short-code → LINE link → unlocked route
legacy existing unlocked tokens if no theme exists
```

Legacy fallback:

```text
If no theme exists on old data, fall back to existing localStorage/A/B/default behavior.
```

### Event metadata

Add safe metadata if useful:

```text
themeVariant
themeSource
themeCarryoverSource
```

Allowed carryover source values:

```text
unlock_intent
query_hint
local_storage
ab_assignment
default
```

Do not include user content or tokens.

## Visual Fix Details

### 1. Temperature insight card accent overlap

Fix the decorative accent so it does not cover text.

Likely approaches:

```text
- move accent to right border/edge pseudo-element
- increase inner padding
- set accent layer behind content with proper z-index
- ensure pointer-events none
```

Do not obscure text.

### 2. Share CTA spacing

Fix shared spacing.

Expected:

```text
- CTA below share card follows standard button margin
- no tight visual collision with card bottom
- desktop and mobile both safe
```

Prefer shared spacing token rather than one-off CSS.

### 3. Share card clean background

If the share card unintentionally has grid/pattern background, remove it.

Expected:

```text
- Theme B share card should match design: clean white card surface unless the high-fidelity source explicitly requires subtle internal texture.
- Theme A should not be affected unless it shares the bug.
```

If a pattern is desired elsewhere, scope it outside the share card.

### 4. Editorial background shapes

Restore Theme B decorative bleed blocks / irregular background shapes.

Rules:

```text
- Theme B only
- decorative only
- behind content
- pointer-events none
- no readability impact
- no layout shift
- no interference with clicking
- do not add to Theme A
```

Use v2 token colors and rules.

### 5. Paid preview featured block colors

Fix “保留主動權” block.

Expected:

```text
- dark / black card background
- readable white/on-dark text
- title/accent not incorrectly purple
- bottom note/accent pink/magenta as in Claude v2
```

Use v2 tokens:

```text
--anyu-ink or --anyu-ink-dark
--anyu-ink-onDark
--anyu-accent2 for magenta note/accent
```

### 6. Share card width alignment

Fix across both themes.

Expected:

```text
- share card container aligns with other major cards on desktop
- mobile remains safe
- no horizontal overflow
- no one-off desktop-only mismatch
```

Prefer shared container width or card wrapper fix.

### 7. Share CTA shared button style

Use common button token/variant.

Expected:

```text
- Theme B share CTA should use black button style consistent with v2.
- Theme A should use existing shared primary button style.
- Avoid one-off non-token styling.
```

## Functional Equivalence Requirement

Both themes must preserve the same:

```text
available CTAs
funnel steps
validation rules
API calls
data submitted
result content
locked/unlocked states
LINE behavior
paid generation behavior
privacy/legal meaning
```

Theme B may change:

```text
color
typography treatment
borders/shadows/radius
spacing
ornamentation
card presentation
icon/halftone/stripe treatment
visual hierarchy within the same copy/function
```

Theme B must not change:

```text
what users can do
when CTAs appear
what API calls happen
what result content is generated
paid generation timing
LINE bind/webhook/LIFF behavior
prompt/schema/cache behavior
```

The purpose of A/B testing is to compare visual presentation, not different product flows.

## Tests

Add/update tests for:

```text
Theme switch renders compact visual control without visible theme names
manual override still persists
A/B assignment still works
unlock intent receives/carries valid theme variant if implemented
unlocked route restores theme from unlock/fulfillment context
legacy unlocked route falls back safely when no theme recorded
LIFF URL/context carries theme hint if implemented
short-code unlocked link restores theme if implemented
share card width wrapper is consistent
share CTA uses shared button variant
Theme A still renders
Theme B still renders
context chips payload unchanged
analyze behavior unchanged
paid generation behavior unchanged
event metadata safe
```

If DB migration is added:

```text
migration is additive
legacy rows nullable/safe
production migration must be separate unless explicitly included
```

## Visual QA

After implementation, verify staging:

```text
landing/input Theme A
landing/input Theme B
free result Theme A
free result Theme B
share card Theme A
share card Theme B
paid preview Theme B
contact/LINE sheet Theme B
unlocked route Theme B through normal web flow
unlocked route Theme B through LIFF / short-code if practical
```

Screenshots should not be committed unless explicitly intended.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-25-module-01-dual-theme-fidelity-theme-carryover-v0-review-bundle.md
```

Required sections:

```markdown
# Module 01 Dual Theme Fidelity + Theme Carryover v0 Review Bundle

Date: 2026-05-25

## 1. Summary

## 2. User Feedback Addressed

## 3. Visual Fixes

## 4. Shared UI Fixes

## 5. Theme Switch Simplification

## 6. Theme Carryover Design

## 7. Fulfillment / Unlocked Route Theme Restoration

## 8. Event Metadata

## 9. Tests Added

## 10. Staging / Visual QA Notes

## 11. Known Limitations

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-25-module-01-dual-theme-fidelity-theme-carryover-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Dual Theme Fidelity + Theme Carryover v0 Execution Report

## Summary

## Files Created

## Files Updated

## Visual Fixes Applied

## Theme Switch Changes

## Theme Carryover Implementation

## Functional Equivalence Status

## Tests Added

## Validation Results

## Staging / Visual Notes

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

```text
date
task completed
visual fidelity summary
theme switch summary
theme carryover summary
validation result
commit hash
staging push status
```

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort permission issue, record honestly.

## Production Gate

Default:

```text
staging only
```

Do not deploy production unless explicitly approved.

If DB migration is introduced for theme carryover:

```text
do not apply production migration in this task unless explicitly approved
document migration requirement
```

## Constraints

Do not implement:

```text
payment provider integration
ads launch
real payment
email delivery
rich menu
broadcast
portal/account system
model switch
SSE/websocket/token streaming
Module 02
new backend generation behavior
```

Do not modify:

```text
free analyze behavior
paid generation behavior
LINE fulfillment logic beyond theme restoration/carryover
webhook behavior beyond theme restoration/carryover
prompt/schema/cache semantics
legal semantics
production behavior
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LOGIN_CHANNEL_SECRET
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces unless explicitly intended and safe
raw sourced JSONL
private batch generated outputs
codes/tokens/tokenized URLs/LINE user IDs
full raw provider output
paid_result_json dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "style: refine module 01 theme fidelity and carryover"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
visual fixes applied
shared fixes applied
theme switch simplification
theme carryover behavior
whether DB migration was introduced
functional equivalence confirmation
tests added
validation results
staging/visual notes
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
