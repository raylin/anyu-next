# Recovery Link Operator Smoke Helper v0

Date: 2026-06-01

## Completed Work

- Added a local QA command: `cd apps/web && corepack pnpm run qa:recovery-link:smoke`.
- Added `apps/web/scripts/recovery-link-smoke-qa.mjs` to create a fresh no-card paid result, create a temporary `operator_test` recovery link, fetch `/r/[recoveryToken]` internally, verify paid-result rendering, check invalid-link safety, and clean up the test row.
- Added `apps/web/scripts/lib/recovery-link-smoke-qa.mjs` with recovery smoke token generation, purpose-separated HMAC hashing, 90-day expiry helper, `/r/[REDACTED]` redaction, and HTML leak checks.
- Updated shared no-card QA redaction to treat `prl_` values and `/r/[token]` paths as tokenized output.
- Added `recovery_link_smoke` mode to `qa:env:preflight`.
- Added targeted tests for helper redaction, production rejection, token hashing shape, 90-day expiry, package script registration, and preflight registration.
- Updated the project dashboard to show that a local operator helper now exists, while the valid-link live smoke still requires secure local Preview(staging) env alignment.

## Architecture Decisions

- Chose a local QA script instead of a public runtime endpoint.
- The helper creates `operator_test` recovery links directly against the operator-provided staging DB and deletes the row after the smoke.
- The raw `prl_` token is generated and used only in local process memory.
- The script refuses production hosts before network or DB work.
- The script blocks before writes if `DATABASE_URL`, `OPERATOR_TEST_SECRET`, or `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` is unavailable.

## Safety / Redaction Behavior

- The script never prints raw `prl_`, token hash, raw `pa_`, raw `pcs_`, tokenized `/r/[token]` URLs, provider payloads, raw Email, or LINE IDs.
- Output is sanitized JSON only.
- Reported recovery paths use `/r/[REDACTED]`.
- Provider field values, DB credentials, token lengths, prefixes, suffixes, hashes, and row IDs are not printed.

## Staging Smoke Result

- `qa:recovery-link:smoke` was run locally.
- Result: blocked safely before DB writes because local `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` is not available.
- Local preflight confirmed `OPERATOR_TEST_SECRET` and `DATABASE_URL` are present, but the matching Preview(staging) recovery link token secret is missing locally.
- No recovery link row was created.
- No Email or LINE message was sent.

## Validation

- `node --check apps/web/scripts/recovery-link-smoke-qa.mjs`: passed.
- Targeted tests: `cd apps/web && corepack pnpm exec vitest run src/tests/recovery-link-smoke-qa.test.ts src/tests/result-checkout-no-card-qa.test.ts`: passed.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 71 files / 452 tests.
- `cd apps/web && corepack pnpm build`: passed.
- Docs presence check: passed.
- Dashboard HTML sanity: passed.
- Secret/private scan: passed with only regex-pattern false positives for `TradeInfo`/`TradeSha` detection code.
- `git diff --check`: passed.
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`: blocked safely due missing local `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`.

## Blockers / Uncertainties

- Valid `/r/[recoveryToken]` live staging smoke still requires a secure local operator environment with the same Preview(staging) `DATABASE_URL` and `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`.
- The staging token secret was configured as a Vercel sensitive value and was not re-pulled, printed, regenerated, or rotated in this task.

## Tech Debt Review

- New technical debt introduced: none beyond adding another local QA script.
- Existing technical debt observed: no dedicated secure operator env handoff exists for running DB-backed recovery-link smoke without secret access friction.
- Opportunistic cleanup completed: shared token redaction now covers `prl_` and `/r/[token]` paths.
- Deferred cleanup candidates: extract common no-card QA flow primitives if additional operator smoke scripts are added.

## Suggested Next Steps

1. Run `qa:recovery-link:smoke` from a secure operator machine/session with matching Preview(staging) `DATABASE_URL`, `OPERATOR_TEST_SECRET`, and `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`.
2. After valid-link smoke passes, proceed to Email Recovery Link Sending v0 or LINE Recovery CTA Wiring v0.
3. Keep production DB/env/runtime gated until production payment capability gates are explicitly approved.
