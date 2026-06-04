# Local / Staging DB Branch Reconciliation v0 Handoff

## Date

2026-06-05

## Task

Read-only investigation to determine what `apps/web/.env.local` `DATABASE_URL` targets, how it compares to Vercel Preview(staging), whether a dev/local Neon branch exists, and what support ops lookup should use going forward.

## Context

`ops:paid-result:lookup` is blocked because local `SUPPORT_OPS_DATABASE_URL` is absent and `apps/web/.env.local` `DATABASE_URL` failed the clean access-link schema probe. Owner clarified that `.env.local` may intentionally point to a separate Neon `dev/local` branch rather than Vercel Preview(staging). This task must establish facts without changing env, DB, code, schema, or Vercel settings.

## Relevant Files

- `apps/web/.env.local`
- `apps/web/.env`
- `.env`
- `.env.local`
- `ai-collaboration/reports/2026-06-04-local-staging-db-branch-reconciliation-v0.md`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`

## Constraints

- Read-only only.
- Do not change env files, Vercel env, DB, code, schema, or aliases.
- Do not apply migrations or mutate data.
- Do not enable Production runtime or checkout.
- Do not run payments.
- Do not send Email or LINE messages.
- Do not print DB URLs, credentials, env values, value lengths, prefixes, suffixes, hashes, checksums, raw Email, LINE IDs, tokens, hashes, encrypted recipients, source text, or provider payloads.

## Planned Work

1. Check local env file presence and key names only.
2. Probe `apps/web/.env.local` `DATABASE_URL` read-only for schema/table counts without connection details.
3. Use Neon metadata/read-only SQL to inspect Preview(staging), production, and dev/local branches by schema/counts only.
4. Compare local DB target vs host staging.
5. Classify dev/local likely purpose.
6. Recommend support ops DB source model.
7. Create report, update summary/dashboard, run docs/safety checks, commit, and push to `origin/staging`.

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

- Whether local `.env.local` DB can be safely categorized from metadata available inside the connected DB.
- Whether dev/local branch schema/counts prove intentional local development use or only stale test data.
