# Handoff: Module 01 Staging Timing Verification v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Verify the newly added Module 01 wait-state and runtime timing instrumentation on live staging.

This task should run one or more synthetic staging analyze flows, confirm that safe timing metadata is written to `analysis_completed` event metadata, and determine whether the ~28s latency is primarily provider time, DB/runtime time, or deployment/cold-start overhead.

This is a verification task.

Do not change the model.

Do not switch to Haiku.

Do not change product prompt/schema.

Do not change DB schema unless a clear bug blocks verification.

## Background

Module 01 Wait-State + Runtime Instrumentation v0 completed.

Current state:

```text
Commit: 3ea687f
Staging Push: pushed to origin/staging

What changed:
- reusable server-side timing tracker added
- analyze route now records stable timing phases
- safe latency aggregates are attached to analysis_completed event metadata
- landing page now uses elapsed-time-aware loading copy
- 65s client timeout guard added
- model/provider routing unchanged
- prompt/schema unchanged
```

Remaining gap:

```text
Live event-row verification of the new timing metadata is still pending.
```

## Scope

Do:

1. Confirm staging is serving commit `3ea687f` or newer.
2. Run staging analyze flow with synthetic input only.
3. Verify result page loads.
4. Verify `analysis_completed` event row contains safe timing metadata.
5. Verify timing metadata does not contain raw input, contact value, secrets, full result JSON, or full provider output.
6. Summarize phase timings.
7. Classify likely latency source:
   - provider-dominant
   - DB/runtime-dominant
   - cold-start/deployment-dominant
   - unclear
8. Confirm new wait-state UX is live, where possible.
9. Commit report and push to `origin/staging`.

Do not:

- use real private user content
- print secrets
- commit `.env` files
- dump raw DB rows
- switch models
- add vendor observability SDK
- add payment/auth/portal/share PNG
- make broad UI changes

## Staging URL

Use:

```text
https://staging.anyu.tw/m/ambiguous-temperature
```

Demo route:

```text
https://staging.anyu.tw/m/ambiguous-temperature/result/demo
```

## Synthetic Inputs

Use synthetic content only.

Primary sample:

```text
他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
```

Optional second sample:

```text
我們前幾週每天聊天，但最近他變得很不主動。我問他週末要不要見面，他說再看看，之後就沒下文。
```

Do not use real user/private content.

## Verification Checklist

### 1. Deployment Freshness

Verify staging is on `3ea687f` or newer.

Use available commands such as:

```bash
git fetch origin
git log --oneline -5 origin/staging
vercel inspect https://staging.anyu.tw
```

Document the deployment commit if available.

### 2. Staging Analyze Flow

Run a synthetic analyze flow against staging.

Verify:

```text
landing loads
analyze request succeeds
result route loads
temperature card renders
observed signals render
paid preview renders
```

### 3. Timing Metadata Verification

Find the corresponding `analysis_completed` event.

Verify event metadata includes safe timing aggregates such as:

```text
totalLatencyMs
providerLatencyMs
schemaValidationLatencyMs
dbWriteLatencyMs
phase timings or summarized phases
success/failure status
```

Exact field names may differ based on implementation. Document actual names.

### 4. Privacy Verification

Confirm timing metadata does not include:

```text
raw user input
contact values
provider API key
DATABASE_URL
full provider raw response
full normalized result JSON
names or private identifiers
```

Do not paste full DB rows into reports.

Summarize only:

```text
event count
metadata keys present
timing values
privacy pass/fail
```

### 5. Latency Classification

Use timing metadata to classify latency.

Suggested logic:

```text
provider-dominant:
  providerLatencyMs >= 70% of totalLatencyMs

DB/runtime-dominant:
  non-provider phases are a large share of total latency

cold-start/deployment-dominant:
  first request is much slower than later request and provider time does not explain it

unclear:
  metadata incomplete or results inconsistent
```

Document:

```text
total latency
provider latency
DB/runtime latency
validation latency
response overhead
classification
```

### 6. Wait-State UX Verification

Where possible, verify that elapsed-time-aware wait states are live.

Check:

```text
initial wait copy
8s+ slow copy
20s+ very slow copy if request lasts that long
65s timeout guard exists / is not triggered in normal flow
```

If not possible to observe frame-by-frame in the shell environment, document limitation.

## If Verification Fails

Classify issue:

```text
deployment freshness issue
staging route issue
analyze runtime issue
event persistence issue
metadata field issue
privacy issue
DB query/access issue
instrumentation bug
```

Make only minimal safe fixes if obvious.

Examples of acceptable fixes:

```text
missing metadata key
timing helper not called
event metadata guard removing safe timing fields
wrong field name in event write
```

Do not do broad refactoring.

After any fix, rerun validation.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-module-01-staging-timing-verification-v0.md
```

Required sections:

```markdown
# Module 01 Staging Timing Verification v0

## 1. Summary

## 2. Deployment Freshness

## 3. Method

## 4. Synthetic Inputs

## 5. Staging Analyze Result

## 6. Timing Metadata Found

## 7. Phase Timing Summary

## 8. Privacy Verification

## 9. Wait-State UX Verification

## 10. Latency Source Classification

## 11. Issues Found

## 12. Fixes Applied

## 13. Recommendation

## 14. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-staging-timing-verification-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Staging Timing Verification v0 Execution Report

## Summary

## Files Created

## Files Updated

## Deployment Status

## Staging Analyze Status

## Timing Metadata Status

## Privacy Verification Status

## Latency Classification

## Fixes Applied

## Validation Results

## Known Technical Debt

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

- date
- task completed
- staging timing verification status
- latency classification
- privacy verification status
- report path
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If code fixes are made, validate after fixes.

If only reports/docs are created, still run validation.

## Constraints

Do not implement:

```text
auth
real payment
portal
share PNG / OG generation
email sending
LINE integration
advanced PII
scheduled deletion job
model switch
major runtime rewrite
```

Do not modify:

```text
product prompt/schema content
DB schema unless absolutely necessary
provider architecture
legacy prototype behavior
Dcard scripts
design system v1.1
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
raw private user content
raw DB row dumps
full provider raw output
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "chore: verify module 01 staging timing"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if:

- validation failed
- unrelated uncommitted changes exist
- secrets are staged
- raw user content is staged
- report contains secrets or raw DB rows

If push is skipped or fails, report exact reason.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- staging commit/deployment verified
- synthetic analyze flow result
- timing metadata keys found
- total/provider/runtime timing summary
- latency source classification
- privacy verification result
- wait-state UX verification result
- fixes applied, if any
- report path
- validation results
- commit hash
- staging push status
- exact next step

Then stop.
