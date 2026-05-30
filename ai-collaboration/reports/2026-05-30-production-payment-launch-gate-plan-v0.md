# Production Payment Launch Gate Plan v0

Date: 2026-05-30

## Summary

This plan defines the required gates before enabling NewebPay payment runtime for ANYU Module 01. It is a planning/checklist document only.

No code, env values, runtime behavior, production flags, deployments, real payments, NewebPay provider behavior, LINE behavior, Module 01 prompt/result behavior, or public copy were changed.

## 1. Current Readiness Summary

Already proven:

| Area | Current Evidence |
|---|---|
| Operator fake-paid delivery | Full staging QA pass: paid payment intent, entitlement, paid access token behavior, generation job, idempotency, completed unlock rendering. |
| NewebPay checkout creation | Phase 1 implemented pending `payment_intent` creation/reuse and checkout payload/form contract behind gates. |
| NotifyURL verification | Phase 2 implemented TradeInfo decrypt/TradeSha verification and matching existing NewebPay intent by merchant order number. |
| Paid transition | Verified successful NotifyURL idempotently transitions pending-like NewebPay intents to paid. |
| Delivery artifacts | Phase 3 creates/reuses entitlement, paid access token hash, and generation job after verified paid intent. |
| Session-bound access handoff | Phase 3B added signed `pcs_` checkout session tokens, status, ReturnURL waiting/processing/ready UX, and session-bound paid access without exposing raw `pa_`. |
| Queue processing | Vercel Queues adapter, target `generationJobId` consumer path, and Preview(`staging`) queue smoke passed. |
| Manual fallback | Manual fallback retest passed with queue trigger disabled: fresh job started queued/pending, processor returned `processed=1` and `completed=1`, completed unlock rendering passed. |
| Queue dashboard | Owner observed Preview queue `paid-generation-jobs`: received 2, deleted 2, max message age 0ms, no backlog or retry storm. |
| Production fail-closed posture | Production health remains `main/1990fc034d74`; checkout and fake-paid routes return JSON `404 not_found`; production queue flags absent. |
| Merchant-review content | Production homepage, `/refund`, and `/legal` are live with product/service/price/refund/support content. |

Readiness judgment:

- Engineering foundation is staging-proven for fake-paid and queue/manual delivery paths.
- Production payment launch is still blocked by provider/business approval and a controlled provider E2E.
- Public launch should not proceed directly from review approval without a dry-run and controlled smoke.

## 2. Hard Launch Blockers

Production payment runtime must remain disabled until all hard blockers are closed:

| Blocker | Required Evidence |
|---|---|
| NewebPay merchant review approved | Formal approval or explicit go-ahead from NewebPay. |
| Production credentials available | Production MerchantID, HashKey, HashIV, and gateway target confirmed by owner; values must stay out of repo. |
| Gateway mode confirmed | Sandbox vs production URL and expected payload fields confirmed. |
| Production URLs confirmed | NotifyURL and ReturnURL use official production domain and route paths. |
| Provider E2E completed | Sandbox E2E or controlled NT$49 real-payment smoke verifies checkout → NotifyURL → paid transition → delivery → queue/manual result access. |
| Production env configured fail-closed first | Provider env can be configured while `ENABLE_PAYMENT_RUNTIME=false`; production still returns fail-closed checks before launch. |
| Refund/support SOP confirmed | `hello@anyu.tw` monitored; duplicate/stuck/failed-result workflow agreed. |
| Manual recovery SOP confirmed | `INTERNAL_JOB_SECRET` available only to operator; manual processor path tested and documented. |
| Queue dashboard/SOP confirmed | Queue topic and dashboard observation confirmed; manual fallback remains available. |
| Price consistency verified | Homepage/refund/legal/checkout item/NewebPay amount all match NT$49 or approved final price. |
| Stop-loss rules defined | Clear pause thresholds and owner response path exist. |
| Main/staging release posture confirmed | Decide whether docs/staging commits should be promoted to `main` before production runtime launch. |

## 3. Recommended Launch Sequence

### Phase L0: Pre-Approval Readiness

- Keep `ENABLE_PAYMENT_RUNTIME=false`.
- Keep public merchant-review content live.
- Prepare provider credential checklist, without storing values in repo.
- Prepare smoke checklist and rollback commands.
- Confirm `hello@anyu.tw` monitoring and refund owner.
- Confirm Vercel project/domain source of truth remains `anyu-next`.

### Phase L1: Sandbox E2E, If Available

- Configure Preview(`staging`) sandbox provider env values only.
- Keep branch-scoped Preview(`staging`) env authoritative.
- Run checkout creation → NewebPay sandbox payment → NotifyURL verification → paid transition → delivery artifacts → queue completion → session-bound access.
- Verify ReturnURL `pcs_` handoff waiting/processing/ready behavior.
- Verify duplicate NotifyURL idempotency.
- Verify invalid/malformed callback rejection does not mutate payment state.
- Verify manual fallback still works if queue delivery is disabled or unavailable.

### Phase L2: Production Config Dry-Run

- Configure Production provider env values with payment runtime still disabled.
- Keep `ENABLE_PAYMENT_RUNTIME=false` and `ENABLE_NEWEBPAY_CHECKOUT=false` unless an operator-only controlled smoke gate is explicitly available.
- Verify production `/api/health` remains production/main.
- Verify production checkout and fake-paid routes still fail closed.
- Verify no Production queue trigger is enabled unless explicitly part of the controlled smoke plan.
- Do not run real payment in this phase.

### Phase L3: Controlled Production Payment Smoke

- Enable the minimum production flags needed for one controlled internal/operator payment path.
- Perform one NT$49 payment only after owner approval.
- Verify provider NotifyURL reaches production route and passes signature checks.
- Verify payment intent transitions to paid once.
- Verify entitlement, paid access token hash, generation job, queue completion, and session-bound access.
- Verify duplicate NotifyURL is idempotent.
- Verify manual fallback can recover if queue does not complete.
- Immediately disable runtime if abnormal thresholds are hit.

### Phase L4: Limited Public Availability

- Enable public checkout for low-key organic traffic only.
- No ads or broad campaign traffic.
- Monitor the first N payments manually.
- Keep stop-loss thresholds active.
- Keep manual support/recovery path ready.

### Phase L5: Broader Traffic / Ads Unblock

- Start only after a stable low-key payment window.
- Cap ad spend.
- Monitor payment errors, queue failures, generation failures, support volume, and API cost.
- Roll back immediately if thresholds are crossed.

## 4. Feature Flag / Env Launch Matrix

Names only; no values.

| Env / Flag | Preview(`staging`) | Production Before Launch | Controlled Smoke | After Launch | Fail-Closed Behavior |
|---|---|---|---|---|---|
| `ENABLE_PAYMENT_RUNTIME` | `true` only for staging payment QA when approved | `false` | minimal approved value | enabled only after launch decision | checkout/provider mutation disabled |
| `ENABLE_NEWEBPAY_CHECKOUT` | enabled only for staging checkout QA | `false` | enabled only for controlled smoke path | enabled if public checkout launched | checkout route returns not found/disabled |
| `ENABLE_PAID_JOB_QUEUE_TRIGGER` | `true` for queue QA; can be set `false` for manual fallback smoke | absent/false | usually `true` if queue smoke is part of payment smoke | `true` if queue launch approved | paid artifacts remain, manual fallback possible |
| `PAID_JOB_QUEUE_PROVIDER` | `vercel_queue` for queue QA | absent/none | `vercel_queue` if enabled | `vercel_queue` | no external enqueue |
| `PAID_JOB_QUEUE_TOPIC` | `paid-generation-jobs` or approved topic | absent unless dry-run configured | required if queue enabled | required if queue enabled | provider config missing/no enqueue |
| `NEWEBPAY_MERCHANT_ID` | sandbox/staging value if available | production value can be configured while runtime off | production value | production value | provider config missing blocks checkout/notify |
| `NEWEBPAY_HASH_KEY` | sandbox/staging value if available | production value can be configured while runtime off | production value | production value | signature/decrypt fails closed |
| `NEWEBPAY_HASH_IV` | sandbox/staging value if available | production value can be configured while runtime off | production value | production value | signature/decrypt fails closed |
| `NEWEBPAY_CHECKOUT_URL` | sandbox URL if available | production URL configured while runtime off | production URL | production URL | checkout config missing |
| `NEWEBPAY_RETURN_URL` | staging ReturnURL | production ReturnURL | production ReturnURL | production ReturnURL | checkout config missing or safe fallback |
| `NEWEBPAY_NOTIFY_URL` | staging NotifyURL | production NotifyURL | production NotifyURL | production NotifyURL | checkout config missing or callback not matched |
| `NEWEBPAY_ENVIRONMENT` | sandbox/staging label | production label | production label | production label | diagnostics only; avoid behavior ambiguity |
| `PAID_ACCESS_TOKEN_HASH_SECRET` | required for staging paid delivery | required before any production paid delivery | required | required | delivery artifact creation fails closed |
| `PAYMENT_CHECKOUT_SESSION_SECRET` | required for `pcs_` handoff | required before production checkout | required | required | checkout session/status invalid |
| `INTERNAL_JOB_SECRET` | required for manual fallback QA | required before launch | required | required | manual processor unauthorized |
| `OPERATOR_TEST_SECRET` | required for fake-paid QA | absent unless explicitly needed for operator QA; route must still fail closed | optional operator-only | optional/disabled | operator fake-paid route unauthorized/not found |
| Vercel queue config | route trigger configured in code | deploy config present but flags off | active if queue enabled | active if queue enabled | no queue publish if flags off |

Operational warning:

- Branch-scoped Preview(`staging`) env values override general Preview. Always inspect Preview(`staging`) explicitly for staging QA.

## 5. Smoke Checklist

### Staging Sandbox Smoke

- Confirm staging health: Preview, branch `staging`, expected route bundle.
- Confirm Preview(`staging`) sandbox provider env names exist, values hidden.
- Create checkout from a valid source result/session.
- Confirm pending `payment_intent` and provider payload/form contract.
- Complete sandbox payment.
- Confirm NotifyURL verified and paid transition occurred once.
- Confirm delivery artifacts exist: entitlement, paid access token hash, generation job.
- Confirm queue enqueued and completed exact `generationJobId`.
- Confirm ReturnURL/session status moves waiting → processing → ready.
- Confirm paid access page renders completed report.
- Repeat NotifyURL payload if safe and verify idempotency.
- Send malformed/invalid callback fixture and verify no paid mutation.
- Disable queue temporarily if needed and verify manual fallback.

### Production Controlled Smoke

- Confirm owner has approved one controlled real payment.
- Confirm public runtime was enabled only for the intended smoke window/path.
- Confirm amount is NT$49 or approved final price.
- Confirm NewebPay transaction appears in merchant backend.
- Confirm production NotifyURL verified and transitioned payment to paid.
- Confirm paid delivery artifacts were created.
- Confirm queue completion or manual fallback completion.
- Confirm paid access page renders completed result.
- Confirm support/refund path is available if the smoke needs reversal or support note.
- Immediately close runtime if any hard failure occurs.

### Failure / Duplicate Notify Smoke

- Duplicate successful NotifyURL does not duplicate entitlement or generation job.
- Invalid signature does not mark paid.
- Amount mismatch does not mark paid.
- Merchant/order mismatch does not mark paid.
- Failed/cancelled provider status does not mark paid.
- ReturnURL remains read-only and non-mutating.

### Queue Completion Smoke

- Queue trigger result is `enqueued`.
- Vercel Queues dashboard shows receive/delete activity.
- No backlog or retry storm.
- Paid status becomes completed without manual processor.
- Manual fallback remains available.

### Refund / Support Manual Path

- Support inbox receives test contact or is confirmed monitored.
- Owner can identify an order safely using customer-provided order reference/email/time, not secrets or raw tokens.
- Owner knows how to handle duplicate payment, paid-but-no-result, stuck processing, and refund-after-delivery requests.

## 6. Rollback / Disable Plan

Primary rollback posture:

1. Set `ENABLE_PAYMENT_RUNTIME=false`.
2. Set `ENABLE_NEWEBPAY_CHECKOUT=false` if separate gate is present.
3. Set `ENABLE_PAID_JOB_QUEUE_TRIGGER=false` if queue behavior is involved in the incident.
4. Keep public merchant-review/product pages live.
5. Keep ReturnURL/status/access pages available for already-started valid sessions when safe.
6. Use manual processor fallback for paid jobs that are accepted but not completed.
7. If payment was accepted and result cannot be delivered, process support/refund manually.

Communication/support posture:

- Acknowledge payment issue through `hello@anyu.tw`.
- Do not ask users for raw tokens or sensitive payment credentials.
- Ask for safe identifiers only: approximate payment time, order email if provided, merchant order number shown by provider if available, and contact email.
- Resolve by manual recovery first when possible; refund if delivery cannot be completed.

## 7. Stop-Loss Rules

Suggested one-person-company thresholds:

| Area | Pause Condition |
|---|---|
| Payment errors | 2 failed/abnormal payments in a row or >10% payment error rate during low volume. |
| NotifyURL verification | any unexplained signature/merchant/amount mismatch on a real payment. |
| Generation failures | 2 paid jobs fail final generation in the launch window. |
| Queue backlog | any paid job remains queued/processing beyond expected window without manual explanation. |
| Queue retries | repeated retry loop or dashboard backlog visible. |
| API cost | unexpected model/API spend spike or per-result cost materially exceeds pricing assumptions. |
| Support volume | more support requests than owner can answer same day during early launch. |
| Ad spend | no paid ads beyond a small capped budget until low-key organic payments are stable. |
| Security/privacy | any suspected token leak, provider payload exposure, or raw input exposure. |

Immediate pause actions:

- Disable payment runtime.
- Preserve logs and safe IDs for diagnosis.
- Recover or refund affected users.
- Do not resume until root cause is documented.

## 8. Monitoring / Observability

Watch during smoke and early launch:

- Vercel deployment health and logs.
- Vercel Queues dashboard for `paid-generation-jobs`.
- `payment_intents` status distribution.
- `entitlements` creation and duplicate behavior.
- `generation_jobs` queued/processing/completed/failed distribution.
- Paid-result status endpoint behavior.
- NewebPay merchant backend orders/callback status.
- `hello@anyu.tw` support inbox.
- AI/API provider usage and cost.

Do not record in repo:

- Provider credentials.
- Raw provider payloads.
- Decrypted provider payloads.
- Raw paid access tokens.
- `pcs_` tokens.
- Tokenized URLs.
- Raw user input.
- Private billing or customer data.

## 9. Customer Support / Refund SOP

Duplicate payment:

- Verify safe order references in NewebPay merchant backend and internal payment records.
- Refund duplicate charge if confirmed.
- Keep one delivered report active if applicable.

Paid but no result:

- Check payment status, entitlement, and generation job status.
- Run manual processor fallback if the job is queued/retryable.
- If generation cannot be completed, offer refund.

Result stuck processing:

- Check queue dashboard and generation job status.
- Run manual processor once.
- Escalate if repeated failure or non-retryable error appears.

AI generation failure:

- Attempt safe retry if allowed by job state.
- If result remains unavailable due to system issue, refund is eligible under current refund policy direction.

Customer asks for refund after result delivered:

- Apply published digital-content policy: once the paid digital report has been generated and made available, refund may not be available solely due to subjective preference.
- Owner should still review edge cases manually.

Safe customer info to request:

- Contact email.
- Approximate payment time.
- Provider order/reference number if visible to customer.
- Screenshot of provider confirmation only if needed and redacted by customer where possible.

Do not request:

- Card numbers.
- Provider secrets.
- Raw paid access tokens.
- Tokenized URLs.
- Sensitive personal details unrelated to support.

## 10. Open Questions

- Should sandbox E2E run before formal merchant approval if sandbox credentials become available, or only after approval?
- Is controlled production smoke allowed immediately after approval?
- Is NT$49 the final launch price across homepage, checkout amount, and NewebPay item name?
- Should refund handling window be 3-7 business days or another owner-confirmed window?
- Is `hello@anyu.tw` actively monitored with same-day response during launch window?
- Has old Vercel `anyu` project/domain ambiguity been fully cleaned up in the dashboard?
- Should recent docs/staging commits be promoted to `main` before production runtime launch?
- What is the first-launch payment volume cap or stop-loss count?

## 11. Recommended Next Task

Decision tree:

- If sandbox credentials are available: **NewebPay Sandbox E2E Smoke v0**.
- If formal review is approved: **Production Payment Config Dry-Run v0**.
- If still waiting for review: **Support/Refund SOP Finalization v0** or **Production Env Preflight Script v0**.

Recommended immediate next step while waiting:

- Finalize support/refund SOP and owner response timing, because it is required regardless of sandbox/prod launch path.

## Tech Debt Review

New technical debt introduced:

- None; documentation-only task.

Existing technical debt observed:

- Local `.git/FETCH_HEAD` permission issue remains unresolved.
- Old Vercel project/domain ambiguity remains an owner UI cleanup item.
- Recent docs-only `staging` commits may need a `main` promotion decision before production runtime launch.

Opportunistic cleanup completed:

- Consolidated launch gates, smoke checklist, rollback posture, and stop-loss thresholds into one reviewable plan.

Deferred cleanup candidates:

- Add an executable production env preflight script that checks env-name presence and fail-closed route behavior without printing values.
- Add a launch decision record from the production launch template once NewebPay approval is available.
