# LIFF Runtime Navigation Diagnostic v0

## Task

Add a safe, temporary diagnostic mode for the staging LIFF bridge to identify what path/state the real mobile LIFF runtime uses, without exposing secrets, tokens, LINE user IDs, short codes, raw input, provider output, paid result JSON, or tokenized URLs.

## Problem

Real mobile staging LIFF smoke still lands on a 404 after the post-bind redirect fix.

Current facts:

- It no longer drops to homepage.
- It still shows 404 after LIFF bind.
- Route-level smoke says `/m/ambiguous-temperature/unlock/<redacted>` returns HTTP 200.
- Bind API returns root-relative `unlockedPath`.
- LIFF bridge validates redirect shape before navigation.
- Real mobile LIFF behavior differs from route-level smoke.

## Scope

- Focus only on `/line/fulfill` bridge runtime diagnostics and navigation behavior.
- Do not change paid generation provider logic.
- Do not change short-code webhook.
- Do not deploy production.
- Do not log raw tokenized URLs.

## Diagnostic Requirements

Expose only sanitized booleans/shapes:

- current pathname
- search param keys present, not values
- context source
- has module slug
- allowlisted module slug only
- has unlock intent
- has unlock token
- has fallback code
- bind attempt status
- bind response has unlocked path
- unlocked path shape only
- navigation method used
- last safe error code

Never display or log actual unlock token, tokenized URL, LINE user ID, ID token, short code, raw text/input, provider output, paid result JSON, or secrets.

## Required Outputs

- Diagnostic code/tests.
- Staging route-level verification for `/line/fulfill?debug=1`.
- Manual diagnostic instructions.
- Review bundle: `ai-collaboration/research/2026-05-25-liff-runtime-navigation-diagnostic-v0-review-bundle.md`.
- Execution report: `ai-collaboration/reports/2026-05-25-liff-runtime-navigation-diagnostic-v0-execution-report.md`.
- Update staging setup record and summary log.
- Commit `test: add liff navigation diagnostics`.
- Push to `origin/staging`.
