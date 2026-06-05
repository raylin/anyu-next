# Admin CLI Lookup Client v0

## Date

2026-06-06

## Completed Work

- Added a standalone Admin CLI package at `tools/admin-cli`.
- Added the root command:
  - `pnpm ops lookup-result --env staging --id <resultId>`
  - `pnpm ops lookup-result --env production --id <resultId>`
- Implemented `lookup-result` as a pure Admin API HTTP client.
- Added mocked CLI tests covering argument validation, auth behavior, hardcoded environment mapping, response validation, redaction, and safe output.
- Updated workspace metadata and lockfile for the new tool package.

The CLI does not import `apps/web`, does not read DB URLs, does not access Neon or Vercel env, and does not load `apps/web/.env.staging`, `apps/web/.env.production`, `apps/web/.env.local`, or `apps/web/.env`.

## Package / Command

Location:

- `tools/admin-cli`

Root command:

```bash
pnpm ops lookup-result --env staging --id <resultId>
pnpm ops lookup-result --env production --id <resultId>
```

In this shell, `corepack pnpm ops ...` is the working equivalent because a bare `pnpm` binary is not on `PATH`.

## Auth / Env Behavior

- Required process env: `ADMIN_API_TOKEN`
- Header sent: `x-admin-api-token`
- Staging and production both use the env name `ADMIN_API_TOKEN`; values are environment-specific.
- The CLI never prints the token, token length, prefix, suffix, hash, or checksum.

Hardcoded v0 base URLs:

- `staging` -> `https://staging.anyu.tw`
- `production` -> `https://anyu.tw`

Not supported in v0:

- `--base-url`
- endpoint env
- `--token`
- token-env selection
- DB URL
- Vercel env access
- Neon access

## Response Validation / Redaction

The CLI validates the Admin API v0 response shape before printing pretty or JSON output.

Rejected response/output content includes:

- raw Email
- raw LINE user ID
- encrypted recipient
- recipient/contact/token hashes
- raw `pal_`, `prl_`, `pa_`, or `pcs_` tokens
- tokenized `/r/` URL
- source text or raw user input
- provider payload
- `TradeInfo` / `TradeSha`
- card/payment sensitive data
- raw provider message ID
- raw merchant order number

Provider message ID and merchant order status are allowed only as boolean presence fields.

## Output Behavior

Pretty output summarizes:

- env
- paid result status
- payment status/provider
- entitlement status
- generation status
- Email access-link state
- LINE access-link state
- diagnosis categories
- recommended actions

`--json` prints a validated sanitized wrapper JSON. There is no unsafe JSON mode.

## Error Categories

Implemented safe CLI errors:

- `command_required`
- `unknown_command`
- `env_required`
- `env_invalid`
- `result_id_missing`
- `unsupported_option`
- `unexpected_argument`
- `admin_token_missing`
- `admin_auth_failed`
- `result_not_found`
- `api_unreachable`
- `server_lookup_failed`
- `unsafe_response_shape`

No stack traces are printed by default.

## Live Smoke

No live Admin API call was made in this task.

Live staging verification is deferred to:

- Staging Admin CLI Lookup Smoke v0

That task should provide `ADMIN_API_TOKEN` through the current shell/process env and use a safe staging result ID without printing tokenized URLs or private values.

## Validation

- `corepack pnpm install --lockfile-only`: pass
- `CI=true corepack pnpm install`: pass
- `corepack pnpm --filter @anyu/admin-cli test`: pass
- `corepack pnpm --filter @anyu/admin-cli typecheck`: pass
- `corepack pnpm ops lookup-result --env staging --id <safe-test-id>` with no token: returned `admin_token_missing` without live API call
- `corepack pnpm ops lookup-result --id <safe-test-id>`: returned `env_required` without live API call
- `cd apps/web && corepack pnpm lint`: pass
- `cd apps/web && corepack pnpm test`: pass
- `cd apps/web && corepack pnpm build`: pass
- `cd apps/web && corepack pnpm run qa:module01:local`: pass
- `cd apps/web && corepack pnpm run qa:module01:staging`: pass
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass

The staging suite used the existing safe default path and did not send real Email or LINE messages. Production checks were read-only/fail-closed only.

## Tech Debt Review

- New technical debt introduced: root command currently uses `corepack pnpm --dir tools/admin-cli exec tsx ...`; this keeps v0 simple but is not binary packaging.
- Existing technical debt observed: legacy direct DB support lookup remains available but is no longer the target ops boundary.
- Opportunistic cleanup completed: none beyond adding explicit CLI redaction validation.
- Deferred cleanup candidates: add Staging Admin CLI Lookup Smoke v0 and later decide whether to deprecate the legacy direct DB lookup command.

## Suggested Next Steps

1. Run Staging Admin CLI Lookup Smoke v0 with `ADMIN_API_TOKEN` supplied explicitly in the shell.
2. If staging CLI smoke passes, decide whether to add a production read-only Admin CLI smoke after owner approval.
3. Defer direct DB support lookup removal until Admin CLI usage is stable.
