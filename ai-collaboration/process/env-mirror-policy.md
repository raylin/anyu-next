# Env Mirror Policy

Date: 2026-06-06

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

Codex may set plain config and runtime flags when policy is clear.

Production defaults:

- `ENABLE_PAYMENT_RUNTIME=false` unless controlled smoke explicitly authorizes enablement.
- `ENABLE_NEWEBPAY_CHECKOUT=false` unless controlled smoke explicitly authorizes enablement.
- Operator/fake-paid routes remain disabled in production.

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

`ADMIN_API_TOKEN` for CLI usage comes from explicit shell/process env only.
