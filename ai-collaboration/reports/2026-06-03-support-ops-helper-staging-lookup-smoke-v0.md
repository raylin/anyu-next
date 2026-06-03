# Support Ops Helper Staging Lookup Smoke v0

Date: 2026-06-03

## Completed Work

- Verified support helper environment readiness without printing values.
- Confirmed the local `.env.local` `DATABASE_URL` was present but not usable for the Preview(staging) payment schema.
- Resolved the Preview(staging) Neon branch through operator tooling and used its connection only ephemerally for this smoke.
- Ran `ops:paid-result:lookup` against known Preview(staging) artifacts.
- Verified sanitized output, diagnosis usefulness, and production guard behavior.
- Ran staging-safe regression QA.

## Env / Target Verification

- Preview(staging) branch used: `br-fragrant-union-aoh4udf1`.
- Production branch remained separate and was not queried for data.
- Local `.env.local` had `DATABASE_URL` present, but that connection did not contain the expected payment tables, so it was not treated as the staging lookup target.
- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` was missing locally, so Email-hash lookup was not exercised in this smoke.
- No connection string, credential, value length, prefix, suffix, hash, or checksum was printed in this report.

## Commands Run

Sanitized command categories:

- `ops:paid-result:lookup` by `resultId`
- `ops:paid-result:lookup` by internal `recoveryLinkId`
- production guard check using `--target production`
- `qa:recovery-link:smoke`
- `qa:result-checkout:no-card`

No raw lookup values are included here.

## Staging Lookup Result

### Result Lookup

The first lookup resolved a paid sandbox result and returned:

- payment found: yes
- payment status: `paid`
- provider environment: `sandbox`
- entitlement found: yes
- entitlement status: `active`
- generation status: `completed`
- paid result status: `completed`
- Email saved: no
- LINE saved: no
- active access link: no
- diagnosis: `paid_result_ready`, `no_saved_contact`
- recommended action: ask user for an order/reference if they need support because no saved contact/link exists

This is useful for the support case where the paid result exists but the user did not save an access-link destination.

### Recovery Link Lookup

The second lookup resolved an active LINE access-link artifact and returned:

- payment found: yes
- payment status: `paid`
- duplicate payment possible: yes, due to operator/test artifact shape
- entitlement found: yes
- entitlement status: `active`
- generation status: `completed`
- paid result status: `completed`
- Email saved: no
- LINE saved: yes
- LINE recipient secret active: yes
- active access link: yes
- access-link channel: `line`
- latest link status: `used`
- provider message id value printed: no
- diagnosis: `duplicate_payment_possible`, `paid_result_ready`, `access_link_sent`
- recommended actions: use saved view link; escalation/refund review if duplicate payment concern applies

This is useful for LINE support cases because it confirms a bound LINE contact, encrypted recipient-secret presence, active `/r/` link state, and paid-result readiness without exposing private recipient or token data.

## Redaction Result

The helper output reported all redaction booleans as safe and no unsafe values were observed.

Not printed:

- raw Email
- raw LINE userId
- encrypted LINE recipient
- contact hashes
- recipient hashes
- token hashes
- raw `pa_`, `pcs_`, or `prl_` tokens
- tokenized URLs
- raw source text
- provider payloads
- provider message ID values

## Diagnosis / Action Usefulness

The diagnosis output was useful for two common support categories:

- `paid_result_ready` + `no_saved_contact`: paid report is ready, but support cannot point to a saved Email/LINE destination.
- `paid_result_ready` + `access_link_sent`: paid report is ready and an active channel-specific access link exists.

One caveat: operator/test artifacts may produce `duplicate_payment_possible` because they can have more than one payment intent for a result. This is useful as a caution, but support operators should interpret it with the artifact source in mind.

## Production Guard

Production target check returned:

- `production_target_rejected`
- values printed: false

No production DB lookup, write, env change, Email send, or LINE send occurred.

## Regression QA

- `corepack pnpm run qa:recovery-link:smoke`: passed on Preview(staging) commit `89b875a04dec`
- `corepack pnpm run qa:result-checkout:no-card`: passed on Preview(staging) commit `89b875a04dec`
- Both commands passed production fail-closed checks.
- No Email or LINE message was sent by these regressions.

## Limitations

- Email-hash lookup was not smoke-tested because the local operator environment lacked `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`.
- Report reference remains display-only and not reverse-mapped.
- Provider message IDs remain presence-only in support output.
- The helper is read-only; it recommends future gated support resend but does not create/send links.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: local `.env.local` `DATABASE_URL` does not point to the Preview(staging) payment schema, so support operators need explicit staging DB target setup.
- Opportunistic cleanup completed: none.
- Deferred cleanup candidates: document or automate safe staging DB target selection for support lookup sessions.

## Suggested Next Steps

1. Support Ops Env Alignment v0 so `ops:paid-result:lookup` can use a clearly named Preview(staging) DB env without operator tooling.
2. Support Resend Operator Action v0 after verification and rate-limit rules are approved.
3. Module 02 Concept Spec: 職場暗流雷達 v0 if Module 01 support readiness is sufficient for now.
