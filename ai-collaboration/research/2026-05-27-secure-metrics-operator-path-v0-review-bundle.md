# Secure Metrics Operator Path v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Implemented the low-complexity Option A path: enhanced `module01:metrics` CLI guardrails plus runbook updates. No public metrics endpoint, admin UI, schema change, or product behavior change was introduced.

## 2. Current Metrics Workflow Risk

Before this task, the metrics CLI was aggregate-only and excluded operator traffic by default, but target selection was implicit. That made production/staging runs depend on careful operator confirmation of the active `DATABASE_URL`.

## 3. Chosen Operator Path

Chosen path: enhanced local CLI guardrails.

Reasons:

- keeps metrics access local/operator-controlled
- avoids adding a sensitive web endpoint
- preserves existing aggregate calculations
- makes production intent explicit through CLI flags

## 4. CLI / Runbook Changes

Added CLI options:

- `--target local|staging|production`
- `--confirm-production`
- `--base-url <url>`
- `--dry-run`

The report now includes target metadata and optional safe health marker fields.

## 5. Target Confirmation Behavior

Production metrics require:

```bash
corepack pnpm module01:metrics --target production --confirm-production
```

If target is omitted, the CLI defaults to `local` and marks report metadata as default-local.

## 6. Health Marker Integration

When `--base-url` is provided, the CLI fetches `<base-url>/api/health` and includes only safe build marker fields:

- `app`
- `environment`
- `gitCommit`
- `gitBranch`
- `buildTime`
- `deploymentProvider`
- `versionSource`

Fetch failures are represented as safe error categories and do not expose raw response bodies.

## 7. Output Privacy Guardrails

The CLI now applies forbidden-output checks to both markdown and JSON report output. It rejects generated report text containing forbidden operational keys such as database URL names, provider keys, LINE credential names, raw input keys, paid result JSON keys, token keys, or LINE ID token keys.

## 8. Tests Added

Added tests for:

- production target confirmation
- staging/local target parsing
- target and health marker metadata in markdown and JSON
- health marker fetch success and failure with mocked fetch
- forbidden output guard behavior
- existing operator traffic exclusion/inclusion behavior

## 9. Known Limitations

The CLI still requires a secure operator environment with the intended `DATABASE_URL` configured. It intentionally does not solve secure credential distribution or create an app-hosted metrics endpoint.

Production `/api/health` currently returns safe `unknown` marker values until the build-marker commit is deployed to production.

## 10. Recommended Next Step

Use the new `--dry-run` and `--target production --confirm-production --base-url https://anyu.tw` workflow for the next production metrics rerun after the build marker is deployed.
