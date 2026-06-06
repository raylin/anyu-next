# ANYU Theme Architecture v0 Design Archive

## Status

These files are archived design references.

The visual architecture reference is accepted, but product flow and product copy source-of-truth remain the current ANYU app, PM decisions, and active launch-gate documentation.

Do not copy outdated demo copy, old staging assumptions, or design-canvas-only behavior into runtime code without reconciling against the current product rules.

## Archived Files

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

No screenshots are required for this archive. If screenshots are added later, keep them under `screenshots/` and treat them as optional visual aids only.

## Adopted Design Decisions

- Hybrid Theme Park Model.
- Core Shell = neutral editorial.
- Module Journey = module Theme Pack.
- Module 01 = Riso-only.
- Shared Flow Templates = shared structure, module-themed.
- Module 02 Radar preview proves extensibility.
- Riso tokens, motif, and card treatment can guide Module 01 implementation.
- Checkout-start v2 provides the mandatory save gate visual reference.

## Source-of-Truth Boundaries

Accepted as visual architecture reference:

- theme model
- token direction
- Riso visual language
- shared flow structure
- Module 02 extensibility proof
- Checkout-start v2 visual direction

Not accepted as product flow/copy source-of-truth:

- outdated 30-day retention text unless product policy later changes
- old internal-test / no-charge copy
- old generic/elegant Module 01 pages
- old manual LINE ID field
- old data-improvement/training/analytics consent in the mandatory save gate
- old direct payment CTA before access-link save

## Checkout-start Override Rules

Current product rules override design drafts when conflicts exist:

- Checkout-start requires access-link save before payment.
- Desktop / non-mobile: Email only.
- Mobile / mobile browser / LINE in-app: LINE visually above Email, Email fallback below.
- Payment CTA unlocks only after Email save or LINE bind succeeds.
- Email and LINE send access links only, not report body.
- Retention copy follows current product policy; do not hardcode 30 days from older drafts.
- Do not use internal-test/no-charge copy.
- Do not add manual LINE ID field.
- Do not add training, analytics, or de-identified data consent checkbox to the mandatory save gate.
- `/r/` access-link surfaces should include a safety reminder such as “請勿轉傳給他人.”
- NewebPay external provider page is not themed.

If original `§04 checkout-start` conflicts with `§04✦ checkout-start v2`, use checkout-start v2.

## Future Implementation Sequence

No runtime implementation is included in this archive task.

Recommended future tasks:

1. Module Theme Architecture Implementation Plan v0
   - route/surface inventory
   - existing template inventory
   - Riso gap audit
   - implementation slices
2. Module 01 Riso Unification Slice 1
   - checkout-start v2 visual upgrade
   - mandatory save gate preservation
3. Module 01 Riso Unification Slice 2
   - ReturnURL waiting and payment states
4. Module 01 Riso Unification Slice 3
   - paid result, `/r/` return, and delivery artifact
5. Module 01 Riso Unification Slice 4
   - LINE bind, Email save, and expired states
6. Core Shell neutral editorial cleanup

## Production / Runtime Note

This archive does not change runtime UI, checkout behavior, payment behavior, Email/LINE behavior, Vercel env, database schema, or production state.
