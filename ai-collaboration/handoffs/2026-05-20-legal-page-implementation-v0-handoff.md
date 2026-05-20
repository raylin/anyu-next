# Handoff: Legal Page Implementation v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Implement the v0 legal/trust pages and footer links for 暗語 ANYU / Module 01 using the drafted legal content under `docs/legal/`.

This task should turn reviewed legal baseline content into accessible public app routes and update short in-product notices where appropriate.

This is a legal content implementation task.

Do not change data handling, runtime behavior, model, prompt/schema, DB schema, payment, auth, or LINE integration.

## Key Decision

Use the following public contact email for v0:

```text
hello@anyu.tw
```

Use this email consistently for:

- privacy/deletion requests
- user questions about data handling
- general support in legal pages

Do not use placeholder text for contact email in implemented pages.

## Background

Legal Baseline Content Draft v0 completed.

Draft files now exist:

```text
docs/legal/privacy-policy-v0.md
docs/legal/terms-of-service-v0.md
docs/legal/disclaimer-v0.md
docs/legal/ui-notices-v0.md
docs/legal/line-funnel-disclosure-v0.md
docs/legal/persona-insight-consent-v0.md
```

Legal draft decisions from review:

- Keep 24-hour retention wording as a goal, not a hard promise.
- LINE can be described as the likely v0 primary channel for complete analysis delivery / notification, with Email as fallback.
- Persona / Insight Graph long-term storage should be opt-in only, not enabled by default.
- Use `hello@anyu.tw` as the v0 public contact/deletion request email.

## Scope

Do:

1. Replace placeholder contact/deletion channel text with `hello@anyu.tw`.
2. Implement public legal routes in `apps/web`.
3. Add footer links to legal pages.
4. Use `docs/legal/ui-notices-v0.md` short copy in appropriate product surfaces if not already present.
5. Keep legal content aligned with actual v0 behavior.
6. Add tests if practical.
7. Commit and push to `origin/staging`.

Do not:

- change actual retention behavior
- implement scheduled deletion
- add LINE Messaging API
- add email sending
- add auth/payment/portal
- change model/runtime/prompt/schema
- make legal claims stronger than current implementation supports

## Route Structure

Implement these public routes:

```text
/privacy
/terms
/disclaimer
```

Optional route if easy:

```text
/legal
```

`/legal` can be a simple index linking to the three pages.

Preferred public footer links:

```text
隱私權政策
使用條款
免責聲明
```

## Source Content

Use these docs as source:

```text
docs/legal/privacy-policy-v0.md
docs/legal/terms-of-service-v0.md
docs/legal/disclaimer-v0.md
docs/legal/ui-notices-v0.md
docs/legal/line-funnel-disclosure-v0.md
docs/legal/persona-insight-consent-v0.md
```

Implementation can either:

1. render markdown content directly if the app supports it cleanly, or
2. copy the content into static React components/pages.

Prefer a simple maintainable approach.

If content is duplicated into React, document that future legal copy changes must sync docs and app pages.

## Legal Page Requirements

### Shared layout

Legal pages should:

- use ANYU design system tokens
- be mobile-first
- be readable
- not look like a SaaS dashboard
- include a small `暗語 ANYU` brand mark
- include last updated date or version
- link between privacy / terms / disclaimer
- include contact email `hello@anyu.tw`

### Privacy page

Route:

```text
/privacy
```

Use content from:

```text
docs/legal/privacy-policy-v0.md
```

Must include:

- what data is collected
- how pasted text is handled
- redacted input / short-term retention wording
- event logging without raw text
- LINE / Email contact handling
- third-party services
- 24-hour retention as goal, not fixed promise
- persona / insight graph opt-in only
- deletion/contact via `hello@anyu.tw`

### Terms page

Route:

```text
/terms
```

Use content from:

```text
docs/legal/terms-of-service-v0.md
```

Must include:

- service description
- user responsibility
- prohibited uses
- AI output limitations
- internal test / fake-door behavior
- service availability
- right to limit abnormal use
- contact via `hello@anyu.tw`

### Disclaimer page

Route:

```text
/disclaimer
```

Use content from:

```text
docs/legal/disclaimer-v0.md
```

Must include:

- not professional advice
- not psychological/medical/legal advice
- AI output may be incomplete/inaccurate
- not sole basis for major decisions
- crisis/safety warning
- no crisis-handling service
- contact via `hello@anyu.tw`

## UI Notices Integration

Review `docs/legal/ui-notices-v0.md`.

Apply short notices where appropriate, without making the UI heavy.

Recommended surfaces:

### Landing input helper

Should include or preserve a version of:

```text
請不要貼姓名、電話、地址或其他能識別身份的資訊。分析僅供關係觀察與自我理解參考。
```

### CTA consent note

Near submit or under input if there is space:

```text
送出後，我們會依隱私權政策處理你提供的文字；系統會盡量先做去識別化。
```

Do not overstuff first screen.

### Result disclaimer

On result page, subtle placement:

```text
這不是判決，也不是心理諮商；它只是幫你多看一眼互動裡的訊號。
```

### Contact capture note

```text
留下 LINE 或 Email 後，我們只會用於傳送完整分析、內測通知與新測驗提醒。
```

Ensure any mention of LINE automation does not claim current implementation if not present.

## Footer Links

Add footer links to:

```text
/m/ambiguous-temperature
/m/ambiguous-temperature/result/[resultId]
/m/ambiguous-temperature/result/demo
```

If the app has a shared shell, add it there.

Footer should include:

```text
隱私權政策｜使用條款｜免責聲明
```

Links:

```text
/privacy
/terms
/disclaimer
```

Keep footer visually quiet and consistent with ANYU.

## Contact Email Replacement

Search docs/legal and app legal pages for placeholders such as:

```text
[contact email]
[privacy email]
TBD
placeholder
```

Replace appropriate contact/deletion placeholders with:

```text
hello@anyu.tw
```

Do not replace unrelated placeholders if any are intentionally not ready.

## Tests

Add/update tests if practical for:

- legal routes render
- footer contains links
- legal content includes `hello@anyu.tw`
- privacy/terms/disclaimer routes exist

Do not add heavy markdown tooling if unnecessary.

## Documentation

Update:

```text
apps/web/README.md
```

Add:

- legal routes now exist
- source docs live under `docs/legal/`
- public contact email is `hello@anyu.tw`
- future legal copy changes must sync docs and app pages if duplicated

Create review bundle:

```text
ai-collaboration/research/2026-05-20-legal-page-implementation-v0-review-bundle.md
```

Required sections:

```markdown
# Legal Page Implementation v0 Review Bundle

## 1. Summary

## 2. Routes Implemented

## 3. Source Legal Docs Used

## 4. Contact Email

## 5. Footer Links

## 6. UI Notices Applied

## 7. Content Sync Notes

## 8. Validation Results

## 9. Remaining Legal / Trust Follow-ups

## 10. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-legal-page-implementation-v0-execution-report.md
```

Report structure:

```markdown
# Legal Page Implementation v0 Execution Report

## Summary

## Files Created

## Files Updated

## Routes Implemented

## Contact Email Applied

## Footer Links

## UI Notices

## Validation Results

## Known Limitations

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
- legal routes implemented
- contact email used
- footer links added
- validation result
- commit hash
- staging push status

## Validation

Always run:

```bash
python3 -m compileall oradar
cd apps/web && corepack pnpm lint && corepack pnpm test && corepack pnpm build
```

If possible, smoke check:

```text
/privacy
/terms
/disclaimer
/m/ambiguous-temperature footer links
```

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
git commit -m "feat: add legal baseline pages"
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

- routes implemented
- contact email applied
- footer links added
- UI notices applied
- validation results
- report path
- commit hash
- staging push status
- exact next step

Then stop.
