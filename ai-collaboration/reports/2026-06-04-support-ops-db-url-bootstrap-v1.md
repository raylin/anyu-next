# Support Ops DB URL Bootstrap v1

Date: 2026-06-04

## Status

Blocked: `support_ops_db_missing`.

`SUPPORT_OPS_DATABASE_URL` could not be safely provided to the operator process. The known local `DATABASE_URL` was not used because it points to the wrong schema and does not target Preview(staging). Therefore `ops:paid-result:lookup` was not run, and the Module 01 staging baseline remains partial.

## Production Freeze Status

Production remained frozen/fail-closed:

- public `/`, `/refund`, and `/legal`: 200
- health endpoint: production reachable
- checkout route: 404 fail-closed
- operator fake-paid route: 404 fail-closed on POST
- operator access-link smoke route: 404 fail-closed on POST
- `qa:production:payment-preflight -- --source vercel-production --mode dry-run`: `pass_ready_for_controlled_smoke`
- `ENABLE_PAYMENT_RUNTIME`: absent/disabled
- `ENABLE_NEWEBPAY_CHECKOUT`: absent/disabled
- no Production payment was run
- no Production Email/LINE message was sent
- no Production env, DB, or provider dashboard setting was changed

## Support DB Env Bootstrap Result

Bootstrap method categories attempted:

- secure local/operator env presence check
- existing local env files checked by key presence only
- Vercel Preview env pull to untracked temp files
- Neon project/Preview branch metadata and schema verified through schema/aggregate-only checks

Result:

- `SUPPORT_OPS_DATABASE_URL`: missing from shell and local env files
- local `DATABASE_URL`: present but rejected because it does not point to the Preview clean access-link schema
- Vercel Preview env pull: key names were discoverable, but no usable non-empty local DB value was available to the operator process
- Neon CLI/API token: not present by env-name check, so no local CLI bootstrap path was available

No DB URL, value, length, prefix, suffix, hash, checksum, credential, or connection detail was printed. Temporary env pull files were removed.

## Env Preflight

Command:

- `cd apps/web && corepack pnpm run qa:env:preflight -- support-ops-lookup`

Result:

- failed safely
- missing required env name: `SUPPORT_OPS_DATABASE_URL`
- values/lengths/prefixes/suffixes/hashes were not printed
- fallback `DATABASE_URL` remains gated behind explicit opt-in and was not used

## Support Lookup Commands

Not run:

- `cd apps/web && corepack pnpm run ops:paid-result:lookup -- --result-id <staging-result-id>`

Reason:

- support env preflight failed before any DB query
- using the local `DATABASE_URL` would risk querying the wrong DB/schema

## Sanitized Lookup Result Summary

No lookup output was produced because the support DB target could not be safely bootstrapped.

Expected output remains unchanged for the next attempt:

- payment/report status
- paid result status
- Email saved/sent state
- LINE saved/sent state
- active access-link state
- provider audit summary
- diagnosis category
- recommended support action

## Redaction Verification

No support lookup output existed to inspect.

Safety checks completed:

- no raw Email printed
- no raw LINE user ID printed
- no encrypted recipient printed
- no hashes printed
- no raw `pa_`, `pcs_`, or `pal_` tokens printed
- no tokenized URLs printed
- no raw source text printed
- no provider payload printed
- no DB credentials printed

## Regression QA

Passed:

- `cd apps/web && corepack pnpm run qa:access-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- `cd apps/web && corepack pnpm run qa:production:payment-preflight -- --source vercel-production --mode dry-run`

Not run:

- `qa:line-access-link:smoke`, because it may send a real staging LINE message and was not needed for this blocked support lookup attempt.

## Baseline Status After Lookup Attempt

Partial.

Still true from v1:

- real staging Email was received and `/r/` opened completed paid result
- real staging LINE was received and `/r/` opened completed paid result
- desktop Email-only mandatory save works
- mobile LINE-first mandatory save works
- automated access-link/no-card QA passes
- Production remains frozen/fail-closed

Still blocked:

- support lookup cannot run until `SUPPORT_OPS_DATABASE_URL` is available to the operator process

## Remaining Tech Debt Backlog

Must fix before production smoke:

- provide a safe local/operator bootstrap for Preview(staging) `SUPPORT_OPS_DATABASE_URL`
- decide whether bootstrap should use an untracked local env file, a secret manager, or an approved Neon CLI/API-token flow
- keep blocking silent `DATABASE_URL` fallback unless explicitly targeted and verified
- harden production preflight empty-secret validation for processor/auth secrets
- keep Vercel deploy guard checks for env/deploy/alias source alignment

Can fix after staging baseline before Module 02:

- recovery-named env vars:
  - `PAYMENT_RECOVERY_LINK_TOKEN_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
  - `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`
  - `LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY`
  - `LINE_RECOVERY_MESSAGE_PROVIDER`
- recovery-named file/module aliases
- recovery-named endpoint/script names

Can defer until after Module 02 concept:

- broad helper/file cleanup away from recovery terminology
- historical report cleanup

Intentionally retained compatibility:

- `/r/[token]` route remains stable
- `rlb_` LINE bind state prefix remains for now
- desktop/non-mobile checkout-start remains Email-only

## Recommended Next Action

Owner/operator should provide an approved Preview(staging) `SUPPORT_OPS_DATABASE_URL` through an untracked local env file or process-only shell export, without pasting it into chat or committing it. Then rerun:

- `cd apps/web && corepack pnpm run qa:env:preflight -- support-ops-lookup`
- `cd apps/web && corepack pnpm run ops:paid-result:lookup -- --result-id <staging-result-id>`

Do not return to Production smoke until support lookup passes and the owner accepts the staging baseline.
