# Module 01 Share Card + Theme Switch Fix v0 Handoff

## Task

Fix the remaining shared share-card layout issues and the Module 01 theme switch UI after the dual-theme fidelity and theme carryover passes.

## Scope

- Visual/UI-only fixes for Module 01.
- Preserve Theme A and Theme B functional equivalence.
- Preserve A/B assignment, manual override, localStorage persistence, and safe theme metadata.
- Do not change analyze, paid generation, LINE fulfillment, prompts, schemas, cache, DB, payment, email, ads, or production behavior.

## Required Fixes

1. Align the share-card wrapper width and margin with other major cards on desktop for both themes.
2. Keep mobile safe with no horizontal overflow.
3. Ensure the share CTA uses the shared button component/style path and follows the same spacing rhythm as other CTAs.
4. Reduce excessive empty whitespace in the share card while preserving the poster/share-card feel.
5. Replace visible theme labels with compact visual swatches only.
6. Do not display visible experiment/debug wording such as `視覺`, `柔和`, `鮮明`, `MANUAL`, `Theme A`, `Theme B`, `A/B`, or `manual`.
7. Preserve accessible labels:
   - `切換為柔和主題`
   - `切換為鮮明主題`

## Execution Notes

- Fix shared share-card constraints in shared CSS instead of theme-specific hardcoding.
- Use existing share fields only.
- Keep Theme B close to the Riso Editorial direction while keeping Theme A visually consistent with the control.
- Do not introduce new event semantics or backend behavior.

## Validation Plan

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm test:e2e:local`

