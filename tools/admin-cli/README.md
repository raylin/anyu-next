# ANYU Admin CLI

The Admin CLI is a client for the Admin API. It must not read app env mirrors, DB URLs, Vercel env, Neon, provider credentials, or secrets.

## Auth

Set `ADMIN_API_TOKEN` in the shell/process environment before running commands.

Do not pass tokens by CLI flag. `--token` and `--base-url` are intentionally unsupported.

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
pnpm ops config set --env production delivery.line.enabled false --global --reason "LINE emergency disable" --confirm-global-impact
```

## Support Lookups

```bash
pnpm ops lookup-result --env staging --id <resultId>
pnpm ops lookup-result --env production --id <resultId>
pnpm ops lookup-line-bind --env staging --result-id <resultId>
pnpm ops lookup-line-bind --env production --result-id <resultId>
```

Outputs are sanitized and must not include raw Email, raw LINE ID, encrypted recipient, hashes, tokens, tokenized URLs, provider payloads, or card/payment-sensitive data.
