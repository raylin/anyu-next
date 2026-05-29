# Secret-Safe Authorized Fake-Paid QA Runner v0 Handoff

## Task
Create a secret-safe local QA runner or runbook for authorized staging fake-paid delivery QA.

## Scope
- Local QA helper and documentation only.
- No payment runtime behavior.
- No production flag changes.
- No NewebPay checkout, notify, or return behavior.

## Safety Rules
- Runner reads secrets only from environment variables.
- Runner never prints secret values, lengths, prefixes, suffixes, hashes, or derived values.
- Runner keeps raw `pa_` token in memory only.
- Runner never prints raw `pa_` token or tokenized URLs.
- Runner output must be safe to paste into a QA report.

## Deliverables
- Local QA runner script.
- Documentation/report under `ai-collaboration/reports/`.
- Summary log update.
- Commit and push to `origin/staging`.
