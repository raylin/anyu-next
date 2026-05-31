# Post-Payment Recovery Helper Methods v0

Date: 2026-06-01

## Completed Work

- Added server-only recovery status summary helpers in `payment-recovery-contacts`.
- Added post-payment Email recovery contact helper for future paid-ready / completed-result save surfaces.
- Added non-fatal paid-delivery binding from payment intent recovery contacts to entitlement after paid delivery artifacts are available.
- Added tests for summary states, masked display, post-payment save idempotency, entitlement binding, and non-fatal binding failure.
- No user-facing UI, Email sending, LINE push, membership, env, migration, production config, or payment provider behavior changes were made.

## Current Architecture Findings

- Checkout-start recovery capture links Email recovery contacts to `module_slug`, `analysis_result_id`, and checkout-created `payment_intent_id`.
- Before this task, paid transition did not bind recovery contacts to entitlement in the paid-delivery artifact path.
- `bindRecoveryContactsToEntitlement` already existed and updates contacts by `payment_intent_id`.
- Paid-ready/access/completed-result paths can resolve payment intent, entitlement, result, and paid result context server-side.
- Completed-result rendering currently receives display-oriented props, so future UI should consume a sanitized summary instead of raw recovery contact rows.

## Helpers Added

### `summarizePaymentRecoveryContacts`

Pure server-side summary helper.

Output shape:

- `hasRecoveryContact`
- `hasEmailRecovery`
- `hasLineRecovery`
- `emailStatus`
- `lineStatus`
- `transactionalConsentPresent`
- `marketingOptInPresent`
- `recommendedPostPaymentAction`
- `safeDisplayContact`

The helper never returns raw Email, raw LINE identifiers, encrypted values, hashes, raw `pa_`, or raw `pcs_`.

### `getPaymentRecoveryStatusSummary`

Async DB-backed helper for future paid-ready / completed-result pages.

Inputs:

- `moduleSlug`
- `analysisResultId`
- optional `paymentIntentId`
- optional `entitlementId`

It reads recovery contacts by result and filters by module and optional payment/entitlement context before returning the sanitized summary.

### `createOrUpdatePostPaymentEmailRecoveryContact`

Server-only helper for future post-payment Email save UI.

Behavior:

- accepts source `paid_ready`, `completed_result`, or `support`
- links module, result, payment intent, and entitlement when available
- stores encrypted normalized Email plus keyed hash through existing crypto helpers
- records transactional consent
- keeps marketing opt-in separate
- sets status `bound` when entitlement context exists, otherwise `verified`
- sends no Email

## Status Summary Behavior

- No contact: `recommendedPostPaymentAction = suggest_email_save`
- Failed Email and no active contact: `recommendedPostPaymentAction = retry_email`
- Active Email or LINE contact: `recommendedPostPaymentAction = confirm_saved`
- Email display, when decryptable, is masked only.
- Failed/revoked contacts are not counted as active recovery contacts.
- Marketing opt-in is reported separately from transactional recovery consent.

## Binding Behavior

Paid delivery now calls `bindRecoveryContactsToEntitlement` after entitlement availability is confirmed.

Properties:

- idempotent because it updates by `payment_intent_id`
- works for newly created or reused entitlements
- does not create duplicate recovery contacts
- failure is swallowed intentionally so recovery support infrastructure cannot fail paid delivery
- no raw contact identifiers are logged or returned

## Tests Added / Updated

- Summary when no contact exists.
- Summary when Email contact exists from checkout-start.
- Summary when Email contact is bound to entitlement.
- Summary recommends Email save when unsaved.
- Summary recommends saved confirmation when saved.
- Summary recommends retry after failed Email state.
- Masked Email display does not expose the full raw Email.
- Post-payment Email save creates encrypted/hash contact linked to payment/entitlement context.
- Repeated post-payment Email save reuses existing contact.
- Paid delivery binds recovery contacts to entitlement.
- Paid delivery still succeeds if recovery binding fails.
- Existing checkout-start recovery and paid delivery tests still pass.

## Validation

- `cd apps/web && corepack pnpm test src/tests/payment-recovery-contacts.test.ts src/tests/paid-delivery-artifacts.test.ts` passed: 2 files, 23 tests.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 64 files, 416 tests.
- `cd apps/web && corepack pnpm build` passed.

## Tech Debt Review

New technical debt introduced: none.

Existing technical debt observed:

- Post-payment UI still needs to consume the new sanitized recovery summary.
- LINE recovery binding remains deferred until a recovery-specific LIFF state exists.
- Recovery link sending and production recovery DB/env apply remain gated.

Opportunistic cleanup completed:

- Paid delivery now links existing checkout-start recovery contacts to entitlement in a non-fatal way.

Deferred cleanup candidates:

- Add UI integration for paid-ready reminder and completed-result save section.
- Add recovery link sending with fresh short-lived server-resolved links.
- Add LINE recovery binding after LIFF recovery state design.

## Recommended Next Step

Run **Paid Ready / Completed Result Save CTA Implementation v0**.

The implementation should consume `getPaymentRecoveryStatusSummary`, keep the primary paid-ready CTA as `查看完整報告`, add a non-blocking completed-result save section, and avoid Email/LINE delivery language.
