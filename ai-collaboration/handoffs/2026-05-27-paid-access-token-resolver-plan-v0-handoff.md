# Handoff: Paid Access Token Resolver Plan v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Create a planning-only document for the `pa_` paid access token resolver before implementing checkout/provider runtime code.

Payment runtime is not enabled. NewebPay provider review is still pending.

## Context

NewebPay Runtime Integration Plan v0 recommended:

- NotifyURL as payment truth.
- ReturnURL as UX/pending only.
- Verified payment → `payment_intent` paid → entitlement + `pa_` token → `generation_jobs` → trigger-only queue → unlocked route polling.
- Top-level `ENABLE_PAYMENT_RUNTIME` gate plus optional checkout/queue flags.
- Trigger-only QStash-style queue payload.
- No payment runtime implementation yet.

Current foundation:

- `payment_intents` / `entitlements` schema implemented and migrated to staging + production.
- `generation_jobs` schema implemented and migrated to staging + production.
- Paid generation job mirror exists and passed staging flag-on verification.
- Processor endpoint exists and passed staging processor smoke.
- Production processor remains disabled.
- Cron wrapper exists but Vercel Hobby Cron is daily-only and must not be the main paid generation trigger.
- `pa_` entitlement token resolver is still missing.
- Entitlement uniqueness by `payment_intent_id` is currently service-level only.

## Scope

Planning only.

Do:

- Plan token model.
- Plan resolver contract.
- Plan access states.
- Plan security/privacy boundaries.
- Plan idempotency/recovery.
- Plan web polling contract.
- Plan DB constraints/follow-up migrations.
- Plan integration boundaries with future NewebPay notify, generation jobs, queue trigger, refunds, and revocations.
- Create research plan, execution report, summary log.
- Run standard validation.
- Commit and push docs to `origin/staging`.

Do not:

- Enable payment runtime.
- Implement checkout.
- Implement NewebPay notify/return endpoints.
- Write or change migrations.
- Change production flags.
- Change Module 01 prompt/result behavior.
- Change public legal/provider review copy.
- Add LINE delivery behavior.
- Rely on Vercel Hobby Cron as primary paid generation trigger.

## Deliverables

- `ai-collaboration/research/2026-05-27-paid-access-token-resolver-plan-v0.md`
- `ai-collaboration/reports/2026-05-27-paid-access-token-resolver-plan-v0-execution-report.md`
- `ai-collaboration/summaries/summary_log.md`

## Expected Recommendation

Prefer implementing a minimal `pa_` token resolver and operator-only fake paid success flow before NewebPay provider runtime implementation, unless planning discovers a strong reason to reverse that order.

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

No Playwright required unless code changes.

## Commit

```bash
git commit -m "docs: plan paid access token resolver"
git push origin HEAD:staging
```
