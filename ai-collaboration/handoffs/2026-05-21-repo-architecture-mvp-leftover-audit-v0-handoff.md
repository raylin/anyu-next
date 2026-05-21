# Handoff: Repo Architecture + MVP Leftover Audit v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run a full repository architecture and MVP-leftover audit after Module 01 reached low-key production launch, UI polish was sealed, local Playwright smoke was added, result cache was live-verified, and scheduled retention cleanup was implemented.

This task should produce a structured report that maps the current repo, identifies active production-critical paths, legacy/MVP leftovers, cleanup candidates, archive candidates, docs sprawl, tooling/test gaps, and security/privacy risks.

This is an audit/reporting task only.

Do not delete files in this task.

Do not move/archive files in this task.

Do not change app behavior, runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

The project has reached an important stabilization point.

Completed major work:

```text
Production low-key launch: GO
Production smoke: passed
Human production smoke: passed
Legal/trust pages: complete
LINE-first funnel: complete
LINE OA setup: complete
Design System v1.1: adopted
Brand Mark v1.1: adopted
Font Migration Phase 1/2/3: complete + QA
Conversion/CTA polish: complete + QA
Final UI review pack: complete
Local Playwright UI smoke: complete
Result cache: live verified
Scheduled retention cleanup: live
```

The user wants to review old MVP leftovers and overall repo organization before moving to larger technical UX work such as polling/async analyze.

Goal:

```text
Audit first, cleanup later.
```

Recommended follow-up after audit:

```text
Repo Cleanup Pass v0
```

## Scope

Do:

1. Map the current repo structure.
2. Identify production-critical active paths.
3. Identify legacy / MVP leftover paths.
4. Identify safe-to-delete candidates.
5. Identify archive candidates.
6. Identify files needing human review before cleanup.
7. Identify docs sprawl and propose a canonical docs structure.
8. Identify stale reports/research that should remain historical vs be indexed.
9. Identify duplicate or stale design/legal/ops docs.
10. Identify scripts/tooling/test leftovers.
11. Identify security/privacy risk candidates.
12. Identify generated artifacts and whether they should remain committed.
13. Produce an audit report and execution report.
14. Append summary log.
15. Commit and push to `origin/staging`.

Do not:

- delete files
- move files
- archive files
- change imports
- change production app code
- change env
- run production actions
- perform cleanup implementation
- rewrite docs substantially
- modify DB/schema
- modify tests except if only creating report references, which usually should not be needed

## Audit Targets

Review the whole repo, including but not limited to:

```text
.
apps/
apps/web/
docs/
docs/design-system/
docs/legal/
docs/operations/
ai-collaboration/
ai-collaboration/handoffs/
ai-collaboration/reports/
ai-collaboration/research/
ai-collaboration/decisions/
ai-collaboration/templates/
ai-collaboration/summaries/
ai-collaboration/inbox/
oradar/
scripts/
drizzle / migrations
public assets
tests
legacy/prototype folders if present
Dcard or old research scripts if present
```

If folders do not exist, document that.

## Key Questions

Answer these:

```text
1. What is active production code?
2. What is staging/production ops code?
3. What is canonical documentation?
4. What is historical evidence and should remain?
5. What appears to be old MVP/prototype material?
6. What appears unused but requires confirmation?
7. What is safe to delete now?
8. What should be archived rather than deleted?
9. What should remain untouched?
10. What cleanup should be done before ads / broader traffic?
```

## Classification System

Classify findings into:

```text
KEEP_ACTIVE
KEEP_REFERENCE
KEEP_HISTORICAL
ARCHIVE_CANDIDATE
DELETE_CANDIDATE
NEEDS_HUMAN_REVIEW
SECURITY_REVIEW
TECH_DEBT
```

Use conservative classification.

If uncertain, use:

```text
NEEDS_HUMAN_REVIEW
```

Do not mark for deletion unless confidence is high.

## Required Report

Create:

```text
ai-collaboration/research/2026-05-21-repo-architecture-mvp-leftover-audit-v0.md
```

Required sections:

```markdown
# Repo Architecture + MVP Leftover Audit v0

Date: 2026-05-21

## 1. Summary

## 2. Audit Method

## 3. Top-Level Repository Map

## 4. Production-Critical Active Paths

## 5. Staging / Production Ops Paths

## 6. Active Product Documentation

## 7. Historical / Evidence Artifacts

## 8. Design-System / Brand Asset Structure

## 9. Legal / Trust Documentation Structure

## 10. AI Collaboration Artifact Structure

## 11. Scripts / Tooling / Tests

## 12. Legacy / MVP Leftover Candidates

## 13. Safe Delete Candidates

## 14. Archive Candidates

## 15. Needs Human Review

## 16. Security / Privacy Risk Scan

## 17. Generated Assets / Large Files

## 18. Documentation Sprawl Findings

## 19. Test / Tooling Gaps

## 20. Recommended Cleanup Plan

## 21. Proposed Cleanup Pass Scope

## 22. What Not To Touch

## 23. Recommended Next Step
```

## Section Requirements

### 1. Summary

Include:

```text
high-level repo health
whether immediate cleanup risk is low/medium/high
whether any secret/raw-data risk was found
top 5 recommended cleanup actions
```

### 2. Audit Method

Document commands/approaches used.

Suggested:

```bash
git status --short
find . -maxdepth 3 -type d
find . -maxdepth 4 -type f | sort
rg -n "TODO|FIXME|deprecated|legacy|MVP|prototype|Dcard|oradar|DATABASE_URL|ANTHROPIC_API_KEY|LINE_CHANNEL|secret|password|BEGIN PRIVATE|raw input|real contact"
rg -n "from .*prototype|import .*legacy|unused" apps/web/src
```

Do not paste secret values if found.

### 3. Top-Level Repository Map

For each top-level folder:

```text
purpose
active/reference/historical
cleanup risk
notes
```

### 4. Production-Critical Active Paths

Include likely active paths:

```text
apps/web/src/app
apps/web/src/components
apps/web/src/lib
apps/web/src/styles
apps/web/public
apps/web/drizzle
apps/web/e2e
apps/web/src/tests
apps/web/vercel.json
```

Adjust based on actual repo.

### 5. Staging / Production Ops Paths

Include:

```text
docs/operations
ai-collaboration/decisions
production runbooks
Vercel / cron config
retention cleanup
Playwright local smoke
```

### 6–10 Docs / Artifacts

Differentiate:

```text
canonical docs
human-reviewed source docs
reference docs
historical handoffs/reports
review bundles
decisions
templates
summary logs
```

Do not recommend deleting handoffs/reports unless there is a clear policy.

### 12. Legacy / MVP Leftover Candidates

Find old code/prototypes/scripts.

For each candidate, include:

```markdown
| Path | Classification | Why It Looks Legacy | Risk If Removed | Recommendation |
|---|---|---|---|---|
```

### 13. Safe Delete Candidates

Only include high-confidence items.

Examples:

```text
unused temp files
duplicate generated artifacts
stale build outputs accidentally committed
test artifacts
empty obsolete files
```

Do not include historical collaboration reports as safe delete unless explicitly redundant.

### 14. Archive Candidates

For things worth preserving but not active:

```text
old prototype
old design explorations
old research scripts
legacy app route
obsolete MVP docs
```

Suggest archive path:

```text
archive/2026-05-mvp-leftovers/
```

or:

```text
docs/archive/
```

Do not actually move.

### 15. Needs Human Review

List uncertain items.

### 16. Security / Privacy Risk Scan

Search for:

```text
.env
.env.local
DATABASE_URL
ANTHROPIC_API_KEY
LINE secrets
real email
real LINE ID
raw private input
provider raw output
DB row dumps
font files
large screenshots with private content
```

Report:

```text
risk found: yes/no
path only
description
recommended action
```

Do not paste secret or raw content.

### 17. Generated Assets / Large Files

Review:

```text
brand PNG exports
screenshots
public icons
Playwright artifacts
reports
```

Recommend keep/delete/archive.

### 18. Documentation Sprawl Findings

Identify docs that may need indexing.

Possible recommendation:

```text
docs/README.md or docs/INDEX.md
ai-collaboration/README.md
docs/design-system/README.md already exists
docs/operations/README.md already exists
```

### 19. Test / Tooling Gaps

Review:

```text
Vitest
Playwright local-only
brand export script
retention cleanup tests
cache tests
migration discipline
```

Identify gaps.

### 20. Recommended Cleanup Plan

Prioritize:

```text
P0: safety/security cleanup
P1: safe delete / archive
P2: docs index
P3: refactor / consolidation
```

### 21. Proposed Cleanup Pass Scope

Recommend the next handoff:

```text
Repo Cleanup Pass v0
```

Specify a safe initial cleanup scope.

### 22. What Not To Touch

Include:

```text
production-critical app code
migrations
legal docs
final launch decisions
design-system canonical docs
brand source assets
current e2e/tests
production runbooks
historical reports unless archived by policy
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-repo-architecture-mvp-leftover-audit-v0-execution-report.md
```

Report structure:

```markdown
# Repo Architecture + MVP Leftover Audit v0 Execution Report

## Summary

## Files Created

## Files Updated

## Audit Coverage

## Key Findings

## Safety / Security Findings

## Cleanup Recommendations

## Validation Results

## Known Technical Debt

## Tech Debt Review

### New Technical Debt Introduced

### Existing Technical Debt Observed

### Opportunistic Cleanup Completed

### Deferred Cleanup Candidates

### Recommended Follow-up

## Deviations From Handoff

## Git Commit

## Staging Push

## Remaining Uncertainties

## Recommended Next Step
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

Include:

- date
- task completed
- audit report path
- key findings
- validation result
- commit hash
- staging push status

## Validation

Run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

This is docs/report only, but validation should still pass.

No need to run Playwright unless app code changes, which should not happen.

## Constraints

Do not implement:

```text
file deletion
file moves
archive moves
code refactors
runtime changes
DB schema changes
ads launch
real payment
LINE API
LIFF
auth
portal
model switch
async polling
streaming
UI changes
```

Do not modify:

```text
production app code
product prompt/schema
DB schema
provider/model
legal semantics
design system assets
LINE funnel behavior
production ops behavior
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: audit repo architecture leftovers"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- audit report path
- key findings
- security/privacy scan summary
- cleanup recommendations
- validation results
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
