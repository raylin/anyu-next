# LINE Recipient Secret Bind Invariant Fix v0 Handoff

Date: 2026-06-06

## Task

Fix the LINE save/bind invariant so a LINE contact cannot be treated as saved, deliverable, or checkout-unlocking unless an active recipient secret exists.

## Context

- Controlled Production Payment Smoke v1 was partial.
- Payment, entitlement, paid generation, paid result, and delivery artifact completed.
- LINE delivery failed.
- Diagnosis found first failure category: `line_bind_partial_contact_without_secret`.
- Production is fail-closed.

## Scope

- LINE bind invariant.
- Checkout gate saved/unlock behavior.
- Paid access-link send eligibility.
- Admin API / Admin CLI sanitized summary.
- Targeted tests and structured Module 01 QA tiers.

## Constraints

- Do not enable production runtime or checkout.
- Do not run production payment.
- Do not send production Email or LINE.
- Do not mutate production data.
- Do not rotate env secrets.
- Do not modify Vercel env.
- Do not apply DB migrations unless truly required and approved.
- Do not expose raw LINE userId, encrypted recipient, hashes, tokens, or provider payloads.

## Validation Intent

Use local validation first:

- targeted LINE bind / checkout gate / send hook / Admin API tests
- `qa:module01:mock-flow`
- `qa:module01:ui`
- `qa:module01:local`

Run `qa:module01:staging` only if deployed route behavior cannot be proven locally/mocked.
Run `qa:module01:production-preflight` only if production/preflight/env behavior changes.

## Timing

- taskStartedAt: `2026-06-06T14:19:57Z`
- taskCompletedAt: `2026-06-06T14:28:19Z`
- totalWallClockDuration: `8m22s`
- humanWaitDuration: `0m`
- netCodexWorkDuration: `8m22s`
