# Module 01 Follow-up Interaction + Evidence Anchoring Plan v0

Date: 2026-05-27

## 1. Summary

Module 01 should stay as a one-time full-analysis beta while low-key production monitoring finishes, but the next product direction should not be another isolated NT$49 result. Tester feedback points to a stronger future shape: a relationship-specific follow-up experience where users can update the same situation over time, with lightweight evidence summaries anchoring recommendations to what they wrote.

Recommended direction:

- Now: keep NT$49 one-time full analysis for low-key beta and finish production smoke/monitoring.
- Next: plan and implement paid `evidence_summary` cards as model-generated summaries, not raw quotes.
- Then: fake-door or beta-test a 3-use relationship pack before building payment/credits.
- Later: evolve the pack into a LINE-based follow-up mode or 7-day observation pass if repeat-use evidence is strong.

## 2. Tester Feedback

Recent family/friend tester feedback clusters into three problems:

- First analyze can still feel long, especially near the 80-character minimum.
- Full paid analysis should make it clearer which user-provided signals support the recommendations.
- Relationship uncertainty changes over days, so paying NT$49 for every tiny update may feel wasteful.

Current production context:

- Module 01 uses free-only analyze with deferred paid generation.
- Recent production route/API smoke measured fresh analyze at about 21.6 seconds and fresh paid generation at about 42.8 seconds.
- Pending paid UX polls and auto-refreshes.
- LINE / LIFF / short-code fulfillment exists.
- The current input floor is 80 visible characters.
- Production low-key activation is still in progress, with operator-owned LINE/LIFF smoke remaining important.

## 3. Short-input Analyze Speed / Perceived Wait

The immediate problem is partly latency and partly expectation management. A 20-second first wait feels especially long when the user writes only a short description. However, changing model routing or schema branches before monitoring creates unnecessary product and QA risk.

Options:

- Same model, shorter prompt for 80-139 characters: likely faster and cheaper, but creates prompt/schema branching and may make short inputs feel thin.
- Same free result, better wait copy: lowest-risk; improves perceived progress without changing output contracts.
- Faster model for short free analyze: potentially meaningful latency win, but adds model-ops complexity and quality variance.
- Progressive free result: could improve perceived speed, but risks feeling fake unless the first state is honest and grounded.

Recommendation:

- Start with perceived-wait improvement and latency instrumentation, not a fast-path implementation.
- Add production metrics for input length bucket, analyze duration, cache hit, provider/fallback status, and conversion action.
- If monitoring confirms short-input abandonment or slow conversion, test an 80-139 character short-output path behind a feature flag.
- Avoid changing schema until the short-input need is proven.

Tiered free-result behavior should be planned like this:

- 80-139 characters: same schema, tighter copy, stronger uncertainty note, paid teaser focused on “more context would separate possibilities.”
- 140-399 characters: current normal free result.
- 400+ characters: current result plus better perceived progress copy; do not make free result deeper just because input is longer.

## 4. Evidence Anchoring Options

Evidence anchoring should answer: “What did ANYU see in what I wrote?”

Recommended paid section:

```text
這份分析主要參考了這些線索
```

Suggested cards:

- Interaction rhythm: a summary of reply-speed or initiative changes.
- Continued signal: a summary of remaining warmth, such as watching stories or sharing life updates.
- User uncertainty: a summary of the specific decision tension, such as “busy or cooling down.”

Options:

- Render-only from existing `signalDeepDive`: low implementation cost, but may not be specific enough.
- New paid schema field `evidenceSummary`: cleaner product contract and easier QA, but needs schema/prompt migration.
- Free result weak evidence hint: useful later, but not urgent.

Recommendation:

- Add a future paid-only `evidence_summary` field in a schema/prompt revision.
- Keep it separate from `signalDeepDive`; evidence anchors explain “what this is based on,” while signal dives explain “what it may mean.”
- Do not include evidence anchors in share cards or LINE push messages.

## 5. Raw Quote vs Evidence Summary

Prefer evidence summaries over raw quotes for the MVP.

Reasons:

- Raw quotes increase privacy risk and can expose names, contact details, or sensitive relationship text.
- Raw quotes are harder to safely retain, display, and scrub.
- LINE/unlocked pages may be opened in public or semi-public contexts.
- Redacted summaries are enough to create trust without repeating private text.

Future raw quote rules, if ever needed:

- Limit to 2-3 snippets.
- Limit each snippet to 20-40 characters.
- Run redaction before display.
- Never show names, phone numbers, addresses, handles, links, or highly sensitive text.
- Only show on unlocked page, never share card or LINE message.
- Disable quote display if source retention has been scrubbed.

Recommendation:

- Do not use raw quotes in the next implementation.
- Use model-generated evidence summaries grounded in redacted input.

## 6. Follow-up Interaction Models

Model 1: one-time full analysis NT$49.

- Pros: simplest, already aligned with current fake-door/payment-free beta.
- Cons: weak repeat fit and may feel wasteful for small updates.

Model 2: 3-use interaction pack NT$99.

- Pros: strong fit for “same relationship, a few updates,” low psychological friction, easy to explain.
- Cons: needs use counting, relationship session identity, and entitlement state.

Model 3: 7-day observation pass NT$149 or NT$199.

- Pros: strongest match for ongoing uncertainty and can support LINE engagement.
- Cons: requires clearer account/LINE identity, retention policy, support/refund rules, and abuse prevention.

Model 4: LINE follow-up mode after first analysis.

- Pros: natural behavior channel and owned re-engagement.
- Cons: needs stateful LINE commands, careful privacy boundaries, and stronger fulfillment reliability.

Recommendation:

- Keep one-time full analysis during low-key beta.
- Design next monetization test around a 3-use relationship pack.
- Treat 7-day observation pass as the likely evolved product if pack usage is strong.
- Treat LINE follow-up mode as the interaction surface, not necessarily the first paid package.

## 7. Pricing / Packaging Options

Recommended packaging sequence:

- Current beta: NT$49 one-time full analysis.
- Next fake-door: NT$99 for 3 updates on the same relationship.
- Later: NT$149 or NT$199 for 7-day observation pass if repeat use appears frequent.

Why 3-use pack first:

- It matches the tester insight without requiring full subscription/account infrastructure.
- It gives users enough room for “today / tomorrow / later” uncertainty.
- It is simpler than time-window entitlement and easier to explain before real payments.

First paid/friend unlock could include one follow-up in a beta:

- “這次完整分析含一次後續更新” is a strong trust-building experiment.
- It can validate repeat intent before building credits/payment.
- It should be manually or LINE-gated in beta to avoid accidental unlimited use.

## 8. LINE Follow-up Experience

Future LINE actions could be:

- 更新這段情境
- 查看上次分析
- 再問一次
- 開始新的分析

Recommended phased LINE path:

- Phase 1: On unlocked page, tease “之後可以更新這段情境” without enabling it.
- Phase 2: For operator/friend testers, manually allow one LINE follow-up tied to an unlock intent.
- Phase 3: Add relationship sessions and 3-use pack entitlements.
- Phase 4: Add richer LINE commands or buttons only after entitlement behavior is stable.

Do not build LINE commands before payment/entitlement direction is chosen.

## 9. Data Model Implications

Likely future entities:

- `relationship_sessions`
- `follow_up_requests`
- `analysis_credits`
- `paid_entitlements`
- `line_user_entitlements`

Minimum future fields:

- `line_user_id_hash`
- `module_slug`
- `relationship_session_id`
- `entitlement_type`
- `remaining_uses`
- `expires_at`
- `created_at`
- `last_used_at`

Evidence anchoring likely needs:

- `evidence_summary_json` or a paid-result schema field.
- `source_retention_state`, so the UI knows whether source-backed summaries are still safe to display.
- No raw quote persistence by default.

Follow-up generation likely needs:

- Previous free result summary.
- Previous paid result summary card or compact state.
- New redacted update.
- Relationship session summary, not full raw history.

## 10. Privacy / Retention Implications

Evidence and follow-up features increase retention sensitivity.

Privacy recommendations:

- Store summaries and redacted evidence anchors rather than raw conversation text.
- Keep raw or redacted user input retention short.
- Let relationship sessions expire.
- Make retention copy match actual implementation before launching packs.
- Hash LINE user identifiers where possible; avoid displaying or reporting LINE IDs.
- Do not include raw evidence in share cards, LINE messages, events, reports, or analytics metadata.

Session retention direction:

- 3-use pack: expire after 7-14 days or after credits are used.
- 7-day pass: expire shortly after the pass ends, with only aggregate/sanitized event records retained.
- Beta follow-up: keep strict 24-hour source retention unless a specific retention decision is approved.

## 11. MVP Phasing

Phase 0: finish current production safety.

- Complete latest production refresh/smoke after pending fixes are staged.
- Monitor analyze latency, paid generation completion, provider/fallback source, LINE fulfillment completion, and support issues.

Phase 1: evidence anchoring.

- Plan schema/prompt update for paid `evidence_summary`.
- Use evidence summaries, not raw quotes.
- Add rendering only to unlocked paid result.
- Validate with sanitized synthetic and tester examples.

Phase 2: follow-up fake-door.

- Add a non-functional teaser or CTA: “之後可以更新這段情境.”
- Track click/interest safely.
- Do not require payment work yet.

Phase 3: beta follow-up.

- Tie one follow-up to an existing unlock intent or relationship session.
- Use LINE or unlocked page entry.
- Store new redacted update and compact session summary.

Phase 4: 3-use pack.

- Add entitlements, remaining uses, expiry, and payment provider planning.
- Keep LINE follow-up as the preferred interaction surface if beta proves natural.

Phase 5: 7-day observation pass.

- Only after pack usage validates repeat behavior and support load is understood.

## 12. What Not To Build Yet

Do not build yet:

- Faster model routing.
- Alternate schema for short-input free results.
- Raw quote snippets.
- Relationship-session DB schema.
- Payment packs or credits.
- LINE commands/rich menu.
- 7-day pass.
- Account portal.
- Module 02.
- Ads or broad launch.

These should wait until current production monitoring and operator smoke are complete.

## 13. Recommended Next Step

Finish production refresh/smoke and low-key monitoring first. Then run an Evidence Anchoring Schema + Prompt Plan v0 focused only on paid `evidence_summary` summaries, privacy boundaries, and rendering on unlocked paid results.
