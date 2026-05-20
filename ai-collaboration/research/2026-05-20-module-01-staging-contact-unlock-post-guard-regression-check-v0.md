# Module 01 Staging Contact + Unlock Post-Guard Regression Check v0

## 1. Summary

The post-guard unlock/contact funnel still works on live staging. A valid synthetic analyze request succeeded, the runtime result page loaded, unlock intent succeeded, synthetic email and LINE submissions both succeeded, and the consent-required validation still returns a friendly non-technical error.

No code fix was required.

## 2. Deployment Freshness

- local branch head at verification start: `64da719`
- `vercel inspect https://staging.anyu.tw` resolved to deployment `https://anyu-next-6n20s5qou-studioanyu-1488s-projects.vercel.app`
- deployment status: `Ready`
- alias `staging.anyu.tw` pointed to that deployment during this pass

## 3. Method

- copied the handoff into `ai-collaboration/handoffs/`
- used authenticated protected-preview requests via `corepack pnpm dlx vercel curl`
- used only synthetic content:
  - analyze text about slower replies + story viewing
  - email `anyu-test@example.com`
  - LINE ID `@anyu_test`
- inspected `ContactCapture.tsx`, `AiTemperatureResult.tsx`, `unlock-intent` API route, `contact` API route, and contact validation logic to interpret success/fallback UX without claiming a full interactive browser session

## 4. Valid Analyze Flow Result

- landing/demo route path still responded successfully
- valid synthetic analyze request returned:
  - `ok: true`
  - a real `resultId`
  - a real runtime redirect path
- runtime result route loaded successfully with:
  - temperature card
  - observed signals
  - insight card
  - share preview
  - paid preview

Pass/fail: pass

## 5. Paid Unlock Flow Result

- unlock intent POST succeeded on staging
- response:
  - `ok: true`
  - real `unlockIntentId`
- no technical error copy was exposed
- fallback path was not exercised in this pass because the happy path succeeded
- source inspection confirms:
  - if unlock intent fails, contact capture still opens
  - fallback note remains `內測記錄暫時無法建立，但你仍可留下聯絡方式。`

Pass/fail: pass

## 6. Contact Capture Result

### Email submission

- synthetic email submit succeeded
- response:
  - `ok: true`
  - message `已收到你的聯絡方式，我們會把完整分析送給你。`

### LINE submission

- synthetic LINE ID submit also succeeded
- response:
  - `ok: true`
  - same friendly success message

### Consent / required-fields behavior

- synthetic email submit with `consent: false` correctly rejected
- response:
  - `ok: false`
  - `error: invalid_contact`
  - message `需要勾選同意後才能送出。`

### Success state clarity

- source inspection confirms successful submit collapses the form and switches the card to:
  - title `收到，完整分析會補送給你。`
  - calmer follow-up copy explaining this run will not really charge
- repeated-submit UX was not interactively exercised in a real browser, but source behavior is coherent because the form is hidden after `isSubmitted=true`

Pass/fail: pass

## 7. Event / Privacy Verification

- live route/API responses did not expose:
  - stack traces
  - SQL/provider errors
  - raw relationship input
  - contact values
  - full result JSON
  - provider raw output
- source inspection confirms:
  - unlock event metadata only includes `resultId` and `unlockIntentId`
  - contact event metadata only includes `resultId`, `unlockIntentId`, `contactSubmissionId`, and channel
- optional DB verification against local `.env.local` did not find the staging `resultId` or `unlockIntentId`, which indicates the local Neon env is not the same branch/database as this staging run
- because of that mismatch, direct DB verification for the live staging IDs remains unavailable from this shell

Privacy result: acceptable for v0, but DB-backed confirmation of the exact staging rows is still pending a branch-aligned DB access path.

## 8. Error UX Review

Observed error/success copy remained:

- friendly
- non-technical
- not scary
- consistent with ANYU tone

No technical strings leaked during analyze, unlock, or contact steps.

## 9. Issues Found

- no unlock intent regression found
- no contact API regression found
- no consent validation regression found
- no fallback regression found in source
- direct DB confirmation for the exact staging IDs is still blocked by environment mismatch between local Neon config and the live staging deployment

## 10. Fixes Applied

- none

## 11. Remaining Limitations

- this was not a true interactive browser/devtools session, so the visual contact success collapse was verified by source plus API behavior rather than by clicking through in a human browser
- staging DB row verification for the exact IDs is still unavailable from this shell because local DB credentials do not point at the same branch as the live staging deployment
- unlock fallback was not exercised live because the happy path succeeded

## 12. Recommendation

The fake-door funnel remains healthy after the abuse-guard pass. There is no evidence that the new guards broke the paid unlock or contact capture path.

## 13. Recommended Next Step

`Module 01 Staging Human Browser Funnel Pass v0`
