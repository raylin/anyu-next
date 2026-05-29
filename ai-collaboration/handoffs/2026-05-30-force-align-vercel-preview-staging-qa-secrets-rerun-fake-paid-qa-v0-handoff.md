# Force Align Vercel Preview Staging QA Secrets and Rerun Fake-Paid QA v0 Handoff

## Task
Force-align Preview/Staging QA secrets in Vercel using Vercel CLI token auth, redeploy Preview/Staging, and rerun the secret-safe fake-paid QA runner.

## Scope
- Vercel Preview env remove/add alignment for `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, and `PAID_ACCESS_TOKEN_HASH_SECRET`.
- Non-production redeploy and sanitized QA rerun.
- Documentation/reporting only besides env operations.

## Safety Rules
- Do not print `VERCEL_TOKEN`, generated secrets, raw `pa_` tokens, tokenized URLs, raw input, or private values.
- Do not update Production env.
- Do not deploy Production.
- Stop before env mutation if repo state is dirty or Vercel project context is unclear.

## Out of Scope
- NewebPay checkout/notify/return.
- Payment runtime enablement.
- Production flags/deploy.
- Queue trigger integration.
- LINE delivery.
- Module 01 prompt/result changes.
- Public legal/provider-review copy changes.
