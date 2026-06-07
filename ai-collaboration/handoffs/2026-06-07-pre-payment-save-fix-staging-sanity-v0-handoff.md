# Pre-Payment Save Fix Staging Sanity v0 Handoff

## Task

Verify the Pre-Payment Access-Link Save Diagnostics + Fix v0 on Preview(staging) using the deployed freshness guard and one structured staging gate.

## Shared Policy References

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`
- `ai-collaboration/process/report-template.md`

## Scope

- Determine target deploy commit for Preview(staging).
- Wait for target commit with `qa:deploy:freshness`.
- Run `qa:module01:staging` once with `MODULE01_EXPECTED_DEPLOY_COMMIT`.
- Use suite-produced staging artifact for optional Admin/Ops lookup if available and authorized by process env.
- Update report, summary log, and dashboard.

## Do Not

- Do not enable production runtime.
- Do not run production payment.
- Do not send Email or LINE.
- Do not run `qa:module01:staging:channels`.
- Do not mutate production data.
- Do not modify Vercel env.
- Do not use ad hoc scripts.
- Do not expose raw Email, raw LINE ID, tokens, tokenized URLs, or provider payloads.

## Validation Selection

- Required: freshness helper and one `qa:module01:staging` run after freshness pass.
- Optional: `pnpm ops lookup-result --env staging` if safe staging result ID and explicit `ADMIN_API_TOKEN` are available.
- Docs/safety: report presence, dashboard HTML sanity, private scan, `git diff --check`.

## Reporting Requirements

- Include model/effort and timing fields.
- Include `codeFixCommit`, `targetDeployCommit`, and report commit.
- Separate `commandExitCode`, `gateStatus`, `requiredChecksStatus`, `optionalChecksStatus`, and freshness/deployed commit fields.
- Confirm no production runtime/payment/Email/LINE.

## Recommended Next Task

Controlled Production Payment Smoke Retry with Scoped Runtime Config v1 if staging sanity passes or is acceptable partial with required checks passing.
