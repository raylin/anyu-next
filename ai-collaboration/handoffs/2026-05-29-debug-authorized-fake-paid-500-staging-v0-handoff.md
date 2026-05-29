# Debug Authorized Fake-Paid 500 on Staging v0 Handoff

## Task
Debug and fix the authorized fake-paid staging 500 where the valid-secret business path fails before returning payment intent, entitlement, generation job, or `pa_` token metadata.

## Scope
- Narrow bug triage and minimal fix only.
- No payment runtime enablement.
- No NewebPay checkout, notify, or return behavior.
- No public checkout UI, queue trigger integration, LINE delivery, refund tooling, production flag changes, prompt/result changes, or public legal/provider-review copy changes.

## Findings
- The valid-secret route reaches business logic.
- First-time entitlement creation hashes the new `pa_` token with `PAID_ACCESS_TOKEN_HASH_SECRET`.
- If that secret is missing on staging, `hashPaidAccessToken` throws `paid_access_token_hash_secret_missing`, which previously surfaced as an uncategorized HTTP 500.

## Fix Plan
- Add a pre-write config guard before creating a new fake payment intent when an entitlement/token would need to be created.
- Return a safe `paid_access_token_config_missing` category instead of uncategorized 500.
- Add safe failure categories around payment intent, entitlement/token, and generation job creation.
- Keep the runner secret-safe and stop cleanly on categorized fake-paid failures.

## Deliverables
- Code fix.
- Targeted tests.
- Execution report.
- Summary log update.
