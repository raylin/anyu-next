# Handoff: Module 01 Follow-up Interaction + Evidence Anchoring Plan v0

Date: 2026-05-27

Project: anyu-next / 暗語 ANYU

## Objective

Create a product/architecture plan for Module 01’s next iteration based on recent family/friend tester feedback.

This task should explore three related product directions:

1. Faster or better-perceived first analysis for shorter inputs.
2. Evidence anchoring in full paid analysis, so users can understand which parts of their input the recommendation is based on.
3. Follow-up interaction / multi-use paid experience, because relationship situations evolve over days and users may want to ask multiple times about the same relationship.

This is a planning task only.

Do not implement code.

Do not change production.

Do not change prompt/schema/DB.

Do not change payment.

Do not change LINE behavior.

Do not start ads.

## Background

Recent tester feedback:

```text
1. The first waiting/analyze screen still feels a bit long, especially when the user input is not very long.
2. Full analysis could reference or summarize parts of the original input so users can connect recommendations back to what they wrote.
3. The most important feedback: users in emotionally uncertain relationships may want multiple interactions over time. If each new small update costs NT$49, it may feel wasteful. A more natural product might support multiple follow-ups, relationship tracking, or a small pack.
```

Current product state:

```text
- Module 01 has free-only analyze.
- Deferred paid generation exists.
- LINE / LIFF / short-code fulfillment exists.
- Pending paid UX polls and auto-refreshes.
- Input minimum is 80 visible characters.
- Dual Theme A/B exists.
- Low-key production activation is in progress.
```

Strategic question:

```text
Is Module 01 better framed as:
A. NT$49 one-time full analysis,
B. a 3-use interaction pack,
C. a 7-day relationship observation pass,
D. a LINE-based ongoing follow-up experience?
```

This task should not decide payment implementation, but should define the product direction and technical implications.

## Scope

Do:

1. Analyze short-input first-analyze latency/perceived-wait options.
2. Propose tiered free-result behavior based on input richness.
3. Propose evidence anchoring for paid results.
4. Evaluate whether to quote original text or summarize evidence signals.
5. Propose follow-up interaction models.
6. Compare one-time NT$49 vs multi-pack vs 7-day observation pass.
7. Define likely data model and LINE identity implications.
8. Define privacy implications of retaining evidence or original text.
9. Define MVP phases.
10. Define what should wait until after low-key production monitoring.
11. Create research plan, execution report, summary log.
12. Commit and push to `origin/staging`.

Do not:

- implement fast path
- implement evidence anchors
- implement multi-pack
- implement payment
- implement LINE follow-up commands
- change prompt/schema/DB
- change production behavior
- change analytics events unless documenting future needs
- use real private user content

## Part A — Short-input Analyze Speed / Perceived Wait

### Problem

First analyze can still feel slow. For users who input just above the minimum threshold, a 20-second wait may feel long.

### Questions to answer

```text
1. Can shorter inputs use a faster free-result path?
2. Should free-result depth scale with input richness?
3. Would this hurt perceived quality?
4. Should we improve actual latency, perceived waiting, or both?
```

### Options to evaluate

#### Option A: Same model, shorter free prompt for 80–139 chars

```text
80–139 chars:
  concise free result
  fewer explanatory lines
  same schema or compatible short schema
```

Pros:

```text
faster
lower token cost
matches lower input richness
```

Cons:

```text
may feel thinner
more prompt/schema branches
```

#### Option B: Same free result, better waiting copy

```text
keep output quality stable
improve progress steps and perceived wait
```

Pros:

```text
low risk
no schema branching
```

Cons:

```text
does not reduce actual latency
```

#### Option C: Use faster model for short free analyze

Pros:

```text
can reduce latency materially
```

Cons:

```text
quality variance
model ops complexity
needs validation
```

#### Option D: Progressive free result

```text
show immediate “input received / initial read” state
then result
```

Pros:

```text
better perceived progress
```

Cons:

```text
could feel fake if not grounded
```

### Expected recommendation

Likely recommendation:

```text
Start with perceived-wait improvement and metrics.
Plan a short-input fast path only if production latency remains a conversion issue.
```

But Codex should reason from current code/latency reports.

## Part B — Evidence Anchoring

### Problem

In a long paid analysis, users may forget how each recommendation connects to what they wrote.

### Product goal

Add a lightweight evidence section to paid result:

```text
這份分析主要參考了這些線索
```

or:

```text
我看到的幾個關鍵線索
```

### Preferred approach

Prefer evidence summaries over raw quotes.

Example:

```text
1. 你提到最近回訊變慢，代表互動節奏正在變化。
2. 你也提到他仍會看限動、偶爾傳生活小事，表示訊號不是完全中斷。
3. 你最卡的是「忙」和「冷掉」之間的判斷。
```

Avoid direct raw quotes by default.

### Why not raw quotes first?

Raw quote risks:

```text
privacy
PII leakage
over-retention of original text
LINE/unlocked page showing sensitive content
harder redaction
```

### Possible future raw quote rules

If raw quote is later used:

```text
- max 2–3 snippets
- each snippet max 20–40 chars
- no names/phone/address
- only on unlocked page, not LINE message
- not used in share card
- can be disabled if retention scrubbed
```

### Questions to answer

```text
1. Should evidence anchors be generated in paid result only?
2. Should free result include a weaker evidence hint?
3. Should anchors be schema fields or render-only from existing fields?
4. How does retention affect evidence display?
5. Should anchors use original input or model-produced evidence summaries?
```

Expected recommendation:

```text
Add paid evidence_summary cards as model-generated summaries, not raw quotes, in a future schema/prompt revision.
```

## Part C — Follow-up Interaction / Multi-use Product

### Problem

Relationship uncertainty is not a one-time problem.

Users may want:

```text
today: what does this reply mean?
tomorrow: he sent another message, what now?
later: should I follow up or wait?
```

A single NT$49 full analysis may feel wasteful if each new update requires a new purchase.

### Product models to compare

#### Model 1: One-time full analysis NT$49

Pros:

```text
simple
low implementation cost
easy fake-door
clear value
```

Cons:

```text
weak repeat fit
feels expensive for small updates
does not match daily uncertainty behavior
```

#### Model 2: 3-use interaction pack NT$99

Example:

```text
同一段關係可更新 3 次
```

Pros:

```text
fits real behavior
low psychological friction
easy to understand
good first monetization candidate
```

Cons:

```text
needs credit tracking
needs relation/session identity
```

#### Model 3: 7-day observation pass NT$149 / NT$199

Example:

```text
7 天曖昧觀察
每天可更新一次情境
```

Pros:

```text
strong emotional fit
supports ongoing LINE engagement
better LTV
```

Cons:

```text
requires account/LINE identity
retention/privacy implications
harder support/refund logic
```

#### Model 4: LINE follow-up mode after first analysis

Example:

```text
在 LINE 裡更新這段情境
```

Pros:

```text
owned channel
natural user behavior
can lead to packs later
```

Cons:

```text
needs LINE commands/state
must avoid storing too much private content
```

### Questions to answer

```text
1. Which model should be next after low-key production?
2. Should first paid/friend unlock include one follow-up?
3. Should follow-ups be attached to a “relationship session”?
4. Should follow-up use previous paid result + new input?
5. How long should a relationship session live?
6. How does retention work?
7. How to prevent misuse / repeated tiny prompts?
```

Expected recommendation:

```text
Near-term: keep one-time full analysis for beta, but design next product as 3-use relation pack or LINE follow-up trial.
```

## Part D — Data / Identity Implications

Planning should identify likely future entities:

```text
relationship_sessions
follow_up_requests
analysis_credits
paid_entitlements
line_user_entitlements
```

But do not implement.

Likely minimum future state:

```text
line_user_id
module_slug
relationship_session_id
entitlement_type
remaining_uses
expires_at
created_at
```

Privacy considerations:

```text
Do not store raw conversation longer than necessary.
Store summaries/evidence anchors rather than raw text where possible.
Allow session expiry.
Make retention copy match implementation.
```

## Part E — LINE UX Implications

Future LINE commands or buttons might include:

```text
更新這段情境
查看上次分析
再問一次
開始新的分析
```

Do not implement now.

Planning should decide whether this belongs before or after payment.

Possible phased path:

```text
Phase 1: After full analysis, show “之後可以更新這段情境” teaser only.
Phase 2: Free beta follow-up via LINE for operator testers.
Phase 3: 3-use pack / 7-day pass with credits.
```

## Part F — Recommended Roadmap

Create an opinionated roadmap.

Possible recommendation:

```text
Now:
- Finish production smoke / low-key monitoring.

Next planning:
- Evidence anchoring schema/prompt plan.

Next implementation:
- Add paid evidence_summary cards.

Then:
- Follow-up interaction architecture.
- Payment provider evaluation.
- 3-use pack fake-door.
```

Or if Codex believes follow-up interaction is more urgent, say so.

## Required Research Report

Create:

```text
ai-collaboration/research/2026-05-27-module-01-follow-up-interaction-evidence-anchoring-plan-v0.md
```

Required sections:

```markdown
# Module 01 Follow-up Interaction + Evidence Anchoring Plan v0

Date: 2026-05-27

## 1. Summary

## 2. Tester Feedback

## 3. Short-input Analyze Speed / Perceived Wait

## 4. Evidence Anchoring Options

## 5. Raw Quote vs Evidence Summary

## 6. Follow-up Interaction Models

## 7. Pricing / Packaging Options

## 8. LINE Follow-up Experience

## 9. Data Model Implications

## 10. Privacy / Retention Implications

## 11. MVP Phasing

## 12. What Not To Build Yet

## 13. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-27-module-01-follow-up-interaction-evidence-anchoring-plan-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Follow-up Interaction + Evidence Anchoring Plan v0 Execution Report

## Summary

## Files Created

## Files Updated

## Planning Decisions

## Recommended Product Direction

## Evidence Anchoring Recommendation

## Follow-up Interaction Recommendation

## Pricing / Packaging Recommendation

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
planning recommendation
validation result
commit hash
staging push status
```

## Validation

Docs/planning only. Run:

```bash
python3 -m compileall oradar
python3 -m compileall tools/topic-ingestion
PYTHONPATH=tools/topic-ingestion python3 -m unittest discover -s tools/topic-ingestion/tests -p 'test_*.py'
cd apps/web && corepack pnpm lint
cd apps/web && corepack pnpm test
cd apps/web && corepack pnpm build
```

No Playwright required unless code changes, which should not happen.

## Constraints

Do not implement:

```text
fast analyze path
evidence anchors
raw quote snippets
follow-up sessions
payment packs
credits
LINE commands
DB migrations
payment provider integration
ads launch
real payment
email delivery
rich menu
broadcast
portal/account system
model switch
Module 02
```

Do not modify:

```text
app code
production behavior
prompt/schema/cache/DB
LINE behavior
legal copy
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
real contact values
raw private user content
font files
screenshots/test artifacts
tokens/tokenized URLs/LINE IDs
paid_result_json dumps
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "docs: plan module follow-up interactions"
git rev-parse --short HEAD
git push origin HEAD:staging
```

Do not push if validation failed or secrets/raw/private artifacts are staged.

## Final Response

Use the required Codex Completion Summary format.

Important final response details:

```text
recommended direction
short-input wait recommendation
evidence anchoring recommendation
follow-up interaction recommendation
pricing/packaging recommendation
privacy implications
validation results
report path
commit hash
staging push status
Tech Debt / Cleanup Notes
exact next step
```

Then stop.
