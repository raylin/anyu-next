# Local Env Autoload for QA Scripts v0 Handoff

## Date

2026-05-31

## Task

Make local QA scripts load `apps/web/.env.local` safely by default so local QA runs do not require manually exporting every secret.

## Context

- `qa:env:preflight`, `qa:newebpay:sandbox`, and `qa:fake-paid` exist.
- `apps/web/.env.local` is a secure local source and must remain untracked.
- Current friction: `.env.local` key presence alone does not make scripts ready because scripts may read only `process.env`.
- Production payment runtime remains disabled.
- No production env, Vercel env, deploy, real payment, Module 02, homepage portal, LINE delivery, public copy, or payment runtime behavior changes are in scope.

## Constraints

- Script/tooling changes only.
- Never print secret values, lengths, prefixes, suffixes, hashes, or checksums.
- Do not commit `.env.local`, generated temp forms, provider payloads, tokens, or private values.
- Exported shell env should take precedence over local env file values.
- Missing `.env.local` must be tolerated and existing safe blocked behavior must remain.
- Keep the loader local-script-only; do not change Next.js app runtime behavior.

## Planned Work

1. Inspect existing QA scripts, package scripts, `.env.example`, and ignore rules.
2. Add a shared local env loader under `apps/web/scripts/lib/` if appropriate.
3. Apply the loader to:
   - `apps/web/scripts/qa-env-preflight.mjs`
   - `apps/web/scripts/authorized-fake-paid-qa.mjs`
   - `apps/web/scripts/newebpay-sandbox-e2e-helper.mjs`
4. Add/update tests or dry runs for missing-env behavior and `.env.local` loading without leaking values.
5. Update docs/report/summary log.
6. Run validation, commit, and push to `origin/staging`.

## Uncertainties

- Whether there is already a dotenv dependency or local helper that should be reused.
- Whether package scripts run from `apps/web` only or also from repo root; loader should support both.
