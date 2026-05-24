# Paid Result Value + Context Input Plan v0

Date: 2026-05-24

Handoff date: 2026-05-21

## 1. Summary

Module 01's paid/unlocked result should be upgraded before production LINE fulfillment activation or ads/growth work. The current paid result is structurally closer to an expanded free result than an NT$49 deliverable: it has a deeper read, one interpretation, one risk warning, a short avoid list, and three single-message reply strategies.

The target paid result should feel like a practical response package: richer interpretation, directly usable messages, situation-specific branching, a 24/48-hour plan, and a keep/share summary card. Optional context chips should improve quality by becoming structured prompt variables and behavioral priors, not extra raw text appended to the prompt.

## 2. Current Concern

The main risk is expectation mismatch. If a user unlocks after seeing the current free result and receives only a slightly longer analysis, NT$49 may feel unjustified. This is especially risky before LINE fulfillment production activation because the fulfillment flow can successfully deliver a link, but the delivered value may not yet feel paid-quality.

The paid result should answer the user's practical question: "What should I do next, and what should I say?"

## 3. Current Free vs Unlocked Result Assessment

Current schema:

- `free_result`: temperature score, state label, one-sentence read, up to three observed signals, uncertainty note, paid teaser.
- `insight_layer`: title, explanation, principle.
- `paid_preview`: headline, price, included sections, preview copy.
- `paid_result`: deeper signal analysis, possible interpretation, risk warning, avoid list, three reply strategies.

Current unlocked page renders:

- complete-analysis intro
- temperature card
- deeper signal card
- three reply strategy cards
- risk guardrail card

Assessment:

- Current unlocked result appears closer to a free-result extension than a paid-quality deliverable.
- It contains useful guidance, but not enough branching, copyable options, or tactical follow-up to justify NT$49 consistently.
- The three reply strategies each include one concrete example, but users likely need alternate tones and follow-up handling.
- Current structure has no explicit 24/48-hour plan, no possible-state likelihood comparison, no summary card, and no structured "if they reply this, do that" guidance.

## 4. Quantitative Paid Result Target

Planning estimates:

| Dimension | Current unlocked result | Target paid result |
|---|---:|---:|
| Chinese character volume | ~500-900 | ~1,800-2,800 |
| Major sections | 3-4 rendered content sections | 7-9 structured sections |
| Reply strategies | 3 strategies | 3 strategies with 6-9 copyable messages total |
| Other-person states | 0-1 implicit interpretation | 3 possible states with likelihood and watch-for signal |
| Signal analysis | 1 deeper signal block | 3 signal deep dives |
| Action planning | limited | 24/48-hour action plan |
| Summary artifact | existing share card is free-result oriented | paid summary card users can keep/share |

The target should be adjusted after implementation and human review, but the minimum paid gate should be materially above the free result in structure and practical specificity.

## 5. Proposed Paid Result Content Contract

Paid result should include at least:

1. Full interpretation summary.
2. Three possible other-person states.
3. Three signal deep dives.
4. Three reply strategies.
5. Follow-up if they reply A/B/C.
6. Next 24/48-hour action plan.
7. What to avoid doing.
8. Soft insight.
9. Summary card.

Paid should feel like a practical response package, not a longer soothing essay.

Quality requirements:

- Preserve uncertainty.
- Avoid mind-reading.
- Use warm Traditional Chinese.
- Give directly copyable messages.
- Distinguish "what this might mean" from "what you should do next."
- Avoid manipulative tactics.

## 6. Optional Context Inputs

Keep the primary textarea required. Add optional quick chips, not a long intake form.

Recommended context groups:

| Field | Options |
|---|---|
| User goal | 他是不是還有興趣; 我要不要主動; 我該怎麼回; 我是不是想太多; 這段要不要退一步 |
| Relationship stage | 剛認識; 曖昧中; 見過幾次; 曾經很熱，最近變淡; 朋友以上但沒說破; 已經交往但有距離 |
| Primary pain / blocker | 回覆變慢; 有互動但不約; 會曖昧但不明說; 忽冷忽熱; 講到未來就閃; 我不敢問太清楚 |
| Desired reply tone | 溫柔試探; 輕鬆像聊天; 直接一點; 有界線但不冷; 給對方台階 |

Design principle: optional context should improve paid result specificity but not block analysis if skipped.

## 7. Context-to-Prompt Mapping

Do not append chip labels as raw text. Normalize them into structured variables:

```ts
userContext: {
  relationshipStage?: string;
  userGoal?: string;
  primaryPain?: string;
  replyTone?: string;
}
```

Then convert to prompt instructions:

```text
使用者目前在「曖昧中」，主要想知道「下一句怎麼回」。
讓他卡住的是「對方回覆變慢」。
付費回覆策略請偏向「有界線但不冷」。
避免過度鼓勵追問，也不要直接建議冷處理。
```

If context is omitted, use neutral defaults and avoid pretending to know relationship stage.

## 8. Lightweight Behavioral / Psychological Priors

Use internal mapping only; do not make UI sound clinical.

User goal to intervention type:

| User goal | Prompt prior |
|---|---|
| 他是不是還有興趣 | signal interpretation |
| 我要不要主動 | low-pressure action plan |
| 我該怎麼回 | communication strategy |
| 我是不是想太多 | reassurance plus observation plan |
| 這段要不要退一步 | boundary plus pacing plan |

Relationship stage to signal weighting:

| Stage | Weighting |
|---|---|
| 剛認識 | slow reply has lower diagnostic weight |
| 曖昧中 | continuity and initiative matter more |
| 見過幾次 | invite follow-through matters more |
| 曾經很熱，最近變淡 | change over time matters more than one behavior |
| 朋友以上但沒說破 | ambiguity and fear of definition matter more |
| 已經交往但有距離 | expectations, safety, and commitment mismatch matter more |

Primary pain to paid template:

| Pain | Paid template emphasis |
|---|---|
| 回覆變慢 | 48-hour observation plus low-pressure temperature check |
| 有互動但不約 | specific invite test plus fallback |
| 會曖昧但不明說 | low-pressure definition line |
| 忽冷忽熱 | stability reading plus self-protection strategy |
| 講到未來就閃 | commitment pressure framing |
| 我不敢問太清楚 | gentle clarity-seeking with exits |

## 9. Paid Result Schema Proposal

Future schema proposal:

```ts
paidResult: {
  fullSummary: string;
  possibleStates: Array<{
    label: string;
    likelihood: "低" | "中" | "高";
    explanation: string;
    watchFor: string;
  }>;
  signalDeepDive: Array<{
    signal: string;
    meaning: string;
    overreadWarning: string;
  }>;
  replyStrategies: Array<{
    label: string;
    tone: string;
    copyableMessages: string[];
    whenToUse: string;
    possibleReaction: string;
    followUpIfTheyReply: string;
  }>;
  next48HourPlan: {
    doNow: string;
    waitFor: string;
    avoid: string;
  };
  avoidDoing: string[];
  softInsight: string;
  summaryCard: {
    oneLine: string;
    temperature: string;
    suggestedMove: string;
  };
}
```

Future context schema:

```ts
userContext: {
  relationshipStage?: string;
  userGoal?: string;
  primaryPain?: string;
  replyTone?: string;
}
```

This requires a schema version bump and migration note before implementation.

## 10. Cache Key Implications

Context changes output, so future cache keys must include:

- normalized input hash
- relationship stage
- user goal
- primary pain
- reply tone
- prompt version
- schema version
- model strategy
- provider/model

If context is omitted, use stable empty/default values. Do not let `undefined`, empty string, and omitted fields create multiple cache keys for equivalent requests.

## 11. UI Implications

Recommended UI direction:

- Keep the primary textarea visually dominant.
- Add optional chip groups below the textarea or in a compact "讓分析更準" section.
- Make chips optional and reversible.
- Keep the number of choices small enough to avoid survey fatigue.
- Preview should communicate that context improves the unlocked next-step package.
- Unlocked result page needs new sections and copyable message affordances.
- Summary card should be designed as a keep/share artifact.

Do not add account/profile memory for this phase.

## 12. Cost / Latency Impact

Expected impact:

- Optional context variables: likely +5% token cost or less.
- Expanded paid result output: likely 2x-3x output tokens.
- Total per-analysis cost: likely +30% to +100%, depending actual output length and model behavior.
- Latency: likely modestly higher due to longer generation.
- Cache reuse becomes more fragmented because context fields become part of the cache key.

Recommended architecture:

- Generate free and paid payload in one provider call.
- Do not add a second provider call after unlock in v0.
- Keep result cache active to reduce repeat cost.

## 13. Validation Criteria for NT$49 Value

Pre-launch gate:

- at least 3 reply strategies
- at least 6 copyable messages
- at least 3 possible other-person states
- at least 3 signal deep dives
- 24/48-hour action plan
- summary card
- approximately 1,800+ Chinese characters
- no filler-heavy soothing text
- no overconfident mind-reading
- clear difference from free result on unlocked page

Human review gate:

- Run at least 3 synthetic cases.
- Reviewers should answer "yes" to: "Would this feel materially richer than the free result?"
- Reviewers should answer "yes" to: "Would a user have at least one message they could send immediately?"
- Staging unlocked page should feel worth unlocking before production fulfillment activation.

## 14. Risks / Safety / Legal Notes

Avoid:

- relationship diagnosis
- therapy/legal/safety advice
- telling the user to stay or leave
- overclaiming mind-reading
- manipulative reply tactics
- pressure tactics framed as strategy

Safety style:

- If coercion, threats, stalking, fear, or physical safety concerns appear, prioritize trusted/professional support.
- Keep safety language subtle and supportive, not clinical.

## 15. Implementation Sequence Recommendation

Recommended sequence:

1. Paid Result Prompt/Schema Upgrade v0.
2. Paid Result UI/Unlocked Page Upgrade v0.
3. Staging Content Value Review v0.
4. Return to LINE fulfillment production activation.

Recommended bundling:

- If feasible, implement prompt/schema upgrade and context chips together because context affects output quality and cache key.
- If schedule risk is high, implement paid-result schema/prompt first and add context chips in the next pass, but do not activate paid fulfillment until value review passes.

## 16. What Not To Build Yet

Do not build yet:

- personal insight graph
- long-term profile memory
- account system
- real payment
- portal
- multi-module personalization
- provider-assisted second call after payment
- attachment/image analysis
- complex psychometric scoring
- LINE rich menu
- broadcast

## 17. Open Questions

- Should context chips ship in the first paid-result upgrade, or should schema/prompt land first?
- What exact paid-result character count feels rich without feeling bloated?
- Should summary card be optimized for screenshot, LINE share text, or both?
- Should copyable messages be rendered as individual copy buttons in v0?
- Does `LINE_LOGIN_CHANNEL_ID` need to be explicitly configured before production fulfillment activation?

## 18. Recommended Next Step

Run `Paid Result Prompt/Schema Upgrade v0` with explicit human approval for schema versioning. Include context chips in that implementation if timeline allows; otherwise keep production fulfillment activation blocked until the richer paid-result contract is implemented and reviewed on staging.
