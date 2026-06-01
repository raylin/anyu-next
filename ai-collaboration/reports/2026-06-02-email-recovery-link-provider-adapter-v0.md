# Email Recovery Link Provider Adapter Plan / Implementation v0

Date: 2026-06-02

## Completed Work

- Inspected the existing Email recovery link foundation:
  - `apps/web/src/lib/notifications/email-recovery-link.ts`
  - `paid_result_recovery_links` helper methods
  - completed-result Email save actions
  - `.env.example`
  - Email recovery link tests
- Added a real provider adapter path for `EMAIL_PROVIDER=resend`.
- Preserved noop/test behavior as the default.
- Added `RESEND_API_KEY` to `.env.example` as a name-only placeholder.
- Added mocked Resend tests for:
  - safe request payload shape
  - idempotency header
  - missing config failure
  - provider failure
  - successful send status update
  - failed send status update
  - raw token/report-content exclusion
- Did not configure provider credentials.
- Did not send real Email.

## Current Adapter Shape

- `EMAIL_PROVIDER=noop` or unset:
  - returns `noop`
  - does not send real Email
  - does not mark `sent_at`
- `EMAIL_PROVIDER=test`:
  - aliases to noop behavior for test/staging-safe flows
- `EMAIL_PROVIDER=resend`:
  - requires `RESEND_API_KEY`
  - sends via server-side `fetch` to Resend’s Email API
  - sends `from`, `to`, `subject`, `html`, and `text`
  - sends a non-token idempotency key based on the recovery link row id
  - marks the recovery link as `sent` only after a successful provider response
  - marks the recovery link as `failed` on provider/config failure
- Unsupported provider:
  - returns `unavailable`
  - does not mark as sent

## Provider Recommendation

Recommended v0 provider: **Resend**.

Rationale:

- Low integration complexity for a one-person operation.
- Server-side REST API is enough; no new SDK dependency is required.
- Official send Email API supports `from`, `to`, `subject`, `html`, and `text` fields.
- Official docs show successful sends return an Email id.
- Official docs support idempotency keys on `POST /emails`, which matches recovery-link retry safety.
- Official error docs clearly cover missing/invalid API keys, unverified sender domains, validation errors, quota/rate errors, and provider-side failures.

Official references:

- Resend Send Email API: https://resend.mintlify.dev/docs/api-reference/emails/send-email
- Resend Idempotency Keys: https://resend.com/docs/dashboard/emails/idempotency-keys
- Resend Errors: https://www.resend.com/docs/api-reference/errors

Provider notes:

- Sender/domain verification remains an operational prerequisite before real sends to broad recipients.
- Taiwan deliverability still depends on sender domain reputation, SPF/DKIM/DMARC alignment, and low complaint rate. This implementation does not solve sender reputation by itself.
- SMTP/SES/SendGrid/Mailgun remain viable later, but Resend is the smallest v0 adapter surface for current needs.

## Template Behavior

Preserved:

- Subject: `你的 ANYU 完整報告已準備好`
- Product/module name: `曖昧溫度計`
- Link to `/r/[recoveryToken]`
- Retention copy: `此連結將保留 90 天`
- Support contact: `hello@anyu.tw`

Excluded:

- full report body
- raw user input
- sensitive analysis excerpt
- raw `pa_`
- raw `pcs_`
- provider/order payload

HTML fields are escaped before insertion.

## Send Status / Idempotency

- Duplicate prevention still checks for an existing `sent` Email-channel recovery link for the same entitlement/contact/channel.
- Expired sent links can generate a new link.
- Real Resend success marks `sent_at` through `markPaidResultRecoveryLinkSent`.
- Resend config/provider failure marks `failed` through `markPaidResultRecoveryLinkFailed`.
- Resend idempotency key uses `paid-result-recovery-link/[link-id]`; no raw token is used.
- Raw `prl_` token remains process-only and is never returned.

## Staging Smoke Result

- Real provider credentials were not available/configured.
- No real Email was sent.
- Staging smoke remained provider-safe:
  - recovery-link runtime smoke passed
  - no-card checkout QA passed
- Resend adapter behavior was validated with mocked provider responses only.

## Production Safety

- Production Email provider env was not modified.
- Production payment runtime remains disabled.
- No production DB migration was applied.
- No production Email was sent.
- No LINE messages were sent.

## Validation

- `cd apps/web && corepack pnpm exec vitest run src/tests/email-recovery-link.test.ts` passed: 12 tests.
- `cd apps/web && corepack pnpm exec vitest run src/tests/email-recovery-link.test.ts src/tests/paid-result-recovery-links.test.ts src/tests/paid-result-recovery-save-section.test.tsx src/tests/payment-access-page.test.tsx` passed: 26 targeted tests.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 73 files, 472 tests.
- `cd apps/web && corepack pnpm build` passed.
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke` passed against Preview(staging):
  - valid recovery-link smoke passed
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

## Tech Debt Review

- New technical debt introduced: Resend provider response id is not persisted because current schema has no provider message id field.
- Existing technical debt observed: no resend/rate-limit UI or support tooling exists yet.
- Opportunistic cleanup completed: HTML template now escapes dynamic fields.
- Deferred cleanup candidates:
  - provider message id/audit table
  - retry/resend policy
  - provider webhook/bounce handling
  - real Preview(staging) Email smoke after owner supplies provider credentials

## Suggested Next Steps

1. Configure Resend for Preview(staging) only and run Email Recovery Link Real Provider Smoke v0 with an owner-approved test address.
2. Add Paid Delivery Recovery Link Send Hook v0 so checkout-start Email contacts receive links after paid readiness.
3. Plan resend/rate-limit/support workflow before production Email enablement.
