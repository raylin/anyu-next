# Support Ops DB URL Bootstrap v1 Handoff

## Date

2026-06-04

## Task

Bootstrap `SUPPORT_OPS_DATABASE_URL` safely for local/operator support lookup, verify staging support lookup against fresh Module 01 staging artifacts, and upgrade the staging baseline to pass only if lookup succeeds.

## Context

Module 01 Staging Baseline Completion v1 remains partial only because support lookup is blocked:

- real staging Email access-link message was sent once with owner approval
- owner confirmed Email receipt and `/r/` opened completed paid result
- real staging LINE access-link message was sent once with owner approval
- owner confirmed LINE receipt and `/r/` opened completed paid result
- `qa:access-link:smoke`, `qa:result-checkout:no-card`, `qa:line-access-link:smoke`, tests, and build passed
- local `DATABASE_URL` was checked and rejected because it does not point to the Preview clean access-link schema
- Vercel Preview env pull did not provide a usable local DB value for `SUPPORT_OPS_DATABASE_URL`

## Relevant Files

- `apps/web/scripts/qa-env-preflight.mjs`
- `apps/web/scripts/support-paid-result-lookup.mjs`
- `apps/web/src/tests/support-paid-result-lookup.test.ts`
- `ai-collaboration/reports/2026-06-04-support-ops-db-url-bootstrap-v1.md`
- `ai-collaboration/reports/2026-06-04-module-01-staging-baseline-completion-v1.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`
- `ai-collaboration/summaries/summary_log.md`

## Constraints

- Do not enable Production runtime or checkout.
- Do not run Production payment.
- Do not send Production or new staging Email/LINE unless explicitly necessary and approved.
- Do not modify Production env or DB.
- Do not print or commit DB URLs, secrets, tokenized URLs, raw Email, raw LINE ID, encrypted recipients, hashes, source text, or provider payloads.
- Do not silently use `DATABASE_URL` fallback.

## Tech Debt Policy For This Task

Do not broaden cleanup. Record recovery-named env/module aliases, production empty-secret validation, Vercel deploy guard hardening, and support DB URL bootstrap persistence as backlog.

## Planned Work

1. Verify Production remains frozen/fail-closed.
2. Try to make `SUPPORT_OPS_DATABASE_URL` available only to this operator process using a secure local/operator source or untracked temp source.
3. Run `qa:env:preflight -- support-ops-lookup`.
4. Identify safe staging artifact ids from v1 if support lookup can run.
5. Run `ops:paid-result:lookup` and verify sanitized usefulness.
6. If lookup succeeds, update baseline status to pass. If not, keep partial and classify failure.
7. Run required regression QA and documentation safety checks.
8. Create report, update summary/dashboard, commit, and push to `origin/staging`.

## Git Commit And Staging Push Rule

Every completed handoff should end with:

1. Run required validation.
2. Confirm `git status --short`.
3. Ensure no secrets, `.env`, raw user data, or unrelated changes are staged.
4. Commit task changes with a clear message.
5. Push the completed commit to the `staging` branch:

   ```bash
   git push origin HEAD:staging
   ```

6. Include both commit hash and push status in the final Codex Completion Summary.

If push is skipped or fails, report the reason clearly and do not claim staging was updated.

## Uncertainties

- Whether a safe local/operator source for the Preview(staging) DB URL is available without exposing the value.
- Whether support lookup can run without a small script change to consume an indirect untracked file path.
