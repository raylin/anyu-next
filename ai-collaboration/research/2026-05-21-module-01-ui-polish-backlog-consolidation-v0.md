# Module 01 UI Polish Backlog Consolidation v0

Date: 2026-05-21

## 1. Summary

This backlog consolidates the current Module 01 UI polish work into one implementation-ready plan.

The backlog combines:

- Claude Design `STAGING_AUDIT_v1.1.md`
- Claude Design `FONT_MIGRATION_v1.1.md`
- recent ChatGPT / execution-note UI polish themes already captured in repo history
- the current low-key production constraints

Recommended sequencing:

- do low-risk visual-system alignment first
- keep conversion/share refinements as the next layer
- keep font migration and broader layout changes phased and separate

## 2. Source Inputs

Primary high-fidelity references reviewed:

- `docs/design-system/reference/ui-polish-v1.1/STAGING_AUDIT_v1.1.md`
- `docs/design-system/reference/ui-polish-v1.1/FONT_MIGRATION_v1.1.md`

Supporting repo notes reviewed:

- `ai-collaboration/research/2026-05-20-module-01-micro-ux-fixes-v0-4.md`
- `ai-collaboration/research/2026-05-20-anyu-brand-mark-v1.1-adoption-v0-review-bundle.md`
- recent execution/report history covering:
  - input guidance and CTA polish
  - share affordance updates
  - paid preview readability polish
  - LINE-first contact surface rollout
  - legal footer and route verification

## 3. Current Product / Launch Context

Current launch context:

- production is approved only for low-key launch
- no ads yet
- no real payment
- no model switch
- LINE is notification flow only
- Email fallback remains live
- runtime / DB / legal / LINE behavior should not be disturbed by UI polish work

Implication for UI backlog:

- prefer low-risk brand/system alignment first
- defer larger conversion and typography experiments until the visual system is cleaner
- keep implementation slices narrow enough to verify quickly on staging and production

## 4. Claude Design Audit Summary

Main audit takeaways from `STAGING_AUDIT_v1.1.md`:

- staging was assessed at roughly `75%` aligned with v1.1
- the header still lacks the new ⋯ brand mark / lockup treatment
- the purple solid circles are orphan elements from an older visual language
- the new ⋯ system utilities are still mostly unused in header / loading / share / paywall
- the temperature card is structurally close but its gradient should align to tokens
- signal rows are structurally correct but bar height / accent usage need alignment
- the persona / share card has too much empty space and should use a mark / stamp / lockup treatment
- locked paywall cards need a clearer locked visual hint
- loading should use the `.anyu-loading` / animated mark system
- favicon / app icon asset wiring should be verified as part of the system check

Practical interpretation:

- the next polish pass should focus less on “new ideas” and more on system coherence
- the biggest mismatch is missing brand-mark rollout rather than broken component structure

## 5. Font Migration Summary

Main migration takeaways from `FONT_MIGRATION_v1.1.md`:

- replace `Cormorant Garamond` with `Instrument Serif` for Latin display use
- introduce `Newsreader` for long-form editorial reading surfaces
- introduce `LXGW WenKai` for private-whisper / quote texture
- keep `Noto Serif TC` for Chinese headings
- keep `Noto Sans TC` for UI/body clarity
- keep `JetBrains Mono` for labels / metadata / numbers

Recommended rollout is explicitly phased:

- Phase 1: Latin display only
- Phase 2: Newsreader reading body
- Phase 3: LXGW WenKai quote / whisper use

Practical interpretation:

- do not run a one-shot global font migration
- keep font work isolated and testable
- treat font migration as follow-up work, not the first polish pass

## 6. ChatGPT UI Polish Notes Summary

Backlog themes already visible in prior repo history:

- `Result Page CTA Rhythm v0`
- `LINE Funnel Copy Compression v0`
- `Share Action Affordance v1`
- `Paid Preview Hierarchy Polish v0`
- `Brand Mark Selective UI Rollout v0`
- `Footer Legal Link Readability Check v0`
- `Result Summary / Expand Mode`
- `Desktop Layout Enhancement`

Observed direction from those notes:

- CTA rhythm and share clarity still matter
- paid preview hierarchy can still get cleaner without changing funnel logic
- brand rollout should stay selective before any larger redesign
- desktop refinement is valuable but not urgent for current launch scope

## 7. Consolidated Backlog

Consolidated implementation-ready items:

1. Introduce the brand mark / lockup into the header.
2. Remove orphan purple circles and replace only where the new mark system is appropriate.
3. Apply the Anyu loading system to the real loading surface.
4. Verify favicon / manifest / icon wiring against the current production app state.
5. Align temperature gradient and signal bars to the v1.1 token language.
6. Tighten share/persona card spacing and add a mini lockup or stamp treatment.
7. Improve paywall locked-state clarity with a real locked visual hint.
8. Revisit result-page CTA rhythm and conversion sequencing.
9. Compress LINE-first copy without weakening trust or legal clarity.
10. Refine paid preview hierarchy and shared-result affordance.
11. Run a phased font migration instead of a full typography swap.
12. Revisit desktop layout only after the mobile / system polish is settled.

## 8. P0 Items

P0 should stay low-risk and high-confidence:

1. Header lockup / mark introduction.
2. Remove orphan purple circles.
3. Loading uses `AnyuMark` animated system.
4. Verify favicon / manifest / app icon wiring.
5. Signal bar height / color token alignment.
6. Temperature gradient token alignment.

Why these are P0:

- they close the clearest v1.1 mismatches
- they are mostly visual-system alignment work
- they should not disturb funnel logic or conversion copy

## 9. P1 Items

P1 should improve conversion and social clarity after P0 is stable:

1. Result Page CTA Rhythm v0.
2. Share / Persona Card spacing and mini lockup treatment.
3. Paywall locked hints using the ⋯ system.
4. Share Action Affordance v1.
5. LINE Funnel Copy Compression v0.
6. Paid Preview Hierarchy Polish v0.

Why these are P1:

- they are closer to conversion behavior than pure visual alignment
- they should be staged after the brand/system layer is coherent
- some of them may change user attention flow and therefore need narrower QA

## 10. P2 Items

P2 should remain explicitly later / larger:

1. Font Migration Phase 2 / 3.
2. Result Summary / Expand Mode.
3. Desktop Layout Enhancement.
4. Scheduled retention cleanup before broader traffic / ads.
5. LIFF / LINE automation.

Why these are P2:

- they are broader than current low-risk polish needs
- they create more QA surface area
- some are not even UI-only and belong to later product/ops phases

## 11. Font Migration Rollout Plan

Recommended phased plan:

### Phase 1: Latin Display

- replace `Cormorant Garamond` with `Instrument Serif`
- update `--anyu-font-latin`
- verify wordmark, large numbers, score display, pricing, and small Latin display accents
- do not replace global body typography in this pass

### Phase 2: Editorial Reading

- add `--anyu-font-reading`
- use `Newsreader` only for selected long-form reading surfaces
- good candidates: insight card body, deeper explanatory text, possible expanded result views
- keep UI body on `Noto Sans TC`

### Phase 3: Quote / Whisper

- add `--anyu-font-kai`
- use `LXGW WenKai` only for quote / whisper / private-note tone
- verify Traditional Chinese rendering quality and loading cost
- do not expand it into general UI or default body text

## 12. Brand Mark Rollout Plan

Recommended first brand-rollout scope:

- header lockup / mark introduction
- remove orphan purple circles
- loading animated mark
- persona / share card mini lockup or mark treatment
- optional paywall locked-mark hint

Explicit non-goals for the first rollout:

- do not redesign every card
- do not replace every `Wordmark` instance blindly
- do not insert the mark everywhere just because the asset now exists
- do not mix brand rollout with legal / LINE / runtime changes

## 13. Conversion / CTA Polish Plan

After P0, recommended conversion-focused order:

1. Result Page CTA Rhythm v0
2. Share Action Affordance v1
3. LINE Funnel Copy Compression v0
4. Paid Preview Hierarchy Polish v0
5. Share / Persona spacing + stamp treatment

Rationale:

- CTA rhythm has the highest direct conversion relevance
- share and paid-preview clarity are next-order conversion surfaces
- LINE compression should preserve trust and legal clarity, not just shorten copy for its own sake

## 14. What Not To Do Yet

Do not do these in the next polish pass:

- do not start ads yet
- do not do a broad public launch
- do not do a full UI redesign
- do not replace all typography globally in one pass
- do not implement LIFF / LINE automation
- do not switch model
- do not change DB schema or legal semantics
- do not bundle runtime or funnel behavior changes into a visual polish task

## 15. Recommended First Implementation Handoff

Recommended first implementation:

`Brand Mark Selective UI Rollout v0`

Reason:

- the Claude audit identifies missing mark usage and orphan purple dots as the clearest visual-system mismatch
- the app already has `AnyuMark` assets and production-safe mark infrastructure ready
- this pass can fix the biggest “not yet v1.1” signals without touching conversion logic or typography globally
- font migration is better handled next as a separate phased task

## 16. Open Questions

Open questions to resolve before or during implementation planning:

1. Should the first P0 pass include favicon / manifest verification only, or also production visual verification of the current favicon behavior?
2. Should the first share/persona treatment stay mark-only, or use the more visible stamp treatment immediately?
3. After the brand-mark rollout, should font migration Phase 1 come next, or should CTA/conversion polish take priority?
4. Is `Footer Legal Link Readability Check v0` still needed as a standalone task, or is it already sufficiently covered by current legal-route verification?

## 17. Recommended Next Step

`Brand Mark Selective UI Rollout v0`
