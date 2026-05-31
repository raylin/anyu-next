# Paid Result Recovery Channel Plan v0 Handoff

Date: 2026-05-31
Task: Paid Result Recovery Channel Plan v0

## Goal

Plan a Module 01 paid-result recovery channel flow using LINE and/or Email, with skip allowed but clearly warned, without changing runtime behavior.

## Scope

Documentation and planning only. No schema, runtime, env, provider, LINE push, Email delivery, payment, or production behavior changes.

## Required Work

- Inspect current checkout-start, ReturnURL/status/access, paid access token, checkout session, legacy LINE/ContactCapture, support/refund, and no-card QA paths.
- Document current access/recovery gap.
- Propose soft-gated recovery UX on checkout-start and post-ready/completed surfaces.
- Separate transactional recovery consent from marketing/re-engagement consent.
- Compare data model options and recommend a v0 strategy.
- Recommend safe recovery link/access design without exposing `pa_` or `pcs_` tokens.
- Define metrics, phases, risks, and next implementation task.

## Safety Constraints

- Do not implement runtime or schema changes.
- Do not enable production payment runtime or LINE push.
- Do not expose or commit raw `pa_` / `pcs_` tokens, provider payloads, env values, secrets, private customer data, or raw input.
- Do not change payment provider behavior.
