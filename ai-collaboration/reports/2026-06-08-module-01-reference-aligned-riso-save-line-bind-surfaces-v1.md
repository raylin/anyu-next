# Module 01 Reference-Aligned Riso Save + LINE Bind Surfaces v1

## Metadata

- task name: Module 01 Reference-Aligned Riso Save + LINE Bind Surfaces v1
- date: 2026-06-08
- report path: `ai-collaboration/reports/2026-06-08-module-01-reference-aligned-riso-save-line-bind-surfaces-v1.md`
- commit: pending final commit
- branch / push status: pending
- model / effort: GPT-5 Codex, high effort
- taskStartedAt: 2026-06-08T00:09:35Z
- taskCompletedAt: 2026-06-08T00:16:55Z
- totalWallClockDuration: 7m20s
- humanWaitDuration: 0m
- netCodexWorkDuration: 7m20s

## Context

- why this task exists: Module 01 Riso Flow Surface Polish v0 passed functionally, but owner visual review found LINE bind and checkout save surfaces still looked too generic and not sufficiently aligned with the accepted Riso reference.
- upstream blocker / mainline context: Gate 1 functional smoke passed, production remains fail-closed by default, and Module 01 is Riso-only at runtime.
- out-of-scope items: production runtime, payment, real Email/LINE, Vercel env, DB mutation, Module 02, CoreShell redesign, provider/payment/access-link logic, LIFF bind logic, Email save logic, and archived copy replacement.

## Visual Spec Mapping

| Reference element | Current component / surface before v1 | Required implementation | v1 result |
| --- | --- | --- | --- |
| Thick ink bordered save card | Checkout LINE and Email save blocks had Riso colors/classes but still read as ordinary blocks/forms. | Shared Riso save panel with 1.5-2px ink border, near-square radius, structured spacing, and offset accent/ink shadow. | `anyu-riso-save-option` now uses heavy ink border, sharp radius, offset shadow, and top/action structure for both LINE and Email. |
| Reference primary CTA | LINE save link, Email submit button, and return-to-report button had inconsistent systems. | Consistent dark CTA with accent offset, shared dimensions, and serif rhythm. | `anyu-riso-save-cta` / `anyu-riso-flow-cta` now force shared dark full-width CTA treatment with accent2 offset. |
| Reference module flow heading / step language | Checkout save section used generic `report access link`; LINE bind used generic card heading. | Consistent eyebrow/step/header spacing and hierarchy. | Checkout uses `STEP 1 · report access link`; LINE bind uses `// 連結保管`, hero copy, and stamp. |
| Paper + accent block system | LINE bind still appeared like a generic rounded white card with light status messages. | Riso flow surface using paper background, thick ink panel, accent geometry/stamp, and status card treatment. | LINE bind now uses `anyu-riso-reference-panel`, flow hero, stamp, dashed divider, and state cards. |
| Email fallback layout | Email input/button still felt like a separate generic form under the LINE card. | Email fallback fits the same save-card grammar while preserving desktop/mobile behavior. | Email now uses the same save-option top-line/icon/action grammar as LINE, with the current Email input and marketing opt-in preserved. |

## Why v0 Was Insufficient

- v0 removed obvious generic shell tearing and added Riso markers, but it mostly applied styling to existing generic markup.
- It did not adopt the reference structure: icon tile, panel hero, step/eyebrow rhythm, separated card body/action rows, or stronger Riso card geometry.
- LINE bind still looked like a generic rounded result card because the visual hierarchy remained kicker → title → paragraphs → status.
- Checkout LINE and Email still felt like different systems because LINE was a link card and Email was a form card without shared top/action anatomy.

## Scope

- what changed: reference-aligned markup and CSS for LINE bind and checkout save surfaces.
- what did not change: behavior, copy semantics, payment gating, Email save route/action, LINE LIFF/bind logic, provider logic, access-link creation/resolution, runtime config, or production state.

## Implementation Summary

- files / areas changed:
  - `LineRecoveryBindBridge.tsx`: added reference-style flow hero, stamp, copy block, and state-card markers.
  - checkout-start page: added save option top-line/icon/action structure for LINE and Email; upgraded save gate heading.
  - `globals.css`: refined Riso flow panel/save card/status/CTA/field rules to match reference tokens more closely.
  - server-render tests: added structural assertions for reference-aligned classes/markers.
- key design decisions:
  - structural reference alignment over color-only polish.
  - small scoped classes, not a broad component library.
  - no stale archive copy imported; current product copy remains source-of-truth.
- local / opportunistic cleanup decisions: none beyond the scoped visual structure.

## Surfaces Changed

- LINE bind loading page:
  - now has a reference-style `// 連結保管` hero, stamp, paper/ink panel, and state-card styling.
- LINE bind success page:
  - success state uses the same Riso state-card class and shared CTA treatment.
- LINE bind fallback/failure:
  - fallback content uses the same state-card grammar and shared return CTA treatment.
- Checkout LINE save option:
  - now has icon tile, label/copy top-line, separated action area, thick ink card, accent offset shadow, and dark CTA.
- Checkout Email fallback/save option:
  - now uses the same icon/top-line/action grammar while preserving Email input, help copy, and marketing opt-in.
- Save success/status/badge:
  - status boxes use left-accent ink-bordered Riso treatment; saved badge remains safe and visible.

## Components / Primitives / Classes

- reused:
  - `Card`
  - `Button`
  - existing `.anyu-v2` Riso token scope
  - previous `data-riso-flow` / `data-save-option` markers
- refined / added:
  - `anyu-riso-reference-panel`
  - `anyu-riso-flow-hero`
  - `anyu-riso-flow-eyebrow`
  - `anyu-riso-flow-stamp`
  - `anyu-riso-flow-copy-block`
  - `anyu-riso-flow-state-card`
  - `anyu-riso-save-gate-heading`
  - `anyu-riso-save-option-topline`
  - `anyu-riso-save-icon`
  - `anyu-riso-save-option-action`

## Behavior Preserved

- Desktop checkout remains Email-only before payment unlock.
- Mobile checkout remains LINE-first with Email fallback.
- Email saved state still unlocks payment.
- LINE contact-only/incomplete state still does not unlock payment.
- No report-body delivery promise, no internal-test/no-charge copy, and no classic/Riso A/B path were introduced.
- No LIFF, Email save, payment, access-link, provider, runtime config, or DB behavior was changed.

## Visual Review Notes

- No screenshots were captured in this session because no Browser tool was available.
- Structural local/UI validation passed; owner visual review on deployed staging remains the acceptance check for visual sufficiency.
- Expected visible improvement:
  - LINE bind should read less like a generic rounded SaaS card and more like the Riso reference flow panel.
  - Checkout LINE and Email save should feel like one system through shared icon tile, panel, CTA, and status grammar.

## Validation

- commands run:
  - `cd apps/web && corepack pnpm lint`: pass.
  - `cd apps/web && corepack pnpm test src/tests/line-recovery-liff-page.test.tsx src/tests/newebpay-checkout-start-page.test.tsx`: pass, 2 files / 17 tests.
  - `cd apps/web && corepack pnpm test`: pass, 104 files / 713 tests.
  - `cd apps/web && corepack pnpm build`: pass.
  - `cd apps/web && corepack pnpm run qa:module01:ui`: pass, 5 Playwright tests.
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
  - real Email/LINE: skipped because not allowed.
  - staging channel sends: skipped because not allowed.
  - staging full gate: skipped because no deployed staging proof was required before owner visual review.

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

## Remaining Visual Gaps

- ReturnURL, paid result, `/r`, expired, invalid, and pending states still need reference-aligned Riso treatment.
- Fine visual tuning for spacing, accent amount, stamp shape, and card density should come from owner staging review.
- No screenshot artifact was produced in this session.

## Tech Debt / Cleanup Notes

- new technical debt introduced: none.
- existing technical debt observed:
  - Riso alignment is not complete across all owned Module 01 flow pages.
  - archived design files remain visual reference only and contain stale product assumptions.
- opportunistic cleanup completed: none.
- deferred cleanup candidates:
  - next Riso alignment pass for ReturnURL / paid result / `/r` / expired states.

## Decisions Made

- Treat v1 as structural reference alignment, not color-only polish.
- Keep the implementation scoped to CSS/classes/markup anatomy around existing behavior.
- Use tests to enforce structural/style markers rather than pixel-perfect screenshots.

## Uncertainties / Blockers

- No functional blockers.
- Owner staging visual review is still required before declaring visual acceptance.

## Recommended Next Step

Owner visual review on staging. Then decide whether to continue Riso visual alignment for ReturnURL / paid result / `/r` / expired states, or move to CoreShell migration.

## Paste-Back Context

Module 01 Reference-Aligned Riso Save + LINE Bind Surfaces v1 reworked LINE bind and checkout save surfaces toward the archived Riso reference. It added reference-style flow hero/stamp/state-card structure, shared LINE/Email save-card top/action anatomy, dark shared CTAs, icon tiles, thick ink borders, and offset shadows. Current app copy and all payment/access-link/LIFF/Email behavior were preserved. Required local tests/build/UI/local/mock/no-card QA passed; production was untouched. Owner staging visual review remains the next acceptance step.
