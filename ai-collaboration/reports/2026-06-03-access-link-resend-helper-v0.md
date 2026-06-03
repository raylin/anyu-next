# Access Link Resend Helper v0

Date: 2026-06-03

## Completed Work

- Added explicit active access-link semantics for `paid_result_recovery_links`.
- Updated automatic Email and LINE access-link send helpers to dedupe against active sent or used links for the same entitlement, recovery contact, and channel.
- Added deterministic latest-link ordering by newest `created_at`.
- Added a server-only support/operator access-link creation helper that creates fresh `support` channel links without adding public UI or public routes.
- Added targeted tests for active-link policy, ordering, Email dedupe, LINE dedupe, and support-channel helper behavior.

## Current Inventory

- Email completed-result save and paid delivery auto-send both call `createAndSendEmailRecoveryLink`.
- LINE paid delivery auto-send calls `createAndSendLineRecoveryLink` after resolving an encrypted recipient secret server-side.
- `/r/[recoveryToken]` marks links `used` on successful resolution, but the link remains valid and multi-use until expiry or revocation.
- Previous duplicate prevention only skipped a non-expired latest `status=sent` link; it did not treat `used` as active and the recent lookup had no explicit ordering.
- Operator smoke endpoints still use the recent lookup only for sanitized post-smoke verification, not for public resend behavior.

## Active Link Semantics

`isPaidResultRecoveryLinkActive` now treats a link as active when:

- it is not `failed`, `expired`, or `revoked`;
- it has no `revoked_at`;
- it is not past `expires_at`;
- and it is `status=sent`, `status=used`, or has `sent_at` / `used_at`.

`used_at` does not deactivate a link. `/r/` links remain multi-use until expiry or revocation.

## Ordering Behavior

- `getRecentPaidResultRecoveryLinkForContact` now orders by newest `created_at`.
- `findActivePaidResultAccessLinkForContact` scans the newest recent rows for the first active sent/used link.
- This avoids a latest failed/revoked row causing duplicate automatic sends when a still-active sent/used link already exists.

## Automatic Send Dedupe Behavior

- Email automatic send now calls `findActivePaidResultAccessLinkForContact`.
- LINE automatic send now calls `findActivePaidResultAccessLinkForContact`.
- If an active sent/used link exists for the same entitlement/contact/channel, the sender returns sanitized `duplicate` status and does not create a new link or send another message.
- Failed, revoked, or expired links are not active and can be retried by existing send flow.

## Support / Operator Resend Helper

- Added `createSupportPaidResultAccessLink`.
- It creates a fresh `support` channel access link for explicit server-side verified support/operator contexts.
- It does not send Email/LINE by itself.
- It does not add a public route or UI.
- Raw token is still returned only to the immediate server-side caller, matching the existing token creation contract; stored rows contain only token hash.

## Architecture Decisions

- No schema change was made in this task.
- No provider message id or send-attempt audit fields were added; those remain a separate implementation step.
- No public self-service resend path was added because non-enumerating responses and rate limits are not yet implemented.
- Deterministic ordering uses newest `created_at` because resend/link creation is the source of link freshness; `sent_at` can be null for created/noop/failed rows.

## Validation

- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm exec vitest run src/tests/paid-result-recovery-links.test.ts src/tests/email-recovery-link.test.ts src/tests/line-recovery-link.test.ts` passed with 42 tests.
- `cd apps/web && corepack pnpm test` passed with 78 test files and 531 tests.
- `cd apps/web && corepack pnpm build` passed.
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke` passed against Preview(staging), with valid `/r/` smoke, invalid-link safety, cleanup by revocation, no Email/LINE sent, and production fail-closed checks passing.
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card` passed against Preview(staging), with checkout-start, fake-paid, paid status completion, paid access render, and production fail-closed checks passing.

## Blockers

- None for helper-level resend readiness.

## Uncertainties

- Support/operator resend still needs a gated caller and verification SOP before operational use.
- Provider accepted/sent state still does not prove inbox/LINE delivery.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: `paid_result_recovery_links` still lacks provider message id, send attempt count, last send attempt timestamp, failure category, resend chain/supersession, and operator audit note.
- Opportunistic cleanup completed: duplicate prevention is now centralized through active-link semantics instead of repeated ad hoc status/expiry checks in senders.
- Deferred cleanup candidates: introduce `paidResultAccessLink` aliases around recovery-named internals after production access-link path stabilizes.

## Suggested Next Steps

1. Provider Message ID / Send Attempt Audit v0.
2. Support Ops Helper v0.
3. Module 02 Concept Spec: 職場暗流雷達 v0 if product exploration becomes the priority.
