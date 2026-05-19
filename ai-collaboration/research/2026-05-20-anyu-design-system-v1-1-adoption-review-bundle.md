# ANYU Design System v1.1 Adoption Review Bundle

## 1. Summary

ANYU Design System v1.1 is now adopted as the current engineering source of truth.

This task preserved the uploaded Claude Design v1.1 files, established stable canonical paths, synced the app token copy, and reapplied the current Module 01 staging UI to the stricter v1.1 pairing rules.

Scope stayed tight:

- no runtime architecture change
- no provider/model change
- no prompt/schema change
- no DB schema change

## 2. Files Adopted

- `docs/design-system/anyu-design-system-v1.1.md`
- `docs/design-system/ux-flow-v1.1.md`
- `docs/design-system/tokens-v1.1.css`
- `docs/design-system/reference/v1.1/DESIGN_SYSTEM_v1.1.md`
- `docs/design-system/reference/v1.1/UX_FLOW.md`
- `docs/design-system/reference/v1.1/anyu-tokens-v1.1.css`
- `docs/design-system/reference/v1.1/handoff.html`
- `docs/design-system/reference/v1.1/design-canvas.jsx`
- `docs/design-system/reference/v1.1/ui.jsx`
- `docs/design-system/reference/v1.1/screens.jsx`
- `docs/design-system/reference/v1.1/reference.jsx`
- `docs/design-system/reference/v1.1/audit.jsx`
- `docs/design-system/reference/v1.1/ios-frame.jsx`

## 3. New Canonical Design Locations

- Canonical markdown spec: `docs/design-system/anyu-design-system-v1.1.md`
- Canonical flow spec: `docs/design-system/ux-flow-v1.1.md`
- Canonical token file: `docs/design-system/tokens-v1.1.css`
- App token copy: `apps/web/src/styles/tokens.css`
- High-fidelity reference-only bundle: `docs/design-system/reference/v1.1/`

Historical v1.0 files remain in place:

- `docs/design-system/anyu-design-system-v1.md`
- `docs/design-system/tokens.css`

## 4. Token Sync Result

- `docs/design-system/token-v1.1.css` was normalized into the canonical filename `docs/design-system/tokens-v1.1.css`
- `apps/web/src/styles/tokens.css` was synced from `docs/design-system/tokens-v1.1.css`
- a test now checks both required v1.1 tokens and exact file sync equality

## 5. Staging Drift Fixed

- observed signals no longer render as pale text inside pale cards; they now use the v1.1 list treatment on page background with ink text, ink numeric values, and thin accent bars
- paid preview now uses a dark readable Card A plus readable locked light B/C cards where only the body is blurred
- CTA/chip pairing now follows v1.1 directly:
  - default chip = surface bg + ink text
  - active chip = solid accent bg + surface text
  - primary CTA = ink-dark bg + ink-onDark text
- loading status no longer uses the old pale mini-panel; it now uses a moon + dot pulse + reminder-card treatment within the same visual language
- redundant v1.0/v0.1-style drift in docs was removed so v1.1 is explicit everywhere

## 6. Component Changes

- `AiTemperatureLanding.tsx`
  - adopted v1.1 loading title/subtitle flow
  - passes structured loading state into the input card
- `InputCard.tsx`
  - replaced the old light status panel with a v1.1 loading shell
  - removed the stale “usually within tens of seconds” promise
- `AiTemperatureResult.tsx`
  - changed observed signals from card-contained treatment to plain list section
- `PaidPreviewCard.tsx`
  - re-layered A/B/C cards to match dark-sample + light-locked hierarchy
- `TemperatureCard.tsx`
  - updated copy hierarchy to better match v1.1 tone
- `globals.css`
  - re-applied the core pairings and readability rules

## 7. Remaining Drift / Not Yet Implemented

- loading is still inline rather than a full dedicated loading screen from the UX flow spec
- share actions remain simple text/clipboard behavior rather than the fuller v1.1 multi-action share surface
- interactive real-device judgment is still needed for final contrast and rhythm confirmation

## 8. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## 9. Staging Smoke Result

- completed after push in the final execution flow
- final staging smoke outcome is recorded in the final Codex completion summary

## 10. Issues For ChatGPT Review

- whether the inline loading treatment is enough for v1.1, or whether the dedicated loading screen should be the next design pass
- whether the share area should move closer to the fuller v1.1 three-action structure before launch
- whether the current result hierarchy is now close enough to freeze the design baseline before model/latency iteration
