# Status

This is the legacy local validation prototype for 曖昧溫度計.

It is retained as a reference for:
- product flow
- ANYU visual direction
- fake-door behavior
- local experiment logging

It is not the production frontend foundation.

The production app foundation now lives under:

`apps/web/`

# 曖昧溫度計 Prototype Skeleton v0

## Purpose

This prototype is a local-first fake-door skeleton for the `曖昧溫度計` experiment.

It now uses the `暗語 ANYU · Design System v1.0` visual direction for the current `曖昧溫度計 by 暗語 ANYU` module shell.

It validates this thin flow:

1. user selects a situation type
2. user pastes text or describes the situation
3. product runtime generates a free result
4. user sees free result, insight layer, share card, and paid preview
5. user clicks the fake paid CTA
6. user can leave LINE or email for manual follow-up
7. events and submissions are logged locally as JSONL

This is not a production app.

## How To Run Locally

From the repository root:

```bash
python3 experiments/ambiguous_temperature_v0/app.py
```

Default local URL:

```text
http://127.0.0.1:8010
```

Optional:

```bash
python3 experiments/ambiguous_temperature_v0/app.py --host 127.0.0.1 --port 8010
```

## Environment Variables

The prototype reuses repository config loading from `oradar.config`, including local `.env`.

Recommended for live product runtime generation:

```text
ORADAR_PROVIDER=anthropic
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

OpenAI is also supported by the shared provider helper if `ORADAR_PROVIDER=openai` and the required key/model are configured, but Anthropic-backed runtime generation is the primary tested path for this prototype.

## Generated Local Files

These files are created under `outputs/experiments/ambiguous_temperature_v0/` when the prototype runs:

- `events.jsonl`
- `submissions.jsonl`
- `contact_submissions.jsonl`
- `experiment_report.md`

These files are intentionally ignored by git.

## Design System Sources

The current visual layer is based on:

- `ai-collaboration/research/design/2026-05-18-anyu-design-system-v1.md`
- `experiments/ambiguous_temperature_v0/static/tokens.css`

The prototype imports the token file through:

- `experiments/ambiguous_temperature_v0/static/styles.css`

## Visual Direction Summary

The prototype currently applies these design-system decisions:

- `暗語 ANYU` as the mother-brand lockup, with `曖昧溫度計` as `module · 01`
- cream background, serif headline, and soft accent glow instead of a SaaS dashboard layout
- token-based cards, chips, typography, shadows, and spacing
- premium result cards, a screenshot-oriented share-card preview, and a one-time paid unlock surface
- contact capture styling aligned to the same module language

## What Was Implemented

- token import and module-level visual theming
- updated landing page structure and brand hierarchy
- premium input card styling and chip-based situation selector UI
- explicit mobile CTA enabled / disabled states
- refreshed temperature signature, insight, share preview, paid preview, and contact capture cards
- mobile-first spacing and focus-visible styling

## Intentionally Not Implemented Yet

- real share-card image generation
- real payment
- portal or multi-module navigation
- backend PII redaction or guaranteed 24-hour deletion enforcement
- production privacy policy, retention logic, or account controls

## Analyze Local Results

Generate a local markdown summary from the JSONL logs with:

```bash
python3 experiments/ambiguous_temperature_v0/analyze_results.py
```

Optional output override:

```bash
python3 experiments/ambiguous_temperature_v0/analyze_results.py --output outputs/experiments/ambiguous_temperature_v0/experiment_report.md
```

The analysis script reads:

- `events.jsonl`
- `submissions.jsonl`
- `contact_submissions.jsonl`

And writes:

- `outputs/experiments/ambiguous_temperature_v0/experiment_report.md`

Interpretation notes:

- fake paid unlock clicks are intent signals, not revenue
- contact submissions are stronger intent than paid clicks alone
- early sample sizes should be interpreted directionally
- a high paid click count with weak contact conversion can indicate curiosity without strong commitment

## Privacy Warning

Local submissions may contain sensitive user text and contact information.

- Do not commit generated JSONL logs publicly.
- Do not commit generated experiment reports publicly.
- Do not use real private conversations when demoing unless you are comfortable storing them locally.
- The UI warns users not to paste names, phone numbers, addresses, or other identifying information.
- The analysis report hides raw input text and does not print contact values.
- The current UI copy frames 24-hour deletion as prototype intent; production privacy and PII handling still need implementation.

## Intentionally Not Built

This prototype does not include:

- real payment
- login
- database storage
- analytics SaaS
- screenshot upload
- OCR
- dashboard or admin panel
- account system
- social sharing integration
- research signal extraction UI
- long-term personal graph storage

## Known Limitations

- Contact validation is intentionally shallow for v0 and only checks non-empty value plus `line` or `email` type.
- The prototype logs click and submission events locally but does not yet provide aggregate reporting views.
- Product runtime generation depends on configured provider credentials; without them, analysis requests fail with a visible error.

## How This Prototype Avoids Technical Debt

- Product runtime generation is centralized in `oradar/product_runtime.py` instead of duplicated in the experiment server.
- Prompt and schema remain external repository artifacts and are not hardcoded into UI files.
- UI, event logging, contact capture, and product runtime helpers are separated into small modules.
- Event and submission logs are reusable JSONL appenders, not UI-specific hacks.
- Sensitive local outputs are git-ignored by default.
