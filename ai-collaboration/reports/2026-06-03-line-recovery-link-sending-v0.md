# LINE Recovery Link Sending v0

Date: 2026-06-03

## Completed Work

- Added server-only LINE recovery link sender foundation in `apps/web/src/lib/notifications/line-recovery-link.ts`.
- Added a LINE recovery message template that contains only short recovery copy, module name, a `/r/[recoveryToken]` web return link, 90-day retention copy, and support contact.
- Added `LINE_RECOVERY_MESSAGE_PROVIDER` env seam with `noop` default and a gated LINE Messaging API adapter path.
- Added eligible LINE recovery contact lookup for completed paid results.
- Extended the existing completed-paid-result recovery send hook to process eligible LINE contacts non-fatally after Email contacts.
- Added tests for LINE template safety, noop behavior, provider config failures, mocked LINE Messaging API success/failure, duplicate prevention, recipient-unavailable behavior, and hook-level non-fatal LINE handling.

## Architecture Decisions

- Real LINE push requires a sendable LINE recipient ID. Current `payment_recovery_contacts` intentionally stores LINE as hash-only (`contact_hash` / `line_user_hash`) and does not persist raw LINE userId.
- This task did not weaken that design. It does not store raw LINE userId in `payment_recovery_contacts`, logs, reports, or responses.
- The sender supports an explicit in-process `lineRecipientId` argument for future secure recipient storage integration and unit tests, but the current auto-send hook does not have such a recipient and returns `line_recipient_unavailable`.
- The hook does not create a `/r/` token when a LINE recipient is unavailable, avoiding orphaned unsent recovery links.
- `EMAIL_PROVIDER` behavior is unchanged. LINE uses a separate `LINE_RECOVERY_MESSAGE_PROVIDER` seam and existing `LINE_CHANNEL_ACCESS_TOKEN` only when explicitly configured.

## Sender Behavior

- `LINE_RECOVERY_MESSAGE_PROVIDER=noop` or unset: no real LINE message is sent and recovery links are not marked sent.
- `LINE_RECOVERY_MESSAGE_PROVIDER=line` with token and explicit sendable recipient: sends a LINE text message through the Messaging API and marks the recovery link sent on provider success.
- Missing provider config or provider failure returns safe status/category and does not block paid delivery.
- Hash-only LINE recovery contacts are currently eligible for discovery but unavailable for real push until a secure recipient reference exists.

## Message Template

The message says, in substance:

- the Module 01 complete report is ready
- tap the ANYU `/r/` link to view it on the web
- the recovery link is retained for 90 days
- do not forward the link
- contact `hello@anyu.tw` if needed

It does not include:

- full report body
- raw user input
- sensitive analysis excerpt
- raw `pa_`, `pcs_`, or `prl_` values
- raw LINE userId
- provider payload

## Auto-Send Hook Behavior

- Existing direct and queued paid-generation completion paths continue to call `sendRecoveryLinksForCompletedPaidResult`.
- The hook now finds eligible Email contacts and eligible LINE contacts.
- Email auto-send remains unchanged and can send real Resend Email when configured.
- LINE auto-send is non-fatal and currently reports unavailable without a sendable recipient.
- Paid delivery completion remains fail-open if recovery sending fails.

## Recipient Identity Decision

Real LINE recovery link sending is blocked by recipient storage, not by Messaging API mechanics.

Current safe options for a future task:

- add encrypted LINE recipient storage linked to recovery contact
- add a separate `line_recipient_secrets` table with encrypted LINE userId and keyed hash
- reuse legacy raw LINE ID only after an explicit privacy review, not by default

Recommended next task: `LINE Recovery Recipient Secret Design v0`.

## Validation

- `cd apps/web && corepack pnpm test -- src/tests/line-recovery-link.test.ts src/tests/email-recovery-link.test.ts src/tests/payment-recovery-contacts.test.ts`: passed
- `cd apps/web && corepack pnpm lint`: passed
- `cd apps/web && corepack pnpm test`: passed
- `cd apps/web && corepack pnpm build`: passed
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`: passed against Preview(staging); no Email/LINE sent; no raw recovery token output
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: passed against Preview(staging); production fail-closed checks passed

## Staging Smoke Result

- Real LINE message smoke was not run.
- Reason: current hash-only recovery contact design does not provide a sendable LINE recipient.
- No Preview(staging) LINE env was modified.
- No LINE messages were sent.

## Production Safety

- Production payment runtime remains disabled.
- Production env was not modified.
- Production DB was not modified.
- No production LINE messages were sent.
- No production Email behavior was changed.

## Tech Debt Review

- New technical debt introduced: LINE sender foundation has an explicit-recipient seam but no persistent secure recipient resolver yet.
- Existing technical debt observed: shared `/line/fulfill` recovery compatibility remains in place until a dedicated recovery LIFF endpoint is configured.
- Opportunistic cleanup completed: separated LINE recovery message sending from legacy LINE webhook/fulfillment semantics.
- Deferred cleanup candidates: extract shared recovery link URL builder from Email/LINE sender modules if more channels are added.

## Suggested Next Steps

1. `LINE Recovery Recipient Secret Design v0`
2. `LINE Recovery Recipient Storage Schema v0`
3. `LINE Recovery Link Real Provider Smoke v0`
