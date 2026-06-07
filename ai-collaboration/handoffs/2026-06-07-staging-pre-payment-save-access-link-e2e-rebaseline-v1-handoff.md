# Staging Pre-Payment Save + Access-Link E2E Rebaseline v1 Handoff

Date: 2026-06-07

## Task

Run a focused staging E2E rebaseline for fresh result -> Email save -> mock/no-card paid state -> access-link readiness -> `/r` paid result resolution -> Admin/Ops summary.

## Context

- Pre-Payment Email Save + Mock Paid Access-Link Automation v0 fixed the shared contact encryption-key handling behind `email_save_contact_write_failed`.
- The fix also added no-card automation for Email save to mock paid access-link readiness.
- Previous staging rebaseline failed before no-card/fake-paid transition.
- LINE-specific debugging remains blocked until the Email/shared path is stable in staging.

## Shared Policy

Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

This task-specific handoff only repeats high-risk rules that are directly relevant.

## Scope

- Staging only.
- Email save path first.
- Use committed QA/Admin helpers, not ad hoc scripts.
- Stop at first hard failure.

## Do Not

- Do not enable production runtime.
- Do not run production payment.
- Do not send real Email or real LINE.
- Do not run manual LINE bind.
- Do not modify Vercel env.
- Do not mutate production data.
- Do not expose raw Email, LINE ID, tokens, tokenized URLs, hashes, encrypted recipient, or provider payloads.

## Validation

- `qa:deploy:freshness -- --env staging --expected-commit <targetDeployCommit>`
- Admin/Ops runtime config reads for staging.
- `qa:module01:smoke-fixture -- --json`
- focused staging no-card path using `qa:result-checkout:no-card` if freshness and config pass.
- Admin/Ops lookup for resulting staging result if available.

## Reporting

Use canonical report and completion summary.
