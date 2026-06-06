# Codex Approval Policy Deprecation Warning Fix v0

Date: 2026-06-06

## Timing / Execution Metadata

- taskStartedAt: 2026-06-06T23:52:31+0800
- taskCompletedAt: 2026-06-06T23:54:22+0800
- totalWallClockDuration: 1m51s
- humanWaitDuration: 0m00s
- netCodexWorkDuration: 1m51s
- model used: gpt-5.5
- reasoning/effort level used: high
- first failure category if failed: none

## Task

Fix the local Codex warning that `on-failure` approval policy is deprecated and should be replaced by `on-request` for interactive approval behavior.

## What Changed

- Updated the user-level Codex approval policy from `on-failure` to `on-request`.
- Confirmed `/Users/raylin/.codex/config.toml` and `/Users/raylin/.Codex/config.toml` are the same config file by inode.
- Confirmed both paths now report `approval_policy = "on-request"`.

## Files / Records

- Local config changed outside repo: `/Users/raylin/.codex/config.toml`
- Same config reachable through: `/Users/raylin/.Codex/config.toml`
- Handoff: `ai-collaboration/handoffs/2026-06-06-codex-approval-policy-deprecation-warning-fix-v0-handoff.md`
- Report: `ai-collaboration/reports/2026-06-06-codex-approval-policy-deprecation-warning-fix-v0.md`
- Summary log: `ai-collaboration/summaries/summary_log.md`

## Validation

Run:

- `awk '/^approval_policy[[:space:]]*=/{print FILENAME ":" $0}' /Users/raylin/.codex/config.toml /Users/raylin/.Codex/config.toml`
  - Result: both paths report `approval_policy = "on-request"`.
- `rg -n '^approval_policy\s*=\s*"on-failure"' /Users/raylin/.codex/config.toml /Users/raylin/.Codex/config.toml`
  - Result: no active config uses the deprecated value.

Skipped:

- App lint/test/build: skipped because no application source changed.
- Module 01 local/staging/production QA: skipped because no deployed runtime behavior changed.
- Vercel/env mirror gates: skipped because no app env mirror or Vercel setting changed.

Real Email/LINE/payment:

- None run.

## Notes

- A sandboxed backup attempt to `~/.codex` was blocked by filesystem policy before the patch. No backup file was created.
- The active config edit was a single-line change.
- No app source, env mirror, payment, NotifyURL, ReturnURL, processor, LINE, Email, access-link, Admin API/CLI, or production runtime behavior changed.

## Recommended Next Task

Return to the owner/PM mainline engineering foundation work.
