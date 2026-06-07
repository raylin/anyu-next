# Pre-Payment Email Save + Mock Paid Access-Link Automation v0 Handoff

## Task

Create and validate an automated local/mock/staging-safe path proving Email save, mock/no-card paid state, access-link readiness, and `/r` resolution without real payment, real Email, real LINE, production, or owner manual action.

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

- Inspect shared access-link save/contact/linkage logic.
- Reproduce/protect Email save pre-payment behavior in automation.
- Fix root cause only after it is identified.
- Add or extend deterministic mock/no-card coverage for Email save to paid access-link readiness and `/r` resolution.
- Update process docs so shared Email/LINE save failures are investigated through shared access-link/contact logic first.

## Do Not

- Do not run production payment, enable production runtime, or touch production data.
- Do not send real Email or LINE.
- Do not run real NewebPay.
- Do not ask owner to manually bind LINE.
- Do not modify Vercel env.
- Do not use ad hoc scripts.
- Do not use direct DB unless Admin/Ops is insufficient and read-only root-cause debugging is explicitly justified.
- Do not expose raw Email, LINE ID, idToken, state, encrypted recipient, hashes, tokens, tokenized URLs, or provider payloads.
- Do not implement theme UI or Module 02.

## Stop Conditions

- Stop if the Email/shared access-link failure cannot be reproduced or protected by deterministic automation.
- Stop if a required local/mock gate fails after fixes.
- Stop if staging is needed but freshness or safe staging automation cannot be established.

## Reporting Requirements

- Use canonical report and completion summary.
- Include shared architecture map, root cause, fix summary, automation coverage, Admin/Ops result, gates run/skipped, staging yes/no, production untouched confirmation, and remaining blockers.

## Recommended Next Task

- Pass: Staging Pre-Payment Save + Access-Link E2E Rebaseline v1 focused first on Email save + mock paid + `/r`.
- Blocked: resolve exact Email/shared access-link blocker before LINE/manual/production retry.
