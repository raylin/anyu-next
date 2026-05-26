# LIFF URL Path Duplication 404 Fix v0 Review Bundle

## Scope

This fix covers generated LINE LIFF URL shape and fulfillment context serialization only.

Unchanged:

- LIFF bind API logic.
- Paid generation provider logic.
- Short-code webhook behavior.
- Payment, email, ads, and production deployment.

## Root Cause

Generated LIFF URLs appended the app bridge path after the LIFF ID:

```text
https://liff.line.me/{LIFF_ID}/line/fulfill?<context>
```

With LINE Console already configured to use the app endpoint, this could make the real LINE runtime land on a malformed Next.js path before `/line/fulfill` rendered. That matches the mobile symptom: generic Next.js 404 before the diagnostic panel.

## Fixed Shape

Generated LIFF URLs now keep the LIFF base path as only the LIFF ID:

```text
https://liff.line.me/{LIFF_ID}?<context>
```

If a stale LIFF base env accidentally contains extra route segments, the builder strips it back to the LIFF ID before adding query params.

## Context

Context remains in query params:

- `moduleSlug`
- `unlockIntentId`
- `unlockToken`
- `code`
- optional `debug=1`

The bridge still parses direct query params and `liff.state`.

## Staging Result

Staging was refreshed to preview deployment:

```text
anyu-next-7cz7kxcfn-studioanyu-1488s-projects.vercel.app
```

Alias:

```text
https://staging.anyu.tw
```

Sanitized live unlock-intent shape check:

- status: 200
- LIFF host: `liff.line.me`
- LIFF path shape: `/{LIFF_ID}`
- query keys present: `code`, `debug`, `moduleSlug`, `unlockIntentId`, `unlockToken`
- contains `/line/fulfill` after LIFF ID: no
- contains `/m/` after LIFF ID: no
- `debug=1` carried: yes

Route check:

- `/line/fulfill?debug=1` returned HTTP 200.
- Diagnostic panel rendered.
- Homepage marker was not detected.

## Manual Mobile Retest

1. Open a fresh staging result page with `debug=1` in the result page URL.
2. Click the LINE/LIFF fulfillment CTA.
3. Confirm the LINE in-app browser no longer lands on a generic Next.js 404 before the bridge renders.
4. If the bridge diagnostic panel appears, share only the rendered sanitized panel.
5. Do not share address bar URLs, page source, network logs, tokens, codes, LINE identifiers, or full tokenized URLs.

## Review Notes

- Production was not deployed.
- The generated LIFF URL can carry `debug=1` from the result page into the LIFF context.
- Existing compatibility route remains available but is not used in generated LIFF URLs.
