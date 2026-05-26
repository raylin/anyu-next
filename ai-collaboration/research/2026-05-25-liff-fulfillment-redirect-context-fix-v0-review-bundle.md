# LIFF Fulfillment Redirect Context Fix v0 Review Bundle

## Scope

This review covers the staging LIFF fulfillment redirect/context fix only.

Out of scope and unchanged:

- Paid generation provider logic.
- LINE short-code webhook behavior.
- Payment, email, ads, and legal copy.
- Production deployment.

## Manual Smoke Finding

Manual staging smoke indicated the LIFF handoff appeared to bind but the user landed on the homepage instead of the fulfillment/unlocked route. No raw tokens, LINE user IDs, short codes, private messages, raw input, provider output, or paid result JSON are recorded here.

## Root Cause

The LIFF bridge page only parsed direct query parameters. LINE LIFF redirects can carry the original context through `liff.state`, so the bridge could lose `unlockIntentId` / `unlockToken` context after the LINE app redirect/login flow. The previous LIFF URL also relied on query parameters attached to the bare LIFF base URL instead of explicitly carrying the module fulfillment route as LIFF secondary redirect context.

## Fix Summary

- LIFF URL generation now includes the module fulfillment route path when the base host is `liff.line.me`.
- LIFF fulfillment page now parses context from direct query parameters and `liff.state`.
- Missing context remains a safe fallback state with short-code guidance instead of silently redirecting to homepage.
- Bind API behavior remains unchanged: successful LIFF bind returns the module unlock route.

## Expected Staging Config

- Expected LIFF endpoint remains `https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill`.
- Staging LIFF ID remains `2010157793-Q4JeeYv0`.
- The generated LIFF URL now has this sanitized shape:

```text
https://liff.line.me/<staging-liff-id>/m/ambiguous-temperature/line/fulfill?unlockIntentId=<redacted>&unlockToken=<redacted>&code=<redacted>
```

## Tests Added / Updated

- LIFF URL generation includes the module fulfillment route.
- Fulfillment context parser handles direct query params.
- Fulfillment context parser handles `liff.state`.
- Missing context returns an empty context for safe fallback behavior.
- LIFF bind route test asserts the response includes the module unlock URL and paid status.

## Staging Route-Level Smoke

Staging alias was refreshed to a preview deployment containing this fix.

Sanitized route-level result:

- Synthetic analyze returned HTTP 200.
- Unlock intent returned HTTP 200.
- Unlock response LIFF URL host: `liff.line.me`.
- Unlock response LIFF URL path included `/m/ambiguous-temperature/line/fulfill`.
- LIFF URL carried `unlockIntentId`, `unlockToken`, and `code` query params.
- Fulfillment route with direct query returned HTTP 200 and rendered LINE fulfillment page.
- Fulfillment route with `liff.state` returned HTTP 200 and rendered LINE fulfillment page.
- Neither route-level check rendered the homepage.

## Manual Verification Steps

1. Open a fresh staging result page and click the LINE fulfillment CTA from a mobile LINE-capable device.
2. Confirm the LINE/LIFF app opens the staging LIFF app.
3. Complete LINE authorization if prompted.
4. Confirm the bridge does not land on the homepage.
5. Confirm it lands on `/m/ambiguous-temperature/unlock/<token>` or an honest processing/completed unlocked state.
6. If the LINE context is missing, confirm the page shows short-code fallback instructions instead of homepage or blank state.

Do not paste or record real LINE user IDs, unlock tokens, short codes, tokenized URLs, private messages, raw input, provider output, or paid result JSON.

## Review Notes

- Real in-LINE mobile smoke still requires the human/operator because shell verification cannot produce a real LINE ID token.
- Production was not deployed or changed.
