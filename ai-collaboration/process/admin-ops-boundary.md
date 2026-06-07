# Admin Ops Boundary

Date: 2026-06-06

## Principle

Admin API is the single normal operations boundary. This supports the AGENTS.md principle that operational state goes through Admin API + `pnpm ops`, not direct DB/Vercel/provider access.

- Local CLI is an Admin API client.
- Future Admin UI should also be an Admin API client.
- CLI/UI should not directly access DB, Neon, Vercel env, payment secrets, Email provider secrets, or LINE provider secrets.

## Supported Lookup

Use:

```bash
pnpm ops lookup-result --env staging --id <resultId>
pnpm ops lookup-result --env production --id <resultId>
```

Runtime config operations also use Admin API through `pnpm ops`:

```bash
pnpm ops config registry --env production
pnpm ops config list --env production
pnpm ops config get --env production payment.window.enabled --module ai-temperature
pnpm ops config get --env production payment.global.disabled --global
pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "controlled production smoke"
pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason "smoke complete"
pnpm ops config history --env production payment.window.enabled --module ai-temperature
```

Active v0 runtime config keys:

- `payment.window.enabled`
- `payment.global.disabled`

Delivery keys such as `delivery.email.enabled` and `delivery.line.enabled` are reserved for a future sender-gate implementation and must not be exposed as active controls until sender code reads them.

Auth:

- `ADMIN_API_TOKEN` from explicit shell/process env, or from `~/.anyu/credentials.json` when process env is absent
- header: `x-admin-api-token`
- token source precedence: process env, then credentials file, then missing
- `pnpm ops auth status --env <staging|production>` reports token source category only
- `pnpm ops auth set-token --env <staging|production>` prompts for an operator token and writes `~/.anyu/credentials.json`
- `pnpm ops auth logout --env <staging|production>` removes one stored operator token

Environment mapping:

- staging -> `https://staging.anyu.tw`
- production -> `https://anyu.tw`

## CLI Rules

The CLI must not:

- read app env mirror files
- read DB URLs
- read Vercel env
- access Neon directly
- import `apps/web` DB helpers
- expose raw Email, raw LINE ID, encrypted recipient, hashes, tokens, tokenized URLs, provider payloads, or card/payment-sensitive data

Operator credentials are stored separately from service env mirrors:

- service env mirrors: `apps/web/.env.staging` and `apps/web/.env.production`
- operator credentials: `~/.anyu/credentials.json`

Normal `pnpm ops` commands may read `~/.anyu/credentials.json`, but must not read app service env mirror files. No `--token` flag is allowed.

One-time owner-approved credential migration may use:

```bash
node tools/admin-cli/scripts/migrate-admin-token-from-env-mirrors.mjs --confirm-owner-approved
```

This helper is outside the normal `pnpm ops` command surface. It may read only `ADMIN_API_TOKEN` from `apps/web/.env.staging` and `apps/web/.env.production`, may write only the corresponding `~/.anyu/credentials.json` profiles, and must not print token values or token-derived metadata. Do not add a permanent `pnpm ops auth import-token` command.

Post-Gate 1 lifecycle decision: keep this helper as an owner-approved one-time/local recovery tool
only. It is not a normal setup path, not a scheduled task, not a `pnpm ops` subcommand, and not a
general env import mechanism. If it becomes confusing after ops credentials are stable, archive or
remove it in a focused cleanup task.

Staging QA runners may resolve `ADMIN_API_TOKEN` from the approved local staging mirror and inject it into `pnpm ops` subprocess env. This is a QA runner responsibility only; it is separate from normal `pnpm ops` auth resolution.

Production smoke must prove Admin/Ops availability before runtime open:

```bash
cd apps/web && corepack pnpm run qa:production:admin-ops-preflight
```

Production Admin/Ops preflight rules:

- `ADMIN_API_TOKEN` may come from shell/process env or `~/.anyu/credentials.json`.
- `pnpm ops` remains pure and must not read `apps/web/.env.production`.
- Missing token fails before runtime open with `production_admin_token_missing_owner_action_required`.
- Wrong/unauthorized token fails with `production_admin_auth_failed`.
- Do not use direct DB as a fallback for missing Admin token.
- Do not print token values, lengths, prefixes, suffixes, hashes, or checksums.

Runtime config CLI writes must:

- use registered keys only
- require explicit scope (`--module <moduleSlug>` or `--global`)
- require `--reason` for writes
- require `--confirm-global-impact` for global writes
- reject secrets/provider credentials/DB URLs as runtime config
- reject unknown or inactive keys; active controls must map to actual runtime behavior

## Direct DB Use

Direct DB/Neon access is allowed only for:

- migrations
- schema verification
- aggregate preflights
- explicitly approved root-cause debugging when Admin API/CLI is insufficient

If direct DB is used:

- explain why Admin API/CLI was insufficient
- use read-only queries unless mutation is explicitly approved
- report only sanitized booleans/categories/aggregate counts
- do not print private row values

## Admin API Response Boundary

Admin API support summaries may include:

- result/payment/entitlement/generation statuses
- access-link saved/sent/active booleans
- provider message ID presence boolean
- merchant order presence boolean
- diagnosis categories
- recommended support action enums

Admin API must not include:

- raw Email
- raw LINE ID
- encrypted recipient
- hashes
- raw access tokens
- tokenized URLs
- source text/raw input
- provider payload
- `TradeInfo` / `TradeSha`
- card/payment-sensitive data

## Diagnostic / Event Lifecycle

Permanent ops surfaces after Gate 1:

- `pnpm ops lookup-result` sanitized payment, entitlement, generation, access-link, delivery, and latency state
- `pnpm ops lookup-line-bind` sanitized LINE bind categories and recipient-secret presence booleans
- runtime config registry/list/get/history for active scoped runtime controls
- production/staging Admin/Ops preflight categories

Temporary through Gate 2 / soft-public hardening:

- detailed Email save diagnostic categories
- detailed LINE bind milestone categories
- paid-generation benchmark summaries and queue recommendation categories
- staging channel plan/dry-run summaries

Allowed diagnostic data:

- booleans, enums, status categories, timestamp-presence booleans, sanitized latency metrics, attempt counts, and recommended action enums

Forbidden diagnostic data:

- raw Email, raw LINE ID, idToken, LIFF raw state, encrypted recipient, hashes, access tokens,
  tokenized URLs, provider payloads, prompt/source text, `TradeInfo`, `TradeSha`, or card data

Retention decision:

- Do not add a deletion job as part of Gate 1 cleanup.
- Keep existing diagnostic events until Gate 2 readiness review so production/staging failures remain explainable.
- Add a future retention/pruning task if event growth or privacy review requires bounded retention. That task must preserve aggregate categories needed for Admin/Ops support.

## Reporting

For ops lookups report:

- environment
- result source category
- Admin CLI/API result
- whether direct DB was used
- why direct DB was needed, if used
- redaction result
