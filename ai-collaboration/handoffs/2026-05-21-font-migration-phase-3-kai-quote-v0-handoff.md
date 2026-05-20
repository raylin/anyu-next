# Handoff: Font Migration Phase 3: Kai Quote v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run Font Migration Phase 3 for Module 01 by introducing LXGW WenKai as a selective quote / whisper font for short emotional quote surfaces.

This task should complete the Claude Design font migration direction while keeping the application scope narrow and safe.

This task should not change long-form reading text, general UI body text, buttons, contact/LINE surfaces, legal pages, or runtime behavior.

## Background

The user wants to finish the current UI polish line before moving back to technical UX work.

Completed UI polish so far:

```text
Brand Mark Selective UI Rollout: complete + QA passed
Font Migration Phase 1: Instrument Serif Latin Display complete + QA passed
Conversion / CTA Rhythm Polish: complete + QA passed
Font Migration Phase 2: Newsreader Editorial Reading complete + QA passed
```

Stable Claude Design reference docs:

```text
docs/design-system/reference/ui-polish-v1.1/STAGING_AUDIT_v1.1.md
docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md
```

Relevant Phase 3 guidance from Claude Design:

```text
Add --anyu-font-kai: LXGW WenKai
Use LXGW WenKai for quote / italic / whisper-like Chinese surfaces
Do not use it as full-page body
Do not use it for buttons, UI labels, legal pages, contact/LINE panels
```

Current font system:

```text
--anyu-font-latin: Instrument Serif
--anyu-font-reading: Newsreader
--anyu-font-serif: Noto Serif TC
--anyu-font-sans: Noto Sans TC
--anyu-font-mono: JetBrains Mono
```

## Scope

Do:

1. Read `FONT_MIGRATION_v1.1.md`.
2. Add LXGW WenKai stylesheet loading.
3. Add `--anyu-font-kai` token to canonical and app token files.
4. Add `.t-kai` and `.t-kai-quote` utilities.
5. Update `.t-quote` to use the kai token, if the current quote surfaces use `.t-quote`.
6. Apply kai typography only to selected short quote / whisper surfaces.
7. Add/update tests.
8. Update docs/reports.
9. Commit and push to `origin/staging`.

Do not:

- change `.t-reading` / Newsreader surfaces from Phase 2
- change long-form insight body text
- change general UI body text
- change legal pages
- change buttons / CTAs
- change contact / LINE / Email panel typography
- change headings
- change prompt/schema/runtime/model/DB/LINE/legal semantics
- add new UI layout or conversion behavior

## Source Fidelity Requirements

Before implementation, read:

```text
docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md
```

Use only Phase 3 guidance:

```text
Phase 3 — Kai Quote:
- Add LXGW WenKai external stylesheet.
- Add --anyu-font-kai.
- Add .t-kai / .t-kai-quote.
- Move quote-like surfaces to kai.
- Do not use kai globally.
```

Do not introduce any additional fonts beyond LXGW WenKai in this task.

## Font Loading Requirements

Add LXGW WenKai webfont loading.

Claude Design reference suggests:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css">
```

Implementation requirements:

- Use the existing app font-loading approach.
- Do not commit font files.
- Keep external font loading narrow and documented.
- If the project uses a CSP or metadata pattern, follow it.
- Keep Instrument Serif and Newsreader loading intact.

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
--anyu-font-kai: "LXGW WenKai", "Kaiti TC", "STKaiti", "Noto Serif TC", serif;
```

Keep existing:

```css
--anyu-font-serif: "Noto Serif TC", "Songti TC", serif;
--anyu-font-sans: "Noto Sans TC", "PingFang TC", "Inter", system-ui, -apple-system, sans-serif;
--anyu-font-latin: "Instrument Serif", "Noto Serif TC", serif;
--anyu-font-reading: "Newsreader", "Noto Serif TC", serif;
--anyu-font-mono: "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
```

## Utility Classes

Add to canonical/app token CSS:

```css
.t-kai {
  font: 400 17px/1.85 var(--anyu-font-kai);
  letter-spacing: 0.5px;
  color: var(--anyu-ink);
}

.t-kai-quote {
  font: 400 17px/1.85 var(--anyu-font-kai);
  letter-spacing: 0.6px;
  color: var(--anyu-ink);
}
```

Update existing `.t-quote` if present:

```css
.t-quote {
  font: 400 var(--anyu-type-quote-size)/var(--anyu-type-quote-lh) var(--anyu-font-kai);
  letter-spacing: 0.5px;
  color: var(--anyu-ink);
}
```

Important:

```text
Do not force italic on LXGW WenKai. The font already carries a handwritten/whisper tone.
```

## Where To Apply

Apply kai typography only to short quote / whisper-like surfaces.

Likely surfaces:

```text
result hook quote
short emotional quote line
share/persona quote if it is a short quote
any existing `.t-quote` usage
```

Do not apply to:

```text
insight long paragraphs
reassurance long text
paid-preview sample reply if currently Newsreader from Phase 2
buttons
input helper
contact/LINE/Email panels
legal pages
footer links
mono labels
headings
temperature numeric score
signal rows
```

If uncertain, leave the surface unchanged and document as deferred.

## Visual Acceptance

Expected:

```text
Short quotes feel more private / whisper-like / handwritten.
Long-form readability remains stable.
UI remains clean and not overly handwritten.
No full-page calligraphy feel.
No layout overflow.
No excessive font-loading jump.
```

If the kai font feels too decorative or hard to read in any surface, limit usage further rather than expanding it.

## Tests

Add/update tests for:

```text
LXGW WenKai stylesheet is loaded
--anyu-font-kai exists in app/canonical token files
.t-kai and .t-kai-quote exist
.t-quote uses --anyu-font-kai
selected quote surfaces use t-quote / kai class
long-form .t-reading surfaces remain Newsreader
buttons/contact/legal do not use kai
font files are not committed
```

Avoid brittle visual snapshots.

## Documentation Updates

Update:

```text
docs/design-system/README.md
docs/design-system/anyu-design-system-v1.1.md
apps/web/README.md
```

Add concise note:

```text
Font Migration Phase 3 completed: short quote / whisper surfaces now use LXGW WenKai through --anyu-font-kai. Newsreader remains scoped to long-form reading surfaces; Noto Sans TC remains UI/body.
```

Do not rewrite the full docs.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-font-migration-phase-3-kai-quote-v0-review-bundle.md
```

Required sections:

```markdown
# Font Migration Phase 3: Kai Quote v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Source Guidance Used

## 3. Font Loading Changes

## 4. Token / Utility Changes

## 5. Surfaces Updated

## 6. Surfaces Not Changed

## 7. Validation Results

## 8. Remaining Typography Follow-ups

## 9. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-font-migration-phase-3-kai-quote-v0-execution-report.md
```

Report structure:

```markdown
# Font Migration Phase 3: Kai Quote v0 Execution Report

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
additional font migration beyond Phase 3
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
general app layout beyond selective quote typography
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
git commit -m "design: add kai quote typography"
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
