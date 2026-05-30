# Manual Fallback Retest + Queue Dashboard Observation v0 Handoff

Date: 2026-05-30

## Task

Run and document Preview(`staging`) queue-mode sanity plus manual processor fallback retest and Vercel Queues dashboard observation, without changing production/runtime behavior.

## Scope

In scope:

- Verify staging freshness and production disabled posture.
- Run queue-mode `qa:fake-paid` if required local secrets are present.
- Run manual fallback `qa:fake-paid` path if `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` are present.
- Observe Vercel Queues dashboard/CLI/logs only through safe metadata and document whether dashboard-level evidence was available.
- Record sanitized QA results and gaps.

Out of scope:

- Production runtime/flag changes.
- Production or Preview env mutation.
- Real payments.
- NewebPay runtime behavior changes.
- LINE delivery.
- Module prompt/result or public copy changes.

## Constraints

- Do not print or commit secrets, queue credentials, raw `pa_`, `pcs_`, tokenized URLs, provider payloads, raw user input, private billing, or proof documents.
- Do not enable Production payment runtime or change Production flags.
- Do not rely on Vercel Hobby Cron as the primary trigger.

## Validation Plan

- If no code changes: staging/production HTTP checks, safe QA runs where secrets are present, docs presence check, secret/private scan, `git diff --check`.
- If code changes unexpectedly: `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build`.

## Completion Notes

- Staging freshness passed for Preview(`staging`) commit `0f9b7b8e0dc4` and route bundle `payment-foundation-2026-05-29`.
- Queue-mode and manual-mode QA runners were both blocked before authorized paths because this shell lacked `OPERATOR_TEST_SECRET`; manual fallback also lacked `INTERNAL_JOB_SECRET`.
- Vercel CLI verified account/project/deployment/env-name context, but dashboard-level queue metrics require owner UI access.
- Production disabled posture passed: production health remained `main/1990fc034d74`, merchant-review pages returned HTTP 200, and fake-paid/checkout routes returned JSON `404 not_found`.
