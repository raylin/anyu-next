# ANYU Brand Mark Exports

## Source

Canonical source:

- `docs/design-system/brand/anyu-mark.svg`

Do not regenerate from the reference bundle.

## Generated Assets

- `line-profile-1024.png`
- `line-profile-640.png`
- `app-icon-512.png`
- `app-icon-192.png`

App/public copies:

- `apps/web/public/icon-512.png`
- `apps/web/public/icon-192.png`
- `apps/web/public/apple-touch-icon.png`
- `apps/web/public/favicon.svg`

## LINE OA Usage

Recommended LINE Official Account profile image:

- `docs/design-system/brand/exports/line-profile-1024.png`

Treatment:

- dark background `#1f1a12`
- accent mark `#b69664`
- centered three-dot mark

## App/Web Icon Usage

Use:

- `apps/web/public/icon-512.png`
- `apps/web/public/icon-192.png`
- `apps/web/public/apple-touch-icon.png`

Do not hand-edit these exported PNGs.

## Regeneration Notes

Regenerate with:

```bash
cd apps/web
node scripts/export-brand-assets.mjs
```

The script uses the canonical mark geometry and deterministic color treatment.

## Do Not Hand-Edit

- Do not redraw the mark
- Do not rotate or outline it
- Do not change to off-brand colors
- Do not regenerate from screenshots
