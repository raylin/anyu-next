# Handoff: Topic Ingestion Private Batch Dry Run v0

Date: 2026-05-21

Project: anyu-next / 暗語 ANYU

## Objective

Run a local-only private batch dry run for `tools/topic-ingestion/` against:

```text
.local/topic-ingestion/private-batch/input.jsonl
```

Keep all raw input and generated private outputs out of git, inspect the generated review pack manually, and commit only sanitized repo artifacts.

## Required Steps

1. Confirm `.local/topic-ingestion/private-batch/input.jsonl` exists.
2. Confirm the private path is ignored by git; if needed, add `.local/` to `.gitignore`.
3. Do not commit the raw input file.
4. Run:

```bash
PYTHONPATH=tools/topic-ingestion python3 -m topic_ingestion.cli pipeline \
  --input .local/topic-ingestion/private-batch/input.jsonl \
  --topics-output .local/topic-ingestion/private-batch/topic-candidates.jsonl \
  --questions-output .local/topic-ingestion/private-batch/question-seeds.jsonl \
  --modules-output .local/topic-ingestion/private-batch/module-seeds.jsonl \
  --review-output .local/topic-ingestion/private-batch/trend-review-pack.md
```

5. Inspect the generated `trend-review-pack.md` manually.
6. Do not commit generated private batch outputs.
7. Create a sanitized report at:

```text
ai-collaboration/research/2026-05-21-topic-ingestion-private-batch-dry-run-v0.md
```

8. Run standard validation:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

9. Commit only the sanitized report, summary-log update, and `.gitignore` change if needed.
10. Push to `origin/staging`.

## Sanitized Report Requirements

Include only aggregate/sanitized findings:

- number of input records
- number of topic candidates
- number of question seeds
- number of module seeds
- source mix
- top topic buckets
- risk flag counts
- whether output quality looks useful
- any extractor issues observed
- recommended improvements

Do not include:

- raw post content
- raw comments
- author IDs
- URLs
- private/source text

## Constraints

- local-only execution
- do not commit `.local/`
- do not commit generated JSONL or Markdown outputs from the private batch
- do not change app runtime, schema, DB, legal semantics, or production behavior
