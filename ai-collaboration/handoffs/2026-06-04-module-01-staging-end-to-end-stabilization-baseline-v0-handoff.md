# Module 01 Staging End-to-End Stabilization Baseline v0 Handoff

Date: 2026-06-04

## Task

Freeze Production and return to Preview(staging) to establish a trustworthy Module 01 end-to-end baseline, including mandatory access-link save before payment, desktop Email-only UX, mobile LINE-first UX, Email/LINE access-link delivery, `/r/` paid result access, delivery artifact, support lookup, and tech-debt backlog documentation.

## Constraints

- Do not enable Production payment runtime or checkout.
- Do not run another Production payment.
- Do not send Production Email or LINE messages.
- Do not modify Production env, Production DB, or NewebPay Production dashboard settings.
- Do not expose `pa_`, `pcs_`, `pal_`, tokenized URLs, raw Email, raw LINE ID, encrypted recipient, hashes, provider payloads, or secrets.
- Do not broadly clean access-link/recovery naming tech debt in this task; record it for follow-up.

## Planned Work

1. Verify Production remains frozen/fail-closed.
2. Reconcile Preview(staging) deployment, DB schema, and required env-name presence.
3. Inspect checkout-start access-link save UX and implement required gate:
   - desktop/non-mobile Email only
   - mobile LINE first above Email
   - save required before payment proceeds
4. Verify staging ReturnURL/NotifyURL alignment.
5. Run unit/integration/build validation and staging QA commands.
6. Perform or document staging user-journey checks for desktop Email, mobile LINE, mobile Email fallback, failure/fallback, and support lookup.
7. Document remaining access-link/recovery naming and operational tech debt.
8. Create execution report, update summary log/dashboard, commit, and push to `origin/staging`.

## Initial State

- Production smoke is paused after partial attempts.
- Production should remain public-content-only with checkout/runtime fail-closed.
- Recent Production payment truth and paid generation were recovered, but clean one-shot Production UX remains untrusted.
- Staging is the validation target for this task.
