# Deployed Staging Paid-Generation Automatic-Drain Benchmark v0 Handoff

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

## Task

Measure deployed staging paid-generation automatic drain behavior after Processor Latency + Paid Generation Readiness v0.

## Scope

- Assert staging freshness for the latest `origin/staging` commit.
- Verify staging runtime config and Admin/Ops readiness.
- Use tracked fixture / structured no-card fake-paid flow to create a staging paid-generation job.
- Measure whether staging queue/processor completes without manual processor invocation.
- Collect sanitized Admin/Ops latency metrics.
- Classify readiness for owner-only controlled windows or continued blocker status.
- Update report, summary log, dashboard, and runbook docs.

## Safety Rules

- Do not enable production runtime.
- Do not run production payment.
- Do not send real production Email or LINE.
- Do not run real staging Email/LINE channel suite.
- Do not modify Vercel env.
- Do not manually mutate production or staging DB rows.
- Do not manually trigger processor before measuring automatic drain.
- Do not expose raw Email, LINE ID, tokens, tokenized URLs, hashes, provider payloads, prompts, or secrets.

## Expected Validation

- staging freshness helper
- staging runtime config / Admin/Ops readiness
- structured no-card fake-paid queue-mode QA
- Admin/Ops lookup-result for the benchmark result
- lint/tests/build if code/docs changed
- docs presence, dashboard HTML sanity, secret/private scan, `git diff --check`

## Expected Outcome

If staging queue mode completes without manual processor invocation, classify automatic drain as verified for a small bounded sample. If it times out or needs manual processor cleanup, keep readiness blocked on automatic drain.
