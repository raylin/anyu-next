# Design System

ANYU Design System v1.1 is the current implementation source of truth.

Canonical:

- `docs/design-system/anyu-design-system-v1.1.md`
- `docs/design-system/ux-flow-v1.1.md`
- `docs/design-system/tokens-v1.1.css`
- `docs/design-system/brand/anyu-brand-mark-v1.1.md`
- `docs/design-system/brand/anyu-mark.svg`

App copy:

- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/anyu-mark.css`
- `apps/web/src/components/anyu/AnyuMark.tsx`

Reference-only high-fidelity files:

- `docs/design-system/reference/v1.1/`
- `docs/design-system/reference/brand-v1.1/`

Historical v1.0 files remain in place:

- `docs/design-system/anyu-design-system-v1.md`
- `docs/design-system/tokens.css`

When v1.1 tokens change, update `docs/design-system/tokens-v1.1.css` first, then sync `apps/web/src/styles/tokens.css`.

Font Migration Phase 1 completed:

- Latin display now uses `Instrument Serif`
- Newsreader and LXGW WenKai remain deferred

Brand-mark raw Claude Design files are preserved under `docs/design-system/reference/brand-v1.1/`.
The production app must not import from the reference bundle directly.

Generated brand-mark exports live under:

- `docs/design-system/brand/exports/`

Recommended LINE OA profile image:

- `docs/design-system/brand/exports/line-profile-1024.png`

Future `packages/design-system` may be considered later, but not yet.
