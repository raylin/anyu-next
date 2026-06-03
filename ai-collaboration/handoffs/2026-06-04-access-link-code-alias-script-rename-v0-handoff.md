# Access Link Code Alias + Script Rename v0 Handoff

Date: 2026-06-04  
Task owner: Codex  
Scope: Code/helper/script/test naming alignment only

## Context

Access Link Technical Naming Alignment Plan v0 recommended a compatibility-first rename path:

- introduce access-link helper/script names first
- keep recovery-named compatibility aliases
- keep `/r/` stable
- introduce `pal_` with `prl_` compatibility if low-risk
- keep `rlb_` LINE bind state prefix temporarily
- defer DB/schema rename to a forward migration

Production DB migrations 0008-0012 are already applied with recovery-named schema. Production runtime remains disabled/fail-closed.

## Goal

Introduce access-link terminology in active code, helper exports, scripts, tests, and active docs while preserving recovery compatibility and without changing DB schema.

## Constraints

- No DB table/column rename.
- No production runtime or env changes.
- No Email or LINE sends.
- No payment provider behavior change.
- Preserve old smoke commands.
- Do not break `prl_` compatibility.
- Do not change `/r/` resolver behavior.

## Planned Work

1. Inspect recovery-named helper/script usage.
2. Add access-link-facing helper aliases around existing implementations.
3. Decide and implement token prefix compatibility if low-risk.
4. Add package script alias `qa:access-link:smoke` while keeping `qa:recovery-link:smoke`.
5. Add/update tests for new aliases and compatibility.
6. Update current docs/dashboard to prefer access-link terminology.
7. Run full validation and commit/push.

## Expected Output

- Access-link helper aliases available.
- Old recovery helper exports remain working.
- `qa:access-link:smoke` works.
- `qa:recovery-link:smoke` still works.
- Report, summary log, dashboard update, commit, staging push.

## Recommended Next Task

Access Link DB Forward Rename Migration Plan / Implementation v0.
