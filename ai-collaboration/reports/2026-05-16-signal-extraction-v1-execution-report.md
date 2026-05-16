# Signal Extraction v1 Execution Report

## Summary

Implemented Signal Extraction v1 as a narrow local Python CLI workflow:

```text
raw text file
-> extraction prompt
-> OpenAI API call
-> validated structured JSON
-> save output locally
```

The implementation supports one raw input file to one structured signal JSON object. It does not add scraping, batch processing, UI, dashboard, database, vector DB, auth, cloud deployment, automatic source collection, or multi-signal extraction.

## Files Created

- `pyproject.toml`
- `.env.example`
- `.gitignore`
- `oradar/__init__.py`
- `oradar/cli.py`
- `oradar/config.py`
- `oradar/extractor.py`
- `oradar/schema.py`
- `outputs/raw/sample_001.txt`
- `ai-collaboration/handoffs/2026-05-16-signal-extraction-v1-handoff.md`
- `ai-collaboration/reports/2026-05-16-signal-extraction-v1-execution-report.md`

## Files Updated

- `README.md`
- `ai-collaboration/summaries/summary_log.md`

## CLI Behavior

Primary local command:

```bash
python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Installed console-script form:

```bash
oradar extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Behavior:

- reads one raw text file
- requires one allowed source type: `manual_paste`, `dcard_manual`, or `reddit_manual`
- loads `prompts/extraction_prompt_v1.md`
- combines the prompt with raw text, source type, source file, and timestamp metadata
- calls the OpenAI Responses API
- parses one JSON object from the model output
- validates the object against `schemas/signal_schema_v1.json`
- saves the result to `outputs/structured/<raw-file-stem>.signal.json`
- prints output path and validation status on success
- reports a clear error and does not save output on failure

Expected sample output path after a successful live API run:

```text
outputs/structured/sample_001.signal.json
```

## Schema Handling

The implementation uses the existing `schemas/signal_schema_v1.json`.

No schema changes were made.

`oradar/schema.py` implements a lightweight local validator for the subset of JSON Schema used by the v1 schema:

- required fields
- no additional properties
- primitive field types
- enum values
- integer score minimum and maximum bounds
- string array item validation

Validation enforces:

- scoring integers from 0 to 10
- allowed source types through the `platform` enum
- one JSON object as the extraction output

## Prompt Handling

The implementation uses the existing `prompts/extraction_prompt_v1.md`.

No prompt changes were made.

The extractor replaces:

- `{{RAW_CONTENT}}` with the raw input text
- `{{SOURCE_METADATA}}` with JSON metadata containing source type, source file, timestamp, and the v1 one-input-to-one-output boundary

The OpenAI request also includes a short system instruction to return one valid JSON object only.

## Validation Results

Passed:

```bash
python3 -m compileall oradar
```

Result:

```text
Listing 'oradar'...
Compiling 'oradar/schema.py'...
```

Passed:

```bash
python3 -m oradar.cli --help
```

Result: CLI help rendered successfully.

Passed:

```bash
python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type invalid_source
```

Result: CLI rejected the invalid source type with argparse choice validation.

Passed:

```bash
python3 -c 'from pathlib import Path; from oradar.schema import load_json_schema, validate_signal; s=load_json_schema(Path("schemas/signal_schema_v1.json")); validate_signal({"source":"sample","platform":"dcard_manual","category":"relationship","raw_text":"x","summary":"x","emotion":"relationship anxiety","emotion_intensity":7,"pain_point":"x","pain_frequency":"recurring","social_behavior":"checking online status","identity_signal":"fear of being too主動","shareability_score":6,"monetization_score":5,"retention_score":7,"possible_product":[],"possible_hook":[],"observed_patterns":[],"timestamp":"2026-05-16T00:00:00Z"}, s); print("validator smoke test passed")'
```

Result:

```text
validator smoke test passed
```

Live API command attempted:

```bash
python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Result:

```text
Extraction failed: OPENAI_API_KEY is not set. Add it to the environment or local .env file.
```

No structured output JSON was saved because live API extraction could not run without an API key.

## API Key / Environment Notes

The CLI reads `OPENAI_API_KEY` from the process environment or a local `.env` file.

`.env.example` was added with:

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

No real API key was added.

`OPENAI_MODEL` is optional and defaults to `gpt-4.1-mini`.

The implementation uses the OpenAI Responses API endpoint:

```text
POST https://api.openai.com/v1/responses
```

The endpoint shape was checked against the official OpenAI API reference during implementation:

- https://platform.openai.com/docs/api-reference/responses/create

## Deviations From Handoff

- The implementation uses the Python standard library instead of adding `typer`, `pydantic`, `openai`, `python-dotenv`, and `rich`.
- This keeps v1 dependency-free and avoids package installation as a local setup blocker.
- The command `oradar extract ...` is available after package installation through the `pyproject.toml` console script. The direct local command is `python3 -m oradar.cli extract ...`.
- Live OpenAI validation was not completed because `OPENAI_API_KEY` is not set in the local environment.

## Remaining Uncertainties

- Live extraction output quality still needs review once an API key is configured.
- Score calibration should be reviewed against real extracted examples.
- The current validator intentionally implements only the JSON Schema subset used by v1.
- Packaging command ergonomics can be revisited after the first live extraction review.

## Recommended Next Step

Set `OPENAI_API_KEY` locally and run:

```bash
python3 -m oradar.cli extract outputs/raw/sample_001.txt --source-type dcard_manual
```

Then review `outputs/structured/sample_001.signal.json` for schema fit, prompt quality, scoring consistency, and whether the extracted signal is useful for founder research.
