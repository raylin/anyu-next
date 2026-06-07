# ANYU Admin CLI

The Admin CLI is a client for the Admin API. It must not read app env mirrors, DB URLs, Vercel env, Neon, provider credentials, or secrets.

## Auth

`pnpm ops` authenticates only as an Admin API client. It does not read app service env mirrors, DB URLs, Vercel env, Neon, provider credentials, or secrets.

Token resolution order:

1. `ADMIN_API_TOKEN` in the shell/process environment
2. `~/.anyu/credentials.json` for the selected `--env`
3. missing -> `admin_token_missing`

Credentials file schema:

```json
{
  "version": 1,
  "profiles": {
    "staging": {
      "adminApiToken": "..."
    },
    "production": {
      "adminApiToken": "..."
    }
  }
}
```

Use:

```bash
pnpm ops auth set-token --env staging
pnpm ops auth set-token --env production
pnpm ops auth status --env production
pnpm ops auth logout --env production
```

`auth set-token` prompts for the token and writes `~/.anyu/credentials.json` with restrictive file permissions when the platform supports it. It does not accept a token as a positional argument.

Do not pass tokens by CLI flag. `--token` and `--base-url` are intentionally unsupported.

Normal `pnpm ops` commands do not read `apps/web/.env.staging` or `apps/web/.env.production`. No permanent import-token command exists. If tokens need to be moved from service env mirrors, do it as a one-time owner-approved local action outside the normal CLI surface.

One-time owner-approved migration helper:

```bash
node tools/admin-cli/scripts/migrate-admin-token-from-env-mirrors.mjs --confirm-owner-approved
```

This helper is not a `pnpm ops` command. It reads only `ADMIN_API_TOKEN` from `apps/web/.env.staging` and `apps/web/.env.production`, writes only the matching `~/.anyu/credentials.json` profiles, preserves existing credential fields, and prints only copy categories/permission status. It must not be used as a normal auth source or generalized env import.

Lifecycle decision after Gate 1: keep the helper as an owner-approved one-time/local recovery tool
only. Normal auth should use `pnpm ops auth set-token` or existing `~/.anyu/credentials.json`.
If the helper creates confusion after ops credentials are stable, archive or remove it in a focused
cleanup task rather than exposing it as a permanent CLI command.

## Runtime Config

Runtime config is for non-secret operational values only. It is not for provider credentials, API keys, tokens, database URLs, or crypto secrets.

```bash
pnpm ops config registry --env production
pnpm ops config list --env production
pnpm ops config get --env production payment.window.enabled --module ai-temperature
pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason "controlled production smoke"
pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason "smoke complete"
pnpm ops config history --env production payment.window.enabled --module ai-temperature
```

Global writes require explicit confirmation:

```bash
pnpm ops config set --env production payment.global.disabled true --global --reason "emergency payment shutdown" --confirm-global-impact
```

## Support Lookups

```bash
pnpm ops lookup-result --env staging --id <resultId>
pnpm ops lookup-result --env production --id <resultId>
pnpm ops lookup-line-bind --env staging --result-id <resultId>
pnpm ops lookup-line-bind --env production --result-id <resultId>
```

Outputs are sanitized and must not include raw Email, raw LINE ID, encrypted recipient, hashes, tokens, tokenized URLs, provider payloads, or card/payment-sensitive data.
