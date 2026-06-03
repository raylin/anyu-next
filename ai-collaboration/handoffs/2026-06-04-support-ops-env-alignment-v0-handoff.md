# Support Ops Env Alignment v0 Handoff

Date: 2026-06-04

## Task

Improve local/operator env alignment for support lookup sessions so staging support lookups can run repeatably without manual Neon DB confusion.

## Scope

- Inspect `ops:paid-result:lookup` env usage and QA env preflight.
- Add a clear staging support DB env convention.
- Add/update preflight mode for support lookup.
- Keep `DATABASE_URL` fallback documented but avoid silent ambiguity where possible.
- Run sanitized support lookup smoke and production guard.
- Run staging-safe regression QA.
- Document results.

## Constraints

- No production runtime/env/DB changes.
- No Email or LINE messages.
- No public admin route or UI.
- No membership/login or Module 02.
- Do not expose `DATABASE_URL`, `PAYMENT_RECOVERY_CONTACT_HASH_SECRET`, raw Email, raw LINE ID, tokens, hashes, encrypted recipient, source text, or provider payloads.
- Do not commit secrets or private customer data.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- targeted support ops tests if scripts changed
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- support helper dry run / preflight
- support lookup staging smoke if env is available
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- docs presence, secret/private scan, `git diff --check`

## Expected Output

- Explicit support ops staging DB env convention.
- Preflight mode that prints names/presence only.
- Report, summary log, dashboard update if useful.
- Commit and push to `origin/staging`.
