# Repo Architecture + MVP Leftover Audit v0

Date: 2026-05-21

## 1. Summary

Repo health is good for a low-key launched MVP: the active production path is now concentrated in `apps/web/`, the main operational docs are explicit, and the design/legal/launch baselines are in place. Immediate cleanup risk is `medium`: there is no sign of committed live secrets, but the repository still carries a large amount of historical research, prototype, and collaboration evidence that will become harder to navigate before broader traffic or larger technical UX work.

Secret or raw-data risk found:

- no committed `.env` file or live secret value was found in tracked files
- no committed production DB URL or provider key literal was found
- committed raw research sample text still exists under `outputs/raw/`, `outputs/product_eval/raw/`, and `outputs/product_samples/raw/`
- local untracked experiment/build/browser caches exist outside git and are not a repo-history risk, but they add local audit noise

Top 5 recommended cleanup actions:

1. Create one explicit cleanup pass that separates active app/runtime paths from research/prototype history without deleting evidence yet.
2. Add a small canonical index for `ai-collaboration/research/` so historical reports remain searchable without scanning dozens of similarly named files.
3. Decide whether `experiments/ambiguous_temperature_v0/`, `oradar/`, and `scripts/` remain active research tooling or should move to a clearly labeled archive/reference area later.
4. Review committed raw sample text under `outputs/` and confirm whether it is still acceptable to keep in git before broader traffic or more collaborators.
5. Normalize deprecated root-level artifacts such as `summary_log.md` and `templates/README.md` in a later cleanup pass after human approval.

## 2. Audit Method

Commands and approaches used:

- `git status --short`
- `find . -maxdepth 2 -type d | sort`
- `find . -maxdepth 3 -type f | sort`
- `find apps/web -maxdepth 3 -type d | sort`
- `rg --files apps/web | sort`
- `find docs -maxdepth 3 -type f | sort`
- `find oradar scripts experiments extractors outputs sources schemas prompts -maxdepth 3 -type f | sort`
- `rg -n "TODO|FIXME|deprecated|legacy|MVP|prototype|Dcard|oradar|DATABASE_URL|ANTHROPIC_API_KEY|LINE_CHANNEL|secret|password|BEGIN PRIVATE|raw input|real contact" .`
- `rg -n "from .*prototype|import .*legacy|unused" apps/web/src`
- `du -sh .[!.]* * 2>/dev/null | sort -h`
- `git ls-files ...` checks for tracked deprecated files, outputs, and caches

Audit approach:

- map tracked repo structure first
- distinguish tracked history from ignored local caches
- classify conservatively; ambiguous items are marked `NEEDS_HUMAN_REVIEW`
- do not treat public values like `hello@anyu.tw` or `https://lin.ee/S6dnbJO` as secrets

## 3. Top-Level Repository Map

| Path | Role | Status |
| --- | --- | --- |
| `apps/web/` | active production web app | `KEEP_ACTIVE` |
| `docs/` | canonical product/design/legal/ops docs | `KEEP_ACTIVE` |
| `ai-collaboration/` | execution memory, decisions, handoffs, reports | `KEEP_ACTIVE` |
| `oradar/` | Python research/runtime tooling | `KEEP_REFERENCE` |
| `scripts/` | research and calibration scripts | `KEEP_REFERENCE` |
| `experiments/ambiguous_temperature_v0/` | legacy local prototype | `KEEP_REFERENCE` |
| `outputs/` | committed research/eval/sample outputs | mixed: `KEEP_HISTORICAL` + `SECURITY_REVIEW` |
| `prompts/` | prompt assets | `KEEP_REFERENCE` |
| `schemas/` | schema assets | `KEEP_REFERENCE` |
| `extractors/` | placeholder only | `NEEDS_HUMAN_REVIEW` |
| `sources/` | placeholder only | `NEEDS_HUMAN_REVIEW` |
| `packages/` | empty top-level folder | `NEEDS_HUMAN_REVIEW` |
| `templates/` | deprecated root-level templates marker | `ARCHIVE_CANDIDATE` |
| `summary_log.md` | deprecated root summary log | `ARCHIVE_CANDIDATE` |
| `.playwright-browsers/` | ignored local browser cache | local-only, not repo |
| `.venv/` | ignored local Python venv | local-only, not repo |
| `node_modules/` | ignored local dependency tree | local-only, not repo |

## 4. Production-Critical Active Paths

Primary production-critical code paths:

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/page.tsx`
- `apps/web/src/app/m/[moduleSlug]/result/[resultId]/page.tsx`
- `apps/web/src/app/api/modules/[moduleSlug]/analyze/route.ts`
- `apps/web/src/app/api/unlock-intent/route.ts`
- `apps/web/src/app/api/contact/route.ts`
- `apps/web/src/app/api/events/route.ts`
- `apps/web/src/app/api/cron/retention-cleanup/route.ts`
- `apps/web/src/lib/ai/`
- `apps/web/src/lib/db/`
- `apps/web/src/lib/runtime/`
- `apps/web/src/lib/events/`
- `apps/web/src/lib/modules/`
- `apps/web/src/components/anyu/`
- `apps/web/src/components/modules/ai-temperature/`
- `apps/web/src/content/legal.ts`
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/globals.css`
- `apps/web/next.config.ts`
- `apps/web/vercel.json`

These should be treated as `KEEP_ACTIVE` and excluded from any broad cleanup without a scoped implementation handoff.

## 5. Staging / Production Ops Paths

Active ops paths:

- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md`
- `apps/web/vercel.json`
- `apps/web/drizzle/0000_short_harrier.sql`
- `apps/web/drizzle/0001_wooden_king_cobra.sql`
- `apps/web/drizzle.config.ts`
- `apps/web/playwright.config.ts`
- `apps/web/e2e/`
- `apps/web/src/tests/`
- `apps/web/README.md`

Operational note:

- the repo now has meaningful production operations knowledge, but it is split between app README, production runbook, launch decisions, and many verification reports

Classification:

- runbook and final launch decision: `KEEP_ACTIVE`
- older production troubleshooting reports: `KEEP_HISTORICAL`

## 6. Active Product Documentation

Canonical active docs:

- `README.md`
- `WORKING_AGREEMENT.md`
- `AGENTS.md`
- `apps/web/README.md`
- `docs/design-system/README.md`
- `docs/design-system/anyu-design-system-v1.1.md`
- `docs/design-system/tokens-v1.1.css`
- `docs/design-system/ux-flow-v1.1.md`
- `docs/design-system/brand/anyu-brand-mark-v1.1.md`
- `docs/legal/*.md`
- `docs/operations/README.md`
- `docs/operations/production-deployment-runbook.md`
- `ai-collaboration/templates/`

Classification:

- all above: `KEEP_ACTIVE`

## 7. Historical / Evidence Artifacts

Important historical evidence that should remain:

- `ai-collaboration/handoffs/` with 104 task records
- `ai-collaboration/reports/` with 102 execution reports
- `ai-collaboration/research/` with 88 synthesis/review artifacts
- `ai-collaboration/decisions/`
- `outputs/product_eval/`
- `outputs/product_samples/`
- `outputs/structured/`
- `experiments/ambiguous_temperature_v0/`
- `docs/design-system/reference/`

These are valuable for auditability and reconstruction of decisions, but they are not all equally discoverable today.

Classification:

- collaboration history: `KEEP_HISTORICAL`
- design reference bundle: `KEEP_REFERENCE`
- product eval/sample outputs: `KEEP_HISTORICAL`

## 8. Design-System / Brand Asset Structure

Current structure is mostly clean:

- canonical docs: `docs/design-system/`
- canonical tokens: `docs/design-system/tokens-v1.1.css`
- app sync copy: `apps/web/src/styles/tokens.css`
- canonical brand docs/assets: `docs/design-system/brand/`
- raw preserved bundles: `docs/design-system/reference/brand-v1.1/`, `docs/design-system/reference/v1.1/`, `docs/design-system/reference/ui-polish-v1.1/`
- generated exports: `docs/design-system/brand/exports/`

Findings:

- the split between canonical vs reference is good and should remain
- `docs/design-system/tokens.css` and `docs/design-system/anyu-design-system-v1.md` are older generation docs and appear historical, not current source of truth
- reference files are numerous but well-labeled enough to keep

Classification:

- `docs/design-system/brand/`, `tokens-v1.1.css`, `anyu-design-system-v1.1.md`, `ux-flow-v1.1.md`: `KEEP_ACTIVE`
- older v1 docs and reference bundles: `KEEP_REFERENCE`

## 9. Legal / Trust Documentation Structure

Current legal structure is straightforward:

- source drafts: `docs/legal/`
- deploy-safe app copy: `apps/web/src/content/legal.ts`
- rendered routes: `/privacy`, `/terms`, `/disclaimer`, `/legal`

Finding:

- there is an intentional dual-source pattern between `docs/legal/` and `apps/web/src/content/legal.ts`
- this is operationally acceptable now, but it is a real manual-sync burden

Classification:

- `docs/legal/`: `KEEP_ACTIVE`
- `apps/web/src/content/legal.ts`: `KEEP_ACTIVE`
- dual-copy maintenance burden: `TECH_DEBT`

## 10. AI Collaboration Artifact Structure

Current structure:

- `ai-collaboration/handoffs/`
- `ai-collaboration/reports/`
- `ai-collaboration/research/`
- `ai-collaboration/decisions/`
- `ai-collaboration/templates/`
- `ai-collaboration/summaries/summary_log.md`
- `ai-collaboration/inbox/` for intentionally untracked working material

Findings:

- the structure itself is sound
- volume is now high enough that discovery is the main problem, not storage
- `summary_log.md` under `ai-collaboration/summaries/` is the canonical persistent memory
- root `summary_log.md` and root `templates/README.md` remain as deprecation markers only

Classification:

- canonical ai-collaboration tree: `KEEP_ACTIVE`
- root `summary_log.md`: `ARCHIVE_CANDIDATE`
- root `templates/README.md`: `ARCHIVE_CANDIDATE`

## 11. Scripts / Tooling / Tests

Active app tooling:

- `apps/web/src/tests/`
- `apps/web/e2e/`
- `apps/web/playwright.config.ts`
- `apps/web/package.json`
- `apps/web/scripts/export-brand-assets.mjs`
- `apps/web/scripts/evaluate-model-latency.mjs`

Research tooling:

- `oradar/`
- `scripts/dcard_browser_topic_scan.py`
- `scripts/dcard_topic_calibration.py`
- `scripts/external_dcard_json_calibration.py`
- `scripts/generate_product_sample.py`
- `scripts/run_product_eval.py`

Legacy/prototype tooling:

- `experiments/ambiguous_temperature_v0/*.py`

Findings:

- no evidence was found that legacy Python experiment files are imported by `apps/web/src`
- the app test surface is reasonably strong for current MVP scope
- the repo still carries multiple generations of tooling with different purposes

Classification:

- app tests and e2e: `KEEP_ACTIVE`
- research scripts and `oradar`: `KEEP_REFERENCE`
- experiment Python app: `KEEP_REFERENCE`

## 12. Legacy / MVP Leftover Candidates

Likely MVP leftovers:

- `experiments/ambiguous_temperature_v0/` legacy Flask-like local prototype
- `outputs/experiments/ambiguous_temperature_v0/` local experiment output area
- root `summary_log.md` deprecated
- root `templates/` deprecated
- empty scaffolding folders `packages/`, `extractors/`, `sources/`
- older design-system v1 docs kept after v1.1 adoption

Recommended classification:

- `experiments/ambiguous_temperature_v0/`: `KEEP_REFERENCE`
- `outputs/experiments/ambiguous_temperature_v0/`: local-only today; tracked `.gitkeep` is harmless, broader folder is `ARCHIVE_CANDIDATE`
- `summary_log.md`: `ARCHIVE_CANDIDATE`
- `templates/README.md`: `ARCHIVE_CANDIDATE`
- `packages/`, `extractors/`, `sources/`: `NEEDS_HUMAN_REVIEW`
- `docs/design-system/anyu-design-system-v1.md`, `docs/design-system/tokens.css`: `KEEP_REFERENCE`

## 13. Safe Delete Candidates

High-confidence tracked delete candidates are limited.

Conservative candidates:

- none that are both tracked and unquestionably safe without human approval

If a cleanup pass is explicitly approved, the most plausible delete candidates to evaluate first are:

- root `templates/README.md` if the deprecation marker is no longer needed
- root `summary_log.md` if historical preservation is moved elsewhere or explicitly waived
- empty placeholder folders like `packages/`, `extractors/`, `sources/` if they are confirmed unnecessary

Current classification:

- `DELETE_CANDIDATE`: none with high confidence now

## 14. Archive Candidates

Strong archive candidates:

- `summary_log.md`
- `templates/README.md`
- `experiments/ambiguous_temperature_v0/`
- `docs/design-system/anyu-design-system-v1.md`
- `docs/design-system/tokens.css`
- possibly a grouped subset of older `ai-collaboration/research/` once indexed

Reason:

- these are useful for history, but not active operating inputs for the current live Module 01 path

## 15. Needs Human Review

Items that need human judgment before cleanup:

- whether `oradar/` remains an active future research engine or should eventually be archived out of the main product repo
- whether committed raw text under `outputs/raw/`, `outputs/product_eval/raw/`, and `outputs/product_samples/raw/` should remain in git
- whether `experiments/ambiguous_temperature_v0/` should stay near the active app or be archived later
- whether empty scaffolding folders `packages/`, `extractors/`, and `sources/` still represent intended near-future structure
- whether deprecated root markers should remain for continuity or be removed in a cleanup pass
- whether older design-system v1 docs should remain top-level visible or move to a clearer archive/reference namespace

## 16. Security / Privacy Risk Scan

Positive findings:

- `.env` is gitignored and not tracked
- no tracked live `DATABASE_URL` or `ANTHROPIC_API_KEY` literal was found
- no tracked `.next`, `node_modules`, `.venv`, or Playwright browser cache was found

Risk findings:

- committed raw sample text exists under `outputs/raw/`, `outputs/product_eval/raw/`, and `outputs/product_samples/raw/`
- `outputs/structured/` contains extracted signal JSON that may still deserve periodic review for privacy minimization
- many handoffs and reports discuss secrets operationally by variable name, which is acceptable, but increases search noise during audits
- local untracked `outputs/experiments/ambiguous_temperature_v0/*.jsonl` may contain contact-like or event data and should stay out of commits

Classification:

- committed raw sample text: `SECURITY_REVIEW`
- structured outputs: `NEEDS_HUMAN_REVIEW`
- operational secret-name references in docs: `KEEP_HISTORICAL`

## 17. Generated Assets / Large Files

Tracked generated or semi-generated assets:

- `apps/web/public/icon-192.png`
- `apps/web/public/icon-512.png`
- `apps/web/public/apple-touch-icon.png`
- `docs/design-system/brand/exports/*.png`
- `outputs/product_eval/generated/*.json`
- `outputs/product_samples/generated/*.json`

Local ignored large artifacts:

- `.playwright-browsers/` about `534M`
- `.venv/` about `147M`
- `node_modules/` about `705M`
- `apps/web/.next/`

Findings:

- committed generated assets are currently small and acceptable
- the main large-file issue is local workspace weight, not git history bloat

Classification:

- public icon assets: `KEEP_ACTIVE`
- brand export PNGs: `KEEP_REFERENCE`
- eval/generated outputs: `KEEP_HISTORICAL`
- local caches: outside repo history

## 18. Documentation Sprawl Findings

Sprawl is the main repo-organization problem now.

Observed counts:

- handoffs: `104`
- reports: `102`
- research artifacts: `88`
- decisions: `4`

Main sprawl patterns:

- many `review-bundle`, `report`, and `qa` artifacts are all flat in `ai-collaboration/research/`
- several topics have planning, implementation, QA, and follow-up docs with very similar names
- some older docs still live at root as deprecation markers
- design docs are relatively clean, but historical v1 and reference bundles are mixed into the same overall subtree

Recommended canonical documentation pattern:

- keep `docs/` for active canonical product/design/legal/ops docs
- keep `ai-collaboration/decisions/` for canonical decisions
- keep `ai-collaboration/templates/` for canonical workflow templates
- keep `ai-collaboration/summaries/summary_log.md` for canonical agent memory
- introduce, in a later pass, lightweight indexing inside `ai-collaboration/research/` by stream such as `launch/`, `design/`, `qa/`, `ops/`, `research-foundation/` or at minimum a generated index markdown file

## 19. Test / Tooling Gaps

Current strengths:

- active unit coverage in `apps/web/src/tests/`
- local Playwright smoke exists
- build/lint/test commands are explicit
- retention cleanup, cache, legal, LINE fallback, and UX polish all have coverage

Gaps:

- no CI wiring is described for Playwright, by design
- no single command summarizes app + research-tool validation together
- local environment is noisy because ignored caches are large and numerous
- no canonical index exists for historical audit reports and review bundles
- no dedicated privacy-review index exists for committed raw sample assets

Classification:

- local-only Playwright choice: `KEEP_ACTIVE`
- lack of historical-doc indexing: `TECH_DEBT`
- privacy review of committed raw samples: `SECURITY_REVIEW`

## 20. Recommended Cleanup Plan

Recommended order for a later cleanup pass:

1. Index and classify collaboration history before deleting anything.
2. Separate active product/ops docs from historical reference docs more explicitly.
3. Decide the future of `oradar/`, `scripts/`, and `experiments/ambiguous_temperature_v0/`.
4. Review committed raw samples for privacy acceptability and future retention intent.
5. Only then remove or archive deprecated root markers and empty placeholder folders.

Risk posture:

- cleanup should be narrow and evidence-preserving
- do not start with deletes
- start with indexing, labeling, and archival boundaries

## 21. Proposed Cleanup Pass Scope

Recommended follow-up handoff:

`Repo Cleanup Pass v0`

Suggested scope:

- create one cleanup index doc mapping active vs historical areas
- move or relabel deprecated root markers if approved
- propose archive destinations for legacy prototype and older design-system material
- optionally remove confirmed-empty or deprecated placeholders only after explicit approval
- do not touch active `apps/web/` runtime, legal routes, launch runbook, or current design-system v1.1 docs

## 22. What Not To Touch

Do not touch in the next cleanup pass unless separately approved:

- `apps/web/src/app/`
- `apps/web/src/components/`
- `apps/web/src/lib/`
- `apps/web/src/content/legal.ts`
- `apps/web/src/styles/`
- `apps/web/drizzle/`
- `apps/web/e2e/`
- `apps/web/src/tests/`
- `docs/legal/`
- `docs/operations/production-deployment-runbook.md`
- `docs/design-system/anyu-design-system-v1.1.md`
- `docs/design-system/tokens-v1.1.css`
- `docs/design-system/brand/`
- `ai-collaboration/decisions/2026-05-20-production-launch-decision-final-v0.md`
- `ai-collaboration/templates/`
- `ai-collaboration/summaries/summary_log.md`

## 23. Recommended Next Step

Run `Repo Cleanup Pass v0` as a conservative indexing-and-boundary pass, not a delete-first pass.
