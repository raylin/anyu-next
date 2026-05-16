# Product Spec v0 — 曖昧溫度計

Date: 2026-05-16

Status: Draft for ChatGPT / human review

## 1. One-Liner

曖昧溫度計是一個 AI 曖昧互動解讀工具，幫使用者判斷關係溫度、互動訊號與下一步回覆策略。

## 2. Target User

主要使用者是正在經歷曖昧、未定義關係、前任互動或聊天節奏變化的人，尤其是會反覆解讀訊息、限動、已讀、回覆速度與對方主動性的使用者。

典型使用者狀態：

- 不確定對方是忙、冷掉，還是只是不夠投入。
- 想知道已讀不回、忽冷忽熱、只在半夜找人聊天代表什麼。
- 想回訊息，但怕太主動、太卑微、太快暴露在意。
- 需要一個像聰明朋友的第三方視角，而不是治療師或算命師。

## 3. Core User Anxiety

核心焦慮不是「我想知道答案」而已，而是：

```text
我不知道自己現在該怎麼做，怕多做一步就失去主導權，少做一步又錯過機會。
```

Sample Set v1 反覆出現的焦慮包括：

- 對方回訊變慢，但仍看限動或發文。
- 對方已讀不回，卻有其他社群活動。
- 對方忽冷忽熱，讓使用者無法穩定判斷關係定位。
- 使用者擔心自己是不是太主動、太好約、太容易心軟。
- 使用者懷疑自己是不是備胎、低優先級、無聊時才被想到的人。

## 4. Product Promise

產品承諾：

```text
把曖昧中的模糊訊號整理成可判斷的關係溫度，並給使用者一個不失控的下一步。
```

產品不承諾知道對方真實意圖。產品只根據使用者提供的文字，分析互動模式、可觀察訊號、風險與下一步選項。

## 5. MVP User Flow

1. User lands on page.
2. User pastes conversation text or describes situation.
3. User optionally selects situation type:
   - 回訊變慢
   - 已讀不回
   - 忽冷忽熱
   - 朋友以上戀人未滿
   - 不知道是不是備胎
   - 前任突然聯絡
4. User clicks analyze.
5. Free result is shown.
6. Paid unlock offers deeper analysis and next-message suggestions.

Core conversion moment:

```text
免費結果讓使用者覺得「它懂我的狀況」。
付費解鎖讓使用者覺得「我現在知道下一句怎麼回」。
```

## 6. Input Types

v0 只支援文字輸入。

Allowed v0 inputs:

- 手動貼上一小段對話。
- 手動描述目前情境。
- 加上可選情境類型。

Out of scope for v0:

- 截圖上傳
- OCR
- 聊天紀錄同步
- 社群帳號連接

Reasoning:

- Text input is enough to validate early demand.
- OCR adds implementation complexity.
- Screenshot upload introduces higher privacy risk.
- Manual text encourages users to curate the relevant context.

## 7. Free Output

Free output should provide insight and curiosity, not full decision support.

Free result includes:

- 曖昧溫度 score, e.g. `68/100`
- relationship state label
- one-sentence conclusion
- top 1-2 observed signals
- paid unlock teaser

Example:

```text
曖昧溫度：68/100
狀態：降溫觀望
一句話：他沒有完全冷掉，但主動性正在下降。
主要訊號：回覆速度下降，但仍保留低成本互動。
解鎖下一步：看你現在適合追問、低壓試探，還是暫時拉開。
```

Recommended free labels:

- 升溫試探
- 穩定曖昧
- 降溫觀望
- 低投入互動
- 高風險心軟
- 關係定位不明

## 8. Paid Output

Paid output should be decision-support oriented, not just longer explanation.

Paid result includes:

- Deeper signal analysis.
- Possible interpretation with uncertainty.
- Risk warning.
- What not to do.
- Next message suggestions.
- Three strategy modes:
  - 主動推進
  - 低壓試探
  - 暫時拉開
- Optional share card.

Example paid output shape:

```text
可能解讀：
目前訊號偏向「對方仍保留互動，但主動性不足」。這可能代表投入度下降，也可能只是近期忙碌；不能只靠一段對話下定論。

風險提醒：
你現在最容易做的錯誤是連續追問，讓焦點從「對方是否投入」變成「你是否太急」。

不要做：
不要立刻傳長訊息質問，也不要用反諷測試對方。

下一句怎麼回：
主動推進：「我發現我們最近聊天變少了，是你最近真的比較忙，還是我想太多？」
低壓試探：「那你忙完再跟我說，我先去做自己的事。」
暫時拉開：「好，那你先忙，我這幾天也剛好有點事。」
```

## 9. Result Schema Draft

This is a product-result draft, not a repository schema contract.

```json
{
  "temperature_score": 68,
  "state_label": "降溫觀望",
  "one_sentence_read": "他沒有完全冷掉，但主動性正在下降。",
  "observed_signals": [
    "回覆速度下降",
    "仍保留低成本互動"
  ],
  "uncertainty_note": "這可能代表投入度下降，但需要更多上下文。",
  "risk_warning": "現在連續追問可能讓你看起來失去節奏。",
  "free_teaser": "解鎖下一句怎麼回與三種互動策略。",
  "paid_analysis": {
    "likely_patterns": [],
    "what_not_to_do": [],
    "strategy_modes": {
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
  }
}
```

## 10. Scoring Model Draft

`temperature_score` should represent perceived relationship warmth, not certainty of romantic interest.

Draft scoring inputs:

- Response momentum: 回覆速度、主動開話題、是否延續對話。
- Interaction quality: 是否只回短句、表情符號、敷衍語氣。
- Consistency: 是否忽冷忽熱、是否突然消失又回來。
- Signal conflict: 是否訊息冷但限動互動熱，或嘴上說忙但社群活躍。
- User agency risk: 使用者是否正在失去節奏、過度追問、過度心軟。

Draft score bands:

- `0-20`: 幾乎無互動或明顯低投入。
- `21-40`: 低溫互動，對方投入有限。
- `41-60`: 不穩定觀望，訊號混雜。
- `61-80`: 有曖昧溫度，但需要測試主動性。
- `81-100`: 高互動溫度，但仍需避免過度解讀。

Important scoring rule:

```text
高分不等於「他一定喜歡你」。
低分也不等於「他一定不喜歡你」。
分數只表示目前可觀察互動訊號的溫度。
```

## 11. Paywall Strategy

Recommended paywall:

```text
Free = insight / curiosity
Paid = action / next step
```

Do not paywall only longer analysis. Paywall the moment where the user wants to act:

- 下一句怎麼回
- 要不要追問
- 要不要拉開
- 怎麼不顯得太卑微
- 怎麼試探對方投入度

Free output should make the user feel seen. Paid output should reduce immediate decision anxiety.

## 12. Pricing Hypothesis

Initial v0 pricing:

- `NT$39`: single full analysis.
- `NT$79`: full analysis + 3 reply strategies.
- `NT$199`: 5 analysis credits.

Do not start subscription-first in v0.

Rationale:

- Use impulse-payment pricing for urgent uncertainty.
- Keep the first purchase low-friction.
- Credits can test repeat usage without forcing a subscription promise.
- Subscription should wait until retention is proven through repeated message-analysis behavior.

## 13. Viral / Sharing Loop

The product should create a shareable result card that exposes no raw conversation text.

Result card concept:

```text
我的曖昧溫度：68°C
狀態：降溫觀望
戀愛人格：高敏感觀察者
一句話：你不是想太多，但也還沒到該放棄。
```

Share loop principles:

- Share the identity/result, not private conversation.
- Make the card understandable without context.
- Make it safe to post on Threads or Instagram Stories.
- Include a soft CTA such as `測你的曖昧溫度`.

Potential card labels:

- 高敏感觀察者
- 低壓試探型
- 一秒心軟型
- 已讀偵探型
- 關係定位卡關型

## 14. Landing Page Copy Draft

Hero headline:

```text
曖昧溫度計
```

Subheadline:

```text
貼上對話或描述情況，讓 AI 幫你判斷關係溫度、互動訊號，和下一句怎麼回。
```

Input placeholder:

```text
例如：他昨天聊到半夜，今天卻只回哈哈。我不知道他是忙，還是其實冷掉了……
```

Primary CTA:

```text
分析我的曖昧溫度
```

Free-result teaser:

```text
免費看關係溫度與主要訊號；解鎖下一步回覆策略。
```

Trust copy:

```text
不算命、不下定論，只根據你提供的互動內容分析可觀察訊號。
```

## 15. First 10 Content Hooks

1. 他是真的忙，還是其實在冷掉？
2. 他已讀不回，卻還在發限動按讚？
3. 為什麼他昨天聊到半夜，今天只回哈哈？
4. 你是他的唯一，還是其中之一？
5. 他看你限動卻不回訊息，代表什麼？
6. 朋友都說你們像情侶，為什麼他不承認？
7. 他只在半夜找你聊天，是曖昧還是無聊？
8. 前任突然回你限動，是想復合還是只是習慣？
9. 你不是想太多，這些細節真的有訊號。
10. 這種情況，下一句不要急著這樣回。

## 16. What Not To Build

Do not build in v0:

- Screenshot upload.
- OCR.
- Login.
- Full chat app.
- Therapy chatbot.
- Long-term relationship coach.
- Dashboard.
- Social network.
- Mobile app.
- Subscription-first model.
- Backend-heavy account system.
- Conversation history sync.
- Automatic scraping or collection.

## 17. Safety / Trust Boundaries

The product should avoid deterministic claims such as:

- `他一定不喜歡你`
- `他就是渣`
- `你應該分手`
- `他一定在騙你`
- `他就是把你當備胎`

Prefer uncertainty-preserving phrasing:

- `這可能代表投入度下降，但需要更多上下文。`
- `目前訊號偏向低投入，但不能單靠一段對話下定論。`
- `你可以用低壓方式測試對方投入度。`
- `這段互動顯示主動性不穩，但仍可能受到時間、壓力或溝通習慣影響。`

Trust boundaries:

- Do not present analysis as truth about the other person.
- Do not diagnose users or the other person.
- Do not push breakup, confession, or confrontation as universal advice.
- Do not frame every uncertain interaction as manipulation.
- Do not store or expose raw conversation text in share cards.

## 18. Success Metrics

Early validation metrics:

- Input completion rate: users who paste text or describe a situation.
- Analyze click-through rate.
- Free-result completion rate.
- Paid unlock click-through rate.
- Payment conversion rate by situation type.
- Share card generation rate.
- Share card posting or copy rate, if measurable.
- Repeat analysis rate within 7 days.
- Credit-pack purchase rate.

Qualitative success signals:

- Users say the result feels accurate without feeling cruel.
- Users say the paid output helped them decide what to do next.
- Users reuse the product when new messages arrive.
- Users share result cards without exposing private conversation.

## 19. First Experiment Plan

Experiment goal:

Validate whether relationship uncertainty converts better when the free result gives insight and the paid result gives action.

Experiment shape:

1. Create a lightweight landing page mock or manual prototype.
2. Drive traffic using 5-10 Taiwan social-native hooks.
3. Let users paste text or describe one situation.
4. Return a manually or semi-manually generated free result.
5. Offer paid unlock copy for `下一句怎麼回`.
6. Track intent signals before building product infrastructure.

Minimum evidence to proceed:

- Users complete the input instead of bouncing.
- Users understand the free temperature result.
- Users click or express interest in paid next-message support.
- At least some users would pay for `下一句怎麼回`, not only read analysis.

Do not build payments first. A manual payment-intent button or waitlist-style test is enough for v0 validation.

## 20. Open Questions

1. Which situation type converts best: 已讀不回, 忽冷忽熱, 回訊變慢, 備胎焦慮, or 前任突然聯絡?
2. Is `曖昧溫度` enough as the main free score, or does the result need a second score for `下一步風險`?
3. Does the paid offer convert better at `NT$39` single analysis or `NT$79` with three reply strategies?
4. How much context should users paste before the result quality feels trustworthy?
5. Should result cards use Celsius language such as `68°C`, or plain `68/100` to avoid feeling too gimmicky?
6. How can tone stay sharp and social-native without becoming deterministic or cruel?
7. Are users willing to paste private conversations if the product clearly says text is not shown on share cards?
8. Does repeat usage come from new messages in the same relationship, or new situations with different people?
9. Which paid strategy mode is most valuable: 主動推進, 低壓試探, or 暫時拉開?
10. Should Product Spec v0 remain focused on曖昧 only, or include前任 interactions as a secondary category?
