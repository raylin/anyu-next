# LINE Recipient Secret Bind Invariant Fix v0

Date: 2026-06-06

## Model / Effort

- Model: Codex
- Effort: high

## Timing

- taskStartedAt: `2026-06-06T14:19:57Z`
- taskCompletedAt: `2026-06-06T14:28:19Z`
- totalWallClockDuration: `8m22s`
- humanWaitDuration: 0m
- netCodexWorkDuration: `8m22s`

## Invariant Definition

LINE save success now requires all of:

- `payment_access_link_contacts` row exists
- `contact_type=line`
- transactional consent is present
- contact status is valid and not failed/revoked
- `payment_access_link_contact_secrets` row exists
- secret `channel=line`
- secret purpose matches the current sender lookup compatibility set
- secret `status=active`
- encrypted recipient exists
- recipient hash exists

Contact-only state is partial. It is not saved, not deliverable, and must not unlock checkout by LINE.

## Fix Summary

### Bind Write Behavior

Updated `bindVerifiedLineUserToRecoveryContact`:

- Still validates LIFF identity and refuses missing LINE identity.
- Still writes raw LINE ID only through hash/encrypted recipient paths.
- If recipient-secret creation returns null or throws, the helper marks the contact `failed`.
- The route returns safe `bind_failed` with `bindCategory=recipient_secret_write_failed`.
- A contact left after secret failure is no longer active/deliverable.

This uses the acceptable safe pattern from the task: compensate immediately and keep checkout from treating partial state as saved.

### Checkout Gate Behavior

Updated checkout-start existing recovery state:

- Email save counts only when contact is not failed/revoked and has transactional consent.
- LINE save counts only when a valid LINE contact also has an active recipient secret with encrypted recipient and recipient hash.
- LINE contact-only state sets `hasLineContactOnly=true`.
- Mobile partial LINE state shows safe incomplete copy, allows retry LINE bind, and keeps Email fallback.
- Payment CTA remains locked for LINE contact-only state.
- Desktop remains Email-only.
- Mobile remains LINE first above Email fallback.

### Paid Delivery Eligibility

Updated `getEligibleLineRecoveryContactsForCompletedPaidResult`:

- LINE contacts must pass the existing module/result/entitlement/source/status/consent filters.
- They must also have an active compatible recipient secret before being returned to the send hook.
- A contact without active recipient secret is skipped before access-link creation.

This prevents the send hook from treating contact-only LINE state as deliverable.

### Admin API / CLI Summary

Updated Admin API summary:

- `accessLinks.line.deliverable`
- `line_bind_incomplete`
- `line_recipient_secret_missing`
- `retry_line_bind_or_use_email`

For partial LINE bind:

- `contactSaved=true`
- `recipientSecretExists=false`
- `deliverable=false`
- diagnosis includes `line_bind_incomplete` and `line_recipient_secret_missing`
- recommended action includes `retry_line_bind_or_use_email`

Updated Admin CLI:

- validates optional `deliverable`
- pretty output shows `not-deliverable` when contact exists but LINE is not deliverable
- no private fields are exposed

## Tests Run

| Check | Result |
| --- | --- |
| Targeted invariant tests | PASS, app-side 6 files / 65 tests |
| `corepack pnpm --filter @anyu/admin-cli test` | PASS, 1 file / 13 tests |
| `corepack pnpm --filter @anyu/admin-cli typecheck` | PASS |
| `cd apps/web && corepack pnpm run qa:module01:mock-flow` | PASS, 11 files / 109 tests |
| `cd apps/web && corepack pnpm run qa:module01:ui` | PASS, 3 Playwright tests |
| `cd apps/web && corepack pnpm run qa:module01:local` | PASS |

`qa:module01:local` included:

- lint
- targeted tests
- full tests: 84 files / 599 tests
- build

## Gates Intentionally Skipped

### `qa:module01:staging`

Not run.

Reason:

- The fix is covered locally by targeted route/helper tests, mock-flow, UI fixture tests, and the local full gate.
- No staging deployment occurred during this task before validation.
- Real deployed proof should happen after commit/deploy if the owner wants a staging validation run.
- Avoided unnecessary staging smoke per the structured QA policy.

### `qa:module01:production-preflight`

Not run.

Reason:

- No production preflight/env/runtime/deploy behavior changed.
- Production runtime was not enabled.
- No production payment, Email, or LINE occurred.

## Production / Provider Safety

- Production runtime enabled: no
- Production checkout enabled: no
- Production payment run: no
- Production Email sent: no
- Production LINE sent: no
- Production data mutated: no
- Vercel env modified: no
- Env secrets rotated: no
- DB migrations applied: no

## First Failure Resolved

Resolved first failure category:

- `line_bind_partial_contact_without_secret`

The failure is addressed by:

- compensating failed secret writes by marking the contact failed
- requiring active recipient secret for LINE checkout unlock
- requiring active recipient secret for LINE paid delivery eligibility
- surfacing partial bind in Admin API/CLI

## Remaining Blockers

- No known blocker in local/mock validation.
- Deployed staging validation has not been run for this fix yet.
- Another production payment smoke must wait for owner approval after any desired staging validation.

## Theme Route Preservation

- Theme Architecture remains archived and adopted as reference.
- No theme runtime UI implementation was started.
- Module Theme Architecture Implementation Plan v0 remains a future track after the payment/delivery gate or owner decision.

## Recommended Next Task

`LINE Recipient Secret Bind Invariant Staging Verification v0` if owner wants deployed proof before another production smoke.

Otherwise, after deployment and validation, proceed to a controlled production smoke retry only with explicit owner approval.
