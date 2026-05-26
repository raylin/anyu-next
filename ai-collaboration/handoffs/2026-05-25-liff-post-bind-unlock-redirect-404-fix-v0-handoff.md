# LIFF Post-bind Unlock Redirect 404 Fix v0

## Task

Fix LIFF post-bind redirect so successful LIFF bind navigates to a valid module unlock route:

```text
/m/{moduleSlug}/unlock/{unlockToken}
```

## Problem

After Global LIFF Fulfillment Bridge v0, real mobile staging LIFF smoke improved:

- LIFF bind appears to pass.
- It no longer redirects to homepage.
- After LIFF flow it lands on a 404 page.
- It does not reach unlocked route.
- Paid content does not complete.
- It is not stuck on processing.
- No user-facing error appears.

## Scope

- Focus on `/line/fulfill` bridge, bind API response, redirect target construction, and unlocked route URL generation.
- Do not change paid provider generation unless logs prove it is involved.
- Do not change short-code webhook behavior unless shared redirect helper is affected.
- Do not deploy production.
- Do not change payment/email/ads.
- Do not log or commit unlock tokens, tokenized URLs, LINE user IDs, short codes, raw input, provider output, paid result JSON, or secrets.

## Expected Behavior

- Real LIFF bind success redirects to `/m/ambiguous-temperature/unlock/<token>`.
- Route returns HTTP 200.
- Processing or completed paid state renders honestly.
- No homepage redirect.
- No generic 404 after successful bind.

## Required Outputs

- Code/tests fix.
- Staging route-level smoke confirming generated bind redirect target route shape resolves.
- Manual LIFF retest instructions.
- Review bundle: `ai-collaboration/research/2026-05-25-liff-post-bind-unlock-redirect-404-fix-v0-review-bundle.md`.
- Execution report: `ai-collaboration/reports/2026-05-25-liff-post-bind-unlock-redirect-404-fix-v0-execution-report.md`.
- Update staging LINE setup record and summary log.
- Commit `fix: correct liff unlock redirect`.
- Push to `origin/staging`.
