# Email Recovery Link Real Provider Smoke v0

Date: 2026-06-02

## Result

Passed with one documented verification caveat.

Real Email was sent through Resend from a Preview(staging) runtime deployment to the owner-approved `EMAIL_RECOVERY_TEST_RECIPIENT`.

## Sender Readiness

Secure local `apps/web/.env.local` presence check:

| Env name | Presence |
| --- | --- |
| `RESEND_API_KEY` | present |
| `EMAIL_RECOVERY_TEST_RECIPIENT` | present |
| `OPERATOR_TEST_SECRET` | present |

Values, lengths, prefixes, suffixes, hashes, checksums, and raw Email values were not printed.

Owner prerequisites confirmed:

- Resend domain verification: done.
- Resend Sending access API key: done.
- Sender: `ANYU <hello@anyu.tw>`.
- Test recipient: owner-accessible external inbox from local secure env.

## Preview(staging) Env Alignment

Configured branch-scoped Preview(staging) only:

- `EMAIL_PROVIDER=resend`
- `EMAIL_FROM` present, value not printed in command output
- `RESEND_API_KEY` present, value not printed
- `ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE=true`

Not modified:

- Production env
- General Preview env
- payment/recovery token secrets
- production DB

## Redeploy

Triggered a Preview deployment after env alignment and adding the smoke endpoint.

Deployment health:

| Check | Result |
| --- | --- |
| environment | preview |
| branch | staging |
| routeBundleVersion | payment-foundation-2026-05-29 |
| commit marker | `f65bd473d6f4` at runtime health |

Note: the Preview deployment included the local smoke endpoint changes before this report commit was created. Those changes are included in this task commit and pushed to `origin/staging`.

## Real Email Smoke

Controlled flow:

1. Created a fresh staging Module 01 result through the analyze route.
2. Created a no-card paid artifact through the operator fake-paid route.
3. Waited for paid status to reach `completed`.
4. Called the Preview(staging)-only operator Email recovery smoke endpoint.
5. Endpoint saved/updated Email recovery contact and called the existing Resend adapter through `createAndSendEmailRecoveryLink`.

Sanitized runtime result:

| Field | Result |
| --- | --- |
| provider | resend |
| sendStatus | sent |
| recoveryLinkCreated | true |
| emailSent | true |
| rawRecoveryTokenReturned | false |
| tokenHashReturned | false |
| rawEmailReturned | false |
| rawPaidAccessTokenReturned | false |
| rawCheckoutSessionTokenReturned | false |
| reportContentReturned | false |

No raw `prl_`, token hash, raw Email, `pa_`, `pcs_`, tokenized URL, provider API key, provider payload, raw input, or report content was printed.

## Inbox Verification

Owner/operator verified:

| Check | Result |
| --- | --- |
| Email received | yes |
| Subject correct | yes |
| Sender correct | yes |
| 90-day copy present | yes |
| Support contact present | yes |
| No report body/raw input/`pa_`/`pcs_` visible | yes |
| `/r/` link opens paid result | yes |

Raw link and recipient were not pasted into chat or report.

## `/r/` Link Resolution

Owner verified the Email `/r/` link opens the paid result.

Codex also preserved the existing recovery-link resolver smoke coverage via `qa:recovery-link:smoke`.

## DB Verification Caveat

Direct local DB verification of `payment_recovery_contacts` / `paid_result_recovery_links` after the Email send was attempted but blocked because local `DATABASE_URL` did not point at the Preview(staging) schema containing `payment_recovery_contacts`.

Evidence still supporting send state:

- Runtime endpoint returned `provider=resend`, `sendStatus=sent`, `emailSent=true`.
- Resend-delivered Email was received and link opened the paid result.
- The existing helper marks `paid_result_recovery_links.sent_at` only after provider success.

Follow-up if stricter DB proof is required:

- Add a sanitized operator DB assertion endpoint for Email recovery link smoke, or
- run an approved Neon Preview(staging) schema query that returns only booleans/categories.

## Regression QA

`cd apps/web && corepack pnpm run qa:recovery-link:smoke` passed:

- valid recovery-link smoke passed
- invalid-link safety passed
- cleanup by revocation passed
- no Email/LINE sent by that regression command
- production fail-closed checks passed

`cd apps/web && corepack pnpm run qa:result-checkout:no-card` passed:

- result-page checkout path covered
- checkout-start covered
- downstream operator fake-paid covered
- paid status completed
- paid access render passed
- production fail-closed checks passed

## Production Safety

- Production env was not modified.
- Production payment runtime was not enabled.
- Production DB migration was not applied.
- Production checkout/fake-paid remained fail-closed.
- Production operator Email recovery smoke endpoint returned 404.
- No production Email was sent.
- No LINE messages were sent.

## Code Added For Smoke

Added a narrow operator-only route:

- `POST /api/operator/email-recovery-smoke`

Gate behavior:

- disabled unless `ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE=true`
- Preview(staging)-only through `isOperatorEmailRecoverySmokeEnabled`
- requires `x-operator-test-secret`
- returns only sanitized booleans/categories
- does not return raw Email, raw token, token hash, paid access token, checkout session token, or report content

## Validation

- `cd apps/web && corepack pnpm exec vitest run src/tests/operator-email-recovery-smoke-route.test.ts src/tests/feature-flags.test.ts` passed.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 74 files, 478 tests.
- `cd apps/web && corepack pnpm build` passed.
- Docs presence check passed.
- Dashboard HTML parse passed.
- Secret/private scan passed.
- `git diff --check` passed.

## Tech Debt Review

- New technical debt introduced: temporary operator Email smoke endpoint should remain gated and can be removed or folded into a dedicated QA helper later.
- Existing technical debt observed: direct DB sent-state proof still needs a sanctioned Preview(staging) schema assertion path if required.
- Opportunistic cleanup completed: added explicit Preview(staging)-only feature flag coverage for Email recovery smoke.
- Deferred cleanup candidates:
  - `qa:email-recovery-link:smoke` command wrapping the endpoint
  - sanitized DB assertion endpoint/query for sent row status
  - provider message id/audit persistence
  - resend/rate-limit/bounce handling

## Suggested Next Step

Paid Delivery Recovery Link Send Hook v0, so Email contacts captured before payment receive recovery links automatically when paid readiness completes.
