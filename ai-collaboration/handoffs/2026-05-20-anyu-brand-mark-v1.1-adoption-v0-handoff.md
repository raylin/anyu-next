# Handoff: ANYU Brand Mark v1.1 Adoption v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Adopt the Claude Design ANYU Brand Mark v1.1 raw files into the repo as the canonical brand-mark source, preserve the original reference files, and prepare the production app to use the mark safely.

This task should organize the uploaded/raw files from the inbox folder, merge brand-mark tokens into the existing v1.1 design-token system, add a production-ready React mark component and favicon asset, and update documentation.

This is primarily a brand-system adoption task.

Do not do broad UI redesign in this task.

Do not change product runtime, model, prompt/schema, DB schema, legal semantics, LINE funnel behavior, auth, payment, or portal scope.

## Scope

Do:

1. Verify inbox files exist.
2. Preserve raw files under design-system reference.
3. Create canonical brand docs/assets under `docs/design-system/brand/`.
4. Merge brand-mark tokens into canonical `docs/design-system/tokens-v1.1.css`.
5. Sync app token copy to `apps/web/src/styles/tokens.css`.
6. Add app-local brand mark CSS if needed.
7. Add production-safe `AnyuMark` React component.
8. Add `favicon.svg` using the new mark.
9. Update docs/readmes to describe the new brand-mark source of truth.
10. Add tests where practical.
11. Create review bundle and execution report.
12. Commit and push to `origin/staging`.

Do not:

- broadly replace all existing UI brand usage yet
- generate all PNG app icons unless easy and safe
- implement LINE OA image export unless scoped as a generated asset only
- change runtime/model/prompt/schema/DB/legal semantics
- alter LINE funnel behavior
- import docs/reference JSX directly into app components
- make large visual redesigns

## Source Bundle

Expected inbox folder:

```text
ai-collaboration/inbox/2026-05-20-brand-mark-v1.1/
```

Expected raw files:

```text
LOGO_v1.1.md
anyu-mark.svg
anyu-mark.css
anyu-mark.jsx
anyu-mark-demo.html
anyu-tokens-v1.1.css
```

## Implementation Notes

- Treat this as `ANYU Brand Mark v1.1`, not a full design-system version bump.
- Preserve raw files under `docs/design-system/reference/brand-v1.1/`.
- Keep `docs/design-system/` canonical and production-safe.
- Do not import the reference bundle into the production app.
- Prefer adding `AnyuMark` only; defer any fuller lockup system unless trivial.

## Deliverables

- `docs/design-system/brand/anyu-brand-mark-v1.1.md`
- `docs/design-system/brand/anyu-mark.svg`
- `docs/design-system/brand/anyu-mark.css`
- `docs/design-system/brand/anyu-mark.jsx`
- `docs/design-system/brand/anyu-mark-demo.html`
- `docs/design-system/reference/brand-v1.1/...`
- `apps/web/src/components/anyu/AnyuMark.tsx`
- `apps/web/src/styles/anyu-mark.css`
- `apps/web/public/favicon.svg`
- review bundle
- execution report
- summary log update

## Validation

Run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

## Final Output

End with the required Codex Completion Summary and include commit hash plus staging push status.
