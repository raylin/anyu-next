# Production DATABASE_URL Repair + Smoke Gate v0

Date: 2026-05-20

## 1. Summary

This pass did not clear production smoke.

What was confirmed:

- production apex and `www` routing remain healthy
- `ANTHROPIC_API_KEY` appears present in the safe production runtime probe
- Neon `anyu-next` `production` branch exists

What failed:

- production runtime still does not see a non-empty `DATABASE_URL`
- Neon `anyu-next` `production` branch has no required runtime tables

Actions taken:

- production `DATABASE_URL` secret on `anyu-next` was explicitly overridden using the exact Neon `anyu-next` `production` branch connection string

Source-of-truth result after repair attempt:

- runtime probe still reported `DATABASE_URL` absent

Therefore:

- Gate A failed
- Gate B failed
- production smoke was not run
- current status remains `No-Go`

## 2. Starting State

At task start:

- `https://anyu.tw` served healthy `anyu-next` production deployment
- `https://www.anyu.tw` returned `308` to apex
- public production env names were already present
- prior safe probes could not confirm `DATABASE_URL`

## 3. DATABASE_URL Presence Check

Safe production runtime probe used:

- `vercel env run -e production -- python3 ...`

Observed result before repair:

- `database_url_present False`
- `anthropic_key_present True`

Repair attempt:

- production `DATABASE_URL` secret was overridden to the exact Neon `anyu-next` `production` branch connection string

Observed result after repair:

- `database_url_present False`
- `anthropic_key_present True`

Conclusion:

- source-of-truth runtime still does not see a usable `DATABASE_URL`

## 4. DATABASE_URL Target Confirmation

Expected target:

- provider: Neon
- project: `anyu-next`
- branch: `production`
- region: `aws-ap-southeast-1`

What is known:

- the connection string used for repair came directly from Neon project `anyu-next`, branch `production`

What is not confirmed:

- that production runtime actually received and is using that secret

Reason:

- `vercel env pull` still showed a blank value for `DATABASE_URL`
- `vercel env run -e production` still reported `DATABASE_URL` absent

Status:

- intended target: corrected
- runtime target: unconfirmed / effectively absent

## 5. Production Schema / Migration State

Checked using Neon project `anyu-next`, branch `production`, database `neondb`.

Expected tables:

- `sessions`
- `events`
- `analysis_requests`
- `analysis_results`
- `unlock_intents`
- `contact_submissions`

Observed result:

- table list was empty for the production branch query used in this pass

Schema status:

- `schema-ready for smoke: no`

Required implication:

- even if `DATABASE_URL` were visible, production smoke should still stop here until production schema is created

## 6. Production Smoke Eligibility

Gate A: `DATABASE_URL` + DB target confirmation

- failed

Gate B: schema readiness

- failed

Smoke eligibility:

- `no`

## 7. Production Smoke Result

Production smoke was not run.

Reason:

- runtime `DATABASE_URL` still absent/unconfirmed
- production schema not ready

## 8. Event / Privacy Verification

No new production smoke events or synthetic production contact submissions were created in this pass.

Privacy status for this pass:

- no secrets printed
- no `DATABASE_URL` printed
- no provider key printed
- no synthetic production analyze/contact data written

## 9. Legal / LINE / Redirect Verification

Still verified:

- `https://anyu.tw` returns `HTTP 200`
- `https://www.anyu.tw` returns `HTTP 308` to `https://anyu.tw/`

Not re-smoked further because DB gates failed.

## 10. Actions Taken

1. Verified apex and `www` production domain behavior remained healthy.
2. Ran safe production runtime probe for `DATABASE_URL` and `ANTHROPIC_API_KEY`.
3. Queried Neon `anyu-next` production branch table state.
4. Overrode production `DATABASE_URL` secret with the exact Neon production branch connection string.
5. Re-ran safe runtime probe.
6. Stopped before production smoke because gates still failed.

## 11. Remaining Blockers

1. production runtime still does not see non-empty `DATABASE_URL`
2. production schema is missing required runtime tables
3. production migration has not been approved/run
4. production provider smoke remains pending after DB/schema readiness is real

## 12. Current Go / No-Go Status

Current status: `No-Go`

Reason:

- `DATABASE_URL` runtime readiness failed
- schema readiness failed

## 13. Recommended Next Step

`Production Migration Approval + Runtime Env Debug v0`
