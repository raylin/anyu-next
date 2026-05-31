# ANYU Core Engine & Module Grammar v0

Date: 2026-05-31

## Summary

ANYU should be treated as an AI-native personal insight system, not a loose collection of AI tests.

Durable internal thesis:

> ANYU turns lightweight, playful, shareable mini-experiences into a structured personal insight system. Each module should be useful in one session, but the deeper product value comes from a reusable core engine that combines designed interactions, soft personal memory, knowledge skill packs, precision prompting, and concrete result artifacts so repeated use becomes more personalized without becoming invasive or over-certain.

This task defines the product architecture and module grammar only. It does not implement Module 02, homepage portal changes, payment behavior, runtime abstractions, database schema, or prompt/result changes.

Recommended Module 02 direction: **職場暗流雷達** as a concept/spec next, not a runtime implementation.

## 1. Core Thesis

ANYU is an AI-native personal insight system.

The visible product is a set of warm, premium, emotionally resonant mini-experiences: tests, scenario cards, reveal flows, and relationship/workplace signal readers. The core product is a structured insight engine that:

- frames messy emotional situations better than a blank AI chat box;
- guides users through designed interactions instead of open-ended prompting;
- extracts soft hypotheses, not rigid labels;
- uses knowledge skills to calibrate interpretation without lecturing;
- produces artifacts users can act on, save, share, or revisit;
- can eventually personalize across modules while staying privacy-conscious and low-pressure.

The product promise is not “AI knows the truth.” The promise is “ANYU helps translate ambiguous human signals into a little more clarity, language, and next-step confidence.”

## 2. Two-Layer Architecture

### Module Layer

The module layer is the visible user-facing product surface:

- standalone module pages;
- module identity, name, hook, and visual language;
- input / interaction format;
- free result;
- paid artifact;
- share object;
- cross-link to other modules or follow-up experiences.

Modules can differ by theme, interaction, result artifact, and monetization. A module should be allowed to feel like a distinct mini-product.

### Core Engine Layer

The core engine is the reusable internal capability set:

- interaction patterns;
- structured trait extraction;
- knowledge skill packs;
- result artifact templates;
- Personal Insight Graph candidates;
- safe memory rules;
- monetization and unlock grammar;
- social/retention loops.

The core should accumulate learning and structure over time, but it should not become a heavy plugin framework before Module 02 validates the grammar.

### Why Keep Them Separate

| Reason | Practical implication |
|---|---|
| Modules can hot plug in/out | ANYU can test a new theme without rewriting the whole product. |
| Core memory and skills accumulate | Repeated use can become more personal without each module reinventing trait logic. |
| Future modules avoid one-off test drift | Each module should specify interaction, skills, traits, artifacts, and safety boundaries. |
| Product can stay playful while core stays rigorous | The user sees a light experience; the system keeps disciplined structure. |
| Avoid over-abstracting too early | Define grammar in docs now; implement only after repeated module needs prove it. |

## 3. Core Engine Layers

### A. Module Experience Layer

Purpose: package a theme into a coherent mini-product.

Responsibilities:

- module identity and name;
- standalone landing / entry page;
- module-specific hook;
- status badge such as `已上線`, `付款審核中`, `免費體驗`, `即將推出`;
- visual direction and tone;
- portal / cross-link metadata later.

Principle: each module should be independently understandable without requiring a full account portal.

### B. Interaction Engine

Purpose: convert messy user context into structured evidence.

Supported interaction families:

- text input;
- scenario cards;
- ranking / tradeoff;
- draw / reveal;
- multi-turn dialogue;
- timeline reflection.

Near-term rule: prefer controlled interactions over open AI NPC behavior. A designed prompt and fixed scoring path is more testable than letting the model improvise the whole experience.

### C. Personal Insight Graph

Purpose: preserve soft cross-module hypotheses, not permanent identity labels.

Data model direction:

- trait candidates;
- evidence snippets or evidence categories;
- confidence;
- recency;
- contradiction handling;
- user-facing wording separate from internal interpretation.

Current hard boundary from Module 01 prompt policy: a single interaction can produce `personal_pattern_candidate`, but Product Runtime v0 should not store it as durable user memory. This remains correct until privacy, consent, retention, and UX rules are explicitly designed.

### D. Knowledge Skill Layer

Purpose: provide calibrating knowledge without making ANYU sound like a textbook.

Candidate skills:

- relationship psychology;
- workplace communication;
- behavioral science;
- uncertainty / statistics;
- money psychology;
- social / drama / group psychology.

Use skills to shape better questions, safer interpretation, and more useful artifacts. Do not surface them as lectures unless the module artifact explicitly needs a short explanation.

### E. Result Artifact Layer

Purpose: make output useful beyond “AI wrote more text.”

Possible artifact types:

- report;
- strategy pack;
- reply scripts;
- observation checklist;
- risk map;
- share card;
- follow-up prompt.

Paid value should not always mean longer analysis. For some modules, the paid artifact should be a practical pack: scripts, checklists, or scenario-specific action options.

### F. Growth / Social Loop Layer

Purpose: turn results into retention and product learning.

Possible loops:

- LINE later, if implemented;
- IG / Threads content;
- shareable result cards;
- trend-informed module ideation;
- social signal feedback into new themes.

Guardrail: social growth should make ANYU feel more readable and useful, not manipulative or surveillance-like.

## 4. Module Grammar

Every module concept should specify the following fields before implementation:

| Field | Definition |
|---|---|
| Module ID | Stable internal identifier and route candidate. |
| Theme | Human topic domain and emotional territory. |
| User hook | One sentence that makes the user want to start. |
| Target emotional / job-to-be-done | What emotional uncertainty or decision pressure the module helps with. |
| Interaction type | Text input, scenario cards, ranking, reveal, dialogue, timeline, or hybrid. |
| Knowledge skills used | Skill packs needed to calibrate interpretation. |
| Traits extracted | Soft trait candidates or state axes, with safety language. |
| Free result artifact | What the user gets without paying. |
| Paid result artifact | What extra artifact unlocks value if monetized. |
| Share object | Result card, type label, quote, or social hook. |
| Retention hook | Why the user might return or take another module. |
| Cross-link target | Which module or follow-up experience this naturally points to. |
| Monetization type | Single unlock, strategy pack, multi-ending unlock, series bundle, free campaign, future follow-up mode. |
| Risk / safety boundaries | What the module must not diagnose, promise, or advise. |
| Required analytics / learning signals | Completion, CTA, share, payment intent, confusion, support signals. |
| Implementation complexity | Low, medium, high, with reason. |
| Readiness | Launch-ready, concept-only, future, or blocked. |

This grammar is a planning contract. It should not automatically become a database schema or runtime abstraction.

## 5. Differentiation From Generic AI

ANYU should be visibly AI-native, but not equivalent to asking a generic AI chat box.

| ANYU advantage | Why it matters |
|---|---|
| Better problem framing | Users often do not know how to ask the right question. ANYU frames the ambiguity first. |
| Designed interaction | Scenario cards, prompts, rankings, and reveals reduce blank-page friction. |
| Controlled scoring / trait extraction | Soft axes keep interpretation consistent and testable. |
| Specific knowledge skill packs | Results are calibrated by relationship, workplace, money, or group dynamics expertise. |
| Brand voice | Warm, premium, emotionally resonant, and non-clinical. |
| Result artifact design | Outputs become cards, scripts, checklists, and maps, not only paragraphs. |
| Cross-module memory | Repeated use can build gentle insight continuity. |
| Social / retention loop | Share objects and follow-up modules make the product feel alive. |

Principle: AI is not hidden. It is productized through structure, personalization, and insight design.

## 6. Guardrails

ANYU should avoid:

- every module becoming the same “AI writes a long report” experience;
- over-claiming psychological certainty;
- sounding like a therapist, diagnostic tool, or textbook;
- overly SaaS-like UX;
- overly pink, generic, horoscope-only visual language;
- uncontrolled AI NPC behavior too early;
- building a full plugin framework before Module 02 validates the grammar;
- collecting or surfacing sensitive memory too aggressively;
- opening too many product/runtime fronts before Module 01 payment launch;
- making users feel surveilled or categorized permanently.

The right stance is soft precision: concrete enough to be useful, humble enough to stay safe.

## 7. Module 01 Mapping: 曖昧溫度計

| Grammar field | Module 01 mapping |
|---|---|
| Module ID | `ambiguous-temperature` |
| Theme | Ambiguous relationship signal reading. |
| User hook | “他是真的忙，還是在冷掉？” |
| Target emotional / job-to-be-done | Help the user interpret unclear relational warmth, silence, reply patterns, and action pressure without forcing a binary answer. |
| Interaction type | Open text input with optional situation context; AI evidence anchoring. |
| Knowledge skills used | Relationship ambiguity, communication, uncertainty, boundaries, emotional regulation. |
| Traits extracted | Ambiguity tolerance, social signal sensitivity, reassurance/action pressure, boundary clarity, reply-control style, `personal_pattern_candidate`. |
| Free result artifact | Temperature reading, signal cards, insight paragraph, next step, share card. |
| Paid result artifact | Deeper relationship state analysis, reply strategy, what-not-to-do, 48-hour direction, evidence-backed full report. |
| Share object | Soft persona / temperature-style share card that avoids shame labels. |
| Retention hook | User can return with a new interaction or later take adjacent modules around reply pressure, social signals, boundaries, or commitment pressure. |
| Cross-link target | Future modules: social signal reader, red flag radar, commitment pressure, workplace undercurrent if signal sensitivity appears outside romance. |
| Monetization type | NT$49 one-time single unlock for Module 01 paid result. |
| Risk / safety boundaries | No diagnosis, no certainty about the other person’s intent, no coercive advice, no crisis/safety handling beyond support guidance. |
| Required analytics / learning signals | Analysis completion, paid CTA interest, checkout start, payment status, paid result readiness, share intent, support issues. |
| Implementation complexity | Already implemented and sandbox-validated. |
| Readiness | Low-key production active / monitor; production payment remains disabled pending merchant approval and launch gates. |

### Launch-Locked Areas

- Product name: `曖昧溫度計`.
- Price: NT$49.
- One-time / non-subscription model.
- Web delivery as launch-facing delivery promise.
- Payment foundation and NewebPay sandbox-validated path.
- Evidence Anchoring and prompt/result semantics.
- Support/refund links and production fail-closed posture.

### Still Worth Polishing

- Mobile CTA contrast and hierarchy.
- Result shareability.
- Top-of-page emotional hook.
- Support/refund wording after final owner confirmation.
- Production checkout CTA wiring only when launch gates are ready.

### Future Cross-Module Personalization Seeds

Module 01 can later contribute soft candidates such as:

- ambiguity tolerance;
- social signal sensitivity;
- conflict avoidance;
- boundary clarity;
- reassurance seeking / action pressure;
- preference for direct scripts vs emotional interpretation.

These should remain candidates, not durable stored traits, until Personal Insight Graph privacy and consent rules are designed.

## 8. Module 02 Derivation

Module 02 should not simply be “another relationship AI report.” It should validate whether the grammar can support a different interaction and artifact type while staying close enough to ANYU’s emotional signal-reading identity.

### Candidate Evaluation

| Candidate | Theme | Interaction | Result artifact | Traits extracted | Skills | Paid value | Cross-link with Module 01 | Risk | Complexity | Novelty |
|---|---|---|---|---|---|---|---|---|---|---|
| 職場暗流雷達 | Workplace undercurrents, power dynamics, unsaid pressure. | 3-round scenario cards. | Workplace undercurrent sensing type. | Power distance sensitivity, conflict avoidance, boundary awareness, self-protection, social signal sensitivity. | Workplace communication, power dynamics, boundary setting, uncertainty. | Situation breakdown, reply scripts, 48-hour observation checklist. | Extends “signal sensitivity” from romance into work. | Must avoid legal/HR certainty and workplace diagnosis. | Medium | High: proves ANYU beyond romance without losing signal-reading core. |
| 金錢安全感測驗 | Money safety, control, trust, and transparency. | Scenario ranking / tradeoff. | Money safety pattern and stress trigger map. | Scarcity sensitivity, control need, risk tolerance, trust transparency, avoidance. | Money psychology, behavioral economics, uncertainty. | Conversation scripts and safety map. | Links from relationship future/money anxiety. | Financial advice boundaries and higher sensitivity. | Medium-high | Strong but more compliance-sensitive. |
| Drama / 旁觀者人格 | Group drama, gossip, alliance, social positioning. | Scenario cards / reveal. | Drama observer role and social risk map. | Conflict appetite, alliance sensitivity, gossip boundary, self-protection. | Social psychology, group dynamics, communication. | Response scripts and what-not-to-do map. | Links from signal sensitivity and boundary style. | Can become shallow or mean if tone is wrong. | Low-medium | Highly shareable, lighter than Module 01. |
| 人生小劇場 | Inner narratives, emotional loops, self-story. | Draw / reveal or inner-voice ranking. | Emotional script archetype. | Rumination, agency, reassurance style, avoidance, self-narrative pressure. | Behavioral science, self-reflection, uncertainty. | Reflection pack and follow-up prompts. | Links from personal pattern candidate. | Can drift therapy-like and too broad. | Medium | Good long-term, less focused for Module 02. |
| 答案壓力計 | Commitment / definition pressure. | Text input or scenario hybrid. | Pressure source type and low-pressure next step. | Clarity need, timing mismatch, reassurance pressure, mutuality. | Relationship communication, commitment rhythm, uncertainty. | Low-pressure future conversation scripts. | Very adjacent to Module 01 paid reply strategy. | Risks feeling too similar to Module 01. | Medium | Strong prior concept, but less useful for testing the grammar outside romance. |

### Recommendation

Recommend **職場暗流雷達** as Module 02 concept/spec only.

Reasoning:

- It keeps ANYU’s core promise: reading unsaid signals.
- It validates that the grammar works outside romance.
- It supports a different interaction model: scenario cards instead of open text.
- It supports a different paid artifact: strategy/action pack, not long relationship analysis.
- It is Taiwan-market friendly: workplace ambiguity, hierarchy, group chat tone, and “不好明講”的 pressure are familiar.
- It should not be implemented until Module 01 launch UX and merchant-review gates remain stable.

Do not build full Module 02 yet. The next safe step is a concept spec, then optional coming-soon card after Claude Design / homepage direction is reviewed.

## 9. Module 02 Preliminary Shape: 職場暗流雷達

### Working Hook

```text
會議裡那句話，是提醒、試探，還是在切割責任？
```

Alternative softer hook:

```text
讀懂職場裡那些沒說出口的暗流：誰在推、誰在躲、你該怎麼保護自己。
```

### MVP Interaction

3-round scenario card interaction:

1. Manager / senior comment that sounds polite but may carry expectation or pressure.
2. Coworker situation around credit, blame, deadline, or CC behavior.
3. Group setting such as meeting silence, chat response, or vague “大家再想想”.

### Generation Strategy

- Fixed scenario archetypes.
- AI-generated surface variation for freshness.
- Fixed choices.
- Controlled scoring.
- Dynamic result synthesis from scoring and chosen scenario path.
- No fully open AI NPC in v0.

### Free Result

Free artifact: workplace undercurrent sensing type.

Possible free sections:

- primary undercurrent type;
- two observed signals;
- one low-risk next move;
- one “先不要做”的 caution.

### Future Paid Artifact

Paid artifact should be a strategy/action pack, not a long report:

- situation breakdown;
- power / risk map;
- 2-3 reply scripts by tone;
- 48-hour observation checklist;
- boundary-setting option;
- what-not-to-do list.

### Traits

- power distance sensitivity;
- conflict avoidance;
- boundary awareness;
- self-protection tendency;
- social signal sensitivity.

### Knowledge Skills

- workplace communication;
- power dynamics;
- boundary setting;
- behavioral bias / uncertainty.

### Safety Boundaries

- Do not give legal, HR, or employment advice.
- Do not diagnose coworkers or managers.
- Do not claim certainty about intent.
- Do not encourage escalation without context.
- Do not ask for identifying workplace details.

## 10. Interaction Generation Strategy

Recommended hybrid dynamic generation principle:

| Layer | Fixed or dynamic | Why |
|---|---|---|
| Scenario skeleton | Fixed | Keeps scoring, safety, and QA testable. |
| Surface wording | AI-generated variation | Makes repeated use feel fresh. |
| Choices | Fixed | Enables controlled scoring and consistent result types. |
| Scoring | Fixed | Prevents arbitrary model judgement. |
| Result synthesis | Dynamic but constrained | Lets the result feel personal without losing structure. |
| Open AI NPC | Not in v0 | Too difficult to test for safety, tone, and advice boundaries. |

This is fresher than a static decision tree and safer than free-form AI dialogue. It also becomes a reusable Interaction Engine pattern for future modules.

## 11. Visual System Implications

Card/scenario modules should not require a unique generated illustration for every card.

Prefer reusable visual tokens:

- halftone texture;
- abstract SVG / icon symbols;
- Riso editorial backgrounds;
- card numbers;
- signal / radar lines;
- simple “pressure / warmth / noise / distance” visual language.

AI-generated images should be limited to:

- module hero;
- OG image;
- a few texture or marketing assets.

Core UI should rely on CSS, SVG, systematic layout, and strong typography to maintain consistency across modules. This keeps ANYU premium and maintainable without requiring image generation for every content state.

## 12. Monetization Implications

Possible monetization types:

| Type | Fit |
|---|---|
| Single unlock | Good for Module 01 and early paid validation. |
| Strategy pack unlock | Strong for workplace, money, boundary, and reply modules. |
| Multi-ending unlock | Useful for scenario/card modules if users want alternate paths. |
| Series bundle | Later, after multiple modules are proven. |
| Free shareable campaign | Useful for acquisition and social feedback. |
| Future follow-up / companion mode | Later, after memory, consent, and retention rules exist. |

Module 02 v0, if paid later, can likely stay at NT$49 for simplicity. But the paid artifact should differ from Module 01: a strategy/action pack rather than another long analysis report.

## 13. Near-Term Roadmap Boundary

### Should Happen Next

- Module 01 launch UX lock implementation and payment CTA wiring only when launch gates are ready.
- Secret-safe sandbox / QA helper maintenance if future provider smoke needs it.
- Claude Design review for multi-module homepage / portal direction.
- Module 02 concept spec using this grammar.
- Dashboard update cadence after major launch-gate changes.

### Should Not Happen Yet

- Full Module 02 implementation.
- Full portal/account system.
- LINE delivery.
- Production payment enablement before NewebPay approval and formal launch gate.
- Broad ads or traffic.
- Heavy Personal Insight Graph database.
- A general plugin framework.

## 14. Recommended Next Tasks

1. `Module 02 Concept Spec: 職場暗流雷達 v0`
   - Define module grammar, scenario skeletons, scoring axes, free/paid artifacts, safety boundaries, and share object.
   - Documentation/spec only.

2. `Claude Design Multi-Module Homepage Review Packet v0`
   - Package current product status, Module 01 lock rules, and Core Grammar so Claude Design can evaluate homepage / portal concepts without hiding merchant-review content.

3. `Module 01 Checkout CTA Wiring Plan v0`
   - Plan the exact transition from launch-aligned paid CTA to checkout creation.
   - Implement only when merchant review / launch gates are ready.

4. `ANYU Dashboard Core Grammar Update Cadence v0`
   - Keep dashboard as owner-facing source of truth after major handoffs, launch gates, and Module 02 concept decisions.

5. `Production Payment Config Dry-Run v0`
   - Run only after NewebPay approval / formal credentials are available, with runtime still disabled.

## Architecture Decisions

- Treat ANYU as a two-layer system: visible modules plus an internal core engine.
- Define module grammar as a planning contract, not a schema or runtime abstraction.
- Recommend `職場暗流雷達` as Module 02 concept/spec candidate.
- Keep Personal Insight Graph as a future soft-memory direction; do not store durable traits from Module 01 runtime yet.
- Use hybrid controlled interaction generation for scenario modules rather than fully open AI NPC behavior.

## Blockers

- NewebPay merchant approval / formal production credential readiness remains external.
- Module 02 is not approved for implementation; it is a recommended concept direction only.
- Claude Design homepage direction may refine how multi-module cross-linking appears visually.

## Uncertainties

- Whether owner prefers Module 02 to move outside romance immediately (`職場暗流雷達`) or remain relationship-adjacent (`答案壓力計` / social signal reader).
- Whether the future Personal Insight Graph should be exposed to users as a named feature or remain invisible personalization.
- Whether NT$49 should remain the default price for Module 02 if it becomes paid later.

## Suggested Next Steps

- Run `Module 02 Concept Spec: 職場暗流雷達 v0`.
- Keep Module 01 production payment disabled until NewebPay approval and launch gates are complete.
- Use this report as input to Claude Design for multi-module homepage exploration.

## Known Technical Debt

- No runtime technical debt was introduced because this was documentation-only.
- Existing product architecture debt remains: module metadata and result rendering are still Module 01-specific in code, which is acceptable until Module 02 concept is selected.

## Tech Debt Review

### New Technical Debt Introduced

- None.

### Existing Technical Debt Observed

- Module routing is slug-based, but result rendering and homepage composition are still Module 01-specific.
- Future Personal Insight Graph needs privacy, consent, retention, and data-boundary decisions before implementation.
- Multi-module homepage should not be implemented until Module 02 concept and Claude Design direction are aligned.

### Opportunistic Cleanup Completed

- Added a dashboard-level architecture status update and report reference.

### Deferred Cleanup Candidates

- Module catalog metadata plan after Module 02 concept approval.
- Result artifact abstraction only after a second module proves a different shape.
- Personal Insight Graph data policy before any durable memory.

### Recommended Follow-up

- `Module 02 Concept Spec: 職場暗流雷達 v0`

## Git Commit

- Commit hash: pending
- Commit message: `docs: define anyu core module grammar`

## Staging Push

- Push status: pending
- Push command: `git push origin HEAD:staging`
