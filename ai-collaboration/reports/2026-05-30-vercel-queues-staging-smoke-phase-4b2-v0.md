# Vercel Queues Staging Smoke / Phase 4B.2 v0

Date: 2026-05-30

## Summary

Vercel Queues staging smoke passed on Preview(`staging`) without invoking the manual processor endpoint.

The queue-enabled fake-paid QA path verified:

- staging route freshness
- operator fake-paid gate behavior
- invalid `pa_` regression
- normal source analyze/result flow
- legacy unlock regression
- authorized fake-paid creation
- Vercel queue trigger enqueue result
- idempotency
- paid status polling from `processing` to `completed`
- completed paid unlock rendering

The smoke used a regenerated staging-only `OPERATOR_TEST_SECRET` set on Preview(`staging`) and exported only in the same shell that ran the QA. No secret values, raw paid access tokens, `pcs_` tokens, tokenized URLs, provider payloads, or raw user input were printed or committed.

## Source / Deployment State

Source state:

- Local HEAD before smoke support commit: `13f88cae90fa9d7aef690cc3684f663c66cb14f4`
- Smoke support commit pushed to staging: `fbf9508e37b31f63c1c8eadb7d37bc49240a1991`
- `origin/staging` verified by `git ls-remote`: `fbf9508e37b31f63c1c8eadb7d37bc49240a1991`

Staging health after deploy:

- URL: `https://staging.anyu.tw/api/health`
- environment: `preview`
- gitBranch: `staging`
- gitCommit: `fbf9508e37b3`
- routeBundleVersion: `payment-foundation-2026-05-29`

Production safety check:

- URL: `https://anyu.tw/api/health`
- environment: `production`
- gitBranch: `main`
- gitCommit: `1990fc034d74`
- routeBundleVersion: `payment-foundation-2026-05-29`
- Production fake-paid route returned JSON `not_found`.
- Production NewebPay checkout route returned JSON `not_found`.
- Production env listing did not show the Phase 4 queue flags.

## Vercel Project / Env Setup

Vercel context:

- CLI account: `studioanyu-1488`
- team scope used for redeploy: `studioanyu-1488s-projects`
- project: `anyu-next`
- linked project id present locally

Preview(`staging`) env names verified/updated, values not printed:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`
- `OPERATOR_TEST_SECRET`
- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `ENABLE_PAID_GENERATION_PROCESSOR`
- `INTERNAL_JOB_SECRET`

Queue env setup:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER` was added for Preview(`staging`).
- `PAID_JOB_QUEUE_PROVIDER` was added for Preview(`staging`).
- `PAID_JOB_QUEUE_TOPIC` was added for Preview(`staging`).
- Queue topic name: `paid-generation-jobs`.

Secret handling:

- `OPERATOR_TEST_SECRET` was regenerated for Preview(`staging`) and exported only inside the same shell that ran the QA.
- `vercel env pull` was tested with `--environment=preview --git-branch staging`; it listed the expected names but wrote empty values for sensitive vars, so it was not usable for local secret injection.
- `INTERNAL_JOB_SECRET` was not exported locally for this smoke, and manual fallback was not tested.

No Production env values were modified.

## Deployment Actions

Actions:

1. Added Preview(`staging`) queue env names.
2. Added smoke-runner support commit `fbf9508`.
3. Waited until `staging.anyu.tw` served `fbf9508`.
4. Regenerated Preview(`staging`) `OPERATOR_TEST_SECRET`.
5. Redeployed the staging Preview deployment with the updated branch-scoped env.
6. Ran queue-mode fake-paid QA from the same shell that held the fresh operator secret.

Redeploy:

- target: Preview
- production deploy: not run
- production alias: not changed
- staging alias: `https://staging.anyu.tw`

## Code Support Added for Smoke

Commit `fbf9508` added minimal smoke support:

- `apps/web/src/app/api/operator/fake-paid-success/route.ts`
  - returns sanitized `queueTrigger` fields only:
    - `ok`
    - `category`
    - `provider`
- `apps/web/scripts/authorized-fake-paid-qa.mjs`
  - supports `QA_FAKE_PAID_PROCESSOR_MODE=queue`
  - skips manual `/api/internal/jobs/process`
  - waits for queue completion via paid status polling
  - reports `exactJobProcessed: true` when queue mode reaches completed paid status

No payment runtime, NewebPay behavior, prompt/result behavior, LINE delivery, production flags, or public copy changed.

## Sanitized Smoke Result

Command:

```bash
cd apps/web
QA_FAKE_PAID_PROCESSOR_MODE=queue corepack pnpm run qa:fake-paid
```

Sanitized pass/fail:

| Step | Result | Sanitized evidence |
|---|---:|---|
| secret preflight | PASS | `OPERATOR_TEST_SECRET` present, `INTERNAL_JOB_SECRET` missing, `processorMode=queue` |
| staging health marker | PASS | preview/staging, commit `fbf9508e37b3`, route bundle `payment-foundation-2026-05-29` |
| fake-paid missing secret gate | PASS | JSON `401 unauthorized` |
| fake-paid invalid secret gate | PASS | JSON `401 unauthorized` |
| invalid synthetic `pa_` status | PASS | `invalid_paid_access` |
| source analyze | PASS | HTTP 200, result id present |
| source result page | PASS | HTTP 200 |
| legacy unlock intent | PASS | unlock token, LIFF URL, LINE add URL present |
| legacy unlock page | PASS | HTTP 200 |
| fake-paid authorized first | PASS | payment paid, entitlement active, generation job queued, access pending, paid token returned in memory, queue `enqueued` via `vercel_queue` |
| fake-paid idempotency | PASS | payment/entitlement/job reused, second token not returned, queue `enqueued` via `vercel_queue` |
| paid status before completion | PASS | `processing` |
| pending unlock page | PASS | HTTP 200 |
| queue trigger result | PASS | `queueTriggerOk=true`, `category=enqueued`, `provider=vercel_queue`, generation job present |
| paid status polling | PASS | attempts 1-11 `processing`, attempt 12 `completed` |
| completed unlock page | PASS | HTTP 200, completed content signal true |
| final summary | PASS | full QA passed, queue trigger passed, paid ready, exact job processed, completed rendering passed, legacy regression passed |

The QA output was saved to a temporary local file:

- `/private/tmp/anyu-queue-smoke-20260530-183046.jsonl`

This file was not committed.

## Exact Job Verification

Sanitized proof:

- `generationJobIdPresent: true`
- `queueTriggerCategory: enqueued`
- `queueTriggerProvider: vercel_queue`
- paid status reached `completed` without manual processor invocation
- runner reported `exactJobProcessed: true`

The runner does not print raw generation job IDs or raw paid access tokens. Boolean proof is sufficient for this smoke.

## Manual Fallback

Manual fallback was not tested in this run because `INTERNAL_JOB_SECRET` was not available locally. The existing runner still supports manual mode, and the internal processor route remains unchanged from the prior targeted processor task.

## Vercel Queue Observability

Dashboard-level queue observation was not captured into the repo.

Safe evidence collected in this task:

- Vercel queue trigger returned `enqueued`.
- The paid job transitioned from `processing` to `completed` with no manual processor call.
- Completed paid unlock rendering passed.

No queue payload screenshots, secret values, or private dashboard data were committed.

## Failure Classification

No smoke failure occurred.

Potential failure categories from the task that remain useful for future runs:

- `queue_config_missing`
- `enqueue_failed`
- `queue_message_not_delivered`
- `consumer_auth/config_error`
- `consumer_payload_invalid`
- `processor_not_targeting_job`
- `processor_retryable_error`
- `paid_status_not_ready_timeout`
- `access_render_failed`

## Validation

Code support commit validation:

- `cd apps/web && corepack pnpm lint` - passed.
- `cd apps/web && corepack pnpm test -- operator-fake-paid-success-route.test.ts` - passed; Vitest ran 56 files / 360 tests.
- `cd apps/web && corepack pnpm build` - passed.

Smoke validation:

- staging health check passed
- queue-mode fake-paid QA passed
- production safety checks passed

Docs validation:

- docs presence check - passed.
- secret/private scan - no actionable new matches; only historical false-positive words in the existing summary log.
- `git diff --check` - passed.

## Tech Debt Review

New technical debt introduced:

- None.

Existing technical debt observed:

- `vercel env pull` with branch-scoped Preview sensitive vars produced empty local values, so operator secrets still require either local owner export or controlled same-shell regeneration for Codex-run smoke.
- Manual fallback was not tested in this smoke because `INTERNAL_JOB_SECRET` was unavailable locally.
- Queue dashboard observations were not captured; only app-level evidence was recorded.

Opportunistic cleanup completed:

- Added queue-mode runner support so future queue smoke does not accidentally call the manual processor first.
- Added sanitized queue trigger metadata to fake-paid route responses.

Deferred cleanup candidates:

- Add a dedicated `qa:fake-paid:queue` package script if queue smoke becomes repeated.
- Add queue dashboard observation SOP outside the repo.
- Decide whether manual fallback should be rerun after every queue-provider change.

## Recommended Next Step

Proceed to a narrow **Queue Launch Readiness / Phase 4C Checklist v0** or **NewebPay Sandbox E2E Smoke v0**:

- keep payment runtime disabled by default,
- keep queue trigger branch-scoped until launch,
- confirm provider sandbox credentials/review status,
- only then decide whether to enable real checkout flow beyond operator/staging QA.
