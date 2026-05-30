# Force Align Preview(staging) QA Secrets and Run Queue + Manual Fallback QA v0 Handoff

Date: 2026-05-30

## Task

Force-align branch-scoped Preview(`staging`) QA secrets from the Codex shell, redeploy Preview, then run queue-mode and manual fallback fake-paid QA against staging.

## Scope

In scope:

- Verify repo/source and Vercel CLI context.
- Generate fresh staging-only `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` without printing values.
- Update only branch-scoped Preview(`staging`) values for those two QA secrets.
- Redeploy Preview/staging so env changes apply.
- Run queue-mode and manual-mode `qa:fake-paid` with sanitized output.
- Verify production fake-paid/checkout remain disabled.
- Document sanitized QA results.

Out of scope:

- Production runtime/flag/env changes.
- Real payments.
- NewebPay runtime behavior changes.
- LINE delivery.
- Module prompt/result or public copy changes.
- Queue/dashboard owner UI observation beyond safe CLI context.

## Constraints

- Do not print or commit `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, `VERCEL_TOKEN`, raw `pa_`, tokenized URLs, provider credentials, queue credentials, raw input, or private values.
- Do not update Production env or deploy Production.
- Do not change product/runtime behavior unless a minimal fix is required to complete the smoke and is explicitly documented.

## Validation Plan

- Staging health marker and production disabled HTTP checks.
- `QA_FAKE_PAID_PROCESSOR_MODE=queue corepack pnpm run qa:fake-paid`.
- `corepack pnpm run qa:fake-paid`.
- If no code changes: docs presence check, secret/private scan, `git diff --check`.
- If code changes unexpectedly: `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build`.

## Completion Notes

- Branch-scoped Preview(`staging`) `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` were regenerated and aligned from the Codex shell; values were not printed or committed.
- Preview(`staging`) was redeployed with explicit Vercel team scope after a first redeploy attempt without scope failed.
- Queue-mode `qa:fake-paid` passed with `vercel_queue` enqueue and completed paid unlock rendering.
- Manual fallback was first attempted with queue still enabled, but the queue completed the job before manual processor work; this confirmed auth but not fallback processing.
- Added QA-only `QA_FAKE_PAID_INPUT_SUFFIX` support to force a fresh source result.
- Temporarily set Preview(`staging`) `ENABLE_PAID_JOB_QUEUE_TRIGGER=false`, redeployed, ran manual fallback on a fresh source, confirmed `processed=1` and `completed=1`, then restored `ENABLE_PAID_JOB_QUEUE_TRIGGER=true` and redeployed Preview(`staging`).
- Production remained disabled: production health stayed `main/1990fc034d74`, fake-paid and checkout routes returned JSON `404 not_found`, and Production env listing did not include queue flags.
