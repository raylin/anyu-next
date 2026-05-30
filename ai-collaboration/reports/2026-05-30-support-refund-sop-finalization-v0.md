# Support / Refund SOP Finalization v0

Date: 2026-05-30

## Summary

This SOP defines how the owner/operator should handle support and refund requests for ANYU Module 01 before and during a future production payment launch.

This is a documentation-only task. No runtime behavior, env values, production flags, deployments, checkout/notify/queue behavior, LINE behavior, Module 01 prompt/result behavior, or public copy were changed.

## 1. Public Policy Alignment

Reviewed source:

- `apps/web/src/content/legal.ts`
- Public route backed by source: `/refund`
- Public route backed by source: `/legal`

Current public refund eligible cases:

- Duplicate payment for the same service.
- Payment succeeded but the complete report was not generated.
- Payment succeeded but the paid result link cannot open due to a system issue.
- Clear payment, system, or delivery abnormality.

Current public non-eligible direction:

- The complete report is a paid/generated digital AI content product.
- If the system successfully generated the complete report and made it available, refunds generally are not provided solely because of subjective preference, interpretation feeling, or different personal judgment.

Current support channel:

- `hello@anyu.tw`

Current handling-time wording:

- Public `/refund` says processing time depends on payment provider, system checks, and case details.
- It does not commit to a fixed number of business days.
- It says a clearer processing-day window can be added before formal launch if needed.

Alignment with launch gate plan:

- Public policy and launch gate plan are aligned on duplicate payment, paid-but-no-result, inaccessible paid result, and subjective-preference limits.
- Owner still needs to confirm whether to publish a specific handling window such as 3-7 business days. This SOP recommends a follow-up copy task only if owner wants that public commitment.

No public copy change is required for launch-readiness planning, but a follow-up is recommended before broad launch if owner wants clearer response/refund timing.

## 2. Support Inbox SOP

Inbox:

- `hello@anyu.tw`

Recommended subject tags:

- `[ANYU付款問題]`
- `[ANYU退款申請]`
- `[ANYU結果無法開啟]`
- `[ANYU結果處理中]`
- `[ANYU其他協助]`

Recommended triage labels for owner inbox:

- `payment-duplicate`
- `paid-no-result`
- `stuck-processing`
- `access-link-failed`
- `generation-failed`
- `refund-after-delivery`
- `abuse-or-suspicious`
- `privacy-delete-request`

What the user may provide:

- Payment time.
- Contact email used, if any.
- Provider order number or payment reference if visible.
- Short description of the result/access issue.
- Screenshot of provider confirmation or error page if safe and redacted.

What the user should not provide:

- Full card number.
- Passwords.
- API keys or provider credentials.
- Raw paid access tokens.
- Tokenized URLs.
- Original intimate conversation text unless absolutely necessary; prefer not collecting raw conversation content for support.
- Government ID, address, phone number, or other unnecessary personal identifiers.

Expected response time:

- Recommended internal target: acknowledge within 1 business day during launch week.
- Recommended resolution target: resolve or provide next update within 3-7 business days when provider/refund checks are involved.
- Public site currently does not guarantee this window; owner should confirm before publishing it.

Privacy caution:

- Keep replies focused on payment/delivery status.
- Do not disclose internal system details beyond what is necessary.
- Do not paste raw logs or internal IDs unless safe and necessary.
- Avoid asking users to resend private relationship content.

## 3. Case Handling Playbooks

### A. Duplicate Payment

Internal steps:

1. Search `payment_intents` by provider order reference, contact email if available, payment time window, and module.
2. Check whether multiple paid intents map to the same source result/session or materially same purchase.
3. Check `entitlements` to verify only one active paid access is needed.
4. Check NewebPay merchant backend for duplicate captured payments.
5. If duplicate is confirmed, refund the extra payment manually through provider process when available.

Decision:

- Refund likely yes if duplicate charge is confirmed.

Template:

```text
您好，我們已收到您的重複付款協助申請，正在核對付款紀錄。
若確認為同一份完整報告的重複付款，我們會協助處理多餘款項的退款，並保留一份有效的完整報告存取。
處理完成後會再回覆您。謝謝。
```

### B. Paid But No Result

Internal steps:

1. Check `payment_intents`: payment is paid/confirmed.
2. Check `entitlements`: active entitlement exists.
3. Check paid access token hash/session handoff state if relevant.
4. Check `generation_jobs`: queued, processing, completed, retryable failure, or final failure.
5. Check Vercel Queues dashboard for backlog/retry issues.
6. Run manual fallback if job is queued/retryable and the processor is allowed.
7. Poll paid status and access page.
8. If still unresolved due to system failure, refund/support decision.

Decision:

- Refund likely yes if paid report cannot be generated or accessed due to system issue.
- First action should be recovery/manual processor if safe.

Template:

```text
您好，我們已收到您的付款成功但完整報告尚未出現的回報。
我們會先確認付款狀態與系統產生狀態，並嘗試協助補發或恢復存取。
若確認是系統問題且無法完成交付，會協助您處理退款。謝謝您的等待。
```

### C. Result Stuck Processing

Internal steps:

1. Check `generation_jobs` status and timestamps.
2. Check Vercel Queues dashboard for backlog/retries.
3. Check Vercel logs for processor errors.
4. Run manual processor fallback once if job is queued/retryable.
5. Recheck paid status endpoint and access page.
6. Stop repeated retries if the job has non-retryable failure or repeated model/provider failures.

Decision:

- Refund maybe; recovery first if expected to complete.
- Refund likely yes if system cannot complete within the owner-defined support window.

Template:

```text
您好，您的完整報告目前看起來仍在處理中。
我們會協助檢查系統狀態，必要時手動重新觸發處理流程。
若處理完成，我們會回覆您；若確認無法完成交付，會協助後續退款或補償處理。
```

### D. Payment Succeeded But ReturnURL / Access Page Failed

Internal steps:

1. Check whether `payment_intents` shows verified paid status.
2. Check `pcs_` checkout session handoff only through server-side status, not user-provided raw tokens.
3. Check payment status endpoint behavior.
4. Check whether entitlement and generation job exist.
5. If paid and delivery artifacts exist, help user recover through safe session/access path.
6. Do not email raw `pa_` token unless a future safe policy explicitly allows it.

Decision:

- Refund maybe; restore access first if payment/delivery is valid.

Template:

```text
您好，我們已收到付款後頁面無法開啟的回報。
付款完成頁本身不會作為付款成功的唯一依據，我們會以金流通知與系統紀錄協助確認。
若付款已確認，我們會優先協助恢復完整報告存取；若確認無法交付，會再協助退款處理。
```

### E. Generation Failed

Internal steps:

1. Check `generation_jobs` error category/status.
2. Confirm whether retry is allowed and not abusive/cost-dangerous.
3. Run manual recovery once if retryable.
4. If repeated failure or non-retryable failure persists, refund/support decision.
5. Record only safe categories in support notes.

Decision:

- Refund likely yes if the system cannot produce the paid report.

Template:

```text
您好，我們檢查到完整報告產生時遇到系統問題。
我們會先嘗試安全地重新處理一次；如果仍無法完成交付，會協助您辦理退款。
造成不便很抱歉，處理結果會再回覆您。
```

### F. User Requests Refund After Delivered Report

Internal steps:

1. Verify report was generated and made available.
2. Check whether user reports an actual access/system issue.
3. If no system issue exists and request is subjective dissatisfaction, follow public policy.
4. Escalate edge cases to owner judgment.

Decision:

- Refund likely no for subjective preference after delivered digital content.
- Refund maybe if system fault, incomplete delivery, or abnormal payment evidence exists.

Template:

```text
您好，感謝您的來信。
曖昧溫度計完整分析屬於付款後產生並交付的數位內容；若完整報告已成功產生並可查看，通常不因主觀喜好或解讀感受不同提供退款。
如果您遇到的是頁面無法開啟、內容未完整產生或付款狀態異常，請回覆補充狀況，我們會再協助檢查。
```

### G. Suspicious Or Abusive Request

Signals:

- User asks for another person's access.
- User requests internal records unrelated to their own payment.
- User asks for raw tokens, URLs, or system internals.
- Repeated inconsistent payment references.
- Threatening, harassing, or abusive messages.

Internal steps:

1. Do not disclose internal state excessively.
2. Ask for minimal safe proof of payment only.
3. Do not provide raw paid access tokens or tokenized URLs.
4. Escalate to owner decision.
5. If abuse continues, stop engaging beyond a final concise response.

Template:

```text
您好，為了保護付款與使用者資料安全，我們只能依必要的付款資訊協助查詢與處理。
請提供付款時間、可見的訂單或付款參考資訊，以及遇到的問題摘要即可；不需要提供卡號、密碼或原始對話內容。
若資訊不足或與紀錄不符，我們可能無法進一步處理。
```

## 4. Internal Operator Checklist

| Area | What To Check | Notes |
|---|---|---|
| `payment_intents` | provider, status, amount, module, source/result reference, paid/refund timestamps | Do not expose raw internal records to user. |
| `entitlements` | active/refunded/revoked state and related payment | Confirm access entitlement exists. |
| `generation_jobs` | status, retryability, trigger source, completion/failure state | Use for stuck/failed processing. |
| Paid status endpoint | pending/processing/completed/error state | Use sanitized status only. |
| Vercel logs | route errors, processor errors, callback errors | Avoid raw payload capture. |
| Vercel Queues dashboard | backlog, retries, receive/delete counts | Record aggregate status only. |
| NewebPay merchant backend | payment capture/refund/order status | Do not export private screenshots into repo. |
| Support inbox | user-provided safe details and response history | Avoid collecting raw intimate text. |

## 5. Manual Recovery SOP

Manual processor fallback is allowed when:

- Payment is verified paid.
- Delivery artifacts exist or can be safely reused.
- `generation_jobs` status is queued, processing too long, or retryable.
- Queue provider is delayed, unavailable, or disabled for a controlled test.

Required secret/env name:

- `INTERNAL_JOB_SECRET`

Route reference:

- `POST /api/internal/jobs/process`

Expected auth shape:

- `Authorization: Bearer <INTERNAL_JOB_SECRET>`

Safe request shape:

```json
{
  "jobType": "paid_analysis",
  "limit": 1
}
```

Safe output to record:

- HTTP status.
- `processed`.
- `completed`.
- `retryScheduled`.
- `failedFinal` or safe failure category if present.
- Whether paid status became completed.

Stop and refund/escalate instead of repeated retrying when:

- Job has final/non-retryable failure.
- Manual processor repeatedly returns no progress for the same paid case.
- Model/API provider appears unavailable or cost-risky.
- User has waited beyond owner-confirmed support window and no recovery path exists.

## 6. Refund Decision Matrix

| Scenario | Refund Likely? | First Action | Internal Checks | User Response |
|---|---|---|---|---|
| Duplicate payment | Yes if confirmed | Verify duplicate charge | `payment_intents`, NewebPay backend, entitlement mapping | Acknowledge and refund duplicate. |
| Paid but no generated report | Yes if unrecoverable | Try recovery/manual processor | payment intent, entitlement, generation job, queue | Explain recovery attempt; refund if unresolved. |
| Paid result inaccessible due system issue | Yes if access cannot be restored | Restore access/session path | payment status, entitlement, paid access resolver, logs | Prioritize access restore; refund if impossible. |
| Payment pending but not confirmed | No until confirmed | Wait/check provider status | NewebPay backend, payment intent status | Explain pending confirmation; no paid delivery yet. |
| User dislikes delivered result | Usually no | Check for actual system fault | completion/access status | Politely explain digital content policy. |
| Provider payment mismatch | Maybe/Yes depending cause | Pause and investigate | merchant/order/amount/signature mismatch | Say investigating payment abnormality. |
| Suspected fraud/abuse | Maybe/no | Request minimal safe proof | provider/backend status, support history | Avoid internal disclosure; escalate owner decision. |

## 7. Customer Email Templates

### Received Request / Investigating

```text
您好，我們已收到您的來信，會協助確認付款與完整報告狀態。
請提供付款時間、可見的訂單或付款參考資訊，以及遇到的問題摘要即可。
請不要提供完整卡號、密碼、原始對話內容或其他不必要的個人資料。
```

### Duplicate Payment Refund Accepted

```text
您好，我們已確認這筆情況屬於同一份服務的重複付款。
我們會協助處理多餘款項的退款，並保留一份有效的完整報告存取。
退款實際入帳時間可能依金流與銀行作業而有所不同。
```

### Paid Result Stuck, Retrying

```text
您好，您的付款已在協助確認中，完整報告目前可能仍在系統處理階段。
我們會嘗試重新觸發處理流程，完成後會再回覆您。
若確認無法完成交付，會協助您辦理退款。
```

### Result Regenerated / Access Restored

```text
您好，我們已協助恢復完整報告的存取狀態。
請回到原本的結果頁或付款完成頁重新整理查看。
若仍無法開啟，請回覆目前看到的錯誤畫面摘要即可，不需要提供原始對話內容。
```

### Refund Approved

```text
您好，我們已確認此案例符合退款協助條件，會依金流流程協助退款。
實際入帳時間可能依金流服務與銀行作業而有所不同。
完成或有進一步狀態時，我們會再通知您。
```

### Refund Not Eligible After Delivered Digital Content

```text
您好，感謝您的來信。
曖昧溫度計完整分析屬於付款後產生並交付的數位內容；若完整報告已成功產生並可查看，通常不因主觀喜好或解讀感受不同提供退款。
如果您遇到的是頁面無法開啟、內容未完整產生或付款狀態異常，請回覆補充狀況，我們會再協助檢查。
```

### Need More Information

```text
您好，為了協助查詢，請回覆以下資訊即可：
1. 付款大約時間
2. 可見的訂單或付款參考資訊
3. 遇到的問題摘要

請不要提供完整卡號、密碼、原始對話內容、身分證件或其他不必要的個人資料。
```

## 8. Stop-Loss Support Rules

Pause payment runtime and investigate if any condition occurs:

- 2 or more paid-but-no-result cases in the same launch window.
- Any confirmed provider amount/order mismatch on real payment.
- Queue dashboard shows unexpected backlog or retry storm.
- Manual processor cannot recover a paid queued job.
- Generation failure affects 2 paid cases or more.
- Support volume exceeds owner same-day response capacity.
- Any suspected raw token, provider payload, or private user input exposure.

Early launch posture:

- Refund-first for confirmed system delivery failures.
- Recover-first for queue/processor delays when recovery is safe and fast.
- Pause ads immediately if support volume or payment failures increase.
- Do not resume payment runtime after a pause until the cause and user impact are documented.

## 9. Owner Confirmations Needed

- Confirm whether public refund/support handling window should be published as 3-7 business days or another value.
- Confirm `hello@anyu.tw` is monitored at least daily during launch week.
- Confirm who has access to NewebPay merchant backend and refund controls.
- Confirm whether support notes should live in email only or a separate private tracker.
- Confirm whether any post-launch refund copy needs legal/accounting review.

## 10. Recommended Next Step

If NewebPay review remains pending:

- Prepare **NewebPay Sandbox E2E Smoke Plan v0** or wait for approval/credentials.

If credentials become available:

- Run **NewebPay Sandbox E2E Smoke v0** before production runtime enablement.

If approval arrives before sandbox is available:

- Run **Production Payment Config Dry-Run v0** with production runtime still disabled.

## Tech Debt Review

New technical debt introduced:

- None; documentation-only SOP.

Existing technical debt observed:

- Public refund page does not commit to a fixed response/refund handling window; this is acceptable now but owner should confirm before broad launch.
- No refund admin tooling exists; refunds remain manual provider/backend operations.
- Local `.git/FETCH_HEAD` permission issue remains previously observed.

Opportunistic cleanup completed:

- Consolidated support/refund handling into an operator-ready SOP aligned with public copy.

Deferred cleanup candidates:

- Add a private support tracker template outside the public repo if support volume increases.
- Add public copy clarification for handling window after owner confirmation.
- Add refund admin tooling only after real support volume justifies it.
