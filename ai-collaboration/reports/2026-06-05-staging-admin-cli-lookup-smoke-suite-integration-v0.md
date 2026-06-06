# Staging Admin CLI Lookup Smoke + Suite Integration v0

## Date

2026-06-06

## Completed Work

- Replaced the rough root CLI command wiring with workspace package delegation.
- Ran live Preview(staging) Admin CLI lookup smoke using `ADMIN_API_TOKEN` supplied by the current shell/process env.
- Verified CLI safe failure behavior for missing token, wrong token, missing `--env`, and missing `--id`.
- Integrated Admin CLI lookup into `qa:module01:staging` as a separate `adminCliLookup` check.
- Reran Module 01 validation gates.

No production env was modified. No production runtime was enabled. No payment, Email, or LINE message was sent.

## CLI Wiring

Chosen approach: clean workspace package script delegation.

Root script:

```json
{
  "ops": "corepack pnpm --filter @anyu/admin-cli ops"
}
```

The previous rough root command using `corepack pnpm --dir tools/admin-cli exec tsx ...` was removed.

The owner-facing command remains:

```bash
pnpm ops lookup-result --env staging --id <resultId>
pnpm ops lookup-result --env production --id <resultId>
```

In this local shell, `corepack pnpm ops ...` is the validated equivalent because bare `pnpm` is not on `PATH`.

## Live Staging CLI Smoke

Token source:

- `ADMIN_API_TOKEN` was supplied explicitly through the shell/process env for the invocation.
- The CLI did not load `apps/web/.env.staging`.
- No token value, length, prefix, suffix, hash, or checksum was printed.

Result ID source:

- Existing safe staging result ID from the ignored `.qa` artifact.
- No tokenized URL, raw Email, raw LINE ID, encrypted recipient, hashes, or provider payload was printed.

Commands exercised:

- `pnpm ops lookup-result --env staging --id <resultId>`
- `pnpm ops lookup-result --env staging --id <resultId> --json`

Results:

- Pretty output: pass, sanitized.
- JSON output: pass, sanitized.
- Wrong token: `admin_auth_failed`.
- Missing token: `admin_token_missing`.
- Missing `--env`: `env_required`.
- Missing `--id`: `result_id_missing`.

## Suite Integration

`qa:module01:staging` now records both:

- `adminApiLookup`
- `adminCliLookup`

`adminCliLookup` behavior:

- If `ADMIN_API_TOKEN` and known staging result ID are present, run:
  - `pnpm ops lookup-result --env staging --id [REDACTED] --json`
- If token is missing, record `skipped_missing_admin_token` as a partial optional check.
- If result ID is missing, record `skipped_missing_known_result_id` as a partial optional check.
- If CLI returns an unsafe response or fails unexpectedly, block the staging gate.

Latest staging suite result:

- `adminApiLookup`: pass
- `adminCliLookup`: pass
- `qa:module01:staging`: pass

The suite summary redacts the result ID in `adminCliLookupCommand` and stores no private values.

## Validation

- `corepack pnpm install --lockfile-only`: pass
- `corepack pnpm --filter @anyu/admin-cli test`: pass
- `corepack pnpm --filter @anyu/admin-cli typecheck`: pass
- root command missing-token smoke: pass
- root command missing-env smoke: pass
- root command missing-id smoke: pass
- live staging CLI pretty lookup: pass
- live staging CLI JSON lookup: pass
- live staging CLI wrong-token smoke: pass
- `cd apps/web && corepack pnpm exec vitest run src/tests/module01-release-validation-suite.test.ts`: pass
- `cd apps/web && corepack pnpm lint`: pass
- `cd apps/web && corepack pnpm test`: pass
- `cd apps/web && corepack pnpm build`: pass
- `cd apps/web && corepack pnpm run qa:module01:local`: pass
- `cd apps/web && corepack pnpm run qa:module01:staging`: pass
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass

## Production Safety

- Production runtime remained disabled.
- Production checkout remained fail-closed.
- Production env was not modified.
- Production `ADMIN_API_TOKEN` was not changed.
- No production payment was run.
- No production Email or LINE message was sent.

## Tech Debt Review

- New technical debt introduced: nonzero CLI runs through pnpm workspace delegation still include pnpm lifecycle context after the CLI’s own safe error line.
- Existing technical debt observed: legacy direct DB support lookup remains available but is not the target ops boundary.
- Opportunistic cleanup completed: root command no longer uses path-based `--dir exec tsx` wiring.
- Deferred cleanup candidates: decide whether a built `bin` package is worth adding after CLI usage stabilizes.

## Suggested Next Steps

1. Owner reviews the safe staging release gate plus live Admin CLI lookup result.
2. If accepted, hold for owner instruction before any production readiness task.
3. Defer production read-only Admin CLI lookup smoke until explicitly approved.
