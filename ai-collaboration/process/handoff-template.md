# ANYU Handoff Template

Use this template for future Codex tasks. Keep low-risk handoffs short by referencing shared policies. Repeat task-critical hard rules inline for high-risk work.

```markdown
# <Task Name> Handoff

Date: YYYY-MM-DD

## Task

<One-paragraph task goal.>

## Context

- <Current state fact>
- <Relevant owner decision>
- <Known blocker or prior result>

## Shared Policy References

Follow:

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`

If env/Vercel is involved, also follow:

- `ai-collaboration/process/env-mirror-policy.md`

If Admin/Ops is involved, also follow:

- `ai-collaboration/process/admin-ops-boundary.md`

If production is involved, also follow:

- `ai-collaboration/process/production-gate-policy.md`

## Scope

- <Included work>
- <Included work>

## Do Not

- <Task-specific prohibition>
- <Task-specific prohibition>

For high-risk tasks, repeat 5-10 critical hard rules inline here even if they live in shared policy.

## Task-Specific Requirements

1. <Requirement>
2. <Requirement>
3. <Requirement>

## Validation Selection

Run:

- <command and reason>

Skip:

- <gate skipped and reason>

Real Email/LINE/payment:

- <not allowed / owner-approved only / explicitly approved>

For deployed staging/production gates, include:

- targetDeployCommit: <sha or not applicable>
- freshness command: `qa:deploy:freshness -- --env <env> --expected-commit <sha>`
- substantive gate command only after freshness passes
- no repeated full-gate polling

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
- task-specific outcome fields

For deployed gates, also report:

- codeFixCommit
- reportCommit
- targetDeployCommit
- deployedCommitAtGateStart
- deployedCommitAtGateEnd
- freshnessStatus
- mixedDeploymentDetected
- gateStatus
- commandExitCode
- requiredChecksStatus
- optionalChecksStatus

For production runtime-window tasks, also report:

- runtimeWindowAction
- runtimeWindowStateCategory
- aliasGuardStatus
- runtime config keys planned or changed, names only
- whether runtime was enabled
- whether provider credentials/env values were touched

Use the canonical report format in `ai-collaboration/process/report-template.md`.

## Completion Summary Requirements

Final response must use the canonical Codex Completion Summary schema below. Do not use informal “Implemented and pushed …” prose as the only completion summary.

## Recommended Next Task

<Owner/PM-aligned next task, or "Hold for owner decision".>
```

## Low / Medium Risk Handoff Style

Use:

> Follow `AGENTS.md` and `ai-collaboration/process/codex-operating-policy.md`.

Then include only task-specific validation and hard constraints.

## High-Risk Handoff Style

Reference shared policies and repeat critical task rules inline.

Production smoke must repeat:

- runtime disabled until preflight pass
- no owner manual action before environment prepared
- use `pnpm ops` before direct DB
- report timing/model/effort
- final runtime status
- runtime-window helper status/plan result

Env sync must repeat:

- local mirror first
- Vercel sync second
- no values printed
- no Vercel-only secrets
- no cross-sync between staging and production

## Codex Completion Summary Format

```markdown
## Codex Completion Summary

Task: <task name>

Report: <path>

Commit: <hash>

Staging Push:
<pushed / not pushed / not applicable>

Model / Effort: <model>, <effort>

Timing:

* taskStartedAt:
* taskCompletedAt:
* totalWallClockDuration:
* humanWaitDuration:
* netCodexWorkDuration:

Files Changed:

* <file 1>
* <file 2>

What Changed:

* <key change 1>
* <key change 2>

Validation:

* <validation result 1>
* <validation result 2>

Gate Status:

* gateStatus:
* commandExitCode:
* requiredChecksStatus:
* optionalChecksStatus:
* freshnessStatus / deployed commit fields if applicable:

Safety:

* Production runtime enabled:
* Payment run:
* Email sent:
* LINE sent:
* Vercel env changed:
* DB mutated:
* Secrets/private data exposed:

Tech Debt / Cleanup Notes:

* New technical debt introduced:
* Existing technical debt observed:
* Opportunistic cleanup completed:
* Deferred cleanup candidates:

Decisions Made:

* <decision>

Uncertainties / Blockers:

* <uncertainty or blocker>

Recommended Next Step:
<recommended next step>

Needs ChatGPT Review:
Yes / No

Paste-Back Context:
<short paragraph, no secrets/private values>
```
