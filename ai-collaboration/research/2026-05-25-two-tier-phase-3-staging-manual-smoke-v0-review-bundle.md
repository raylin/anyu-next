# Two-tier Phase 3 Staging Manual Smoke v0 Review Bundle

Date: 2026-05-25

## 1. Summary

This task verified staging deployment freshness and reran the shell-safe synthetic staging flow after Phase 3 LINE bind trigger delivery.

Manual real LINE LIFF bind and test-OA short-code smoke could not be completed from shell because they require a LINE client/operator action. They remain pending and should not be represented as passed.

Production was not touched.

## 2. Staging Deployment Freshness

Staging alias `https://staging.anyu.tw` resolved to a ready Vercel preview deployment created after the Phase 3 staging push.

Sanitized deployment status:

- environment: staging / preview
- status: ready
- alias: `staging.anyu.tw`
- freshness: `ee3564c` or newer deployment available on staging

## 3. LIFF Bind Manual Smoke

Status: not completed from shell.

Reason:

- Requires real LINE LIFF session and ID token from a LINE client.
- Shell cannot safely manufacture a valid LINE ID token.

Recorded result:

- LIFF bind smoke: pending manual operator verification
- paid generation completed: not verified through real LIFF
- provider source: unknown for real LIFF path
- unlocked paid content visible: not verified through real LIFF
- processing/failure state seen: not verified through real LIFF

## 4. Short-code Test OA Manual Smoke

Status: not completed from shell.

Reason:

- Requires a real staging/test LINE OA conversation and operator sending the displayed short code.
- The task rules prohibit recording the actual code, tokenized URL, LINE user ID, or raw LINE message text.

Recorded result:

- short-code smoke: pending manual operator verification
- bot reply received: not verified manually in this task
- reply type: unknown
- link opened: not verified manually in this task
- paid content completed: not verified manually in this task
- processing stuck: unknown
- provider source: unknown for real short-code path

## 5. Paid Generation Completion

Shell-safe staging synthetic flow passed:

- fresh analyze: HTTP 200
- unlock intent: HTTP 200
- deferred paid request: HTTP 200 completed
- duplicate paid request: reused completed paid row
- unlocked route: completed paid-content marker present

This verifies the paid-generation service and unlocked route remain healthy on staging, but it is not a substitute for real LIFF/test-OA manual smoke.

## 6. Provider / Fallback Source

Safe DB/event verification for the shell-safe staging synthetic flow:

- paid row status: completed
- provider source: provider
- model category: provider model
- fallback used: no
- retention set: yes

No paid result JSON was selected or recorded.

## 7. Event / Privacy Check

Reports and docs record only sanitized statuses and aggregate route outcomes.

Not recorded:

- raw input
- fulfillment code
- unlock token
- tokenized URL
- LINE user ID
- LINE display name
- LINE message text
- paid result JSON
- provider output
- email
- secrets

## 8. Next-after Risk Decision

Decision for production gate: do not accept Next `after` as production-ready until real staging LIFF and short-code smoke both pass.

Current recommendation:

- Keep Next `after` as staging / low-volume beta MVP only.
- Do not proceed to production activation from this task.
- Run manual test-OA smoke next.

If both manual flows pass, it is reasonable to accept Next `after` for low-key beta. If either flow gets stuck processing, add durable background delivery or polling before production.

## 9. Known Limitations

- No real LINE client LIFF bind was performed.
- No real test-OA short-code message was sent.
- Webhook post-response generation still uses Next `after`, not a durable queue.

## 10. Recommended Next Step

Have the operator run the real staging LIFF bind and test-OA short-code smoke, then record sanitized pass/fail results in a follow-up report.
