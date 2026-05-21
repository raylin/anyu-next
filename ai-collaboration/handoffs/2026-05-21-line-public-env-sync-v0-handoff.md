# Handoff: LINE Public Env Sync v0

Date: 2026-05-21

## Objective

Update Vercel public LINE fulfillment env values from repo setup docs for Preview/Staging and Production.

## Public Env Vars

- `NEXT_PUBLIC_LINE_LIFF_ID`
- `NEXT_PUBLIC_LINE_LIFF_URL`
- `NEXT_PUBLIC_LINE_ADD_URL`

## Source Docs

- `ai-collaboration/research/line/line-oa-staging-setup.md`
- `ai-collaboration/research/line/line-oa-production-setup.md`
- `ai-collaboration/research/line/line-fulfillment-env-matrix.md`

## Constraints

- Do not touch server secrets.
- Do not print secrets.
- Do not change app code.
- Do not run production LINE smoke.
- Trigger fresh staging deployment after Preview env update.
- Verify staging `/api/unlock-intent` returns a non-null `liffUrl` and the test OA add URL.
- Verify production env values were set, but do not run production LINE smoke.

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

## Commit

Commit docs/report changes only:

```bash
git commit -m "ops: sync public line fulfillment env"
git push origin HEAD:staging
```
