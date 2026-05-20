# Handoff: Module 01 Staging Contact + Unlock Post-Guard Regression Check v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused staging regression check for the Module 01 paid unlock and contact capture flow after the new input validation / abuse guard changes.

This task should confirm that the guardrails did not break the core fake-door funnel:

```text
valid analyze
→ result page
→ paid unlock click
→ unlock intent
→ contact capture
→ contact submit
→ confirmation
```

This is primarily a QA task.

Do not add new product scope.

Do not change model, prompt/schema, DB schema, auth, payment, portal, or design system.

## Background

Module 01 Staging Abuse Guard Verification v0 passed.

Verified guard behavior:

- normal valid input accepted
- borderline relationship-like input accepted
- too-short input rejected
- >4000 character input rejected
- prompt-injection text rejected
- unrelated coding request rejected
- 2870-character soft-long relationship-like input allowed
- friendly error copy shown
- no code changes were needed in the verification pass

Commit:

```text
64da719
```

Next concern:

```text
Ensure the new guards did not regress unlock/contact funnel behavior.
```

## Scope

Do:

1. Confirm staging is serving `64da719` or newer.
2. Run one valid synthetic analyze flow.
3. Confirm result page loads.
4. Click paid unlock.
5. Confirm unlock intent succeeds or fallback behavior works.
6. Confirm contact capture appears.
7. Submit synthetic email.
8. Submit synthetic LINE ID if practical.
9. Confirm success state.
10. Verify event/privacy safety where possible.
11. Document results.
12. Apply only tiny safe fixes if a clear regression is found.
13. Commit report and push to `origin/staging`.

Do not:

- use real private content
- use real personal email or LINE ID
- commit secrets
- print secrets
- dump raw DB rows
- add payment
- add LINE Messaging API
- add email sending
- change runtime/model/prompt/schema

## Staging URL

Use:

```text
https://staging.anyu.tw/m/ambiguous-temperature
```

Demo route:

```text
https://staging.anyu.tw/m/ambiguous-temperature/result/demo
```

## Synthetic Test Input

Use synthetic input only:

```text
他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
```

Synthetic contact values:

```text
Email: anyu-test@example.com
LINE ID: @anyu_test
```

Do not use real contact values.

## QA Checklist

### 1. Deployment Freshness

Verify:

```text
staging.anyu.tw is serving 64da719 or newer
```

Use available commands, for example:

```bash
git fetch origin
git log --oneline -5 origin/staging
vercel inspect https://staging.anyu.tw
```

### 2. Valid Analyze Flow

Verify:

1. Landing loads.
2. Valid synthetic input enables CTA.
3. Analyze submit succeeds.
4. Result route loads.
5. Result page renders:
   - temperature card
   - observed signals
   - insight
   - share preview
   - paid preview

### 3. Paid Unlock Flow

Verify:

1. Click `解鎖下一句怎麼回 — NT$49` or equivalent CTA.
2. Unlock intent API is called.
3. If unlock intent succeeds:
   - contact capture opens normally.
4. If unlock intent fails:
   - fallback note appears.
   - contact capture still opens.
5. No technical error is shown to the user.

### 4. Contact Submit Flow

Verify:

1. Contact form accepts synthetic email.
2. Contact form accepts synthetic LINE ID if practical.
3. Consent / required fields behave correctly.
4. Submit succeeds.
5. Success confirmation is clear.
6. Repeated submit does not create confusing UX.

### 5. Event / Privacy Verification

Where possible, verify DB/events:

```text
unlock_intents row exists for successful unlock
contact_submissions row exists for synthetic contact
events include paid_unlock_clicked / contact_submitted or equivalent
events do not contain raw input
events do not contain email / LINE ID
events do not contain provider raw output or full result JSON
```

Do not paste full DB rows.

If direct DB inspection is not possible, document that and rely on route behavior plus prior unit tests.

### 6. Error UX

Verify:

```text
no stack traces
no SQL/provider errors
no raw technical error
fallback messages are friendly
```

## Rate / Cap Caution

Do not intentionally exhaust session/global caps in this regression check.

If cap is hit accidentally, document it and stop.

## If Issues Are Found

Classify:

```text
unlock intent regression
contact capture UI regression
contact API regression
event/privacy regression
guard false positive
staging freshness issue
DB access issue
```

Make only tiny safe fixes if obvious, such as:

- error copy typo
- missing fallback note
- submit button state bug
- metadata field unsafe issue

If fix is non-trivial, stop and report.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-module-01-staging-contact-unlock-post-guard-regression-check-v0.md
```

Required sections:

```markdown
# Module 01 Staging Contact + Unlock Post-Guard Regression Check v0

## 1. Summary

## 2. Deployment Freshness

## 3. Method

## 4. Valid Analyze Flow Result

## 5. Paid Unlock Flow Result

## 6. Contact Capture Result

## 7. Event / Privacy Verification

## 8. Error UX Review

## 9. Issues Found

## 10. Fixes Applied

## 11. Remaining Limitations

## 12. Recommendation

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-staging-contact-unlock-post-guard-regression-check-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Staging Contact + Unlock Post-Guard Regression Check v0 Execution Report

## Summary

## Files Created

## Files Updated

## Deployment Status

## Analyze Flow Status

## Unlock Flow Status

## Contact Flow Status

## Event / Privacy Status

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
- contact/unlock regression status
- privacy verification result
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
advanced PII / NER
scheduled deletion job
model switch
major runtime rewrite
Redis/Upstash
CAPTCHA
```

Do not modify:

```text
product prompt/schema content
provider architecture
legacy prototype behavior
Dcard scripts
design system v1.1
DB schema unless absolutely necessary
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
real contact values
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "chore: verify module 01 unlock contact regression"
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

- valid analyze flow result
- unlock flow result
- contact submit result
- privacy/event verification result
- fixes applied, if any
- remaining limitations
- report path
- validation results
- commit hash
- staging push status
- exact next step

Then stop.
