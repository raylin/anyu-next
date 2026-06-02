# Email Recovery Auto-Send Staging Operator Smoke v0

Date: 2026-06-02

## Result

Passed.

Preview(staging) sent one controlled real Email through the paid-delivery auto-send hook after paid result readiness. Owner verified inbox receipt and `/r/` link access.

## Smoke Path Chosen

The existing no-card QA path cannot prove checkout-start auto-send because:

- checkout-start creates a NewebPay payment intent
- operator fake-paid creates a separate operator payment intent
- recovery contacts saved against the checkout-start intent do not bind to the operator fake-paid entitlement

Chosen path:

1. Add a Preview(staging)-only operator smoke mode to the existing Email recovery smoke endpoint.
2. Create a fresh Module 01 result.
3. Create operator fake-paid artifacts with a checkout-start-style Email recovery contact in the same operator payment/entitlement context.
4. Process the paid generation job inside Preview runtime.
5. Let the paid-delivery auto-send hook find the eligible bound Email contact.
6. Verify a recovery link row exists with `status=sent`.
7. Return sanitized booleans/status categories only.

## Operator Helper / Endpoint

Extended:

- `PUT /api/operator/email-recovery-smoke`

Gate behavior:

- Preview(staging)-only through existing `ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE`
- requires `x-operator-test-secret`
- Production returns 404/fail-closed

Sanitized response includes:

- `autoSendHookExercised`
- `fakePaidCreated`
- `recoveryContactCreated`
- `processorCategory`
- `processorJobResult`
- `recoveryLinkCreated`
- `recoveryLinkStatus`
- `emailSent`
- token/contact/report exposure booleans

Sanitized response excludes:

- raw `prl_`
- token hash
- raw Email
- raw `pa_`
- raw `pcs_`
- tokenized URLs
- provider payload
- report content

## Real Email Auto-Send Result

Preview deployment used for smoke:

- environment: preview
- branch: staging
- commit marker: `7f65d47e296a`
- routeBundleVersion: `payment-foundation-2026-05-29`

Sanitized operator smoke result:

| Check | Result |
| --- | --- |
| autoSendHookExercised | true |
| fakePaidCreated | true |
| recoveryContactCreated | true |
| processorCategory | processed |
| processorJobResult | completed |
| recoveryLinkCreated | true |
| recoveryLinkStatus | sent |
| emailSent | true |
| rawRecoveryTokenReturned | false |
| tokenHashReturned | false |
| rawEmailReturned | false |
| rawPaidAccessTokenReturned | false |
| rawCheckoutSessionTokenReturned | false |
| reportContentReturned | false |

Real Email sent in this task: yes, to the owner-approved test recipient from secure local env.

Raw recipient value was not printed.

## Inbox / Link Verification

Owner verified all checks:

| Check | Result |
| --- | --- |
| Email received | yes |
| Subject correct | yes |
| Sender correct | yes |
| 90-day copy present | yes |
| Support contact present | yes |
| No report body/raw input/`pa_`/`pcs_` | yes |
| `/r/` link opens paid result | yes |

Raw tokenized link was not pasted into chat or report.

## Duplicate-Send Behavior

Not live-smoked in this task.

Covered by existing helper tests:

- existing unexpired sent Email-channel recovery link for the same entitlement/contact/channel returns `duplicate`
- no new recovery link is created in that duplicate case

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
- Production operator Email recovery smoke endpoint returned 404.
- Production checkout/fake-paid routes remained fail-closed.
- No production Email was sent.
- No LINE messages were sent.

## Validation

- `cd apps/web && corepack pnpm exec vitest run src/tests/operator-email-recovery-smoke-route.test.ts src/tests/operator-fake-paid-success.test.ts src/tests/email-recovery-link.test.ts src/tests/paid-generation-processor.test.ts` passed.
- `cd apps/web && corepack pnpm lint` passed.
- `cd apps/web && corepack pnpm test` passed: 74 files, 491 tests.
- `cd apps/web && corepack pnpm build` passed.
- Preview deployment build passed.
- Auto-send operator smoke passed.
- Regression QA passed.

## Tech Debt Review

New technical debt introduced:

- The operator Email smoke endpoint now has a second smoke mode and should remain strictly Preview(staging)-only.

Existing technical debt observed:

- Real auto-send smoke still depends on an operator endpoint instead of a reusable CLI command.

Opportunistic cleanup completed:

- Reused the existing Email recovery smoke gate and endpoint instead of adding another public route.
- Reused the fake-paid service while keeping the public fake-paid route payload unchanged.

Deferred cleanup candidates:

- Add a dedicated `qa:email-recovery:auto-send` script that wraps this endpoint and standardizes redaction.
- Add provider message-id audit if support operations need it.
- Add duplicate live-smoke mode if repeat proof is needed.

## Suggested Next Steps

1. Paid Result Delivery Artifact Implementation v0.
2. LINE Recovery CTA Wiring v0 if LINE recovery proof should come before Module 02.
3. Production Payment Config Dry-Run Plan v0 if NewebPay approval/formal credentials arrive.
