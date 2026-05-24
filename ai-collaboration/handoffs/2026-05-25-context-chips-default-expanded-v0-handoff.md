# Handoff: Context Chips Default Expanded v0

Date: 2026-05-25

## Objective

Make the optional context chips section expanded by default on the Module 01 landing input card.

## Scope

- Only change the default expanded/collapsed state.
- Keep the section optional.
- Keep the user able to collapse it.
- Do not change chip labels, context payload, prompt/schema/cache, paid result, LINE fulfillment, production behavior, or title hierarchy.
- Do not make any context field required.

## Expected Behavior

- On first landing page render, `讓結果更貼近你（選填）` is open/expanded.
- Context chips are visible by default.
- Analyze still works with no chips selected.
- If a user selects chips, payload remains unchanged.

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
cd apps/web && corepack pnpm test:e2e:local
```

## Commit

```bash
git commit -m "ux: expand context chips by default"
git push origin HEAD:staging
```
