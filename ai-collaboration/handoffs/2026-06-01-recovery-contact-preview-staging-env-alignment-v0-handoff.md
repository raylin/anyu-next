# Recovery Contact Preview(staging) Env Alignment v0 Handoff

Date: 2026-06-01

## Task

Generate stable staging-only recovery contact secrets, configure them in Vercel Preview(`staging`), redeploy staging, and rerun Email recovery save QA.

## Scope

- Inspect recovery crypto helper requirements.
- Generate strong random values without printing or committing them.
- Set only branch-scoped Preview(`staging`) env names:
  - `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
- Redeploy staging.
- Verify Email recovery save with fake reserved-domain Email only.
- Run no-card QA regression.
- Confirm production remains untouched/fail-closed.

## Guardrails

- Do not set Production env.
- Do not enable production payment runtime.
- Do not apply production DB migration.
- Do not send Email or LINE push.
- Do not print secret values, generated values, raw Email, encrypted contact values, hashes, raw `pa_`, or raw `pcs_`.
- Do not commit secrets or private customer data.

## Planned Validation

If no code changes:

- docs presence check
- secret/private scan
- `git diff --check`
If code changes unexpectedly:

- app lint/test/build
