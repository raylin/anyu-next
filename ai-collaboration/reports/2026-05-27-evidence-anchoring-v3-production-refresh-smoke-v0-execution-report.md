# Evidence Anchoring v3 Production Refresh + Smoke v0 Execution Report

## Summary

Refreshed production to approved candidate `9b58ab0` and completed a narrow synthetic production smoke for Evidence Anchoring v3. Fresh analyze, unlock intent, deferred paid generation, schema v3 evidence structure, unlocked UI rendering, surface isolation, and event/privacy checks passed.

No ads, broader traffic, real payment, checkout, payment provider integration, email delivery, LINE behavior change, prompt/schema change, DB schema change, or legal semantics change was performed.

## Files Created

- `ai-collaboration/handoffs/2026-05-27-evidence-anchoring-v3-production-refresh-smoke-v0-handoff.md`
- `ai-collaboration/research/2026-05-27-evidence-anchoring-v3-production-refresh-smoke-v0-review-bundle.md`
- `ai-collaboration/reports/2026-05-27-evidence-anchoring-v3-production-refresh-smoke-v0-execution-report.md`

## Files Updated

- `ai-collaboration/summaries/summary_log.md`

## Production Deployment Status

- Candidate commit: `9b58ab0`
- Required implementation commit included: `0d9ec2e`
- Deployment ID: `dpl_EyjzwnraEgbyGEByqjNL1wWWdNtv`
- Deployment URL: `https://anyu-next-l42vsudp2-studioanyu-1488s-projects.vercel.app`
- Production alias: `https://anyu.tw`
- Ready state: READY

The first Vercel deploy attempt from `apps/web` failed before deployment because the linked project expects the repository root. Retrying from the repository root succeeded.

## Production Smoke Results

- `/api/health`: HTTP 200
- `/m/ambiguous-temperature`: HTTP 200
- fresh analyze: HTTP 200
- analyze cache hit: no
- result page: HTTP 200
- unlock intent: HTTP 200
- LIFF URL present: yes
- paid generation request: HTTP 200
- paid generation state: completed
- paid result reused existing row: no
- paid status endpoint: completed
- unlocked route: HTTP 200

## Evidence Summary Result

Production DB field-level check:

- paid row status: completed
- prompt version: `paid_result_prompt_v0.2`
- schema version: `paid_result_schema_v3`
- provider/fallback source: provider
- `evidenceSummary` type: object
- evidence item count: 4
- all items have `label`, `summary`, and `reason`: yes
- max label length: 6
- max summary length: 24
- max reason length: 25

## Evidence Safety Result

Evidence safety: pass.

Sanitized checks found:

- identifier pattern in labels: no
- identifier pattern in summaries: no
- identifier pattern in reasons: no
- long evidence text: no
- quote markers suggesting raw quote blocks: no

No raw evidence text, raw input, provider output, or full paid JSON was recorded.

## UI / Surface Isolation Result

Unlocked paid route rendered:

- evidence heading/cards: yes
- possible states: yes
- reply strategies: yes
- 48-hour plan: yes

Evidence was not observed on:

- landing route
- free result route
- LIFF bridge missing-context route

LINE reply helpers remain link/status copy and are not wired to evidence content.

## Event / Privacy Result

Checked production event metadata for the synthetic result at aggregate/key level only.

Observed:

- `paid_generation_started`: present
- `paid_generation_completed`: present with safe source `provider`
- `paid_unlock_clicked`: present
- `fulfillment_code_shown`: present
- forbidden raw-content/key pattern in checked metadata: no

No raw input, redacted input, full result JSON, `paid_result_json`, provider output, evidence text verbatim, LINE user ID, LINE display name, ID token, LINE message text, fulfillment code, short code, unlock token, tokenized URL, email, `DATABASE_URL`, provider keys, LINE secrets, retention secret, cache secret, or operator secret was recorded.

## Validation Results

- `python3 -m compileall oradar`: passed.
- `python3 -m compileall tools/topic-ingestion`: passed.
- `PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'`: passed, 25 tests.
- `cd apps/web && corepack pnpm lint`: passed.
- `cd apps/web && corepack pnpm test`: passed, 31 files / 206 tests.
- `cd apps/web && corepack pnpm build`: passed.
- `cd apps/web && corepack pnpm test:e2e:local`: not required because no code changes were made.

Optional metrics:

- `cd apps/web && corepack pnpm module01:metrics --last 24h`: skipped/blocked because `DATABASE_URL` is not configured in the local shell. No secret was requested or printed.

## Known Technical Debt

- Runtime still lacks a safe commit/version marker, so production freshness is verified through deployment output and behavior rather than an app endpoint.

## Tech Debt Review

### New Technical Debt Introduced

None.

### Existing Technical Debt Observed

- Vercel project root expectations are easy to misuse from `apps/web`; production deploy must be run from the repository root for this linked project.
- Local aggregate metrics require a configured `DATABASE_URL`, which is intentionally not present in this shell.

### Opportunistic Cleanup Completed

None. This was production refresh/smoke and documentation only.

### Deferred Cleanup Candidates

- Add a safe app version/commit marker endpoint.
- Document the repository-root Vercel deploy requirement in the production runbook if not already explicit.
- Add a secure operator path for aggregate-only production metrics without exposing `DATABASE_URL`.

### Recommended Follow-up

Continue low-key production monitoring. Do not start ads or broader traffic until more low-key health/quality signal is reviewed.

## Deviations From Handoff

- Optional aggregate metrics could not run because `DATABASE_URL` is not configured locally.
- Local e2e was not run because no code changes were made and the handoff only requires e2e when code changes are made.

## Git Commit

To be recorded after commit.

## Staging Push

To be recorded after push.

## Remaining Uncertainties

- One synthetic production sample is not a broad provider-output quality study.
- More low-key production monitoring is needed before any traffic expansion.

## Recommended Next Step

Keep low-key production active/monitoring and run an aggregate-only production monitoring pass after more traffic accumulates.
