# ANYU Canonical Report Template

Use this template for new Codex reports. Historical reports do not need broad rewriting. Reports should cite task-relevant outcomes and validation evidence; do not re-copy every shared policy unless it is directly relevant to the result.

```markdown
# <Task Name>

## Metadata

- task name: <task name>
- date: YYYY-MM-DD
- report path: `ai-collaboration/reports/<file>.md`
- commit: <hash or not committed>
- branch / push status: <pushed / not pushed / not applicable>
- model / effort: <model>, <effort>
- taskStartedAt: <ISO timestamp>
- taskCompletedAt: <ISO timestamp>
- totalWallClockDuration: <duration>
- humanWaitDuration: <duration>
- netCodexWorkDuration: <duration>

## Context

- why this task exists: <short explanation>
- upstream blocker / mainline context: <context>
- out-of-scope items: <items>

## Scope

- what changed: <summary>
- what did not change: <summary>

## Implementation Summary

- files / areas changed: <summary>
- key design decisions: <summary>
- local / opportunistic cleanup decisions: <summary or none>

## Validation

- commands run: <commands and results>
- gateStatus: <pass / partial / blocked / failed / not_applicable>
- commandExitCode: <number or not_applicable>
- requiredChecksStatus: <pass / partial / blocked / failed / not_applicable>
- optionalChecksStatus: <pass / partial / blocked / failed / skipped / not_applicable>
- targetDeployCommit: <sha or not_applicable>
- deployedCommitAtGateStart: <sha or not_applicable>
- deployedCommitAtGateEnd: <sha or not_applicable>
- freshnessStatus: <pass / not_asserted / blocked / not_applicable>
- gates skipped and why: <list>

## Safety

- production runtime enabled: yes/no
- payment run: yes/no
- Email sent: yes/no
- LINE sent: yes/no
- Vercel env changed: yes/no
- DB mutated: yes/no
- secrets/private data exposed: yes/no

## Result

- result: <pass / partial / blocked / failed>
- first failure category: <category or not_applicable>
- blocker status: <resolved / remaining blocker / not_applicable>

## Tech Debt / Cleanup Notes

- new technical debt introduced: <note or none>
- existing technical debt observed: <note or none>
- opportunistic cleanup completed: <note or none>
- deferred cleanup candidates: <note or none>

## Decisions Made

- <execution-level decision>

## Uncertainties / Blockers

- <uncertainty / blocker or none>

## Recommended Next Step

<Owner/PM-aligned next task.>

## Paste-Back Context

<Short paragraph that can be pasted into ChatGPT without secrets/private values.>
```

## Correction Notes

If a report corrects a prior report, add a top-level `## Correction Note` section near the top. Do not rewrite historical facts; state exactly what was corrected and why.
