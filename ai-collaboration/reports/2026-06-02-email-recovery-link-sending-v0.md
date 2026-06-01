# Email Recovery Link Sending v0

Date: 2026-06-02

## Completed Work

- Added a server-only Email recovery link sender foundation.
- Added a noop/test Email adapter that is the default when no real provider is configured.
- Added a recovery Email template with:
  - subject: `你的 ANYU 完整報告已準備好`
  - Module 01 product name: `曖昧溫度計`
  - safe `/r/[recoveryToken]` web return link
  - 90-day link retention copy
  - support contact: `hello@anyu.tw`
- Added Email-channel recovery link orchestration:
  - finds duplicate sent links for the same entitlement/contact/channel
  - creates a `paid_result_recovery_links` row with channel `email`
  - builds an absolute `/r/[token]` link in process only
  - sends through the configured adapter
  - marks the link as `sent` only if a real adapter reports `sent`
  - marks the link as `failed` on adapter/config failure
  - does not return raw tokens or token hashes
- Wired completed-result Email save actions to attempt recovery link sending non-fatally after the recovery contact is saved.
- Updated completed-result recovery copy so it no longer says v0 never sends Email; it now states that the system prepares a recovery link and still saves the recovery method when Email sending is unavailable.
- Added env documentation for `EMAIL_PROVIDER=noop` and `EMAIL_FROM`.

## Architecture Decisions

- Default provider is `noop`, not a real Email sender.
- The noop adapter records a safe send attempt result but does not claim that an Email was sent.
- Completed-result save remains successful when Email sending is unavailable, because recovery identity persistence should not block paid report access.
- Paid delivery completion sending for pre-payment checkout-start contacts is deferred. It should be added as a separate non-fatal hook after the post-payment save path is proven.
- No production Email sending was configured or triggered.

## Provider Adapter Behavior

- `EMAIL_PROVIDER=noop` or unset:
  - returns status `noop`
  - creates a recovery link row
  - does not mark `sent_at`
  - UI remains in saved-only state
- Unsupported provider value:
  - returns `unavailable`
  - marks the created recovery link as `failed`
  - paid report access remains unaffected
- Future real provider:
  - should return `sent` only after provider acceptance
  - should mark `sent_at`
  - must not include report body, raw input, `pa_`, `pcs_`, provider payloads, or token hashes

## Trigger Points

- Implemented:
  - Completed-result Email save from session-bound payment access page.
  - Completed-result Email save from paid access token unlock page.
- Deferred:
  - Automatic Email link send after paid delivery readiness for contacts captured before payment.

## Security / Privacy Boundaries

- Email body contains only short recovery copy and a `/r/[recoveryToken]` link.
- Email body does not contain full report content, raw user input, sensitive analysis excerpts, provider/order data, `pa_`, or `pcs_`.
- Raw `prl_` token is kept in server process memory only.
- Raw token, token hash, raw Email, LINE IDs, and tokenized URLs are not logged or returned in JSON/report output.
- Marketing opt-in remains separate from transactional recovery save.

## Validation

- `cd apps/web && corepack pnpm exec vitest run src/tests/email-recovery-link.test.ts src/tests/paid-result-recovery-links.test.ts src/tests/paid-result-recovery-save-section.test.tsx src/tests/payment-access-page.test.tsx` passed: 21 targeted tests.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 73 files, 467 tests.
- `cd apps/web && corepack pnpm build` passed.
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke` passed against Preview(staging):
  - valid recovery link smoke passed
  - invalid-link safety passed
  - cleanup by revocation passed
  - no Email/LINE sent
  - production fail-closed checks passed
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card` passed against Preview(staging):
  - result-page checkout path covered
  - checkout-start covered
  - downstream operator fake-paid covered
  - paid status completed
  - paid access render passed
  - production fail-closed checks passed

## Staging QA Result

- No real Email provider was configured or used in this task.
- Real Email was not sent.
- Recovery link resolver remains covered by the Preview-runtime operator smoke path.
- The Email save path is validated locally with the noop/test adapter and full app build.
- Preview(staging) smoke commands ran against the previously deployed staging bundle; this task did not modify Preview(staging) env or trigger deployment before commit.

## Production Safety

- Production payment runtime was not enabled.
- Production env was not modified.
- Production DB migration was not applied.
- No production Email provider was configured.
- No LINE messages were sent.

## Tech Debt Review

- New technical debt introduced: noop-created recovery links remain in `created` status until a real provider path is added or a cleanup policy is defined.
- Existing technical debt observed: automatic send after paid delivery readiness for checkout-start contacts remains deferred.
- Opportunistic cleanup completed: completed-result copy now reflects the recovery link direction instead of stale v0 no-Email wording.
- Deferred cleanup candidates: add a real provider adapter, resend/rate-limit policy, and a non-fatal paid-delivery completion trigger.

## Suggested Next Steps

1. Email Recovery Link Provider Adapter Plan / Implementation v0.
2. Paid Delivery Recovery Link Send Hook v0 for pre-payment Email recovery contacts.
3. Paid Result Delivery Artifact Implementation v0 after link delivery semantics are stable.
