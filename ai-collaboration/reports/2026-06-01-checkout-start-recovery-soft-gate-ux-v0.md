# Checkout-Start Recovery Soft Gate UX v0

## Date

2026-06-01

## Completed Work

- Added a checkout-start recovery soft gate before the NewebPay submit action.
- Added Email recovery capture endpoint:
  - `POST /api/modules/[moduleSlug]/result/[resultId]/recovery/email`
- Linked Email recovery contacts to:
  - `module_slug`
  - `result_id`
  - `payment_intent_id` when checkout-start has created or reused a payment intent
- Kept recovery as a soft gate:
  - users can save Email
  - users can skip after explicit acknowledgement
  - payment provider behavior is unchanged
- Kept LINE as a deferred secondary recovery option in v0.
- Updated no-card QA helper checks so future staging QA verifies the recovery soft gate.
- Updated dashboard and summary log.

## UI Implemented

Checkout-start now shows:

- title: `建議先保存這次完整報告`
- explanation that web access remains canonical and recovery reduces lost-access support risk
- Email recovery form
- separate optional marketing checkbox
- LINE recovery option marked `稍後支援`
- skip warning:
  - `你仍然可以繼續付款。但若未保存，關閉頁面、更換裝置或清除瀏覽資料後，可能需要透過客服協助找回完整報告。`
- required acknowledgement checkbox before submitting to NewebPay when no recovery contact is saved
- saved state when an active recovery contact already exists

The acknowledgement checkbox has no `name`, so it is not submitted as an extra NewebPay provider field.

## Email Behavior

- Email capture posts to a server route.
- The route calls `createOrUpdateEmailRecoveryContact`.
- Email is normalized/encrypted/hashed by the existing recovery helper layer.
- `transactional_consent_at` is recorded by helper default.
- `source=checkout_start`.
- `status=pending` because no Email verification or sending is implemented in v0.
- Optional marketing consent is recorded separately as `marketing_opt_in_at`.
- If recovery hash/encryption secrets are missing, Email save fails closed and redirects back with safe error state.
- Checkout is not blocked when Email save fails.

No Email is sent in this task.

## LINE Behavior

LINE is visible only as a deferred secondary option:

- no LIFF recovery binding was implemented
- no LINE push was implemented
- no raw LINE user ID is collected
- copy states LINE is for future recovery/completion notification/support assistance, not paid report delivery

Reason for deferral:

- existing LIFF/ContactCapture flows are still tied to legacy unlock/fulfillment assumptions
- recovery-specific LIFF state should be designed separately to avoid carrying raw `pcs_` or `pa_` tokens

## Skip Behavior

- Skip is allowed.
- If no recovery contact is saved, the NewebPay provider form requires an explicit acknowledgement checkbox.
- The acknowledgement text warns that closing the page, switching devices, or clearing browser data can require support-assisted recovery.
- The checkbox is browser-side only and is not submitted to NewebPay because it has no `name`.

## Data Linkage

The checkout-start page already creates or reuses the payment intent before rendering the provider form, so Email recovery contact creation receives:

- `module_slug`
- `analysis_result_id`
- `payment_intent_id`
- `source=checkout_start`
- `status=pending`

`entitlement_id` remains null before payment and can be linked later by the existing `bindRecoveryContactsToEntitlement` helper.

## Consent Handling

- Transactional recovery consent is implied by the Email save action for this report only.
- Marketing/re-engagement consent is a separate optional checkbox.
- No marketing messages are sent in v0.

## Security / Privacy

- No raw `pa_` token is accepted or stored.
- No raw `pcs_` token is accepted or stored.
- No provider payload is logged or changed.
- No raw Email is rendered after save.
- No raw LINE identifier is collected.
- No report content is sent to Email or LINE.
- The recovery endpoint redirects only with safe category-like states: `email_saved` or `email_error`.

## Staging QA Result

Live staging Email-save QA was not run in this task.

Reason:

- the new endpoint/UI are not available on staging until this commit is pushed and deployed
- local `.env.local` has `OPERATOR_TEST_SECRET` present but does not have `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` or `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY` present
- Vercel env listing could not be inspected from `apps/web` because the app subdirectory is not directly linked to Vercel

The follow-up staging QA should verify Preview(staging) has:

- `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`
- `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`

Then run:

- checkout-start Email save with a fake test Email only
- result-page checkout no-card QA
- production fail-closed checks

## Tests / Validation

Passed:

- `cd apps/web && corepack pnpm lint`
- `cd apps/web && corepack pnpm test -- src/tests/newebpay-checkout-start-page.test.tsx src/tests/payment-recovery-email-route.test.ts src/tests/payment-recovery-contacts.test.ts src/tests/result-checkout-no-card-qa.test.ts`
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`

## Architecture Decisions

- Implemented Email first for v0 because it can use the existing recovery crypto/helper layer without adding LINE delivery or LIFF state.
- Deferred LINE recovery binding because current LINE infrastructure is reusable but still legacy-unlock shaped.
- Kept recovery capture separate from NewebPay provider form and did not alter checkout payload/signature logic.
- Used safe redirect state instead of returning raw contact data.

## Blockers

- Live staging Email-save QA requires deployed commit and verified Preview(staging) recovery secrets.

## Uncertainties

- Whether the owner wants marketing opt-in visible at checkout-start or deferred to the completed paid result page.
- Whether future LINE recovery binding should reuse current LIFF bridge paths or get a separate recovery-specific bridge.

## Suggested Next Steps

1. Run `Checkout-Start Recovery Soft Gate Staging QA v0`.
2. Add Preview(staging) recovery secrets if they are missing, using secret-safe env alignment.
3. Plan `LINE Recovery Binding Reframe v0` only after Email soft gate is verified.

## Tech Debt Review

### New Technical Debt Introduced

- LINE recovery option is visible but deferred.
- Email recovery save is pending, not verified, because v0 does not send confirmation Email.

### Existing Technical Debt Observed

- Recovery enum-like DB fields remain service-enforced rather than DB CHECK constrained.
- Production DB migration remains gated.

### Opportunistic Cleanup Completed

- Updated no-card QA helper to assert recovery soft gate presence on checkout-start.

### Deferred Cleanup Candidates

- Recovery soft gate staging QA.
- LINE recovery binding reframe.
- Paid-ready/completed save CTA.
- Recovery link sending design and implementation.

### Recommended Follow-up

- `Checkout-Start Recovery Soft Gate Staging QA v0`.
## Git Commit

- Commit hash: `pending`
- Commit message: `feat: add checkout recovery soft gate`

## Staging Push

- Push status: `pending`
- Push command: `git push origin HEAD:staging`
