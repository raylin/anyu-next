# Production Payment Runtime Preflight Helper v0 Handoff

Date: 2026-06-04

## Task

Add a secret-safe production payment runtime preflight helper before Controlled Production Payment Smoke v1.

## Context

Controlled Production Payment Smoke v0 proved production payment truth but exposed missing runtime env for checkout session signing, paid access signing, queue trigger, and processor execution. Runtime is disabled again and production checkout fails closed.

## Constraints

- Do not enable production runtime or checkout.
- Do not run payment.
- Do not send Email or LINE.
- Do not mutate production env.
- Do not print secrets, token values, provider payloads, or private customer data.
- Do not apply DB migrations.

## Planned Work

1. Inventory runtime dependencies in code.
2. Add a local secret-safe preflight command with dry-run and smoke-ready modes.
3. Check env names, DB schema, and production route safety without printing values.
4. Add tests for missing env categories, sanitized output, and readiness classification.
5. Run validation and production preflight in presence-only mode.
6. Document findings, commit, and push to `origin/staging`.

## Current State

- Handoff saved before implementation.
- Added `qa:production:payment-preflight`.
- Added Vercel Production env-name checks, dry-run/smoke-ready modes, live route safety checks, and optional local DB schema check support.
- Targeted tests, lint, full tests, build, and production dry-run preflight passed.
- Production runtime/env/DB were not mutated.
