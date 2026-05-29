# Payment / Entitlement Schema Production Migration Gate v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Production migration gate passed for `0007_payment_entitlements.sql`.

The additive payment entitlement schema was applied to the production database only after explicit operator confirmation. Both new tables were verified structurally, production route/API regression checks passed, and normal production runtime routes did not write to the new payment tables.

Payment remains disabled. Checkout and NewebPay are still not implemented.

## 2. Pre-migration Production State

- Production health endpoint returned HTTP 200 with `ok: true`.
- Production did not have `payment_intents` or `entitlements` before migration.
- Required referenced tables existed before migration: `analysis_requests`, `analysis_results`, `unlock_intents`, and `generation_jobs`.
- Production health response did not expose a git commit marker; this task used health availability plus the previously approved staging migration gate as operational context.

## 3. Migration Application

- Applied only `apps/web/drizzle/0007_payment_entitlements.sql`.
- Target was the production Neon branch only.
- Migration was additive.
- No production deployment was performed.
- No runtime feature flag was changed.
- No payment, checkout, NewebPay, LINE, LIFF, short-code, prompt, schema, cache, paid generation, or unlock behavior was changed.

## 4. payment_intents Schema Verification

`payment_intents` verification passed.

- Table exists.
- Expected columns present: 28 of 28.
- Key defaults/nullability passed for generated id, provider environment, currency, status, and timestamps.
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
- Key defaults/nullability passed for generated id, status, and timestamps.
- Primary key exists.
- Partial unique paid access token hash index exists.
- Payment intent lookup index exists.
- Result lookup index exists.
- Module/status index exists.
- Expiry index exists.
- Foreign keys to analysis request, analysis result, generation job, payment intent, and unlock intent tables exist.

## 6. Production Route/API Regression

Safe production route/API regression checks passed.

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

## 7. Runtime Write Verification

Normal production runtime route checks did not write to the new payment tables.

Final aggregate counts after route checks:

- `payment_intents`: 0.
- `entitlements`: 0.

This matches the expected phase behavior because payment remains disabled and no checkout/runtime entitlement resolver is enabled.

## 8. Privacy / Data Safety

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

## 9. Issues Found

No P0 or P1 issues found.

Non-blocking note:

- Production health route returned service health but did not expose a git commit marker. This did not block the DB-only migration gate.

## 10. Production Recommendation

Production schema is ready for future payment entitlement work.

Runtime posture remains unchanged:

- Payment disabled.
- Checkout absent.
- NewebPay integration absent.
- Existing LINE/unlock/paid generation behavior unchanged.

## 11. Recommended Next Step

Wait for NewebPay approval and then run the payment runtime architecture/integration plan.

If continuing foundation work before provider approval, run a paid access token resolver plan without enabling checkout.
