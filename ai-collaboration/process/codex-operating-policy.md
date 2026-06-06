# Codex Operating Policy

Date: 2026-06-06

## Purpose

This document stores shared operating rules for Codex work on ANYU so future handoffs can reference common policy instead of repeating it in full.

## Role Split

- Owner/ChatGPT owns PM direction, product baseline, launch gate criteria, and task priority.
- Codex owns execution, implementation detail, repository changes, validation, and factual reporting.
- Codex is not the product strategist and must not move the mainline with its own recommended next step.
- If task direction conflicts with recent owner decisions, stop and ask for clarification.

## Task Ownership

- Complete the requested task end-to-end when feasible.
- Do not broaden product behavior, architecture, env model, payment flow, or provider behavior without explicit owner approval.
- Preserve existing owner decisions and current product source-of-truth.
- Escalate uncertainty when guessing could affect production, env, payment, LINE, Email, data, security, or launch gates.

## Model / Effort

- Use high effort by default for ANYU.
- Use high or xhigh for production smoke, env mirror / Vercel sync, deploy/alias source-of-truth, DB schema/reset, payment, NotifyURL, ReturnURL, processor, LINE, Email, access-link crypto/security, Admin API/CLI, redaction, release gates, and QA suite work.
- Medium is acceptable only for narrow low-risk docs, simple copy, isolated styling with no runtime impact, or targeted local tests with no staging/production side effects.

## Reporting Fields

Every report and final completion summary must include:

- `taskStartedAt`
- `taskCompletedAt`
- `totalWallClockDuration`
- `humanWaitDuration`
- `netCodexWorkDuration`
- model used
- reasoning/effort level used
- environment asserted when applicable
- source/deploy target when applicable
- gates run and result
- gates skipped and why
- first failure category if failed
- final runtime status for production tasks

## First-Failure Classification

Use these categories when a smoke/gate fails:

- `preflight_failed`
- `env_mirror_failed`
- `vercel_source_mismatch`
- `checkout_unavailable`
- `email_save_failed`
- `line_bind_failed`
- `provider_form_failed`
- `payment_failed`
- `notify_failed`
- `processor_failed`
- `generation_failed`
- `email_send_failed`
- `line_send_failed`
- `access_link_failed`
- `admin_lookup_failed`
- `unknown`

Stop at the first hard failure. Do not keep patching or redeploying while the owner waits.

## Owner Standby Rules

- Do not ask the owner to perform manual payment, Email, or LINE checks until preflight gates pass.
- Before owner manual action, verify environment, flags, deploy target, provider config, and relevant gates.
- If a required env, flag, deployment, or provider setting is missing, classify it as preflight failure.
- Real user-channel pass requires owner verification of receipt and link open; provider accepted status alone is partial.

## Completion Summary Requirements

Use the paste-back summary format in `ai-collaboration/process/handoff-template.md`.

Every completion summary must include:

- files changed
- commit hash or blocker
- staging push status
- validation results
- runtime/payment/Email/LINE side effects
- model/effort used
- task timing fields
- first failure category if failed
- recommended next step aligned with owner/PM mainline

## Handoff Style

Low/medium-risk tasks may say:

> Follow `AGENTS.md` and `ai-collaboration/process/codex-operating-policy.md`.

Then include only task-specific scope and validation.

High-risk tasks must reference shared docs and repeat 5-10 task-critical hard rules inline.

Examples:

- Production smoke handoff repeats runtime disabled until gates pass, no owner manual action before preflight, use `pnpm ops` before direct DB, report timing/model/effort, and final runtime status.
- Env sync handoff repeats local mirror first, Vercel sync second, no values printed, and no Vercel-only secrets.
