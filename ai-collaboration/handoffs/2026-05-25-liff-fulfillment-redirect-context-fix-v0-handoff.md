# LIFF Fulfillment Redirect Context Fix v0

## Task

Fix the staging LIFF fulfillment flow so mobile LIFF keeps unlock context and returns the user to the correct fulfillment/unlocked route.

## Problem

Manual staging LIFF smoke result:

- LIFF bind appeared to pass.
- Paid content did not complete.
- It did not get stuck on processing.
- No error message appeared.
- After clicking the LINE/LIFF flow, the LIFF app switched over but landed on the homepage instead of the fulfillment/unlocked page.

## Scope

- Focus only on LIFF fulfillment URL generation, LIFF page context parsing, bind response, and redirect behavior.
- Do not change paid generation provider logic unless logs prove it is involved.
- Do not change short-code webhook behavior unless necessary.
- Do not deploy production.
- Do not change payment/email/ads.
- Do not log or commit unlock tokens, tokenized URLs, LINE user IDs, raw input, provider output, paid result JSON, or secrets.

## Investigation Checklist

1. Verify staging LIFF endpoint expected in setup docs: `https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill`.
2. Verify the live staging unlock intent / CTA returns a LIFF URL carrying enough context.
3. Verify LIFF page can parse context when opened inside LINE, including query params and `liff.state`.
4. Verify bind API response includes correct next URL / unlocked URL / paid status.
5. Verify successful LIFF bind redirects to module unlock route or a fulfillment page that routes to processing/completed unlocked state.
6. Verify missing-context fallback shows a helpful error/fallback instruction and does not silently redirect home.

## Expected Behavior

- User opens LIFF from staging result page.
- LIFF page keeps unlock context.
- LINE identity bind succeeds.
- Paid generation is requested or reused.
- User lands on unlocked route or honest processing state.
- No homepage redirect unless user explicitly navigates there.

## Required Outputs

- Code/test fix.
- Staging route-level smoke.
- Manual verification steps.
- Review bundle: `ai-collaboration/research/2026-05-25-liff-fulfillment-redirect-context-fix-v0-review-bundle.md`.
- Execution report: `ai-collaboration/reports/2026-05-25-liff-fulfillment-redirect-context-fix-v0-execution-report.md`.
- Update `ai-collaboration/research/line/line-oa-staging-setup.md`.
- Update `ai-collaboration/summaries/summary_log.md`.
- Commit `fix: preserve liff fulfillment context`.
- Push to `origin/staging`.
