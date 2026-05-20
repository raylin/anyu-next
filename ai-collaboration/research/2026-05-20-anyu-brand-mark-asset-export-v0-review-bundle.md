# ANYU Brand Mark Asset Export v0 Review Bundle

## 1. Summary

Exported deterministic PNG brand-mark assets from the canonical `docs/design-system/brand/anyu-mark.svg` source for:

- LINE Official Account profile image usage
- app/web icon usage

This pass stayed asset-focused and did not broadly change app UI surfaces.

## 2. Source Asset

Canonical source:

- `docs/design-system/brand/anyu-mark.svg`

Supporting canonical docs:

- `docs/design-system/brand/anyu-brand-mark-v1.1.md`

## 3. Assets Generated

Generated export bundle:

- `docs/design-system/brand/exports/line-profile-1024.png`
- `docs/design-system/brand/exports/line-profile-640.png`
- `docs/design-system/brand/exports/app-icon-512.png`
- `docs/design-system/brand/exports/app-icon-192.png`

Generated public app assets:

- `apps/web/public/icon-512.png`
- `apps/web/public/icon-192.png`
- `apps/web/public/apple-touch-icon.png`

Retained existing:

- `apps/web/public/favicon.svg`

Deferred:

- no OG brand image export in this pass

## 4. LINE OA Profile Recommendation

Recommended LINE Official Account profile image:

- `docs/design-system/brand/exports/line-profile-1024.png`

Fallback smaller copy:

- `docs/design-system/brand/exports/line-profile-640.png`

Treatment used:

- background `#1f1a12`
- mark `#b69664`
- centered three-dot mark
- square canvas with safe inset

## 5. App/Web Icon Assets

Recommended app/web icon files:

- `apps/web/public/icon-512.png`
- `apps/web/public/icon-192.png`
- `apps/web/public/apple-touch-icon.png`
- `apps/web/public/favicon.svg`
- `apps/web/public/manifest.webmanifest`

## 6. Generation Method

Generation method:

- repo script: `apps/web/scripts/export-brand-assets.mjs`
- command: `cd apps/web && corepack pnpm brand:export`
- renderer: macOS Quick Look thumbnail generation via `qlmanage`

Notes:

- the script reads the canonical SVG and reuses that geometry
- raster exports use dark background plus accent mark treatment
- no hand-editing or screenshot-based export was used

## 7. Documentation Updates

Updated:

- `docs/design-system/README.md`
- `apps/web/README.md`
- `docs/design-system/brand/exports/README.md`

## 8. Validation Results

- generated PNG files exist
- generated PNG files are non-empty
- requested pixel dimensions match the handoff
- compileall, lint, test, and build passed

## 9. Remaining Brand Follow-ups

- optional OG brand-mark export
- optional PNG/favicon set expansion for additional platforms
- optional future automation if asset export ever needs to run outside macOS

## 10. Recommended Next Step

- `ANYU LINE OA Setup Checklist v0`
