# Handoff: Local Playwright UI Smoke v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Add a local-only Playwright UI smoke test layer for Module 01 — 曖昧溫度計 — after the completed UI polish sequence.

This task should protect the newly polished UI/funnel from accidental regressions during future technical work such as cache, async analyze, retention cleanup, and ads preparation.

This is a local verification / test-infrastructure task.

Do not add Playwright to CI.

Do not add full-page visual snapshots in this task.

Do not change product UI unless a tiny testability bug is found and explicitly documented.

Do not change runtime, model, prompt/schema, DB schema, legal semantics, LINE flow, auth, payment, portal, production ops behavior, or product logic.

## Background

The current UI polish line is considered substantially complete.

Completed:

```text
Design System v1.1 adoption
ANYU Brand Mark v1.1 adoption
Brand Mark Selective UI Rollout + QA
Font Migration Phase 1: Instrument Serif + QA
Font Migration Phase 2: Newsreader + QA
Font Migration Phase 3: LXGW WenKai + QA
Conversion / CTA Rhythm Polish + QA
Final UI Finishing Pass
Final UI Screenshot Review Pack
Human screenshot review by user / ChatGPT
```

Current review conclusion:

```text
UI polish mainline can be considered sealed for now.
Claude Design's major correction directions have been covered.
AnyuMark / typography / conversion rhythm / LINE flow now feel consistent.
```

Next goal:

```text
Before returning to technical UX work, add local Playwright smoke tests to lock key routes, UI contracts, and funnel interactions.
```

## Scope

Do:

1. Add Playwright configuration for local-only UI smoke tests.
2. Add npm/pnpm scripts for local Playwright smoke.
3. Add route health smoke tests.
4. Add Module 01 landing/input guidance smoke tests.
5. Add demo result / inline CTA / paid preview smoke tests.
6. Add LINE CTA / Email fallback smoke tests.
7. Add legal route smoke tests.
8. Document how to run locally.
9. Keep tests deterministic and not dependent on live provider calls.
10. Commit and push to `origin/staging`.

Do not:

- add Playwright to CI
- add full-page screenshots
- add visual snapshots unless extremely small and explicitly local-only
- test live production DB/provider
- run many analyze calls
- use real private content
- require secrets
- change app behavior
- add auth/payment/LINE API

## Testing Strategy

Use local app / local preview server where possible.

Preferred scripts:

```text
cd apps/web
corepack pnpm test:e2e:local
corepack pnpm verify:ui
```

Playwright should run against a local server.

Options:

```text
Option A: Playwright webServer starts `corepack pnpm dev`
Option B: Playwright webServer starts `corepack pnpm start` after build
```

Preferred for stability:

```text
build first, then start production-like local server
```

But if repo convention prefers dev server, use dev server.

Do not require remote staging/protected preview for normal test runs.

## Do Not Put In CI

Ensure the normal existing command remains:

```text
corepack pnpm test
```

and continues to run Vitest only.

Add Playwright scripts separately:

```json
{
  "test:e2e:local": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "verify:ui": "playwright test --project=chromium"
}
```

If package naming differs, adapt to repo conventions.

Do not wire Playwright into:

```text
pnpm test
CI workflow
pre-commit hook
default validation pipeline
```

## Recommended Files

Likely create:

```text
apps/web/playwright.config.ts
apps/web/e2e/module-01-smoke.spec.ts
apps/web/e2e/legal-routes.spec.ts
apps/web/e2e/line-funnel.spec.ts
```

Optional helper:

```text
apps/web/e2e/helpers.ts
```

Update:

```text
apps/web/package.json
apps/web/README.md
docs/operations/production-deployment-runbook.md
```

Only update what is necessary.

## Required Test Coverage

### 1. Route health

Test local routes:

```text
/m/ambiguous-temperature
/m/ambiguous-temperature/result/demo
/privacy
/terms
/disclaimer
```

Optional:

```text
/legal
```

Expected:

```text
status OK
main content visible
footer/legal links visible where applicable
```

### 2. Landing input guidance

Test:

```text
landing renders
header / brand visible
textarea visible
CTA initially disabled or shows pre-threshold state
short input shows 0/30 or current/30 guidance
valid 30+ char input enables analyze CTA
privacy helper text visible
chips selectable
```

Do not submit to live provider unless the app has a mock path.

### 3. Demo result page

Use:

```text
/m/ambiguous-temperature/result/demo
```

Test:

```text
temperature card visible
signals visible
insight visible
inline CTA visible:
  想知道下一句怎麼回？
  看下一句怎麼回
share/persona card visible
paid preview visible
LINE panel or unlock flow accessible
footer legal links visible
```

### 4. Inline CTA scroll/reveal

Test:

```text
click 看下一句怎麼回
paid preview/contact section becomes visible
no duplicate paid panels
```

Use robust locators by role/text where possible.

### 5. Unlock / LINE panel

If unlock flow works on demo route locally:

```text
click 解鎖下一句怎麼回 — NT$49
LINE-first panel appears
primary LINE CTA visible
LINE CTA href is https://lin.ee/S6dnbJO
Email fallback link/button visible
```

If local unlock API requires DB, avoid real API dependency:

- Use demo route state if possible.
- Or test existing static UI after clicking if component state does not require DB.
- If impossible without backend, document limitation and test only static/demo affordances.

### 6. Email fallback

Test if local API dependency can be avoided.

Minimum:

```text
click 改用 Email 接收通知
email input appears
synthetic email can be typed
```

Do not require successful backend submit unless local test DB is safe and already standard.

Synthetic email:

```text
anyu-e2e@example.com
```

### 7. LINE CTA

Test:

```text
LINE CTA href === https://lin.ee/S6dnbJO
```

Do not actually navigate away if avoidable.

Use:

```text
getAttribute('href')
or intercept navigation
```

### 8. Legal links

Test footer links from demo result or landing:

```text
隱私權政策 → /privacy
使用條款 → /terms
免責聲明 → /disclaimer
```

Use route clicks or href checks.

## Stability Rules

Use:

```text
chromium only
fixed viewport such as 390x844 and/or 430x932
reduced motion if helpful
no network-dependent external assertions where avoidable
no pixel-perfect assertions
no full-page screenshots
no sleep-based waits unless unavoidable
```

Prefer:

```text
getByRole
getByText
toBeVisible
toHaveAttribute
expect(page).toHaveURL
```

Avoid brittle CSS selectors except for stable test IDs.

If test IDs are needed, add minimal `data-testid` only where accessible locators are insufficient.

## Optional Local Screenshot

Do not add screenshot assertions.

If useful, allow developers to manually run:

```bash
corepack pnpm test:e2e:ui
```

Do not commit generated screenshots.

## Documentation

Update `apps/web/README.md` with:

```markdown
## Local UI Smoke Tests

Run:

```bash
corepack pnpm test:e2e:local
```

These tests are local-only and are not part of CI.
They protect Module 01's landing, demo result, legal routes, inline CTA, LINE CTA, and Email fallback affordances.
```

If `docs/operations/production-deployment-runbook.md` has validation checklist, add:

```text
For UI-heavy changes, optionally run local Playwright smoke before handoff completion.
```

Do not make Playwright mandatory for all tasks.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-21-local-playwright-ui-smoke-v0-review-bundle.md
```

Required sections:

```markdown
# Local Playwright UI Smoke v0 Review Bundle

Date: 2026-05-21

## 1. Summary

## 2. Test Strategy

## 3. Scripts Added

## 4. Routes Covered

## 5. UI Contracts Covered

## 6. What Is Not Covered

## 7. Local-Only Policy

## 8. Validation Results

## 9. Remaining Test Backlog

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-21-local-playwright-ui-smoke-v0-execution-report.md
```

Report structure:

```markdown
# Local Playwright UI Smoke v0 Execution Report

## Summary

## Files Created

## Files Updated

## Playwright Setup

## Tests Added

## Scripts Added

## Local-Only Policy

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
- tests added
- scripts added
- validation result
- commit hash
- staging push status

## Validation

Always run existing validation:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

Also run the new local UI smoke command:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright browser installation is missing and cannot be installed safely in the task environment:

- document exact limitation
- still validate config/tests by lint/typecheck where possible
- do not pretend Playwright passed

## Constraints

Do not implement:

```text
CI Playwright
visual snapshots
ads launch
real payment
LINE API
LIFF
email sending
auth
portal
scheduled deletion job
model switch
runtime rewrite
image share / PNG / OG generation
```

Do not modify:

```text
product prompt/schema
DB schema
provider/model
legal semantics
LINE funnel behavior
production ops behavior
UI design beyond tiny testability attributes if necessary
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces
```

Ensure Playwright output folders are gitignored if needed:

```text
test-results/
playwright-report/
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "test: add local module ui smoke"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw user content/font files/test artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- Playwright setup summary
- scripts added
- tests covered
- local-only policy
- validation results, including Playwright result or limitation
- review bundle path
- commit hash
- staging push status
- Tech Debt / Cleanup Notes
- exact next step

Then stop.
