# Claude Patch Reconciliation + Final UI Finishing Plan v0

Date: 2026-05-21

## 1. Summary

This pass reconciles Claude Design's latest polish direction with the current ANYU v1.1 implementation, the approved AnyuMark brand system, and the now-completed three-phase typography migration. The result is a narrow final UI finishing plan that preserves the current product/runtime/legal/LINE behavior, rejects literal moon restoration, and translates the remaining polish asks into an AnyuMark-consistent final pass.

## 2. Source Inputs

Primary source inputs reviewed:

- `docs/design-system/reference/ui-polish-v1.1/STAGING_AUDIT_v1.1.md`
- `docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md`
- `ai-collaboration/research/2026-05-21-module-01-ui-polish-backlog-consolidation-v0.md`

Inbox/source preservation check:

- checked `ai-collaboration/inbox/2026-05-21-ui-polish-v1.1/`
- files present:
  - `STAGING_AUDIT_v1.1.md`
  - `FONT_MIGRATION_v1.1.md`
  - `font-explorations.html`
- no separate standalone `POLISH_PATCH_v1.1.md` file was present in the inbox or Downloads drop area
- conclusion:
  - the latest actionable Claude patch content is represented by the current staging audit, not by a separate additional patch file

Recent implementation/QA context considered:

- brand-mark selective rollout completed and staging-QA passed
- font migration Phases 1, 2, and 3 completed and staging-QA passed
- conversion / CTA rhythm polish completed and staging-QA passed

## 3. Current UI State

Current implemented UI state is materially ahead of the original audit baseline:

- header/result/share surfaces already use the selective `AnyuMark` lockup
- orphan purple circles were already removed
- loading ornament already uses `AnyuMark`
- favicon / public icon asset wiring is already in place
- Latin display already migrated to `Instrument Serif`
- long-form editorial reading already migrated selectively to `Newsreader`
- quote / whisper surfaces already migrated selectively to `LXGW WenKai`
- result CTA rhythm, share affordance, and paid-preview hierarchy already received a narrow polish pass
- LINE-first notification flow, Email fallback, legal footer links, and low-key production behavior are already live and should stay stable

That means the remaining work is no longer “bring staging to v1.1 from 75%.” It is now a smaller finishing pass focused on tone, hierarchy, spacing, and card refinement.

## 4. Reconciliation Principle

Use these principles for every remaining patch item:

1. Preserve the approved AnyuMark system as the canonical brand language.
2. Translate requests for “moon” or “mystical accent” into:
   - AnyuMark
   - mini lockup
   - subtle glow
   - tokenized atmosphere
   not literal moon/crescent restoration.
3. Preserve completed font migration decisions:
   - `Instrument Serif` for Latin display
   - `Newsreader` for long-form reading
   - `LXGW WenKai` for short quote / whisper surfaces
4. Prefer small component-level tone/hierarchy changes over broad redesign.
5. Keep the final pass UI-only and safe for current low-key production.

## 5. Patch Item Reconciliation Table

| Claude Patch Item | Decision | Final Interpretation | Implementation Task |
|---|---|---|---|
| Moon icon in header / brand accents | Adapt to AnyuMark | Use approved AnyuMark / mini lockup / subtle glow; do not restore moon | Already mostly done; only tune if spacing/tone needs it |
| Header should feel more branded | Already Done | Selective lockup is already live | No new task unless tiny spacing tune needed |
| Restore stronger quote-card feeling | Adopt | Make the result quote card feel more intentional as a quote surface using existing kai/t-quote system | Final UI Finishing |
| Share/persona card needs stronger visual identity | Adopt lightly | Add subtle background/layer/stamp-like polish compatible with AnyuMark, not a full redesign | Final UI Finishing |
| Insight recommendation / ending line should feel softer or more italic | Adopt | Use a softer ending-line treatment within the current card, likely on the final recommendation line only | Final UI Finishing |
| Section labels should be more consistently system-like | Adopt | Normalize mono/token label treatment across result sections | Final UI Finishing |
| Privacy helper feels too flat | Adopt | Improve layering/hierarchy of the input privacy helper without changing legal semantics | Final UI Finishing |
| Inline next-step CTA card feels a bit hard | Adopt | Soften card border/tone and disabled-CTA tone rather than moving layout | Final UI Finishing |
| Paid locked cards need clearer locked hierarchy | Adopt lightly | Small clarity refinement only; keep current layout and fake-door flow | Final UI Finishing |
| Share card should have more atmosphere/blob | Adapt to AnyuMark | Add subtle cream/gold layering or stamp-like depth; avoid full redesign or purple blobs | Final UI Finishing |
| Moon phase corresponding to temperature | Reject due to conflict | Keep current temperature gradient + AnyuMark accents; no moon-phase mapping | Reject |
| Reintroduce old moon ornament language | Reject due to conflict | Approved brand system is AnyuMark, not moon/crescent | Reject |
| Cormorant / old serif quote styling | Reject due to conflict | Keep completed font migration; use current LXGW WenKai / Instrument Serif / Newsreader split | Reject |
| Full share-card redesign | Defer | Current share shell is stable; only light polish is justified now | Defer |
| Major paywall rewrite | Defer | Current hierarchy is acceptable after prior polish; only small clarity tune if needed | Defer |
| Broad copy rewrite | Defer | Current copy has already been iterated and QA’d; change only if a small clarity issue appears in the final pass | Defer |

## 6. Items Already Completed

Already completed relative to the audit/patch direction:

- AnyuMark selective lockup rollout
- orphan purple-circle removal
- loading ornament using the brand-mark system
- favicon / manifest / icon adoption
- temperature gradient token alignment
- signal bar token alignment
- Instrument Serif Phase 1 migration
- Newsreader Phase 2 migration
- LXGW WenKai Phase 3 migration
- result CTA rhythm polish
- share action affordance improvement
- paid-preview hierarchy clarification
- LINE panel copy compression and current line-first structure

## 7. Items To Adopt

Adopt directly in the final pass:

1. Landing disabled CTA tone should be softer.
2. Privacy helper hierarchy should be quieter and more layered.
3. Inline next-step CTA card should feel less hard-edged.
4. Result quote card should feel more intentional as a quote card.
5. Section labels should be made consistently mono/token-colored.
6. Small spacing rhythm review across result sections.

## 8. Items To Adapt To AnyuMark

Adapt rather than adopt literally:

1. Moon-icon / moon-accent requests.
   - Final interpretation:
     stronger spiritual/brand presence through AnyuMark, mini lockup, glow, or stamp-like layer
2. Share/persona card atmospheric requests.
   - Final interpretation:
     subtle cream/gold layering or a small stamp/brand accent, not a moon/blob redesign
3. Quote/emotional-italic requests.
   - Final interpretation:
     use the completed `t-quote` / `t-kai-quote` system, not old italic serif specs
4. Old serif-display references.
   - Final interpretation:
     keep `Instrument Serif` where Latin display emphasis is intended

## 9. Items To Defer

Defer these even if the patch gestures toward them:

1. Full share-card redesign
2. Major paywall layout rewrite
3. Broad product-copy rewrite
4. Any new atmospheric system that would widen beyond current tokens/components
5. Anything that turns the finishing pass into a full-page redesign

## 10. Items To Reject

Reject due to direct conflict with approved direction:

1. Literal moon icon restoration
2. Reverting AnyuMark as the canonical brand language
3. Reverting completed font migration choices
4. Reintroducing purple orphan ornament logic
5. Adding moon-phase temperature mapping without a separate explicit re-approval

## 11. Final UI Finishing Pass Scope

Recommended narrow final implementation scope:

1. Landing disabled CTA tone softer.
2. Landing privacy helper quieter / better hierarchy.
3. Inline next-step CTA card border/tone softer.
4. Result quote card more intentional.
5. Insight soft ending line.
6. Section label token consistency.
7. Share/persona card subtle background/layer polish.
8. Paid B/C locked hierarchy small refinement.
9. Input privacy helper layering review.
10. Spacing rhythm review for result sections.

Implementation note:

- items 2 and 9 are effectively the same surface, so the actual handoff can consolidate them into one privacy-helper refinement slice
- the final pass should stay CSS/component-level and avoid new interaction logic

## 12. What Must Not Change

Must not change in the final finishing pass:

- runtime, model, prompt/schema, DB behavior
- legal semantics
- LINE funnel behavior
- production ops / launch posture
- completed font migration system
- AnyuMark canonical brand direction
- fake-door conversion logic
- major layout structure of landing/result/share/paywall flows

## 13. Risks

Main risks if the next pass is not kept narrow:

1. Reopening already-settled brand/font decisions
2. Reintroducing visual inconsistency by mixing moon language with AnyuMark
3. Over-polishing share/paywall surfaces into a redesign rather than a finishing pass
4. Accidentally changing copy or funnel behavior under the label of UI polish
5. Losing the current launch-safe stability on staging/production

## 14. Recommended Implementation Handoff

Recommended next implementation handoff:

`Final UI Finishing Pass v0`

Suggested handoff framing:

- implementation-only
- UI polish only
- no runtime / legal / LINE / production behavior changes
- explicitly preserve AnyuMark and completed typography migration
- explicitly forbid moon restoration

## 15. Recommended Next Step

`Final UI Finishing Pass v0`
