# Paid Ready / Completed Result Save CTA Implementation v0

Date: 2026-06-01

## Completed Work

- Added non-blocking paid-ready recovery reminder to the ReturnURL polling page.
- Added completed-result recovery save section for paid access pages.
- Wired sanitized recovery summary into payment status, ReturnURL initial render, payment access, and paid access token result rendering.
- Added server-side post-payment Email save actions for session-bound payment access and paid access token pages.
- Kept Email as recovery identity only; no Email sending was added.
- Kept LINE as deferred recovery/support option only; no LINE push or binding was added.
- Kept web access as canonical paid report delivery.

## Paid-Ready Behavior

On `paid_ready`, the primary CTA remains `查看完整報告`.

Saved state:

- shows subtle confirmation
- displays masked Email only when available
- does not expose raw contact values

Unsaved state:

- shows non-blocking reminder: users are encouraged to save after opening the completed report
- does not block access
- does not imply browser return equals payment truth

Failed recovery state:

- tells the user saving can be retried later
- does not block access to the paid report

## Completed-Result Save Behavior

The completed paid result page now shows a recovery section near the top of the report.

Saved state:

- shows `這份完整分析已保存`
- shows masked Email when available
- clarifies Email / LINE are for recovery, completion notification, and support, not paid report delivery

Unsaved state:

- shows title `保存這份完整分析`
- explains Email is used to help recover the report after closing the page, switching devices, or clearing browser data
- includes Email input and save button
- includes separate optional marketing checkbox
- keeps LINE as `稍後支援`

## Post-Payment Email Save Behavior

Server actions were added on server-rendered paid access surfaces.

Properties:

- uses `createOrUpdatePostPaymentEmailRecoveryContact`
- links module, result, payment intent, and entitlement when available
- records transactional consent
- records marketing opt-in separately only if selected
- sends no Email
- redirects back with safe `recovery=email_saved` / `recovery=email_error` state
- does not render raw `pa_` or raw `pcs_` in hidden fields
- does not echo raw Email after save

## Data Safety

- Recovery summary returns sanitized booleans/status and masked Email only.
- Raw Email is accepted only in the server-side form submission path and is not rendered after save.
- Raw LINE identifiers are not used.
- Encrypted values and hashes are never exposed.
- No raw provider payloads, payment credentials, or tokenized URLs were added to docs or tests.

## Tests Added / Updated

- `PaymentReturnPoller` ready saved and unsaved recovery states.
- ReturnURL ready page recovery reminder.
- Payment status route returns sanitized recovery summary.
- Payment access page passes recovery summary into completed result rendering.
- Completed-result saved recovery section.
- Completed-result unsaved Email save section.
- No Email/LINE delivery promise in the new completed-result recovery copy.

## Validation

- `cd apps/web && corepack pnpm test src/tests/payment-return-poller.test.tsx src/tests/newebpay-return-page.test.tsx src/tests/payment-status-route.test.ts src/tests/payment-access-page.test.tsx src/tests/paid-result-recovery-save-section.test.tsx src/tests/payment-recovery-contacts.test.ts src/tests/paid-delivery-artifacts.test.ts` passed: 7 files, 41 tests.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 65 files, 420 tests.
- `cd apps/web && corepack pnpm build` passed.
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card` passed against the currently deployed staging commit; it validates the existing result-page checkout / fake-paid / queue / paid access path, but not the new post-payment save UI because this task did not deploy.

## Staging QA Result

No deployment was performed in this task.

Staging no-card QA passed on the currently deployed Preview(`staging`) commit. A follow-up staging smoke should verify the new completed-result save section after this commit is deployed to staging.

## Production Safety

- Production payment runtime was not enabled.
- Production flags and env were not modified.
- Production DB migration was not applied.
- No real payments were run.
- No Email or LINE messages were sent.

## Tech Debt Review

New technical debt introduced:

- None.

Existing technical debt observed:

- Recovery link sending is still not implemented.
- LINE recovery binding remains deferred.
- Production recovery DB/env apply remains gated.

Opportunistic cleanup completed:

- Paid-ready and completed-result recovery state now share the sanitized recovery summary contract.

Deferred cleanup candidates:

- Add staging smoke specifically for completed-result recovery save after deployment.
- Implement short-lived recovery links.
- Reframe LIFF binding for recovery-specific LINE save.

## Recommended Next Step

Run **Paid Result Save CTA Staging Smoke v0** after this commit deploys to Preview(`staging`).

Smoke should verify:

- paid-ready reminder
- completed-result unsaved save section
- fake Email save with reserved-domain test value
- saved state after refresh
- no raw Email or token exposure
- no-card QA still passes
