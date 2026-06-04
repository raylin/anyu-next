# Module 01 Staging Baseline Completion v1 Handoff

## Date

2026-06-04

## Task

Complete the Module 01 Preview(staging) baseline from a user perspective after v0 ended partial.

## Context

Module 01 Staging End-to-End Stabilization Baseline v0 deployed the mandatory access-link save gate:

- desktop/non-mobile checkout-start shows Email only
- mobile/in-app checkout-start shows LINE first above Email fallback
- payment handoff stays blocked until Email or LINE save succeeds
- `qa:result-checkout:no-card` and `qa:access-link:smoke` passed on Preview(staging)
- Production remained frozen/fail-closed

The remaining gaps are:

- fresh real staging Email delivery and `/r/` click verification
- fresh real staging LINE delivery and `/r/` click verification
- support lookup blocked by missing local `SUPPORT_OPS_DATABASE_URL`

Owner approved one real staging Email message and one real staging LINE message to the approved test inbox/account for this task.

## Relevant Files

- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/checkout/page.tsx`
- `apps/web/scripts/recovery-link-smoke-qa.mjs`
- `apps/web/scripts/result-checkout-no-card-qa.mjs`
- `apps/web/scripts/line-access-link-smoke-qa.mjs`
- `apps/web/scripts/support/paid-result-lookup.mjs`
- `ai-collaboration/reports/2026-06-04-module-01-staging-baseline-completion-v1.md`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Constraints

- Preview(staging) only.
- Do not enable Production runtime or checkout.
- Do not run a Production payment.
- Do not send Production Email or LINE messages.
- Do not modify Production env, DB, or NewebPay dashboard settings.
- Do not expose raw Email, LINE ID, encrypted recipient, hashes, provider payloads, `pa_`, `pcs_`, `pal_`, or tokenized URLs.
- Do not commit secrets or private customer data.
- Do not clean broad access-link/recovery naming tech debt in this task.

## Tech Debt Policy For This Task

Record recovery-named env/file/endpoint/script aliases, `rlb_` prefix decision, production empty-secret preflight validation, Vercel deploy guard hardening, `SUPPORT_OPS_DATABASE_URL` persistence/local bootstrap, desktop LINE UX boundaries, and staging/production drift as backlog only. Do not broaden cleanup.

## Planned Work

1. Verify Production is still frozen/fail-closed.
2. Verify Preview(staging) freshness and clean access-link schema.
3. Align support lookup env for the operator process without writing tracked secrets.
4. Run support lookup preflight if available.
5. Verify desktop Email-only mandatory save and run an approved real staging Email access-link path.
6. Verify mobile LINE-first mandatory save and run an approved real staging LINE access-link path.
7. Verify mobile Email fallback at least at UI/gate level.
8. Run support lookup against staging artifact(s) with sanitized output.
9. Run required QA/validation.
10. Create execution report, update summary log and dashboard.
11. Commit and push to `origin/staging` if validation and safety checks pass.

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

- Whether `SUPPORT_OPS_DATABASE_URL` is already available from a secure local source.
- Whether the existing approved real staging Email/LINE smoke commands can both create same-context artifacts that support `ops:paid-result:lookup`.
