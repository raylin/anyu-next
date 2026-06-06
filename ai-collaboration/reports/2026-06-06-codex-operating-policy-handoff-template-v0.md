# Codex Operating Policy + Handoff Template v0

Date: 2026-06-06

## Model / Effort

- Model: Codex
- Effort: high

## Timing

- taskStartedAt: `2026-06-06T15:02:29Z`
- taskCompletedAt: `2026-06-06T15:07:32Z`
- totalWallClockDuration: `5m03s`
- humanWaitDuration: `0m`
- netCodexWorkDuration: `5m03s`

## Files Created / Updated

Created:

- `ai-collaboration/handoffs/2026-06-06-codex-operating-policy-handoff-template-v0-handoff.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/env-mirror-policy.md`
- `ai-collaboration/process/admin-ops-boundary.md`
- `ai-collaboration/process/production-gate-policy.md`
- `ai-collaboration/process/handoff-template.md`

Updated:

- `AGENTS.md`
- `ai-collaboration/dashboard/anyu-project-dashboard.html`
- `ai-collaboration/summaries/summary_log.md`

## Root AGENTS.md Status

Root `AGENTS.md` was replaced with concise ANYU-specific operating rules.

Rules now living there:

- role split
- model/effort defaults
- required timing/model/gate reporting
- env mirror governance
- Admin API / `pnpm ops` boundary
- QA tier policy
- production gate basics
- theme route preservation
- execution workflow

The stale Opportunity Radar / research-project guidance was removed from root `AGENTS.md` because it conflicted with current ANYU operating reality.

## Process Docs Created

### `codex-operating-policy.md`

Detailed rules for:

- role split
- task ownership
- model/effort
- reporting fields
- first-failure classification
- owner standby rules
- completion summary requirements
- future handoff style

### `qa-validation-policy.md`

Detailed rules for:

- validation tiers
- targeted tests
- `qa:module01:mock-flow`
- `qa:module01:ui`
- `qa:module01:staging`
- `qa:module01:production-preflight`
- real provider checks
- structured waits
- no ad hoc heredoc/temp polling

### `env-mirror-policy.md`

Detailed rules for:

- `.env.staging` / `.env.production` definitions
- local mirror first, Vercel sync second
- no Vercel-only secrets
- safe generation categories
- provider credentials Codex must not generate
- stateful crypto rotation requirements
- CLI not reading env mirrors

### `admin-ops-boundary.md`

Detailed rules for:

- Admin API as normal ops boundary
- `pnpm ops lookup-result` usage
- `ADMIN_API_TOKEN` from explicit shell/process env
- CLI no DB/Vercel/Neon/env mirror access
- direct DB allowed only for migration/schema/approved debugging
- required reporting when direct DB is used

### `production-gate-policy.md`

Detailed rules for:

- production smoke preconditions
- production source/deploy assertions
- canonical Vercel project / repo-root deploy rule
- runtime enablement rules
- owner manual action rules
- production result ID source category rules
- final fail-closed default

### `handoff-template.md`

Reusable template includes:

- Task
- Context
- Shared policy references
- Scope
- Do Not
- Task-specific requirements
- Validation selection
- Reporting requirements
- Completion summary requirements
- Recommended next task

It also includes low/medium-risk and high-risk handoff guidance.

## Future Handoff Usage Guidance

Low/medium-risk task style:

- reference `AGENTS.md`
- reference `ai-collaboration/process/codex-operating-policy.md`
- include only task-specific scope, constraints, and validation

High-risk task style:

- reference `AGENTS.md`
- reference relevant process docs
- repeat 5-10 task-critical hard rules inline

Production smoke handoffs should still repeat:

- runtime disabled until preflight pass
- no owner manual action before environment prepared
- use `pnpm ops` before direct DB
- timing/model/effort reporting
- final runtime status

Env sync handoffs should still repeat:

- local mirror first
- Vercel sync second
- no values printed
- no Vercel-only secrets
- no cross-sync between staging and production

## Dashboard / Summary Update

- Dashboard now references shared operating policy docs and the handoff template.
- Summary log now records the policy/template creation and future usage rules.

## Validation Results

- docs presence check: PASS
- dashboard HTML sanity: PASS
- secret/private scan: PASS
- `git diff --check`: PASS

Secret scan note:

- Matches were reviewed as false positives from words like `task-specific` and historical key-name references.
- No secret values, connection strings, tokenized URLs, or private data were added.

## Runtime / Provider Safety

- Runtime UI changed: no
- Payment behavior changed: no
- Vercel env changed: no
- Local env files changed: no
- Production payment run: no
- Email sent: no
- LINE sent: no
- DB migration applied: no

## Remaining Process Tech Debt

- Historical reports and handoffs still contain old process language and should remain historical.
- Existing templates under `ai-collaboration/templates/` may need a future alignment pass if they remain actively used.

## Recommended Next Task

Return to the current engineering mainline after this report is reviewed.
