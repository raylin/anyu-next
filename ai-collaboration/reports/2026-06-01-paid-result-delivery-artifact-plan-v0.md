# Paid Result Delivery Artifact Plan v0

Date: 2026-06-01
Task: Paid Result Delivery Artifact Plan v0

## 1. Current Paid Result Delivery Inventory

Current user journey after payment:

- ReturnURL page resolves `pcs_` checkout session server-side and polls `/api/modules/[moduleSlug]/payment/status`.
- `paid_ready` state shows "完整報告已準備好" and a primary CTA: "查看完整報告".
- Payment access page resolves the checkout handoff and renders `UnlockCompleted`.
- Paid access token path also renders `UnlockCompleted` when entitlement/result is ready.
- Completed result page shows:
  - topbar with back link and ANYU wordmark
  - "完整分析" card using the paid preview headline
  - paid result content sections: temperature card, deeper signal, possible states, reply strategies, copyable messages, evidence summary, avoid-doing, 48-hour plan, summary card
  - Email recovery save section or saved confirmation
  - legal footer

What already feels complete:

- The full paid content is structured and materially different from the free result.
- Evidence Anchoring exists through `EvidenceSummarySection`.
- ReturnURL copy correctly avoids implying browser return equals payment truth.
- Recovery save exists before payment and after payment.
- Saved state can display a masked Email contact.
- Support/refund copy is present and consistent with 3–7 business day handling.

What still feels transient:

- The completed result starts like another result page, not like a delivered artifact.
- There is no explicit report cover, issue identity, generated timestamp, or completion stamp.
- There is no safe user-facing report reference code.
- Access depends on `pcs_` checkout session or `pa_` paid access token behind the scenes, but the user only sees page state.
- Recovery save helps, but it is framed as a separate save box rather than part of the artifact identity.
- There is no explicit "this report has been delivered to your web access record" moment.

What is currently recoverable:

- If the user has the current browser/session URL, `pcs_` payment access can render the result.
- If the user has a `pa_` access path, paid access resolver can render the result.
- If Email recovery is saved, support/recovery identity exists in `payment_recovery_contacts`.
- LINE recovery route foundation exists but no UI/push flow is live.
- Support can manually reason from payment/order context, but no user-facing report reference exists yet.

What depends on session/token state:

- ReturnURL/access path depends on `pcs_` checkout session handoff.
- Legacy paid access path depends on `pa_` paid access token.
- User-facing recovery identity does not yet provide an automated magic link or report history.

## 2. Delivery Artifact Definition

For Module 01, "artifact" should mean a web-first delivered report object, not a heavy PDF.

V0 artifact elements:

- report cover/header
- module label: `MODULE 01`
- module name: `曖昧溫度計`
- report title: derived from the paid preview headline or summary card headline
- report reference code
- generated/completed time when available
- payment confirmation/delivery status
- saved/recovery status
- support/refund reference
- privacy-safe note that web access is canonical
- optional share-safe summary card section already present, but not positioned as a downloadable asset yet

Explicit boundaries:

- Artifact is web-first delivery.
- It is not Email or LINE delivery.
- It is not full membership/history.
- It can later become the seed of report history or "My ANYU record".
- PDF/export should remain future-only until users ask for it or retention/support data proves need.

## 3. User-Facing Delivery Moment

Recommended v0:

- Keep ReturnURL ready state focused on status and primary "查看完整報告".
- Add a delivery header/status card at the top of completed paid result.
- Do not add a separate cover page before the report; this adds friction after payment.
- Include a compact receipt-like support/reference row in the header or immediately below it.
- Fold saved/recovery status into the delivery header while keeping the existing Email save section for action.

Recommended top-of-report structure:

1. Existing topbar.
2. New "delivery artifact header" card:
   - `MODULE 01`
   - `曖昧溫度計完整報告`
   - headline/title
   - `已完成交付`
   - generated time if available
   - report reference code
   - saved status: saved to Email / not saved yet / LINE later
3. Existing recovery save section, but visually subordinate if saved.
4. Existing paid result content.

Why:

- The user reaches the content quickly.
- The report feels delivered and identifiable.
- Support/recovery gets a reference code without adding support tooling first.
- It stays compatible with current staging-proven payment/access flow.

## 4. Report Identity / Reference Code

Options considered:

- A. show shortened `resultId`
- B. show payment/merchant order reference
- C. generate user-friendly report code
- D. do not show code yet

Recommendation: C, generate a user-friendly safe report reference code.

Proposed format:

- `AT-YYYYMMDD-XXXXXX`
- `AT` = ambiguous temperature / Module 01
- date = result creation or paid result completion date
- suffix = deterministic short checksum/hash derived from non-secret IDs server-side

Why not raw IDs:

- Full `resultId` is internal and visually unfriendly.
- Merchant order can be useful for payment support but is payment-provider-specific and may feel like an invoice.
- `pa_` and `pcs_` must never be displayed.

Support workflow:

- User can provide report reference code plus approximate payment time/email recovery contact.
- Internally, support can map the reference if a helper exists.

Important implementation detail:

- The reference code should be display-only and non-authorizing.
- It must not grant access.
- It must not encode raw IDs reversibly in the client.
- If support lookup is needed later, add a server-side helper.

## 5. Recovery Integration

Artifact should show recovery status as part of delivery identity.

States:

- Saved Email:
  - "這份完整分析已保存"
  - "已保存找回方式：a***@e***.com"
- Unsaved:
  - "建議保存這份報告，避免換裝置後找不到。"
  - CTA remains Email save section.
- LINE deferred:
  - "LINE 找回稍後支援"
  - "LINE 之後可作為找回、完成通知與客服輔助，不是完整報告交付管道。"
- Future member:
  - "已保存到你的 ANYU record" only after membership exists.

Avoid:

- "Email 交付完整報告"
- "LINE 交付完整報告"
- "完整報告會傳到 LINE"
- "註冊會員才能查看"

## 6. Paid Value and Ritual

The artifact should increase perceived value by adding a light ritual:

- report cover feeling, not invoice feeling
- completion stamp
- issue/reference identity
- generated time
- saved/recovery status
- "web access is your canonical report" language
- support path if the report cannot be found

Tone:

- warm
- premium
- slightly mysterious
- concrete enough to feel delivered
- not SaaS-like
- not a cheap certificate
- not over-legalistic

Example copy:

- "這份完整報告已完成交付"
- "這是你本次曖昧溫度計的完整分析檔案。建議保存找回方式，之後換裝置也能請我們協助找回。"
- "報告編號：AT-20260601-K7Q2M9"
- "完整內容仍以此網頁查看為準；Email / LINE 只作為找回與通知輔助。"

## 7. Placement Recommendations

ReturnURL ready:

- Keep primary status and "查看完整報告".
- Add only subtle saved/unsaved reminder already present.
- Do not show full artifact header here.

Payment access page:

- Server resolves handoff and renders completed result.
- No separate intermediate cover needed.

Completed paid result top:

- Add delivery artifact header/status card.
- Show report title, completion status, generated time, reference code, recovery status.

Completed paid result bottom:

- Keep support/refund/legal footer.
- Optionally add small "Need help finding this report later?" reminder only if unsaved.

Support/refund area:

- Include support email and 3–7 business day handling.
- Ask for report reference code/payment time if available.

Avoid repetition:

- Recovery save action remains one section.
- Artifact header shows status; it does not duplicate full recovery form when saved.

## 8. Share and Privacy

Share-safe artifact should be deferred from v0 implementation.

Reasons:

- Current paid report can include private interpretation.
- Share cards need clear boundary: no raw user text, no private analysis, no tokenized URL.
- Module 01 already has summary card content; turning it into a share artifact requires design/privacy review.

Future share-safe object:

- module name
- archetype/state label
- non-sensitive summary headline
- no raw input
- no paid-detail excerpt
- no access/recovery URL

## 9. Future Member History Path

The delivery artifact can become the foundation for:

- report history
- purchase history
- lightweight member account
- Personal Insight Graph
- cross-module paid report library

Migration path:

1. V0: report artifact header plus report reference.
2. Recovery identity: Email/LINE saved status.
3. Support-assisted recovery: report reference lookup.
4. Magic recovery link: short-lived server-resolved link.
5. Lightweight member record: attach reports to identity.
6. Personal Insight Graph: only after explicit consent and product need.

Do not implement membership now.

## 10. Implementation Options

Option A: Minimal delivery header on completed result page.

- Lowest risk.
- Uses current render path.
- Adds concrete artifact feeling.
- Recommended v0.

Option B: Full report cover page before result.

- Stronger ritual.
- Adds friction after payment.
- More UI/state work.
- Defer.

Option C: Receipt-like section at bottom.

- Useful for support.
- Too easy to miss.
- Better as secondary support row, not primary artifact.

Option D: Dedicated `/report/[id]` artifact page.

- Better long-term for member/history.
- Requires new route/access model.
- Too broad for v0.

Option E: PDF/export later.

- Concrete artifact but high risk for privacy, layout, and support.
- Defer until demand is proven.

Recommendation:

- Implement Option A with a small support/reference row.
- Do not implement PDF/export or dedicated report route in v0.

## 11. Data / Helper Needs

Current data is mostly enough:

- `resultId`
- `moduleSlug`
- `paymentIntentId`
- `entitlementId`
- `analysisPaidResults.completedAt`
- `analysisResults.createdAt`
- `recoverySummary`
- support email
- static price NT$49

Potential helpers:

- `createSafeReportReference(input)`
  - input: module slug, result ID, paid result completion date
  - output: display-only reference code
- `getPaidResultDeliverySummary(input)`
  - module name
  - report title
  - generated/completed time
  - report reference
  - recovery saved status
  - support email
- `formatDeliveryTimestamp(date)`
- reuse existing `getPaymentRecoveryStatusSummary`

No schema change is required for v0 if report reference is deterministic and display-only.

If future support lookup needs indexed search by report code, add a separate schema-approved task.

## 12. Tests to Plan

Implementation tests should cover:

- completed result shows delivery artifact header
- report reference exists and does not expose raw `pa_` / `pcs_`
- report reference does not expose full UUIDs
- saved recovery state displays masked contact only
- unsaved state prompts save without blocking content
- no Email/LINE delivery promise
- support/refund info present
- access render still works
- no-card QA still passes
- legacy unlock access still renders

## 13. Risks / Open Decisions

- Final report code format.
- Whether to include payment/merchant order reference anywhere user-facing.
- How long paid reports remain accessible and whether public retention copy needs adjustment.
- Whether generated time should use paid result `completedAt` or result `createdAt`.
- Whether PDF/export is needed later.
- Privacy boundary for share-safe artifact.
- Whether support can map deterministic report reference without new DB index.

## 14. Recommended Next Implementation Task

Recommended: `Paid Result Delivery Artifact Implementation v0`.

Scope:

- Add deterministic display-only report reference helper.
- Add delivery summary helper.
- Add delivery artifact header/status card to completed paid result page.
- Integrate recovery saved/unsaved status into the header.
- Keep existing Email save section.
- Do not add PDF/export, membership, Email sending, LINE push, or payment behavior changes.

## 15. Documentation

- Handoff created:
  - `ai-collaboration/handoffs/2026-06-01-paid-result-delivery-artifact-plan-v0-handoff.md`
- Report created:
  - `ai-collaboration/reports/2026-06-01-paid-result-delivery-artifact-plan-v0.md`
- Summary log updated:
  - `ai-collaboration/summaries/summary_log.md`
- Dashboard updated with delivery artifact roadmap and next recommendation.

## Validation

Documentation-only validation:

- docs presence check: passed
- dashboard HTML sanity: passed
- secret/private scan on new handoff/report: passed
- `git diff --check`: passed

## Tech Debt Review

- New technical debt introduced: none; planning only.
- Existing technical debt observed: paid result has recovery save, but no delivery artifact identity/reference yet.
- Opportunistic cleanup completed: none; no runtime code changed.
- Deferred cleanup candidates: support lookup by report reference, share-safe card, PDF/export decision, member history.
