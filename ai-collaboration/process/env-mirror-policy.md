# Env Mirror Policy

Date: 2026-06-06

This policy supports the AGENTS.md principle that runtime gates belong to scoped DB-backed runtime config, while env mirrors own static/server config and secrets.

## Source Model

- `apps/web/.env.staging` is the local server env mirror/source-of-record for Vercel Preview(staging).
- `apps/web/.env.production` is the local server env mirror/source-of-record for Vercel Production.
- Vercel env is the runtime target.
- Local mirror first, Vercel sync second.
- Do not use `apps/web/.env.local` or `apps/web/.env` as active server mirrors.

## Hard Rules

- Never create Vercel-only secrets.
- Never print values, lengths, prefixes, suffixes, hashes, checksums, connection strings, or tokenized URLs.
- Do not commit env files or secrets.
- Do not cross-sync staging and production values.
- If a value must change, update the local mirror first, then sync the matching Vercel environment.
- If a local mirror and Vercel differ, classify by key name and category only.

## Codex-Generated Values

Codex may generate only internal auth / operational tokens when allowed by task scope:

- `CRON_SECRET`
- `INTERNAL_JOB_SECRET`
- `ADMIN_API_TOKEN`
- operator/internal trigger secrets

Codex must not generate provider credentials:

- NewebPay credentials
- LINE channel credentials
- Resend API key
- Anthropic / AI provider key
- `DATABASE_URL`

## Stateful Crypto

Codex must not rotate app-owned stateful crypto unless explicit reset/migration scope is approved.

Stateful examples:

- access-link token secrets
- checkout session secrets
- paid access token hash secrets
- contact hash/encryption secrets
- LINE recipient encryption secrets
- analysis cache hash secrets

Rotation requires documenting affected data and reset/migration plan.

## Plain Config / Flags

Codex may set plain config when policy is clear.

Production defaults:

- Frequent payment runtime windows are controlled by scoped runtime config, not Vercel env toggles.
- `payment.window.enabled` is module-scoped and must be opened/closed through Admin API / `pnpm ops`.
- `payment.global.disabled` is the global emergency kill switch and requires explicit global-impact confirmation.
- `ENABLE_PAYMENT_RUNTIME` and `ENABLE_NEWEBPAY_CHECKOUT` are obsolete as normal runtime-window controls and must not be restored to env mirrors unless a future owner-approved static upper-bound is implemented, documented, and tested.
- Operator/fake-paid routes remain disabled in production.

Runtime config is not an env mirror concern and must not store provider credentials, API keys, tokens, database URLs, or crypto secrets. Env mirrors continue to own secrets/provider credentials; scoped runtime config owns non-secret operational runtime gates.

## Vercel Sync

When syncing:

- use Preview(staging) only for `.env.staging`
- use Production only for `.env.production`
- report key names only
- do not sync blanks
- redeploy only when required
- after production redeploy, verify fail-closed posture

## CLI Boundary

Admin CLI / `pnpm ops` must not read:

- `apps/web/.env.staging`
- `apps/web/.env.production`
- `apps/web/.env.local`
- `apps/web/.env`

Operator credentials are separate from service env mirrors. Normal `pnpm ops` auth sources are:

1. explicit shell/process `ADMIN_API_TOKEN`
2. `~/.anyu/credentials.json`

`pnpm ops` must not read app service env mirrors during normal operation. The credentials file is not an env mirror and must not be committed.
