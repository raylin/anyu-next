# Staging Admin API Gate Setup + Module01 Suite Rerun v0

## Date

2026-06-06

## Completed Work

- Generated a strong `ADMIN_API_TOKEN` and set it only on Vercel Preview(staging), branch `staging`.
- Redeployed Preview(staging) on the canonical `anyu-next` project so the Admin API token became active.
- Restored the missing Preview(staging) `ANTHROPIC_API_KEY` from the approved local staging server-env mirror after staging analyze calls returned provider errors.
- Selected a safe existing staging analysis result as the Admin API lookup fixture without printing the result ID.
- Updated the Module 01 validation suite so optional skipped real-channel checks do not downgrade the default safe staging gate.
- Reran `qa:module01:staging` with Admin API lookup enabled.

No token values, env values, result IDs, tokenized URLs, provider payloads, Email addresses, LINE identifiers, hashes, or encrypted recipients were printed or committed.

## Preview(staging) Env / Deploy Result

- `ADMIN_API_TOKEN`: generated and set for Preview(staging) only.
- Production `ADMIN_API_TOKEN`: not set or changed.
- Preview(staging) provider key alignment: `ANTHROPIC_API_KEY` was present in `apps/web/.env.staging` and missing in branch-scoped Vercel Preview(staging); it was set for Preview(staging) only to restore deployed analyze behavior.
- Final verified staging health:
  - environment: `preview`
  - branch: `staging`
  - commit: `8a70beb2d7c1`
  - route bundle: `payment-foundation-2026-05-29`

## Admin API Smoke

`qa:module01:staging` exercised the Admin API staging check:

- no token: expected `401`
- wrong token: expected `401`
- correct Preview(staging) token and known staging result: `200`
- response redaction: passed

The successful response was validated only as a sanitized summary. It did not expose raw Email, LINE identity, encrypted recipient, hashes, raw tokens, tokenized URLs, source text, provider payload, raw merchant order number, or raw provider message ID.

## Module 01 Suite Results

- `qa:module01:local`: pass
- `qa:module01:staging`: pass
- `qa:module01:production-preflight`: pass

Staging suite details:

- staging health: pass
- access-link smoke: pass
- no-card checkout smoke: pass
- Admin API lookup: pass
- real Email/LINE channel acceptance: skipped by design in the default suite

The staging summary was written to:

- `apps/web/.qa/module01-staging-summary.json`

The default suite did not send real Email or LINE messages. It did mutate staging QA data through existing safe smoke helpers.

## Production Safety

- Production env was not modified.
- Production `ADMIN_API_TOKEN` was not set.
- Production runtime and checkout were not enabled.
- No production payment was run.
- No production Email or LINE message was sent.
- `qa:module01:production-preflight` passed and confirmed production public pages are live while checkout/fake-paid routes fail closed.

## Code / Suite Change

The suite now treats an optional skipped check as non-blocking for gate status. This keeps real Email/LINE owner-channel validation out of the default automated suite while allowing the safe staging gate to pass when all required deployed checks pass.

## Validation

- `cd apps/web && corepack pnpm lint`: pass
- `cd apps/web && corepack pnpm exec vitest run src/tests/module01-release-validation-suite.test.ts src/tests/admin-paid-result-lookup.test.ts src/tests/admin-paid-result-lookup-route.test.ts`: pass
- `cd apps/web && corepack pnpm test`: pass
- `cd apps/web && corepack pnpm build`: pass
- `cd apps/web && corepack pnpm run qa:module01:local`: pass
- `cd apps/web && corepack pnpm run qa:module01:staging`: pass
- `cd apps/web && corepack pnpm run qa:module01:production-preflight`: pass

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: Preview(staging) branch-scoped env overrides can drift from local `.env.staging`; this caused the missing provider key gap.
- Opportunistic cleanup completed: default suite gate status now correctly ignores optional skipped channel checks.
- Deferred cleanup candidates: add an env-name drift check for key Preview(staging) provider dependencies in the release suite without printing values.

## Suggested Next Steps

1. Owner reviews and accepts the safe Module 01 staging gate result.
2. If required before production readiness, implement `qa:module01:staging:channels` as an explicit owner-approved real Email/LINE validation command.
3. Continue with Admin CLI Lookup Client v0 or hold for owner acceptance before any production readiness task.
