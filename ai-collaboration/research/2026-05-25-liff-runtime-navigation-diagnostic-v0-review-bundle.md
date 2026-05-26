# LIFF Runtime Navigation Diagnostic v0 Review Bundle

## Scope

This review covers temporary LIFF bridge runtime diagnostics only.

Out of scope and unchanged:

- Paid generation provider logic.
- LINE short-code webhook behavior.
- Payment, email, ads, legal copy, and production deployment.

## Diagnostic Mode

Diagnostic mode is enabled with:

```text
debug=1
```

Example route shape:

```text
https://staging.anyu.tw/line/fulfill?debug=1
```

For real LIFF tests, the browser address bar may still contain tokenized LIFF context because that is how LIFF enters the bridge. Do not share the address bar, browser history, page source, network logs, or full URL. Share only the rendered diagnostic panel.

## Sanitized Fields Shown

The panel shows only:

- `currentPathname`
- `searchParamKeys`
- `contextSource`
- `hasModuleSlug`
- `moduleSlug` only when allowlisted
- `hasUnlockIntentId`
- `hasUnlockToken`
- `hasFallbackCode`
- `bindAttemptStatus`
- `bindResponseHasUnlockedPath`
- `unlockedPathShape`
- `navigationMethod`
- `lastSafeErrorCode`

## Not Shown

The diagnostic formatter and panel do not display:

- unlock token value
- tokenized unlocked URL
- full query string
- LINE user ID
- LINE ID token
- short-code value
- raw message text
- raw input
- provider output
- paid result JSON
- secrets

## Navigation Behavior

- Normal mode still auto-navigates after successful bind.
- Debug mode suppresses automatic post-bind navigation so the operator can read the diagnostic panel.
- Successful bind target shape is represented only as:

```text
/m/:moduleSlug/unlock/:token
```

No token value is displayed in the panel.

## Tests

- Diagnostic formatter redacts token, intent, short-code, and full unlock path values.
- `liff.state` context source is reported without exposing state values.
- Legacy module-route `liff.state` source is reported safely.
- Debug mode requires the safe `debug=1` query flag.

## Staging Route Result

Staging alias was refreshed to a preview deployment containing this diagnostic.

Sanitized route-level result:

- `/line/fulfill?debug=1` returned HTTP 200.
- Diagnostic panel rendered.
- Homepage marker was not detected.
- Full unlock path shape was not rendered.

Important: route-level checks with artificial query values can still cause those values to appear in framework-level HTML/hydration payload because they are in the request URL. This is why manual diagnostics must share only the rendered panel, not source/network/address bar.

## Manual Diagnostic Instructions

1. Confirm staging LINE Console LIFF endpoint is `https://staging.anyu.tw/line/fulfill`.
2. Open a fresh staging result page on mobile.
3. Add or preserve `debug=1` when opening the staging LIFF flow.
4. Complete LINE authorization if prompted.
5. Do not share the address bar URL.
6. Do not share page source or network logs.
7. Screenshot or copy only the rendered `LIFF diagnostic` panel.
8. Verify the panel fields, especially:
   - `contextSource`
   - `hasModuleSlug`
   - `moduleSlug`
   - `hasUnlockIntentId`
   - `hasUnlockToken`
   - `bindAttemptStatus`
   - `bindResponseHasUnlockedPath`
   - `unlockedPathShape`
   - `navigationMethod`
   - `lastSafeErrorCode`

## Review Notes

- Production was not deployed.
- Diagnostic mode is temporary and should be removed after the mobile LIFF navigation issue is identified.
