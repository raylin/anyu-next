# Vercel Queues Staging Smoke / Phase 4B.2 v0 Handoff

Date: 2026-05-30

## Task

Run a safe Preview(`staging`) Vercel Queues smoke for paid generation, verifying that the queue-triggered processor handles the exact `generationJobId` from the queue payload.

## Scope

In scope:

- Verify git/source state and remote `staging`.
- Verify Vercel project/account context without printing tokens or env values.
- Configure or verify branch-scoped Preview(`staging`) queue env names when safe.
- Deploy or verify staging freshness for commit `13f88ca` or newer.
- Run secret-safe queue-trigger smoke if required local secrets are available.
- If the existing QA runner still invokes manual processor first, add a safe queue-smoke mode or separate local helper.
- Document sanitized pass/fail evidence.

Out of scope:

- Production runtime/flag changes.
- Production env changes.
- Real payments.
- LINE delivery.
- NewebPay behavior changes beyond minimal smoke support if needed.
- Module prompt/result or public copy changes.

## Constraints

- Do not print or commit secrets, queue credentials, raw `pa_`, `pcs_`, tokenized URLs, provider payloads, raw user input, private billing, or proof documents.
- Use Preview(`staging`) env, not Production.
- Manual processor fallback may be tested only if `INTERNAL_JOB_SECRET` is available.

## Validation Plan

- If code changes: `cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build`.
- If docs only: staging smoke checks, docs presence check, secret/private scan, `git diff --check`.
