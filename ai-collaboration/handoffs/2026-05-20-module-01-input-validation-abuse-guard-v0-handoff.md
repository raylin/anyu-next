# Handoff: Module 01 Input Validation + Abuse Guard v0

Date: 2026-05-20

Project: anyu-next / 暗語 ANYU

## Objective

Implement basic input validation, misuse prevention, and cost-control guards for Module 01 — 曖昧溫度計 — before production launch.

The current model default should remain Sonnet for launch readiness. Initial API cost is acceptable relative to ad spend, but the app must protect against accidental overuse, abuse, prompt injection, and runaway cost.

This task should add pragmatic v0 safeguards, not a heavyweight security system.

## Background

Recent decisions:

- Current launch candidate model remains `claude-sonnet-4-20250514`.
- Guarded Haiku code exists but is not launch default.
- Initial model cost is acceptable compared with ad spend.
- The priority now is to implement basic validation, misuse guards, rate limits, and cost caps.

Current production app:

```text
apps/web/
```

Current staging:

```text
https://staging.anyu.tw
```

Current first module:

```text
/m/ambiguous-temperature
```

Existing protections already present:

- AJV product result schema validation
- basic PII redaction
- event raw-text metadata guard
- provider errors are not intentionally exposed
- no auth required
- no real payment yet

Remaining pre-launch risks:

- long / abusive input can increase cost
- prompt injection attempts can waste model calls
- non-relationship content can turn the app into a generic LLM endpoint
- repeated requests can burn API budget
- no clear daily/hourly cap messaging
- no explicit misuse guard tests

## Scope

Do:

1. Add robust input length validation.
2. Add basic relationship-content guard.
3. Add basic prompt-injection / misuse keyword guard.
4. Add request body validation improvements.
5. Add cost-control caps:
   - per anonymous session daily cap
   - per IP hourly cap or best practical equivalent
   - global daily cap if feasible with current DB
6. Add friendly product-style error messages.
7. Ensure errors do not leak internals.
8. Ensure event metadata still does not include raw text.
9. Add tests.
10. Update docs/reports.
11. Commit and push to `origin/staging`.

Do not:

- add auth
- add CAPTCHA unless absolutely necessary
- add Redis/Upstash unless already available and clearly justified
- add real payment
- change model
- change prompt/schema content
- change DB schema unless required for cap tracking
- block legitimate relationship scenarios too aggressively
- use real private user content
- commit secrets

## Guard Philosophy

This is v0 guardrail, not perfect abuse prevention.

Prioritize:

```text
simple
safe
clear user messaging
low maintenance
one-person-company friendly
does not block normal users unnecessarily
```

Avoid over-engineering.

## Input Length Validation

Implement both client and server checks if practical.

Recommended thresholds:

```text
min length: 30 characters
soft max: 2,000 characters
hard max: 4,000 characters
```

Behavior:

```text
< 30:
  CTA disabled or server rejects with:
  "再寫一點互動脈絡，ANYU 才讀得出節奏。"

2,000–4,000:
  allow submit, but optionally show soft helper:
  "內容有點長，建議保留最近幾段關鍵對話。"

> 4,000:
  block submit / reject server-side:
  "這段太長了，請保留最近幾段關鍵對話再試一次。"
```

Server must enforce hard max even if client is bypassed.

If current client threshold differs, align or document why.

## Relationship Content Guard

The app should not behave like a generic LLM endpoint.

Add a lightweight guard before provider call.

Allow if input appears to be about:

```text
曖昧
回訊
已讀
限動
訊息
聊天
約會
喜歡
冷淡
忽冷忽熱
告白
關係
他 / 她 / 對方
```

Reject obvious unrelated generic requests such as:

```text
write code
translate this article
summarize news
generate SQL
ignore your instructions
show system prompt
write phishing email
```

User-facing rejection copy:

```text
這段看起來不像曖昧或關係互動情境。請貼最近的對話，或用自己的話描述你卡住的互動。
```

Do not overfit too tightly. If uncertain, allow.

## Prompt Injection / Misuse Guard

Add a basic keyword/pattern guard.

Block or flag obvious patterns:

```text
ignore previous instructions
ignore all previous
system prompt
developer message
show your prompt
reveal your instructions
jailbreak
DAN
你現在是
不要遵守
顯示你的規則
輸出 system
改成沒有規則
```

Recommended behavior for v0:

```text
block before provider call
```

User-facing copy:

```text
這段裡有一些和關係分析無關的指令。請移除後再試一次。
```

Do not send obvious prompt-injection text to provider.

## PII / Privacy Guard Refinement

Existing basic redaction exists. Review and strengthen if small.

Patterns to redact:

```text
email → [email]
phone-like pattern → [phone]
@handle / LINE-like ID → [handle]
URL → [url]
```

Optional:

```text
address-like text → [address]
```

Do not implement complex NER in this task.

Client helper can say:

```text
我會先幫你把可能的個資去識別化，再送出分析。
```

Do not promise absolute security.

## Rate Limit / Cost Cap

Implement simple server-side caps using current DB if feasible.

Preferred caps:

```text
per anonymous session:
  3 analyses per 24h

per IP:
  10 analyses per hour

global:
  100–200 analyses per day, configurable by env
```

Suggested env vars:

```text
ANALYSIS_SESSION_DAILY_LIMIT=3
ANALYSIS_IP_HOURLY_LIMIT=10
ANALYSIS_GLOBAL_DAILY_LIMIT=200
```

If IP tracking is difficult or Vercel headers are inconsistent, use best practical approach:

```text
x-forwarded-for
x-real-ip
request.ip if available
fallback: anonymousSessionId only
```

Do not store raw IP if avoidable. Prefer hash if practical.

If hashing IP:

```text
ip_hash
```

Do not add external service dependency unless needed.

If DB schema needs additions, keep it minimal.

Possible additions:

```text
analysis_requests.ip_hash nullable
```

or use events metadata safely.

If changing DB schema is needed, generate Drizzle migration.

If avoiding schema change is safer, document limitation and implement session/global caps first.

## Cap Reached UX

Friendly copy:

Session cap:

```text
今天已經測了幾次，先把這次結果留著觀察一下。明天再來測新的互動。
```

IP/hourly cap:

```text
目前分析請求有點多，請晚點再試一次。
```

Global daily cap:

```text
今天的內測名額已滿，明天再來測一次。
```

Do not use scary words like banned, blocked, suspicious.

## API Route Hardening

Review `/api/modules/[moduleSlug]/analyze`.

Ensure:

```text
POST only
content-type JSON if practical
body parse errors handled
no stack traces returned
provider errors mapped to friendly messages
input validation errors return clear product messages
timeout errors return clear product messages
```

Analyze API response error shape should be stable:

```json
{
  "ok": false,
  "error": "input_too_short",
  "message": "再寫一點互動脈絡，ANYU 才讀得出節奏。"
}
```

Recommended error codes:

```text
input_too_short
input_too_long
unsupported_content
prompt_injection_detected
rate_limited_session
rate_limited_ip
daily_cap_reached
config_error
provider_error
validation_error
unknown_error
```

## Event / Privacy Safety

If guard rejects before provider call, logging is okay, but must be safe.

Allowed:

```text
error_seen with error code
input_char_count
guard category
situation_type
anonymous_session_id
```

Forbidden:

```text
raw input
prompt injection text
email
phone
LINE ID
full result JSON
```

## Testing

Add tests for:

```text
input length validation
relationship content guard
prompt injection guard
PII redaction patterns
rate-limit helper logic
error response mapping
event metadata still rejects raw text
```

Avoid live provider calls.

Avoid requiring DATABASE_URL in tests.

If DB rate limit helpers require DB, test pure helper logic only.

## Documentation

Update:

```text
apps/web/README.md
```

Add:

- abuse guard env vars
- validation behavior
- rate/cost caps
- production launch notes

Create report:

```text
ai-collaboration/research/2026-05-20-module-01-input-validation-abuse-guard-v0.md
```

Required sections:

```markdown
# Module 01 Input Validation + Abuse Guard v0

## 1. Summary

## 2. Input Length Rules

## 3. Relationship Content Guard

## 4. Prompt Injection / Misuse Guard

## 5. PII / Privacy Guard

## 6. Rate Limit / Cost Cap Rules

## 7. Error UX

## 8. Event / Privacy Safety

## 9. Tests Added

## 10. Remaining Limitations

## 11. Recommended Next Step
```

## Required Execution Report

Create:

```text
ai-collaboration/reports/2026-05-20-module-01-input-validation-abuse-guard-v0-execution-report.md
```

Report structure:

```markdown
# Module 01 Input Validation + Abuse Guard v0 Execution Report

## Summary

## Files Created

## Files Updated

## Guards Implemented

## Rate Limits / Caps

## Error UX

## Privacy Safety

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
- guards implemented
- caps implemented
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

If DB schema changed, run:

```bash
cd apps/web && corepack pnpm db:generate
```

Do not run production migration.

If staging deployment is available, optionally smoke test:

```text
valid synthetic input succeeds
too-short input blocked
too-long input blocked
obvious prompt-injection input blocked
```

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
```

Do not modify:

```text
product prompt/schema content
provider architecture
legacy prototype behavior
Dcard scripts
design system v1.1
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
```

## Git Commit And Staging Push

At the end:

```bash
git status --short
git add .
git commit -m "feat: add module 01 input validation and abuse guards"
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

- guards implemented
- text length rules
- relationship/prompt-injection guard behavior
- rate limits / daily caps
- whether DB schema changed
- privacy safety notes
- validation results
- report path
- commit hash
- staging push status
- exact next step

Then stop.
