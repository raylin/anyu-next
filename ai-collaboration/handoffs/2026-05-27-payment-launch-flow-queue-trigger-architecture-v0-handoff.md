# Handoff: Payment Launch Flow + Queue Trigger Architecture v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Design the post-payment durable generation architecture for ANYU Module 01.

This is a planning-only task. Do not implement payment integration, queue provider integration, DB migrations, checkout, request-route enqueue-only behavior, LINE enqueue-only behavior, external workers, admin tools, membership, follow-up sessions, new modules, ads, or production behavior changes.

## Context

The repo already has:

- `analysis_paid_results` as paid-result delivery storage.
- `unlock_intents` for LINE/LIFF and short-code fulfillment.
- `generation_jobs` schema and repository helpers.
- Feature-flagged paid-generation job mirroring.
- Secret-gated internal paid-generation processor endpoint.
- Cron wrapper route for low-frequency recovery.
- Queue/worker strategy evaluation recommending QStash-like webhook queue as a likely payment-launch trigger candidate.

Vercel Hobby Cron is not sufficient for low-latency paid generation. The architecture needs a payment-launch path that does not require LINE.

## Target Direction

Future full-analysis delivery should support:

- Desktop: web checkout -> payment success -> web polling -> completed paid result.
- Mobile: LINE-first remains available; web checkout also works.
- LINE: optional delivery, retention, and follow-up channel.
- Short-code: fallback/recovery, not primary paid delivery.

Payment success and entitlement should be able to trigger generation independently of LINE.

## Required Outputs

Create:

- `ai-collaboration/research/2026-05-27-payment-launch-flow-queue-trigger-architecture-v0.md`
- `ai-collaboration/reports/2026-05-27-payment-launch-flow-queue-trigger-architecture-v0-execution-report.md`

Update:

- `ai-collaboration/summaries/summary_log.md`

## Questions To Answer

- What is the minimum payment intent/order model?
- What is the minimum entitlement model?
- Should entitlement be separate from `unlock_intents`?
- How should `payment_success_future` map into `generation_jobs`?
- How does web-only unlock prove entitlement?
- How does LINE optional delivery attach after payment?
- What role remains for short-code?
- Should QStash be the first queue POC?
- What is the fallback if QStash is rejected?
- What should remain out of scope before NewebPay approval?

## Validation

Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

No Playwright is required unless code changes.

## Commit

Commit with:

```bash
git commit -m "docs: plan payment queue launch"
git push origin HEAD:staging
```
