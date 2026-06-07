# NewebPay ReturnURL Alignment Check v0

- taskStartedAt: 2026-06-07T13:51:22Z
- scope: read-only alignment audit for canonical ReturnURL route, local env mirrors, Vercel env consistency, process docs, dashboard/manual owner action, and legacy route compatibility status.
- safety: no production runtime/payment/channel sends/env mutations.
- initial focus:
  - confirm active code canonical ReturnURL path
  - compare local env mirrors to Vercel Preview(staging) / Production for URL-bearing keys only
  - verify process docs and production gate policy wording
  - confirm whether old module ReturnURL route is inactive canonical path and compatibility-only
