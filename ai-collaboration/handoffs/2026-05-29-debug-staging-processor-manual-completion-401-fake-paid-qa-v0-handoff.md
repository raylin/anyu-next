# Debug Staging Processor Manual Completion 401 in Fake-Paid QA v0 Handoff

## Task
Debug the authorized fake-paid QA processor/manual completion failure where the fake-paid creation and idempotency paths pass, but the processor endpoint returns HTTP 401.

## Scope
- Processor auth contract, runner compatibility, staging env diagnostics only.
- No NewebPay checkout, notify, or return implementation.
- No payment runtime enablement.
- No queue trigger, LINE delivery, refund tooling, production payment enablement, prompt/result, or public legal/provider-review copy changes.

## Investigation Targets
- Processor/manual endpoint path and auth contract.
- Runner processor request endpoint/header/value format.
- Tests documenting expected auth behavior.
- Whether 401 is code-side mismatch or staging env mismatch.

## Safety Rules
- Do not print or record `OPERATOR_TEST_SECRET`, `INTERNAL_JOB_SECRET`, or `PAID_ACCESS_TOKEN_HASH_SECRET`.
- Do not commit raw `pa_` tokens, tokenized URLs, raw input, or private values.
- Do not run authorized QA unless secrets are securely available in the shell.

## Deliverables
- Execution report.
- Summary log update.
- Code/tests only if a code-side mismatch is found.
