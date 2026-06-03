# Provider Message ID / Send Attempt Audit v0

Date: 2026-06-03

## Completed Work

- Added minimal provider send audit fields directly to `paid_result_recovery_links`.
- Added migration `0012_paid_result_recovery_link_send_audit.sql`.
- Updated Email/Resend sender to capture sanitized provider message id when available.
- Updated Email and LINE senders to record safe provider status and failure categories.
- Updated send status helpers to increment `send_attempt_count` and set `last_send_attempt_at`.
- Added tests for provider message id capture, safe provider statuses, failure categories, attempt tracking, noop behavior, and token/private-data exclusion.

## Current Send Status Behavior

- `created`: link row exists but has not been accepted by a real provider.
- `sent`: provider accepted the Email/LINE send request; this does not prove inbox or LINE delivery.
- `used`: `/r/` resolver was opened successfully; the link remains active until expiry/revocation.
- `failed`: provider/config/request flow failed after a link row was created.
- `revoked` / `expired`: link must not resolve.

Before this task, provider success stored only `status=sent` and `sent_at`; provider failure stored only `status=failed`.

## Audit Model Chosen

Chosen v0 model: add direct fields to `paid_result_recovery_links`.

Fields added:

- `provider_message_id`
- `last_send_attempt_at`
- `send_attempt_count`
- `last_failure_category`
- `last_provider_status`

Reasoning:

- Each current access link has one active delivery lifecycle.
- Existing resend helper creates fresh support-channel links instead of appending many public resend attempts to one link.
- Inline fields are enough for v0 support diagnosis without adding a premature send-attempt table.
- A separate send-attempt table remains a good future option if public resend, bounce webhooks, or operator audit history need full attempt timelines.

## Provider Message ID Behavior

Email / Resend:

- On provider success, the sender attempts to parse the JSON body and capture `id`.
- The id is stored only if it matches a strict safe format and length.
- The full provider payload is never stored.

LINE:

- LINE push success is recorded as provider accepted.
- No provider message id is stored because the current LINE Messaging API response path does not provide one.

## Failure Category Behavior

Safe categories supported:

- `provider_config_missing`
- `provider_request_failed`
- `provider_rejected`
- `rate_limited`
- `recipient_unavailable`
- `recipient_blocked_or_unreachable`
- `unknown`

Implementation notes:

- Missing config and unsupported providers map to `provider_config_missing`.
- Request exceptions map to `provider_request_failed`.
- Non-429 provider rejections map to `provider_rejected`.
- 429 maps to `rate_limited` where available.
- Recipient-unavailable LINE contacts remain blocked before link creation, so no orphan `/r/` token is created.
- Raw provider error bodies are not stored.

## Send Attempt Count

- Real provider success calls `markPaidResultRecoveryLinkSent`, which increments `send_attempt_count`, sets `last_send_attempt_at`, clears `last_failure_category`, and stores safe provider metadata.
- Provider/config failure calls `markPaidResultRecoveryLinkFailed`, which increments `send_attempt_count`, sets `last_send_attempt_at`, and stores safe failure metadata.
- `noop` / `test` providers do not mark sent and do not increment attempts.

## Resend / Support Chain

- `createSupportPaidResultAccessLink` is unchanged and still creates a fresh `support` channel link.
- No full operator audit note, resend chain, or supersession field was added in this task.
- Future support tooling should decide whether to keep inline fields or add a separate send-attempt table before public/operator resend UI exists.

## Migration Handling

- Migration added only.
- No staging or production DB migration was applied in this task.
- Recommended next operational task: Provider Send Audit Staging Apply v0.

## Architecture Decisions

- Chose direct audit fields on `paid_result_recovery_links` for v0.
- Did not add a send-attempt table yet.
- Did not store raw provider payloads.
- Did not add public resend UI or support admin tooling.

## Validation

- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm exec vitest run src/tests/paid-result-recovery-links.test.ts src/tests/email-recovery-link.test.ts src/tests/line-recovery-link.test.ts` passed with 43 tests.
- `cd apps/web && corepack pnpm test` passed with 78 test files and 532 tests.
- `cd apps/web && corepack pnpm build` passed.
- `cd apps/web && corepack pnpm exec drizzle-kit check` passed.
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke` passed against Preview(staging), with no Email/LINE sent and production fail-closed checks passing.
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card` passed against Preview(staging), with no provider payment submitted and production fail-closed checks passing.

Note: staging QA ran against the currently deployed Preview(staging) commit before this task was pushed. The new audit migration/code requires a follow-up staging apply/deploy task before runtime audit persistence can be smoke-tested.

## Blockers

- None for code-level audit support.
- Staging DB must be migrated before runtime can persist the new audit fields.

## Uncertainties

- Whether future resend audit history belongs on `paid_result_recovery_links` or a separate `paid_result_access_link_send_attempts` table remains deferred.
- Provider “accepted” still does not prove actual inbox or LINE delivery; bounce/block webhook handling remains future work.

## Tech Debt Review

- New technical debt introduced: inline fields may be insufficient if public resend or provider webhook timelines become important.
- Existing technical debt observed: support/operator verification flow and operator audit note are still not implemented.
- Opportunistic cleanup completed: provider failure/success metadata now flows through central mark helpers.
- Deferred cleanup candidates: introduce a send-attempt table if support operations require full attempt history.

## Suggested Next Steps

1. Provider Send Audit Staging Apply v0.
2. Support Ops Helper v0.
3. Module 02 Concept Spec: 職場暗流雷達 v0 if product exploration takes priority.
