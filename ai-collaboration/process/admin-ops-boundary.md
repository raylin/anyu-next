# Admin Ops Boundary

Date: 2026-06-06

## Principle

Admin API is the single normal operations boundary.

- Local CLI is an Admin API client.
- Future Admin UI should also be an Admin API client.
- CLI/UI should not directly access DB, Neon, Vercel env, payment secrets, Email provider secrets, or LINE provider secrets.

## Supported Lookup

Use:

```bash
pnpm ops lookup-result --env staging --id <resultId>
pnpm ops lookup-result --env production --id <resultId>
```

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
