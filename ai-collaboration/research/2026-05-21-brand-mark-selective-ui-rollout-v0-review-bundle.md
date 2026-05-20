# Brand Mark Selective UI Rollout v0 Review Bundle

## Scope

- Selectively introduced the ANYU brand mark into existing Module 01 surfaces without broad visual redesign.
- Stayed within the approved narrow scope: no font migration, no runtime/model/schema/DB changes, no legal/LINE flow semantics changes.

## Inputs Reviewed

- `docs/design-system/reference/ui-polish-v1.1/STAGING_AUDIT_v1.1.md`
- `docs/design-system/brand/anyu-brand-mark-v1.1.md`

## Applied Rollout

### 1. Header mark / lockup

- Extended `Wordmark` with optional `showMark` support rather than replacing the text-first baseline globally.
- Applied the selective lockup to:
  - landing header
  - result header
  - share/persona mini brand surface

### 2. Remove purple orphan circles

- Removed the decorative orb from `TemperatureCard`.
- Removed the purple share dot from `ShareCardPreview`.

### 3. Loading uses animated AnyuMark

- Replaced the old moon-and-dots loading ornament in `InputCard` with animated `AnyuMark`.
- Kept the existing status panel, copy, focus, and timeout behavior intact.

### 4. Signal bars align with tokens

- Reduced the main temperature meter thickness to the v1.1-style thin bar.
- Set signal-item fills to a clean token-aligned accent fill.

### 5. Temperature gradient aligns with tokens

- Updated the primary temperature gradient to `accent2 -> rose -> accent`.

### 6. Share/persona subtle mini lockup

- Replaced the old share kicker + dot pairing with a quieter `Wordmark` mini lockup using the new mark.

### 7. Favicon / manifest / icon wiring

- Verified the existing favicon, manifest, and generated icon wiring remained intact.
- No asset-path fix was needed in this rollout.

## Tests Added / Updated

- `apps/web/src/tests/anyu-mark.test.tsx`
  - verifies selective lockup behavior
  - verifies loading state uses animated mark
  - verifies share surface uses mini lockup instead of old purple dot
  - verifies CSS contract for bar/loading/mark rollout

## Validation

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## Notes

- This pass intentionally did not start the font migration plan.
- Visual verification is source/build/test-backed in this environment; no true interactive browser/device pass was performed here.
