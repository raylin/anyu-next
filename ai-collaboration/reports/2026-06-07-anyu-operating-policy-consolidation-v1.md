# ANYU Operating Policy Consolidation v1

## Metadata

- task name: ANYU Operating Policy Consolidation v1
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-anyu-operating-policy-consolidation-v1.md`
- commit: not committed at report creation
- branch / push status: not pushed at report creation
- model / effort: GPT-5 Codex, high
- taskStartedAt: 2026-06-07T10:45:57Z
- taskCompletedAt: 2026-06-07T10:49:47Z
- totalWallClockDuration: 3m50s
- humanWaitDuration: 0m
- netCodexWorkDuration: 3m50s

## Context

- why this task exists: repeated env, QA, deploy, smoke, Admin/Ops, runtime config, and report-format failures had produced many overlapping rules.
- upstream blocker / mainline context: owner feedback requested fewer higher-priority principles so Codex is guided by quality and PM mainline rather than isolated task-level “next step” text.
- out-of-scope items: runtime/product code changes, payment behavior, scoped runtime config behavior, Vercel env, DB changes, real Email/LINE/payment, Module 02, theme UI, and historical report rewrites.

## Scope

- what changed: consolidated policy hierarchy, clarified precedence, shortened handoff guidance, and added action-oriented QA/production validity wording.
- what did not change: concrete hard operational requirements remain in place, including local mirror first / Vercel sync second, Admin API + `pnpm ops` before direct DB, no production-as-diagnostics, deployed freshness fields, scoped runtime config as primary runtime gate, no ad hoc heredoc scripts, and owner approval for real Email/LINE/payment.

## Implementation Summary

- files / areas changed: `AGENTS.md`, process policy docs, handoff/report templates, summary log, dashboard, and task handoff/report.
- key design decisions: make `AGENTS.md` the top-level policy hub; keep detailed process docs as operational implementation detail; prevent future handoffs from copying every shared rule.
- local / opportunistic cleanup decisions: refactored wording only; no historical report rewrites.

## Principles Added

1. Quality before apparent progress.
2. Production is acceptance, not diagnosis.
3. Validation must be structured and target-correct.
4. Ops boundary and runtime config ownership.
5. Tests must reduce manual standby.
6. Tech debt must have lifecycle.

## Rule Precedence Added

1. Safety and correctness override speed.
2. Owner/PM mainline overrides Codex recommended next step.
3. If task goal conflicts with process rule, stop and ask or choose the safer interpretation.
4. Production smoke cannot be used to diagnose a path that staging/local can reasonably test.
5. A validation result is not accepted unless its target environment, target commit, and gate status are clear.
6. Optional cleanup is not vague: either include it, explicitly defer it, or ask owner.

## Duplicated Rules Removed / Refactored

- `codex-operating-policy.md` now references AGENTS.md for precedence instead of maintaining a separate conflict hierarchy.
- `handoff-template.md` now provides a standard short shared-policy block instead of listing every process doc in every handoff.
- `qa-validation-policy.md` now starts with an action-oriented selection list and keeps detailed tiers below it.
- `production-gate-policy.md` now has a compact production smoke validity checklist before the detailed runbook.
- `env-mirror-policy.md` and `admin-ops-boundary.md` now reference the top-level ownership principles without changing their concrete rules.
- `report-template.md` now explicitly discourages re-copying all shared policy into reports.

## QA / Production Policy Clarification

- QA policy now says targeted/local first, mock-flow and Playwright before staging when possible, staging for deployed integration proof, production only for final acceptance, and real channels require owner approval.
- QA policy keeps the shared-failure rule: if Email and LINE both fail, inspect shared access-link save/contact logic first and use Email as minimal automation.
- Production policy now defines invalid smoke evidence: stale/unknown/mixed deploy, missing staging/local proof when possible, command exit code used as gate status, unproven runtime window, or fixture cache hit.
- Production policy keeps scoped runtime config as the runtime gate and preserves tracked fresh fixture requirements.

## Handoff Template Update

Future handoffs should use:

```markdown
Shared policy:
Follow `AGENTS.md` and `ai-collaboration/process/*.md`.

This task-specific handoff only repeats high-risk rules that are directly relevant.
```

Low-risk docs/code tasks should list only task-specific validation and hard constraints. High-risk production/env/payment/LINE/Admin tasks must still repeat the 5-10 directly relevant hard rules inline.

## Validation

- commands run: docs presence check, dashboard HTML sanity, secret/private scan, `git diff --check`
- gateStatus: pass
- commandExitCode: 0
- requiredChecksStatus: pass
- optionalChecksStatus: not_applicable
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why: app tests/build/staging/production gates skipped because this was docs/process-only with no runtime code change.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: no
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: process hierarchy clarified; no runtime blocker addressed by this docs-only task.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none
- existing technical debt observed: some historical dashboard sections remain long because broad historical rewrite was out of scope.
- opportunistic cleanup completed: process docs now point to AGENTS.md principles and future handoffs can be shorter.
- deferred cleanup candidates: future QA Foundation Follow-up v2 can further prune old dashboard history and stale “current” wording.

## Decisions Made

- AGENTS.md is the highest-level operating source.
- Detailed process docs preserve hard rules but should not be copied wholesale into every task.
- Current engineering mainline remains unchanged by this policy cleanup.

## Uncertainties / Blockers

- none for this docs-only task.

## Recommended Next Step

Return to the current engineering task result review, then continue with the staged/local fix path before any production smoke.

## Paste-Back Context

ANYU Operating Policy Consolidation v1 adds six top-level AGENTS.md principles, clarifies rule precedence, trims duplicated policy wording, updates the handoff template for shorter future task briefs, and preserves concrete hard rules around env mirrors, Admin/Ops, deployed freshness, scoped runtime config, no ad hoc scripts, and owner-approved real providers. No runtime/product behavior changed.
