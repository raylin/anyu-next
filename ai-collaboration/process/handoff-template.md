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

## Completion Summary Requirements

Final response must include:

- files changed
- commit hash
- staging push status
- validation results
- gateStatus and commandExitCode separately for deployed gates
- whether runtime/payment/Email/LINE occurred
- recommended next task aligned with owner/PM mainline

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

Env sync must repeat:

- local mirror first
- Vercel sync second
- no values printed
- no Vercel-only secrets
- no cross-sync between staging and production

## Codex Completion Summary Format

```markdown
## Codex Completion Summary

Task:
<task name>

Report:
<report file path>

Summary Log:
<summary log path updated>

Commit:
<commit hash or blocker>

Staging Push:
<pushed to origin/staging or skipped / failed — reason>

Files Changed:
- <file 1>
- <file 2>
- <file 3>

What Changed:
- <key change 1>
- <key change 2>
- <key change 3>

Validation:
- <validation result 1>
- <validation result 2>
- deployed gate freshness: <targetDeployCommit / deployedCommitAtGateStart / deployedCommitAtGateEnd / freshnessStatus / mixedDeploymentDetected / gateStatus / commandExitCode>

Tech Debt / Cleanup Notes:
- New technical debt introduced: <note or none>
- Existing technical debt observed: <note or none beyond previously documented items>
- Opportunistic cleanup completed: <note or none>
- Deferred cleanup candidates: <note or none>
- Recommended follow-up: <note or none>

Decisions Made:
- <execution-level decision 1>
- <execution-level decision 2>
- None

Uncertainties / Blockers:
- <uncertainty or blocker 1>
- <uncertainty or blocker 2>
- None

Recommended Next Step:
<recommended next step>

Needs ChatGPT Review:
Yes / No

Paste-Back Context:
<5-10 lines of context that allow ChatGPT Web to continue without reading the full repo>
```
