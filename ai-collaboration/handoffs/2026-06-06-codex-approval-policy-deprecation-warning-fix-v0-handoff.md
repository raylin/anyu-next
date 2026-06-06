# Codex Approval Policy Deprecation Warning Fix v0 Handoff

Date: 2026-06-06

## Task

Fix the local Codex warning that `on-failure` approval policy is deprecated by updating the interactive approval policy to a supported value.

## Context

- Follow `AGENTS.md` and `ai-collaboration/process/codex-operating-policy.md`.
- Repository search did not find an app-level `on-failure` approval policy.
- The deprecated value was found in the local Codex config file.
- This is local developer tooling configuration only; no app runtime or provider behavior is in scope.

## Scope

- Update the Codex approval policy from `on-failure` to `on-request`.
- Verify the deprecated value is no longer present in active Codex config files.
- Record a report and summary-log entry.

## Do Not

- Do not change app source, env mirrors, Vercel settings, payment, NotifyURL, ReturnURL, processor, LINE, Email, access-link, Admin API/CLI, or production runtime behavior.
- Do not print secrets or config secret values in reports or summaries.

## Validation Selection

Run:

- Targeted config inspection for `approval_policy` and absence of `on-failure`.

Skip:

- App lint/test/build because this task changes local Codex tooling config only.
- Staging/production QA because no deployed runtime behavior changes.

Real Email/LINE/payment:

- Not allowed and not involved.

## Reporting Requirements

Report:

- model/effort used
- taskStartedAt
- taskCompletedAt
- totalWallClockDuration
- humanWaitDuration
- netCodexWorkDuration
- gates run/skipped and why
- first failure category if failed

## Recommended Next Task

Return to owner/PM mainline engineering foundation work after this local tooling warning is resolved.
