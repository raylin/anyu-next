# Foundation Fixes Decision Log

## Date

2026-05-16

## Decision

Apply the approved foundation decisions before Signal Extraction v1:

- canonical summary log path is `ai-collaboration/summaries/summary_log.md`
- root `summary_log.md` is deprecated
- Signal Extraction v1 uses `1 raw input file -> 1 structured signal JSON object`
- Signal Extraction v1 supports only `manual_paste`, `dcard_manual`, and `reddit_manual`
- scoring fields use integer values from 0 to 10

## Status

Approved

## Context

The foundation review identified several blockers before Signal Extraction v1: inconsistent summary log location, unclear output boundary, undefined source boundaries, and coarse 0-5 scoring.

## Options Considered

- Keep the initial loose foundation and defer decisions until implementation.
- Apply explicit v1 boundaries before implementation.

## Rationale

The approved decisions reduce ambiguity before implementation while preserving the local-first, markdown-first, minimal architecture.

## Consequences

- Future tasks must append only `ai-collaboration/summaries/summary_log.md`.
- Root `summary_log.md` remains historical and deprecated.
- Signal Extraction v1 should return exactly one JSON object per raw input file.
- Automatic collection and scraping remain out of scope.
- Schema validation now expects 0-10 scoring and one of three allowed v1 source types in `platform`.

## Related Files

- `AGENTS.md`
- `WORKING_AGREEMENT.md`
- `README.md`
- `schemas/signal_schema_v1.json`
- `prompts/extraction_prompt_v1.md`
- `schemas/emotion_taxonomy_v1.md`
- `ai-collaboration/summaries/summary_log.md`

