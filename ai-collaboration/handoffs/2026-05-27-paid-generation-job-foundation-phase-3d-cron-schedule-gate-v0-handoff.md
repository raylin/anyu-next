# Handoff: Paid Generation Job Foundation Phase 3D — Cron Schedule Gate v0

Date: 2026-05-27

Source: `/Users/raylin/Downloads/paid-generation-job-foundation-phase-3d-cron-schedule-gate-v0-handoff.md`

## Objective

Add and verify a safe cron schedule gate for the paid generation job processor using the existing `GET /api/cron/paid-generation` wrapper.

## Scope

Do:

- Add a Vercel Cron schedule for `/api/cron/paid-generation`.
- Use cadence `*/5 * * * *`.
- Preserve existing retention cleanup cron.
- Keep processor behavior constrained to `paid_analysis`, `limit=1`.
- Confirm production secret/flag posture.
- Verify no-op/manual route behavior.
- Update docs, review bundle, execution report, and summary log.
- Commit and push to `origin/staging`.

Do not:

- Switch request routes to enqueue-only.
- Change paid-result, LINE, LIFF, short-code, payment, prompt/schema/cache/DB, or legal behavior.
- Enable production processor.
- Deploy production.
- Expose secrets, job IDs, dedupe keys, raw input, provider output, paid-result JSON, tokens, or LINE IDs.

## Validation

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm test:e2e:local`
