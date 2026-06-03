# LINE Recovery Link Sending v0 Handoff

Date: 2026-06-03

## Task

Implement LINE recovery link sending foundation so eligible LINE recovery contacts can eventually receive a safe `/r/[recoveryToken]` web return link after paid result readiness.

## Scope

- Inspect current LINE/recovery identity and sender systems.
- Add server-only LINE recovery sender abstraction if recipient identity can be handled safely.
- Preserve hash-only `payment_recovery_contacts` design.
- Integrate with paid delivery recovery-link send orchestration only where safe.
- Add tests and documentation.

## Constraints

- Do not enable production payment runtime.
- Do not modify production flags, env, or DB.
- Do not apply production DB migration.
- Do not send production LINE messages.
- Do not send report body or private analysis via LINE.
- Do not expose raw `prl_`, token hashes, `pa_`, `pcs_`, raw LINE user IDs, provider payloads, or private customer data.
- Do not implement membership/login or Module 02.
- Do not change payment provider behavior.

## Critical Decision

LINE Messaging API requires a sendable recipient identifier. If no secure recipient reference exists outside `payment_recovery_contacts`, do not store raw LINE IDs there. Implement only noop/test behavior and document the required recipient-secret design follow-up.

## Expected Output

- Execution report under `ai-collaboration/reports/`.
- Summary log update.
- Dashboard update if LINE recovery status changes.
- Commit and push to `origin/staging` when validation and safety checks pass.
