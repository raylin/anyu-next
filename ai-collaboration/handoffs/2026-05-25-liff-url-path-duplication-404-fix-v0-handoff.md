# LIFF URL Path Duplication 404 Fix v0 Handoff

## Task

Fix generated LINE LIFF URLs so they do not append app route paths after the LIFF ID.

## Problem

Real mobile staging LIFF still reaches a generic Next.js 404 before the diagnostic panel renders. Previous smoke output showed generated LIFF URLs shaped like `/2010157793-Q4JeeYv0/line/fulfill`, which indicates the app was appending `/line/fulfill` after the LIFF ID.

## Goal

Generated LIFF URLs must use only the configured LIFF base, for example:

```text
https://liff.line.me/{LIFF_ID}?<fulfillment context>
```

LINE Console endpoint remains:

- staging: `https://staging.anyu.tw/line/fulfill`
- production: `https://anyu.tw/line/fulfill`

## Scope

- Update LIFF URL generation and context serialization.
- Keep `/line/fulfill` direct query and `liff.state` parsing.
- Keep compatibility route but do not use it in generated LIFF URLs.
- Do not change paid generation, short-code webhook, payment, email, ads, or production deployment.

## Safety

- Do not record tokens, codes, LINE user IDs, raw input, provider output, paid result JSON, or secrets.
- Report only URL shape and query key presence.
