# Repo Foundation Structure Report

## 1. Repo Name / Folder

- Repository folder confirmed as `anyu-next`.
- Public brand remains `暗語 ANYU`.
- Production app foundation now lives in `apps/web/`.

## 2. New Production App Structure

- `apps/web/` contains a Next.js App Router foundation using TypeScript strict mode and `pnpm`.
- Current app skeleton includes:
  - root landing page at `/`
  - module landing shell at `/m/[moduleSlug]`
  - result placeholder at `/m/[moduleSlug]/result/[resultId]`
  - health route at `/api/health`
  - placeholder API routes for events, contact, unlock intent, and module analysis
- Supporting app areas now exist for:
  - `components/anyu/`
  - `components/modules/ai-temperature/`
  - `content/modules/`
  - `lib/modules/`
  - `lib/db/`
  - `lib/events/`
  - `lib/ai/`
  - `lib/privacy/`
  - `styles/`
  - `tests/`

## 3. Design System Locations

- Canonical markdown: `docs/design-system/anyu-design-system-v1.md`
- Canonical tokens: `docs/design-system/tokens.css`
- App token copy: `apps/web/src/styles/tokens.css`
- Original source copies remain in:
  - `ai-collaboration/research/design/2026-05-18-anyu-design-system-v1.md`
  - `experiments/ambiguous_temperature_v0/static/tokens.css`

## 4. Legacy Prototype Location

- Legacy validation prototype remains at `experiments/ambiguous_temperature_v0/`.
- Its README now marks it as a reference-only local prototype, not the production frontend foundation.

## 5. Research / Calibration Scripts

- Calibration/research artifacts remain under:
  - `ai-collaboration/research/dcard_calibration/`
  - `scripts/`
  - `oradar/`
- No Dcard calibration scripts were modified in this task.

## 6. Prompts And Schemas

- Prompts remain under `prompts/`.
- Schemas remain under `schemas/`.
- No prompt or schema changes were made in this task.

## 7. Outputs / Generated Data

- Existing committed output areas remain:
  - `outputs/raw/`
  - `outputs/structured/`
  - `outputs/product_eval/`
  - `outputs/product_samples/`
- Ignored local experiment outputs remain under `outputs/experiments/`.

## 8. AI Collaboration Artifacts

- Handoffs: `ai-collaboration/handoffs/`
- Reports: `ai-collaboration/reports/`
- Summaries: `ai-collaboration/summaries/`
- Decisions: `ai-collaboration/decisions/`
- Templates: `ai-collaboration/templates/`

## 9. Gitignore Coverage

- Root `.gitignore` now covers:
  - Node / Next / Vercel artifacts
  - environment files while preserving `.env.example`
  - logs and runtime noise
  - Python caches and virtualenvs
  - Playwright/browser caches
  - local experiment outputs and generated calibration JSONL
  - OS/editor artifacts

## 10. Unclear / Messy Areas

- Root README and project framing still describe `Opportunity Radar`; the repo name and new app foundation now point toward `anyu-next`.
- The repository now has both Python research/runtime foundations and a new Next.js app, but the top-level navigation docs have not yet been reconciled.
- The design system has been promoted to `docs/design-system/`, but historical copies still remain in research/prototype paths.
- `packages/` is workspace-ready but intentionally empty.

## 11. Recommended Cleanup Candidates

- Decide whether the root README should be rewritten around `anyu-next` or remain a mixed research/product repository overview.
- Decide whether `apps/web/.gitignore` should be simplified now that root `.gitignore` is stronger.
- Decide whether to prune or document the empty `apps/web/public/` directory.
- Decide how to distinguish long-lived research infrastructure from production app infrastructure at the repo root.

## 12. Questions For ChatGPT

- Should the root README and repo positioning now be rewritten around `anyu-next`, or should the repository remain explicitly dual-purpose for research plus production foundation?
- Should the next step prioritize migrating real module content/flows into `apps/web`, or first clean and reorganize the root-level documentation and folder taxonomy?
- Should the canonical design system continue to live in `docs/design-system/` with manual sync into the app, or should a future shared package own tokens/components once the architecture is approved?

## Directory Snapshot

```text
.
./ai-collaboration
./ai-collaboration/decisions
./ai-collaboration/handoffs
./ai-collaboration/reports
./ai-collaboration/research
./ai-collaboration/research/dcard_calibration
./ai-collaboration/research/design
./ai-collaboration/summaries
./ai-collaboration/templates
./apps
./apps/web
./apps/web/public
./apps/web/src
./docs
./docs/design-system
./experiments
./experiments/__pycache__
./experiments/ambiguous_temperature_v0
./experiments/ambiguous_temperature_v0/__pycache__
./experiments/ambiguous_temperature_v0/static
./experiments/ambiguous_temperature_v0/templates
./extractors
./oradar
./oradar/__pycache__
./outputs
./outputs/experiments
./outputs/experiments/ambiguous_temperature_v0
./outputs/product_eval
./outputs/product_eval/generated
./outputs/product_eval/raw
./outputs/product_samples
./outputs/product_samples/generated
./outputs/product_samples/raw
./outputs/raw
./outputs/structured
./packages
./prompts
./schemas
./scripts
./scripts/__pycache__
./sources
./templates
```

## App File Snapshot

```text
apps/web/src/app/api/contact/route.ts
apps/web/src/app/api/events/route.ts
apps/web/src/app/api/health/route.ts
apps/web/src/app/api/modules/[moduleSlug]/analyze/route.ts
apps/web/src/app/api/unlock-intent/route.ts
apps/web/src/app/favicon.ico
apps/web/src/app/layout.tsx
apps/web/src/app/m/[moduleSlug]/page.tsx
apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx
apps/web/src/app/page.tsx
apps/web/src/components/anyu/Button.tsx
apps/web/src/components/anyu/Card.tsx
apps/web/src/components/anyu/SituationChips.tsx
apps/web/src/components/anyu/Wordmark.tsx
apps/web/src/components/modules/ai-temperature/AiTemperatureLanding.tsx
apps/web/src/content/modules/ai-temperature.ts
apps/web/src/content/modules/index.ts
apps/web/src/lib/ai/types.ts
apps/web/src/lib/db/client.ts
apps/web/src/lib/db/schema.ts
apps/web/src/lib/events/types.ts
apps/web/src/lib/modules/registry.ts
apps/web/src/lib/modules/types.ts
apps/web/src/lib/privacy/pii.ts
apps/web/src/styles/globals.css
apps/web/src/styles/tokens.css
apps/web/src/tests/health-route.test.ts
apps/web/src/tests/module-registry.test.ts
```

## Design System File Snapshot

```text
docs/design-system/README.md
docs/design-system/anyu-design-system-v1.md
docs/design-system/tokens.css
```

## Git Status Snapshot

```text
 M .gitignore
 M ai-collaboration/summaries/summary_log.md
 M experiments/ambiguous_temperature_v0/README.md
?? ai-collaboration/handoffs/2026-05-18-repo-foundation-setup-v0-handoff.md
?? ai-collaboration/reports/2026-05-18-repo-foundation-setup-v0-execution-report.md
?? ai-collaboration/research/2026-05-18-repo-foundation-structure-report.md
?? apps/
?? docs/
?? pnpm-lock.yaml
?? pnpm-workspace.yaml
```
