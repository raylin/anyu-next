# LIFF Post-bind Unlock Redirect 404 Fix v0 Review Bundle

## Scope

This review covers the LIFF post-bind redirect target fix only.

Out of scope and unchanged:

- Paid generation provider logic.
- LINE short-code webhook behavior.
- Payment, email, ads, legal copy, and production deployment.
- Real LINE user identifiers, unlock token values, short-code values, tokenized URLs, raw input, provider output, and paid result JSON.

## Root Cause

The LIFF bind API returned an environment-derived absolute `unlockedUrl`. On mobile LIFF, any host/base-url mismatch or malformed absolute URL can land outside the intended module unlock route and show a generic 404 after bind.

The safer contract is to return a root-relative unlock path and have the client navigate only to that validated path shape.

## Fix Summary

- Added `buildModuleUnlockPath`.
- Changed LIFF bind success response from an environment-derived absolute `unlockedUrl` to root-relative `unlockedPath`.
- Updated the LIFF bridge client to normalize bind redirect targets and allow only `/m/{moduleSlug}/unlock/{unlockToken}` path shape.
- Kept a compatibility read for legacy `unlockedUrl`, but it is normalized down to a same-origin path before navigation.
- Added tests for the root-relative unlock path and bind response target.

## Final Redirect Shape

```text
/m/ambiguous-temperature/unlock/<redacted>
```

No token value is recorded in this review bundle.

## Staging Route-Level Smoke

Staging alias was refreshed to a preview deployment containing this fix.

Sanitized route-level result:

- Synthetic analyze returned HTTP 200.
- Unlock intent returned HTTP 200.
- Generated LIFF URL still uses global bridge path `/2010157793-Q4JeeYv0/line/fulfill`.
- Generated LIFF URL carries `moduleSlug=ambiguous-temperature` and required context params.
- Expected bind redirect shape is `/m/ambiguous-temperature/unlock/<redacted>`.
- Direct unlocked route shape returned HTTP 200.
- Sanitized heading check confirmed the unlocked route rendered the unlock page state, not homepage or app-level 404.

## Notes

- Route-level smoke cannot produce a real LINE ID token, so it cannot fully exercise the post-bind API in staging without a mobile LINE client.
- Unit tests cover the bind API response shape and module mismatch rejection.
- Real mobile LIFF retest is still required.

## Manual Retest Instructions

1. Confirm staging LINE Console LIFF endpoint is `https://staging.anyu.tw/line/fulfill`.
2. Open a fresh staging result page on mobile.
3. Click the LINE fulfillment CTA.
4. Complete LINE authorization if prompted.
5. Confirm successful bind redirects to an unlocked route shaped `/m/ambiguous-temperature/unlock/<token>`.
6. Confirm the page shows processing, completed paid content, or a clear unlock state, not generic 404.
7. Do not record LINE user IDs, unlock tokens, short codes, tokenized URLs, private messages, raw input, provider output, or paid result JSON.
