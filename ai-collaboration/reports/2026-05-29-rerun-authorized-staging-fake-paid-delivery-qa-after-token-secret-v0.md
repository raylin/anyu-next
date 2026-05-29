# Rerun Authorized Staging Fake Paid Delivery QA after PAID_ACCESS_TOKEN_HASH_SECRET v0

## Summary
Authorized staging fake-paid QA did not run to the business path. The rerun was blocked during preflight.

Two independent blockers were observed from this Codex shell:

1. Required secrets were not present in the shell environment available to Codex.
2. `staging.anyu.tw` did not appear to be serving the expected payment-foundation route bundle during this run.

No raw secrets, raw `pa_` tokens, tokenized URLs, raw input, provider output, LINE IDs, or private values were recorded.

## Local State
- Local branch: `staging`
- Local HEAD: `35bc65e`
- `origin/staging`: `35bc65e`
- Worktree before report creation: clean except this handoff/report task.

## Secret Presence Preflight
Sanitized environment presence check from this Codex shell:

```text
OPERATOR_TEST_SECRET: missing
INTERNAL_JOB_SECRET: missing
PAID_ACCESS_TOKEN_HASH_SECRET: missing
```

No secret values, lengths, prefixes, suffixes, hashes, or derived values were printed.

## Runner Command
Executed from `apps/web`:

```bash
corepack pnpm run qa:fake-paid
```

The command was wrapped to capture the exit status without exposing secrets.

## Sanitized Runner Result
```json
{"step":"secret_preflight","outcome":"blocked","OPERATOR_TEST_SECRET":"missing","INTERNAL_JOB_SECRET":"missing"}
{"step":"staging_health_marker","outcome":"fail","httpStatus":200,"app":null,"environment":null,"gitCommit":null,"gitBranch":null,"routeBundleVersion":null}
{"step":"fake_paid_gate_missing_secret","outcome":"fail","httpStatus":404,"jsonControlled":false,"error":null,"genericHtml404":true}
{"step":"fake_paid_gate_invalid_secret","outcome":"fail","httpStatus":404,"jsonControlled":false,"error":null,"genericHtml404":true}
{"step":"invalid_pa_status","outcome":"fail","httpStatus":200,"status":"expired","errorCategory":"invalid_unlock"}
{"step":"final_summary","outcome":"blocked","reason":"preflight_failed","fullQaPassed":false}
```

Runner exit status: `1`.

## Pass / Fail by Step
- Secret preflight: blocked. Required secrets were not available to this Codex shell.
- Staging health marker: failed. Health responded HTTP 200 but marker fields were missing.
- Fake-paid route missing-secret gate: failed. Response was generic HTML 404, not route-controlled JSON.
- Fake-paid route invalid-secret gate: failed. Response was generic HTML 404, not route-controlled JSON.
- Invalid synthetic `pa_` status: failed. Response category was legacy `invalid_unlock`, not paid-access `invalid_paid_access`.
- Authorized fake-paid first call: not attempted.
- Idempotency: not attempted.
- Paid-result status polling with valid `pa_`: not attempted.
- Processor/manual completion: not attempted.
- Completed `pa_` unlock rendering: not attempted.

## Diagnosis
This rerun did not test the fixed fake-paid business path. The first blocker is the missing local secrets in the Codex environment. The second blocker is stronger for staging readiness: staging appears to be serving an older or mismatched route bundle, because:

- `/api/health` lacks the safe marker fields expected from commit `35bc65e`.
- `/api/operator/fake-paid-success` returns generic HTML 404 instead of route-controlled JSON 401/disabled responses.
- Invalid synthetic `pa_` status returns legacy `invalid_unlock`, indicating paid-access resolver route behavior is not present in the served bundle.

This is a deployment freshness / alias / build source blocker, not evidence that `PAID_ACCESS_TOKEN_HASH_SECRET` or the fake-paid code path failed.

## Required Manual Checks
Before rerunning authorized QA, verify in Vercel that `staging.anyu.tw` is serving commit `35bc65e` or newer from `origin/staging`, built from the `apps/web` project root.

Preflight must pass before secrets are needed:

- `GET https://staging.anyu.tw/api/health` includes `routeBundleVersion: payment-foundation-2026-05-29`.
- `POST https://staging.anyu.tw/api/operator/fake-paid-success` without a secret returns route-controlled JSON `401 unauthorized`, not generic HTML 404.
- Invalid synthetic `pa_` status returns paid-access category `invalid_paid_access`, not legacy `invalid_unlock`.

Then rerun the secret-safe QA runner from a shell where `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` are available securely.

## Validation
No code changed. Full compile/lint/test/build was not required.

Validation performed:
- Ran the secret-safe QA runner once.
- Confirmed the run blocked before authorized fake-paid business logic.
- Confirmed no secrets or bearer tokens were printed or committed.

## Tech Debt Review
### New Technical Debt Introduced
None.

### Existing Technical Debt Observed
- Staging deployment freshness can regress after being previously verified.
- The QA runner depends on the shell environment receiving operator secrets; Codex does not automatically inherit the owner/operator shell secrets.

### Opportunistic Cleanup Completed
None; documentation-only blocked QA record.

### Deferred Cleanup Candidates
- Add a separate route-bundle-only preflight command that does not require or check secrets.
- Add an owner-visible Vercel deployment checklist for confirming `staging.anyu.tw` alias target and build root before authorized QA.

## Recommended Next Step
Restore staging route-bundle freshness so `/api/health` shows the marker and `/api/operator/fake-paid-success` returns route-controlled JSON, then rerun the authorized QA runner from a shell with `OPERATOR_TEST_SECRET` and `INTERNAL_JOB_SECRET` available securely.
