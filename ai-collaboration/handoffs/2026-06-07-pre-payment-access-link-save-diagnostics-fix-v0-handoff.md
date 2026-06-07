# Pre-Payment Access-Link Save Diagnostics + Fix v0 Handoff

- taskStartedAt: 2026-06-07T08:10:05Z
- model / effort: GPT-5 Codex, high
- current commit: `631cc8e`
- failed production smoke resultId: `800c88fa-04de-4172-b34a-3bc78cd4d0fa`
- resultSourceCategory: `production_runtime`

## Shared Policy

Follow `AGENTS.md` and:

- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`
- `ai-collaboration/process/report-template.md`

## Critical Rules

- No production payment.
- No production Email or LINE send.
- No Vercel env changes.
- No manual production DB mutation.
- Use Admin API / `pnpm ops` first.
- Direct DB is read-only only if Admin/Ops cannot answer required root-cause questions, and must be documented.
- Do not expose raw Email, raw LINE identity, idToken, bind state, encrypted recipient, hashes, tokens, provider payloads, or tokenized URLs.
- Stop at first hard blocker.

## Goal

Diagnose and fix pre-payment access-link save reliability and observability for Email and LINE before another controlled production smoke attempt.

## Required Output

- expected Email/LINE save chain
- latest production failure diagnosis
- Email save root cause and fix
- LINE save root cause and fix
- Admin/Ops diagnostic changes and lifecycle decision
- targeted tests and QA gates
- canonical report and completion summary
