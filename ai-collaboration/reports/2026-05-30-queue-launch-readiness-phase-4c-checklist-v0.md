# Queue Launch Readiness / Phase 4C Checklist v0

Date: 2026-05-30

## Summary

Queue-triggered paid generation is now proven on Preview(`staging`) for the operator fake-paid path. This checklist defines what must be confirmed before any production payment launch or broader runtime enablement.

This task made no runtime, env, deployment, provider, payment, LINE, prompt/result, or public copy changes.

## 1. Current Queue Readiness Summary

Implemented:

- Phase 4A queue abstraction with disabled/no-op/test behavior.
- Phase 4B.1 Vercel Queues adapter behind `ENABLE_PAID_JOB_QUEUE_TRIGGER`.
- Vercel Queues topic config in `apps/web/vercel.json`.
- Queue consumer route `/api/internal/queues/paid-generation`.
- Targeted processor entrypoint `processPaidAnalysisJobById(...)`.
- Queue consumer now processes the exact payload `generationJobId`.
- Queue-mode fake-paid QA runner support via `QA_FAKE_PAID_PROCESSOR_MODE=queue`.

Proven on Preview(`staging`):

- `vercel_queue` enqueue result from operator fake-paid path.
- Paid job moved from `processing` to `completed` without manual processor invocation.
- Completed paid unlock route rendered successfully.
- Idempotent fake-paid repeat reused payment intent, entitlement, and generation job.
- Production remained disabled during the smoke.

Not yet proven:

- Manual processor fallback after queue provider changes, because `INTERNAL_JOB_SECRET` was not locally available during Phase 4B.2.
- Vercel dashboard-level queue observation, because no queue dashboard screenshots or payload views were captured.
- Real NewebPay provider callback → queue-triggered paid generation in sandbox or live low-risk payment flow.
- Production queue enablement, which remains intentionally off.
- Production payment runtime launch behavior.

Current readiness judgment:

- Queue implementation is ready for staging-level confidence building.
- Queue is not yet a production launch approval by itself.
- Production payment launch should still wait for merchant review approval, provider E2E smoke, launch flags plan, and manual recovery SOP confirmation.

## 2. Required Final Queue QA Before Launch

Final staging QA checklist:

| Check | Required Result | Notes |
|---|---|---|
| Queue-mode fake-paid smoke | Pass | Run `QA_FAKE_PAID_PROCESSOR_MODE=queue corepack pnpm run qa:fake-paid`. |
| Manual fallback smoke | Pass | Requires `INTERNAL_JOB_SECRET`; run manual processor path only after confirming queue mode or a controlled stuck job. |
| Duplicate fake-paid | Pass | Repeat fake-paid call must reuse payment intent, entitlement, generation job, and not return a second raw paid token. |
| Duplicate queue enqueue | Safe | Vercel Queues idempotency key is `paid-job:<generationJobId>`; DB processor must remain idempotent. |
| Queue provider disabled behavior | Pass | `ENABLE_PAID_JOB_QUEUE_TRIGGER=false` must leave paid job queued for manual recovery without enqueue. |
| Queue provider config missing behavior | Pass | Missing `PAID_JOB_QUEUE_TOPIC` should return safe provider config category and not break paid artifacts. |
| Paid status polling | Pass | Pending/processing state before completion; completed after queue consumer succeeds. |
| Completed access rendering | Pass | Paid unlock/session-bound access renders completed result. |
| Production disabled route checks | Pass | Production checkout and fake-paid routes fail closed while payment runtime is off. |
| NotifyURL invalid payload regression | Pass | Invalid/malformed NotifyURL must not mark paid or create new artifacts. |
| Real provider/sandbox event | Pass before launch | Sandbox or low-risk real payment should prove provider callback path, not just operator fake-paid. |

Recommended command set for staging queue smoke:

```bash
cd apps/web
QA_FAKE_PAID_PROCESSOR_MODE=queue corepack pnpm run qa:fake-paid
```

Recommended command set for manual fallback smoke:

```bash
cd apps/web
corepack pnpm run qa:fake-paid
```

Manual fallback smoke requires `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` available locally and must never print their values.

## 3. Vercel Queues Dashboard Observation SOP

Owner/operator dashboard checks:

1. Open Vercel dashboard.
2. Select team/account for `studioanyu-1488s-projects`.
3. Open project `anyu-next`.
4. Locate Queues / Queue Observability if available.
5. Confirm topic `paid-generation-jobs` exists or appears through deployment queue config.
6. During a queue-mode smoke, confirm:
   - message enqueued
   - consumer invoked
   - no unexpected retry loop
   - no growing backlog
   - no repeated terminal failures
7. If failures appear, record only safe categories:
   - enqueue error category
   - consumer invocation observed yes/no
   - retry count range
   - backlog present yes/no

Do not capture into the repo:

- queue payload body if IDs are considered private
- secrets
- raw tokens
- provider payloads
- private account identifiers
- billing data
- screenshots with personal/team account details

If dashboard observation is unavailable:

- Use app-level evidence:
  - fake-paid route reports queue trigger `enqueued`
  - paid status changes from `processing` to `completed`
  - completed unlock/access page renders
  - manual processor was not invoked
- Record that dashboard observation was unavailable and app-level evidence was used.

## 4. Manual Recovery SOP

Use manual processor when:

- queue enqueue fails after paid artifacts are created
- queue delivery appears stuck
- paid status remains queued/processing beyond the expected window
- Vercel Queues dashboard shows retry exhaustion or consumer failures
- operator support needs to recover a paid user result

Required secret/env name:

- `INTERNAL_JOB_SECRET`

Route:

- `POST /api/internal/jobs/process`

Expected auth:

- `Authorization: Bearer <INTERNAL_JOB_SECRET>`

Safe request shape:

```json
{
  "jobType": "paid_analysis",
  "limit": 1
}
```

Safe output to record:

- HTTP status
- `processed`
- `completed`
- `retryScheduled`
- `failedFinal`
- `skipped`
- safe error category if present

Do not log:

- secret values
- bearer token
- raw paid access tokens
- checkout session tokens
- tokenized URLs
- raw user input
- provider payloads
- decrypted provider payloads

If a paid job remains queued/processing:

1. Confirm staging/production environment and route bundle freshness.
2. Confirm `ENABLE_PAID_GENERATION_PROCESSOR` is enabled in the relevant environment.
3. Confirm `INTERNAL_JOB_SECRET` exists in the relevant environment and local shell.
4. Run manual processor once with `limit: 1`.
5. Poll paid status.
6. If still stuck, inspect safe job status metadata in DB/admin tooling if available.
7. Escalate before repeated manual retries if errors are non-retryable or provider generation is failing.

## 5. Production Disabled Posture

Expected Production behavior while payment runtime remains off:

- Public checkout creation route fails closed.
- Operator fake-paid route fails closed.
- Queue trigger remains disabled unless explicitly enabled later.
- No real checkout UI is broadly exposed.
- ReturnURL/status/access routes remain safe read-only or inert without valid session/token.
- NotifyURL exists but cannot create a paid transition unless provider config and valid signed provider payload are present.
- Public merchant-review pages remain live.
- No LINE delivery is triggered by payment.
- No Vercel Hobby Cron is used as the primary paid-generation trigger.

Latest Phase 4B.2 production checks:

- Production health: `environment=production`, `gitBranch=main`, `gitCommit=1990fc034d74`.
- Production fake-paid route returned JSON `not_found`.
- Production checkout route returned JSON `not_found`.
- Production env listing did not show Phase 4 queue flags.

## 6. Env / Flag Checklist

Queue flags:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER`
- `PAID_JOB_QUEUE_TOPIC`

Payment runtime / checkout gates:

- `ENABLE_PAYMENT_RUNTIME`
- `ENABLE_NEWEBPAY_CHECKOUT`

NewebPay provider config names:

- `NEWEBPAY_MERCHANT_ID`
- `NEWEBPAY_HASH_KEY`
- `NEWEBPAY_HASH_IV`
- `NEWEBPAY_CHECKOUT_URL`
- `NEWEBPAY_RETURN_URL`
- `NEWEBPAY_NOTIFY_URL`
- `NEWEBPAY_ENVIRONMENT`

Paid access / session config:

- `PAID_ACCESS_TOKEN_HASH_SECRET`
- `PAYMENT_CHECKOUT_SESSION_SECRET`

Operator / processor config:

- `OPERATOR_TEST_SECRET`
- `INTERNAL_JOB_SECRET`
- `ENABLE_OPERATOR_FAKE_PAID_SUCCESS`
- `ENABLE_PAID_GENERATION_PROCESSOR`

Other required runtime config:

- `DATABASE_URL`
- provider model/API env names already used by paid generation

Preview(`staging`) warning:

- Branch-scoped Preview(`staging`) env values override general Preview values for `staging.anyu.tw`.
- Always inspect/set `preview staging` specifically for staging QA.
- Do not assume general Preview values are used when branch-scoped values exist.

Production rule:

- Do not set or enable Production queue/payment flags until a separate launch decision approves it.

## 7. Launch Blockers Before Production Payment Launch

P0 blockers:

- NewebPay merchant review approval.
- Provider sandbox or small real-payment E2E smoke using real NewebPay flow.
- Explicit production payment launch decision record.
- Production env/flag rollout plan with rollback steps.
- Production disabled-route baseline captured immediately before launch.

P1 blockers:

- Manual processor fallback retest with `INTERNAL_JOB_SECRET`.
- Queue dashboard observation or documented dashboard-unavailable fallback.
- Refund/support SOP owner confirmation.
- Stop-loss rules for launch:
  - max number of early paid transactions
  - when to disable checkout
  - who monitors support inbox
  - how quickly manual recovery runs
- Main/staging sync and production source-of-truth policy confirmed.

P2 blockers:

- Queue enqueue/audit persistence decision.
- Basic support/admin checklist for stuck paid jobs.
- Decide whether cron wrapper remains emergency-only or should be removed after launch confidence.
- Decide whether to add `qa:fake-paid:queue` script.

Not required for initial payment launch:

- LINE delivery
- refund tooling UI
- broad ads or public traffic ramp
- queue audit table, unless launch risk appetite changes

## 8. Recommended Next Step Decision Tree

If NewebPay sandbox/provider credentials are available:

- Recommended next task: **NewebPay Sandbox E2E Smoke v0**
- Scope:
  - create pending checkout
  - submit provider sandbox payment
  - verify NotifyURL marks paid
  - verify delivery artifacts and queue-triggered paid generation
  - verify session-bound access handoff
  - keep production runtime disabled

If NewebPay review is still pending:

- Recommended next task: **Production Payment Launch Gate Plan v0**
- Scope:
  - launch decision record
  - production env names checklist
  - rollback/stop-loss criteria
  - support/refund SOP
  - manual recovery owner steps

If queue confidence is still the priority:

- Recommended next task: **Manual Fallback Retest + Queue Dashboard Observation v0**
- Scope:
  - rerun queue-mode fake-paid smoke
  - capture safe dashboard observation summary
  - rerun manual fallback with `INTERNAL_JOB_SECRET`
  - confirm production disabled posture unchanged

If owner wants engineering cleanup before business approval:

- Recommended next task: **Queue Observability / Audit Decision v0**
- Scope:
  - decide whether to persist queue enqueue attempts
  - decide whether terminal categories need support/admin visibility
  - keep provider behavior unchanged

## 9. Recommended Launch Checklist Order

1. Merchant review approval or sandbox credentials confirmed.
2. Manual fallback retest with `INTERNAL_JOB_SECRET`.
3. Queue dashboard observation or documented app-level fallback.
4. NewebPay sandbox/small real-payment E2E smoke.
5. Production launch gate plan and rollback criteria.
6. Production env/flag setup under explicit approval.
7. Narrow production smoke with real payment runtime still restricted.
8. Owner decision before broader public exposure.

## Tech Debt Review

New technical debt introduced:

- None; documentation-only task.

Existing technical debt observed:

- Manual fallback was not retested during Phase 4B.2.
- Vercel dashboard queue observation was not captured.
- Queue enqueue attempts are not persisted in an audit table.
- Local git remote-tracking ref permission issue has recurred in recent tasks.

Opportunistic cleanup completed:

- Consolidated queue launch readiness into a single checklist for future ChatGPT/Codex coordination.

Deferred cleanup candidates:

- Add dedicated `qa:fake-paid:queue` script.
- Add queue attempt/audit table only if operational need is proven.
- Clarify whether the old cron wrapper remains emergency-only or should be removed after queue confidence stabilizes.

## Recommended Next Step

If provider credentials or review approval arrives: **NewebPay Sandbox E2E Smoke v0**.

If review is still pending: **Manual Fallback Retest + Queue Dashboard Observation v0** or **Production Payment Launch Gate Plan v0**.
