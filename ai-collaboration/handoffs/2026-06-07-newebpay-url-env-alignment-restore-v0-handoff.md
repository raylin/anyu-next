# NewebPay URL Env Alignment Restore v0

- taskStartedAt: 2026-06-07T14:04:18Z
- scope: restore only URL-bearing Vercel env values from local mirrors, redeploy fail-closed if required, and verify ReturnURL alignment/preflight.
- safety:
  - no production runtime open
  - no payment
  - no Email/LINE
  - no provider secret rotation
  - no DB mutation
  - key names and URL categories only; no full env dumps
- target keys:
  - `NEXT_PUBLIC_APP_URL`
  - `NEWEBPAY_NOTIFY_URL`
- target environments:
  - Vercel Preview(staging)
  - Vercel Production
