# Handoff: Legal Route + Footer Browser QA v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Run a focused browser/staging QA pass for the newly implemented legal routes and legal footer links.

This task should verify that the v0 legal/trust baseline is visible, readable, correctly linked, and uses the approved public contact email:

```text
hello@anyu.tw
```

This is a QA task.

Do not change product runtime, model, prompt/schema, DB schema, auth, payment, LINE integration, or portal scope.

## Background

Legal Page Implementation v0 completed.

Implemented routes:

```text
/privacy
/terms
/disclaimer
/legal
```

Implemented content/source setup:

```text
docs/legal/                  human-reviewed legal source docs
apps/web/src/content/legal.ts deploy-safe app-rendered legal content
```

Implemented footer links:

```text
隱私權政策
使用條款
免責聲明
```

Public contact email:

```text
hello@anyu.tw
```

Known remaining limitation:

```text
Local live smoke of /privacy, /terms, /disclaimer, and footer links was not completed from the previous shell.
Docs and app legal copy require manual sync for future edits.
```

## Scope

Do:

1. Confirm staging is serving commit `f2bf35e` or newer.
2. Verify legal routes load on staging.
3. Verify legal footer links from Module 01 landing and result pages.
4. Verify `hello@anyu.tw` appears where expected.
5. Verify there are no placeholders like TBD / [contact email].
6. Verify mobile readability.
7. Verify short trust notices still appear and do not overcrowd the UI.
8. Document results.
9. Apply only tiny safe fixes if obvious.
10. Commit and push to `origin/staging`.

Do not:

- change legal content meaning without explicit need
- change privacy/data behavior
- implement markdown rendering
- add LINE API
- add email sending
- add auth/payment/portal
- change model/runtime/prompt/schema

## Staging URL

Use:

```text
https://staging.anyu.tw
```

Test routes:

```text
https://staging.anyu.tw/privacy
https://staging.anyu.tw/terms
https://staging.anyu.tw/disclaimer
https://staging.anyu.tw/legal
https://staging.anyu.tw/m/ambiguous-temperature
https://staging.anyu.tw/m/ambiguous-temperature/result/demo
```

## QA Checklist

### 1. Deployment Freshness

Verify staging is serving `f2bf35e` or newer.

Suggested checks:

```bash
git fetch origin
git log --oneline -5 origin/staging
vercel inspect https://staging.anyu.tw
```

Document deployment freshness status.

### 2. Legal Routes

Verify each route returns 200 and renders:

```text
/privacy
/terms
/disclaimer
/legal
```

For each page, check:

- page loads
- title is correct
- content is readable
- ANYU branding present but not overpowering
- page links to other legal pages or index
- `hello@anyu.tw` appears where appropriate
- no placeholder text remains
- mobile width remains readable
- no horizontal overflow
- no SaaS-dashboard feel

### 3. Footer Links

Verify footer links exist and work from:

```text
/m/ambiguous-temperature
/m/ambiguous-temperature/result/demo
```

If possible, also verify from a real runtime result route.

Footer should include:

```text
隱私權政策
使用條款
免責聲明
```

Links:

```text
/privacy
/terms
/disclaimer
```

### 4. UI Short Notices

Verify the following surfaces still feel natural:

#### Landing

- input helper / privacy helper
- CTA consent note, if present
- footer links

#### Result page

- result disclaimer
- share/contact/legal copy not overcrowded
- footer links

#### Contact capture

- contact note mentions LINE / Email use appropriately
- no claim that LINE automation exists if not implemented
- no hard promise beyond actual behavior

### 5. Placeholder Scan

Search app/docs for unresolved legal placeholders:

```text
TBD
[contact email]
[privacy email]
placeholder
example.com
your-email
```

Do not remove unrelated examples if they are intentional test fixtures, but document any legal-facing unresolved placeholders.

### 6. Content Consistency

Confirm:

- docs/legal and app-rendered legal content both use `hello@anyu.tw`
- privacy retention wording remains a goal, not a hard promise
- persona / insight graph remains opt-in only
- fake-door / internal-test no-real-charge wording remains accurate
- LINE is described as v0/near-future primary channel carefully, without claiming unimplemented automation

## If Issues Are Found

Classify:

```text
route issue
footer link issue
placeholder issue
mobile readability issue
content mismatch issue
overclaiming issue
visual styling issue
```

Make only tiny safe fixes if obvious:

- broken href
- missing footer
- placeholder replacement
- typo
- route missing
- hello@anyu.tw missing
- obvious legal page readability styling issue

If content meaning needs human review, document it instead of changing.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-legal-route-footer-browser-qa-v0.md
```

Required sections:

```markdown
# Legal Route + Footer Browser QA v0

## 1. Summary

## 2. Deployment Freshness

## 3. Routes Tested

## 4. Legal Route Results

## 5. Footer Link Results

## 6. UI Short Notice Results

## 7. Placeholder Scan

## 8. Content Consistency

## 9. Mobile Readability

## 10. Issues Found

## 11. Fixes Applied

## 12. Remaining Limitations

## 13. Recommendation

## 14. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-legal-route-footer-browser-qa-v0-execution-report.md
```

Report structure:

```markdown
# Legal Route + Footer Browser QA v0 Execution Report

## Summary

## Files Created

## Files Updated

## Deployment Status

## Route QA Status

## Footer QA Status

## Placeholder Scan

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
- legal route QA status
- footer link QA status
- placeholder scan result
- validation result
- report path
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If tiny fixes are made, validate after fixes.

If only reports/docs are created, still run validation.

## Constraints

Do not implement:

```text
auth
real payment
portal
share PNG / OG generation
email sending
LINE API
advanced PII / NER
scheduled deletion job
model switch
major runtime rewrite
markdown-rendering overhaul
```

Do not modify:

```text
product prompt/schema content
provider architecture
DB schema
legacy prototype behavior
Dcard scripts
design system v1.1 tokens unless necessary
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
git commit -m "chore: verify legal routes and footer links"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if:

- validation failed
- unrelated uncommitted changes exist
- secrets are staged
- raw user content is staged

If push is skipped or fails, report exact reason.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- legal routes tested
- footer links tested
- hello@anyu.tw verification
- placeholder scan result
- fixes applied, if any
- validation results
- report path
- commit hash
- staging push status
- exact next step

Then stop.
