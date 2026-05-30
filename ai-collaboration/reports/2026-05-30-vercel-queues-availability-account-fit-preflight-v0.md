# Vercel Queues Availability / Account Fit Preflight v0

Date: 2026-05-30

## Executive Summary

Vercel Queues appears suitable for ANYU Phase 4B, with **medium-high confidence**:

- Official Vercel docs state Vercel Queues are in Beta and available on all plans.
- The `studioanyu-1488` account is authenticated in CLI.
- The local repo is linked to the Vercel `anyu-next` project.
- The project root is `apps/web`, Node.js is 24.x, and the app already uses Vercel production/preview deployments successfully.
- The `@vercel/queue` package is available on npm (`0.2.0`) and official docs use it for `send` and `handleCallback`.
- Vercel CLI `54.5.1` does not expose a dedicated `vercel queues` command, so dashboard-level availability was not directly inspectable from CLI without creating/configuring queue code.

Recommendation:

- Proceed with **Queue Trigger Integration Phase 4B.1: Vercel Queues Adapter v0** behind flags, but keep the implementation mocked/tested locally first and require owner to confirm the Vercel dashboard Queues tab/setup during staging configuration.
- Keep Upstash QStash as fallback if the dashboard setup blocks Vercel Queues for this project/account.

No queues were created. No queue messages were sent. No env values were changed. No deployment was run.

## 1. Source / Project State

Commands run:

- `pwd`
- `git rev-parse --show-toplevel`
- `git branch --show-current`
- `git status --short --branch`
- `git fetch origin --prune`
- `git rev-parse HEAD`
- `git rev-parse origin/staging`
- `git rev-parse origin/main`
- `git rev-list --left-right --count origin/main...origin/staging`

Findings:

| Check | Result |
| --- | --- |
| Repo root | `/Users/raylin/Projects/anyu-next` |
| Branch | `staging` |
| Local HEAD | `cba9208253aa3d49cf454aafec333f59e417e701` |
| `origin/staging` | `cba9208253aa3d49cf454aafec333f59e417e701` |
| `origin/main` | `1990fc034d745e7aaafdd34bb8221b494220d909` |
| Divergence | `0 1`, because the Phase 4B planning docs are on `staging` only |
| Worktree | Clean except this task's required handoff/report/summary docs during execution |

## 2. Vercel Account / Project Preflight

Commands run:

- `test -n "$VERCEL_TOKEN" && echo VERCEL_TOKEN_present || echo VERCEL_TOKEN_missing`
- `vercel --version`
- `vercel whoami`
- `.vercel/project.json` inspection with IDs redacted
- `vercel project inspect anyu-next`
- `vercel ls anyu-next`
- `vercel --help | rg -i "queue|queues|marketplace|integration|store|storage|workflow"`
- `vercel queues --help`

Findings:

| Check | Result |
| --- | --- |
| Vercel token | Present, value not printed |
| Vercel CLI | `54.5.1` |
| Account | `studioanyu-1488` |
| Linked project | `anyu-next` |
| Project owner | `studioanyu-1488's projects` |
| Project root directory | `apps/web` |
| Node.js version | `24.x` |
| Framework | Next.js |
| Build command | `corepack pnpm build` |
| Install command | `corepack pnpm install --frozen-lockfile` |
| Queue CLI command | No dedicated `vercel queues` command found |
| Recent deployments | Production and Preview deployments are active for `anyu-next` |

Package availability:

- `corepack pnpm view @vercel/queue version description --json` returned version `0.2.0`.
- `npm view` failed because the local npm cache has permission issues; this is a local tooling/cache issue, not queue availability evidence.

## 3. Vercel Queues Availability

Official documentation reviewed:

- `https://vercel.com/docs/queues`
- `https://vercel.com/docs/queues/quickstart`
- `https://vercel.com/docs/queues/api`
- `https://vercel.com/docs/queues/sdk`
- `https://vercel.com/docs/queues/pricing`
- `https://vercel.com/docs/queues/observability`
- `https://vercel.com/changelog/queues-now-supports-7-day-ttl`

Relevant official facts:

- Vercel Queues are documented as Beta and available on all plans.
- Queues use topics and consumer groups.
- Push-mode consumers are configured in `vercel.json` with an `experimentalTriggers` entry using `type: "queue/v2beta"`.
- Queue consumer functions have no public URL and can only be invoked by Vercel's internal queue infrastructure.
- Producer code uses `send` from `@vercel/queue`.
- Consumer code uses `handleCallback` from `@vercel/queue`.
- Local development requires Vercel project linking and pulled env/OIDC credentials for SDK auth.
- Deployed Vercel environments authenticate automatically.
- Vercel Queues support at-least-once delivery, retry/redelivery, message TTL, idempotency keys, and observability.
- Pricing is operation-based; Hobby includes the first 1,000,000 regional Queue API operations according to current docs.

Availability conclusion:

- **Plan availability:** likely yes, based on official docs saying all plans.
- **Project fit:** likely yes, because `anyu-next` is a Vercel Next.js project with Node 24.x and `apps/web` root.
- **Direct account/project activation confirmed:** not fully confirmed from CLI because there is no read-only `vercel queues` command in CLI `54.5.1`.
- **Dashboard action still required:** owner should open `anyu-next` > Observability > Queues or queue setup docs/dashboard after code lands to confirm queue visibility and metrics.

Confidence:

- Medium-high for implementation feasibility.
- Medium for account-specific operational readiness until the dashboard is checked or a staging smoke is run.

## 4. Integration Model for ANYU

Recommended model:

1. Publish from app code after paid delivery artifact creation, using the existing Phase 4A abstraction.
2. Use topic name `paid-generation-jobs` or equivalent.
3. Configure a non-public consumer route in `vercel.json`.
4. Consumer validates the trigger-only payload shape.
5. Consumer invokes the existing paid generation processor service in-process.
6. Existing `/api/internal/jobs/process` remains manual/operator recovery only.
7. DB remains source of truth for payment intent, entitlement, generation job, and paid result state.

Suggested consumer path:

- `apps/web/src/app/api/internal/queues/paid-generation/route.ts`

Suggested `vercel.json` trigger shape:

```json
{
  "functions": {
    "src/app/api/internal/queues/paid-generation/route.ts": {
      "experimentalTriggers": [
        {
          "type": "queue/v2beta",
          "topic": "paid-generation-jobs",
          "retryAfterSeconds": 60,
          "initialDelaySeconds": 0
        }
      ]
    }
  }
}
```

Path note:

- Because the Vercel project root is `apps/web`, `vercel.json` path entries should be written relative to `apps/web`. Confirm exact path during implementation with a build/deploy smoke because existing `apps/web/vercel.json` currently contains only cron definitions.

Payload:

```json
{
  "version": 1,
  "type": "paid_analysis_job_available",
  "paymentIntentId": "db-ref-only",
  "generationJobId": "db-ref-only",
  "moduleSlug": "ambiguous-temperature",
  "triggerSource": "newebpay_notify"
}
```

Payload exclusions:

- no raw user input
- no raw `pa_` token
- no `pcs_` checkout session token
- no unlock URL
- no provider payload
- no decrypted provider payload
- no provider credentials
- no queue credentials

## 5. Env / Config Names

Existing Phase 4A:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER`
- `PAID_JOB_QUEUE_PROVIDER`

Proposed Phase 4B Vercel Queues:

- `PAID_JOB_QUEUE_PROVIDER=vercel_queue`
- `PAID_JOB_QUEUE_TOPIC=paid-generation-jobs`
- `PAID_JOB_QUEUE_REGION`, optional only if explicit region targeting is needed

Likely not needed for deployed Vercel environments:

- Dedicated queue token env, because docs indicate deployed environments use Vercel/OIDC-backed SDK auth automatically.

Local development:

- Use `noop` or `test` by default.
- If local real queue sending is needed, run `vercel env pull` to get SDK auth context. Do not commit `.env.local`.

Preview(`staging`):

- Branch-scoped Preview(`staging`) env should be authoritative.
- Required for real staging smoke:
  - `ENABLE_PAID_JOB_QUEUE_TRIGGER=true`
  - `PAID_JOB_QUEUE_PROVIDER=vercel_queue`
  - `PAID_JOB_QUEUE_TOPIC=paid-generation-jobs`
  - existing processor/payment DB/paid access env vars

Production disabled deployment:

- `ENABLE_PAID_JOB_QUEUE_TRIGGER` absent or false.
- `PAID_JOB_QUEUE_PROVIDER` absent or `none`.
- Do not enable until launch decision.

Production launch:

- Same provider config as staging, plus payment runtime launch decision.
- Confirm queue observability and manual processor fallback before enabling.

## 6. Cost / Limits / Operational Risk

Observed from official docs:

- Beta on all plans.
- Operation-based billing.
- Hobby included Queue API operations: first 1,000,000 regional operations.
- Messages are metered in 4 KiB chunks.
- Idempotency-key sends and push deliveries with max concurrency can cost more units.
- Function compute invoked by queues is billed at normal compute rates.
- Message retention default is 24 hours in pricing docs, while the April 2026 changelog says max TTL/delay expanded to 7 days.
- Max message size is documented as 100 MB, but ANYU should keep messages tiny.
- At-least-once delivery means idempotent processor behavior is mandatory.
- Queue observability is available under project Observability > Queues.

ANYU operational fit:

- Strong fit for one-person operation if dashboard access is available.
- Low message volume expected initially.
- Manual processor fallback already exists.
- Main risk is beta product maturity and unfamiliar setup/debugging path.

Operational risks:

- Docs and product are Beta; behavior or SDK APIs may change.
- CLI cannot inspect queue status directly today.
- Local development real queue use requires pulled credentials and must not leak `.env.local`.
- At-least-once delivery can duplicate work if processor idempotency regresses.
- Consumer route configuration in `vercel.json` must be verified carefully in staging.

## 7. Phase 4B.1 Implementation Recommendation

Proceed with:

Queue Trigger Integration Phase 4B.1: Vercel Queues Adapter v0

Scope:

- Add `@vercel/queue` dependency.
- Add `vercel_queue` provider enum value.
- Add provider config parsing for `PAID_JOB_QUEUE_TOPIC` and optional `PAID_JOB_QUEUE_REGION`.
- Use `send(topic, payload, { idempotencyKey })`.
- Use deterministic idempotency key: `paid-job:<generationJobId>`.
- Add a queue consumer route using `handleCallback`.
- Configure `apps/web/vercel.json` queue trigger.
- Consumer validates payload and invokes existing processor service in-process.
- Keep `/api/internal/jobs/process` manual-only.
- Keep production disabled by default.

Testing:

- Mock `@vercel/queue` in unit tests.
- Test config missing, enqueue success, enqueue provider error, idempotency key, and payload safety.
- Test consumer payload validation.
- Test consumer invokes processor service for valid payload.
- Test invalid payload does not process.

Staging QA:

- First with `noop` provider.
- Then with `vercel_queue` in branch-scoped Preview(`staging`) only.
- Verify fake-paid creates job and queue processes it to ready.
- Verify manual processor fallback remains possible.
- Verify production remains disabled.

Fallback if Vercel Queues blocks setup:

- Use the already planned QStash path with a queue-specific public endpoint and signature verification.
- Do not expose `/api/internal/jobs/process` directly to QStash.

## 8. Owner / Dashboard Checks

Before or during Phase 4B.1 staging setup, owner should verify:

1. Vercel dashboard project `anyu-next` is selected under `studioanyu-1488`.
2. Observability tab includes Queues, or Queues setup is available.
3. Queue metrics appear after a staging smoke.
4. Branch-scoped Preview(`staging`) env values are set, not just general Preview.
5. Production env keeps queue trigger disabled.

## 9. Blockers

- No code blocker found for starting a mocked Vercel Queues adapter implementation.
- Account-specific availability is not fully proven until dashboard setup or first staging smoke.

## 10. Recommended Next Task

Queue Trigger Integration Phase 4B.1: Vercel Queues Adapter v0

Constraints for next task:

- No production enablement.
- No public payment runtime enablement.
- No real paid queue messages in production.
- Use mocked tests first.
- Run staging with branch-scoped Preview(`staging`) only after owner confirms dashboard/setup path.

## Sources

- Vercel Queues: https://vercel.com/docs/queues
- Vercel Queues Quickstart: https://vercel.com/docs/queues/quickstart
- Vercel Queues API Reference: https://vercel.com/docs/queues/api
- Vercel Queues SDK Reference: https://vercel.com/docs/queues/sdk
- Vercel Queues Pricing and Limits: https://vercel.com/docs/queues/pricing
- Vercel Queues Observability: https://vercel.com/docs/queues/observability
- Vercel Queues TTL changelog: https://vercel.com/changelog/queues-now-supports-7-day-ttl
