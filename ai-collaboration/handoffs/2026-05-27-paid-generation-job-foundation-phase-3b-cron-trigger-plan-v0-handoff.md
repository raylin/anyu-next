# Handoff: Paid Generation Job Foundation Phase 3B — Cron Trigger Plan v0

Date: 2026-05-27

Source: `/Users/raylin/Downloads/paid-generation-job-foundation-phase-3b-cron-trigger-plan-v0-handoff.md`

## Objective

Create a rollout plan for adding a cron trigger to the existing paid generation job processor.

This is a planning task only.

## Current Processor State

- Phase 3A processor endpoint is complete at commit `1d87014`.
- `POST /api/internal/jobs/process` exists.
- It is secret-gated.
- It uses `ENABLE_PAID_GENERATION_PROCESSOR`.
- It supports `paid_analysis` only.
- It uses atomic claim with `FOR UPDATE SKIP LOCKED`.
- It includes stale lock recovery.
- It returns aggregate-only responses.
- Staging smoke processed one synthetic queued job to completed provider paid result.
- Production processor flag/secret remain absent/disabled.
- No Vercel Cron exists yet for paid generation.

## Scope

Do:

- Review current processor behavior and repo cron auth pattern.
- Define cron trigger options.
- Recommend cadence and max jobs per run.
- Define staging and production rollout plans.
- Define secret/flag requirements.
- Define no-op verification, cost guardrails, monitoring, and rollback.
- Document the temporary Vercel deployment cleanup recommendation.
- Create research report, execution report, and summary log update.
- Commit and push to `origin/staging`.

Do not:

- Implement cron.
- Edit `vercel.json` or cron config.
- Enable production processor or production cron.
- Change request route behavior.
- Change LINE/LIFF/short-code/payment/prompt/schema/cache/DB/legal semantics.
- Add external queue/vendor/admin UI.

## Required Artifacts

- `ai-collaboration/research/2026-05-27-paid-generation-job-foundation-phase-3b-cron-trigger-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-paid-generation-job-foundation-phase-3b-cron-trigger-plan-v0-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Validation

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

No Playwright required unless code changes.
