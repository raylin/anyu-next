# Handoff: Font Migration Phase 1: Latin Display v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run the first, lowest-risk phase of the ANYU font migration: replace the current Latin display font usage from Cormorant Garamond to Instrument Serif.

This task should upgrade the visual tone of ANYU wordmark, big numbers, price numerals, and Latin italic display surfaces while avoiding broader typography changes.

This is a narrow font migration task.

Do not implement Newsreader.

Do not implement LXGW WenKai.

Do not change Chinese body/heading typography.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product copy.

## Background

Module 01 UI Polish Backlog Consolidation v0 completed.

Stable reference docs:

```text
docs/design-system/reference/ui-polish-v1.1/STAGING_AUDIT_v1.1.md
docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md
```

Brand Mark Selective UI Rollout v0 and Staging QA completed.

Current status:

```text
Selective AnyuMark rollout: OK
Human review: OK
Next recommended UI step: Font Migration Phase 1
```

Font migration guidance from Claude Design:

```text
Before:
--anyu-font-latin: "Cormorant Garamond", "Noto Serif TC", serif;

After Phase 1:
--anyu-font-latin: "Instrument Serif", "Noto Serif TC", serif;
```

Claude Design rationale:

```text
Cormorant Garamond feels too wedding/boutique/spiritual-growth.
Instrument Serif better fits editorial modern / literary magazine direction.
```

## Scope

Do:

1. Read `FONT_MIGRATION_v1.1.md`.
2. Load Instrument Serif where production app fonts are loaded.
3. Remove Cormorant Garamond from production app font loading if no longer used.
4. Update `--anyu-font-latin` to Instrument Serif in canonical and app token files.
5. Search app code for explicit Cormorant Garamond references and replace with tokenized usage or Instrument Serif.
6. Verify wordmark / large numbers / price / italic Latin display still render.
7. Add/update tests for token changes.
8. Update docs/reports.
9. Commit and push to `origin/staging`.

Do not:

- add Newsreader
- add LXGW WenKai
- update `.t-quote`
- add `.t-reading`
- change insight/body paragraph fonts
- change Chinese heading/body fonts
- alter layout/spacing unless there is a tiny unavoidable fix
- implement conversion/paywall polish
- change runtime or product logic

## Source Fidelity Requirements

Read:

```text
docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md
```

Use only Phase 1 guidance:

```text
Phase 1 — Latin display:
- update `--anyu-font-latin`
- load Instrument Serif
- remove Cormorant Garamond
- verify wordmark / big numbers / price / accent italic surfaces
```

Do not implement Phase 2 or Phase 3.

## Font Loading Requirements

Find the app's font loading path.

Likely locations:

```text
apps/web/src/app/layout.tsx
apps/web/src/styles/globals.css
apps/web/src/styles/tokens.css
docs/design-system/tokens-v1.1.css
```

Implementation should ensure Instrument Serif is loaded.

If using external Google Fonts link, include only needed families.

Required new family:

```text
Instrument Serif: ital@0;1
```

Do not add Newsreader or LXGW WenKai yet.

If current app already loads fonts through Next/font or metadata/head, follow that convention.

If there is no explicit font loading in app code, document current state and add the simplest maintainable loading path.

## Token Updates

Update canonical:

```text
docs/design-system/tokens-v1.1.css
```

Update app copy:

```text
apps/web/src/styles/tokens.css
```

Change:

```css
--anyu-font-latin: "Cormorant Garamond", "Noto Serif TC", serif;
```

to:

```css
--anyu-font-latin: "Instrument Serif", "Noto Serif TC", serif;
```

Keep:

```css
--anyu-font-serif: "Noto Serif TC", "Songti TC", serif;
--anyu-font-sans: "Noto Sans TC", ...
--anyu-font-mono: "JetBrains Mono", ...
```

Do not add:

```css
--anyu-font-reading
--anyu-font-kai
```

in this phase unless already present and unused. If already present from earlier docs only, do not wire usage.

## Code Search

Search for:

```text
Cormorant Garamond
cormorant
--anyu-font-latin
```

Expected:

- `Cormorant Garamond` should no longer appear in production app code or token files.
- It may remain in historical/reference docs, but not active app styles.

Do not edit historical reference docs unless they are current source docs that must reflect Phase 1.

## Visual Targets

After migration, check surfaces:

```text
ANYU wordmark
large temperature number
/100 or price-like numeric treatments
NT$49
italic accent in hero if using var(--anyu-font-latin)
```

Expected feel:

```text
narrower
more editorial
less wedding/boutique
still premium and gentle
```

Do not alter Chinese heading/body typography.

## Tests

Add/update tests for:

```text
tokens.css contains Instrument Serif for --anyu-font-latin
tokens.css no longer contains Cormorant Garamond in active app token file
canonical tokens and app tokens remain synced if a sync test exists
wordmark / numeric style tests if available
```

Avoid visual snapshots unless existing test structure supports them.

## Documentation Updates

Update:

```text
docs/design-system/README.md
apps/web/README.md
```

Add brief note:

```text
Font Migration Phase 1 completed: Latin display now uses Instrument Serif.
Newsreader and LXGW WenKai remain deferred.
```

If docs already reference Cormorant as active, update those references.

Do not rewrite full design system docs.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-font-migration-phase-1-latin-display-v0-review-bundle.md
```

Required sections:

```markdown
# Font Migration Phase 1: Latin Display v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Source Guidance Used

## 3. Font Loading Changes

## 4. Token Changes

## 5. Code Search Results

## 6. Surfaces Affected

## 7. Surfaces Not Changed

## 8. Validation Results

## 9. Remaining Font Migration Phases

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-font-migration-phase-1-latin-display-v0-execution-report.md
```

Report structure:

```markdown
# Font Migration Phase 1: Latin Display v0 Execution Report

## Summary

## Files Created

## Files Updated

## Font Loading Changes

## Token Changes

## Search / Cleanup Results

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
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If font loading changed, validate after changes.

If possible, perform a lightweight staging/local route check for:

```text
/m/ambiguous-temperature
/m/ambiguous-temperature/result/demo
```

## Constraints

Do not implement:

```text
Newsreader
LXGW WenKai
font migration phase 2
font migration phase 3
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
```

Do not modify:

```text
product prompt/schema
DB schema
provider/model
legal semantics
LINE funnel behavior
production ops behavior
general app layout beyond font loading/token changes
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
git commit -m "design: migrate latin display font"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- font loading changes
- token changes
- Cormorant removal status
- surfaces affected
- phases deferred
- validation results
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
