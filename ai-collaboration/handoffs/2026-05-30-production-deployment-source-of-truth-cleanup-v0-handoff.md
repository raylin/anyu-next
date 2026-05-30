# Production Deployment Source-of-Truth Cleanup v0 Handoff

Date: 2026-05-30

## Task

Audit and document the current git, Vercel, domain, and production route state so production deployment source-of-truth is clear before Phase 4B queue provider wiring.

## Scope

In scope:

- Local git state and lock/permission inspection.
- `origin/main` versus `origin/staging` divergence analysis.
- Read-only Vercel project/domain/deployment checks where CLI access allows.
- Safe production HTTP checks for merchant-review content and disabled payment routes.
- Documentation, summary log, commit, and staging push.

Out of scope:

- Production env changes.
- Production deploys.
- Merging or pushing `main`.
- Payment runtime enablement.
- Queue provider wiring.
- NewebPay runtime behavior changes.
- Public copy changes.

## Constraints

- Do not print secrets or env values.
- Do not modify Vercel env.
- Do not deploy.
- Do not merge or push `main` unless explicitly approved later.
- Remove git lock files only if clearly stale and no git process is running.

## Validation Plan

- Docs presence check.
- Secret/private pattern scan on new docs.
- `git diff --check`.
