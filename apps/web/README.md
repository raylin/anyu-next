# 暗語 ANYU Web Foundation

`apps/web/` is the C-stage production web foundation for `anyu-next`.

It currently provides:

- Next.js App Router skeleton
- ANYU token-driven global styles
- module registry and `ambiguous-temperature` route shell
- placeholder API routes
- Drizzle / Neon skeleton without requiring a live database connection
- Vitest coverage for the module registry and health route

## Getting Started

From `apps/web/`:

```bash
corepack pnpm install
corepack pnpm dev
```

Default local URL:

```text
http://localhost:3000
```

## Structure Notes

- Design tokens are imported from `src/styles/tokens.css`.
- Canonical design system docs live in `docs/design-system/`.
- The first module route shell is `/m/ambiguous-temperature`.
- API routes other than `/api/health` are placeholders and intentionally return `501`.

## Environment

Create local values as needed:

```text
DATABASE_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Validation

```bash
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```
