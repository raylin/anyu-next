# Handoff: Queue / Worker Strategy Evaluation v0

Date: 2026-05-27

Source: `/Users/raylin/Downloads/queue-worker-strategy-evaluation-v0-handoff.md`

## Objective

Reassess the durable paid generation trigger strategy after discovering that Vercel Hobby Cron only supports daily schedules and is not suitable as the primary low-latency paid-generation trigger.

## Scope

Do:

- Review current implementation and constraints.
- Verify current vendor/platform facts from official sources.
- Compare request kick/manual recovery, Vercel Pro Cron, QStash/webhook queue, Inngest, Trigger.dev, dedicated workers, and Cloud Tasks/Cloud Run.
- Recommend short-term, payment-launch, and scale-up paths.
- Document what current `generation_jobs` and processor assets should keep or change.
- Create research report, execution report, and summary log update.
- Commit and push to `origin/staging`.

Do not:

- Implement queue provider integration.
- Add vendor SDKs.
- Add worker deployment.
- Change cron config.
- Change processor endpoint, request route behavior, LINE behavior, payment behavior, DB schema, or production behavior.
- Expose secrets, raw input, provider output, paid result JSON, tokenized URLs, LINE IDs, job IDs, or dedupe keys.

## Validation

Docs/research only:

- `python3 -m compileall oradar`
- `python3 -m compileall tools/topic-ingestion`
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

No Playwright required unless code changes.
