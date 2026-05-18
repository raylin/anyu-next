# ANYU Mobile Visual Polish Review Bundle

## Summary

Applied a narrow mobile polish pass to the existing ANYU prototype without changing runtime behavior, API behavior, event names, or the fake-door flow.

## Screenshot Issues Addressed

1. Reduced the vertical weight of the first screen by tightening spacing and shrinking the visible form block.
2. Removed the awkward floating right-side tagline and replaced it with a cleaner topbar structure.
3. Made CTA disabled and enabled states explicit through both copy and styling.
4. Increased the readability of unselected chips.
5. Slightly strengthened the hero accent treatment for `冷掉`, especially under dark-mode token conditions.

## Files Changed

- `experiments/ambiguous_temperature_v0/templates/index.html`
- `experiments/ambiguous_temperature_v0/static/styles.css`
- `experiments/ambiguous_temperature_v0/static/app.js`
- `experiments/ambiguous_temperature_v0/README.md`

## Layout Changes

- reduced top-level mobile spacing between navbar, hero, and input card
- tightened hero gap and input-card inner gap
- kept textarea in the target range with a smaller visible footprint
- reduced vertical space between privacy helper, chips, CTA, and caption text
- kept the page mobile-first and premium rather than converting it to a dense utility layout

## CTA State Changes

- empty state:
  - button label becomes `先貼一段對話`
  - button is actually disabled
  - visual state now reads as intentional rather than low-contrast enabled
- filled state:
  - button label becomes `分析我的曖昧溫度`
  - button is enabled
  - primary ink button regains stronger conversion contrast

## Chip Contrast Changes

- unselected chips now have:
  - stronger border visibility
  - stronger text color
  - a subtle surface fill
  - clearer hover / focus affordance
- selected chip remains gold-accent based

## Brand / Tagline Changes

- removed the broken multi-line floating top-right tagline
- moved the relationship-signal line under the `暗語 ANYU` wordmark
- added a short right-side topbar label: `曖昧溫度計`

## Remaining Visual Questions

1. Should the subline under `暗語 ANYU` stay on the first screen, or should the topbar become even quieter?
2. Is the current empty-state CTA strong enough, or should the disabled state use a lighter surface treatment instead of a muted ink block?
3. Should the hero headline tighten one step further on very short mobile viewports, or is the current balance correct?
