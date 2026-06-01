# Recovery Link Operator Smoke Secure Run v0

Date: 2026-06-02

## Completed Work

- Saved the Recovery Link Operator Smoke Secure Run v0 handoff.
- Ran `qa:env:preflight recovery-link-smoke` locally.
- Verified Preview(staging) env metadata through Vercel CLI without printing values.
- Confirmed branch-scoped Preview(staging) `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` already exists.
- Did not rotate or regenerate existing recovery link secrets.
- Attempted a secure temp-file Vercel env pull and process-only smoke run.
- Confirmed Vercel CLI can pull env names into a temporary file without printing values, but sensitive env values are not usable for the local process.
- Removed temporary env files/runners after attempts.

## Env Presence Result

Local preflight:

- `DATABASE_URL`: present.
- `OPERATOR_TEST_SECRET`: present.
- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`: missing.
- Values, lengths, prefixes, suffixes, hashes, and checksums were not printed.

Preview(staging) Vercel metadata:

- `DATABASE_URL`: present through Preview environment.
- `OPERATOR_TEST_SECRET`: present as Preview(staging) encrypted env.
- `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`: present as Preview(staging) encrypted env.
- No production env was queried for values or modified.

## Env Alignment Decision

- No Preview(staging) env was added.
- No Preview(staging) env was rotated.
- No Production env was modified.
- No redeploy was triggered because env metadata was already present and unchanged.

Reason: the required Preview(staging) recovery link token secret already exists and protects generated/stored staging recovery links. Rotating it would break matching existing recovery link hashes and was explicitly disallowed unless necessary.

## Smoke Result

Command attempted:

```bash
cd apps/web && corepack pnpm run qa:recovery-link:smoke
```

Result:

- Blocked safely before DB writes.
- First local run blocked because `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` was missing locally.
- Vercel env pull created a temporary env file with required key names, but sensitive values were not available to the local child process.
- Follow-up temp-run attempts still blocked with `required_operator_smoke_env_missing`.
- No `operator_test` recovery link row was created.
- No `/r/[recoveryToken]` valid render smoke was completed.
- No raw `prl_`, token hash, raw `pa_`, raw `pcs_`, raw Email/LINE ID, provider payload, or tokenized URL was printed.

## Invalid-Link Safety

- Not rerun in this secure-run task because the helper blocked before the full smoke sequence.
- Last known invalid-link safety result from Recovery Link Token Staging Apply / Smoke v0 remains passed.

## Production Safety

- Production payment runtime was not enabled.
- Production env was not modified.
- Production DB migration was not applied.
- Email and LINE messages were not sent.
- No provider/payment behavior changed.

## Blocker

Valid recovery-link smoke now requires one of:

1. A secure local shell export of the existing Preview(staging) `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` value, matching staging runtime.
2. A different approved operator execution path that can run inside the Preview(staging) runtime without exposing the secret.

Because the secret already exists in Preview(staging), generating a new value would rotate the secret and was not performed.

## Validation

- `cd apps/web && corepack pnpm run qa:env:preflight recovery-link-smoke`: blocked as expected due missing local `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`; no values printed.
- Vercel env metadata check: passed; required names present.
- Secure temp env pull: key names present, values not printed; sensitive values unusable for local execution.
- Docs presence, secret scan, dashboard sanity, and `git diff --check` are captured in the completion summary.

## Suggested Next Steps

1. Owner/operator exports the existing Preview(staging) `PAYMENT_RECOVERY_LINK_TOKEN_SECRET` into a secure local shell session, without pasting it into chat or committing it.
2. Re-run `cd apps/web && QA_RECOVERY_LINK_DISABLE_LOCAL_ENV=1 corepack pnpm run qa:recovery-link:smoke` with matching `DATABASE_URL`, `OPERATOR_TEST_SECRET`, and `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`.
3. If direct local secret access is not acceptable, plan an approved Preview(staging)-runtime operator smoke path that does not expose or rotate the secret.

