# Module 01 Dual Theme v2 Riso Implementation v0 Execution Report

## Summary

Implemented Claude Design’s ANYU v2 Riso Editorial direction as Theme B for Module 01 while preserving Theme A as the classic/control visual. The change is scoped to Module 01 presentation and keeps product behavior, data contracts, analyze, paid generation, LINE fulfillment, prompt/schema/cache/DB, payment/email/ads, and legal semantics unchanged.

## Files Created

- `ai-collaboration/handoffs/2026-05-25-module-01-dual-theme-v2-riso-implementation-v0-handoff.md`
- `apps/web/src/components/modules/ai-temperature/ModuleThemeFrame.tsx`
- `apps/web/src/lib/modules/module-theme.ts`
- `apps/web/src/tests/module-theme.test.ts`
- `ai-collaboration/research/2026-05-25-module-01-dual-theme-v2-riso-implementation-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-25-module-01-dual-theme-v2-riso-implementation-v0-execution-report.md`

## Files Updated

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/m/[moduleSlug]/unlock/[unlockToken]/page.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx`
- `apps/web/src/components/modules/ai-temperature/AiTemperatureResult.tsx`
- `apps/web/src/lib/events/types.ts`
- `apps/web/src/styles/globals.css`
- `apps/web/src/tests/ai-temperature-result.test.tsx`
- `apps/web/src/tests/event-metadata.test.ts`
- `apps/web/e2e/module-01-smoke.spec.ts`
- `ai-collaboration/summaries/summary_log.md`

## Design Files Used

- `docs/design/anyu-v2/anyu-tokens-v2.css`
- `docs/design/anyu-v2/DESIGN_SYSTEM_v2.md`
- `docs/design/anyu-v2/MIGRATION_v1.1_to_v2.md`
- `docs/design/anyu-v2/handoff-v2.html`
- `docs/design/anyu-v2/ui-v2-atoms.jsx`
- `docs/design/anyu-v2/ui-v2-components.jsx`
- `docs/design/anyu-v2/screens-v2.jsx`

## Theme Architecture

- Added a Module 01-only theme controller.
- Uses localStorage keys `module01_theme_variant` and `module01_theme_source`.
- Uses `data-module-theme="classic|riso"` and `.anyu-v2` for local visual activation.
- Avoids a global multi-theme framework.

## Theme A Preservation

- Theme A remains the classic default/control.
- The canonical v1.1 token file remains unchanged.
- Existing copy, CTA availability, validation, API calls, payloads, result content, locked/unlocked states, and LINE behavior remain unchanged.

## Theme B Implementation

Theme B applies Riso Editorial styling to Module 01:

- riso paper background and halftone grain
- thick ink borders
- sharp 2-4px radii
- solid offset shadows
- ultramarine/riso-magenta/vermilion accents
- Fraunces italic numeric treatment
- Space Mono label treatment
- numbered signal rows
- temperature stripe meters
- riso-styled paid/contact/share/unlocked result surfaces

## A/B Assignment

- First Module 01 visit assigns `classic` or `riso` 50/50.
- Assignment persists locally.
- Manual override wins.
- Assignment is client-first; a brief pre-hydration classic state is possible and documented.

## Manual Toggle

- Added a small `柔和 / 鮮明` toggle above Module 01 content.
- Toggle persists manual choice.
- Toggle emits `theme_switch_clicked` with safe theme metadata when events are available.

## Event Metadata

Added safe metadata where practical:

- `themeVariant`
- `themeSource`

No raw input, result JSON, paid result JSON, LINE identifiers, tokens, codes, email, or secrets are included.

## Tests Added

- Module theme assignment/persistence/manual override unit tests.
- Event metadata test for safe theme metadata and `theme_switch_clicked`.
- Result render test for theme wrapper/toggle presence.
- Playwright smoke coverage for manual toggle persistence.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 28 test files / 150 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: blocked by local Chromium launch failure before app assertions. Error class: macOS `mach_port_rendezvous` permission denied. The build step inside the e2e command completed before the browser launch failure.

## Staging / Visual Notes

- Production was not deployed.
- Staging deployment was not manually refreshed beyond pushing this commit to `origin/staging`.
- Visual browser QA still needs staging/manual review because local Playwright Chromium failed to launch in this harness before page-level assertions.

## Known Technical Debt

- Theme B is a broad scoped CSS adaptation over current components, not a complete JSX replacement for every high-fidelity v2 screen.
- Client-first A/B assignment may briefly show Theme A before hydration.

## Tech Debt Review

### New Technical Debt Introduced

- Theme B fidelity may need one additional visual pass after staging screenshots.

### Existing Technical Debt Observed

- Local Playwright Chromium launch remains unreliable in this harness.
- Temporary LIFF diagnostic mode from prior work remains until removed.

### Opportunistic Cleanup Completed

- Kept v2 tokens out of canonical Theme A `tokens.css` after snapshot tests caught the risk.

### Deferred Cleanup Candidates

- Add a visual-regression screenshot workflow for Theme A and Theme B.
- Remove temporary LIFF diagnostic UI after fulfillment debugging is complete.

### Recommended Follow-up

Run staging mobile visual QA against the v2 source screens, especially landing, result, paid preview, contact, and unlocked result.

## Deviations From Handoff

- Theme B uses scoped CSS and current component markup rather than a full JSX port for all v2 screens. This preserves data/product contracts and still applies the v2 visual primitives across the requested funnel surfaces.

## Git Commit

Recorded in the final Codex completion summary.

## Staging Push

Recorded in the final Codex completion summary.

## Remaining Uncertainties

- Final visual fidelity should be judged with staging screenshots or real-device review.
- Whether the client-first assignment flash is acceptable for the experiment.

## Recommended Next Step

Perform mobile visual QA for both `柔和` and `鮮明`, then decide whether Theme B is ready for a low-traffic A/B readout or needs another fidelity pass against the v2 reference.
