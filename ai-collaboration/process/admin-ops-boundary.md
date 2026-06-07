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

- `ADMIN_API_TOKEN` from explicit shell/process env
- header: `x-admin-api-token`

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

Staging QA runners may resolve `ADMIN_API_TOKEN` from the approved local staging mirror and inject it into `pnpm ops` subprocess env. This is a QA runner responsibility only; the CLI itself still must not read app env mirrors.

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

## Reporting

For ops lookups report:

- environment
- result source category
- Admin CLI/API result
- whether direct DB was used
- why direct DB was needed, if used
- redaction result
