# Module Theme Architecture Implementation Plan v0

## Metadata

- task: Module Theme Architecture Implementation Plan v0
- taskStartedAt: 2026-06-07T16:34:30Z
- taskCompletedAt: 2026-06-07T16:40:03Z
- totalWallClockDuration: 5m33s
- humanWaitDuration: 0m
- netCodexWorkDuration: 5m33s
- model used: GPT-5 Codex
- reasoning/effort level used: high
- report path: `ai-collaboration/reports/2026-06-07-module-theme-architecture-implementation-plan-v0.md`
- scope: architecture/design-system implementation planning only
- production/runtime/payment/Email/LINE: not run

## Executive Decision

Gate 1 functional smoke is accepted and runtime availability is `owner_controlled_short_window_allowed`, so the Theme Architecture track can resume. This task did not change runtime UI. It creates the implementation plan and acceptance boundaries for the accepted Hybrid Theme Park Model:

- Core Shell: neutral editorial ANYU entrance.
- Module Shell: module-owned immersive world.
- Module 01: Riso-only, no A/B theme mixing.
- Shared Flow Templates: payment, access-link, return, pending, expired, and error surfaces that receive module theme tokens.
- Module 02 Radar: architectural compatibility proof only, not an implementation target.

Important guardrail: current app flow and copy remain source-of-truth. The archived design files are visual direction only and include stale assumptions that must not be revived.

## Current Surface Inventory

### Core Shell / Main Site Surfaces

| Surface | Current route/path | Current owner | Current visual style | Intended target style | First-slice safety | Risks |
|---|---|---:|---|---|---|---|
| Homepage / storefront | `/` via `apps/web/src/app/page.tsx` | Core Shell | General `anyu-storefront-shell`, editorial cards, legal footer, Module 01-heavy storefront copy | Neutral editorial ANYU entrance with shared brand DNA and module previews | Phase 3, not Phase 1 | Accidentally shifting product claims, price/refund/support evidence, or merchant-review copy |
| Legal / refund / privacy / terms / disclaimer | `/legal`, `/refund`, `/privacy`, `/terms`, `/disclaimer` through `LegalPageShell` | Core Shell | Neutral legal shell, currently back-links toward Module 01 in places | Quiet Core Shell with legal-specific typography and global ANYU navigation | Phase 3 | Legal copy must not be visually buried or semantically changed |
| Common brand frame | `Wordmark`, `LegalFooter`, `Card`, `Button`, global shell CSS | Core Shell / shared components | Warm editorial foundation mixed with module-specific globals | Small CoreShell component family with neutral tokens | Phase 1/3 | Component changes can ripple into payment/access-link pages |
| Future module browser / portal | not formalized as separate route yet | Core Shell | Homepage acts as product storefront | Core entrance to multiple modules | Defer until CoreShell alignment | Premature Module 02 implementation |

### Module 01 Public Surfaces

| Surface | Current route/path | Current owner | Current visual style | Intended target style | First-slice safety | Risks |
|---|---|---:|---|---|---|---|
| Landing / input | `/m/[moduleSlug]` via `AiTemperatureLanding` | Module 01 | `ModuleThemeShell` with current A/B classic/Riso machinery | Riso-only ModuleShell | Phase 2 after resolver cleanup | Removing A/B must not break stored theme assumptions/tests |
| Free result | `/m/[moduleSlug]/result/[resultId]` via `AiTemperatureResult` | Module 01 | Same ModuleThemeShell path; demo/runtime modes | Riso-only result world | Phase 2 | Paid CTA behavior must not change |
| Paid result / unlock | `/m/[moduleSlug]/unlock/[unlockToken]` and completed result components | Module 01 + shared paid result | ModuleThemeBoundary and shared paid-result styles | Riso paid-result surface with shared flow template | Phase 2 | Token and entitlement access behavior must remain untouched |
| Checkout-start | `/m/[moduleSlug]/result/[resultId]/checkout` | Shared flow inside Module 01 | Shared checkout shell with Riso overrides when theme resolves | Checkout-start v2 visual reference in Riso only | Phase 2, high review value | Must preserve mandatory access-link save before payment |
| Email save | checkout-start Email save UI and `/api/modules/.../recovery/email` | Shared flow inside Module 01 | Current access-link copy and save states | Riso access-link save state component | Phase 2 | Must not send report body or expose raw Email |
| LINE bind | `/line/recovery/bind` with `LineRecoveryBindBridge` | Shared flow with Module 01 context | Client bridge UI without a formal ModuleShell route wrapper | Riso LINE bind/pending/fallback states when module context can be resolved | Phase 2 | LIFF state/token handling must not change |
| Provider ReturnURL | `/payment/newebpay/return` | Shared provider-level flow | `NewebPayReturnExperience` resolves module from checkout token / hint / fallback and wraps `PaymentReturnPoller` in `ModuleThemeBoundary` | Provider-level ReturnURL waiting/status template with module theme if context exists | Phase 2 | Must not alter payment truth, polling, or token handling |
| Legacy module ReturnURL | `/m/[moduleSlug]/payment/return` | Compatibility | Old module route exists as compatibility/shared UX | Compatibility redirect or explicit compatibility-only route | Defer or focused cleanup | Should not be active canonical provider path |
| Payment access handoff | `/m/[moduleSlug]/payment/access` | Shared flow inside Module 01 | ModuleThemeBoundary fallback + paid result/pending states | Riso handoff/pending/completed state | Phase 2 | Must preserve session-bound access checks |
| Access-link return | `/r/[recoveryToken]` | Shared flow resolving module context | Resolves recovery link, uses ModuleThemeBoundary and `UnlockCompleted`; invalid/processing states use fallback | AccessLinkReturn template that resolves module theme from recovery token; safe neutral fallback when unresolved | Phase 2 | Must not leak tokenized URL or raw contact data |
| Expired / invalid / pending states | `/r`, payment access, ReturnURL, unlock fallback states | Shared flow templates | Mixed generic shell and module boundary styles | Riso-themed where module context exists; neutral Core fallback otherwise | Phase 2 | Error copy must remain current source-of-truth |

### Shared Payment / Access-Link Components

| Component / file area | Current role | Target role | Plan |
|---|---|---|---|
| `NewebPayReturnExperience` | Provider-level ReturnURL UI and polling wrapper | `PaymentReturnTemplate` using resolved module theme | Keep payment logic unchanged; extract visual shell boundary only |
| `PaymentReturnPoller` / paid pending pollers | Status polling and waiting states | Shared flow template internals | Theme only through CSS variables / slots |
| Checkout save UI in checkout page | Mandatory Email/LINE save before payment | `AccessLinkSaveTemplate` | Preserve save-gate behavior and current copy |
| `LineRecoveryBindBridge` | LIFF bind bridge and diagnostics | `LineBindTemplate` surface with module context | Add theme wrapper only after safe context resolver exists |
| `UnlockCompleted` / paid result components | Completed paid result render | Module-themed paid-result template | Preserve report semantics and delivery artifact |
| `Card`, `Button`, `Wordmark`, `LegalFooter` | Generic shared components | Core primitives with module-safe variants | Avoid large component API rewrite in first slice |

### Existing Theme / Design-System Files

| File / area | Current state | Target decision |
|---|---|---|
| `apps/web/src/lib/modules/module-theme.ts` | Defines `classic` / `riso`, random 50/50 assignment, localStorage keys, and source tracking | Replace Module 01 A/B resolver with deterministic module theme resolution; keep compatibility read only if needed |
| `apps/web/src/components/modules/ai-temperature/ModuleThemeFrame.tsx` | Provides `ModuleThemeShell`, `ModuleThemeBoundary`, and a visible theme toggle | Split into CoreShell / ModuleShell / ThemeBoundary; remove runtime A/B toggle for Module 01 |
| `apps/web/src/styles/tokens.css` | Global tokens and `:root[data-module="ai-temperature"]` defaults | Establish CSS variable contract for Core and module theme packs |
| `apps/web/src/styles/globals.css` | Global site styles plus large `.anyu-v2` Riso block and checkout/recovery styles | Gradually move toward shared flow CSS variables and Module 01 Riso consolidation |
| `apps/web/src/app/layout.tsx` | Sets `data-module="ai-temperature"` globally | Remove global Module 01 assumption in Phase 1; route shells should set theme scope |
| `ProductModuleConfig.visualModule` | Existing module visual field | Use as bridge into theme registry, not a full framework |

### Archived Design Assets

| Asset | Use | Guardrail |
|---|---|---|
| `ai-collaboration/design/theme-architecture-v0/README.md` | Accepted archive scope and decisions | Treat as visual architecture reference only |
| `THEME_ARCHITECTURE_MEMO.md` | Hybrid Theme Park Model, Core Shell, Module Journey, Shared Flow Templates | Use for architecture boundary |
| `CHECKOUT_PATCH_MEMO.md` | Checkout-start v2 visual and mandatory save gate references | Use for visual direction, not stale product copy |
| `anyu-tokens-v2.css` | Token inspiration | Do not copy blindly over current app tokens |
| `checkout-v2.jsx`, `pay-shell-atoms.jsx`, `riso-screens.jsx` | Visual reference for Riso and checkout surfaces | Current app copy/flow wins |
| `module02-radar.jsx` | Extensibility proof | Do not implement Module 02 in this track |

## Architecture Boundary

### Core Shell

Core Shell owns site-level ANYU context:

- homepage and future module browser
- legal / privacy / refund / terms / disclaimer
- global brand frame, wordmark, footer, and quiet editorial layout
- neutral defaults for unknown or unresolved shared-flow contexts

Core Shell should not become Module 01 Riso. It should be warm, editorial, premium, and quiet enough to let modules become immersive worlds.

### Module Shell

Module Shell owns module-specific immersion:

- module landing/input/result
- checkout-start and mandatory access-link save gate
- paid result and access-link return
- module-aware pending/expired/error surfaces

For Module 01, the Module Shell must resolve to Riso only. The current classic/Riso A/B machinery is a known mismatch with accepted direction and should be removed or compatibility-contained in Phase 1.

### Shared Flow Templates

Shared Flow Templates should hold payment/access-link UX logic without duplicating provider or delivery behavior:

- `AccessLinkSaveTemplate`
- `PaymentReturnTemplate`
- `PaidResultPendingTemplate`
- `AccessLinkReturnTemplate`
- `FlowErrorTemplate`
- `ExpiredOrInvalidTemplate`

These templates receive module theme variables and minimal contextual labels. They must not own payment truth, contact writes, token resolution, or provider semantics.

### Theme Pack / Registry

Use a small theme registry, not an over-engineered framework.

Recommended v0 contract:

- `themeId`: `core` | `ai-temperature-riso` | future module theme ids
- `owner`: `core` | `module`
- `moduleSlug`: optional
- `cssScopeClass` / `data-theme`
- `visualModule`: bridge from `ProductModuleConfig`
- CSS variable set:
  - `--theme-bg`
  - `--theme-paper`
  - `--theme-ink`
  - `--theme-muted`
  - `--theme-line`
  - `--theme-accent`
  - `--theme-accent-2`
  - `--theme-danger`
  - `--theme-success`
  - `--theme-focus`
  - `--theme-shadow`
  - `--theme-texture`

The registry should answer:

- `resolveThemeForModule("ai-temperature") -> ai-temperature-riso`
- unknown module -> safe Core fallback or not-found shell
- Core routes -> Core Shell theme

### Provider-Level Theme Recovery

Provider-level routes cannot rely on pathname alone. They must recover module context safely:

- `/payment/newebpay/return`: resolve signed checkout session token, then payment/result module context; fallback to a neutral provider-return shell if context is unavailable.
- `/r/[recoveryToken]`: resolve recovery token to result/module context; invalid or expired token should use neutral/Core error shell unless a module can be safely resolved.
- `/line/recovery/bind`: resolve signed bind state to result/module context; fallback to a neutral/Core recovery error shell when state is invalid or missing.
- Legacy `/m/[moduleSlug]/payment/return`: compatibility only; should not be active canonical provider configuration.

## Module 01 Riso Implementation Target

Module 01 Riso should become a consistent world across all ANYU-owned Module 01 surfaces.

### Visual Tokens

Proposed Riso direction:

- paper: warm cream / off-white paper base
- ink: deep almost-black editorial ink
- primary accent: saturated ultramarine / violet
- secondary accent: fluorescent magenta / rose
- warmth accent: vermilion / soft orange
- line: slightly imperfect ink border
- texture: subtle paper grain and light halftone, never heavy enough to hurt readability
- success/error: theme-compatible but accessible green/red, not generic SaaS colors

### Typography

- expressive editorial title hierarchy
- compact high-trust sans or mono labels for state/status text
- Traditional Chinese readability takes priority over decorative type
- numeric/payment values should be crisp and high contrast

### Surfaces

- Cards: paper-like panels, visible ink border, occasional offset print-shadow.
- CTAs: bold, unmistakable, high contrast, 44px+ touch target.
- Disabled/pending state: clear, non-clickable, and explanatory.
- Error/expired state: visually inside the Riso world but operationally calm.
- Motion: minimal; avoid animation that distracts during payment, ReturnURL, or recovery states.

### Required Module 01 Coverage

The first Riso consolidation must cover:

- landing/input
- free result
- checkout-start v2 visual reference
- Email save
- LINE bind
- ReturnURL waiting/status
- paid result
- `/r` return
- expired/invalid/pending states

Acceptance is consistency and no visual tearing, not pixel-perfect recreation of archived screens.

## Core Shell Target

Core Shell should be neutral editorial:

- warm cream / ink / subtle accent
- restrained brand DNA
- legible legal/support layouts
- homepage that can introduce multiple modules without looking like a SaaS app grid
- quiet wordmark treatment and consistent footer/navigation

Core Shell must not inherit Module 01 Riso intensity. Shared DNA can include paper tone, typography rhythm, and gentle editorial spacing, but module worlds should provide the expressive treatment.

## Future Module 02 Compatibility

No Module 02 implementation should happen in this plan.

The architecture should still support:

- `moduleSlug -> theme pack`
- future `workplace-radar -> radar` theme
- different module visual intensity
- shared payment/access-link templates without duplicated logic
- module-level overrides through tokens/slots, not forked payment code

The archived Module 02 Radar screen is proof that the shell model can support another world later. It is not a product scope target.

## Migration Plan

### Phase 1: Theme Infrastructure

Likely files:

- `apps/web/src/lib/modules/theme-registry.ts` or equivalent
- `apps/web/src/lib/modules/module-theme.ts`
- `apps/web/src/components/modules/ai-temperature/ModuleThemeFrame.tsx`
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/globals.css`
- module theme tests

Work:

- introduce small theme registry and CSS variable contract
- split CoreShell / ModuleShell / ThemeBoundary responsibilities
- make Module 01 resolve Riso deterministically
- contain or remove A/B theme toggle and localStorage assignment path
- remove global `data-module="ai-temperature"` assumption from root layout
- keep runtime behavior/copy unchanged

Risk: medium. Theme state is currently cross-cutting.

Validation:

- theme resolver unit tests
- current Module 01 UI tests
- `qa:module01:mock-flow`
- no payment/provider behavior changes

Owner checkpoint: approve token contract and Riso-only resolver behavior.

Screenshot review: optional, because Phase 1 should not be a large visual rewrite.

### Phase 2: Module 01 Riso Consolidation

Likely files:

- Module 01 landing/result components
- checkout-start UI/components
- `NewebPayReturnExperience`
- LINE bind bridge wrapper
- `/r` return UI
- paid result / pending / expired components
- Riso CSS block in `globals.css` or extracted module CSS

Work:

- apply Riso visual system across Module 01-owned and module-aware shared flow pages
- update checkout-start toward archived v2 visual direction while preserving current save/payment behavior
- align Email/LINE save, ReturnURL, paid result, `/r`, expired, invalid, and pending states
- remove visible tearing between free, checkout, provider return, and access-link surfaces

Risk: high. This touches payment-adjacent UI, but must not touch provider/payment state logic.

Validation:

- Playwright mobile/desktop checkout
- Email save visual state
- LINE incomplete/deliverable state
- ReturnURL/pending state
- `/r` invalid and completed states
- `qa:module01:mock-flow`
- `qa:result-checkout:no-card`
- local gate

Owner checkpoint: visual screenshot review before staging.

### Phase 3: Core Shell Alignment

Likely files:

- homepage
- legal/refund/privacy/terms/disclaimer shell
- shared Wordmark/Footer/Nav components
- global tokens

Work:

- build neutral editorial Core Shell
- align homepage and legal pages without converting them to Riso
- prepare future module browser pattern without implementing Module 02

Risk: medium. Public/legal content must remain clear.

Validation:

- static page tests if available
- manual/browser screenshot review
- legal/refund copy spot-check

Owner checkpoint: Core Shell direction review.

### Phase 4: QA / Regression Hardening

Work:

- add theme resolver and route-rendering tests
- add visual/locator Playwright coverage for checkout-start, ReturnURL, `/r`, Email save, LINE bind
- assert no payment/access-link behavior change
- add accessibility checks for CTA, disabled, pending, and error states

Risk: low to medium.

Validation:

- full app test suite
- Playwright UI suite
- mock-flow
- no-card QA
- no real payment/Email/LINE required

### Phase 5: Module 02 Readiness

Work:

- scaffold Radar theme pack only when Module 02 product work starts
- keep Module 02 preview as reference until then

Risk: defer. Premature implementation would create product and QA drag.

## Testing / QA Plan

### Theme Resolver Tests

- `ai-temperature` resolves to Riso.
- Module 01 does not expose classic/Riso A/B switching.
- unknown module falls back safely.
- Core routes use Core Shell defaults.
- provider-level routes can resolve module theme from safe context.

### Route Rendering Tests

- checkout-start renders with Riso shell and keeps functional save/payment behavior.
- ReturnURL route resolves module theme when signed context exists.
- ReturnURL route uses safe fallback when context is invalid.
- `/r` route resolves module theme from recovery token context.
- `/r` invalid/expired states do not leak token data.
- LINE bind route resolves module context from safe bind state when available.

### Playwright Coverage

- mobile checkout-start layout.
- desktop checkout-start layout.
- Email save completed state.
- LINE incomplete state does not unlock checkout.
- LINE saved/deliverable state is visually complete.
- ReturnURL waiting/status state.
- `/r` completed paid result state.
- `/r` invalid/expired state.

### Regression Coverage

- no payment provider behavior changes.
- no NotifyURL/ReturnURL truth changes.
- no token leakage.
- no raw Email/LINE/user/provider payload output.
- no report body promised in Email/LINE save copy.
- no old A/B theme switching.
- no real payment, real Email, or real LINE required for theme validation.

### Accessibility

- CTA contrast passes.
- disabled state is distinguishable.
- pending/waiting state is readable.
- error state is readable and actionable.
- mobile touch targets remain usable.

## Product / Copy Guardrails

Current app copy and current PM decisions are source-of-truth. The archive controls visual direction, not flow/copy semantics.

Do not revive:

- no-charge / internal-test copy.
- report-body delivery promises.
- old manual LINE ID copy.
- stale recovery-link terminology when access-link wording is user-facing.
- direct payment CTA before mandatory access-link save.
- 30-day retention copy unless current policy explicitly changes.
- training/analytics consent inside mandatory save gate.

Preferred user-facing terminology when touched:

- `保存查看連結`
- `專屬查看連結`

Engineering internals can still use legacy names temporarily, but new or touched user-facing copy should move toward access-link wording.

## Tech Debt / Cleanup Plan

| Debt | Decision | Phase |
|---|---|---:|
| Module 01 classic/Riso A/B machinery | Fix now in first implementation slice; accepted direction is Riso-only | Phase 1 |
| Visible theme toggle in Module 01 shell | Remove or compatibility-contain; no user-facing A/B | Phase 1 |
| Root layout global `data-module="ai-temperature"` | Fix; theme scope belongs to route shell, not root HTML | Phase 1 |
| Inconsistent global vs Riso token usage | Establish CSS variable contract before visual rewrite | Phase 1 |
| Generic checkout/return/access-link styles | Consolidate into shared flow templates using module theme variables | Phase 2 |
| LINE bind route lacking formal ModuleShell wrapper | Add safe context-based wrapper only after bind state resolver is clear | Phase 2 |
| Recovery/access-link naming drift | Update user-facing touched copy only; deeper internal rename is separate | Phase 2 / defer |
| Legacy module ReturnURL route | Keep compatibility-only unless owner approves strict redirect cleanup | Defer or focused task |
| Archived design stale assumptions | Keep documented guardrails; do not copy stale copy/flow | Ongoing |
| Duplicated CSS/component shells | Reduce during Riso consolidation; avoid broad CSS rewrite without screenshot review | Phase 2 |

## Recommended First Implementation Task

Recommended next task after owner review:

**Module Theme Architecture Infrastructure v0**

Suggested scope:

- introduce theme registry and CSS variable contract.
- split CoreShell / ModuleShell / ThemeBoundary responsibilities.
- make Module 01 resolve Riso-only.
- remove or compatibility-contain classic/Riso A/B assignment and visible theme toggle.
- remove global root `data-module="ai-temperature"` assumption.
- add resolver tests.
- do not visually rewrite checkout/payment/access-link surfaces yet.

Alternative narrower task if owner wants one more planning slice:

**Module 01 Riso Flow Surface Inventory + Token Contract v0**

This would produce a screenshot/token acceptance pack before code implementation.

## Production / Safety Confirmation

- production runtime was not opened.
- no production payment was run.
- no Email or LINE was sent.
- no Vercel env was changed.
- no DB data was mutated.
- no runtime UI was implemented.
- Module 02 was not implemented.
- existing payment/access-link behavior was not modified.

## Validation

- docs presence check: pass.
- dashboard HTML sanity: pass.
- secret/private scan: pass.
- `git diff --check`: pass.

## Next Task Recommendation

Owner reviews this plan, then approves **Module Theme Architecture Infrastructure v0** as the first implementation slice.
