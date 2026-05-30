# Force Align Preview(staging) QA Secrets and Run Queue + Manual Fallback QA v0

Date: 2026-05-30

## Summary

Branch-scoped Preview(`staging`) `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` were regenerated, aligned through Vercel CLI, exported only in the same shell, and used for both queue-mode and manual fallback fake-paid QA.

Queue-mode QA passed with `vercel_queue` enqueue and completed paid unlock rendering. Manual fallback QA passed after a controlled Preview(`staging`) queue-disable pass with a fresh source input; the manual processor reported `processed=1` and `completed=1`.

No Production env values, Production flags, public payment runtime, NewebPay provider behavior, LINE behavior, Module 01 prompt/result behavior, or public copy were changed. Production remained disabled.

## 1. Source and CLI Preflight

| Check | Result |
|---|---|
| Working directory | `/Users/raylin/Projects/anyu-next` |
| Branch | `staging` |
| Local `HEAD` | `b9069bdaaea2fab38ffb1fe167e4fefe22b8afee` |
| Remote `staging` via `git ls-remote` | `b9069bdaaea2fab38ffb1fe167e4fefe22b8afee` |
| `git fetch origin --prune` | local `.git/FETCH_HEAD` permission issue remains: `Operation not permitted` |
| Vercel CLI | `54.5.1` |
| Vercel account | `studioanyu-1488` |
| Vercel team scope used | `studioanyu-1488s-projects` |
| Vercel project | `anyu-next` |

## 2. Secret Alignment

Actions completed:

- Generated fresh staging-only `OPERATOR_TEST_SECRET`.
- Generated fresh staging-only `INTERNAL_JOB_SECRET`.
- Removed and re-added branch-scoped Preview(`staging`) values for both secrets.
- Exported the same values in the same shell for QA runs.

No secret values were printed, committed, or written to repo files.

Queue env handling:

- Existing queue env values were kept unchanged for the queue-mode QA pass.
- Preview(`staging`) `ENABLE_PAID_JOB_QUEUE_TRIGGER` was temporarily set to `false` only for the manual fallback validation, then restored to `true` and redeployed.
- Production env was not modified.

## 3. Preview(staging) Redeploy

A first redeploy attempt without explicit Vercel scope failed with a team-scope mismatch, so subsequent redeploys used:

- `--scope studioanyu-1488s-projects`
- `--target preview`

Preview redeploys completed successfully. Final staging health after queue restoration:

```json
{
  "ok": true,
  "service": "anyu-next-web",
  "app": "anyu-web",
  "environment": "preview",
  "gitCommit": "b9069bdaaea2",
  "gitBranch": "staging",
  "routeBundleVersion": "payment-foundation-2026-05-29"
}
```

## 4. Queue-Mode Fake-Paid QA Result

Command:

```bash
cd apps/web
QA_FAKE_PAID_PROCESSOR_MODE=queue corepack pnpm run qa:fake-paid
```

Sanitized result summary:

| Step | Result |
|---|---|
| `secret_preflight` | pass; both secrets present |
| `staging_health_marker` | pass; Preview(`staging`) `b9069bdaaea2` |
| missing/invalid fake-paid gate | pass; JSON `401 unauthorized` |
| invalid synthetic `pa_` | pass; `invalid_paid_access` |
| source analyze/result | pass |
| legacy unlock intent/page | pass |
| `fake_paid_authorized_first` | pass |
| payment intent | `paid`, created |
| entitlement | `active`, created |
| generation job | already `completed` by queue path at response time |
| queue trigger | `ok=true`, `category=enqueued`, `provider=vercel_queue` |
| idempotency | pass; ids reused, no second paid token |
| paid status | `completed` |
| completed paid unlock rendering | pass |
| final summary | pass; `fullQaPassed=true`, `queueTriggerPassed=true`, `exactJobProcessed=true` |

This verifies queue-mode fake-paid remains healthy after forced secret alignment.

## 5. Manual Fallback QA Result

Initial manual-mode run with queue still enabled:

- Passed full QA and authenticated to `/api/internal/jobs/process`.
- Manual processor returned `processed=0`, `completed=0` because the queue had already completed the reused job.
- This confirmed internal processor auth but did not prove recovery processing.

A small QA-only runner enhancement was added:

- `QA_FAKE_PAID_INPUT_SUFFIX` appends a non-secret suffix to the synthetic analysis input.
- This forces a fresh source result and avoids cache/idempotency reuse when validating manual recovery.

Controlled manual fallback run:

1. Temporarily set Preview(`staging`) `ENABLE_PAID_JOB_QUEUE_TRIGGER=false`.
2. Redeployed Preview(`staging`).
3. Ran manual QA with a fresh input suffix.
4. Restored Preview(`staging`) `ENABLE_PAID_JOB_QUEUE_TRIGGER=true`.
5. Redeployed Preview(`staging`) again.

Command shape:

```bash
cd apps/web
QA_FAKE_PAID_INPUT_SUFFIX="manual fallback fresh input <timestamp>" corepack pnpm run qa:fake-paid
```

Sanitized result summary:

| Step | Result |
|---|---|
| `secret_preflight` | pass; both secrets present |
| source analyze | pass; `cacheHit=false` |
| fake-paid authorized first | pass |
| queue trigger | `category=disabled`, `provider=none` |
| generation job before processor | `queued`, created |
| paid status before processor | `pending`, retryable |
| manual processor | pass; `processed=1`, `completed=1`, `retryScheduled=0` |
| paid status after processor | `completed` |
| completed paid unlock rendering | pass |
| final summary | pass; `fullQaPassed=true`, `processorPassed=true` |

This proves the manual processor fallback can recover and complete a fresh queued paid generation job when queue triggering is disabled.

## 6. Production Disabled Checks

Production health:

```json
{
  "ok": true,
  "service": "anyu-next-web",
  "app": "anyu-web",
  "environment": "production",
  "gitCommit": "1990fc034d74",
  "gitBranch": "main",
  "routeBundleVersion": "payment-foundation-2026-05-29"
}
```

Production route checks:

| Route | Result |
|---|---|
| `POST https://anyu.tw/api/operator/fake-paid-success` | HTTP 404, JSON `not_found` |
| `POST https://anyu.tw/api/modules/ambiguous-temperature/checkout/newebpay` | HTTP 404, JSON `not_found` |

Production env listing did not include:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`

Conclusion: Production payment runtime and queue trigger remain disabled.

## 7. Remaining Dashboard Observation Owner Action

Vercel dashboard queue observation remains an owner UI action:

1. Open Vercel dashboard.
2. Select `studioanyu-1488s-projects` / `anyu-next`.
3. Go to Observability → Queues.
4. Check topic `paid-generation-jobs`.
5. Confirm message enqueue/receive/delete activity and no unexpected backlog or retry storm.
6. Record only safe aggregate notes, not payloads or screenshots with private details.

## 8. Recommended Next Step

Recommended next task depends on business readiness:

- If NewebPay sandbox/provider credentials are available: run `NewebPay Sandbox E2E Smoke v0`.
- If review is still pending: run `Production Payment Launch Gate Plan v0`.
- If queue confidence remains priority: owner completes Vercel dashboard queue observation and records safe aggregate metrics.

## Tech Debt Review

New technical debt introduced:

- `QA_FAKE_PAID_INPUT_SUFFIX` is a QA-only runner knob. It is intentional and low-risk, but should remain undocumented for public use and only be used for safe staging freshness/manual fallback validation.

Existing technical debt observed:

- Local `.git/FETCH_HEAD` permission issue still blocks `git fetch origin --prune`.
- Vercel redeploy commands should use explicit `--scope studioanyu-1488s-projects` to avoid team-scope mismatch.
- Vercel dashboard-level queue observation is still not captured in repo docs.

Opportunistic cleanup completed:

- Added a QA-only way to force fresh source results without changing product behavior.

Deferred cleanup candidates:

- Fix local git permission issue.
- Add explicit package aliases such as `qa:fake-paid:queue` and `qa:fake-paid:manual-fresh` if these become routine operator workflows.
- Add a short ops note that Vercel CLI redeploys should include explicit team scope.
