# Support Ops Helper Staging Lookup Smoke v0 Handoff

Date: 2026-06-03

## Task

Run the local support ops helper against known Preview(staging) test artifacts and verify sanitized, useful output.

## Scope

- Use local secure env / `.env.local` autoload.
- Verify required env presence without printing values.
- Use a staging-only artifact from no-card QA or recent operator smoke.
- Run `ops:paid-result:lookup` with safe lookup key(s).
- Verify output utility, diagnosis categories, and redaction.
- Verify production guard behavior.
- Run staging-safe regression QA.
- Document results.

## Constraints

- No production runtime/env/DB changes.
- No Email or LINE messages.
- No public admin route or UI.
- No membership/login.
- No raw `pa_`, `pcs_`, `prl_`, token hashes, raw Email, raw LINE userId, encrypted recipient, source text, provider payloads, or tokenized URLs in reports/logs.
- No production data lookup unless explicitly read-only tested; default production target must block.

## Validation Plan

- Support helper staging lookup by result id or other safe key.
- Production guard check.
- `cd apps/web && corepack pnpm run qa:recovery-link:smoke`
- `cd apps/web && corepack pnpm run qa:result-checkout:no-card`
- Documentation presence check.
- Secret/private scan.
- `git diff --check`.

## Expected Output

- Execution report with sanitized lookup summary and redaction result.
- Summary log update.
- Dashboard update only if support readiness status materially changes.
- Commit and push to `origin/staging`.
