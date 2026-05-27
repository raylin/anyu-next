# Evidence Anchoring v3 Production Refresh + Smoke v0 Review Bundle

Date: 2026-05-27

## 1. Summary

Production was refreshed to the approved evidence anchoring candidate and a narrow synthetic production smoke passed.

Production now serves a deployment containing Evidence Anchoring schema v3. The smoke verified fresh analyze, unlock intent, deferred paid generation, schema v3 evidence structure, unlocked UI rendering, surface isolation, and event/privacy safety using sanitized checks only.

Ads, broader traffic, real payment, checkout, payment provider integration, email, and LINE behavior were not changed.

## 2. Production Candidate

Approved candidate: `9b58ab0`.

Candidate includes:

- `0d9ec2e` — Evidence Anchoring Schema v3 Implementation v0
- `9b58ab0` — Evidence Anchoring v3 Staging Provider Review v0

No newer staging commits were present at deployment time.

## 3. Production Deployment / Freshness

Production deployment completed.

- Deployment ID: `dpl_EyjzwnraEgbyGEByqjNL1wWWdNtv`
- Deployment URL: `https://anyu-next-l42vsudp2-studioanyu-1488s-projects.vercel.app`
- Alias: `https://anyu.tw`
- Ready state: READY

Runtime still does not expose an exact commit marker, so freshness was verified behaviorally through schema v3 paid generation and unlocked evidence rendering on production.

## 4. Free Analyze Smoke

Production route/API smoke:

- `/api/health`: HTTP 200
- `/m/ambiguous-temperature`: HTTP 200
- fresh analyze: HTTP 200
- analyze cache hit: no
- result page: HTTP 200

No raw input or full result JSON was recorded.

## 5. Deferred Paid Generation Smoke

Production unlock/deferred paid generation:

- unlock intent: HTTP 200
- LIFF URL present: yes
- paid generation request: HTTP 200
- paid generation status: completed
- paid result reused existing row: no
- paid status endpoint: completed
- unlocked route: HTTP 200

## 6. Evidence Schema / Structure Verification

Production DB field-level check:

- paid row status: completed
- prompt version: `paid_result_prompt_v0.2`
- schema version: `paid_result_schema_v3`
- source category: provider
- `evidenceSummary` type: object
- evidence item count: 4
- every item has `label`, `summary`, and `reason`: yes
- maximum label length: 6
- maximum summary length: 24
- maximum reason length: 25

No raw `paid_result_json` or provider output was selected into this review.

## 7. Evidence Safety Verification

Sanitized safety checks passed:

- URL/email/account/long-digit identifier pattern in labels: no
- URL/email/account/long-digit identifier pattern in summaries: no
- URL/email/account/long-digit identifier pattern in reasons: no
- long evidence text detected: no
- quote markers suggesting raw quote blocks detected: no

Evidence safety result: pass.

## 8. UI Rendering Verification

Unlocked paid route rendered:

- evidence heading/cards: yes
- possible states: yes
- reply strategies: yes
- 48-hour plan: yes

The unlocked route did not remain stuck in pending copy.

## 9. Surface Isolation Verification

Evidence was not observed on:

- landing route
- free result route
- LIFF bridge missing-context route

LINE reply helpers remain link/status copy and are not wired to evidence content. No LINE behavior was changed.

## 10. Event / Privacy Verification

Event metadata aggregate checks showed:

- `paid_generation_started`: present
- `paid_generation_completed`: present with safe source category `provider`
- `paid_unlock_clicked`: present
- `fulfillment_code_shown`: present
- forbidden raw-content/key pattern in checked metadata: no

No raw input, redacted input, full result JSON, `paid_result_json`, provider output, evidence text verbatim, LINE IDs, short codes, unlock tokens, tokenized URLs, emails, database URLs, provider keys, LINE secrets, retention secrets, cache secrets, or operator secrets were recorded in this bundle.

## 11. Issues / Rollback

P0/P1 issues: none observed.

Rollback: not recommended based on this smoke.

Notes:

- Optional aggregate metrics command could not run locally because `DATABASE_URL` is not configured in the shell. No secret was requested or printed.
- One synthetic sample is not a broad provider-quality study.

## 12. Recommended Next Step

Keep low-key production active/monitoring. Do not start ads or broader traffic yet. Run another aggregate-only monitoring pass after more low-key traffic accumulates.
