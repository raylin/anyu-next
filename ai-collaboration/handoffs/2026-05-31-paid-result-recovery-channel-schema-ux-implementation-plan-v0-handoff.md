# Paid Result Recovery Channel Schema / UX Implementation Plan v0 Handoff

Date: 2026-05-31
Task: Paid Result Recovery Channel Schema / UX Implementation Plan v0

## Goal

Create a concrete schema and UX implementation plan for Module 01 paid result recovery identity, without implementing runtime/schema changes.

## Scope

Planning/spec only. No DB migration, runtime behavior, UI implementation, LINE push, Email sending, membership/login, payment behavior, env, or production flag changes.

## Required Work

- Recap current paid access architecture and recovery gap.
- Recommend v0 data model and future member migration path.
- Decide Email storage strategy and LINE/LIFF reuse strategy.
- Define recovery token/link design without raw pcs_/pa_ exposure.
- Define checkout-start soft gate states, copy, consent model, metrics/events, implementation sequence, tests, risks, and next task.

## Safety Constraints

- Do not implement schema or runtime changes.
- Do not enable production payment runtime, LINE push, Email sending, or membership.
- Do not expose or commit raw `pa_` / `pcs_` tokens, provider payloads, secrets, env values, private customer data, or raw input.
