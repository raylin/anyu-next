# Handoff: Module 01 Low-key Production Monitoring v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Finalize the Module 01 production refresh/operator smoke record and begin low-key production monitoring for the first production window.

This task should record the corrected production LINE short-code smoke pass, confirm production LIFF/operator smoke status, run a safe aggregate funnel metrics report if the production DB target is confirmed, and document monitoring findings.

This is a production monitoring / ops documentation task.

Do not start ads.

Do not launch broadly.

Do not enable payment.

Do not implement new features.

Do not change production behavior unless a tiny ops documentation correction is needed.

## Background

Module 01 production was refreshed to the latest staging-tested experience.

Recent production refresh / smoke work included:

```text
- route/API smoke passed
- health, landing, analyze, result, unlock intent, LIFF URL shape, bridge, paid generation/status, unlocked route, content-trust markers all passed
- production short-code initially had no OA reply
- likely cause was LINE production secret/token mixed with staging/test values
- after correcting LINE secret/token mismatch, short-code flow appears normal
```

Important ops learning:

```text
Silent LINE OA reply failure can be caused by staging/production LINE secret or access token mismatch.
```

Metrics tooling now exists:

```text
cd apps/web
corepack pnpm module01:metrics --last 24h
```

The metrics report excludes `operatorTest = true` by default.

## Scope

Do:

1. Confirm current production deployment / alias status.
2. Confirm production route/API smoke status from latest report.
3. Record production short-code smoke as sanitized pass if user confirms.
4. Record production LIFF smoke status if user has confirmed it; otherwise mark pending.
5. Record LINE secret/token mismatch as sanitized ops note.
6. Run production aggregate metrics report only if intended production DATABASE_URL target is confirmed.
7. Exclude operatorTest traffic by default.
8. Record funnel metrics summary if report is run.
9. Verify event/privacy safety.
10. Document issues, warnings, and next recommended action.
11. Create review bundle, execution report, summary log.
12. Commit and push to `origin/staging`.

Do not:

- run ads
- broad launch
- implement payment/email
- change code
- run destructive cleanup
- print secrets
- print DATABASE_URL
- print LINE secrets/tokens
- print short codes
- print tokenized URLs
- print LINE user IDs
- print raw input or paid content
- export raw production rows

## User Confirmation Inputs Needed

Use only sanitized facts.

### Production LIFF

Format:

```text
Production LIFF: pass/fail/pending
paid content completed: yes/no/unknown
theme carried through: yes/no/unknown
404/homepage/processing stuck/error: yes/no
```

### Production short-code

Format:

```text
Production short-code: pass
bot replied: yes
link opened: yes
paid content completed: yes
theme carried through: yes/no/unknown
error: no
```

If the user only said “都正常了，看起來是 secret 跟 staging 搞混”, record:

```text
production short-code smoke: pass
bot replied: yes
root cause category: line_secret_env_mismatch
```

Do not record any secret values.

## Production Metrics Report

Only run metrics if the intended DB target is confirmed to be production.

Command:

```bash
cd apps/web
corepack pnpm module01:metrics --last 24h --format markdown
```

Default should exclude operatorTest traffic.

If needing QA/test analysis:

```bash
corepack pnpm module01:metrics --last 24h --include-operator --format markdown
```

But the main report should be real-user oriented:

```text
operatorTest excluded
```

## Metrics To Record

If report is run, record aggregate only:

```text
time window
operator events excluded count
landing_view
analyze_clicked
analyze_completed
result_view
unlock_clicked
liff_bind_success
short_code_success
paid_generation_requested
paid_generation_completed
provider vs fallback source
error categories
theme split classic/riso
warning thresholds
```

Do not record raw event rows.

Do not record user text or paid content.

If traffic is too low, say so:

```text
Traffic is too low for conversion conclusions; use report for health only.
```

## Interpretation Rules

For low-key production monitoring:

```text
No ads / no broad launch.
Low count means no statistical decision.
Focus on health and broken flow detection.
```

Health checks:

```text
analyze_completion_rate >= 80%
paid_generation_completion_rate >= 90%
fallback_rate <= 10–15%
LINE fulfillment success >= 70% once meaningful denominator exists
no sensitive data exposure
no repeated error category spike
```

If denominator is too small:

```text
mark as insufficient data
```

## Event / Privacy Verification

Ensure reports/logs/docs do not contain:

```text
raw input
redacted input text
full result JSON
paid_result_json
provider output
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
theme labels classic/riso
safe aggregate timing
source provider/fallback as aggregate
error category
operatorTest aggregate counts
```

## Required Review Bundle

Create:

```text
ai-collaboration/research/2026-05-27-module-01-low-key-production-monitoring-v0-review-bundle.md
```

Required sections:

```markdown
# Module 01 Low-key Production Monitoring v0 Review Bundle

Date: 2026-05-27

## 1. Summary

## 2. Production Deployment / Alias Status

## 3. Production Operator Smoke Status

## 4. LINE Secret / Token Ops Note

## 5. Metrics Report Status

## 6. Funnel Health Summary

## 7. Theme / Provider Split

## 8. Event / Privacy Verification

## 9. Issues Found

## 10. Monitoring Recommendation

## 11. Ads / Broader Traffic Status

## 12. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-module-01-low-key-production-monitoring-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Low-key Production Monitoring v0 Execution Report

## Summary

## Files Created

## Files Updated

## Production Status

## Operator Smoke Result

## Metrics Result

## Funnel Health

## Event / Privacy Status

## Ads / Broader Traffic Status

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
operator smoke status
metrics status
production health summary
ads/broader traffic status
validation result
commit hash
staging push status
```

## Validation

Docs/ops task. Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

If code changes are made, also run:

```bash
cd apps/web && corepack pnpm test:e2e:local
```

If Playwright is blocked by known Chromium/MachPort issue, record honestly.

## Production Gate

This task does not authorize ads or broader traffic.

Expected status after pass:

```text
Low-key production: active / monitor
Ads: blocked
Broader traffic: blocked
Payment: blocked
```

## Constraints

Do not implement:

```text
ads launch
payment provider integration
real payment
email delivery
rich menu
broadcast
portal/account system
durable queue
model switch
SSE/websocket/token streaming
Module 02
admin dashboard
```

Do not modify:

```text
app behavior
prompt/schema/cache/DB
LINE fulfillment logic
legal semantics
production behavior
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
LINE_LOGIN_CHANNEL_SECRET
RETENTION_CLEANUP_SECRET
ANALYSIS_CACHE_HASH_SECRET
OPERATOR_TEST_SECRET
raw production exports
real contact values
raw private user content
font files
screenshots / test artifacts / videos / traces unless explicitly intended and safe
raw sourced JSONL
private batch generated outputs
codes/tokens/tokenized URLs/LINE user IDs
full raw provider output
paid_result_json dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "ops: record module production monitoring"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
production status
operator smoke status
metrics report status
funnel health summary
LINE secret mismatch ops note
event/privacy result
ads/broader traffic status
validation results
review bundle path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
