# Staging Pre-Payment Save + Access-Link E2E Rebaseline v0 Handoff

## Task

Run a staging-first Module 01 pre-payment save and access-link E2E rebaseline before any further production smoke.

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

- Assert Preview(staging) freshness for the latest `origin/staging` commit.
- Verify staging scoped runtime config state through Admin/Ops.
- Generate a fresh Module 01 fixture and staging result.
- Validate checkout-start, Email save, LINE bind, no-card/fake-paid transition, access-link `/r/` behavior, and Admin/Ops summaries where available.
- Run `qa:module01:staging` once after targeted staging E2E.
- Keep production untouched except read-only checks already included by structured gates.

## Do Not

- Do not open production runtime or create production results.
- Do not run production payment, production Email, or production LINE.
- Do not modify Vercel env or deploy production.
- Do not use ad hoc scripts or direct DB unless Admin/Ops is insufficient and read-only debugging is explicitly justified.
- Do not expose raw Email, LINE identity, idToken, state, encrypted recipient, hashes, tokens, tokenized URLs, or provider payloads.
- Do not implement theme UI or Module 02.

## Stop Conditions

- Stop if staging freshness fails.
- Stop if staging runtime config cannot be verified or opened safely.
- Stop if result creation returns `cacheHit=true`.
- Stop if Email save, LINE bind, no-card/fake-paid transition, access-link resolution, or Admin/Ops lookup fails.
- Stop if `qa:module01:staging` has required-check failure or mixed deployment.

## Reporting Requirements

- Use canonical report and completion summary.
- Include target/deployed commit fields, staging runtime config, result/cache assertion, save/bind results, no-card/access-link result, Admin/Ops evidence, channel receipt status, and production untouched confirmation.

## Recommended Next Task

- Pass: Production Deploy Freshness / Promotion Gate v0, then controlled production payment smoke retry.
- Fail: fix the staging failure with targeted tests/mock/UI/Admin diagnostics before any production attempt.
