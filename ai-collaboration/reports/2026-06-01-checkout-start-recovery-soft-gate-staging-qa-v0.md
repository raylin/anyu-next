# Checkout-Start Recovery Soft Gate Staging QA v0

## Date

2026-06-01

## Completed Work

- Confirmed staging is serving commit `61626dd5f692` on Preview(`staging`).
- Verified checkout-start recovery soft gate renders on staging.
- Verified Preview(`staging`) recovery config presence by env name only.
- Created fresh Module 01 staging results for QA.
- Verified Email recovery form, deferred LINE recovery option, separate marketing opt-in, and skip acknowledgement.
- Submitted a fake Email recovery save request and confirmed it fails safely because recovery secrets are missing.
- Verified no recovery contact row was created while recovery config is missing.
- Ran result-page checkout no-card QA regression successfully.
- Confirmed production routes remain fail-closed and production DB recovery table remains unapplied.

## Staging Freshness

| Check | Result |
| --- | --- |
| Staging health environment | `preview` |
| Staging branch | `staging` |
| Staging commit | `61626dd5f692` |
| Required commit | `61626dd` or newer |
| Route bundle version | `payment-foundation-2026-05-29` |
| Checkout-start recovery soft gate present | true |

## Recovery Config Preflight

Presence only, no values printed:

| Env name | Preview present | Preview(`staging`) branch-scoped present |
| --- | --- | --- |
| `PAYMENT_RECOVERY_CONTACT_HASH_SECRET` | false | false |
| `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY` | false | false |
| `OPERATOR_TEST_SECRET` | true | true |

Result:

- Email recovery contact creation is blocked by missing Preview(`staging`) recovery secrets.
- Checkout-start still renders and checkout can continue.
- Email save fails safely with a category-like redirect state and does not echo the submitted contact value.

## Fresh Result / Checkout-Start QA

| Check | Result |
| --- | --- |
| Fresh Module 01 result created | pass |
| Checkout-start HTTP status | 200 |
| Email recovery soft gate visible | true |
| LINE option deferred/recovery/support only | true |
| Marketing opt-in separate | true |
| Skip warning / acknowledgement visible | true |
| NewebPay payment button remains available | true |
| Internal-test/no-charge copy | not present |
| LINE paid delivery promise | not present |
| Secret exposure in HTML | not observed |
| Raw contact value echoed | false |

## Email Save QA

Because Preview(`staging`) recovery secrets are missing, the expected safe behavior is failure without row creation.

| Check | Result |
| --- | --- |
| Email save request submitted with fake non-customer contact | yes |
| HTTP behavior | 303 redirect back to checkout |
| Success state | false |
| Safe error state | true |
| Raw contact value echoed in redirect | false |
| Recovery row count before | 0 |
| Recovery row count after | 0 |

No raw Email, encrypted contact value, contact hash, LINE identifier, `pa_`, or `pcs_` token was printed or recorded.

## Skip Flow QA

| Check | Result |
| --- | --- |
| Skip acknowledgement visible | true |
| User can continue toward NewebPay after acknowledgement | true |
| Acknowledgement submitted as NewebPay provider field | no |
| Warning copy clear | true |

## No-Card QA Regression

Command:

```bash
cd apps/web && corepack pnpm run qa:result-checkout:no-card
```

Result: pass.

Sanitized key outcomes:

- staging health: pass
- result page checkout CTA: pass
- checkout-start page: pass
- recovery soft gate signals: pass
- Email primary signal: pass
- LINE deferred signal: pass
- skip warning signal: pass
- operator fake-paid success: pass
- queue trigger: enqueued via `vercel_queue`
- paid status: completed
- paid access render: pass
- production disabled check: pass

No provider payment was submitted.

## Production Safety

| Check | Result |
| --- | --- |
| Production health environment | `production` |
| Production branch | `main` |
| Production route bundle | `payment-foundation-2026-05-29` |
| Production checkout route | JSON `not_found` |
| Production fake-paid route | JSON `not_found` |
| Production `/refund` | HTTP 200 |
| Production `/legal` | HTTP 200 |
| Production recovery DB table exists | false |
| Production payment runtime changed | false |
| Production DB migration applied | false |

## Architecture Decisions

- Did not add or modify staging env values in this QA task; missing recovery secrets are documented as a deployment/config follow-up.
- Did not insert or retain any staging recovery contact row because the Email save correctly failed closed.
- Treated no-card QA pass as the full checkout-start regression proof for skip/checkout flow.

## Blockers

- Preview(`staging`) lacks `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`.
- Preview(`staging`) lacks `PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY`.
- Email recovery row creation cannot be verified until those secrets are configured and staging is redeployed if needed.

## Uncertainties

- Whether recovery secrets should be branch-scoped Preview(`staging`) only or also general Preview for non-staging previews.
- Whether checkout-start marketing opt-in should remain visible before payment or move to paid-ready/completed result.

## Suggested Next Steps

1. Run `Recovery Contact Preview(staging) Env Alignment v0` to add the two recovery secrets to Preview(`staging`) only.
2. Rerun `Checkout-Start Recovery Soft Gate Staging QA v0` and verify Email row creation.
3. After Email recovery is verified, plan `LINE Recovery Binding Reframe v0` or `Paid Ready Save CTA v0`.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Preview(`staging`) recovery secrets are missing.
- Production recovery DB migration remains gated.
- LINE recovery binding remains deferred.

### Opportunistic Cleanup Completed

- None; QA/documentation-only task.

### Deferred Cleanup Candidates

- Secret-safe staging env alignment for recovery contact hash/encryption secrets.
- Recovery soft gate Email-save rerun after env alignment.
- Recovery enum DB CHECK constraint hardening, if desired.

### Recommended Follow-up

- `Recovery Contact Preview(staging) Env Alignment v0`.
## Git Commit

- Commit hash: `pending`
- Commit message: `docs: record recovery soft gate staging qa`

## Staging Push

- Push status: `pending`
- Push command: `git push origin HEAD:staging`
