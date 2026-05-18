# 暗語 ANYU Web Foundation

This is the production Next.js app foundation for `暗語 ANYU`.

Current routes are skeletons or UI-only shells.

Do not expect full product runtime yet.

Module 01 UI shell now exists for:

- `/m/ambiguous-temperature`
- `/m/ambiguous-temperature/result/demo`

The current Module 01 experience is UI-only:

- local chip/input state
- CTA enable/disable behavior
- mock result rendering
- no provider call
- no DB persistence
- no payment

## Commands

```bash
corepack pnpm install
corepack pnpm dev
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

## Notes

- Design tokens are imported from `apps/web/src/styles/tokens.css`.
- Canonical source is `docs/design-system/tokens.css`.
- The current app foundation uses token-driven custom styles rather than a UI kit baseline.
- No required auth in v0.
- No real payment in v0.
