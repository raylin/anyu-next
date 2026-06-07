# Module 01 Riso Flow Surface Polish v0

## Metadata

- task name: Module 01 Riso Flow Surface Polish v0
- date: 2026-06-07
- report path: `ai-collaboration/reports/2026-06-07-module-01-riso-flow-surface-polish-v0.md`
- commit: pending final commit
- branch / push status: pending
- model / effort: GPT-5 Codex, high effort
- taskStartedAt: 2026-06-07T23:12:24Z
- taskCompletedAt: 2026-06-07T23:22:16Z
- totalWallClockDuration: 9m52s
- humanWaitDuration: 0m
- netCodexWorkDuration: 9m52s

## Context

- why this task exists: Theme Architecture Infrastructure v0 made Module 01 Riso-only, but owner review identified visual tearing in LINE bind states and checkout save UI.
- upstream blocker / mainline context: Gate 1 functional smoke passed; production remains fail-closed by default; this task is visual polish only.
- out-of-scope items: production runtime, payment, real Email/LINE, Vercel env, DB mutation, Module 02, CoreShell redesign, provider/payment/access-link business logic, and pixel-perfect archive recreation.

## Scope

- what changed: added scoped Riso flow/save visual primitives and applied them to LINE recovery bind and checkout-start save gate surfaces.
- what did not change: copy semantics, LIFF/bind behavior, Email save behavior, mandatory save gate logic, payment provider logic, access-link generation/resolution logic, runtime config, production state, and real channel behavior.

## Implementation Summary

- files / areas changed:
  - `LineRecoveryBindBridge` now renders inside the existing Module shell instead of nesting a generic `main.anyu-shell`.
  - Checkout-start recovery gate now exposes `data-riso-flow="checkout-save"` and `data-save-option="line|email"` markers.
  - LINE and Email save CTAs now share the same Riso CTA class.
  - `.anyu-v2` CSS now includes scoped Riso flow card, save option, status box, badge, and CTA primitives.
  - Vitest and Playwright coverage now asserts Riso flow/save markers.
- key design decisions:
  - kept the slice as CSS/classes/data markers, not a broad component library.
  - scoped all new styling under `.anyu-v2` so CoreShell and non-module surfaces are not pulled into Riso.
  - preserved current app copy as source-of-truth; archived design informed visual treatment only.
- local / opportunistic cleanup decisions:
  - removed nested shell markup from LINE bind bridge because it caused generic shell structure inside a Module shell.

## Surface Changes

- LINE bind loading/success/fallback:
  - before: generic result card/status styles with old page-shell structure.
  - after: Module-shell-contained Riso flow card, paper/grid texture, ink border, shared status boxes, and matching return CTA.
- checkout save section:
  - before: LINE used storefront-link treatment while Email used a button/form card; cards and statuses felt like different systems.
  - after: LINE and Email share save-card markers, Riso card border/shadow language, matching CTA treatment, shared saved/required status patterns, and stable test selectors.
- saved state / warnings:
  - saved badge and success/required warnings now use shared Riso status classes without changing status copy or unlock logic.

## Behavior Preservation

- Email save route/action remains unchanged.
- LINE bind route, LIFF initialization, idToken handling, diagnostics, and redirect logic remain unchanged.
- Payment CTA gating remains unchanged:
  - desktop remains Email-only before unlock.
  - mobile remains LINE-first with Email fallback.
  - contact-only LINE state still does not unlock payment.
  - Email or deliverable LINE saved state still unlocks payment.
- No report-body delivery promise, internal-test/no-charge copy, classic theme path, or token/private output was introduced.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm lint`: pass.
  - `cd apps/web && corepack pnpm test src/tests/line-recovery-liff-page.test.tsx src/tests/newebpay-checkout-start-page.test.tsx`: pass, 2 files / 17 tests.
  - `cd apps/web && corepack pnpm test`: pass, 104 files / 713 tests.
  - `cd apps/web && corepack pnpm build`: pass.
  - `cd apps/web && corepack pnpm run qa:module01:ui`: pass after installing missing Playwright Chromium into the repo-required browser cache.
  - `cd apps/web && corepack pnpm run qa:module01:local`: pass, `gateStatus=pass`.
  - `cd apps/web && corepack pnpm run qa:module01:mock-flow`: pass.
  - `cd apps/web && corepack pnpm run qa:result-checkout:no-card`: pass.
- gateStatus: pass
- commandExitCode: 0 for final validation commands
- requiredChecksStatus: pass
- optionalChecksStatus: not_applicable
- targetDeployCommit: not_applicable
- deployedCommitAtGateStart: not_applicable
- deployedCommitAtGateEnd: not_applicable
- freshnessStatus: not_applicable
- gates skipped and why:
  - production runtime/payment/preflight: skipped because this is visual/local QA scope.
  - real Email/LINE: skipped because not allowed and not needed for visual polish.
  - staging real channels: skipped because not allowed.
  - `qa:module01:staging`: skipped because no deployed staging proof was required for this local visual slice; `qa:result-checkout:no-card` ran its structured staging-safe no-card checks.

## Safety

- production runtime enabled: no
- payment run: no
- Email sent: no
- LINE sent: no
- Vercel env changed: no
- DB mutated: no production DB mutation; staging-safe no-card QA used existing structured helper
- secrets/private data exposed: no

## Result

- result: pass
- first failure category: not_applicable
- blocker status: not_applicable

## Known Visual Gaps for Owner Review

- This is not pixel-perfect against the archive; spacing, accent strength, and illustration/texture density still need owner visual review.
- ReturnURL, paid result, `/r`, expired, invalid, and pending states were not visually polished in this slice beyond existing Module shell coverage.
- CoreShell homepage/legal surfaces were intentionally not redesigned.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed:
  - archived reference still contains stale copy/product assumptions and must remain visual-only.
  - additional Riso refinement is needed for ReturnURL, paid result, `/r`, expired, invalid, and pending states.
- opportunistic cleanup completed:
  - LINE bind bridge no longer nests a generic page shell inside Module shell.
- deferred cleanup candidates:
  - owner-guided visual polish for remaining Module 01 owned flow pages.

## Decisions Made

- Use small scoped primitives/classes instead of a broad design-system extraction.
- Use stable data markers for Riso flow/save contracts so visual regressions can be tested without screenshot pixel matching.
- Keep behavior/copy unchanged except for classes/markers.

## Uncertainties / Blockers

- No functional blockers.
- Owner visual review is still required to decide whether the result is visually sufficient or needs another polish pass.

## Recommended Next Step

Owner visual review on staging, then decide between more Riso visual polish, CoreShell migration, or Repeated / Concurrency Paid-Generation Benchmark v0.

## Paste-Back Context

Module 01 Riso Flow Surface Polish v0 reduced visual tearing in LINE bind and checkout save surfaces. LINE bind now uses the Module shell without nested generic shell markup and has Riso flow card/status/CTA styling. Checkout save now gives LINE and Email shared save-card, CTA, badge, and status styling with stable data markers. Behavior, copy semantics, payment gating, Email save, LINE bind, and access-link logic were preserved. Local/test/build/UI/local/mock/no-card gates passed; production was untouched.
