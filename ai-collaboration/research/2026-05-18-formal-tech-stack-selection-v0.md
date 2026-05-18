# Formal Tech Stack Selection v0

Date: 2026-05-18

## 1. Executive Summary

The selected C-stage production foundation is:

- `Next.js` full-stack
- `React`
- `TypeScript` strict mode
- deployed on `Vercel`
- using `Neon PostgreSQL` in `ap-southeast-1`
- using `Drizzle ORM`
- using `Vitest`

The current Python local prototype remains:

- a validation reference
- a research tool
- a UX baseline

It is **not** the production frontend foundation.

Auth is **not required for v0**.

The design system must be promoted into canonical docs and app styles during `Repo Foundation Setup v0`.

This document makes the production-foundation decision.
It does **not** implement the new app yet.

## 2. Final Stack Decision

Selected stack:

- `Next.js` full-stack
- `React`
- `TypeScript` strict mode
- `Next.js App Router`
- `Route Handlers` and `Server Actions` where appropriate
- `Vercel` serverless deployment
- `PostgreSQL` on `Neon serverless · ap-southeast-1`
- `Drizzle ORM`
- `Vitest`
- production domain: `anyu.tw`
- auto deploy on push to `main`

Operational policy:

- initialize with latest stable versions
- pin exact versions through the lockfile
- avoid beta, RC, or canary dependencies in the public MVP critical path

## 3. Why This Stack

This stack fits the current product direction because it supports:

- standalone theme pages first
- future portal later
- ANYU design-system implementation with reusable components
- config-driven module routing
- server-side API integration for AI runtime, events, and contact capture
- straightforward future share-card generation
- clean paid-unlock evolution path
- good Codex development velocity
- low operations burden
- fast deployment and previews

Specific reasons:

- `Next.js App Router` is strong for module-based landing pages plus future directory/portal views
- `TypeScript strict mode` is useful because module config, event payloads, and runtime mappings are contract-heavy
- `Vercel` keeps deployment friction low and aligns with preview-driven iteration
- `Neon` fits a serverless app shape and is already close to the user’s existing stack direction
- `Drizzle ORM` fits schema clarity, typed query paths, and low-abstraction data access
- `Vitest` is lightweight enough for fast iteration without heavy ceremony

## 4. What Is Explicitly Not Chosen

This decision explicitly does **not** choose:

- deploying the current Python prototype as the production web app
- `Astro` as the primary foundation for v0
- a separate Python backend as the required v0 architecture
- mandatory auth for v0
- real payment as a launch blocker
- Dcard automation or crawler infrastructure as a product dependency

These are deliberate exclusions, not oversights.

## 5. Version Policy

Version policy:

- use latest stable versions at project initialization
- pin exact versions through the lockfile
- avoid beta, RC, and canary packages in the public MVP critical path
- any beta dependency requires an explicit decision log

Specific policy:

- `Next.js`: latest stable
- `React`: latest stable supported by the chosen Next.js version
- `TypeScript`: latest stable
- `Drizzle ORM`: latest stable non-beta
- `Drizzle Kit`: latest stable non-beta
- `Neon` driver: latest stable
- `Vitest`: latest stable
- `Auth.js / NextAuth`: not included in v0 unless an account system is explicitly started later

## 6. Frontend Foundation

Selected frontend foundation:

- `Next.js App Router`
- `React Server Components` where appropriate
- client components only where needed
- mobile-first layout
- design-token-driven styling

Preferred styling approach:

- CSS variables from ANYU `tokens.css`
- reusable shared UI under `components/anyu`
- module-specific components under `components/modules`

Do not start with a heavy UI kit that drifts toward a SaaS look.

## 7. Backend / API Boundary

Initial API routes:

- `/api/modules/[moduleSlug]/analyze`
- `/api/events`
- `/api/unlock-intent`
- `/api/contact`
- `/api/health`

Runtime decision:

- use `Node` runtime for AI provider calls, DB writes, Drizzle, contact capture, unlock intent, and future payment/webhook paths
- use `Edge` only for lightweight read-only routes if it becomes useful later

Important rule:

- do not force `Edge` runtime for DB, provider, or auth-sensitive routes

This keeps the production boundary simple while avoiding premature runtime constraints.

## 8. Database And ORM

Selected data foundation:

- `PostgreSQL`
- `Neon serverless`
- region: `ap-southeast-1`
- `Drizzle ORM`

Initial tables to consider:

- `sessions`
- `events`
- `analysis_requests`
- `analysis_results`
- `unlock_intents`
- `contact_submissions`
- `modules`

Privacy-aware fields to support:

- `raw_input_redacted`
- `raw_input_encrypted` later if needed
- `retention_expires_at`
- `deleted_at`
- `anonymous_session_id`

## 9. Auth Decision

Auth decision:

- **no required auth in v0**

v0 identity model:

- anonymous session id
- contact capture by email / LINE only after fake paid unlock click
- no account required

Future policy:

- optional account system can be evaluated later when Personal Insight Graph becomes user-facing
- `Auth.js / NextAuth` can be reconsidered then using the latest stable version

If legacy NextAuth code exists in the semi-finished repo:

- do not wire it into the v0 critical path
- keep it isolated or remove it during `Repo Foundation Setup v0` if it adds complexity

## 10. Deployment Decision

Selected deployment:

- `Vercel`
- production domain: `anyu.tw`
- auto deploy on push to `main`
- preview deployments for PRs / branches
- environment variables managed in `Vercel`

Clarification on standalone output:

- `Next.js standalone output` is not required for normal Vercel deployment
- keep it only if it already exists and does not add complexity

## 11. Testing Decision

Selected test foundation:

- `Vitest`

Initial test coverage should target:

- module config validation
- event payload builders
- forbidden-copy linting
- PII helper functions
- result schema mapping
- prompt input assembly
- API route unit tests where practical

The goal is not broad test volume. The goal is protecting the high-risk product contracts.

## 12. AI Runtime Integration Decision

Initial v0 decision:

- TS-hosted production runtime in `Next.js` API route or server logic
- Anthropic / OpenAI provider abstraction
- prompt and schema version references from module config

Python is retained for:

- research extraction
- synthetic evaluation
- external Dcard JSON calibration
- offline reports
- prompt evaluation
- analysis tooling

Do not discard Python research tooling.
Do not let the Python local prototype dictate the production web architecture.

## 13. Design System Placement Decision

The design system should be promoted during the next setup task.

Canonical docs target:

- `docs/design-system/anyu-design-system-v1.md`
- `docs/design-system/tokens.css`

App usage target:

- `apps/web/src/styles/tokens.css`

Source-of-truth rule:

- token changes should be made in canonical docs first
- then synced to app copy

Current references that should remain until migration is complete:

- `ai-collaboration/research/design/2026-05-18-anyu-design-system-v1.md`
- `experiments/ambiguous_temperature_v0/static/tokens.css`

Do not delete those immediately.

## 14. Repo Organization Decision

Target repo shape:

```text
apps/web/                      # production web app
docs/design-system/            # canonical design system
docs/product/                  # product decisions / maps
packages/                      # optional future shared packages
scripts/                       # research / calibration scripts for now
prompts/                       # product + research prompts
schemas/                       # product + research schemas
experiments/                   # local prototypes / validation references
outputs/                       # local generated outputs, mostly ignored
ai-collaboration/              # handoffs, reports, summaries, research artifacts
```

Clarifications:

- do not delete old experiments yet
- do not break historical handoff and report paths yet
- use README labels to mark legacy / reference status where needed

## 15. Current Prototype Treatment

Decision:

- `experiments/ambiguous_temperature_v0/` remains as a local validation reference
- it is not the production foundation

The next cleanup/setup task should add explicit README status like:

- `Legacy local prototype / validation reference`
- `Production implementation lives under apps/web after Repo Foundation Setup v0`

Do not move it yet unless explicitly requested.

## 16. Data / Privacy Foundation

Production v0 must support:

- no raw conversation text in analytics
- PII warning before submit
- backend redaction before provider call, if feasible for v0
- `retention_expires_at` for raw or redacted input
- contact capture consent
- privacy copy that avoids absolute guarantees

Minimum before public launch:

- do not store raw text in events
- store only char count, situation, score bucket, and similar derived fields
- keep contact submissions separated from raw analysis text

## 17. Event Tracking Foundation

Initial events:

- `page_view`
- `input_started`
- `input_submitted`
- `analysis_completed`
- `paid_unlock_clicked`
- `contact_submitted`
- `share_card_clicked`
- `error_seen`

Event payload should support:

- `module_id`
- `theme_slug`
- `experiment_id`
- `visual_variant`
- `prompt_version`
- `schema_version`
- `situation_type`
- `score_bucket`
- `anonymous_session_id`
- `timestamp`

Rule:

- do not include raw input

## 18. Share Card Foundation

v0:

- in-app share-card preview
- screenshot-friendly
- PNG generation is not a blocker

v1.1 direction:

- server-side OG / PNG generation
- likely `@vercel/og` / `Satori` if the app uses `Next.js`

Must preserve design-system requirements:

- 4:5 primary format
- persona
- quote
- temperature
- ANYU footer
- no raw text
- no identifiers

## 19. Paid Unlock Foundation

v0:

- fake-door unlock
- contact capture
- no real charge

v1:

- one-time micro-payment
- `NT$49` starting hypothesis
- payment provider decision later

Candidate future providers:

- `ECPay`
- `TapPay`
- `NewebPay`
- `Stripe` if feasible

UI language must preserve:

- `ONE-TIME · NO SUB`
- `解鎖下一句怎麼回 — NT$49`

## 20. Folder Structure Target

Concrete target:

```text
apps/web/
  src/
    app/
      page.tsx
      m/[moduleSlug]/page.tsx
      m/[moduleSlug]/result/[resultId]/page.tsx
      api/modules/[moduleSlug]/analyze/route.ts
      api/events/route.ts
      api/unlock-intent/route.ts
      api/contact/route.ts
      api/health/route.ts
    components/
      anyu/
      modules/
    content/
      modules/
    lib/
      ai/
      db/
      events/
      privacy/
      share/
      modules/
    styles/
      tokens.css
      globals.css
    tests/
  public/

docs/
  design-system/
    anyu-design-system-v1.md
    tokens.css
  product/
    product-map-calibration-note-v0.md
    c-stage-frontend-stack-selection-prep.md

experiments/
  ambiguous_temperature_v0/

ai-collaboration/
  handoffs/
  reports/
  research/
  summaries/
```

## 21. Migration / Setup Milestones

### Milestone 1: Repo Foundation Setup v0

- create `apps/web`
- initialize `Next.js` latest stable with `TypeScript` strict
- install `Vitest`
- install `Drizzle` / `Neon` dependencies
- promote design-system docs
- copy `tokens.css` into `apps/web`
- add module-config skeleton
- add initial route skeleton
- do not implement the full product yet

### Milestone 2: Module 01 UI Port

- port ANYU visual shell
- landing page
- input card
- chips
- result page skeleton
- paid preview
- contact capture

### Milestone 3: Runtime Integration

- connect provider abstraction
- validate result schema
- persist analysis request / result
- persist events

### Milestone 4: Fake-door Public Launch Readiness

- privacy copy
- contact capture
- event report
- deployment env
- `anyu.tw`

## 22. Risks And Anti-Patterns

Avoid:

- overbuilding the portal before the first module
- making auth required too early
- keeping `NextAuth` beta in the critical path
- productionizing the Python prototype
- hardcoding only `曖昧溫度計`
- letting UI drift from the design system
- using SaaS-looking component-library defaults without override
- storing raw relationship text without retention policy
- building Dcard crawler infrastructure
- adding real payment before fake-door signal
- making share card an afterthought

## 23. Open Questions

- package-manager choice: `pnpm` / `npm` / `yarn`
- whether to migrate from the existing semi-finished repo or start clean under `apps/web`
- whether to keep any existing `NextAuth` code if present in the older repo
- how much DB persistence is required before first public launch
- whether share-card PNG generation belongs in v0 or v1.1
- which payment provider should be evaluated first
- what should happen to historical prototype paths later

## 24. Recommended Next Step

Recommended next step:

- `Repo Foundation Setup v0`

That task should:

- create the production app foundation under `apps/web`
- promote design-system docs
- copy tokens
- initialize `Next.js` latest stable
- set `TypeScript` strict
- set up `Vitest`
- set up `Drizzle` / `Neon` skeleton
- add module-config skeleton
- preserve the old prototype as an experiment reference
