# Repo Cleanup Pass v0 Review Bundle

Date: 2026-05-21

## 1. Summary

This cleanup pass stayed conservative. It removed committed raw text fixtures from the three highest-risk output areas, strengthened ignore rules so those raw fixtures stay local-only in the future, and added lightweight index/boundary docs to make the repo easier to maintain without touching active production code.

No active `apps/web` runtime code, DB schema, design-system assets, legal semantics, LINE flow, or production ops behavior were changed.

## 2. Audit Inputs Used

- `ai-collaboration/research/2026-05-21-repo-architecture-mvp-leftover-audit-v0.md`
- `ai-collaboration/reports/2026-05-21-repo-architecture-mvp-leftover-audit-v0-execution-report.md`
- reference checks across `apps/web`, `oradar`, `scripts`, `docs`, `README.md`, and historical collaboration artifacts

## 3. Files / Folders Removed

Removed committed raw text fixtures:

- `outputs/raw/sample_001.txt` through `sample_010.txt`
- `outputs/product_eval/raw/eval_001.txt` through `eval_030.txt`
- `outputs/product_samples/raw/product_sample_001.txt` through `product_sample_003.txt`

Summary count:

- `outputs/raw/`: 10 files removed
- `outputs/product_eval/raw/`: 30 files removed
- `outputs/product_samples/raw/`: 3 files removed

Total removed: 43 files

## 4. Files / Folders Archived

- none in this pass

This pass created clearer archive/index boundaries but did not move any folders into an archive location.

## 5. .gitignore Updates

Added or strengthened ignore rules for:

- `outputs/raw/*` with `.gitkeep` preserved
- `outputs/product_eval/raw/*.txt`
- `outputs/product_samples/raw/*` with `.gitkeep` preserved
- `ai-collaboration/inbox/`
- `blob-report/`
- `*.trace.zip`

## 6. Raw Output Privacy Cleanup

Action taken:

- removed committed raw text fixtures from the three audit-flagged output areas
- retained non-raw historical/generated artifacts such as:
  - `outputs/structured/`
  - `outputs/product_eval/generated/`
  - `outputs/product_eval/raw/eval_manifest.json`
  - `outputs/product_samples/generated/`

Reasoning:

- these raw text fixtures were not part of the active production path
- they increased privacy-review burden in git history
- active app/tests do not import them

Constraint observed:

- many historical reports still mention those old paths by filename; that history was preserved and not rewritten

## 7. oradar Internal Inventory

| Path | Classification | Reason | Proposed Future Action |
| --- | --- | --- | --- |
| `oradar/cli.py` | `KEEP_JSONL_TOOLING` | thin CLI wrapper for structured extraction | keep until a later extraction-tool split is approved |
| `oradar/config.py` | `KEEP_JSONL_TOOLING` | shared config loader for extraction tooling | keep with extraction tooling |
| `oradar/extractor.py` | `KEEP_JSONL_TOOLING` | core raw-text to structured-signal transform path | preserve as candidate reusable ingestion logic |
| `oradar/schema.py` | `KEEP_JSONL_TOOLING` | lightweight schema validation for extracted signal JSON | preserve with extraction tooling |
| `oradar/providers.py` | `KEEP_JSONL_TOOLING` | provider transport used by extraction and historical runtime helpers | keep for now; review if extraction tools are later split out |
| `oradar/product_runtime.py` | `KEEP_HISTORICAL` | older Python-side product runtime helper, superseded by `apps/web` runtime path | leave in place now; later archive or extract only if still useful |
| `oradar/__init__.py` | `KEEP_HISTORICAL` | package marker | leave with repo history |

Key finding:

- `oradar/` itself does not contain the Dcard crawler path
- the Dcard/Cloudflare-blocked browser and fetch logic lives mainly under `scripts/`

## 8. MVP / Prototype Boundary Notes

Boundary summary:

- `apps/web/`: active production path
- `docs/`: canonical active documentation
- `experiments/ambiguous_temperature_v0/`: legacy prototype reference
- `scripts/dcard_browser_topic_scan.py`, `scripts/dcard_topic_calibration.py`, `scripts/external_dcard_json_calibration.py`: legacy Dcard/browser/calibration path, not production runtime
- `scripts/generate_product_sample.py` and `scripts/run_product_eval.py`: historical product-eval tooling, still reusable if local raw fixtures are reintroduced privately

Practical interpretation:

- Dcard crawler/browser-topic logic is now an archive or extraction candidate, not an active app dependency
- structured transformation logic remains more reusable than the blocked fetch layer

## 9. Docs / Index Updates

Created:

- `ai-collaboration/README.md`
- `docs/operations/repo-maintenance.md`

Purpose:

- explain canonical collaboration subdirectories
- clarify active vs historical repo boundaries
- document the raw-output local-only policy for future cleanup work

## 10. Items Deferred For Human Review

- whether `oradar/product_runtime.py` should later be archived separately from the extraction tooling core
- whether `scripts/generate_product_sample.py` and `scripts/run_product_eval.py` deserve fresh private/local fixtures outside git
- whether legacy prototype and older research tooling should remain top-level visible or move behind a clearer archive boundary
- whether deprecated root markers such as `summary_log.md` and `templates/README.md` should be removed in a later cleanup pass

## 11. Validation Results

- `python3 -m compileall oradar` passed
- `cd apps/web && corepack pnpm lint` passed
- `cd apps/web && corepack pnpm test` passed
- `cd apps/web && corepack pnpm build` passed

## 12. Recommended Next Step

`Oradar Topic Tool Extraction Plan v0`

Reason:

- this cleanup pass removed privacy-risk raw fixtures and clarified boundaries
- the next useful step is a scoped plan for separating reusable structured/topic tooling from obsolete Dcard/browser acquisition logic
