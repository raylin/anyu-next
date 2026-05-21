# Oradar Topic Tool Extraction Plan v0

Date: 2026-05-21

## 1. Summary

`oradar/` is not a Dcard crawler package. Its current contents are a small Python package for local configuration, provider calls, structured signal extraction, and one historical Python-side product runtime helper. The actual Dcard / Cloudflare-blocked acquisition path lives mainly in `scripts/` and in the historical calibration artifacts under `ai-collaboration/research/dcard_calibration/`.

The most reusable future path is:

```text
structured json/jsonl input
→ normalized topic-calibration records
→ topic candidates
→ question seeds
→ module / theme ideas
```

Recommended direction:

- preserve `oradar` extraction primitives as future reusable Python tooling
- do not carry forward Dcard-specific fetch/browser logic into the new topic-ingestion path
- later extract reusable structured ingestion and topic/question derivation into `tools/topic-ingestion/`

## 2. Source Context

Inputs used:

- `ai-collaboration/research/2026-05-21-repo-architecture-mvp-leftover-audit-v0.md`
- `ai-collaboration/research/2026-05-21-repo-cleanup-pass-v0-review-bundle.md`
- `oradar/`
- adjacent topic-calibration and Dcard-related `scripts/`
- `ai-collaboration/research/dcard_calibration/`

Current repo context:

- active production app is `apps/web/`
- `oradar/` is historical/reference tooling, not active runtime infrastructure
- Dcard acquisition is blocked/unlikely to be reused
- future value is in source-agnostic structured topic ingestion, not crawling

## 3. Current oradar Structure

Current tracked `oradar/` files:

- `oradar/__init__.py`
- `oradar/cli.py`
- `oradar/config.py`
- `oradar/extractor.py`
- `oradar/product_runtime.py`
- `oradar/providers.py`
- `oradar/schema.py`

Observed shape:

- one CLI entrypoint
- one config layer
- one extraction orchestration layer
- one schema validator
- one provider transport layer
- one historical product runtime helper

Notably absent:

- no dedicated topic-candidate builder
- no question-seed generator
- no Dcard/browser/cloudflare code inside `oradar/` itself
- no internal `tests/` or `fixtures/` directory

## 4. File Classification Table

| Path | Classification | Current Role | Reuse Potential | Proposed Future Action |
| --- | --- | --- | --- | --- |
| `oradar/__init__.py` | `KEEP_HISTORICAL` | package marker | low | leave in place until extraction pass defines new package boundary |
| `oradar/cli.py` | `KEEP_JSONL_TOOLING` | local CLI for `extract` command over raw text files | medium | use as reference for future topic-ingestion CLI ergonomics |
| `oradar/config.py` | `RAW_INGESTION_HELPER` | repo-root detection, dotenv loading, provider/prompt/schema path resolution | medium | extract shared config utilities only if a Python topic-ingestion tool is approved |
| `oradar/extractor.py` | `KEEP_JSONL_TOOLING` | core raw text → structured signal JSON orchestration | high | preserve as primary reusable ingestion/orchestration reference |
| `oradar/schema.py` | `KEEP_JSONL_TOOLING` | lightweight signal-schema validation | medium | preserve if future topic-ingestion output keeps lightweight Python validation |
| `oradar/providers.py` | `RAW_INGESTION_HELPER` | OpenAI/Anthropic transport wrapper for extraction/product runtime | medium | preserve temporarily; later split into provider adapter layer if topic generation remains LLM-backed |
| `oradar/product_runtime.py` | `HISTORICAL_PRODUCT_RUNTIME` | historical Python-side product result generator for prototype/product-eval flows | low for topic ingestion, medium as historical reference | keep in place now; later archive or isolate from ingestion tooling |

Adjacent but important non-`oradar` files:

| Path | Classification | Current Role | Reuse Potential | Proposed Future Action |
| --- | --- | --- | --- | --- |
| `scripts/dcard_browser_topic_scan.py` | `LEGACY_DCARD_CRAWLER` | Playwright-based browser topic scan against Dcard board/article pages | low | archive or de-emphasize later; do not include in future generic ingestion tool |
| `scripts/dcard_topic_calibration.py` | `LEGACY_CLOUDFLARE_ACQUISITION` | direct HTTP fetch calibration helper for public Dcard URLs | low to medium | archive fetch path later; salvage classification heuristics only if useful |
| `scripts/external_dcard_json_calibration.py` | `KEEP_TOPIC_EXTRACTION` | transforms structured external JSON/JSONL into calibrated topic notes | high | strongest immediate extraction candidate for future source-agnostic ingestion |
| `scripts/generate_product_sample.py` | `KEEP_HISTORICAL` | historical product sample generator using Python runtime path | low for topic ingestion | keep as historical helper only |
| `scripts/run_product_eval.py` | `KEEP_HISTORICAL` | historical synthetic product-eval runner | low for topic ingestion | keep as historical helper only |

## 5. Reusable JSONL / Topic Tooling

Most reusable current logic:

1. `oradar/extractor.py`
   - orchestration pattern for input → prompt → provider → validated structured output
   - file-based pipeline shape already fits local-first tooling

2. `oradar/config.py`
   - repo-root and simple dotenv loading
   - path management pattern useful if future tooling stays Python

3. `oradar/providers.py`
   - reusable provider-call abstraction
   - useful only if topic/question generation remains LLM-assisted

4. `scripts/external_dcard_json_calibration.py`
   - strongest existing topic/question-adjacent logic
   - already assumes structured input rather than live crawling
   - contains heuristics for:
     - stage inference
     - primary/secondary theme inference
     - core question type
     - emotional trigger
     - action pressure
     - social signal
     - hook candidate
     - product family mapping
     - MVP relevance

This script is the best current bridge from:

```text
structured json/jsonl input
→ normalized topic signals
→ hook / product / module interpretation
```

## 6. Legacy Dcard / Acquisition Code

Legacy or low-reuse acquisition layer:

- `scripts/dcard_browser_topic_scan.py`
- `scripts/dcard_topic_calibration.py`
- `ai-collaboration/research/dcard_calibration/dcard_urls.txt`

Why these are legacy:

- they depend on Dcard public page access assumptions
- one path is explicitly browser/Playwright-based
- another path uses direct public HTTP fetches that already proved brittle or blocked
- the user now acquires hot article lists through other tools

Recommended later treatment:

- archive under a clear historical area such as `archive/2026-05-dcard-crawler/` or equivalent
- keep a README explaining that these were invalidated by Cloudflare/access friction
- preserve only heuristic/topic-mapping logic that can be reused without live Dcard dependency

## 7. product_runtime.py Assessment

`oradar/product_runtime.py` currently:

- loads the older product prompt and schema from root `prompts/` and `schemas/`
- calls providers directly
- validates the generated result against the product schema
- enforces some share-card privacy checks
- is used by:
  - `scripts/generate_product_sample.py`
  - `scripts/run_product_eval.py`
  - the legacy prototype per its README

Assessment:

- it overlaps conceptually with the current `apps/web` runtime path
- it is not part of the future source-agnostic topic-ingestion path
- it may still be useful as historical product-eval tooling

Classification:

- `HISTORICAL_PRODUCT_RUNTIME`

Recommendation:

- do not move/delete it in the next extraction plan pass
- explicitly keep it out of the future `tools/topic-ingestion/` extraction scope
- revisit later only if the repo wants to fully separate old product-eval helpers from topic-ingestion tooling

## 8. Fixtures / Raw Data Safety

Inside `oradar/` itself:

- no dedicated fixtures directory found
- no raw sample text files found

Adjacent fixture/data risk:

| Path | Risk Level | Recommendation |
| --- | --- | --- |
| `ai-collaboration/research/dcard_calibration/dcard_browser_topic_scan_notes.jsonl` | medium | keep as historical calibration evidence; review before broader sharing |
| `ai-collaboration/research/dcard_calibration/dcard_topic_calibration_notes.jsonl` | medium | keep as historical calibration evidence; do not treat as active fixtures |
| `ai-collaboration/research/dcard_calibration/external_json/external_dcard_calibration_notes.jsonl` | medium | preserve carefully; useful for topic-shape reference but should not be treated as generic safe fixture set automatically |
| `ai-collaboration/research/dcard_calibration/dcard_urls.txt` | low | historical acquisition input; safe to retain as reference |

Current raw-text fixture risk from `outputs/raw/`, `outputs/product_eval/raw/`, and `outputs/product_samples/raw/` was already reduced in the prior cleanup pass.

## 9. Proposed Target Architecture

Recommended future home:

```text
tools/topic-ingestion/
```

Preferred structure:

```text
tools/topic-ingestion/
  README.md
  pyproject.toml
  topic_ingestion/
    __init__.py
    cli.py
    config.py
    providers.py
    normalize.py
    infer_topics.py
    infer_questions.py
    infer_modules.py
    schemas.py
  fixtures/
    README.md
    synthetic_hot_posts.jsonl
    synthetic_topic_cases.jsonl
  tests/
    test_normalize.py
    test_infer_topics.py
    test_infer_questions.py
```

Why Python rather than TypeScript first:

- the reusable current code is already Python
- `pyproject.toml` already defines a Python package entrypoint
- `oradar/extractor.py`, `config.py`, `providers.py`, and `schema.py` can inform extraction without introducing a second implementation language
- `apps/web` does not currently need this tooling in-process

TypeScript would only become preferable if:

- the future ingestion path must run inside the app repo’s runtime or build pipeline
- or the team explicitly wants a single-language maintenance surface

## 10. Proposed CLI / API Shape

Recommended future CLI shape:

```bash
python -m topic_ingestion.from_jsonl \
  --input data/hot-posts.jsonl \
  --output outputs/topic-candidates.jsonl \
  --mode question-seeds
```

Possible subcommands:

```text
topic-ingestion normalize
topic-ingestion infer-topics
topic-ingestion infer-questions
topic-ingestion infer-modules
```

Suggested input contract:

- source-agnostic structured `jsonl`
- each record may contain fields like:
  - `source`
  - `source_id`
  - `title`
  - `excerpt`
  - `content`
  - `topics`
  - `like_count`
  - `comment_count`
  - `comments`

Suggested output stages:

1. normalized topic note JSONL
2. topic candidate JSONL
3. question seed JSONL
4. module/theme idea JSONL

Recommended API boundary:

- heuristics-first normalization should work without live provider calls
- optional provider-assisted enrichment can sit behind a separate flag later

## 11. Future Extraction Pass Scope

Recommended future implementation handoff:

`Extract Topic Ingestion Tools v0`

Scope for that future pass:

- create `tools/topic-ingestion/`
- extract source-agnostic logic from `scripts/external_dcard_json_calibration.py`
- selectively reuse `oradar/config.py`, `oradar/providers.py`, and validation patterns where helpful
- create synthetic/sanitized fixtures
- keep Dcard fetching/browser code out of the extracted tool
- leave `oradar/product_runtime.py` and product-eval helpers untouched

## 12. Archive / Delete Candidates

Not for this pass, but likely later:

- `scripts/dcard_browser_topic_scan.py`
  - candidate: archive
- `scripts/dcard_topic_calibration.py`
  - candidate: archive
- `ai-collaboration/research/dcard_calibration/dcard_urls.txt`
  - candidate: keep historical or archive with Dcard workflow
- `oradar/product_runtime.py`
  - candidate: archive later, but not before topic-ingestion extraction is complete and historical product-eval needs are reviewed

No high-confidence `SAFE_DELETE_CANDIDATE` was identified inside `oradar/` itself today.

## 13. Items Needing Human Review

- whether the future topic-ingestion tool should stay in the same repo or be isolated later
- whether provider-backed topic/question generation is actually desired, or if heuristic-only output is preferable first
- whether `oradar/product_runtime.py` should be archived once the Python-side product-eval path is no longer needed
- whether `scripts/generate_product_sample.py` and `scripts/run_product_eval.py` still justify keeping the old Python product runtime path close at hand

## 14. Risks

- extracting too much from `oradar/` at once could accidentally mix historical product-runtime concerns into the new topic-ingestion path
- reusing Dcard-specific heuristics too literally could make a future source-agnostic pipeline less portable
- calibration `.jsonl` notes may feel like ready-made fixtures, but they still need explicit privacy and representativeness review before becoming canonical test data

## 15. Recommended Next Step

`Extract Topic Ingestion Tools v0`

Start with `scripts/external_dcard_json_calibration.py` as the main extraction source, not with the blocked Dcard acquisition scripts.
