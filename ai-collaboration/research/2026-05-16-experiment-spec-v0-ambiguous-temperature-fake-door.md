# Experiment Spec v0 — 曖昧溫度計 Fake Door Test

Date: 2026-05-16

Status: Draft for ChatGPT / human review

## 1. Experiment Goal

Define a lightweight fake-door experiment for `曖昧溫度計` before implementing the product.

The experiment should validate:

1. Whether users are willing to paste relationship or conversation context.
2. Whether users understand and value a free `曖昧溫度` result.
3. Whether users show payment intent for `下一句怎麼回`.
4. Which relationship situation type has the strongest conversion signal.

This is a demand-validation experiment, not a production launch.

## 2. Core Hypothesis

```text
Users experiencing relationship uncertainty will paste a short conversation or describe a situation if the landing page promises a quick 曖昧溫度 result, and a meaningful subset will click a fake paid unlock for 下一句怎麼回.
```

Secondary hypothesis:

```text
Paid intent will be strongest when the situation contains immediate action pressure, such as whether to追問, 拉開, or send the next message.
```

## 3. Target User Segment

Primary segment:

- Taiwan Traditional Chinese users experiencing ambiguous relationship or conversation uncertainty.
- Users who actively interpret reply speed, read receipts, social activity, story views, and message tone.
- Users who want a fast third-party read before deciding what to do next.

Initial traffic should focus on users who recognize these problems immediately:

- `他已讀不回，但還在發限動。`
- `他昨天很熱，今天突然很冷。`
- `他回訊變慢，但又不是完全消失。`

Exclude from v0 targeting:

- Users seeking therapy or crisis support.
- Users seeking long-term relationship coaching.
- Users primarily asking about ex-partner reconciliation.
- Users drawn mainly by sensational `備胎` framing.

## 4. Situation Types To Test

Test only three primary situation types in v0:

1. `已讀不回`
2. `忽冷忽熱`
3. `回訊變慢但看限動`

These are broad, frequent, and easy to understand as acquisition hooks.

Do not make `前任` or `備胎` primary entry points yet. They may appear as secondary result patterns when the user text supports them, but they should not drive the main landing-page test.

Reasoning:

- `已讀不回`, `忽冷忽熱`, and `回訊變慢但看限動` are broader and likely more frequent.
- `前任` is emotionally heavier and narrower.
- `備胎` can become too sensational as a primary hook and may distort tone.

## 5. Landing Page Flow

Simple fake-door flow:

1. User lands on page.
2. User sees a pain-driven headline.
3. User selects or skips situation type.
4. User pastes text or describes situation.
5. User clicks analyze.
6. User sees free result.
7. User sees paid unlock CTA.
8. User clicks paid unlock.
9. Instead of real payment, user sees an internal-test message or email/LINE capture.

The first version can be manual or semi-manual. The test should prioritize learning over polish.

## 6. Input Flow

Input requirements:

- Text-only input.
- User can paste conversation text or describe the situation.
- Situation type is optional but recommended.
- No screenshot upload.
- No OCR.
- No login.

Suggested input form:

```text
情境類型：
[已讀不回] [忽冷忽熱] [回訊變慢但看限動] [不確定/跳過]

貼上對話或描述情況：
[textarea]

CTA:
分析我的曖昧溫度
```

Input helper copy:

```text
可以只貼最近幾句對話，或用自己的話描述發生什麼事。不要貼姓名、電話或其他能識別身份的資訊。
```

Minimum input quality:

- At least one observed behavior or conversation detail.
- Enough context to classify one of the three primary situations or `不確定`.
- Avoid asking users for long histories.

## 7. Free Result Experience

Free result should provide a fast, emotionally resonant read without giving full next-step strategy.

Free result includes:

- `曖昧溫度` score.
- State label.
- One-sentence read.
- Top 1-2 observed signals.
- Uncertainty note.
- Paid teaser.

Example:

```text
曖昧溫度：68/100
狀態：降溫觀望
一句話：他沒有完全冷掉，但主動性正在下降。
主要訊號：
- 回覆速度下降
- 仍保留低成本互動
提醒：這可能代表投入度下降，但仍需要更多上下文。
解鎖下一步：看你現在適合追問、低壓試探，還是暫時拉開。
```

Free result should answer:

- `我是不是想太多？`
- `現在大概是升溫、降溫，還是訊號混雜？`
- `這個狀況值得我繼續觀察嗎？`

Free result should not fully answer:

- `下一句到底怎麼回？`
- `要不要追問？`
- `怎麼不顯得太卑微？`

## 8. Paid Unlock Fake Door

Paid CTA:

```text
解鎖下一句怎麼回 — NT$49
```

The click is tracked as payment intent. Do not implement real payment in v0.

After click, show one of these internal-test messages:

```text
目前正在內測，留下 email / LINE，我們會送你一次完整分析。
```

or:

```text
這是內測中的付費功能。留下聯絡方式，我們會優先開放給你。
```

The fake door should measure intent, not charge users. Contact capture should be optional but strongly invited after the fake-door click.

Paid preview copy should emphasize action:

```text
完整分析會包含：
- 可能解讀與不確定性
- 你現在不要做什麼
- 主動推進 / 低壓試探 / 暫時拉開 三種回覆策略
```

## 9. Manual Fulfillment Flow

Manual or semi-manual v0 flow:

1. User submits input.
2. System stores input/event locally or in a simple export.
3. Free result may be generated automatically or manually.
4. Paid intent click is logged.
5. If user leaves contact, human can manually generate and send one complete result.

Manual fulfillment output should include:

- Deeper signal analysis.
- Uncertainty-preserving interpretation.
- Risk warning.
- What not to do.
- Three reply strategies:
  - `主動推進`
  - `低壓試探`
  - `暫時拉開`

Operational notes:

- Do not promise instant human fulfillment unless the team can actually provide it.
- If fulfillment is delayed, say so clearly.
- Do not expose raw conversation text in share cards or public artifacts.

## 10. Product Runtime Schema Draft

This is a product runtime schema draft, not a replacement for `schemas/signal_schema_v1.json`.

```json
{
  "free_result": {
    "temperature_score": 68,
    "state_label": "降溫觀望",
    "one_sentence_read": "他沒有完全冷掉，但主動性正在下降。",
    "observed_signals": [
      "回覆速度下降",
      "仍保留低成本互動"
    ],
    "uncertainty_note": "這可能代表投入度下降，但需要更多上下文。",
    "paid_teaser": "解鎖下一句怎麼回與三種互動策略。"
  },
  "paid_preview": {
    "headline": "解鎖下一句怎麼回",
    "price": "NT$49",
    "included_sections": [
      "可能解讀",
      "風險提醒",
      "不要做什麼",
      "三種回覆策略"
    ]
  },
  "paid_result": {
    "deeper_signal_analysis": "",
    "possible_interpretation": "",
    "risk_warning": "",
    "what_not_to_do": [],
    "reply_strategies": {
      "主動推進": "",
      "低壓試探": "",
      "暫時拉開": ""
    }
  },
  "share_card": {
    "temperature_label": "68°C",
    "state_label": "降溫觀望",
    "relationship_persona": "高敏感觀察者",
    "card_sentence": "你不是想太多，但也還沒到該放棄。"
  },
  "metadata": {
    "situation_type": "回訊變慢但看限動",
    "input_length": 120,
    "generated_at": "2026-05-16T00:00:00Z",
    "experiment_id": "ambiguous-temperature-fake-door-v0",
    "variant": "B"
  }
}
```

## 11. Product Prompt Requirements

A future product runtime prompt should be separate from:

```text
prompts/extraction_prompt_v1.md
```

Future prompt candidate:

```text
prompts/product_result_prompt_v0.md
```

Do not create the prompt file yet unless a later implementation task explicitly requests it.

Product prompt requirements:

- Output Traditional Chinese by default.
- Avoid deterministic claims.
- Preserve uncertainty.
- Generate `free_result`, `paid_preview`, `paid_result`, `share_card`, and `metadata` sections.
- Produce three reply strategies:
  - `主動推進`
  - `低壓試探`
  - `暫時拉開`
- Avoid therapy framing.
- Avoid cruel, toxic, or humiliating language.
- Avoid claiming to know the other person's true intent.
- Use Taiwan social-native wording without becoming sensational.
- Keep raw conversation text out of share-card output.

## 12. Event Tracking Model

Logging can be local JSONL in v0. Do not require analytics SaaS yet.

| Event | When it fires | Minimal properties | Why it matters |
| --- | --- | --- | --- |
| `page_view` | Landing page loads | `timestamp`, `variant`, `referrer`, `utm_source` | Measures top-of-funnel traffic and copy variant exposure. |
| `situation_selected` | User selects a situation type | `timestamp`, `variant`, `situation_type` | Compares initial interest across situation types. |
| `input_started` | User focuses or types in the text input | `timestamp`, `variant`, `situation_type`, `input_method` | Measures willingness to begin sharing context. |
| `input_submitted` | User clicks analyze with valid text | `timestamp`, `variant`, `situation_type`, `input_length` | Measures willingness to submit relationship context. |
| `analysis_completed` | Free result is shown | `timestamp`, `variant`, `situation_type`, `state_label`, `temperature_band` | Measures successful result delivery and allows result-type comparison. |
| `paid_unlock_clicked` | User clicks fake paid CTA | `timestamp`, `variant`, `situation_type`, `price`, `state_label` | Main payment-intent metric. |
| `contact_submitted` | User leaves email or LINE after fake door | `timestamp`, `variant`, `contact_type`, `situation_type` | Measures stronger intent and manual fulfillment pipeline. |
| `share_card_clicked` | User clicks share-card action | `timestamp`, `variant`, `state_label`, `temperature_band` | Measures viral loop interest without exposing raw text. |

Suggested JSONL event shape:

```json
{
  "event_name": "paid_unlock_clicked",
  "timestamp": "2026-05-16T00:00:00Z",
  "experiment_id": "ambiguous-temperature-fake-door-v0",
  "session_id": "local-anonymous-session-id",
  "variant": "B",
  "properties": {
    "situation_type": "已讀不回",
    "price": "NT$49",
    "state_label": "降溫觀望"
  }
}
```

## 13. Success Metrics And Thresholds

Initial directional thresholds:

```text
Input completion rate > 20%
Analyze click-through rate > 60% among input starters
Paid unlock click intent > 5%
Strong signal if paid unlock click intent > 10%
Contact submission after fake-door click > 20%
```

Metric definitions:

- Input completion rate: `input_submitted / page_view`.
- Analyze click-through rate: `input_submitted / input_started`.
- Paid unlock click intent: `paid_unlock_clicked / analysis_completed`.
- Contact submission after fake-door click: `contact_submitted / paid_unlock_clicked`.
- Situation conversion: paid unlock click intent segmented by `situation_type`.

Interpretation:

- Treat thresholds as directional, especially with small sample sizes.
- A high paid click rate with low contact submission may mean curiosity but weak commitment.
- A low input completion rate may indicate trust, privacy, or copy problems.
- Strong signal requires both input willingness and paid-action intent.

## 14. Landing Page Copy Variants

### Variant A: Brand-led

```text
曖昧溫度計
貼上對話，AI 幫你看他是在升溫、降溫，還是只是你想太多。
```

### Variant B: Pain-led

```text
他是真的忙，還是其實在冷掉？
貼上對話，AI 幫你判斷關係溫度和下一句怎麼回。
```

### Variant C: Action-led

```text
不知道下一句怎麼回？
AI 幫你分析曖昧訊號，給你三種不失控的回覆策略。
```

Recommended first test:

```text
Variant B: Pain-led
```

Reason:

- It maps directly to the strongest Sample Set v1 hook.
- It names the user's immediate uncertainty before introducing the product.
- It can attract both `回訊變慢但看限動` and broader `已讀不回` traffic.
- It still tees up paid action with `下一句怎麼回`.

## 15. Content Hooks To Drive Traffic

Initial hooks should focus on the three primary situations:

1. 他是真的忙，還是其實在冷掉？
2. 他已讀不回，卻還在發限動按讚？
3. 為什麼他昨天聊到半夜，今天只回哈哈？
4. 他回訊變慢，但還會看你限動，代表什麼？
5. 已讀不回超過一天，要不要再傳一次？
6. 忽冷忽熱的人，到底該不該繼續聊？
7. 他有空發文，卻沒空回你訊息？
8. 從回訊速度看曖昧是在升溫還是降溫。
9. 你不是想太多，這些互動細節真的有訊號。
10. 這種情況，下一句不要急著這樣回。

Avoid making `前任` or `備胎` the main traffic hooks in v0.

## 16. What Not To Build

Do not build in this experiment:

- Web app implementation.
- Backend.
- Real payment.
- UI system.
- Database.
- Analytics SaaS.
- Production code.
- Product runtime prompt execution.
- Product result generation code.
- Screenshot upload.
- OCR.
- Login.
- Subscription-first flow.
- Full chat app.
- Dashboard.
- Mobile app.
- Scraping or automatic source collection.

## 17. Safety / Trust Boundaries

The experiment must not frame the tool as therapy, diagnosis, fortune telling, or a way to know another person's hidden intent.

Avoid:

- `他一定不喜歡你`
- `他就是渣`
- `你應該分手`
- `他一定在騙你`
- `他就是把你當備胎`

Prefer:

- `這可能代表投入度下降，但需要更多上下文。`
- `目前訊號偏向低投入，但不能單靠一段對話下定論。`
- `你可以用低壓方式測試對方投入度。`
- `這段互動顯示主動性不穩，但仍可能受到時間、壓力或溝通習慣影響。`

Privacy/trust requirements:

- Warn users not to paste names, phone numbers, addresses, or identifiable details.
- Do not expose raw conversation text in share cards.
- Make fake-door payment status clear after click.
- Do not imply a real paid product is already fully available.

## 18. Technical Shape Without Final Stack Lock-In

This section describes reusable technical skeleton only. It does not choose the final stack.

Reusable pieces:

- Product runtime schema:
  - The draft shape in this spec can guide future generated result structure.
- Product result prompt:
  - Future candidate path: `prompts/product_result_prompt_v0.md`.
  - Do not create or execute it yet.
- Event model:
  - Minimal events are defined in this spec.
  - v0 logging can be local JSONL.
- Fake-door paywall state:
  - States: `free_result_shown`, `paid_unlock_clicked`, `contact_prompt_shown`, `contact_submitted`.
- Local event log:
  - Append-only JSONL is enough for v0 validation.
- Manual fulfillment export:
  - Export submitted input, situation type, result state, fake-door click, and contact status for human follow-up.

Formal stack decisions should be revisited later after the experiment spec is reviewed. Do not lock in a frontend framework, backend framework, database, analytics tool, or payment provider in this document.

## 19. Experiment Runbook

Before launch:

1. Review this spec in ChatGPT Web.
2. Choose one landing page copy variant.
3. Decide whether free results are manual, semi-manual, or generated by a throwaway internal process.
4. Prepare a local event log/export format.
5. Prepare manual fulfillment response templates.
6. Confirm privacy wording.

During test:

1. Drive traffic using 5-10 hooks focused on the three primary situation types.
2. Track every event in the minimal event model.
3. Segment results by copy variant and situation type.
4. Review submitted inputs for willingness, detail quality, and privacy risk.
5. Manually fulfill complete results for users who leave contact if promised.

After test:

1. Calculate input completion, analyze click-through, paid unlock click intent, and contact submission.
2. Compare the three situation types.
3. Review qualitative feedback and pasted input quality.
4. Decide whether to proceed, revise positioning, or stop.
5. Only then revisit technical stack and implementation scope.

## 20. Open Questions

1. Which of the three primary situation types drives the strongest paid unlock intent?
2. Does `NT$49` feel low-friction enough, or should the fake door test `NT$39` against it later?
3. Should free results be manual first, or should a future internal prompt generate them for speed?
4. How much privacy reassurance is needed before users paste relationship context?
5. Does Variant B outperform action-led copy, or do users convert better when `下一句怎麼回` is the headline?
6. What contact method performs better for manual fulfillment: email or LINE?
7. Should the fake-door message offer one free complete analysis, or only priority access?
8. How should the team handle inputs that imply emotional crisis or harmful relationship dynamics?
9. What minimum sample size is enough before interpreting situation-type conversion?
10. Should share-card clicks be part of v0 success, or only a secondary learning signal?
