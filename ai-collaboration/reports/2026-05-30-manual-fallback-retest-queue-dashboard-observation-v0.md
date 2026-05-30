# Manual Fallback Retest + Queue Dashboard Observation v0

Date: 2026-05-30

## Summary

This task verified non-secret staging freshness, production-disabled posture, Vercel project context, and secret-safe QA runner behavior. The actual queue-mode and manual fallback authorized retests were blocked because this Codex shell does not have `OPERATOR_TEST_SECRET` or `INTERNAL_JOB_SECRET`.

No production runtime, production flags, Vercel env values, deployments, NewebPay behavior, LINE behavior, Module 01 prompt/result behavior, or public copy were changed.

## 1. Staging Freshness Preflight

Source state:

| Check | Result |
|---|---|
| Local branch | `staging` |
| Local `HEAD` | `0f9b7b8e0dc426f20cfc561713aef257616f9697` |
| Local `origin/staging` | `0f9b7b8e0dc426f20cfc561713aef257616f9697` |
| Local `origin/main` | `1990fc034d745e7aaafdd34bb8221b494220d909` |
| Worktree before docs | clean except this task handoff/report changes |
| `git fetch origin --prune` | blocked by local `.git/FETCH_HEAD` permission issue: `Operation not permitted` |

Staging health:

```json
{
  "ok": true,
  "service": "anyu-next-web",
  "app": "anyu-web",
  "environment": "preview",
  "gitCommit": "0f9b7b8e0dc4",
  "gitBranch": "staging",
  "routeBundleVersion": "payment-foundation-2026-05-29"
}
```

Staging route checks:

| Route | Result |
|---|---|
| `POST https://staging.anyu.tw/api/operator/fake-paid-success` without secret | JSON `401 unauthorized` |
| `POST https://staging.anyu.tw/api/modules/ambiguous-temperature/checkout/newebpay` without runtime gate/body | JSON `404 not_found` |

Conclusion: staging is serving the expected queue/checklist commit and route bundle. The fetch permission issue remains local hygiene debt but did not prevent local/remote ref inspection for this task.

## 2. Queue-Mode Smoke Sanity Check

Required command attempted:

```bash
cd apps/web
QA_FAKE_PAID_PROCESSOR_MODE=queue corepack pnpm run qa:fake-paid
```

Sanitized result:

| Step | Result |
|---|---|
| `secret_preflight` | blocked |
| `OPERATOR_TEST_SECRET` | missing |
| `INTERNAL_JOB_SECRET` | missing |
| `processorMode` | queue |
| `staging_health_marker` | pass, preview/staging `0f9b7b8e0dc4` |
| missing-secret fake-paid gate | pass, JSON `401 unauthorized` |
| invalid-secret fake-paid gate | pass, JSON `401 unauthorized` |
| invalid synthetic `pa_` status | pass, `invalid_paid_access` |
| final summary | blocked, `operator_secret_missing` |

Queue-mode smoke could not create an authorized fake-paid payment, so it did not enqueue a fresh Vercel Queue message in this run.

Latest known queue-mode pass remains the Phase 4B.2 app-level evidence:

- `QA_FAKE_PAID_PROCESSOR_MODE=queue corepack pnpm run qa:fake-paid` completed without manual processor invocation.
- Fake-paid returned queue trigger `enqueued` via `vercel_queue`.
- Paid status moved from `processing` to `completed` on polling attempt 12.
- Completed paid unlock rendering passed.

## 3. Manual Fallback Retest

Required command attempted:

```bash
cd apps/web
corepack pnpm run qa:fake-paid
```

Sanitized result:

| Step | Result |
|---|---|
| `secret_preflight` | blocked |
| `OPERATOR_TEST_SECRET` | missing |
| `INTERNAL_JOB_SECRET` | missing |
| `processorMode` | manual |
| `staging_health_marker` | pass, preview/staging `0f9b7b8e0dc4` |
| missing-secret fake-paid gate | pass, JSON `401 unauthorized` |
| invalid-secret fake-paid gate | pass, JSON `401 unauthorized` |
| invalid synthetic `pa_` status | pass, `invalid_paid_access` |
| final summary | blocked, `operator_secret_missing` |

Manual fallback was not retested because this shell lacks both secrets needed to create an authorized paid test case and invoke the internal processor path.

Owner/operator retest command when secrets are securely exported:

```bash
cd apps/web
corepack pnpm run qa:fake-paid
```

Required local env names only:

- `OPERATOR_TEST_SECRET`
- `INTERNAL_JOB_SECRET`

Expected pass criteria:

- fake-paid authorized creation succeeds
- paid job starts queued/pending
- manual processor invocation succeeds
- paid status becomes completed/ready
- completed paid unlock rendering passes

## 4. Vercel Queues Dashboard Observation

Vercel CLI/account checks:

| Check | Result |
|---|---|
| `VERCEL_TOKEN` | present |
| Vercel CLI | `54.5.1` |
| `vercel whoami` | `studioanyu-1488` |
| Linked project | `anyu-next` |
| Project id | present in `.vercel/project.json` |
| Staging deployment target | preview |
| Staging deployment status | Ready |
| Staging aliases | `staging.anyu.tw`, branch preview alias |

Preview(`staging`) env names observed, values hidden by Vercel:

- `PAID_JOB_QUEUE_TOPIC`
- `PAID_JOB_QUEUE_PROVIDER`
- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `OPERATOR_TEST_SECRET`
- `INTERNAL_JOB_SECRET`
- `ENABLE_PAID_GENERATION_PROCESSOR`

CLI log observation:

- `vercel logs` for the current staging deployment showed recent `/api/health` request logs.
- No `/api/internal/queues/paid-generation` logs were returned for the last 3 hours, which is expected because this task could not run an authorized queue-mode smoke.
- Vercel CLI did not expose a `vercel queues` command in prior preflight, and this task did not find CLI-level queue metrics.

Dashboard observation status:

- Not completed by Codex; dashboard UI access is required.
- Official Vercel Queues observability documentation says queue metrics are available from the project dashboard under Observability → Queues, including queued/received/deleted metrics and consumer group details: https://vercel.com/docs/queues/observability
- Official Vercel Queues docs confirm at-least-once delivery and automatic retries, reinforcing why ANYU processor idempotency remains the safety boundary: https://vercel.com/docs/queues

Owner UI action still needed:

1. Open Vercel dashboard.
2. Select `studioanyu-1488` / `anyu-next`.
3. Go to Observability → Queues.
4. Check topic `paid-generation-jobs`.
5. Confirm message enqueue/receive/delete activity during the latest queue-mode smoke.
6. Confirm no unexpected backlog, retry storm, or failure loop.
7. Record only safe aggregate notes, not payloads or private screenshots.

## 5. Production Disabled Checks

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
| `https://anyu.tw/` | HTTP 200; product content markers present |
| `https://anyu.tw/refund` | HTTP 200; refund/support markers present |
| `https://anyu.tw/legal` | HTTP 200; support/legal markers present |
| `POST https://anyu.tw/api/operator/fake-paid-success` | JSON `404 not_found` |
| `POST https://anyu.tw/api/modules/ambiguous-temperature/checkout/newebpay` | JSON `404 not_found` |

Production env names observed via `vercel env ls production` did not include the Phase 4 queue flags:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`

Conclusion: production remains disabled for payment runtime and queue triggering. Public merchant-review pages remain live.

## 6. Gap Closure Status

| Phase 4C P1 Gap | Status | Notes |
|---|---|---|
| Queue-mode smoke after Phase 4C checklist | Blocked in this shell | Missing `OPERATOR_TEST_SECRET`; previous Phase 4B.2 pass remains valid evidence. |
| Manual fallback retest | Blocked | Missing `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET`. |
| Vercel dashboard-level queue observation | Pending owner UI action | CLI confirmed project/deployment/env names but not dashboard queue metrics. |
| Production disabled safety | Passed | Production health/routes/env names checked; no queue flags observed. |

This does not close the Phase 4C P1 queue readiness gaps. It narrows the remaining work to an owner/operator run with secrets and dashboard access.

## 7. Recommended Next Step

Run **Manual Fallback Retest + Queue Dashboard Observation v0 Owner Pass** from a local shell with:

- `OPERATOR_TEST_SECRET`
- `INTERNAL_JOB_SECRET`

Commands:

```bash
cd apps/web
QA_FAKE_PAID_PROCESSOR_MODE=queue corepack pnpm run qa:fake-paid
corepack pnpm run qa:fake-paid
```

In parallel, observe Vercel dashboard → `anyu-next` → Observability → Queues → `paid-generation-jobs` and record only safe aggregate findings.

If owner wants Codex to run it, export the two secrets into the Codex shell without printing them, then rerun this task.

## Tech Debt Review

New technical debt introduced:

- None; documentation/QA-only task.

Existing technical debt observed:

- Local `.git/FETCH_HEAD` permission issue still blocks `git fetch origin --prune`.
- Manual fallback retest remains unproven after queue implementation.
- Queue dashboard observation remains owner-UI pending.
- Vercel still lists both `anyu-next` and old `anyu` projects with `https://anyu.tw` in project listings; current production health resolves to `anyu-next`, but owner UI cleanup remains advisable.

Opportunistic cleanup completed:

- Captured exact blocked QA status and owner rerun commands.

Deferred cleanup candidates:

- Fix local `.git/FETCH_HEAD` permission issue.
- Add a dedicated `qa:fake-paid:manual` alias if operators want clearer manual fallback command names.
- Add optional non-secret queue observability notes to runbook after owner dashboard check.

## Sources

- Vercel Queues docs: https://vercel.com/docs/queues
- Vercel Queues observability docs: https://vercel.com/docs/queues/observability
