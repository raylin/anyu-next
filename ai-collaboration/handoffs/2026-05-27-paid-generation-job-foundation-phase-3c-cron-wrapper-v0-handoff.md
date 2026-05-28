# Handoff: Paid Generation Job Foundation Phase 3C — Cron Wrapper v0

Date: 2026-05-27

Source: `/Users/raylin/Downloads/paid-generation-job-foundation-phase-3c-cron-wrapper-v0-handoff.md`

## Objective

Implement a narrow Vercel-Cron-friendly wrapper for the paid generation job processor.

## Scope

Do:

- Add `GET /api/cron/paid-generation`.
- Authenticate with `CRON_SECRET` bearer auth only.
- Delegate to the existing paid-generation processor service.
- Use `paid_analysis`, `limit=1`, and aggregate-only responses.
- Respect `ENABLE_PAID_GENERATION_PROCESSOR`.
- Support safe `dryRun=1` if simple.
- Add tests.
- Update runbook/docs.
- Create review bundle, execution report, summary log.
- Commit and push to `origin/staging`.

Do not:

- Add or edit Vercel Cron schedule.
- Edit `apps/web/vercel.json`.
- Enable production cron or production processor.
- Change request route behavior.
- Change LINE/LIFF/short-code/payment behavior.
- Make generation enqueue-only.
- Expose job IDs, dedupe keys, raw errors, raw input, provider output, paid result JSON, tokens, LINE IDs, or secrets.

## Validation

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm test:e2e:local`
