# Handoff: Module 01 Staging Deployment Refresh + Real-Device Contrast Check v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Refresh the staging deployment so `https://staging.anyu.tw` serves the latest `cedd219` design-system v1.1 adoption commit, then run a focused real-device/browser contrast check.

This task should verify that the ANYU Design System v1.1 reapplication is actually live on staging and that the major readability issues are resolved on real mobile.

This is a deployment freshness + QA task.

Do not redesign freely.

Do not change product runtime, model, provider, prompt/schema, DB schema, auth, payment, or portal scope.

## Background

ANYU Design System v1.1 Adoption + Staging Reapplication v0 completed and was pushed to `origin/staging`.

Commit:

```text
cedd219
```

What changed in that commit:

- ANYU Design System v1.1 adopted as canonical source of truth.
- Canonical files added:
  - `docs/design-system/anyu-design-system-v1.1.md`
  - `docs/design-system/ux-flow-v1.1.md`
  - `docs/design-system/tokens-v1.1.css`
- High-fidelity reference bundle preserved under:
  - `docs/design-system/reference/v1.1/`
- App token copy synced:
  - `apps/web/src/styles/tokens.css`
- Module 01 UI was reapplied to v1.1 rules:
  - observed signals should be readable again
  - paid preview should use dark A card + light locked B/C cards
  - loading should be visually consistent
  - chip/CTA contrast should use strict token pairings

Known blocker from previous task:

```text
https://staging.anyu.tw was still serving an older Vercel deployment, so live smoke of cedd219 is pending.
```

## Scope

Do:

1. Verify `origin/staging` includes commit `cedd219` or newer.
2. Verify Vercel has deployed the latest staging commit.
3. Ensure `https://staging.anyu.tw` points to the latest staging deployment.
4. If needed, trigger/retry staging deployment.
5. Run staging smoke check.
6. Run real-device or browser-device contrast check.
7. Document whether v1.1 fixed the prior readability drift.
8. Apply only tiny safe fixes if the deployment check surfaces a clear implementation bug.
9. Commit and push to `origin/staging`.

Do not:

- change runtime/model/provider/schema/DB
- switch to Haiku
- add auth/payment/portal
- add share PNG generation
- implement full-screen loading if not already done
- rewrite the design system again
- make speculative UI changes without evidence

## Staging URL

Use:

```text
https://staging.anyu.tw
```

Primary route:

```text
https://staging.anyu.tw/m/ambiguous-temperature
```

Demo route:

```text
https://staging.anyu.tw/m/ambiguous-temperature/result/demo
```

## Deployment Freshness Verification

Verify:

```text
origin/staging contains cedd219 or newer
Vercel staging deployment was built from cedd219 or newer
staging.anyu.tw resolves to that deployment
```

Suggested checks:

```bash
git fetch origin
git log --oneline -5 origin/staging
vercel inspect https://staging.anyu.tw
vercel alias ls
```

Use the actual available Vercel CLI commands.

If `staging.anyu.tw` still points to an older deployment:

1. identify the current deployment
2. identify latest staging deployment
3. update alias or trigger redeploy
4. document the exact fix

Do not change production aliases.

Do not touch `anyu.tw`.

## Staging Smoke Check

After freshness is confirmed, check:

```text
https://staging.anyu.tw/m/ambiguous-temperature
https://staging.anyu.tw/m/ambiguous-temperature/result/demo
```

Verify:

1. Landing loads.
2. Design v1.1 is visibly present.
3. Chips are readable.
4. CTA is readable.
5. Loading state uses the updated v1.1-consistent treatment.
6. Demo result loads.
7. Observed signals are readable.
8. Paid preview cards follow v1.1 hierarchy:
   - A card dark readable sample
   - B/C light locked cards
   - labels/titles not blurred
9. No runtime/model/provider error is introduced.

If possible, run a real analyze flow with synthetic input:

```text
他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。
```

Do not use real private content.

## Real-Device / Browser Contrast Check

Preferred:

- user real device if available
- otherwise browser/device emulation

Check mobile widths:

```text
360px
390px
```

Focus areas:

### Landing

- chips no longer look disabled
- selected chip is clear
- CTA is high-confidence
- brand is present but not competing with the hook
- first screen rhythm remains acceptable

### Loading

- loading state does not look like a mismatched box
- rotating / changing state is visible enough
- text contrast is readable
- no exact time promise unless accurate

### Result: Observed Signals

- `主動度`, `即時性`, `情緒投入` labels are readable
- signal values are readable
- hints/notes are readable
- signal area no longer looks like low-contrast disabled content
- it follows v1.1 signal-list intent as closely as practical

### Result: Paid Preview

- Card A is clearly readable and feels like a premium sample
- B/C locked cards are understandable
- only locked body content is blurred/locked, not title/labels
- `ONE-TIME · NO SUB`, price, and CTA are readable
- the section no longer looks gray/foggy

### Contact / Share

- contact success remains readable
- share text action remains usable
- no new contrast regressions

## If Problems Remain

If issues remain, classify them:

```text
deployment freshness issue
alias issue
cache issue
v1.1 token sync issue
component drift issue
contrast issue
loading UX issue
paid preview issue
observed signal issue
```

Make only tiny safe fixes if the issue is obvious and within v1.1 rules.

Examples of acceptable tiny fixes:

- wrong class not applied
- stale CSS selector
- missing token class
- text using faint where v1.1 requires ink/dim
- wrong background/foreground pairing

Do not invent a new visual style.

If larger changes are needed, document and recommend a separate handoff.

## Required Output

Create:

```text
ai-collaboration/research/2026-05-20-module-01-staging-deployment-refresh-real-device-contrast-check-report.md
```

Required sections:

```markdown
# Module 01 Staging Deployment Refresh + Real-Device Contrast Check Report

## 1. Summary

## 2. Staging URL

## 3. Deployment Freshness Check

## 4. Alias / Domain Check

## 5. Staging Smoke Result

## 6. Real-Device / Browser QA Method

## 7. Landing Contrast Findings

## 8. Loading State Findings

## 9. Observed Signal Findings

## 10. Paid Preview Findings

## 11. Contact / Share Findings

## 12. Issues Found

## 13. Fixes Applied

## 14. Remaining Blockers

## 15. Production Launch Readiness Impact

## 16. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-staging-deployment-refresh-real-device-contrast-check-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Staging Deployment Refresh + Real-Device Contrast Check v0 Execution Report

## Summary

## Files Created

## Files Updated

## Deployment Freshness Status

## Alias / Domain Status

## Staging Smoke Status

## Real-Device / Browser QA Status

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
- staging URL
- deployment freshness status
- contrast check status
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

If only docs/reports are changed, still run validation.

If tiny UI fixes are made, validate after fixes.

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
model switch to Haiku
major redesign
```

Do not modify:

```text
product prompt/schema content
DB schema
provider architecture
legacy prototype behavior
Dcard scripts
```

Do not commit:

```text
.env
.env.local
provider keys
DATABASE_URL
raw private user content
raw DB row dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "chore: verify staging deployment freshness and contrast"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if:

- validation failed
- unrelated uncommitted changes exist
- secrets are staged
- raw user content is staged
- QA report contains secrets or raw DB rows

If no code/docs changes were needed except reports, commit those reports.

If push is skipped or fails, report exact reason.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

- whether staging.anyu.tw served commit cedd219 or newer
- deployment/alias action taken, if any
- staging smoke result
- real-device/browser QA method
- contrast findings for chips/signals/paid preview/loading
- fixes applied, if any
- remaining blockers
- validation results
- report path
- commit hash
- staging push status
- exact next step

Then stop.
