# Provider Message ID / Send Attempt Audit v0 Handoff

Date: 2026-06-03

## Task

Add minimal provider send audit support for Email and LINE paid result access-link delivery.

## Scope

- Inspect current send status behavior for `paid_result_recovery_links`.
- Choose a minimal audit model.
- Add schema/helper/service-level audit fields or send-attempt model.
- Capture sanitized provider message id/status/failure category where available.
- Preserve active-link dedupe, support resend helper behavior, and non-fatal paid delivery.
- Add tests and documentation.

## Constraints

- No public resend UI.
- No public support/admin tooling.
- No production env/runtime/DB changes.
- Do not apply production DB migration.
- Do not send production Email or LINE messages.
- Do not expose raw `prl_`, token hashes, `pa_`, `pcs_`, raw Email, raw LINE ID, or provider payloads.
- Do not implement membership/login or Module 02.

## Validation Plan

- `cd apps/web && corepack pnpm lint`
- Targeted provider audit / access-link send tests
- `cd apps/web && corepack pnpm test`
- `cd apps/web && corepack pnpm build`
- `cd apps/web && corepack pnpm exec drizzle-kit check` if schema changed
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`

## Expected Output

- Minimal audit schema/helper changes.
- Tests for provider message id, attempt count, failure category, noop behavior, and duplicate dedupe.
- Execution report, summary log update, dashboard update if audit readiness changes.
- Commit and push to `origin/staging` if validation passes.
