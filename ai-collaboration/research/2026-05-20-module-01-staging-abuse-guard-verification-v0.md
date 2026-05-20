# Module 01 Staging Abuse Guard Verification v0

## 1. Summary

Staging abuse-guard verification passed for the intended v0 scope. Normal synthetic analyze still works, short and overly long inputs are rejected with friendly copy, obvious prompt-injection text is rejected, clearly unrelated generic LLM use is rejected, and a relationship-like borderline case is still allowed.

No code fix was required in this pass.

## 2. Deployment Freshness

- `git rev-parse --short HEAD` at verification time: `803fbdc`
- `vercel inspect https://staging.anyu.tw` resolved to deployment `https://anyu-next-2bnolyn53-studioanyu-1488s-projects.vercel.app`
- deployment status: `Ready`
- alias `staging.anyu.tw` pointed to that deployment during this pass

## 3. Method

- used authenticated protected-preview requests via `corepack pnpm dlx vercel curl`
- used only synthetic relationship and non-relationship inputs
- verified:
  - landing route
  - demo route
  - live analyze success case
  - runtime result route
  - short input reject
  - true `>4000` input reject
  - prompt-injection reject
  - unrelated-content reject
  - borderline relationship-like allow
- reviewed preview env-name presence without printing values
- used code path order plus live response shape to infer blocked cases returned before provider/result creation

## 4. Test Cases

### Case A: Valid normal input

- expected: success
- actual: success
- HTTP/API result: `200`
- user-facing message: runtime result route returned
- provider call inferable: yes
- DB row created if relevant: inferable yes from real `resultId` plus runtime result route load
- event/privacy-safe: no raw input echoed in API response or result route
- pass/fail: pass

### Case B: Too short input

- input: `他不回我`
- expected: blocked before provider call
- actual: blocked
- HTTP/API result: `400`
- user-facing message: `再寫一點互動脈絡，ANYU 才讀得出節奏。`
- provider call inferable: no
- DB row created if relevant: not directly inspected on staging DB; no `resultId` returned
- event/privacy-safe: response contained no raw text echo
- pass/fail: pass

### Case C0: Soft-long input sanity check

- input length: `2870`
- expected: allowed because soft max is advisory only
- actual: allowed
- HTTP/API result: `200`
- notes: confirms `2000–4000` path remains allowed
- pass/fail: pass

### Case C: Too long input

- input length: `4510`
- expected: blocked before provider call
- actual: blocked
- HTTP/API result: `400`
- user-facing message: `這段太長了，請保留最近幾段關鍵對話再試一次。`
- provider call inferable: no
- DB row created if relevant: not directly inspected on staging DB; no `resultId` returned
- event/privacy-safe: response contained no raw text echo
- pass/fail: pass

### Case D: Prompt injection / system prompt request

- expected: blocked before provider call
- actual: blocked
- HTTP/API result: `422`
- user-facing message: `這段裡有一些和關係分析無關的指令。請移除後再試一次。`
- provider call inferable: no
- DB row created if relevant: not directly inspected on staging DB; no `resultId` returned
- event/privacy-safe: response contained no raw prompt text echo
- pass/fail: pass

### Case E: Unrelated generic request

- expected: blocked before provider call
- actual: blocked
- HTTP/API result: `422`
- user-facing message: `這段看起來不像曖昧或關係互動情境。請貼最近的對話，或用自己的話描述你卡住的互動。`
- provider call inferable: no
- DB row created if relevant: not directly inspected on staging DB; no `resultId` returned
- event/privacy-safe: response contained no raw input echo
- pass/fail: pass

### Case F: Borderline relationship-like unrelated text

- expected: likely allowed
- actual: allowed
- HTTP/API result: `200`
- user-facing message: runtime result route returned
- provider call inferable: yes
- DB row created if relevant: inferable yes from real `resultId`
- event/privacy-safe: no raw input echoed in API response or result route
- pass/fail: pass

## 5. Valid Flow Result

- normal valid synthetic input succeeded
- API returned a real `resultId`
- runtime result route `/m/ambiguous-temperature/result/[resultId]` loaded successfully
- demo route `/m/ambiguous-temperature/result/demo` also still loaded

## 6. Length Guard Results

- `<30` characters rejects as intended
- `2000–4000` characters remain allowed
- `>4000` characters rejects as intended
- user-facing copy is consistent with ANYU tone and non-technical

## 7. Prompt Injection / Misuse Guard Results

- the obvious mixed-language prompt-injection payload was rejected with `422`
- copy stayed calm and product-like
- response did not expose any prompt, rule, stack, provider, or schema detail

## 8. Unrelated Content Guard Results

- longer generic coding request was rejected with `422`
- longer relationship-like text was allowed
- current strictness level is acceptable for v0

## 9. Rate Limit / Cap Verification

- preview env pull did not expose actual secret values in this shell context, but cap env names were also absent from the pulled preview file
- current effective assumption on staging is default config from code:
  - session daily cap `3`
  - IP hourly cap `10`
  - global daily cap `200`
- session cap verified by code/test only; not exhausted on staging
- IP cap verified by code/test only; process-local limitation remains
- global cap verified by code/test only; not exhausted on staging

## 10. Event / Privacy Verification

- live API responses for blocked cases did not echo raw input or prompt-injection content back to the user
- live success case exposed only `resultId` and redirect path
- local tests still pass for forbidden event metadata keys
- direct staging DB/event row inspection was limited in this shell because pulled preview env values were blank placeholders here
- based on route order, blocked cases return before `createAnalysisRequestRecord()` and before provider execution
- no evidence of raw input, contact values, full result JSON, or provider raw response leaking through live staging response surfaces

## 11. Error UX Review

Current copy is:

- friendly
- non-technical
- not accusatory
- consistent enough with ANYU tone for v0

Words like `blocked`, `suspicious`, `attack`, or `abuse` do not appear in user-facing errors.

## 12. Issues Found

- no functional guard bug found
- no copy bug found
- no staging freshness issue found
- direct staging DB row inspection was not available from this shell because pulled preview secrets resolved to blank values

## 13. Fixes Applied

- none

## 14. Remaining Limitations

- IP limiter remains process-local across serverless instances
- staging DB/event privacy verification was partially inferential in this environment
- session/global cap behavior was not stress-tested live to avoid unnecessary provider cost and DB pollution

## 15. Recommendation

Current guard strictness is acceptable for v0 launch readiness:

- not too strict for relationship-like usage
- not too loose for obvious generic misuse
- error copy is clear and product-safe

## 16. Recommended Next Step

`Module 01 Staging Contact + Unlock Post-Guard Regression Check v0`
