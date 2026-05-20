# Handoff: ANYU Brand Mark Asset Export v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Export production-ready brand mark assets from the adopted ANYU Brand Mark v1.1 source, especially for LINE Official Account profile image and app/web icons.

This task should generate deterministic raster assets from the canonical SVG source and document how they should be used.

This is an asset-generation + documentation task.

Do not broadly change UI surfaces.

Do not redesign the mark.

Do not hand-draw or visually reinterpret the mark.

Do not change product runtime, model, prompt/schema, DB schema, legal semantics, LINE funnel behavior, auth, payment, or portal scope.

## Scope

Do:

1. Generate LINE OA profile image assets.
2. Generate basic app/web icon assets if feasible.
3. Use canonical SVG as source.
4. Add generated assets to appropriate public/docs locations.
5. Document asset specs and usage.
6. Add/adjust manifest metadata only if low-risk and consistent.
7. Add tests/checks for file existence if practical.
8. Commit and push to `origin/staging`.

Do not:

- change main app UI brand surfaces
- implement broad logo rollout
- modify AnyuMark design
- import reference files into app
- use arbitrary off-brand colors
- add heavy asset pipeline unless needed
- change app behavior

## Source Asset

Use:

```text
docs/design-system/brand/anyu-mark.svg
```

## Required Assets

Create:

```text
docs/design-system/brand/exports/line-profile-1024.png
docs/design-system/brand/exports/line-profile-640.png
docs/design-system/brand/exports/app-icon-512.png
docs/design-system/brand/exports/app-icon-192.png
```

Copy app/web icon assets to:

```text
apps/web/public/icon-512.png
apps/web/public/icon-192.png
apps/web/public/apple-touch-icon.png
```

Keep existing:

```text
apps/web/public/favicon.svg
```

## Documentation

Create:

```text
docs/design-system/brand/exports/README.md
ai-collaboration/research/2026-05-20-anyu-brand-mark-asset-export-v0-review-bundle.md
ai-collaboration/reports/2026-05-20-anyu-brand-mark-asset-export-v0-execution-report.md
```

## Validation

Run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

Document asset generation command and verify exported PNG files exist and are non-empty.
