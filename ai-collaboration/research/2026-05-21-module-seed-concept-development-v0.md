# Module Seed Concept Development v0

Date: 2026-05-21

## 1. Summary

This brief develops the selected topic-ingestion seed, `Commitment Pressure Check`, into a reviewable concept for a possible next ANYU module. The working direction is a lightweight relationship-insight experience that helps users understand whether pressure around labels, commitment, future plans, or timing is coming from closeness, mismatch, avoidance, insecurity, or outside expectations.

This is a planning artifact only. It does not define final prompt/schema contracts, runtime behavior, UI, payment, LINE behavior, or production implementation.

## 2. Selected Seed

Selected seed: `Commitment Pressure Check`

Working module name: `答案壓力計`

Working core question: `你們是在靠近未來，還是在互相要答案？`

## 3. Why This Seed

`Commitment Pressure Check` is the strongest next concept candidate because it is emotionally specific, adjacent to the current ANYU promise, and less exposed to appearance, money/status, scam, or safety-heavy topic risk than other private-batch candidates.

It can stand apart from Module 01 because the user question is not only "does this person like me?" but "what is happening when the relationship starts asking for a future answer?" That shift gives the product a clearer Module 02 lane: relationship definition, commitment rhythm, future conversation pressure, and low-pressure next words.

## 4. Working Names

| Name | Clarity | ANYU Tone | Conversion Potential | Risk Of Sounding Too Serious |
|---|---|---|---|---|
| 答案壓力計 | High. Immediately frames the emotional object as pressure around answers. | Strong. Slightly mysterious but still human and simple. | High. The phrase creates a concrete score/result expectation. | Medium. "壓力" may feel heavy if the surrounding copy is not warm. |
| 承諾壓力計 | High for commitment-specific use cases. | Medium. More formal and heavier than ANYU's current language. | Medium-high. Clear paid-preview path around commitment conversations. | High. Can sound like serious relationship counseling. |
| 關係答案雷達 | Medium-high. Broad enough for multiple stages. | Strong. "雷達" fits the broader Opportunity Radar language and ANYU signal-reading mood. | Medium. Less concrete than "壓力計" but shareable. | Low-medium. Softer than commitment wording. |
| 未來感壓力測驗 | Medium. Communicates future anxiety but feels longer. | Medium. "未來感" is poetic, but "測驗" is generic. | Medium. Test framing is understandable. | Medium. Could feel abstract. |
| 定義關係溫度計 | High for DTR-style pressure. | Medium-high. Familiar from Module 01 but risks sounding derivative. | Medium. Familiarity helps, but it may blur with Module 01. | Low-medium. Warmer than "承諾". |

Recommendation: keep `答案壓力計` as the working name. It is distinctive, productizable, and flexible enough to include labels, exclusivity, future planning, and timing without turning the module into marriage counseling.

## 5. Core Question

Primary core question:

```text
你們是在靠近未來，還是在互相要答案？
```

Softer variants:

```text
這段關係是在往前，還是只是被答案追著跑？
你想要的是承諾，還是只是想被安定下來？
```

Recommendation: use the primary version for concept review. It has the strongest contrast and keeps the module from sounding accusatory. The first softer variant can work as supporting copy. The second softer variant is emotionally sharp but should be used carefully because it points more directly at the user's insecurity.

## 6. Target User

Primary target:

- 22-35 relationship-curious users in ambiguous dating, situationships, early relationships, or pre-commitment transitions.
- Users who feel pressure around labels, exclusivity, future plans, relationship definition, marriage timing, family expectations, or "where are we going?"
- Users who do not necessarily want a final decision, but want a gentler way to understand the pressure before saying something.

Non-target for v0:

- Users seeking marriage counseling.
- Users in active coercion, threats, violence, or unsafe control dynamics.
- Users looking for legal, clinical, or crisis guidance.

## 7. Emotional Job-To-Be-Done

When I feel pressure around defining the relationship or talking about the future, I do not necessarily need a final answer. I need to understand whether this pressure means closeness, mismatch, avoidance, outside expectation, or my own need for safety, so I can take one low-pressure next step instead of forcing the relationship into a yes/no decision.

## 8. Product Promise

Working promise:

```text
幫你分辨：這段對話裡的壓力，是在靠近未來，還是在逼彼此交答案。
```

Promise boundaries:

- The module helps users reflect on pressure signals and possible next words.
- It does not diagnose relationship health.
- It does not decide whether the user should stay, leave, commit, break up, marry, or confront.
- It should feel like emotional weather-reading, not advice authority.

## 9. Input Requirements

The user should provide enough context to identify the pressure source and relationship rhythm:

- Relationship stage: ambiguous, dating, exclusive, early relationship, long-term relationship, family/marriage pressure, or other.
- Pressure trigger: what event, sentence, silence, milestone, or expectation made the user feel pressure.
- What was said or not said: a short interaction, paraphrase, or emotional description.
- Recent pattern: whether this is a one-time moment or recurring pattern.
- Each person's reaction: who asked, avoided, delayed, became anxious, reassured, withdrew, or escalated.

Possible input prompt:

```text
貼上一段讓你覺得「對方在要答案」或「你不知道該不該問清楚」的互動。可以是對話、事件描述，或你自己的感覺。
```

Privacy helper direction:

- Encourage users to remove names, phone numbers, workplaces, exact locations, and other identifying details.
- Allow paraphrase instead of raw chat screenshots or exact private messages.
- Keep the input format open enough for a short story, not only a chat transcript.

## 10. Free Result Structure

Recommended free result:

1. `答案壓力指數`: a lightweight pressure score that reflects intensity, not correctness.
2. `壓力來源類型`: one primary type explaining where the pressure appears to come from.
3. `三個訊號`: three signal cards grounded in the user's description.
4. `一句 soft insight`: a warm, non-diagnostic interpretation.
5. `下一步低壓建議`: one practical next step that avoids ultimatum framing.

The result should feel related to Module 01 but not identical. Module 01 reads warmth and ambiguity; this module reads future pressure and conversation rhythm.

## 11. Possible Result Types / Axes

Possible result types:

- `安定需求型`: pressure comes from wanting emotional steadiness or reassurance.
- `節奏不一致型`: both people may care, but their timing or readiness differs.
- `關係定義拉扯型`: the pressure centers on naming, exclusivity, or role clarity.
- `逃避未來型`: future talk repeatedly gets delayed, redirected, or minimized.
- `外界壓力轉嫁型`: family, age, peers, money, housing, or social milestones are leaking into the relationship.

Recommended v0 axes:

- `pressureIntensity`: how much the moment feels like a demand for an answer.
- `mutuality`: whether both people are moving toward a shared future rhythm or one person is carrying the pressure alone.
- `clarity`: whether the pressure is being spoken directly, avoided, or disguised as jokes, silence, plans, or complaints.

Deferred axes:

- `futureOrientation`: useful later, but overlaps with clarity in v0.
- `avoidance`: useful later, but risks overdiagnosing.
- `emotionalSafety`: important for guardrails, but should not become a relationship health score.
- `timingMismatch`: useful as a result type, but likely too narrow as a standalone axis.

## 12. Paid / Fake-door Direction

Paid-preview direction:

```text
3 種不逼迫的說法：
1. 溫柔問清楚
2. 給界線但不下最後通牒
3. 把未來問題拆小
```

Potential CTAs:

```text
看 3 種不逼迫的問法
解鎖低壓談未來的說法
```

Recommended approach:

- Keep the existing no-real-payment / LINE notification fake-door strategy unless a later handoff changes it.
- Position the paid preview as "how to say it" rather than "what decision to make."
- Avoid implying that the unlocked content can guarantee commitment, prevent conflict, or diagnose compatibility.

## 13. Share / Social Hook

Potential share hooks:

```text
我的答案壓力類型
你是在靠近未來，還是在互相要答案？
```

Shareable result formats:

- A type label plus one warm sentence.
- A soft pressure index without shame language.
- A contrast line such as "你不是太急，你可能只是需要比較清楚的節奏。"

Avoid:

- Shaming users for wanting commitment.
- Blaming the other person as avoidant, manipulative, or unserious.
- Turning the share card into a public relationship verdict.

## 14. Relationship To Module 01

Module 01, `曖昧溫度計`, answers:

```text
這段互動有沒有熱度？訊號怎麼讀？下一句怎麼回？
```

`答案壓力計` would answer:

```text
這段關係裡的未來/承諾壓力從哪裡來？你可以怎麼低壓問清楚？
```

Positioning:

- Module 01 is for attraction, ambiguity, warmth, and reply strategy.
- Module 02 candidate is for commitment, future rhythm, definition pressure, and conversation pacing.
- The two modules should share ANYU tone and privacy posture, but should not share the exact same scoring names or result schema.

## 15. Differentiation From Adjacent Candidates

Compared with `Social signal decoder`:

- Social signal decoder is smaller and more tactical, focused on low-cost signals like views, replies, likes, and attention.
- `答案壓力計` has stronger potential as a full module because it captures a larger emotional transition.

Compared with `Boundary clarity check`:

- Boundary clarity has important emotional stakes but can drift into safety, coercion, and consent-sensitive territory.
- `答案壓力計` can include guardrails while staying in a lighter relationship-conversation lane.

Compared with `Dating app fatigue`:

- Dating app fatigue is modern and relatable, but platform behavior can become tactical rather than emotionally distinctive.
- `答案壓力計` is less platform-dependent and closer to ANYU's relational signal-reading lane.

Compared with `Profile anxiety`:

- Profile anxiety is actionable but has high appearance/body-image sensitivity.
- `答案壓力計` avoids making the user's looks, status, or market position the center of the product.

Compared with `Money/status pressure`:

- Money/status pressure is real but risk-heavy and can become judgmental quickly.
- `答案壓力計` can acknowledge outside pressure without making class, income, or comparison the core result.

## 16. Risk / Safety / Legal Notes

Primary risks:

- Relationship advice overclaim.
- Emotional dependence on generated guidance.
- Coercive, controlling, threatening, or violent situations.
- Domestic abuse or safety concerns.
- Marriage/family pressure that creates high-stakes conflict.
- Mental health distress or crisis language.

Recommended guardrails:

- Add clear disclaimer copy that the module is for reflection and not therapy, legal, crisis, or safety advice.
- Avoid telling users to stay, leave, commit, break up, marry, confront, or issue ultimatums.
- If coercion, threats, violence, stalking, self-harm, or severe distress appear, route the tone toward trusted-person/professional support rather than relationship optimization.
- Keep suggestions low-pressure and user-agency centered.
- Avoid labeling the other person with clinical or moral judgments.

Do not draft final legal copy in this concept brief. Legal wording should be reviewed in a later implementation handoff if the concept moves forward.

## 17. Data / Prompt / Schema Implications

Likely schema needs if implemented later:

- `pressureScore`
- `pressureType`
- `signalCards`
- `softInsight`
- `nextStepSuggestion`
- `paidReplyStrategies`
- `shareSummary`

Schema direction:

- A new module schema is preferable to adapting Module 01 directly.
- Module 01 concepts such as confidence, signal cards, soft insight, and reply guidance can inform structure.
- The actual schema should be versioned and reviewed through a separate prompt/schema planning handoff.

Prompt direction:

- The prompt should distinguish pressure intensity from relationship health.
- It should infer possible pressure sources without diagnosing intent.
- It should generate low-pressure phrasing, not final decisions.
- It should include abuse/coercion/safety guardrails before ordinary relationship suggestions.

No schema or prompt changes are implemented by this task.

## 18. Validation Plan

Suggested validation sequence:

1. Create a Module 02 Concept Review v0 packet for user, ChatGPT, and Claude review.
2. Draft synthetic, non-private test cases covering labels, exclusivity, future timing, family pressure, avoidance, and timing mismatch.
3. Build a prompt/schema plan only if the concept review confirms the module lane.
4. Later, test a fake-door landing/module page with a small paid-intent CTA.
5. Capture LINE interest without real payment or automatic delivery.
6. Compare click-through and completion against Module 01 baseline after implementation exists.

Validation criteria:

- Users can understand the promise in one line.
- The concept feels distinct from Module 01.
- The result types feel warm and non-judgmental.
- Guardrails are sufficient for commitment/future-pressure situations.
- Paid-preview CTA feels like useful conversation support, not emotional manipulation.

## 19. What Not To Build Yet

- No new route, page, or module runtime.
- No real payment.
- No therapy-like claims.
- No serious marriage counseling.
- No domestic safety handling beyond guardrail/referral copy.
- No portal.
- No long-term persona graph.
- No automatic LINE delivery.
- No prompt/schema implementation.
- No database changes.
- No provider/model routing changes.

## 20. Open Questions

- Should the module name use `答案壓力計` or a softer name for first user-facing tests?
- Should the first implementation focus on ambiguous/situationship users only, or include established relationships facing future/marriage timing?
- Should the paid preview emphasize exact wording, reflection prompts, or conversation paths?
- How should safety/coercion detection be handled without making the module feel clinical?
- Should Module 02 share Module 01's visual/result rhythm, or intentionally feel more mature and future-oriented?

## 21. Recommended Next Step

Recommended next step:

```text
Module 02 Handoff: 答案壓力計 Research + Prompt/Schema Plan v0
```

The concept is strong enough to move into prompt/schema planning before any implementation. The next step should define synthetic cases, result schema, prompt boundaries, safety guardrails, and review criteria, but still avoid route/UI/runtime work until the plan is approved.
