# Archive Theme Architecture Design Assets v0

## Date

2026-06-06

## Completed Work

- Verified the Theme Architecture archive directory exists.
- Verified the expected code/memo design files are present.
- Added a README with source-of-truth boundaries and implementation override rules.
- Updated dashboard and summary log to reference the archived design package.

## Archive Path

`ai-collaboration/design/theme-architecture-v0/`

## Files Archived

- `ANYU Theme Architecture.html`
- `THEME_ARCHITECTURE_MEMO.md`
- `CHECKOUT_PATCH_MEMO.md`
- `anyu-tokens-v2.css`
- `design-canvas.jsx`
- `ui-v2-atoms.jsx`
- `pay-shell-atoms.jsx`
- `riso-screens.jsx`
- `checkout-v2.jsx`
- `core-shell-screens.jsx`
- `module02-radar.jsx`
- `diagrams.jsx`
- `README.md`

## Screenshot Decision

No screenshots were archived.

Screenshots are optional for this design package, and the owner decision allows code/memo files to be sufficient for Codex reference.

## Adopted Design Decisions

- Hybrid Theme Park Model.
- Core Shell = neutral editorial.
- Module Journey = module Theme Pack.
- Module 01 = Riso-only.
- Shared Flow Templates = shared structure, module-themed.
- Module 02 Radar preview proves extensibility.
- Riso tokens, motif, and card treatment can guide Module 01 implementation.
- Checkout-start v2 provides mandatory save gate visual reference.

## Source-of-Truth Boundaries

These files are design references.

Current ANYU app behavior and PM decisions remain product flow/copy source-of-truth. Codex should not copy outdated demo copy or old staging assumptions from the design files when they conflict with current rules.

Not adopted as source-of-truth:

- outdated 30-day retention text unless product policy later changes
- old internal-test / no-charge copy
- old generic/elegant Module 01 pages
- old manual LINE ID field
- old data-improvement/training/analytics consent in save gate
- old direct payment CTA before access-link save

## Implementation Override Rules

- Checkout-start requires access-link save before payment.
- Desktop / non-mobile shows Email only.
- Mobile / mobile browser / LINE in-app shows LINE above Email fallback.
- Payment CTA unlocks only after Email save or LINE bind succeeds.
- Email and LINE send access links only, not report body.
- Retention copy follows current product policy.
- `/r/` access-link surfaces should include “請勿轉傳給他人” or equivalent safety reminder.
- NewebPay external provider page is not themed.
- If original `§04 checkout-start` conflicts with `§04✦ checkout-start v2`, use checkout-start v2.

## Future Implementation Sequence

No runtime implementation was done.

Recommended sequence:

1. Module Theme Architecture Implementation Plan v0
2. Module 01 Riso Unification Slice 1: checkout-start v2 visual upgrade with mandatory save gate preserved
3. Module 01 Riso Unification Slice 2: ReturnURL waiting/payment states
4. Module 01 Riso Unification Slice 3: paid result, `/r/` return, delivery artifact
5. Module 01 Riso Unification Slice 4: LINE bind, Email save, expired states
6. Core Shell neutral editorial cleanup

## Production Safety

- Production runtime was not enabled.
- Production checkout was not enabled.
- No production payment was run.
- No Email or LINE message was sent.
- No Vercel env was modified.
- No database migration was applied.

## Validation

Documentation validation was run after archiving. Results are recorded in the completion summary.

## Tech Debt Review

- New technical debt introduced: none.
- Existing technical debt observed: design files are reference-only and may contain older product assumptions; README now documents override rules.
- Opportunistic cleanup completed: added explicit source-of-truth guardrails.
- Deferred cleanup candidates: implementation plan should inventory runtime surfaces before any visual adoption.

## Suggested Next Steps

Recommended next task: Module Theme Architecture Implementation Plan v0, unless the owner chooses to resume production readiness first.
