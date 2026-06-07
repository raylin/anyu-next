# ANYU Codex Operating Rules

These rules apply to all Codex work in this repository. Detailed policies live in `ai-collaboration/process/`.

## Top-Level Operating Principles

### 1. Quality before apparent progress

- Prioritize foundation quality, predictable validation, and maintainability over apparent progress.
- If a task exposes foundation weakness, pause feature work or production smoke and fix the foundation instead of continuing trial-and-error.

### 2. Production is acceptance, not diagnosis

- Production smoke is final acceptance only.
- If staging/local/mock can reasonably reproduce a payment, access-link, LINE, or Email path, validate there first.
- Stale production deploy evidence is invalid.

### 3. Validation must be structured and target-correct

- Deployed gates must assert target commit freshness before substantive checks.
- Report `commandExitCode`, `gateStatus`, `requiredChecksStatus`, `optionalChecksStatus`, and deploy commit fields separately.
- Full suites must not be used as deployment polling.

### 4. Ops boundary and runtime config ownership

- Operational state should go through Admin API + `pnpm ops`.
- Runtime gates use scoped DB-backed runtime config, not Vercel env toggles.
- Env mirrors are for static/server config and secrets, not frequent runtime switching.

### 5. Tests must reduce manual standby

- Prefer fixtures, mock-flow, Playwright, route/integration tests, and Admin/Ops diagnostics.
- Avoid dynamic scripts, temp-file polling, manual owner feedback, or real provider checks unless explicitly owner-approved and necessary.

### 6. Tech debt must have lifecycle

- Optional/deferred cleanup must be explicit.
- If unsure whether to include cleanup, ask owner before implementation.
- Safe directly-related tech debt may be fixed during the task.
- Diagnostic tools and compatibility paths need lifecycle/cleanup plans.

## Rule Precedence

1. Safety and correctness override speed.
2. Owner/PM mainline overrides Codex recommended next step.
3. If task goal conflicts with process rule, stop and ask or choose the safer interpretation.
4. Production smoke cannot be used to diagnose a path that staging/local can reasonably test.
5. A validation result is not accepted unless its target environment, target commit, and gate status are clear.
6. Optional cleanup is not vague: either include it, explicitly defer it, or ask owner.

## Role Split

- Owner/ChatGPT holds PM direction, product baseline, task priority, and gate criteria.
- Codex acts as EM / implementation agent.
- Codex recommended next steps must not override the owner/PM mainline.
- If a task conflicts with recent owner decisions, stop and ask for clarification.

## Model / Effort

- Use high effort by default for ANYU.
- Use high or xhigh for production, env/Vercel, payment, NotifyURL/ReturnURL, processor, LINE, Email, access-link crypto, Admin API/CLI, security/redaction, release gate, and QA suite work.
- Medium is only acceptable for narrow low-risk docs, copy, isolated local styling, or simple tests with no runtime/env/provider impact.

## Required Reporting

Every report and completion summary must include:

- `taskStartedAt`
- `taskCompletedAt`
- `totalWallClockDuration`
- `humanWaitDuration`
- `netCodexWorkDuration`
- model used
- reasoning/effort level used
- gates run/skipped and why
- first failure category if failed

Use `ai-collaboration/process/report-template.md` for reports and the canonical Codex Completion Summary schema in `ai-collaboration/process/handoff-template.md`. Report `commandExitCode`, `gateStatus`, `requiredChecksStatus`, and `optionalChecksStatus` separately when gates are involved.

## Env Governance

- `apps/web/.env.staging` is the local server mirror/source for Vercel Preview(staging).
- `apps/web/.env.production` is the local server mirror/source for Vercel Production.
- Local mirror first, Vercel sync second.
- Never create Vercel-only secrets.
- Never print secret values, lengths, prefixes, suffixes, hashes, checksums, connection strings, or tokenized URLs.
- `pnpm ops` / Admin CLI must not read app env mirror files.

## Admin / Ops Boundary

- Use Admin API + `pnpm ops` for normal support/result/payment/access-link state.
- Supported lookup:
  - `pnpm ops lookup-result --env staging --id <resultId>`
  - `pnpm ops lookup-result --env production --id <resultId>`
- `ADMIN_API_TOKEN` for `pnpm ops` comes from explicit shell/process env first, then `~/.anyu/credentials.json`.
- `pnpm ops` / Admin CLI must not read app env mirror files.
- Do not use direct DB support lookup except for migrations, schema verification, aggregate preflights, or explicitly approved root-cause debugging.
- If direct DB is used, report why Admin API/CLI was insufficient.

## QA Policy

- Do not default to staging smoke.
- Use targeted tests, `qa:module01:mock-flow`, and `qa:module01:ui` before staging when possible.
- Use `qa:module01:staging` for deployed integration/release-candidate checks.
- Deployed staging/production gates must assert target commit freshness before substantive checks; stale or mixed-deployment runs are invalid evidence.
- Real Email, LINE, and credit-card payment require explicit owner approval.
- Do not use ad hoc heredoc scripts, random temp-file handoffs, or repeated full-suite polling as normal QA.
- Use structured helpers such as `qa:module01:wait-result`.

## Production Gate Rules

- Production runtime stays disabled unless the task explicitly authorizes controlled smoke.
- Before production runtime enablement, run and report:
  - `qa:module01:local`
  - `qa:module01:staging`
  - `qa:module01:production-preflight`
- Use the production runtime-window helper for status/plan before runtime enablement; do not manually toggle flags without the guarded process.
- Assert production environment/source before reporting production result IDs.
- Production result IDs must include `resultSourceCategory=production_runtime` unless explicitly stated otherwise.
- Default final posture after smoke is fail-closed unless owner explicitly chooses soft public availability.

## Theme Route Preservation

- Theme Architecture assets are archived and accepted as visual architecture reference.
- Hybrid Theme Park Model and Module 01 Riso-only remain the future design implementation track.
- Production/payment/env work must not discard or supersede the theme route.

## Execution Workflow

- Save a handoff first in `ai-collaboration/handoffs/`.
- Execute the task.
- Create a report in `ai-collaboration/reports/`.
- Append `ai-collaboration/summaries/summary_log.md`.
- Run required validation.
- Commit only intended files.
- Push to `origin/staging` when validation and safety checks pass.
- End with the Codex Completion Summary from the process docs/template.
