# Staging Fake Paid Delivery QA v0 Handoff

## Task
Run and document a staging QA smoke for the internal paid delivery chain before starting NewebPay checkout/provider implementation.

## Scope
- QA and documentation only unless a small fix is required to complete the smoke.
- Staging only.
- Payment runtime remains disabled.
- Production flags and behavior remain unchanged.

## Chain To Verify
1. Existing Module 01 source result.
2. Operator fake paid success.
3. Fake paid payment intent.
4. Operator-test entitlement with hash-at-rest `pa_` access token.
5. Paid generation job creation/reuse.
6. Paid-result status polling with `pa_` token.
7. Unlock route rendering with `pa_` token.
8. Idempotent repeat behavior.
9. Legacy unlock regression and invalid `pa_` safe failure behavior.

## Safety Rules
- Do not commit raw `pa_` tokens, tokenized URLs, operator secrets, provider credentials, raw input, provider output, `paid_result_json`, LINE IDs, reply tokens, or secrets.
- Do not print secrets in logs.
- Redact all private access values in reports.
- Do not implement NewebPay checkout, notify, return, queue trigger, LINE delivery, refund tooling, production flag enablement, prompt/result behavior changes, or public legal/provider-review copy changes.

## Execution Plan
1. Confirm staging deployment freshness and endpoint availability.
2. Verify unauthenticated and invalid-secret gate behavior.
3. Prepare a staging Module 01 source result through the normal analyze flow if needed.
4. Run authorized fake paid success only if a valid operator secret is available from the approved secure environment.
5. Verify idempotency with a repeated authorized request.
6. Verify `pa_` unlock route and paid-result status route behavior with redacted outputs.
7. Run the existing staging-safe processor/manual path only if the required secret is available.
8. Record pass/fail, blockers, and sanitized aggregate results.

## Deliverables
- Execution report: `ai-collaboration/reports/2026-05-29-staging-fake-paid-delivery-qa-v0-execution-report.md`
- Summary log update: `ai-collaboration/summaries/summary_log.md`
- Commit and push to `origin/staging` if safety checks pass.
