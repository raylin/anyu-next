# Paid Ready / Completed Result Save CTA Implementation v0 Handoff

Date: 2026-06-01

## Task

Implement non-blocking post-payment recovery UX for paid-ready and completed paid result states.

## Scope

- UI and server-side post-payment Email recovery save wiring.
- No Email sending, LINE push, membership, env changes, production DB migration, real payments, payment provider behavior changes, or Module 02 work.

## Guardrails

- Do not expose raw Email, LINE identifiers, encrypted values, hashes, raw `pa_`, or raw `pcs_`.
- Web access remains canonical paid delivery.
- Recovery save is recommended but non-blocking.
- Marketing consent stays separate from transactional recovery consent.
- Production payment runtime remains disabled.

## Validation

- `cd apps/web && corepack pnpm lint`
- targeted recovery/paid access/result tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
