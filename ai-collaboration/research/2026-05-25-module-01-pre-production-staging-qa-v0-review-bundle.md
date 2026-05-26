# Module 01 Pre-production Staging QA v0 Review Bundle

Date: 2026-05-25

Executed: 2026-05-27

## 1. Summary

Ran a staging-safe pre-production QA pass for Module 01 using route-level and API-level checks against `https://staging.anyu.tw`. No P0 or P1 issues were found in the automated staging checks. Real mobile LIFF and real staging/test OA short-code flows were not re-run in this task; this pass relies on the previously recorded real-device smoke passes for those manual-only surfaces.

Production readiness recommendation: conditional Go for production activation decision, assuming the human accepts the prior real mobile LIFF and short-code smoke passes as still valid after the latest non-LINE UI changes.

## 2. Staging Freshness

- Staging URL: `https://staging.anyu.tw`
- Health route: passed, HTTP 200.
- Landing route: passed, HTTP 200.
- Freshness method: route behavior and deployed client chunk scan.
- Latest-feature indicators observed:
  - landing contains the `0 / 80` input threshold behavior.
  - deployed client JS contains the `正在打開結果⋯` / `navigating` transition copy from commit `9fc743a`.
- Candidate commit: exact deployed commit is not exposed by the app runtime.

## 3. Theme A Funnel QA

Theme A / classic route-level checks passed.

- Unlock intent created with safe classic theme hint.
- Generated LIFF URL used `https://liff.line.me/:liffId` with query context only.
- No path was appended after the LIFF ID.
- Global LIFF bridge route returned HTTP 200 and rendered the classic theme shell.
- Unlocked route returned HTTP 200.
- Theme switch was hidden downstream.
- Paid content route rendered.

## 4. Theme B Funnel QA

Theme B / riso route-level checks passed.

- Unlock intent created with safe riso theme hint.
- Generated LIFF URL used `https://liff.line.me/:liffId` with query context only.
- No path was appended after the LIFF ID.
- Global LIFF bridge route returned HTTP 200 and rendered the riso theme shell.
- Unlocked route returned HTTP 200.
- Theme switch was hidden downstream.
- Paid content route rendered.

## 5. Input Quality QA

Passed.

- Short input below threshold returned HTTP 400 with `input_too_short`.
- Landing page exposed the 80-character threshold behavior.
- Valid longer input was accepted and analyzed successfully.
- Placeholder/input-quality behavior is covered by existing unit tests and deployed landing behavior.

## 6. Analyze Transition QA

Passed by deployed asset verification and source validation.

- Deployed staging client chunk contains `正在打開結果⋯` and `navigating`.
- The source fix keeps the CTA in `navigating` state after successful analyze and before navigation.
- Full real browser timing could not be revalidated locally because Playwright remains blocked by the Chromium/MachPort permission issue.

## 7. Free Result QA

Passed.

- Fresh staging analyze returned HTTP 200.
- Analyze completed in about 20.5 seconds.
- Runtime result route returned HTTP 200.
- Result page contained free-result structure, share surface, and paid preview.

## 8. Pending Paid UX QA

Passed.

- Created a staging unlock intent without triggering paid generation.
- Unlocked route returned HTTP 200.
- Pending page showed `正在整理你的完整分析`.
- Progress/waiting hint was present.
- Theme switch was hidden on the pending downstream surface.

## 9. LIFF Fulfillment QA

Route-level LIFF checks passed; real mobile LIFF was not re-run in this task.

- Global bridge `/line/fulfill` returned HTTP 200 with valid context.
- Bridge applied classic and riso theme hints.
- Missing-context bridge returned a safe fallback rather than exposing sensitive data.
- Generated LIFF URL shape remained `https://liff.line.me/:liffId?<context>`.
- No tokenized URL or token value was recorded.

Prior manual smoke status:

- Real mobile staging LIFF flow was previously recorded as passed after the LIFF URL path duplication fix.

## 10. Short-code Fulfillment QA

Not re-run manually in this task.

Route-level unlock intent checks confirmed:

- Fulfillment code was generated.
- LINE add origin resolved to `https://lin.ee`.
- Unlock route worked after fulfillment context creation.

Prior manual smoke status:

- Real staging/test OA short-code flow was previously recorded as passed.

## 11. Paid Content Quality QA

Passed with caveat.

- Paid generation request returned completed status.
- Paid status endpoint returned completed status.
- Unlocked paid route rendered paid content.
- No `high` / `medium` / `low` likelihood labels were detected in the route-level HTML scan.
- Source rendering uses `formatPaidLikelihoodLabel`, which maps likelihood labels to `高` / `中` / `低`.
- A route-level raw HTML scan can include non-visible app source/chunk strings, so full human visual review remains the best check for nuanced wording.

## 12. Share / Visual QA

Passed at route/source level; latest user visual QA said visuals look normal.

- Demo result route returned HTTP 200.
- Share card and paid preview were present.
- Visible demo-route scan did not show visible experiment/debug wording such as `MANUAL`, `A/B`, `柔和`, `鮮明`, or `視覺`.
- Theme B visual fidelity was not screenshot-validated in this CLI pass because local Playwright remains blocked.

## 13. Event / Privacy QA

Passed.

- Sanitized QA output recorded only pass/fail, route shapes, theme labels, status categories, and timing aggregates.
- Reports do not include raw input, full result JSON, provider output, paid result JSON, LINE user IDs, ID tokens, fulfillment codes, unlock tokens, tokenized URLs, email, database URLs, provider keys, or LINE secrets.
- Staging route HTML scans did not surface forbidden secret markers.

## 14. Issues Found

- P0: none found.
- P1: none found.
- P2: real mobile LIFF and real staging/test OA short-code flows were not re-run during this task; this pass relies on prior manual smoke records for those surfaces.
- P2: exact deployed commit is not exposed by the runtime, so freshness relies on deployed behavior/client chunk checks.

## 15. Production Readiness Recommendation

Conditional Go.

No production-blocking issues were found in the automated staging checks. Production activation can proceed if the human accepts:

- prior real mobile LIFF smoke pass remains valid,
- prior real staging/test OA short-code smoke pass remains valid,
- latest visual review status remains `Visuals look normal`.

Do not deploy production from this QA task itself.

## 16. Recommended Next Step

Create a production activation decision record, then proceed with the separate production activation workflow only if the human explicitly approves production deployment.
