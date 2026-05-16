# Product Result v0 Review Bundle

Date: 2026-05-16

## Overview

This bundle reviews the first Product Runtime Track artifacts for `曖昧溫度計`.

Created artifacts:

- Product runtime prompt: `prompts/product_result_prompt_v0.md`
- Product runtime schema: `schemas/product_result_schema_v0.json`
- Raw product samples: `outputs/product_samples/raw/`
- Generated product outputs: `outputs/product_samples/generated/`
- Dev-only generator: `scripts/generate_product_sample.py`

This track is separate from the Research Signal Track:

- `prompts/extraction_prompt_v1.md`
- `schemas/signal_schema_v1.json`

## Schema Summary

Top-level product result schema:

```json
{
  "free_result": {},
  "insight_layer": {},
  "paid_preview": {},
  "paid_result": {},
  "share_card": {},
  "personal_pattern_candidate": {},
  "metadata": {}
}
```

Key schema requirements:

- `free_result.temperature_score` is an integer from 0 to 100.
- `insight_layer` captures lightweight psychology-informed resonance without academic framing.
- `paid_preview` anchors the fake-door CTA around `解鎖下一句怎麼回` and `NT$49`.
- `paid_result.reply_strategies` requires exactly `主動推進`, `低壓試探`, and `暫時拉開`.
- `share_card` must not include raw conversation text.
- `personal_pattern_candidate` captures a non-diagnostic candidate insight for future personalization.
- `metadata.experiment_id` is fixed to `ambiguous-temperature-fake-door-v0`.

## Prompt Summary

The prompt positions the model as:

```text
一個懂人際互動模式、語氣像聰明朋友的 AI 產品輸出引擎。
```

The prompt instructs the model to:

- Return valid JSON only.
- Use Traditional Chinese for user-facing values.
- Keep tone lightweight, emotionally resonant, and Taiwan social-native.
- Add subtle psychology-informed insight without textbook language.
- Avoid deterministic claims, therapy framing, diagnosis, and claims about hidden intent.
- Generate free result, insight layer, paid preview, paid result, share card, personal pattern candidate, and metadata.
- Keep raw conversation text out of share cards.
- Avoid sensational, cruel, academic, or authority-heavy wording.

The prompt needed several calibration passes because live outputs initially drifted into overclaiming phrases such as `真實意圖`, `真實原因`, `出局`, and `專業建議`. The final prompt includes a forbidden-substring self-check.

## Sample Input Summaries

| Sample | Situation Type | Theme |
| --- | --- | --- |
| `product_sample_001` | `已讀不回` | User asked about meeting, got left on read, then saw social activity. |
| `product_sample_002` | `忽冷忽熱` | User had a warm late-night chat, then received cold short replies the next day. |
| `product_sample_003` | `回訊變慢但看限動` | User sees slower replies while the other person still watches stories. |

## Generated Output Summaries

| Sample | Temperature | State | Insight Principle | Pattern Confidence |
| --- | ---: | --- | --- | --- |
| `product_sample_001` | 35 | `降溫觀望` | `模糊訊號放大` | `medium` |
| `product_sample_002` | 35 | `急速降溫` | `親密後的距離調整` | `medium` |
| `product_sample_003` | 42 | `低溫保留` | `低成本互動訊號` | `medium` |

## Observed Quality Notes

- The generated outputs validate against `schemas/product_result_schema_v0.json`.
- The outputs preserve uncertainty and avoid claiming certainty about the other person.
- Share cards do not include full raw conversation text.
- `personal_pattern_candidate` entries are framed as medium-confidence observations, not diagnosis.
- The `insight_layer` creates a stronger emotional bridge than a plain free result alone.
- Paid previews now emphasize action and next steps rather than only longer analysis.

## Issues For ChatGPT Review

1. Some product copy may still be too emotionally polished for an early fake-door test; review whether it should be rougher and more direct.
2. `personal_pattern_candidate.should_store` is `true` for all three generated samples; review whether v0 should be more conservative.
3. Share-card personas are promising but need tone review to avoid feeling too exposing or overly intimate.
4. Temperature scores are clustered in the 35-42 range for all three negative/uncertain examples; review whether this is useful or too narrow.
5. Prompt currently uses a forbidden-substring list to control tone; future implementation may need validator or post-generation checks.

## Full Generated JSON

### product_sample_001.result.json

```json
{
  "free_result": {
    "temperature_score": 35,
    "state_label": "降溫觀望",
    "one_sentence_read": "對方目前處於低回應狀態，但仍保持正常社交活動，可能在刻意保持距離。",
    "observed_signals": [
      "約會邀請已讀不回",
      "持續發限動保持社交活躍",
      "對其他人的貼文按讚互動"
    ],
    "uncertainty_note": "單次互動無法完全確定對方的投入意願，需要更多觀察。",
    "paid_teaser": "想知道這種情況下，怎麼回應既不失尊嚴又能測試對方態度？"
  },
  "insight_layer": {
    "title": "被動回應的矛盾訊號",
    "explanation": "最讓人困擾的不是明確拒絕，而是這種「還在線上但對你沒回應」的模糊狀態。當你看到他發限動、按別人讚，卻對你的邀請沉默，這種對比會放大不確定感。",
    "principle": "模糊訊號放大",
    "user_facing": true
  },
  "paid_preview": {
    "headline": "解鎖下一句怎麼回",
    "price": "NT$49",
    "included_sections": [
      "深度訊號解讀",
      "三種回應策略",
      "風險提醒",
      "不該做的事"
    ],
    "preview_copy": "這種情況繼續追問風險很高，但完全不動又可能錯過機會。解鎖獲得保留尊嚴的行動方案。"
  },
  "paid_result": {
    "deeper_signal_analysis": "對方的行為模式顯示：有能力回覆但選擇不回覆你的邀請，同時維持正常社交活動。這通常代表對約會邀請有所保留，但不一定是完全拒絕，可能在觀望或猶豫中。",
    "possible_interpretation": "目前訊號偏向投入度下降，對方可能覺得節奏太快，或是對約會有顧慮，但仍保留一定互動可能性。",
    "risk_warning": "直接追問約會安排風險較高，容易被解讀為施壓，可能讓對方更想迴避。",
    "what_not_to_do": [
      "立刻再傳一次約會邀請",
      "質問為什麼不回訊息",
      "提到看見他發限動或按讚的事",
      "表現出受傷或不滿的情緒"
    ],
    "reply_strategies": {
      "主動推進": "過幾天後用輕鬆話題重新開啟對話，不提約會，先重建互動節奏，例如：「剛看到一個有趣的東西想分享」",
      "低壓試探": "用不需要明確回應的內容測試，像是分享日常趣事或問輕鬆問題，觀察回應熱度",
      "暫時拉開": "暫停主動聯繫一週，給彼此空間，如果對方有興趣會主動聯絡，如果沒有也能避免過度投入"
    }
  },
  "share_card": {
    "temperature_label": "35°C",
    "state_label": "降溫觀望",
    "relationship_persona": "在線但保持距離型",
    "card_sentence": "對方還在，但對你暫時降溫中"
  },
  "personal_pattern_candidate": {
    "pattern": "使用者對「低成本互動」很敏感，例如發限動、按讚等行為，容易把這些當成關係訊號進行對比分析",
    "confidence": "medium",
    "evidence": "使用者注意到對方發限動和按讚行為，並將此與未回覆自己訊息做對比",
    "should_store": true,
    "user_facing_summary": "你比較會注意對方在社交媒體上的活動，並用這些來判斷關係狀態"
  },
  "metadata": {
    "situation_type": "已讀不回",
    "input_length": 73,
    "generated_at": "2026-05-16T09:38:49.948340+00:00",
    "experiment_id": "ambiguous-temperature-fake-door-v0",
    "variant": "B",
    "model_provider": "anthropic",
    "model_name": "claude-sonnet-4-20250514"
  }
}
```

### product_sample_002.result.json

```json
{
  "free_result": {
    "temperature_score": 35,
    "state_label": "急速降溫",
    "one_sentence_read": "從深夜曖昧到隔天冷淡，這種劇烈溫差通常代表對方在重新調整距離。",
    "observed_signals": [
      "昨夜聊到半夜且語氣曖昧",
      "今日回覆變成敷衍式短句",
      "情緒溫度急劇下降"
    ],
    "uncertainty_note": "單日的冷熱變化可能有很多原因，需要觀察接下來幾天的互動模式才能判斷趨勢。",
    "paid_teaser": "想知道這種突然降溫背後可能的原因，以及如何優雅回應？"
  },
  "insight_layer": {
    "title": "曖昧後的冷卻期",
    "explanation": "當互動突然從很熱變很冷，往往不是你說錯什麼，而是對方在消化昨晚的親近感。有些人在太過親密後會本能地後退一點，重新找回控制感。",
    "principle": "親密後的距離調整",
    "user_facing": true
  },
  "paid_preview": {
    "headline": "解鎖下一句怎麼回",
    "price": "NT$49",
    "included_sections": [
      "降溫原因深度分析",
      "三種回應策略",
      "避雷指南",
      "後續觀察重點"
    ],
    "preview_copy": "這種冷熱循環很常見，但回應方式決定了關係走向。"
  },
  "paid_result": {
    "deeper_signal_analysis": "這種「親密後退縮」的模式在曖昧階段很常見。對方可能覺得昨晚太投入了，今天刻意保持距離來平衡一下。也可能是白天的環境或心境不適合延續昨晚的氛圍。",
    "possible_interpretation": "目前訊號顯示對方正在調節互動溫度，可能是想要控制節奏，也可能是對昨晚的親近感到一點不安。但這不一定代表後悔或失去興趣。",
    "risk_warning": "急著追問「是不是我說錯什麼」可能會讓對方感到壓力，反而推遠距離。",
    "what_not_to_do": [
      "不要直接質問為什麼態度變冷",
      "不要模仿對方也變得敷衍",
      "不要追問昨晚聊天內容的後續"
    ],
    "reply_strategies": {
      "主動推進": "自然地分享今天的有趣事情，保持昨晚的溫度但不刻意提及昨晚的對話，讓他知道你的狀態很穩定。",
      "低壓試探": "用輕鬆的話題測試他的回應長度，比如「今天好累，你呢？」觀察他是否只會短回。",
      "暫時拉開": "今天就不主動聊了，給彼此一點空間，明天再用平常心互動，看他是否會主動一些。"
    }
  },
  "share_card": {
    "temperature_label": "35°C",
    "state_label": "急速降溫",
    "relationship_persona": "曖昧溫差體質",
    "card_sentence": "從深夜曖昧到隔天冷淡，這種劇烈溫差讓人摸不透。"
  },
  "personal_pattern_candidate": {
    "pattern": "使用者對互動溫度變化很敏感，容易將對方的冷淡歸因於自己的表現。",
    "confidence": "medium",
    "evidence": "立即懷疑是否自己說錯話，顯示對關係變化的敏感度較高。",
    "should_store": true,
    "user_facing_summary": "你對關係溫度的變化很敏銳，這讓你能快速察覺互動的微妙變化。"
  },
  "metadata": {
    "situation_type": "忽冷忽熱",
    "input_length": 61,
    "generated_at": "2026-05-16T09:38:49.948240+00:00",
    "experiment_id": "ambiguous-temperature-fake-door-v0",
    "variant": "B",
    "model_provider": "anthropic",
    "model_name": "claude-sonnet-4-20250514"
  }
}
```

### product_sample_003.result.json

```json
{
  "free_result": {
    "temperature_score": 42,
    "state_label": "低溫保留",
    "one_sentence_read": "他保持著最低成本的關注方式，既沒有完全離開，也沒有積極靠近。",
    "observed_signals": [
      "回訊息速度明顯變慢",
      "持續關注限動但不主動互動",
      "長時間上線但不回覆"
    ],
    "uncertainty_note": "單從這些行為還無法確定他的投入度變化原因，可能是忙碌、猶豫，或是互動模式轉變。",
    "paid_teaser": "想知道這種「看限動但慢回訊」背後的訊號意義，以及該怎麼應對嗎？"
  },
  "insight_layer": {
    "title": "低成本互動的曖昧地帶",
    "explanation": "真正讓人焦慮的，通常不是明確拒絕，而是那種還留著一點點可能性的模糊感。看限動是最低成本的關注方式，既能保持連結，又不用承擔回應的壓力。",
    "principle": "低成本互動訊號",
    "user_facing": true
  },
  "paid_preview": {
    "headline": "解鎖下一句怎麼回",
    "price": "NT$49",
    "included_sections": [
      "深度訊號解讀",
      "三種應對策略",
      "避免踩雷提醒"
    ],
    "preview_copy": "別讓這種模糊狀態繼續消耗你，學會讀懂訊號並做出合適回應。"
  },
  "paid_result": {
    "deeper_signal_analysis": "他目前的行為模式顯示投入度下降，但還沒有完全退出。看限動是一種「安全距離」的關注，能了解你的近況又不用立即回應。這通常出現在關係轉換期，可能是生活忙碌、感情猶豫，或是在重新評估這段關係的位置。",
    "possible_interpretation": "目前訊號偏向互動意願降低，但保留基本關注。他可能在調整對這段關係的期待，或是面臨其他生活優先順序。不過，持續看限動代表你還在他的關注範圍內。",
    "risk_warning": "避免過度解讀每個行為，也不要用頻繁傳訊來測試他的反應，這可能會加速關係降溫。",
    "what_not_to_do": [
      "連續傳多則訊息追問為什麼慢回",
      "在限動暗示他有看沒回",
      "突然變得很冷淡來「以牙還牙」",
      "頻繁發限動想引起他的反應"
    ],
    "reply_strategies": {
      "主動推進": "「最近好像都很忙？有空的話想約出來聊聊」- 直接但不逼迫，給他選擇的空間。",
      "低壓試探": "「分享一個有趣的事給你」然後分享日常，觀察他的回應熱度和速度變化。",
      "暫時拉開": "暫時降低主動聯繫的頻率，專注於自己的生活，讓他有機會主動。"
    }
  },
  "share_card": {
    "temperature_label": "42°C",
    "state_label": "低溫保留",
    "relationship_persona": "被溫柔懸掛的人",
    "card_sentence": "他用最低成本的方式關注著你，既沒走遠，也沒靠近。"
  },
  "personal_pattern_candidate": {
    "pattern": "使用者對「低成本互動」很敏感，會仔細觀察對方的線上行為與回覆頻率差異，容易在模糊訊號中尋找關係確定感。",
    "confidence": "medium",
    "evidence": "注意到對方看限動但慢回訊的矛盾行為，並且會觀察對方上線時間與回覆行為的關聯",
    "should_store": true,
    "user_facing_summary": "你很善於觀察細節訊號，但有時候可能會讓自己陷入過度分析"
  },
  "metadata": {
    "situation_type": "回訊變慢但看限動",
    "input_length": 60,
    "generated_at": "2026-05-16T09:38:49.948020+00:00",
    "experiment_id": "ambiguous-temperature-fake-door-v0",
    "variant": "B",
    "model_provider": "anthropic",
    "model_name": "claude-sonnet-4-20250514"
  }
}
```
