# Email Recovery Link Sending v0 Handoff

Date: 2026-06-02

## Task

Implement the Email recovery link sending foundation so saved Email recovery contacts can receive a safe web return link after paid result readiness or when saved post-payment.

## Scope

- Server-only Email sender abstraction.
- Recovery Email template.
- Recovery link generation + sanitized/noop send orchestration.
- Post-payment completed-result Email save trigger.
- Tests, staging-safe QA, docs.

## Constraints

- Do not enable production payment runtime.
- Do not modify production env.
- Do not apply production DB migrations.
- Do not send real production Email.
- Do not send LINE messages.
- Do not implement membership/login or Module 02.
- Do not expose raw `prl_`, `pa_`, `pcs_`, token hashes, provider payloads, raw user input, or private identifiers.
- Do not include report content in Email.
- Do not commit provider secrets or private customer data.

## Planned Work

1. Inspect recovery contact helpers, recovery link helpers, completed-result Email save action, paid delivery artifacts, and existing env conventions.
2. Add a minimal Email provider abstraction with noop/test behavior by default.
3. Add a safe recovery Email template containing only module/product copy, `/r/[token]` link, 90-day retention copy, and support contact.
4. Add orchestration helper to create Email-channel recovery links and send via adapter without logging raw tokens.
5. Wire post-payment Email save to trigger the helper and return sanitized send status.
6. Keep paid delivery completion sending deferred unless a non-fatal hook is obviously safe.
7. Add tests and update QA/docs.
