# Paste-Back Summary Rule Execution Report

## Summary

Added a required paste-back completion summary rule to the Opportunity Radar collaboration workflow.

Every future Codex task must now produce:

1. a full report saved under `ai-collaboration/reports/`
2. an appended canonical summary log entry at `ai-collaboration/summaries/summary_log.md`
3. a concise paste-back completion summary in the final CLI response

No product features were implemented.

## Files Updated

- `AGENTS.md`
- `WORKING_AGREEMENT.md`
- `README.md`
- `templates/execution_report_template.md`
- `templates/handoff_template.md`
- `ai-collaboration/summaries/summary_log.md`

Additional file created:

- `ai-collaboration/handoffs/2026-05-16-paste-back-summary-rule-handoff.md`
- `ai-collaboration/reports/2026-05-16-paste-back-summary-rule-execution-report.md`

Note: the requested template paths referenced `ai-collaboration/templates/`, but the repository currently uses root `templates/`. The existing canonical templates were updated instead of creating a parallel template directory.

## Rule Added

Every final Codex CLI response must include this paste-back completion summary:

```markdown
## Codex Completion Summary

Task:
<task name>

Report:
<report file path>

Summary Log:
<summary log path updated>

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

## Why This Matters

ChatGPT Web and Codex CLI do not automatically share repository state. The paste-back summary gives the human a compact review packet that can be copied into ChatGPT Web after each Codex task.

The repository remains the source of truth, while the final CLI response becomes a portable review bridge.

## Remaining Uncertainties

- None for this workflow-rule update.

## Readiness for Next Task

Ready.

Signal Extraction v1 remains ready to proceed from a foundation perspective. Future tasks should follow the full workflow: handoff, execution, report, canonical summary log, and paste-back completion summary.

