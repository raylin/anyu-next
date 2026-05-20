# Opportunity Radar Agent Operating Rules

## Project Purpose

Opportunity Radar is a local-first, AI-native qualitative market research engine for founder research.

The repository exists to help detect emotional market signals, structure them into AI-readable schemas, and support iterative MVP discovery. It focuses on:

- emotional signals
- recurring anxieties
- monetizable behaviors
- viral social patterns
- retention and shareability clues

This is an exploratory research system, not a production SaaS app.

## Collaboration Workflow

The collaboration model is:

- ChatGPT: strategy, specification, review
- Codex: execution, repository changes, reporting
- Human: clarification, judgment, architecture approval

Codex must behave as an implementation agent. Codex is not the product strategist and not the architecture authority.

Architecture decisions require human approval before implementation.

## Mandatory Execution Workflow

For every future task, Codex must:

1. Save a handoff first in `ai-collaboration/handoffs/`.
2. Execute the requested changes.
3. Generate an execution report in `ai-collaboration/reports/`.
4. Append `ai-collaboration/summaries/summary_log.md`.
5. Create a git commit containing the completed handoff changes.
6. Push the completed commit to `origin/staging` when validation and safety checks pass.
7. End the final CLI response with a paste-back completion summary.
8. Escalate uncertainties instead of guessing.
9. Never silently change schemas.

After every completed handoff, Codex must create a git commit containing the completed changes.

## Git Commit And Staging Push Rule

Every completed handoff should end with:

1. Run required validation.
2. Confirm `git status --short`.
3. Ensure no secrets, `.env`, raw user data, or unrelated changes are staged.
4. Commit task changes with a clear message.
5. Push the completed commit to the `staging` branch:

   ```bash
   git push origin HEAD:staging
   ```

6. Include both commit hash and push status in the final Codex Completion Summary.

If push is skipped or fails, report the reason clearly and do not claim staging was updated.

## Tech Debt And Cleanup Policy

Codex should not leave obvious technical debt just to reduce implementation effort.

For each handoff:

1. Fix small, obvious, low-risk technical debt when it is inside the task scope.
2. Do not broaden product behavior or architecture without explicit approval.
3. Document new technical debt introduced by the task.
4. Document existing technical debt observed during the task.
5. Document opportunistic cleanup completed.
6. Document deferred cleanup candidates.
7. Recommend follow-up cleanup only when it materially improves maintainability, extensibility, quality, or launch safety.

Small cleanup is encouraged.
Over-design is not.
Silent large refactors are not allowed.

Allowed opportunistic cleanup examples:

- remove dead comments
- fix obvious typo
- remove unused import
- consolidate duplicate helper within the same touched file
- improve naming in touched code if low-risk
- add a missing test for a helper being touched
- update a stale README sentence in the touched area
- fix a small accessibility attribute issue
- align copy/docs with current behavior

Not allowed without explicit scope or approval:

- DB schema redesign
- provider/model routing change
- auth/payment architecture
- moving major folders
- rewriting the component system
- changing product prompt/schema semantics
- changing privacy/data retention behavior
- switching analytics/event strategy
- large design-system rewrite
- changing the production/staging deployment model

Commit requirements:

- Run relevant validation before committing.
- Include the handoff, report, summary log, and changed project files in the commit.
- Use a clear commit message in the format `<type>: <short task summary>`.
- Mention the commit hash in the final Codex Completion Summary.
- Push the completed commit to `origin/staging` unless blocked by validation failure, unrelated uncommitted changes, secrets risk, unclear branch state, missing remote access, missing `staging` branch without user approval to create it, or explicit user instruction not to push.
- Never use `git push --force` unless the user explicitly requests it.
- If a git commit cannot be created, document the reason under blockers.
- If pre-existing unrelated uncommitted changes are present, do not silently include them; document the situation and ask for human guidance.

## Execution Constraints

Codex must:

- keep workflows markdown-first
- keep architecture local-first
- optimize for rapid iteration
- optimize for AI-readable context persistence
- prefer simple files, folders, and explicit logs over hidden state
- preserve research context and rationale

Codex must not introduce:

- cloud infrastructure
- authentication systems
- vector databases
- Kubernetes
- microservices
- unnecessary abstractions
- scraping, UI, dashboards, or app code unless explicitly requested later

## Architecture Philosophy

Opportunity Radar should remain boring, inspectable, and easy to modify.

Default choices:

- Markdown for operating memory, handoffs, reports, decisions, and research notes
- JSON Schema for structured extraction contracts
- Plain files for raw and structured outputs
- Small scripts only when repeated manual work becomes costly
- Local execution before any external service

Avoid abstractions until repeated use proves they are necessary.

## Markdown-First Rule

Project knowledge must be saved in markdown whenever possible.

Use markdown for:

- handoffs
- execution reports
- research notes
- decision logs
- summaries
- prompt documentation
- operating agreements
- collaboration templates under `ai-collaboration/templates/`

Use structured data formats only where structure is the artifact, such as JSON schemas or extracted signal JSON.

## Local-First Rule

All workflows should run locally by default and store artifacts in this repository.

Do not add external services, hosted databases, cloud queues, background workers, or managed AI infrastructure without explicit human approval.

## Reporting Requirements

Every execution report must include:

- completed work
- architecture decisions
- blockers
- uncertainties
- tech debt review
- suggested next steps

Reports should be concise, factual, and written for the next human or AI collaborator.

## Production Deployment Rule

Completed handoffs may flow into `origin/staging` when validation and safety checks pass.

Production deployment is a separate, manual workflow.

- Never treat a completed handoff as automatic approval for production.
- Production deploy requires explicit human approval.
- Production deploy requires a separate launch decision record.
- Production env changes, production DB migration, and production alias changes must be treated as manual operational steps.

Canonical production guidance lives in:

- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/templates/production_launch_decision_template.md`

## Paste-Back Completion Summary

Every Codex task must end the final CLI response with this paste-back completion summary. The purpose is to give the human a compact review packet that can be pasted into ChatGPT Web.

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

## Summary Logging Requirements

After every task, append `ai-collaboration/summaries/summary_log.md` with:

- date
- completed changes
- learnings
- unresolved questions

The summary log is persistent agent memory. It should preserve enough context for a future agent to continue without re-discovering the repository history.

Root-level `summary_log.md` is deprecated. Do not append to it for future work.

## Templates Directory

Canonical collaboration templates live in `ai-collaboration/templates/`.

Use this directory for handoff, execution report, and decision log templates. Root-level `templates/` is deprecated and must not be treated as canonical.

## Research Logging System

Research artifacts should be saved under `ai-collaboration/research/` unless they are raw or structured extraction outputs.

Use:

- `sources/` for source descriptions, source lists, or source-specific notes
- `outputs/raw/` for raw captured inputs
- `outputs/structured/` for extracted signal JSON
- `ai-collaboration/research/` for synthesis notes and observations

Do not collect content for its own sake. Extract signals.

## Signal Extraction Foundation

Opportunity Radar is not primarily collecting content. It extracts:

- emotions
- pain points
- behavioral patterns
- monetization signals
- retention likelihood
- shareability potential

The canonical initial schema is `schemas/signal_schema_v1.json`.

The initial emotion taxonomy is `schemas/emotion_taxonomy_v1.md`.

The initial extraction prompt is `prompts/extraction_prompt_v1.md`.

Signal Extraction v1 uses a strict output boundary:

- one raw input file produces one structured signal JSON object
- multiple signal records per raw input are out of scope until a future version

Signal Extraction v1 supports only manual or semi-manual source types:

- `manual_paste`
- `dcard_manual`
- `reddit_manual`

Do not implement scraping or automatic source collection for Signal Extraction v1.

## Schema Change Policy

Schemas are contracts.

Codex must not silently modify schemas. Any schema change requires:

1. a human-approved reason
2. a decision log entry in `ai-collaboration/decisions/`
3. a version change or explicit migration note
4. an execution report calling out the change

When uncertain whether a change is schema-level or implementation-level, escalate before editing.

## Escalation Rules

Escalate to the human when:

- architecture direction is unclear
- schema fields, scoring scales, or required values may change
- research collection boundaries are unclear
- a task would introduce cloud infrastructure or persistent services
- a task would add scraping, UI, dashboards, auth, or databases
- the requested implementation conflicts with these operating rules
- a `staging` push is required but the branch does not exist and the user has not approved creating it

Escalation should be concise and include the decision needed.
