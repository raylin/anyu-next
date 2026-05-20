# ANYU Brand Mark v1.1 Adoption v0 Review Bundle

## 1. Summary

Adopted the Claude Design ANYU Brand Mark v1.1 raw bundle into the repo as both:

- a canonical brand-mark source under `docs/design-system/brand/`
- a preserved raw reference bundle under `docs/design-system/reference/brand-v1.1/`

This pass stayed narrow. It did not broadly replace existing brand usage across the app.

## 2. Inbox Verification

Verified inbox bundle exists at:

- `ai-collaboration/inbox/2026-05-20-brand-mark-v1.1/`

Verified source files:

- `LOGO_v1.1.md`
- `anyu-mark.svg`
- `anyu-mark.css`
- `anyu-mark.jsx`
- `anyu-mark-demo.html`
- `anyu-tokens-v1.1.css`

## 3. Canonical Brand Files

Created canonical brand files:

- `docs/design-system/brand/anyu-brand-mark-v1.1.md`
- `docs/design-system/brand/anyu-mark.svg`
- `docs/design-system/brand/anyu-mark.css`
- `docs/design-system/brand/anyu-mark.jsx`
- `docs/design-system/brand/anyu-mark-demo.html`

## 4. Reference-Preserved Raw Bundle

Preserved raw Claude Design outputs under:

- `docs/design-system/reference/brand-v1.1/`

These are intentionally reference-only and should not be imported by the production app.

## 5. Token Adoption

Merged brand-mark token additions into canonical and app token files:

- `docs/design-system/tokens-v1.1.css`
- `apps/web/src/styles/tokens.css`

Added token set:

- `--anyu-mark-min`
- `--anyu-mark-favicon`
- `--anyu-mark-favicon-hires`
- `--anyu-mark-app-icon`
- `--anyu-mark-inline`
- `--anyu-mark-divider`
- `--anyu-mark-unread`
- `--anyu-mark-loading`
- `--anyu-mark-loading-size`
- `--anyu-mark-stamp`
- `--anyu-mark-cycle`
- `--anyu-mark-stagger`

The existing strict v1.1 token system was preserved.

## 6. App-Safe Implementation

Added production-safe app files:

- `apps/web/src/components/anyu/AnyuMark.tsx`
- `apps/web/src/styles/anyu-mark.css`
- `apps/web/public/favicon.svg`

Implementation choices:

- `AnyuMark` only, no broad lockup system added to app code
- app-local CSS is a narrow subset for the mark base and typing animation only
- favicon uses fixed fill color instead of `currentColor`
- root metadata now points to `/favicon.svg`

## 7. What Was Not Changed

- existing `Wordmark` usage was not broadly replaced
- app runtime, model, prompt/schema, DB schema, legal semantics, and LINE flow were unchanged
- no PNG app icon generation was added
- no manifest work was added

## 8. Validation Notes

Added practical tests for:

- token sync including new mark tokens
- `AnyuMark` accessibility and animated/decorative states
- fixed-color favicon asset

## 9. Deferred Items

- full brand-mark rollout across all app surfaces
- app icon PNG generation
- AnyuLockup production component, if later needed
- LINE OA profile/export asset generation

## 10. Issues For ChatGPT Review

- Whether the app should keep `Wordmark` text-only for now or start introducing `AnyuMark` into select shared shells
- Whether a future `AnyuLockup` component is worth formalizing in app code
- Whether favicon-only adoption is sufficient before a broader production brand refresh
