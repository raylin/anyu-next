# C-stage Frontend Stack Selection Prep

Date: 2026-05-18

## 1. Executive Summary

We are preparing for formal frontend stack selection.

The current local prototype proved:

- the first MVP flow is coherent
- the ANYU visual direction is usable
- the fake-door funnel is testable
- the product runtime can already generate structured results

The next stack must support a multi-module AI-native insight system, not only a single `曖昧溫度計` MVP page.

This document does **not** choose the final stack.

Its job is to define:

- what C-stage must decide
- what should remain flexible
- which stack options deserve serious evaluation
- which criteria should drive the final technical decision

## 2. Current State

Current state:

- Python local prototype exists
- product runtime exists
- Anthropic / OpenAI provider support exists
- ANYU design system exists
- local event JSONL logging exists
- minimal experiment report exists
- fake-door flow exists
- visual direction is approved enough for C-stage

Current foundations already in repo:

- research signal track
- product runtime track
- product runtime prompt v0.2
- product result schema v0
- synthetic evaluation set and runner
- external Dcard JSON calibration workflow
- product map calibration note v0
- ANYU design system v1.0
- local fake-door prototype
- local JSONL event logging
- minimal experiment analysis report
- ANYU mobile visual polish

Current first MVP:

- `曖昧溫度計 + 下一句怎麼回`

Working mother brand:

- `暗語 ANYU`

Current limitations:

- the prototype server is not intended as the production frontend foundation
- no real auth
- no real payment
- no production database
- no production privacy deletion enforcement
- no share-card PNG generation
- no portal
- no multi-module config system yet

## 3. What C-stage Must Decide

C-stage must decide:

- frontend framework
- deployment model
- module / theme routing model
- API boundary
- product runtime integration pattern
- event tracking system
- data storage
- share-card generation approach
- paid unlock path
- privacy / data retention implementation
- design system integration pattern

These decisions must be made together because they affect each other. For example:

- share-card generation depends on rendering architecture
- payment path affects API boundary and backend choice
- privacy controls affect runtime placement and data flow
- multi-module routing affects whether a single-page prototype can scale cleanly

## 4. What C-stage Should Not Decide Yet

C-stage should **not** prematurely decide:

- long-term full portal information architecture
- subscription model
- final payment provider
- final Personal Insight Graph storage model
- all future product families
- long-term Dcard collector architecture

These should stay flexible until:

- the first public module has real user signal
- fake-door and later payment conversion data exists
- we know whether users return for repeated modules

## 5. Product Requirements

The next stack must support the first MVP:

- `曖昧溫度計`
- input: text plus situation selector
- free output: temperature, state label, insight layer, share card
- paid unlock: `下一句怎麼回 — NT$49`
- fake-door / contact capture in early launch

It must also support future modules such as:

- `關係紅旗雷達`
- `伴侶價值觀雷達`
- `婚前信任檢查`
- `社群微訊號分析`
- `交友軟體策略`
- `親密落差解讀` later due to sensitivity

The product surface must continue to feel:

- lightweight
- emotional
- screenshot-worthy
- premium
- not SaaS
- not cheap fortune-telling
- not manipulative

## 6. Multi-Module Requirements

The future stack should support a config-driven module model.

Example:

```json
{
  "theme_slug": "ambiguous-temperature",
  "product_family": "曖昧溫度計",
  "module_id": "ai-temperature",
  "title": "他是真的忙，還是其實在冷掉？",
  "input_type": "text",
  "chips": ["已讀不回", "忽冷忽熱", "回訊變慢但看限動", "不確定 / 跳過"],
  "prompt_version": "product_result_prompt_v0.2",
  "schema_version": "product_result_schema_v0",
  "visual_module": "ai-temperature",
  "free_sections": ["temperature", "insight_layer", "share_card"],
  "paid_sections": ["reply_strategy"],
  "price": "NT$49",
  "experiment_id": "ambiguous-temperature-fake-door-v0"
}
```

Requirements:

- one route per standalone module
- shared renderer components
- module-specific accent tokens
- module-specific chip sets
- module-specific prompt / schema versions
- module-specific event tracking
- module-specific share-card config

The architecture must not hardcode only `曖昧溫度計`.

## 7. Design System Requirements

ANYU Design System v1.0 is the baseline.

The stack must support:

- `tokens.css` or equivalent design tokens
- `data-module` based accent switching
- `data-theme` future readiness
- mobile-first layouts
- premium cards
- serif / sans / latin / mono typography hierarchy
- share-card specs
- paid CTA language and visual treatment
- future module glyphs

Important design constraints:

- not SaaS
- not overly pink
- not cheap fortune-telling
- not PUA-like
- not clinical therapy UI

Design system implementation should use reusable components rather than one-off CSS.

Likely shared components:

- `Wordmark`
- `MoonGlyph`
- `ModuleShell`
- `InputCard`
- `SituationChips`
- `PrimaryButton`
- `TemperatureCard`
- `InsightCard`
- `ShareCardPreview`
- `PaidPreviewCard`
- `ContactCapture`
- `PrivacyHelper`

## 8. Runtime / Prompt / Schema Requirements

The next stack must support:

- provider abstraction across Anthropic / OpenAI
- prompt versioning
- schema versioning
- result validation
- per-module runtime config
- developer sample generation
- synthetic evaluation
- safe fallback states when provider calls fail or time out

Formal stack selection must evaluate whether runtime should be:

A. same frontend server / API route layer  
B. separate Python service  
C. serverless function calling the existing Python package  
D. hybrid

The current Python runtime should not be discarded automatically.
But the current Python prototype server should not force the final frontend architecture.

## 9. Experiment And Analytics Requirements

Events that need to exist at minimum:

- `page_view`
- `input_started`
- `input_submitted`
- `analysis_completed`
- `paid_unlock_clicked`
- `contact_submitted`
- `share_card_clicked`
- `error_seen`

Per event, the system should support fields such as:

- `module_id`
- `theme_slug`
- `experiment_id`
- `visual_variant`
- `prompt_version`
- `schema_version`
- `situation_type`
- score bucket rather than always raw score if privacy-sensitive
- timestamp
- anonymous session id

Analytics rule:

- do not store raw conversation text in analytics

Early-stage analysis must support:

- funnel counts
- funnel rates
- situation breakdown
- state-label breakdown
- paid intent
- contact conversion
- share intent

## 10. Paid Unlock Requirements

Early launch:

- fake-door unlock
- contact capture
- no real charge

Later launch:

- one-time micro-payment
- `NT$49` starting hypothesis
- not subscription-first

UI requirement:

- `ONE-TIME · NO SUB`
- `解鎖下一句怎麼回 — NT$49`

Candidate providers to evaluate later:

- ECPay
- TapPay
- NewebPay
- Stripe if market fit and settlement constraints are acceptable

This document does not choose the final provider.

## 11. Privacy And Data Retention Requirements

Production privacy requirements should include:

- do not ask users to paste identifiable data
- front-end PII warning
- backend PII redaction before provider call
- no raw conversation text in analytics
- raw input retention TTL
- contact capture consent
- delete / export path later

Current design copy references:

- `24h deletion`
- `不寄電子報 · 不分享第三方`

These should be treated as production requirements unless enforced, not current guarantees.

The final stack must make it possible to enforce:

- transient raw-input storage
- retention rules by data class
- contact-capture consent recording
- provider-call minimization

## 12. Share Card Requirements

The stack must support:

- in-app preview
- future PNG generation
- 4:5 primary format
- 9:16 story format
- OG `1.91:1` format
- no raw conversation text
- no names / handles
- persona + quote + temperature + ANYU footer

Candidate implementation approaches:

- client-side `html-to-image`
- server-side `Satori` / `@vercel/og`
- controlled browser screenshot rendering

Final stack selection should evaluate the rendering tradeoffs, including:

- typography fidelity
- performance
- deployment complexity
- image consistency across modules

## 13. Portal Readiness Requirements

The portal does not need to launch now.

But the stack should allow future:

- homepage
- module directory
- latest / trending modules
- recommendation
- completed tests
- personal insight profile
- module cards

Architecture should not assume only `/ambiguous-temperature`.

The stack should make future expansion to:

- `/`
- `/modules`
- `/ambiguous-temperature`
- `/red-flag-radar`
- `/values-radar`

straightforward rather than awkward.

## 14. Content / Theme Launch Workflow Requirements

The future stack must support weekly or biweekly launches.

Each new module should be able to add:

- theme spec
- prompt
- schema or schema mapping
- chips
- personas
- landing hook
- paid CTA config
- share-card config
- visual accent
- experiment config
- sample evaluation set

Ideal workflow:

1. add module config
2. add prompt / schema
3. generate sample outputs
4. review outputs
5. add route
6. launch behind flag
7. track events
8. analyze report

This implies the stack should prioritize:

- explicit config
- repeatable module assembly
- deploy simplicity
- fast preview environments

## 15. Candidate Stack Options

### Option A: Next.js full-stack

Shape:

- Next.js App Router
- Vercel
- API routes / server actions
- Postgres / Supabase
- Satori / `@vercel/og` for share cards
- PostHog or custom event table

Assessment:

- speed to launch: high
- design system fit: high
- multi-module scalability: high
- AI runtime integration: medium unless Python runtime is bridged well
- share-card generation: high
- payment integration: medium-high
- event tracking: high
- deployment complexity: low-medium
- maintenance cost: medium
- future portal readiness: high
- Codex velocity: high

Tradeoff:

- best frontend ergonomics, but runtime integration is the key question if Python remains canonical

### Option B: Next.js frontend + Python backend

Shape:

- Next.js frontend
- FastAPI or existing Python runtime service
- Vercel + Fly.io / Render
- Postgres / Supabase

Assessment:

- speed to launch: medium-high
- design system fit: high
- multi-module scalability: high
- AI runtime integration: high
- share-card generation: high on frontend side
- payment integration: medium-high
- event tracking: high
- deployment complexity: medium
- maintenance cost: medium-high
- future portal readiness: high
- Codex velocity: high if frontend and runtime concerns stay cleanly separated

Tradeoff:

- strongest path if Python runtime remains central, but introduces service-boundary complexity earlier

### Option C: Astro / static-first + serverless functions

Shape:

- Astro for static-first theme pages
- serverless API for generation
- minimal JS on the client
- portal and content-heavy pages can stay very fast

Assessment:

- speed to launch: medium
- design system fit: medium-high
- multi-module scalability: medium-high
- AI runtime integration: medium
- share-card generation: medium
- payment integration: medium
- event tracking: medium-high
- deployment complexity: low-medium
- maintenance cost: medium
- future portal readiness: medium-high
- Codex velocity: medium

Tradeoff:

- attractive for content-heavy pages, but the interactive result flow and richer share-card / payment features may push it back toward app-like complexity

### Option D: Keep Python prototype and deploy lightly

Shape:

- Python server
- simple templates
- low migration cost

Assessment:

- speed to launch: high in the narrowest sense
- design system fit: medium
- multi-module scalability: low-medium
- AI runtime integration: high
- share-card generation: low-medium
- payment integration: low-medium
- event tracking: medium
- deployment complexity: low
- maintenance cost: medium
- future portal readiness: low
- Codex velocity: medium for research tooling, lower for polished frontend product work

Tradeoff:

- useful as a research tool and local harness, probably weak as the long-term frontend foundation

## 16. Evaluation Criteria

Suggested weighted criteria:

- speed to first public launch: `20%`
- weekly / biweekly module velocity: `20%`
- design system implementation quality: `15%`
- AI runtime integration: `15%`
- privacy / data handling: `10%`
- share-card generation: `10%`
- payment path: `5%`
- long-term portal readiness: `5%`

Interpretation:

- launch speed matters, but not more than module velocity
- design quality and runtime integration are both first-order requirements
- portal readiness matters, but should not dominate the decision this early

## 17. Recommended Shortlist

Recommended shortlist:

1. `Next.js full-stack`
2. `Next.js frontend + Python backend`
3. `Astro static-first + serverless`

Position on the current prototype:

- keeping the Python prototype is valuable for research tooling, local testing, and runtime experimentation
- it is probably not the best production frontend foundation for the product system being described

Shortlist rationale:

- all three shortlisted options can plausibly support multi-module launches
- all three can support the ANYU design system with better component reuse than the current prototype shell
- the main strategic question is whether the runtime should remain Python-first or shift closer to the frontend host layer

## 18. Migration From Current Prototype

What can be reused:

- product runtime prompt
- product schema
- provider abstraction
- sample generation
- synthetic evaluation runner
- event model concepts
- experiment analysis report logic
- ANYU design system
- `tokens.css`
- copy
- funnel logic

What should likely be rebuilt:

- frontend shell
- routing
- component system
- production event tracking
- privacy enforcement
- share-card generation
- payment / contact capture implementation

Migration principle:

- reuse contracts and research tooling
- rebuild the user-facing shell with a stack chosen for modular product velocity

## 19. Risks And Anti-Patterns

Avoid:

- overbuilding the portal before the first public module
- hardcoding `曖昧溫度計` only
- adopting a SaaS-looking component library without strong visual override
- adding auth too early
- implementing real payment before fake-door signal is clear
- storing raw relationship text without TTL
- building crawler infrastructure instead of product
- overfitting to synthetic evaluation
- making every module custom-coded
- underbuilding share-card quality

The main anti-pattern is mistaking a validated prototype for the right long-term frontend architecture.

## 20. Open Questions

- Should C-stage prioritize fastest public launch or a cleaner multi-module foundation?
- Should runtime stay Python-first or move toward a TS-hosted serverless path?
- Which analytics path is sufficient for the first public launch?
- How much privacy infrastructure is required before public launch?
- Should share-card PNG generation be in v1 or after launch?
- Should payment stay fake-door first, or move to real one-time payment immediately after initial signal?
- Should the ANYU portal wait until 3 to 5 modules exist?

## 21. Recommended Next Step

Recommended next step:

- `Formal Tech Stack Selection v0`

That task should use this prep document to choose:

- frontend framework
- runtime integration pattern
- data storage approach
- event tracking path
- deployment model

The important point is sequence:

1. define requirements
2. compare realistic shortlist options
3. choose the stack
4. implement a production-ready theme-page foundation
