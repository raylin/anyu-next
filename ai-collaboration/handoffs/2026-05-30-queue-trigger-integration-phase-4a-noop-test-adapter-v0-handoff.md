# Queue Trigger Integration Phase 4A: No-op/Test Adapter v0 Handoff

Date: 2026-05-30

## Task

Implement Phase 4A: paid job queue trigger abstraction with disabled-by-default no-op/test adapter behavior.

## Scope

In scope:

- Add queue trigger feature flag/provider selection helpers.
- Add a safe trigger abstraction for paid generation jobs.
- Wire the abstraction after delivery artifact creation for NewebPay NotifyURL and operator fake-paid paths.
- Add targeted tests for flag-off, no-op/test behavior, payload safety, and integration compatibility.

Out of scope:

- Real queue provider wiring.
- QStash or external HTTP calls.
- Payment runtime enablement.
- Production flag changes.
- LINE delivery.
- Refund tooling.
- Prompt/result/public copy changes.

## Constraints

- Disabled by default.
- No external queue calls.
- Queue payload must not contain raw user input, raw `pa_` token, `pcs_` token, tokenized URLs, provider payloads, decrypted provider payloads, provider credentials, or queue credentials.
- Existing behavior must remain unchanged when flag is off.

## Validation Plan

- Targeted queue/notify/fake-paid tests.
- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
