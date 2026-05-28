# ANYU Codebase Stabilization + Tech Debt Audit v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Completed a focused stabilization audit after the rapid Module 01 buildout. No P0 issues were found. No runtime behavior changes were made.

One low-risk docs cleanup was completed: `docs/operations/repo-maintenance.md` now reflects current active stabilization targets and explicit do-not-touch boundaries.

## 2. Areas Inspected

Inspected:

- Module 01 components and routes: landing, result, unlocked result, pending poller, theme frame, module registry/adapters.
- AI / prompt / schema / paid generation: schema asset resolver, paid-result generation, semantic validation, prompt/schema constants, provider/fallback path.
- LINE / LIFF / fulfillment: global bridge, compatibility route, LIFF context parsing, diagnostics, webhook route, bind route, token/theme helpers.
- Events / metrics / operator mode: event types/client, abuse guard, metrics CLI, metrics docs, production runbook.
- Styles / themes: `globals.css`, Module 01 theme frame, module theme helpers.
- Legal/payment provider copy: legal content, public legal pages, paid preview card, tests.
- Docs/artifacts: summary log, operations docs, current untracked design/reference files and metrics/handoff artifacts.

## 3. Low-risk Cleanup Completed

- Updated `docs/operations/repo-maintenance.md` with:
  - current stabilization targets
  - active `module-01-metrics-report.md` operations doc
  - `docs/design/` as reference/design-source material if present
  - explicit do-not-touch boundaries for DB schema, prompts/schemas, LINE security, payment/legal semantics, env/deploy model, event contracts, and compatibility adapters

No application code, product logic, public UX, LINE behavior, payment behavior, prompt/schema semantics, cache behavior, or DB schema changed.

## 4. Behavior Preservation Notes

Behavior-preservation validation passed. The audit did not change runtime code.

Expected preserved behavior:

- landing loads
- free analyze code path remains unchanged
- deferred paid generation remains unchanged
- LINE/LIFF and short-code behavior remains unchanged
- Theme A/B behavior remains unchanged
- operator test mode remains unchanged
- metrics CLI code remains unchanged
- payment remains disabled
- legal public-copy safety remains covered by existing tests

## 5. Tech Debt Register

### P0 — Must fix before more production traffic

None found during this audit.

### P1 — Should fix before ads/payment expansion

- Safe runtime build/commit marker is missing.
  - Risk: staging/production freshness is repeatedly inferred through deployment output and behavior, which slows incident response and rollout confidence.
  - Recommended fix: add a privacy-safe build metadata route or static marker exposing commit/build time/environment label only.
  - Owner/action: engineering; separate small ops-safe task.

- Deferred paid generation uses request lifecycle / Next `after` patterns rather than a durable queue.
  - Risk: adequate for low-key beta but not durable under higher traffic, retries, or provider delays.
  - Recommended fix: design a durable paid-generation job path before ads or payment expansion.
  - Owner/action: architecture approval required.

- Metrics are event-count based and not sessionized.
  - Risk: downstream counts can exceed upstream counts; conversion conclusions remain unsafe.
  - Recommended fix: add sessionized reporting or explicitly separate health metrics from conversion metrics before traffic expansion.
  - Owner/action: analytics/product decision.

- Secure aggregate metrics operator path is incomplete.
  - Risk: local metrics can be blocked by missing `DATABASE_URL`, while direct secret access should not be improvised.
  - Recommended fix: document or implement a secure read-only aggregate reporting path.
  - Owner/action: operations/security.

- Payment/provider public information may still need owner details.
  - Risk: NewebPay may require public phone/address/applicant details that Codex must not invent or expose.
  - Recommended fix: owner-approved provider application checklist and public contact decision.
  - Owner/action: owner.

### P2 — Quality / maintainability

- Module 01 component and route files are overgrown.
  - Risk: `AiTemperatureLanding`, `AiTemperatureResult`, and unlocked route are harder to safely change.
  - Recommended fix: extract presentational sections and route-state helpers only behind tests.
  - Owner/action: engineering cleanup task.

- `globals.css` is large and contains many Module 01/theme-specific rules.
  - Risk: theme leakage and visual regressions become harder to localize.
  - Recommended fix: split Module 01/theme CSS into scoped files if the styling system allows it, or document style sections more clearly.
  - Owner/action: frontend cleanup task.

- LINE/LIFF compatibility and diagnostic paths are still present.
  - Risk: useful for support, but can look like permanent product code and increase bridge complexity.
  - Recommended fix: keep for now, add an owner-approved removal/review trigger after production LIFF stability window.
  - Owner/action: LINE ops cleanup task.

- Duplicate `URLSearchParams` serialization helpers exist in route pages.
  - Risk: minor duplication; future query behavior changes can drift.
  - Recommended fix: extract a small helper only when touching bridge/route pages again.
  - Owner/action: opportunistic cleanup.

- Theme carryover token suffix `.c` / `.r` is pragmatic but implicit.
  - Risk: token suffix acts as a theme hint without a stronger typed source of truth.
  - Recommended fix: document suffix strategy and revisit if multi-module theming expands.
  - Owner/action: design-system/platform.

- Schema/prompt version naming is confusing.
  - Risk: `product_result_schema_free_v1`, `product_result_schema_v2`, `paid_result_schema_v3`, and prompt filenames can be hard to reason about.
  - Recommended fix: add a version map/doc before the next schema change; do not rename current contracts without migration.
  - Owner/action: AI/schema owner.

- Provider-review copy lives inside the conversion card.
  - Risk: future modules may duplicate policy/value panels.
  - Recommended fix: extract reusable product-info/policy panels only after a second module needs them.
  - Owner/action: frontend/product.

- Local Playwright can be intermittently blocked by macOS MachPort permissions.
  - Risk: slows QA and causes inconsistent reporting.
  - Recommended fix: document the local workaround or use stable CI/browser environment for visual QA.
  - Owner/action: developer tooling.

- Untracked `docs/design/` source files remain local.
  - Risk: source-of-truth ambiguity and accidental omission from future design work.
  - Recommended fix: owner decides whether to commit design sources, move to inbox, or ignore explicitly.
  - Owner/action: owner/design.

- Root workspace lacks a root `package.json`.
  - Risk: `corepack pnpm exec` from repo root fails; commands must be run inside `apps/web`.
  - Recommended fix: document command working directories or add root scripts only if useful.
  - Owner/action: repo tooling.

### Deferred / Do not touch yet

- DB schema and migrations.
  - Why deferred: production is live and schema changes require explicit migration planning.
  - Revisit trigger: next schema-backed feature or retention policy update.

- Prompt/schema semantics and version renaming.
  - Why deferred: these are contracts and require decision logs/migration notes.
  - Revisit trigger: next paid-result schema or evidence iteration.

- LINE webhook/LIFF/token/security behavior.
  - Why deferred: flows are now production-proven and security-sensitive.
  - Revisit trigger: dedicated LINE hardening or cleanup handoff.

- Analytics event names/metadata contracts.
  - Why deferred: metrics and production monitoring rely on current event mapping.
  - Revisit trigger: sessionized analytics design.

- Legacy/fallback paid-result compatibility adapters.
  - Why deferred: live unlocked links and historical rows may depend on them.
  - Revisit trigger: retention window passes and verified no live rows require old formats.

- Payment integration and public legal semantics.
  - Why deferred: owner/provider approval required.
  - Revisit trigger: NewebPay application or payment implementation handoff.

## 6. P0 Items

None.

## 7. P1 Items

- Missing runtime build/commit marker.
- Non-durable paid-generation execution path before scale.
- Non-sessionized metrics.
- Incomplete secure aggregate metrics operator path.
- Payment-provider public applicant/contact requirements remain owner-dependent.

## 8. P2 Items

- Overgrown Module 01 UI/route files.
- Large global stylesheet with accumulated Module 01/theme rules.
- Retained LIFF diagnostics/compatibility complexity.
- Duplicate query serialization helpers.
- Implicit theme token suffix strategy.
- Prompt/schema version naming complexity.
- Provider-review copy not yet reusable.
- Local Playwright/MachPort reliability issue.
- Untracked `docs/design/` source files.
- No root `package.json` for root-level PNPM commands.

## 9. Deferred / Do Not Touch Yet

Do not opportunistically change:

- DB schema/migrations
- prompt/schema semantics
- LINE webhook/LIFF/token security
- event names or metadata contracts
- legacy/fallback paid-result compatibility
- payment/legal semantics

## 10. Tests Added / Updated

No tests were added. The only completed cleanup was operations documentation.

## 11. Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 31 files / 206 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: passed, 11 Playwright tests.

## 12. Recommended Next Step

Run a dedicated `Build Marker + Ops Readiness v0` task before more production traffic, then plan durable paid-generation and sessionized metrics before ads/payment expansion.
