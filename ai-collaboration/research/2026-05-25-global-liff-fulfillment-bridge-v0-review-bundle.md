# Global LIFF Fulfillment Bridge v0 Review Bundle

## Scope

This review covers the global LIFF fulfillment bridge implementation only.

Out of scope and unchanged:

- Paid generation provider logic.
- LINE short-code webhook delivery logic.
- Payment, email, ads, legal copy, and production deployment.
- Real LINE user identifiers, unlock tokens, short codes, tokenized URLs, raw input, provider output, and paid result JSON.

## Root Cause Hypothesis

The previous LINE Console LIFF endpoint was module-specific:

```text
https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill
```

Real mobile LINE LIFF can briefly load the endpoint and then redirect through LIFF state/login mechanics. A module-specific endpoint is more brittle and does not scale to multiple modules. The safest fix is a stable global bridge endpoint that receives context and routes to the correct module unlock path.

## New Canonical Endpoints

- Staging LIFF Console endpoint: `https://staging.anyu.tw/line/fulfill`
- Production LIFF Console endpoint: `https://anyu.tw/line/fulfill`

The old route remains compatibility-only:

```text
/m/{moduleSlug}/line/fulfill
```

## Module Routing Behavior

- Generated LIFF URLs now use the global bridge path under the LIFF app URL.
- Generated LIFF URLs carry `moduleSlug`, `unlockIntentId`, `unlockToken`, and fallback `code` as context.
- The global bridge parses direct query params and `liff.state`.
- `moduleSlug` is validated against supported modules before binding.
- Successful bind posts `moduleSlug`, unlock intent, unlock token, and LINE ID token to the bind API.
- Bind API validates optional `moduleSlug` against the persisted unlock intent.
- Success redirects to `/m/{moduleSlug}/unlock/{unlockToken}`.

## Safety Behavior

- Missing `moduleSlug` shows fallback instructions.
- Unsupported `moduleSlug` shows fallback instructions.
- Missing unlock intent/token shows fallback instructions.
- The bridge does not redirect to homepage on missing context.
- Event metadata continues to avoid LINE user IDs, tokens, short codes, tokenized URLs, raw input, provider output, and paid result JSON.

## Tests Added / Updated

- LIFF URL generation now expects global bridge context.
- LIFF URL generation normalizes non-LIFF base URLs to `/line/fulfill`.
- Context parser handles direct query params.
- Context parser handles `liff.state`.
- Context parser handles legacy module-specific `liff.state` paths.
- Context parser supports compatibility-route default `moduleSlug`.
- Bind route rejects module mismatch before binding/generation.
- Playwright spec added for `/line/fulfill` missing/unsupported context safe fallback.

## Staging Route-Level Smoke

Staging alias was refreshed to a preview deployment containing this implementation.

Sanitized route-level result:

- Synthetic analyze returned HTTP 200.
- Unlock intent returned HTTP 200.
- Generated LIFF URL host: `liff.line.me`.
- Generated LIFF URL path: `/2010157793-Q4JeeYv0/line/fulfill`.
- Generated LIFF URL carried `moduleSlug=ambiguous-temperature`.
- Generated LIFF URL carried required unlock intent, unlock token, and short-code context without recording values.
- `/line/fulfill` missing-context route returned HTTP 200, rendered LINE fulfillment page, rendered safe fallback, and did not render homepage.
- `/line/fulfill` unsupported-module route returned HTTP 200, rendered safe fallback, and did not render homepage.
- `/line/fulfill?liff.state=...` route returned HTTP 200 and rendered LINE fulfillment page.
- `/m/ambiguous-temperature/line/fulfill?...` compatibility route returned HTTP 200 and rendered LINE fulfillment page.

## Manual Staging Smoke Instructions

1. In LINE Developers Console for the staging LIFF app, set Endpoint URL to `https://staging.anyu.tw/line/fulfill`.
2. Open a fresh staging result page on a mobile device that can open LINE.
3. Click the LINE fulfillment CTA.
4. Confirm the LIFF app opens and does not show a 404.
5. Complete LINE authorization if prompted.
6. Confirm the bridge lands on `/m/ambiguous-temperature/unlock/<token>` or an honest processing/completed unlocked state.
7. If context is missing, confirm the page shows short-code fallback instructions instead of homepage or blank state.

Do not paste or record LINE user IDs, unlock tokens, short codes, tokenized URLs, private messages, raw input, provider output, or paid result JSON.

## Review Notes

- Production docs were updated, but production was not deployed or changed.
- Real mobile LIFF smoke still requires the human/operator because shell route checks cannot generate a real LINE ID token.
