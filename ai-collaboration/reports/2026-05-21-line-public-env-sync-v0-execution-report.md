# LINE Public Env Sync v0 Execution Report

Date: 2026-05-21

## Summary

Synced the three public LINE fulfillment env values in Vercel for Preview/Staging and Production from the repo setup docs. No server secrets were touched or printed. No app code was changed. Production smoke was not run.

## Source Docs Read

- `ai-collaboration/research/line/line-oa-staging-setup.md`
- `ai-collaboration/research/line/line-oa-production-setup.md`
- `ai-collaboration/research/line/line-fulfillment-env-matrix.md`

## Values Used

Preview/Staging:

- `NEXT_PUBLIC_LINE_LIFF_ID=2010157793-Q4JeeYv0`
- `NEXT_PUBLIC_LINE_LIFF_URL=https://liff.line.me/2010157793-Q4JeeYv0`
- `NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/5uL4e9q`

Production:

- `NEXT_PUBLIC_LINE_LIFF_ID=2009959232-LhxoYMDV`
- `NEXT_PUBLIC_LINE_LIFF_URL=https://liff.line.me/2009959232-LhxoYMDV`
- `NEXT_PUBLIC_LINE_ADD_URL=https://lin.ee/oX0rbiTf`

These values are public by design.

## Preview / Staging Values Set

Yes.

Vercel env listing confirmed:

- `NEXT_PUBLIC_LINE_LIFF_ID` exists for `Preview (staging)`
- `NEXT_PUBLIC_LINE_LIFF_URL` exists for `Preview (staging)`
- `NEXT_PUBLIC_LINE_ADD_URL` exists for `Preview (staging)`

## Production Values Set

Yes.

Vercel env listing confirmed:

- `NEXT_PUBLIC_LINE_LIFF_ID` exists for `Production`
- `NEXT_PUBLIC_LINE_LIFF_URL` exists for `Production`
- `NEXT_PUBLIC_LINE_ADD_URL` exists for `Production`

Production was not smoked.

## Staging Redeploy

Yes.

A docs-only push to `origin/staging` was used to trigger a fresh Vercel Preview/Staging rebuild after public env sync:

- trigger commit: `72d601e`
- trigger commit message: `ops: trigger public line env rebuild`

## Staging Verification Result

Passed.

Live staging `/api/unlock-intent` returned:

- non-null `liffUrl`
- staging LIFF ID in `liffUrl`: `2010157793-Q4JeeYv0`
- staging/test OA `lineAddUrl`: `https://lin.ee/5uL4e9q`

This confirms Preview/Staging now uses the test OA and staging LIFF values.

## Production Redeploy

Not run.

Production env values were set, but production needs a fresh production deployment before the new `NEXT_PUBLIC_*` values are baked into the production build. Production deployment and LINE smoke remain pending explicit approval.

## Validation Results

- Passed: `python3 -m compileall oradar`
- Passed: `python3 -m compileall tools/topic-ingestion`
- Passed: `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'` (25 tests)
- Passed: `cd apps/web && corepack pnpm lint`
- Passed: `cd apps/web && corepack pnpm test` (23 files / 85 tests)
- Passed: `cd apps/web && corepack pnpm build`

## Blockers

- None for Preview/Staging public env sync.
- Production redeploy is intentionally pending.

## Safety Notes

- Did not touch server secrets.
- Did not print secret values.
- Did not change app code.
- Did not run production smoke.
