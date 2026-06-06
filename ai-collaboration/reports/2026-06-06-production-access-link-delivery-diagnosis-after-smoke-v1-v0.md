# Production Access-Link Delivery Diagnosis After Smoke v1 v0

Date: 2026-06-06

## Model / Effort

- Model: Codex
- Effort: high

## Environment Guard

- Environment asserted: Production
- Base URL asserted: `https://anyu.tw`
- Health endpoint: reachable and reports `environment=production`
- Result source category: `production_runtime`
- Supported ops boundary used first: Admin API + `pnpm ops lookup-result --env production`
- Production runtime status during diagnosis: fail-closed
- Production checkout/payment during diagnosis: not enabled
- Payment / Email / LINE during diagnosis: not run

## Admin CLI Summary

Admin CLI lookup for the production smoke result showed:

- payment: paid
- entitlement: active
- generation: completed
- paid result: completed
- delivery artifact: ready
- Email contact saved: false
- Email sent: false
- Email active: false
- LINE contact saved: true
- LINE recipient secret exists: false
- LINE sent: false
- LINE active: false
- diagnosis: `paid_result_ready`, `line_contact_saved`, `access_link_missing`

This confirms the remaining issue is delivery/contact state, not payment or generation.

## Why Direct DB Was Used

Direct DB read-only debugging was used because Admin CLI does not expose the fields required to distinguish:

- contact source
- contact status
- payment/entitlement linkage
- contact eligibility for send hook
- whether a secret row exists but is filtered out
- whether any access-link rows exist but failed/sent/duplicate

The DB queries were read-only and returned only grouped booleans/counts/categories. They did not print raw Email, raw LINE ID, encrypted recipient, hashes, tokens, token hashes, provider payloads, source text, or tokenized URLs.

## Read-Only DB Findings

Core production result state:

- analysis result exists: true
- paid payment exists: true
- active entitlement exists: true
- completed generation exists: true
- completed paid result exists: true

Contact state:

- exactly one LINE contact row exists for the result
- LINE contact status: `bound`
- LINE contact source: `checkout_start`
- transactional consent present: true
- payment link present and matches the paid payment: true
- entitlement link present and matches the active entitlement: true
- LINE hash present: true
- Email contact rows: zero

Eligibility state:

- eligible LINE contacts for completed paid result: 1
- eligible Email contacts for completed paid result: 0

Secret/link state:

- contact secret rows linked to this result: zero
- paid result access-link rows linked to this result: zero

## Expected vs Actual Email Chain

Expected Email chain:

1. Checkout-start Email save creates an `email` contact.
2. Paid readiness hook finds eligible Email contact.
3. Hook creates an Email access link.
4. Email provider sends the `/r/` link.
5. Admin API shows `email.contactSaved=true` and `email.sent=true`.

Actual Email chain:

1. No Email contact row exists for this production result.
2. No Email access-link row exists.
3. No Email send is recorded.

Diagnosis:

- Email is `not_verified_for_this_result`.
- This should not be classified as provider Email failure from current evidence.
- The payment gate can unlock from LINE alone, so Email may not have been saved in this exact production run.

## Expected vs Actual LINE Chain

Expected LINE chain:

1. Mobile LINE bind verifies LIFF identity.
2. Bind route creates a LINE contact.
3. Bind route creates an active encrypted recipient secret.
4. Paid readiness hook finds the eligible LINE contact.
5. Hook resolves the recipient secret.
6. Hook creates a LINE access link.
7. LINE provider sends the `/r/` link.
8. Admin API shows `line.contactSaved=true`, `line.recipientSecretExists=true`, and `line.sent=true`.

Actual LINE chain:

1. LINE contact exists.
2. LINE contact is bound, consented, linked to the paid payment, and linked to the active entitlement.
3. The contact is eligible for the completed paid result send hook.
4. No recipient secret row exists.
5. No paid result access-link row exists.
6. No LINE message was sent.

Diagnosis:

- The LINE bind state is partial: contact exists without recipient secret.
- The send hook had an eligible LINE contact but could not resolve a recipient, so no LINE access-link was created/sent.

## Code Path Diagnosis

Relevant code behavior:

- `bindVerifiedLineUserToRecoveryContact` writes the contact first, then writes the recipient secret.
- If recipient-secret write fails, the helper returns `recipient_secret_write_failed`, but the contact write is not rolled back.
- The checkout-start gate uses `existingRecovery.hasAny`, derived from active contact rows only.
- `existingRecovery.hasLine` does not require an active recipient secret.
- Therefore a partial LINE bind can satisfy the mandatory save gate and unlock payment even though LINE delivery cannot happen later.
- The paid-generation processor calls `sendRecoveryLinksForCompletedPaidResult` after paid result completion.
- The send hook filters eligible contacts by module/result/entitlement/source/status and then calls the LINE sender.
- The LINE sender returns unavailable before creating an access link if no recipient can be resolved.

Conclusion:

The first delivery failure is `line_bind_partial_contact_without_secret`.

## Email Save Status Diagnosis

The production result has no Email contact row. Current evidence cannot prove that owner completed Email save for this exact result after the clean reset. Because the UI can unlock payment from LINE contact alone, Email should be classified as:

- `email_save_not_performed_for_result` or `not_verified_for_this_result`

It should not be classified as provider Email send failure from current evidence.

## Access-Link Send Hook Diagnosis

The send hook did run as part of paid generation completion, but it had no deliverable contacts:

- Email: no eligible Email contact because no Email contact exists.
- LINE: one eligible LINE contact exists, but recipient secret is missing.

Because the LINE recipient was unavailable before link creation, no `paid_result_access_links` rows were created for this result.

## First Failure Category

`line_bind_partial_contact_without_secret`

Related categories:

- `line_recipient_secret_write_failed`
- `email_save_not_performed_for_result`
- `access_link_send_hook_skipped_contacts`

## Recommended Fix Strategy

### 1. LINE Recipient Secret Bind Invariant Fix

Reason:

- A LINE contact without an active recipient secret is not deliverable.
- The current contact-first/secret-second write path can leave partial state.
- Checkout currently trusts contact presence alone.

Likely files:

- `apps/web/src/lib/line/recovery-bind-state.ts`
- `apps/web/src/app/api/line/recovery/bind-liff/route.ts`
- `apps/web/src/lib/db/payment-recovery-contacts.ts`
- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/checkout/page.tsx`
- tests around LINE bind route and checkout-start gate

Suggested direction:

- Make LINE bind atomic or compensate on recipient-secret failure.
- Treat LINE saved state as valid only when active recipient secret exists.
- Ensure checkout payment unlock for LINE requires recipient-secret presence, not just contact row presence.

Staging reproduction required: yes.

Production data mutation required: not for diagnosis; likely no for code fix. Existing failed production smoke artifact can remain as evidence.

Another payment required: no for fix validation; only for final controlled smoke retry after staging proof and owner approval.

### 2. Admin API Summary Enhancement

Reason:

- Admin CLI showed recipient secret missing but not contact source/linkage/eligibility.
- A future support lookup should distinguish partial bind from send failure without DB debugging.

Likely files:

- `apps/web/src/lib/admin/paid-result-lookup.ts`
- `tools/admin-cli/src/lookup-result.ts`
- admin lookup tests

Suggested direction:

- Add sanitized fields/categories such as `lineBindDeliverable`, `contactEligible`, `recipientSecretMissing`, and `accessLinkCreated`.
- Keep raw/private values out of response.

Staging reproduction required: yes.

Production data mutation required: no.

Another payment required: no.

### 3. Production Smoke Checklist Adjustment

Reason:

- The previous smoke also exposed that the processor flag must be explicitly enabled during the payment window.

Suggested direction:

- Add smoke-window verification that `ENABLE_PAID_GENERATION_PROCESSOR=true` before owner payment action.
- Keep production runtime/checkout disabled after smoke.

Staging reproduction required: no.

Production data mutation required: no.

Another payment required: only for the eventual retry.

## Gate Results

- `qa:module01:local`: PASS
- `qa:module01:staging`: PASS after supplying explicit staging `ADMIN_API_TOKEN` and known safe staging result ID via process env
- `qa:module01:production-preflight`: PASS / `pass_ready_for_controlled_smoke`

No real Email/LINE sends and no production payment were run during this diagnosis.

## Production Fail-Closed Result

- Production health reachable and reports production.
- Public pages live.
- Production checkout/fake-paid routes fail-closed under production preflight.
- Production runtime and checkout remain disabled.

## Theme Route Preservation

Theme Architecture remains archived and preserved:

- Hybrid Theme Park Model adopted.
- Module 01 = Riso-only adopted.
- Core Shell = neutral editorial adopted.
- Runtime theme implementation remains deferred.

## Recommended Next Task

LINE Recipient Secret Bind Invariant Fix v0, reproduced and validated on staging before any production payment retry.
