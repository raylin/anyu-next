# ANYU Engineering Foundation Audit v0

Date: 2026-06-06

## Model / Effort

- Model used: GPT-5 Codex
- Reasoning effort used: high
- taskStartedAt: `2026-06-06T15:43:00Z`
- taskCompletedAt: `2026-06-06T15:50:07Z`
- totalWallClockDuration: about 7 minutes
- humanWaitDuration: about 0 minutes
- netCodexWorkDuration: about 7 minutes

## Scope And Method

This was a read-only repository audit. No runtime, payment, Email, LINE, DB mutation, migration, Vercel env sync, or product implementation was performed.

Inventory size inspected:

| Area | Count / coverage |
|---|---:|
| Tracked repo files | 1,492 |
| `apps/web/src` files | 245 |
| `apps/web/scripts` files | 18 |
| `apps/web/src/tests` files | 86 |
| Playwright specs | 5 |
| Admin CLI source/test files | 3 |
| Process docs | 6 |
| Drizzle migrations | 14 |

Commands and source inspection focused on package scripts, QA runners, Playwright setup, Admin API/CLI, env/deploy preflight, LINE/LIFF/access-link, NewebPay/payment/processor, schema/migrations, and process docs.

## Executive Summary

ANYU has reached a strong functional base but a weak engineering foundation for high-confidence production iteration. The current repo has broad coverage, many safety checks, and a now-codified operating policy. The main problem is not lack of tests; it is fragmentation, mixed layers, and insufficient reproducible local/deployed simulation for the exact provider-bound flows that fail in production.

Top findings:

| Rank | Finding | Severity | Why it matters |
|---|---|---:|---|
| 1 | Production LINE bind redirect/state path is not reliably covered outside real production owner action. | P0 | Latest smoke failed before payment even after local/mock/UI/staging gates passed. |
| 2 | QA commands mix true tests, deployed smokes, operator tools, direct DB paths, and release gates under one script layer. | P0 | Makes it hard to know the lightest reliable validation for a change. |
| 3 | No shared production-smoke/analyze valid fixture contract exists. | P0 | The latest smoke wasted controlled-runtime time on direct API validation errors before reaching owner action. |
| 4 | Playwright Module 01 UI suite uses a route interception harness, not a real local Next route. | P1 | Good for copy/state assertions, weak for server/client integration, route params, headers, and form actions. |
| 5 | Admin API is read-only and safe but too narrow for QA state setup and pre-payment bind diagnosis. | P1 | Forces either manual checks or approved direct DB/debug paths for certain failures. |
| 6 | Recovery/access-link naming drift remains large. | P1 | Increases cognitive load and makes new work slower and riskier. |
| 7 | Production deploy guard is much stronger, but alias target is still reported as not checked by local project-link guard. | P1 | A past class of Vercel mismatch can still require manual interpretation. |

Recommended immediate next phase: **Phase 0 stop-the-line foundation tasks**, especially a Production LINE Bind Failure Diagnosis and a reusable LIFF/bind test harness before any further production payment smoke.

What not to do next:

- Do not retry production payment smoke immediately.
- Do not broaden staging smoke usage as the default answer.
- Do not patch LINE from production symptoms without first adding a reproducible bind harness and fixture coverage.
- Do not implement theme UI or Module 02 before the production bind/release foundation is stabilized.

## Repository Map

| Area | Purpose | Status | Owner / layer | Risks |
|---|---|---|---|---|
| `apps/web` | Next.js 16 app, Module 01 runtime, payment, access-link, LINE, Admin API, QA scripts/tests. | Active | Runtime/test/ops | High operational density in one app; scripts/tests/runtime share concepts but not a common fixture model. |
| `apps/web/src/app` | App Router pages and API routes. | Active | Runtime | Provider-bound flows span many routes: analyze, checkout, ReturnURL, NotifyURL, LINE bind, `/r/`. |
| `apps/web/src/lib` | Core runtime libraries: AI, DB, modules, payment, LINE, notifications, admin. | Active | Runtime | Large files and compatibility aliases increase change risk. |
| `apps/web/src/tests` | Vitest route/unit/integration-style tests. | Active | Test | Broad coverage but scenario relationships are implicit and scattered. |
| `apps/web/e2e` | Playwright specs and support harness. | Active but early | UI test | Module 01 UI suite is harness/intercept-based rather than real local route based. |
| `apps/web/scripts` | QA runners, preflights, smoke helpers, metrics, model evaluation. | Active/mixed | QA/ops | Mixes reusable runners, staging smokes, production preflight, operator tools, DB scripts, and legacy compatibility. |
| `apps/web/drizzle` | Drizzle schema migrations. | Active | Schema | Migrations include clean access-link rename; schema should not change silently. |
| `tools/admin-cli` | Pure Admin API client. | Active | Ops | Good boundary; root command still delegates through pnpm workspace script, acceptable but noisy. |
| `tools/topic-ingestion` | Python topic ingestion / research tooling. | Active research | Research | Separate from app runtime; not part of Module 01 launch gate. |
| `ai-collaboration` | Handoffs, reports, dashboard, process docs, design archive. | Active docs/process | Docs/PM memory | Large historical corpus includes stale process language; do not rewrite history. |
| `ai-collaboration/design/theme-architecture-v0` | Archived Theme Architecture assets. | Active reference | Design docs | Accepted as visual reference only; not runtime source-of-truth. |
| `ai-collaboration/process` and `AGENTS.md` | Shared Codex operating policy. | Active | Process | Strong recent improvement; future tasks must reference it. |
| Root `oradar`, `experiments`, `schemas`, `prompts`, `scripts` | Earlier local research/runtime foundation. | Legacy/research | Research | Still present and documented in README, not imported by active web app. |
| Root `.env` | Local root env file exists. | Legacy/local | Local risk | Ignored by git; app QA loader avoids it, but existence can confuse operators. |

## Package / Workspace Layout

Root:

- `package.json` only exposes `pnpm ops`.
- `pnpm-workspace.yaml` includes `apps/*`, `packages/*`, `tools/*`.
- `apps/web` owns runtime scripts and tests.
- `tools/admin-cli` owns Admin CLI.

Risk:

- Root command is intentionally thin, but the workspace has no root `test`, `lint`, or `qa` meta-command. This is acceptable for now but makes task validation dependent on remembering app-local commands.

## QA / Testing Architecture Map

| Entry point | Validates | Does not validate | Target | Mutates data | Real Email/LINE | Owner action | Deterministic | Artifact/temp dependency | Recommendation |
|---|---|---|---|---:|---:|---:|---:|---|---|
| `cd apps/web && corepack pnpm lint` | ESLint. | Runtime behavior. | Local | No | No | No | Yes | None | Keep. |
| `cd apps/web && corepack pnpm test` | 86 Vitest files, route/helpers/components/services. | Browser/real provider/deployed env. | Local | No real external mutation | No | No | Mostly yes | None | Keep; group subsets more clearly. |
| `qa:module01:local` | Lint, targeted tests, full tests, build. | Deployed runtime/provider channels. | Local | No | No | No | Yes but slower | `.qa` summary | Keep as broad local gate. |
| `qa:module01:mock-flow` | Scenario-labeled targeted Vitest slice for Email/LINE/payment/access-link/admin. | Full user journey, real providers, browser runtime. | Local | No | No | No | Yes | `.qa/module01-mock-flow-summary.json` | Keep, but evolve from wrapper to real scenario runner. |
| `qa:module01:ui` | Checkout-start state/copy/order via Playwright route interception. | Real Next route, server actions, headers, actual component tree. | Local browser harness | No | No | No | Yes | Playwright only | Keep, but move toward real local route/MSW. |
| `qa:module01:staging` | Preview health, staging env mirror shape, access-link smoke, no-card checkout, Admin API/CLI lookup. | Real Email/LINE channels, real NewebPay, real mobile LIFF proof. | Preview(staging) plus read-only production fail-closed checks | Yes, staging test rows | No by default | No | Medium | `.qa` summaries/artifact | Keep as release/deployed gate, not default fix validation. |
| `qa:module01:production-preflight` | Production env names/mirror shape, project guard, public/fail-closed route behavior. | Provider dashboard settings, actual secret value correctness, real payment. | Production read-only | No | No | No | High if Vercel reachable | `.qa` summary | Keep; strengthen alias/deploy evidence. |
| `qa:module01:release` | Aggregates local/staging/production-preflight. | Real channels/payment. | Mixed | Staging mutation | No | No | Slow | `.qa` summaries | Keep for release candidates only. |
| `qa:module01:wait-result` | Admin API polling for known staging result paid readiness. | Production, direct setup, Email/LINE receipt. | Staging only | No | No | No | Depends on async state | `.qa` wait summary | Keep; extend to production read-only only if policy permits. |
| `qa:result-checkout:no-card` | Deployed staging result→checkout→operator fake-paid→paid access render; production fail-closed check. | Real NewebPay, real Email/LINE, real mobile LIFF. | Staging + read-only production | Yes, staging | No | No | Medium | `.qa/module01-staging-artifact.json`; in-memory paid token | Keep as staging building block; reduce token-state dependency through Admin API. |
| `qa:access-link:smoke` | Staging access-link operator flow, `/r/` safety, production fail-closed. | Real user channels unless operator endpoint sends. | Staging + read-only production | Yes, staging | No by default/runtime mode | No | Medium | Local env mirror, sometimes DB mode | Rename/wrap as access-link smoke; keep legacy alias for now. |
| `qa:line-access-link:smoke` | Staging LINE access-link operator smoke. | Real channel unless explicitly configured. | Staging | Yes | May send LINE | Owner-approved | Low/medium | Operator secret | Keep guarded; not default. |
| `qa:module01:staging:channels` | Explicit real staging Email/LINE channel gate skeleton. | Not implemented. | Staging | Would mutate/send when implemented | Yes when implemented | Yes | N/A | `.qa` summary | Implement only when repeatable channel proof is needed. |
| `qa:production:payment-preflight` | Hardened production preflight. | Real payment. | Production read-only | No | No | No | High if Vercel reachable | JSON output | Keep. |
| `qa:env:preflight` | QA env mode key-name/mirror checks. | Actual runtime. | Local/staging assumptions | No | No | No | Yes | Env mirror key names | Keep, but align modes with current baseline. |
| `qa:fake-paid` | Authorized fake-paid operator path. | Real NewebPay. | Staging/local target | Yes | No | No | Medium | Operator/internal secrets | Keep as lower-level building block. |
| `qa:newebpay:sandbox` | Sandbox NewebPay helper. | Production payment. | Sandbox/staging | Potential provider sandbox | No real prod | Manual browser may be required | Low/medium | temp generated HTML/state | Keep as manual/sandbox tool; not normal regression. |

### QA Architecture Finding

The suite is now safer than before, but “QA runner” means at least four different things in this repo:

- deterministic local tests
- local wrappers around Vitest
- deployed staging smoke scripts that mutate test data
- production read-only preflight/deploy guard scripts
- owner-approved real channel/payment procedures

The policy docs now distinguish these, but the scripts directory still does not.

## Scripts vs Tests Classification

| Script | Category | Active? | Risks / notes | Recommendation |
|---|---|---:|---|---|
| `authorized-fake-paid-qa.mjs` | Staging/operator QA runner | Active | Loads staging env, hits deployed target, has manual/queue processor modes, legacy unlock regression. | Keep as internal building block; not default gate. |
| `result-checkout-no-card-qa.mjs` | Staging smoke / reusable QA runner | Active | Uses shared wait helper but still polls paid status through in-memory paid access token from operator response. | Keep; move wait to Admin API/resultId path later. |
| `recovery-link-smoke-qa.mjs` | Access-link staging smoke with legacy name | Active | Can use runtime or local DB mode; imports Neon and `DATABASE_URL` for DB mode. | Keep runtime mode; deprecate local DB mode if no longer needed. |
| `line-recovery-smoke-qa.mjs` | LINE access-link staging smoke | Active/guarded | Uses operator endpoint; can involve real LINE message depending env/target. | Keep owner-approved only; align name later. |
| `module01-release-validation-suite.mjs` | Release gate aggregator | Active | Large script; embeds many checks and shell commands; staging still mutates data. | Keep; split checks into modules when next touched. |
| `module01-staging-result-wait.mjs` | Structured wait helper | Active | Admin API only, staging only; good replacement for heredoc polling. | Keep; extend carefully if needed. |
| `module01-mock-flow-qa.mjs` | Mock-flow wrapper | Active | Scenario summary is metadata over targeted tests, not a true scenario executor. | Evolve into real scenario harness. |
| `module01-staging-channels-qa.mjs` | Owner-approved channel gate skeleton | Active skeleton | Refuses by default; runner not implemented. | Implement only if owner wants repeatable real channel proof. |
| `production-payment-runtime-preflight.mjs` | Production preflight/deploy guard | Active | Strong mirror/shape checks; alias target not checked by local guard; invokes Vercel CLI. | Keep; harden alias/deploy evidence. |
| `qa-env-preflight.mjs` | Env preflight helper | Active | Contains old modes and direct DB requirements for some legacy access-link paths. | Keep; prune/mark deprecated modes. |
| `newebpay-sandbox-e2e-helper.mjs` | Sandbox/manual provider helper | Active but manual | Generates temporary form/state and uses manual browser submission. | Keep outside normal QA tier. |
| `module-01-funnel-report.mjs` | Aggregate metrics report | Active ops/analytics | Direct DB via `DATABASE_URL`; safe aggregate intent. | Keep as aggregate ops, not support lookup. |
| `evaluate-model-latency.mjs` | Model evaluation | Active research/ops | Calls provider models if env configured. | Keep separate from release QA. |
| `export-brand-assets.mjs` | Design asset export | Active utility | macOS Quick Look dependency. | Keep; unrelated to Module 01 gate. |
| `scripts/lib/load-local-env.mjs` | QA env loader | Active | Defaults to `.env.staging`, reports `.env.local` as deprecated, ignores root `.env`. | Keep. |
| `scripts/lib/module01-wait.mjs` | Shared polling helper | Active | Simple reusable primitive. | Keep; add abort/backoff/jitter only if needed. |
| `scripts/lib/result-checkout-no-card-qa.mjs` | Sanitizers/summarizers | Active | Good redaction helpers; HTML text assertions can be brittle. | Keep; share with Playwright/fixtures where practical. |
| `scripts/lib/recovery-link-smoke-qa.mjs` | Access-link token helpers for QA | Active legacy name | Still uses recovery names while clean schema says access-link. | Rename later after production gate. |

### Duplicated / Weak Patterns

- Multiple scripts define their own `requestJson`, synthetic input, base URL constants, and redaction patterns.
- Several scripts load `.env.staging` by default; this is correct for server/QA mirror usage, but it should remain forbidden for Admin CLI.
- Direct DB access remains in production preflight, metrics, and legacy access-link smoke DB mode. This is allowed for preflight/aggregate/debug, not normal support.
- Polling now has a shared helper, but `module01-staging-result-wait.mjs` still has its own while-loop rather than `scripts/lib/module01-wait.mjs`.
- Staging suite still uses deployed smoke commands as subchecks, so it is inherently slower and data-mutating.

## Fixture And Mock Architecture Audit

Current fixture state:

- Valid synthetic inputs exist inside several scripts (`result-checkout-no-card-qa`, `authorized-fake-paid-qa`, `recovery-link-smoke-qa`, `newebpay-sandbox-e2e-helper`).
- Product-valid context options exist in `ai-temperature-context.ts`.
- Test data is embedded in tests and scripts rather than a shared fixture package.
- Production smoke used dynamically generated request bodies instead of a tracked validated fixture, causing two safe validation failures before owner action.

Answers:

| Question | Current answer |
|---|---|
| Stable Module 01 valid input fixture? | No shared fixture. Valid examples are duplicated in scripts/tests. |
| Reusable checkout contexts? | Partial. Checkout page tests build mocked props; Playwright has harness states; smoke scripts create runtime state. |
| Reusable LINE happy/partial-bind fixtures? | Partial. Unit tests cover bind route/state and mock-flow labels scenarios, but no shared LIFF browser fixture. |
| Reusable Email/access-link fixtures? | Partial. Helpers/tests exist; no cross-layer fixture directory. |
| Production smoke tracked fixtures? | No. Latest smoke used dynamic direct API request body. |
| Do mock-flow scenarios map to journeys? | Names map to journeys, but implementation is targeted-test grouping rather than end-to-end scenario setup/execution. |
| Are mocks centralized? | No. Mocks live in individual tests and scripts. |

Recommended fixture structure:

```text
apps/web/src/tests/fixtures/module01/
  analyze-inputs.ts
  checkout-contexts.ts
  payment-contexts.ts
  recovery-contacts.ts
  line-liff-contexts.ts
  admin-lookup-responses.ts
  access-link-states.ts
```

First fixtures to add:

- `validAnalyzeRequest()` with min-length-safe text and allowed `userContext`.
- `validCheckoutStartContext()` for desktop/mobile and saved/unsaved states.
- `lineBindStateFixture()` for direct query, LIFF state, expired, invalid, and redirect-return variants.
- `lineRecipientSecretFixture()` for deliverable, contact-only, failed secret.
- `adminLookupReadyFixture()` and `adminLookupPartialLineBindFixture()`.

Use fixtures across:

- Vitest route/component tests
- mock-flow scenarios
- Playwright route-backed harness
- production smoke runbook examples
- Admin CLI tests

## Playwright / Browser Testing Audit

Current setup:

- `apps/web/playwright.config.ts` covers general e2e specs.
- `apps/web/playwright.module01-ui.config.ts` runs only `module-01-checkout-ui.spec.ts`.
- Module 01 UI test uses `page.route("**/qa/module01/checkout-start**")` to fulfill static HTML from `e2e/support/module01-checkout-harness.ts`.
- It covers desktop Email-only, mobile LINE-above-Email, Email saved unlock, LINE deliverable unlock, and LINE contact-only lock.

Strengths:

- Fast and deterministic.
- No provider, no Vercel, no real Email/LINE.
- Good copy/order/state assertions.

Weaknesses:

- It does not render the actual Next route or server component.
- It does not exercise `getExistingRecoveryState`, user-agent device detection, form actions, generated LINE bind href, or current CSS/layout.
- It cannot catch LIFF redirect/state behavior.
- Trace/screenshot/video are off, which keeps it fast but limits debug artifacts.

Target Playwright architecture:

| Flow | Best approach |
|---|---|
| Checkout-start desktop/mobile layout | Real local Next route with mocked DB/service dependencies or test-only route handler. |
| Save gate state transitions | Real route plus controlled fixture DB or route interception at API boundary. |
| LINE bind bridge | Browser component/harness with mocked LIFF SDK and route interception. |
| ReturnURL waiting | Real local route with mocked payment status endpoint. |
| `/r/` resolver | Route/component test plus one Playwright smoke for public error/ready states. |
| Paid result render | Component/route tests first; Playwright for layout/accessibility. |
| NewebPay external page | Do not Playwright-test; provider smoke only. |

Recommended next Playwright slice:

- Add a local test-only Next route or MSW-style handler for checkout-start using real app components.
- Add a LIFF bridge Playwright harness that simulates:
  - initial LINE unauthenticated
  - `liff.login` redirect
  - `liff.state` returning with valid state
  - missing idToken
  - bind API failure category
  - success redirect

## Admin API / Ops Boundary Audit

Current state:

- Admin API: `GET /api/admin/paid-results/[resultId]`.
- Auth: `x-admin-api-token`, `ADMIN_API_TOKEN`, timing-safe comparison.
- Response: sanitized payment/entitlement/generation/access-link summary.
- CLI: `pnpm ops lookup-result --env staging|production --id <resultId>`.
- CLI does not read app env mirrors, DB URLs, Neon, or Vercel.
- Direct DB support lookup was removed.

Strengths:

- Good redaction boundary.
- CLI validates unsafe fields and token-looking values.
- Admin API now exposes partial LINE bind: `deliverable=false`, `recipientSecretExists=false`, `line_bind_incomplete`.
- QA staging suite consumes Admin API and CLI.

Gaps:

- Admin API is post-result lookup only. It cannot answer pre-payment LINE bind route diagnostics unless a result/contact state exists and is visible through the paid-result summary.
- It does not expose safe route-event diagnostics, LIFF context parse categories, or latest bind attempt category.
- It does not support QA fixture creation/setup, by design.
- Pre-payment support after failed LINE bind may require direct DB or browser owner report because no paid result exists.

Should there be staging-only admin test fixture endpoints?

Yes, but only behind strict safeguards if owner accepts. Suggested endpoints:

| Endpoint | Environment | Purpose | Guard |
|---|---|---|---|
| `POST /api/admin/qa/module01/results` | Preview only | Create valid Module 01 fixture result from tracked fixture. | Admin token + preview env + no production. |
| `POST /api/admin/qa/module01/line-bind-state` | Preview only | Generate sanitized LINE bind href/state for a fixture result. | Admin token + preview env + no raw state output; return URL only redacted or browser-open action. |
| `GET /api/admin/qa/module01/bind-attempts/[resultId]` | Preview only | Return safe bind attempt categories. | Admin token + no raw LINE/idToken/state. |

Do not add admin mutation endpoints for production. Do not turn Admin API into support mutation surface.

## Env / Vercel / Deployment Audit

Current model:

- `apps/web/.env.staging` mirrors Vercel Preview(staging).
- `apps/web/.env.production` mirrors Vercel Production.
- CLI must not read either mirror.
- Local mirror first, Vercel sync second.
- Production preflight checks mirror secret shape, Vercel key-name presence, canonical project linking, public/fail-closed routes.
- Staging suite now includes `stagingEnvMirror`.

Strengths:

- `.env.local` fallback was removed from active app QA loader; loader reports it as deprecated.
- Production preflight catches empty/placeholder local mirror secrets.
- Vercel project linking checks root `.vercel/project.json`, rejects unexpected `apps/web/.vercel/project.json`.
- Production preflight distinguishes host key-name presence from host value-shape unverified.

Remaining risks:

| Risk | Severity | Notes |
|---|---:|---|
| Root `.env` file exists. | P2 | Not used by app QA loader, but can confuse operators. |
| Vercel alias target check is reported as `alias_target_not_checked_by_local_project_link_guard`. | P1 | Health check reduces risk, but project/alias mismatch class is not fully closed. |
| Vercel CLI commands live inside preflight scripts. | P2 | Practical but hard to mock and slow. |
| Production deploy warning reports a detected `.env` file. | P2 | This may be expected due local mirror, but should be documented in deploy runbook. |
| Production runtime flags are manually toggled and redeployed. | P1 | Correct but high-risk; a dedicated controlled-smoke enable/disable script with hard guards would reduce human error. |

Hardening recommendations:

- Add alias target verification via `vercel inspect` or Vercel API, returning key names/categories only.
- Add a guarded `qa:production:runtime-window` helper for enable/deploy/verify and disable/deploy/verify, if production smoke will continue.
- Add docs clarifying root `.env` is non-app legacy/local and not a server mirror.

## LINE / LIFF / Access-Link Foundation Audit

Current foundation:

- LINE bind href uses `rlb_` signed state through `createLineRecoveryBindHref`.
- Recovery bind page is `LineRecoveryBindBridge`.
- It loads LIFF SDK, initializes with LIFF ID, calls `liff.login({ redirectUri: window.location.href })`, obtains `idToken`, and POSTs to `/api/line/recovery/bind-liff`.
- Server verifies state and LINE idToken, writes contact, writes recipient secret, and now marks contact failed if recipient secret write fails.
- Checkout unlock now requires deliverable LINE state: active contact plus active recipient secret.
- Paid delivery eligibility requires active recipient secret before LINE send.
- Admin API/CLI expose partial bind safely.

Why production LINE bind can still fail after redirect:

The fixed invariant only covers server-side contact/secret consistency after the bind API is reached with a valid state and idToken. The latest failure happened earlier from the user perspective: after LINE login redirect, bind still failed. The weakly covered section is the browser/LIFF redirect bridge:

1. generated LIFF URL / endpoint configuration
2. LINE app redirect to `/line/recovery/bind` or legacy bridge
3. `liff.state` preservation and parsing after login
4. `window.location.href` as login redirect URI
5. LIFF SDK initialization on production domain
6. idToken availability after login
7. POST route response handling and safe error display

Current tests cover parsing and server route behavior, but not a real browser LIFF login-return cycle.

Classification:

- Most likely category: integration/config/browser bridge gap.
- Not enough evidence to call it provider credential failure, product copy issue, or DB invariant failure.
- Foundation needed before retry: LIFF redirect/state harness plus safe bind attempt diagnostics.

What cannot be tested locally today:

- Real LINE app login redirect behavior.
- LINE Console endpoint/callback configuration correctness.
- Real LIFF SDK idToken behavior on `https://anyu.tw`.
- Mobile LINE in-app browser cookie/session nuances.

Recommended diagnosis foundation:

- Add a testable `LineRecoveryBindBridge` state machine abstraction or injectable LIFF adapter.
- Add Playwright component/route harness with mocked LIFF SDK.
- Add safe diagnostics categories surfaced on the bind page and route response:
  - `liff_sdk_load_failed`
  - `liff_init_failed`
  - `liff_not_logged_in_redirect_started`
  - `id_token_missing_after_login`
  - `bind_api_state_missing`
  - `bind_api_state_invalid`
  - `bind_api_line_user_missing`
  - `bind_api_recipient_secret_failed`
- Add owner-facing failure copy that can be reported as a category without screenshots.

## Payment / NotifyURL / Processor Foundation Audit

Well-covered areas:

- NewebPay checkout payload/service/route tests.
- NewebPay crypto compatibility tests.
- NotifyURL route/service verification tests.
- ReturnURL component/poller tests.
- Payment status route tests.
- Entitlement foundation tests.
- Generation job and processor tests.
- Production preflight checks provider env names, mirror shape, processor auth names, public/fail-closed routes.
- Earlier production smoke proved real payment truth, entitlement activation, processor completion, paid result completion.

Still manual / provider-bound:

- Actual NewebPay external card payment.
- NewebPay dashboard payment-method setting.
- ReturnURL/NotifyURL race under real provider timing.
- Production Email/LINE user-channel receipt.

Mockable next:

- Checkout generation with tracked fixture result.
- NotifyURL paid truth with route test already mostly covered.
- Processor completion with fixture result and mock AI.
- Access-link send hook with mock providers.
- Admin API ready summary from fixture state.

Previous repeated retries were caused by:

- Runtime/env mirror drift.
- Vercel project/source ambiguity.
- Empty/placeholder secrets.
- LINE recipient-secret invariant gap.
- Lack of production-valid fixture for result creation.
- Lack of non-production coverage for production LIFF redirect behavior.

## Code Quality And Maintainability Findings

| Area | Finding | Impact | Recommendation |
|---|---|---|---|
| Naming | `recovery` terminology remains in active env keys, scripts, modules, aliases, and copy-adjacent names while product language is access-link. | Slows reasoning and increases mismatch risk. | Rename in planned compatibility phase after gate. |
| Large files | `unlock/[unlockToken]/page.tsx` 948 lines, `payment-recovery-contacts.ts` 682, `admin/paid-result-lookup.ts` 615, `paid-generation-service.ts` 569, `email-recovery-link.ts` 520, checkout page 496. | Harder to isolate invariants and test seams. | Split when touched by feature work. |
| QA scripts | Repeated request/json/redaction/base URL/synthetic input patterns. | Drift and inconsistent behavior. | Extract shared QA utilities and fixtures. |
| Mock-flow | Scenario labels wrap tests rather than executing scenario setups. | Summary can overstate true scenario coverage. | Build stateful in-memory/mock scenario runner. |
| Playwright | Harness uses static HTML intercept. | Cannot catch server/client integration issues. | Move to real route/test server harness. |
| Env/preflight | Strong but Vercel alias check incomplete. | Project/alias mismatch class not fully eliminated. | Add alias target check. |
| Admin API | Safe but narrow. | Pre-payment failures lack structured ops visibility. | Add safe diagnostics, not production mutation. |
| LINE bind | Client catches all errors into generic fallback. | Owner reports are ambiguous; root cause remains hidden. | Add safe error categories in UI/reporting. |
| Production smoke | Runbook still relies on manual browser actions and dynamic result request if not using fixture. | Owner standby and controlled-window waste. | Add fixture-backed production-smoke prep helper. |

## Ranked Tech Debt Inventory

### P0: Blocks Production Gate Reliability

| Item | Why P0 | Recommended action |
|---|---|---|
| Production LINE bind redirect path not reproducible in local/staging automation. | Latest smoke failed here before payment. | Build LIFF bind harness/diagnostics, then diagnose/fix. |
| No shared production-valid Module 01 analyze fixture/request helper. | Controlled runtime window wasted on validation errors. | Add tracked fixture and helper used by scripts/runbooks/tests. |
| QA layer boundaries remain unclear in scripts directory. | Agents can overuse staging/prod smokes. | Split docs/index and command categories; prefer local/mock/ui. |
| Real channel gate skeleton unimplemented. | Owner-verification remains ad hoc when needed. | Implement only if owner wants repeatable staging channel proof. |

### P1: Before Soft Public Availability

| Item | Why P1 | Recommended action |
|---|---|---|
| Playwright not bound to real local Next route. | UI/server integration gaps remain. | Add real-route or test-only route harness. |
| Admin API lacks safe bind attempt diagnostics. | Pre-payment failures hard to inspect without owner screenshots/DB. | Add read-only safe diagnostics/categories. |
| Vercel alias target guard incomplete. | Past deployment mismatch risk not fully closed. | Add alias inspect/API check. |
| Recovery/access-link naming drift. | Repeated confusion and code search noise. | Plan rename phase with compatibility tests. |
| Controlled runtime toggle is manual. | High-risk operational step. | Add guarded enable/disable smoke-window helper. |
| Direct DB remains in legacy access-link smoke DB mode. | Can reintroduce old ops habit. | Remove or quarantine DB mode if not needed. |

### P2: Before Module 02

| Item | Why P2 | Recommended action |
|---|---|---|
| Large runtime files lack smaller seams. | Module 02 reuse will be costly. | Split access-link, checkout, result render, processor seams. |
| Mock-flow is not a true scenario runner. | Multi-module reusable QA will be weak. | Build scenario harness with fixtures/state. |
| Theme implementation plan pending. | Accepted design architecture is not operationalized. | Plan after production gate foundation. |
| Root legacy research/app folders coexist with ANYU app. | New agents may misread project purpose. | Update README/map; mark legacy/research clearly. |
| `pnpm ops` lifecycle noise. | Usability issue for ops. | Package/bin polish later. |

### P3: Can Defer

| Item | Notes |
|---|---|
| `rlb_` prefix decision | Keep until LINE bind stable. |
| Old Opportunity Radar schema titles in AI assets | Cosmetic/heritage; not launch blocker. |
| Brand asset export macOS dependency | Low-frequency design utility. |
| Root package lacks broad validation scripts | Current app-local commands are acceptable. |

## Recommended Foundation Roadmap

### Phase 0: Stop-The-Line Foundation Tasks

Goal: remove immediate production smoke blockers.

Tasks:

- Production LINE Bind Failure Diagnosis v0.
- Add safe LINE bind attempt categories and owner-reportable error codes.
- Add shared production-valid Module 01 analyze fixture/helper.
- Add LIFF bridge test harness with mocked LINE SDK and login redirect return.

Validation:

- targeted LINE/LIFF tests
- `qa:module01:mock-flow`
- `qa:module01:ui`
- `qa:module01:local`
- staging only if deployed LIFF behavior changes

Unlocks:

- A production smoke can fail less ambiguously and should not waste runtime on fixture/input errors.

Risk: medium, because LIFF behavior crosses client/provider boundary.

### Phase 1: Test Architecture / Fixture System

Goal: unify fixtures across unit, scripts, Playwright, and smoke prep.

Tasks:

- Add `apps/web/src/tests/fixtures/module01/*`.
- Convert script synthetic inputs to fixture imports where feasible.
- Add fixture validation tests against current `validateAnalyzeInput`.
- Add Admin lookup safe response fixtures shared by CLI/app tests.

Validation:

- targeted fixture tests
- affected QA script tests
- `qa:module01:mock-flow`

Unlocks:

- Faster, more reliable runbooks and lower ad hoc scripting.

Risk: low/medium.

### Phase 2: Playwright Real-Route Harness

Goal: cover actual route/component behavior without providers.

Tasks:

- Replace or augment route-intercept static HTML harness.
- Use a real local Next route/test-only route or route handlers with mocked backend.
- Cover checkout-start, LINE incomplete, Email fallback, ReturnURL, `/r/`, paid result shell.

Validation:

- `qa:module01:ui`
- targeted component/route tests

Unlocks:

- UI regressions caught before staging.

Risk: medium due Next test harness complexity.

### Phase 3: Admin API QA Diagnostics

Goal: reduce direct DB/manual dependency without unsafe mutation.

Tasks:

- Add read-only staging/production-safe bind attempt diagnostics if data exists.
- Consider Preview-only fixture endpoints for creating safe result/bind state.
- Keep production Admin API read-only.

Validation:

- Admin API route/helper tests
- Admin CLI schema tests
- staging gate if Preview endpoint added

Unlocks:

- Faster diagnosis with less DB access.

Risk: medium/security-sensitive.

### Phase 4: LINE/LIFF Production Bind Reproduction/Fix

Goal: fix current blocker.

Tasks:

- Use Phase 0 diagnostics to identify whether failure is LIFF endpoint/callback, idToken, state parsing, or bind route.
- Reproduce in staging if possible.
- Fix with targeted tests first.

Validation:

- targeted tests
- mock-flow
- UI
- local
- staging if deployed LIFF behavior changed
- no real production payment

Unlocks:

- Production payment smoke can resume.

Risk: medium/high.

### Phase 5: Production Smoke Retry

Goal: one clean NT$49 card payment with Email/LINE access-link delivery.

Preconditions:

- Phase 0/4 pass.
- `qa:module01:local`, `qa:module01:mock-flow`, `qa:module01:ui`, `qa:module01:staging`, `qa:module01:production-preflight` pass.
- Owner approves manual payment and channel checks.

Risk: high operationally, but should be shorter and less ambiguous.

### Phase 6: Theme Implementation

Goal: implement accepted Theme Architecture without destabilizing payment gate.

Tasks:

- Module Theme Architecture Implementation Plan v0.
- Module 01 Riso Unification slices.
- Core Shell neutral editorial cleanup.

Risk: medium, mostly visual/runtime UI.

## What Not To Do Next

- Do not rerun production payment smoke before LINE bind diagnosis/fix.
- Do not ask owner for more manual LINE/payment retries as a diagnostic method.
- Do not expand production Admin API into mutation support.
- Do not use direct DB as a normal support lookup replacement.
- Do not make staging smoke the default validation for local code changes.
- Do not implement theme UI before current production gate foundation unless owner explicitly changes priority.

## Final Audit Status

The engineering foundation is serviceable for a single-module controlled launch but not yet efficient or reliable enough for repeated production iteration. The highest leverage work is not another smoke attempt; it is a fixture-backed, LIFF-aware, structured local/staging diagnostic foundation that can reproduce the current LINE bind failure before involving production again.
