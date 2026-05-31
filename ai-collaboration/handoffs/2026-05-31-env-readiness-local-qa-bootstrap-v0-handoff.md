# Env Readiness / Local QA Bootstrap v0 Handoff

## Date

2026-05-31

## Task

Create a secret-safe local/staging env readiness and QA bootstrap guide/tooling so future ANYU payment, queue, manual fallback, and NewebPay sandbox QA runs are repeatable and less error-prone.

## Context

ANYU has completed NewebPay sandbox E2E v5, Module 01 paid CTA launch alignment, support/refund/legal launch alignment, Vercel Queues smoke, manual fallback retest, and Core Engine / Module Grammar v0. Production payment runtime remains disabled.

Recurring operational friction:

- Local QA often blocks because `OPERATOR_TEST_SECRET` or `INTERNAL_JOB_SECRET` is missing locally.
- Vercel Preview(`staging`) branch-scoped env overrides general Preview env.
- NewebPay sandbox env must remain staging-only.
- Sandbox E2E helper exists, but local env readiness is still manual.
- Previous work repeatedly required force-aligning Preview(`staging`) env from secure local config.

## Relevant Files

- `apps/web/scripts/authorized-fake-paid-qa.mjs`
- `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs`
- `apps/web/package.json`
- `apps/web/.env.local` (presence only if needed; never print values)
- `ai-collaboration/reports/`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Constraints

- Do not enable payment runtime.
- Do not change production flags, Vercel env values, or deploy.
- Do not run real payments.
- Do not implement Module 02, homepage multi-module portal, LINE delivery, public copy changes, or runtime behavior changes.
- Do not commit secrets, credentials, raw tokens, tokenized URLs, raw user input, private billing, or proof documents.
- If checking `.env.local`, only check names/presence; never print values, lengths, prefixes, suffixes, hashes, or checksums.

## Tech Debt Policy For This Task

Adding a small presence-only QA preflight script is in scope. Runtime behavior, provider logic, product features, and env mutation are out of scope.

## Planned Work

1. Save this handoff.
2. Inspect current QA scripts and package commands for env requirements.
3. Add a secret-safe `qa:env:preflight` script if practical.
4. Document local QA env matrix and Preview(`staging`) cautions.
5. Run missing-env dry-run validation and requested relevant validation.
6. Create execution report.
7. Append `ai-collaboration/summaries/summary_log.md` and update dashboard if QA/tooling readiness changed.
8. Commit and push to `origin/staging`.

## Uncertainties

- Whether to add a safe `.env.qa.example`; default is no unless existing repo convention supports example env files.
- Whether future Vercel env alignment should become a separate tool; default for this task is preflight only, not mutation.
