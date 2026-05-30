# Queue Trigger Integration Phase 4B.1: Vercel Queues Adapter v0 Handoff

Date: 2026-05-30

## Task

Implement the first real paid job queue provider adapter using Vercel Queues, behind the existing queue trigger abstraction and disabled by default.

## Scope

In scope:

- Add `@vercel/queue` dependency.
- Add `vercel_queue` provider support under `triggerPaidJobProcessing(...)`.
- Add Vercel Queues consumer handler and `vercel.json` queue trigger config.
- Keep payload DB-reference-only and token-safe.
- Invoke existing processor logic in-process from the queue consumer.
- Add targeted tests for provider selection, enqueue success/failure, payload safety, queue consumer validation, and fake-paid/NotifyURL compatibility.
- Create execution report, update summary log, commit, and push to `origin/staging`.

Out of scope:

- Production payment runtime enablement.
- Production env changes.
- Live queue smoke without confirmed dashboard/setup.
- QStash integration.
- LINE delivery.
- NewebPay checkout/notify/payment behavior changes beyond the existing queue abstraction call.
- Prompt/result/public copy changes.

## Constraints

- Disabled by default.
- Do not expose `/api/internal/jobs/process` directly to queue providers.
- Do not commit queue credentials, secrets, raw tokens, tokenized URLs, provider payloads, raw input, or private values.
- Do not run real payments.

## Validation Plan

- Targeted queue/provider/consumer/fake-paid/NotifyURL tests.
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Completion Notes

- Implemented `vercel_queue` adapter and Vercel Queues consumer route.
- Kept queue trigger disabled by default.
- Did not modify env values, deploy, or run live queue smoke.
- Live staging smoke remains the next operational step after owner confirms Vercel Queues dashboard/setup.
