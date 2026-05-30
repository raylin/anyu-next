# Remove or Gate Processor Auth Diagnostics for Launch Readiness v0 Handoff

Date: 2026-05-30

## Task

Remove or tighten temporary processor auth diagnostics before Phase 4 queue work and launch readiness.

## Context

Processor auth diagnostics were added during staging fake-paid QA to debug `INTERNAL_JOB_SECRET` mismatch. The quality scan classified them as P1 cleanup before queue provider wiring or launch.

## Scope

Cleanup and hardening only.

In scope:

- Inspect current processor auth diagnostics.
- Decide whether to remove or gate diagnostics.
- Update processor route, auth helper, QA runner, and tests as needed.
- Preserve safe unauthorized behavior and valid processor behavior.

Out of scope:

- Payment runtime enablement.
- Queue trigger implementation.
- NewebPay behavior changes.
- LINE delivery.
- Public copy changes.
- Vercel env changes or deployment.

## Constraints

- Do not print or record secrets.
- Do not expose bearer values, token values, secret lengths, prefixes, suffixes, hashes, raw env data, or timing details.
- Do not change production payment behavior.
- Do not implement Phase 4 queue trigger in this task.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- Targeted processor/auth tests.
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm run qa:fake-paid` without secrets to confirm safe blocked behavior.
