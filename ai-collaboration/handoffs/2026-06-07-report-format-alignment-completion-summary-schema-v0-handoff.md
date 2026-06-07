# Report Format Alignment + Completion Summary Schema v0 Handoff

## Task

Standardize ANYU report and Codex completion summary formats so future tasks produce structured, auditable, comparable outputs before the next high-risk production smoke.

## Shared Policy References

Follow:

- `AGENTS.md`
- `ai-collaboration/process/codex-operating-policy.md`
- `ai-collaboration/process/handoff-template.md`
- `ai-collaboration/process/qa-validation-policy.md`
- `ai-collaboration/process/production-gate-policy.md`

## Scope

- Process docs and templates.
- Dashboard and summary references.
- Optional latest-report formatting note if safe.

## Do Not

- Do not modify runtime/product code.
- Do not enable production runtime or checkout.
- Do not run production payment.
- Do not send Email or LINE.
- Do not modify Vercel env.
- Do not mutate DB data or apply migrations.
- Do not rewrite historical reports broadly.
- Do not commit secrets/private data.

## Validation Selection

Run:

- docs presence check
- dashboard HTML sanity
- secret/private scan
- `git diff --check`

Skip:

- app tests/build because this is docs/process-only.
- production/staging gates because no runtime, deployed, env, or product behavior changes.

## Reporting Requirements

Use the new canonical completion summary format in the final response.
