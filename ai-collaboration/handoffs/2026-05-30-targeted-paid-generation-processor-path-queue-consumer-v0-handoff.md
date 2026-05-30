# Targeted Paid Generation Processor Path for Queue Consumer v0 Handoff

Date: 2026-05-30

## Task

Add a targeted paid generation processor path so Vercel Queues consumer messages process the exact `generationJobId` from the queue payload.

## Scope

In scope:

- Inspect paid generation processor, generation job DB helpers, internal processor routes, queue consumer, and tests.
- Add targeted processor entrypoint for a specific paid generation job id.
- Update queue consumer to call the targeted entrypoint.
- Preserve manual `/api/internal/jobs/process` generic processing behavior.
- Add/update targeted tests and docs.
- Commit and push to `origin/staging` if validation passes.

Out of scope:

- Payment runtime enablement.
- Production flag/env changes.
- Vercel env changes or deployment.
- Queue provider changes beyond consumer targeting.
- LINE delivery.
- NewebPay checkout/notify/payment behavior changes.
- Module 01 prompt/result behavior or public copy changes.

## Constraints

- Do not expose raw input, raw `pa_`, `pcs_`, provider payloads, tokenized URLs, secrets, or private values.
- Manual processor fallback must remain compatible.
- Queue payload remains DB-reference-only.
- No real payments or live queue smoke in this task.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- Targeted queue/processor tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Completion Notes

- Added targeted DB claim helper for a specific due paid-analysis job id.
- Added `processPaidAnalysisJobById(...)`.
- Updated queue consumer to process the exact `generationJobId` from the queue payload.
- Preserved generic manual processor fallback behavior.
- Live Vercel Queues staging smoke remains the next step.
