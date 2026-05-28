# Queue / Worker Strategy Evaluation v0

Date: 2026-05-27

## 1. Summary

Recommendation:

- Short-term: keep the existing `generation_jobs` table, processor endpoint, cron wrapper, and manual/operator processing. Do not add an external queue before real payment is approved.
- Payment launch: prefer a QStash-like webhook queue over Vercel Cron as the primary near-realtime trigger, if its signing/retry model is accepted and a staging proof passes.
- Scale-up: revisit Inngest or Trigger.dev when follow-up sessions, multi-step workflows, or Module 02 create real workflow complexity. Dedicated workers and Cloud Tasks/Cloud Run remain deferred unless volume or reliability requirements justify extra operations.

Core reason:

- Current Vercel Hobby Cron is daily and imprecise, so it is not suitable for interactive paid-generation latency. Vercel Pro Cron is a minimal-change option, but it is still scheduled polling. QStash is more aligned with near-realtime serverless delivery while keeping the existing Vercel + Neon architecture.

## 2. Why Reassessment Is Needed

Phase 3D showed the practical limit:

- Requested `*/5 * * * *` cron failed on the current Vercel Hobby account.
- Vercel's official cron limits state Hobby cron can run only once per day and timing is not precise within the hour: [Vercel Cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing).

That makes daily cron useful for:

- recovery
- disabled/no-op readiness
- stale lock cleanup
- operational heartbeat

It does not make daily cron suitable for:

- interactive paid pending page delivery
- post-payment generation that users expect within seconds/minutes
- LINE fulfillment where the user is actively waiting

## 3. Current Durable Assets

Keep:

- `generation_jobs` table
- dedupe/lifecycle repository helpers
- atomic claim with `FOR UPDATE SKIP LOCKED`
- stale lock recovery
- `POST /api/internal/jobs/process`
- `GET /api/cron/paid-generation`
- `analysis_paid_results` as delivery truth
- pending status route/poller

Likely future changes:

- Add one enqueue/publish adapter when payment launch requires near-realtime durability.
- Add a queue-auth adapter if using a webhook queue provider.
- Keep the processor service as the single place that claims due jobs and writes paid results.

## 4. Evaluation Criteria

Scoring dimensions:

- User-perceived latency
- Delivery reliability
- Fit with current architecture
- Fixed cost
- Maintenance burden
- Vercel compatibility
- Future flexibility
- Operational safety
- Privacy/security

Privacy rule:

- Queue payloads must contain only safe references such as `jobType` and an internal job reference.
- Never put raw input, paid-result JSON, provider output, LINE IDs, short codes, unlock tokens, tokenized URLs, email, or secrets into queue payloads.

## 5. Option A — Request Kick + Manual/Daily Recovery

Shape:

```text
request/payment/LINE event
→ create generation_jobs row
→ best-effort kick internal processor immediately
→ pending page polls
→ manual operator or daily cron recovers missed jobs
```

Evaluation:

- Latency: good when the kick succeeds.
- Reliability: better than pure synchronous generation, but missed kicks can wait too long on Hobby daily cron.
- Fit: excellent; uses current code.
- Cost: lowest.
- Maintenance: lowest.
- Safety: acceptable before real payment, weaker after real payment.

Recommendation:

- Acceptable for beta and staging.
- Not enough as the only paid-launch guarantee once users pay real money.

## 6. Option B — Vercel Pro Cron

Shape:

```text
upgrade Vercel
→ cron every 1–5 minutes
→ calls /api/cron/paid-generation
→ processor claims due jobs
```

Verified facts:

- Vercel Cron is available on all plans.
- Hobby is limited to once per day.
- Pro supports once-per-minute cron and per-minute scheduling precision: [Vercel Cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing).

Evaluation:

- Latency: bounded by cadence; 1 minute can be acceptable, 5 minutes feels slow for paid interactive delivery.
- Reliability: simple and predictable, but still polling.
- Fit: excellent; existing cron wrapper is ready.
- Fixed cost: Vercel plan cost.
- Maintenance: low.
- Lock-in: low to moderate, since the processor remains in app code.

Recommendation:

- Good fallback if staying all-in on Vercel is more important than event-driven latency.
- Not ideal as the long-term primary trigger if payment and LINE fulfillment need "starts within seconds."

## 7. Option C — QStash / Webhook Queue

Shape:

```text
request/payment/LINE event
→ publish safe job reference to QStash
→ QStash calls a processor webhook immediately and retries on failure
→ processor claims due jobs and writes paid result
```

Verified facts:

- Upstash describes QStash as serverless messaging/scheduling that calls endpoints, guarantees delivery, and performs automatic retries: [QStash getting started](https://upstash.com/docs/qstash/overall/getstarted).
- QStash free tier lists 1,000 messages/day; pay-as-you-go is listed at $1 per 100K messages: [QStash pricing](https://upstash.com/docs/qstash/overall/pricing).
- QStash supports signature verification via `Upstash-Signature`: [QStash signature verification](https://upstash.com/docs/qstash/howto/signature).
- QStash retries non-2xx deliveries and supports retry/backoff controls: [QStash retry docs](https://upstash.com/docs/qstash/features/retry).

Evaluation:

- Latency: strong; event-triggered.
- Reliability: strong for webhook delivery/retry; app still needs idempotent processor claim.
- Fit: good; can call Vercel endpoint and keep `generation_jobs`.
- Fixed cost: low at current expected volume.
- Maintenance: moderate; new vendor, token, signing keys, route tests, DLQ review.
- Lock-in: moderate but bounded if the queue adapter remains thin.

Recommendation:

- Best payment-launch candidate if owner accepts one new vendor.
- Implement only after NewebPay approval/payment launch is real.

## 8. Option D — Inngest

Shape:

```text
app sends event
→ Inngest durable function handles retry/workflow
→ writes result back to Neon
```

Verified facts:

- Inngest pricing lists Hobby at $0/month with 50,000 executions, 5 concurrent steps, logs/traces/observability, and Pro starting at $75/month: [Inngest pricing](https://www.inngest.com/pricing).

Evaluation:

- Latency: strong; event-driven.
- Reliability: strong durable workflow model.
- Fit: moderate; different programming model and more rewrite than QStash.
- Cost: free tier may fit early use.
- Maintenance: moderate; new framework/runtime concepts.
- Future flexibility: high for multi-step follow-up workflows.

Recommendation:

- Do not use for simple `paid_analysis` launch unless QStash is rejected.
- Revisit for 3-day follow-up, multi-step relationship packs, and cross-channel workflows.

## 9. Option E — Trigger.dev

Shape:

```text
app triggers background task
→ Trigger.dev runs task/retry/logs
→ task writes result back
```

Verified facts:

- Trigger.dev pricing lists Free at $0/month with monthly usage credit and Hobby at $10/month; it states tasks run on Trigger.dev infrastructure with no timeouts and can be self-hosted: [Trigger.dev pricing](https://trigger.dev/pricing).

Evaluation:

- Latency: strong.
- Reliability: strong for long-running/background tasks.
- Fit: moderate; task code deployment model is more involved than webhook queue.
- Cost: low-to-moderate depending on run duration.
- Future flexibility: high for AI workflows.

Recommendation:

- Good future workflow platform candidate.
- Heavier than needed for near-term one-shot paid analysis.

## 10. Option F — Dedicated Worker

Shape:

```text
Vercel app writes generation_jobs row
→ long-lived worker polls Neon or consumes queue
→ worker calls provider and writes result
```

Verified facts:

- Railway plans start with Free and Hobby at $5/month, with usage-based resources: [Railway pricing plans](https://docs.railway.com/pricing/plans).
- Fly.io uses pay-as-you-go Machines; small shared CPU machine examples are low monthly cost but require billing and operational setup: [Fly pricing](https://fly.io/docs/about/pricing/).
- Render supports background workers and compute-based services; pricing depends on compute/service selection: [Render pricing](https://render.com/pricing), [Render background workers](https://render.com/docs/background-workers/).

Evaluation:

- Latency: strong if polling interval is short or queue-backed.
- Reliability: strong if supervised well.
- Fit: moderate; moves processor out of Vercel request lifecycle.
- Fixed cost: likely low but non-zero.
- Maintenance: highest among realistic near-term options; deploys, restarts, secrets, monitoring, DB connections.

Recommendation:

- Premature for ANYU now.
- Revisit if volume grows or provider generation needs exceed Vercel function constraints.

## 11. Option G — Cloud Tasks / Cloud Run

Shape:

```text
app enqueues Cloud Task
→ Cloud Task calls HTTP handler / Cloud Run service
→ processor runs
```

Verified facts:

- Cloud Tasks pricing lists first 1M billable operations per month free, then $0.40 per million up to 5B: [Cloud Tasks pricing](https://cloud.google.com/tasks/pricing).

Evaluation:

- Latency: strong.
- Reliability: strong managed queue semantics.
- Fit: weak-to-moderate; introduces GCP project/IAM/service account/Cloud Run operations.
- Cost: low usage cost but higher setup complexity.
- Maintenance: high for one-person side project.

Recommendation:

- Technically strong but too heavy now.
- Defer unless ANYU moves more infrastructure onto GCP.

## 12. Comparison Table

| Option | Latency | Reliability | Fit | Fixed Cost | Maintenance | Recommendation |
|---|---|---|---|---:|---|---|
| Request kick + manual/daily recovery | Seconds if kick works | Medium | Excellent | $0 | Low | Short-term beta only |
| Vercel Pro Cron | 1–5 min cadence | Medium-high | Excellent | Plan cost | Low | Good fallback |
| QStash / webhook queue | Seconds | High | Good | Low | Medium | Best payment-launch candidate |
| Inngest | Seconds | High | Medium | Free/Pro | Medium | Future workflows |
| Trigger.dev | Seconds | High | Medium | Free/Hobby/usage | Medium | Future AI tasks |
| Dedicated worker | Seconds | High | Medium | Low fixed | High | Premature |
| Cloud Tasks / Cloud Run | Seconds | High | Lower | Low usage | High | Defer |

## 13. Short-term Recommendation

Before real payment:

- Keep current `generation_jobs` + processor.
- Keep daily Vercel cron as recovery/readiness only.
- Use manual/operator processor and staging-only request kicks for smoke tests.
- Do not integrate external queue yet.
- Do not make request routes enqueue-only.

Decision trigger to move:

- NewebPay approval is complete and owner wants real paid delivery.
- Paid result must start within seconds after payment/LINE claim.
- Manual recovery is no longer acceptable.

## 14. Payment-launch Recommendation

Recommended candidate:

- QStash-like webhook queue with safe payload and signed webhook verification.

Implementation shape:

```text
payment success / LINE claim / web unlock
→ create/reuse generation_jobs row
→ publish safe reference to queue
→ queue calls /api/internal/jobs/process or a queue-specific webhook adapter
→ processor claims due paid_analysis job
→ pending page polls existing status route
```

Payload rule:

```json
{
  "jobType": "paid_analysis"
}
```

If a job reference is included, it must be an internal opaque reference only and never shown in user-facing output or reports.

Why QStash first:

- Event-triggered.
- No long-lived worker.
- Low expected cost at current volume.
- Fits Vercel serverless endpoints.
- Existing processor idempotency remains useful.

Fallback if QStash is rejected:

- Vercel Pro Cron at 1-minute cadence, with `limit=1`, until volume or workflow complexity justifies a real queue/workflow platform.

## 15. Scale-up Recommendation

Reassess Inngest or Trigger.dev when ANYU has:

- 3-use packs
- 3-day follow-up sessions
- multi-step reminder/fulfillment workflows
- Module 02 with different background tasks
- need for visual workflow observability and retries

Reassess dedicated worker/Cloud Run when:

- Vercel function limits become a real bottleneck
- provider generation is too long for serverless calls
- queue volume is high enough to justify operational overhead

## 16. Security / Privacy Notes

Hard rules:

- Queue messages carry only safe references.
- Processor fetches context server-side from DB.
- Webhook queue requests must verify provider signatures.
- Do not put raw input, paid-result JSON, provider output, LINE IDs, short codes, unlock tokens, tokenized URLs, email, or secrets into queue payloads.
- Reports may include only aggregate counts and safe categories.
- Existing `analysis_paid_results` remains the delivery source of truth.

## 17. What Not To Build Yet

Do not implement yet:

- external queue integration
- Vercel plan upgrade
- dedicated worker deployment
- payment-success enqueue
- request-route enqueue-only
- LINE enqueue-only
- admin retry UI
- general workflow platform
- dashboard
- new module/follow-up flows
- ads/payment activation

## 18. Recommended Next Step

Wait for NewebPay review outcome. If payment is approved and owner wants real paid delivery, run a focused QStash proof-of-concept handoff:

- no raw payloads
- signed webhook verification
- staging only
- one synthetic `paid_analysis` job
- prove enqueue-to-completed path
- keep current processor and status route
