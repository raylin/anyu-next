# Payment / Entitlement Schema Staging Migration Verification v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Staging migration verification passed for `0007_payment_entitlements.sql`.

The staging app was confirmed to be serving the approved implementation commit `87ac2f4` or newer, the additive payment entitlement migration was applied to the staging database only, and both new tables were verified structurally.

Synthetic staging-safe SQL smoke passed and was cleaned up. Normal staging runtime route checks did not write rows to the new payment tables.

Production migration was not applied.

## 2. Staging Freshness

- Staging health endpoint returned HTTP 200.
- Build marker reported branch `staging`.
- Build marker reported commit prefix `87ac2f4c3120`, which includes the approved payment entitlement schema implementation.

## 3. Migration Application

- Applied `apps/web/drizzle/0007_payment_entitlements.sql` to staging database only.
- Migration was additive.
- No production migration was run.
- No payment, checkout, NewebPay, LINE, prompt, schema, cache, or unlock behavior was changed.

## 4. payment_intents Schema Verification

`payment_intents` verification passed.

- Table exists.
- Expected columns present: 28 of 28.
- Default/nullability checks passed for generated id, provider environment, currency, status, and timestamps.
- Primary key exists.
- Unique merchant order number index exists.
- Provider trade lookup index exists.
- Result lookup index exists.
- Status/created index exists.
- Module/created index exists.
- Foreign keys to analysis request, analysis result, and unlock intent tables exist.

## 5. entitlements Schema Verification

`entitlements` verification passed.

- Table exists.
- Expected columns present: 23 of 23.
- Default/nullability checks passed for generated id, status, and timestamps.
- Primary key exists.
- Partial unique paid access token hash index exists.
- Payment intent lookup index exists.
- Result lookup index exists.
- Module/status index exists.
- Expiry index exists.
- Foreign keys to analysis request, analysis result, generation job, payment intent, and unlock intent tables exist.

## 6. Synthetic Repository Smoke

Synthetic staging-safe SQL smoke passed.

Covered behavior:

- Created a synthetic analysis request/result dependency chain.
- Created a synthetic payment intent.
- Advanced synthetic payment status through checkout, paid, refund-pending, and refunded states.
- Created a synthetic entitlement linked to the payment intent.
- Rotated the synthetic paid access token hash.
- Marked the entitlement refunded.
- Removed all synthetic rows.

Final synthetic cleanup verification passed.

## 7. Token Safety Verification

Token safety verification passed.

- Raw paid access token shape was not stored in the entitlement token hash column.
- Old synthetic token hash lookup returned no rows after rotation.
- New synthetic token hash lookup returned the expected row during the controlled smoke.
- Reports and logs for this task do not include raw tokens, token hashes, secrets, tokenized URLs, raw input, provider output, paid result JSON, LINE IDs, or short codes.

## 8. Runtime Regression Checks

Staging route/API regression checks passed.

- `GET /api/health`: HTTP 200.
- Module landing route: HTTP 200.
- LIFF bridge debug route: HTTP 200.
- Invalid LIFF bind: HTTP 400.
- Invalid LINE webhook signature with non-empty event: HTTP 401.
- Empty-events LINE webhook verification ping: HTTP 200.
- Synthetic analyze: HTTP 200.
- Result page: HTTP 200.
- Unlock intent: HTTP 200.
- Paid generation request: HTTP 200, completed.
- Paid result status: HTTP 200, completed.
- Unlocked route: HTTP 200.

Only sanitized statuses and booleans were recorded.

## 9. Runtime Write Verification

Normal runtime route checks did not write to the new payment tables.

Final aggregate counts after synthetic cleanup and route checks:

- `payment_intents`: 0.
- `entitlements`: 0.

This matches the expected phase behavior because payment is still disabled and no checkout/runtime entitlement resolver is enabled.

## 10. Privacy / Data Safety

Privacy and data-safety checks passed.

Not recorded:

- Raw paid access tokens.
- Paid access token hashes.
- Secrets.
- Raw input.
- Redacted input text.
- Full result JSON.
- Paid result JSON.
- Provider output.
- LINE user IDs.
- LINE message text.
- Short codes.
- Unlock tokens.
- Tokenized URLs.
- Emails.
- Payment provider credentials.

## 11. Issues Found

No P0 or P1 issues found.

One non-blocking note:

- The first route smoke used too-short synthetic text and correctly returned the existing `input_too_short` validation error. The route smoke was rerun with a valid synthetic sample and passed.

## 12. Production Migration Recommendation

Staging verification supports moving to a separate production migration gate when the owner wants schema readiness.

Because current runtime does not use `payment_intents` or `entitlements`, production migration can also be deferred until payment integration is closer.

## 13. Recommended Next Step

Run `Payment / Entitlement Schema Production Migration Gate v0` if the owner wants production schema readiness before NewebPay integration.

Otherwise, continue with the payment launch flow plan and defer production migration until the payment runtime path is ready.
