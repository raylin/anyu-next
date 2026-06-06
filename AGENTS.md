# ANYU Codex Operating Rules

These rules apply to all Codex work in this repository. Detailed policies live in `ai-collaboration/process/`.

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
- `ADMIN_API_TOKEN` comes from explicit shell/process env.
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
