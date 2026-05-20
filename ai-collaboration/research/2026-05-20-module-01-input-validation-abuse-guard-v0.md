# Module 01 Input Validation + Abuse Guard v0

Date: 2026-05-20

## 1. Summary

Module 01 now rejects obviously malformed, unrelated, or prompt-injection-like analyze requests before provider cost is incurred. The analyze flow also enforces pragmatic cost caps for session, IP, and overall daily volume without adding auth or a new external rate-limit service.

## 2. Guardrails Added

- Hard server-side length validation remains authoritative.
- Minimum analyze length is now `30` characters.
- Hard max remains `4,000` characters.
- A soft helper warning appears after `2,000` characters.
- Request body shape is validated before deeper analyze logic runs.
- Obvious prompt-injection strings are blocked before provider call.
- Clearly unrelated non-relationship use cases are blocked before provider call.

## 3. Error Codes And UX Copy

- `input_too_short`
- `input_too_long`
- `unsupported_content`
- `prompt_injection_detected`
- `rate_limited_session`
- `rate_limited_ip`
- `daily_cap_reached`
- `validation_error`
- `config_error`
- `provider_error`

User-facing copy stays non-technical and does not expose DB, provider, schema, or internal runtime details.

## 4. Cap Strategy

- Session daily cap uses persisted `analysis_requests` rows filtered by module/theme/session and the last 24 hours.
- Global daily cap uses persisted `analysis_requests` rows filtered by module/theme and the last 24 hours.
- IP hourly cap uses an in-memory window keyed from `x-forwarded-for` or `x-real-ip`.

## 5. Why No Schema Change

No schema change was made in this pass.

Reason:

- Session and global caps are already supportable through `analysis_requests`.
- The IP guard is explicitly treated as a best-practical v0 limiter rather than a durable cross-instance abuse system.
- This keeps the launch-readiness pass small and avoids a migration just to persist IP-like metadata.

## 6. Privacy Notes

- Raw input is still redacted before persistence.
- Event metadata still blocks raw text-like keys.
- No IP address is persisted.
- No contact value is written into events by this change.
- Guard decisions do not add provider internals to user-visible errors.

## 7. Tests Added Or Updated

- `src/tests/abuse-guard.test.ts`
- `src/tests/ai-temperature-ui.test.ts`

Coverage includes:

- prompt-injection detection
- unsupported-content detection
- in-memory IP rate limiting
- env-backed cap config
- updated CTA/input hint behavior
- updated friendly error messages

## 8. Known Limits

- The IP limiter is process-local and not durable across all serverless instances.
- The soft max is a UI hint only; the server still enforces only the hard max.
- Relationship-content detection is intentionally loose and may allow ambiguous non-ideal inputs if they resemble relationship language.

## 9. Recommended Next Step

`Module 01 Staging Abuse Guard Verification v0`
