# Handoff: Evidence Anchoring v3 Production Refresh + Smoke v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Refresh production to the latest approved staging commit that includes Evidence Anchoring schema v3, then run a narrow production smoke to verify paid_result.evidenceSummary generation, rendering, privacy safety, and surface isolation.

This task updates production.

This is not a broad launch.

Do not start ads.

Do not enable payment.

Do not implement checkout.

Do not change LINE fulfillment behavior.

Do not change paid generation trigger timing.

## Background

Evidence Anchoring Schema v3 Implementation v0 completed.

Implementation commit:

```text
0d9ec2e
```

Evidence Anchoring v3 Staging Provider Review v0 completed.

Review commit:

```text
9b58ab0
```

Staging review results:

```text
- Fresh analyze was not a cache hit.
- Deferred paid generation completed from provider source, not fallback.
- paid_result_schema_v3 was generated.
- evidenceSummary object existed.
- evidenceSummary had 3 items.
- Each item had label, summary, reason.
- No identifier / long-quote safety flags.
- Evidence rendered only on unlocked paid result.
- Free / landing surfaces and LINE reply helpers did not expose evidence.
- Validation fully passed.
```

Owner visual review:

```text
Initial visual review: OK.
```

Current production status:

```text
- Low-key production active / monitor.
- Production route/API smoke passed.
- Production LIFF smoke passed.
- Production short-code smoke passed.
- Ads and broader traffic remain blocked.
- Payment remains disabled.
```

## Scope

Do:

1. Confirm latest approved staging commit to deploy.
2. Confirm candidate includes evidence anchoring implementation and staging review.
3. Run local validation.
4. Deploy / refresh production to the approved candidate.
5. Alias to https://anyu.tw.
6. Run production route/API smoke.
7. Run synthetic production analyze.
8. Run production unlock intent.
9. Trigger deferred paid generation.
10. Verify paid generation completes from provider source if possible.
11. Verify paid result uses schema v3.
12. Verify evidenceSummary exists and has 3–4 items.
13. Verify each evidence item has label, summary, reason.
14. Verify evidence safety without recording raw content.
15. Verify unlocked paid result renders evidence cards.
16. Verify evidence does not appear in free result, share card, landing, or LINE reply surfaces.
17. Verify legacy/fallback compatibility still works if practical.
18. Verify event/privacy safety.
19. Record sanitized pass/fail only.
20. Create review bundle, execution report, summary log.
21. Commit and push to `origin/staging`.

Do not:

- start ads
- broad launch
- enable real payment
- implement checkout
- implement payment provider
- change LINE webhook / LIFF behavior
- change prompt/schema beyond already approved evidence v3
- record raw input
- record paid_result_json
- record provider output
- record tokenized URLs, LINE IDs, tokens, short codes, or secrets

## Production Candidate

Candidate must include at least:

```text
0d9ec2e — Evidence Anchoring Schema v3 Implementation v0
9b58ab0 — Evidence Anchoring v3 Staging Provider Review v0 docs
```

Prefer latest approved `origin/staging` if no unapproved risky commits are present.

If newer staging commits exist, inspect them and confirm they are expected before deploying.

If uncertain, stop and ask.

## Synthetic Input

Use synthetic-only input:

```text
我們上週末見面時聊得很自然，他也說下次可以再約。但這幾天訊息變慢，常常隔半天才回，雖然還是會看我的限動、偶爾傳生活小事。我不知道他是真的忙，還是熱度在變低。
```

Context:

```text
relationshipStage: 曖昧中
userGoal: 我該怎麼回
primaryPain: 回覆變慢
replyTone: 有界線但不冷
```

Do not use real private content.

## Production Smoke Checklist

### A. Route / freshness

Verify:

```text
https://anyu.tw/m/ambiguous-temperature loads
current production deployment is refreshed to candidate
route health OK
```

If runtime still lacks exact commit marker, document behavioral verification method.

### B. Free analyze

Verify:

```text
analyze HTTP 200
free result renders
result page HTTP 200
```

Do not record raw input or full free result JSON.

### C. Unlock / deferred paid generation

Verify:

```text
unlock intent succeeds
paid generation requested
paid generation completed
paid status endpoint safe
unlocked route renders
```

Record provider/fallback source only as safe aggregate:

```text
source: provider | fallback | unknown
```

### D. Evidence schema / structure

Verify:

```text
paid_result_schema_v3
paid_result.evidenceSummary exists
evidenceSummary.items count is 3–4
each item has label
each item has summary
each item has reason
```

Do not record actual evidence text verbatim.

### E. Evidence safety

Verify structurally/safely:

```text
no long raw quote blocks
no phone-like long digit sequences
no email-like pattern
no tokenized URL pattern
no obvious identifiers
no raw transcript style
```

Record only:

```text
evidence safety: pass/fail
flag categories if any
```

Do not record flagged text.

### F. UI rendering

Verify:

```text
evidence cards render on unlocked paid result
evidence appears after paid summary and before possible states
possible states still render
reply strategies still render
48-hour plan still renders
paid content remains readable in Theme A and Theme B if feasible
```

### G. Surface isolation

Verify evidence does not appear in:

```text
free result
landing
paid preview locked cards
share card
LINE reply helper / webhook reply
LIFF bridge / pending page
```

### H. Privacy / event safety

Ensure reports/logs/docs do not contain:

```text
raw input
redacted input text
full result JSON
paid_result_json
provider output
evidence text verbatim
LINE user ID
LINE display name
ID token
LINE message text
fulfillment code
short code
unlock token
tokenized URL
email
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
```

Allowed:

```text
pass/fail
route names
status names
schema version
evidence item count
safe source provider/fallback
safe error category
```

## No-go / Rollback Conditions

Recommend rollback or block refresh if:

```text
production analyze fails
paid generation fails repeatedly
provider output cannot satisfy schema v3
fallback dominates or evidence is missing unexpectedly
evidence appears as raw quotes
evidence exposes identifiers
unlocked route breaks
LINE/share/free surfaces expose evidence
sensitive values appear in docs/logs/reports
```

Rollback option:

```text
revert Vercel production alias to prior stable deployment
```

## Metrics After Refresh

After smoke, optionally run aggregate-only metrics if production DB target is confirmed:

```bash
cd apps/web
corepack pnpm module01:metrics --last 24h
```

Do not interpret conversion due low/smoke-heavy traffic.

If run, record only aggregate counts.

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-evidence-anchoring-v3-production-refresh-smoke-v0-review-bundle.md
```

Required sections:

```markdown
# Evidence Anchoring v3 Production Refresh + Smoke v0 Review Bundle

Date: 2026-05-27

## 1. Summary
## 2. Production Candidate
## 3. Production Deployment / Freshness
## 4. Free Analyze Smoke
## 5. Deferred Paid Generation Smoke
## 6. Evidence Schema / Structure Verification
## 7. Evidence Safety Verification
## 8. UI Rendering Verification
## 9. Surface Isolation Verification
## 10. Event / Privacy Verification
## 11. Issues / Rollback
## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-evidence-anchoring-v3-production-refresh-smoke-v0-execution-report.md
```

Report structure:

```markdown
# Evidence Anchoring v3 Production Refresh + Smoke v0 Execution Report

## Summary
## Files Created
## Files Updated
## Production Deployment Status
## Production Smoke Results
## Evidence Summary Result
## Evidence Safety Result
## UI / Surface Isolation Result
## Event / Privacy Result
## Validation Results
## Known Technical Debt
## Tech Debt Review
### New Technical Debt Introduced
### Existing Technical Debt Observed
### Opportunistic Cleanup Completed
### Deferred Cleanup Candidates
### Recommended Follow-up
## Deviations From Handoff
## Git Commit
## Staging Push
## Remaining Uncertainties
## Recommended Next Step
```

## Summary Log

Append to:

```text
ai-collaboration/summaries/summary_log.md
```

Include:

```text
date
task completed
candidate commit/deployment
evidence production smoke status
validation result
commit hash
staging push status
```

## Validation

Always run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

If code changes are made:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort issue, record honestly.

## Production Gate

This task may refresh production to include evidence v3.

It does not authorize:

```text
ads
broader traffic
payment
email
rich menu
broadcast
```

## Constraints

Do not implement:

```text
raw quote snippets
follow-up sessions
payment packs
credits
LINE commands
payment provider integration
ads launch
real payment
email delivery
admin dashboard
Module 02
```

Do not modify:

```text
LINE behavior
payment behavior
legal semantics
DB schema
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
ANTHROPIC_API_KEY
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
raw production exports
real contact values
raw private user content
font files
screenshots/test artifacts
tokens/tokenized URLs/LINE IDs
paid_result_json dumps
raw provider output
evidence text verbatim
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "ops: refresh evidence anchoring production"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
production refresh status
candidate commit/deployment
provider/fallback source
schema v3 result
evidenceSummary item count
evidence safety result
UI render result
surface isolation result
event/privacy result
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
