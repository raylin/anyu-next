# Sample Set v1 Review Bundle

Date: 2026-05-16

## Overview

- Number of raw samples: 10
- Number of structured outputs: 10
- Provider used: Anthropic
- Source type: `dcard_manual`
- Validation status: all 10 outputs passed JSON parsing, schema validation, source/platform checks, score range checks, and Traditional Chinese presence check

## Signals Summary Table

| Sample | Theme | Emotion | Emotion Intensity | Shareability | Monetization | Retention | Top Product Ideas | Top Hooks |
|---|---|---:|---:|---:|---:|---|---|---|
| sample_001 | 回訊變慢但看限動 | 曖昧不確定焦慮 | 8 | 9 | 7 | 8 | 曖昧溫度計<br>限動已讀但不回解讀器 | 他是真的忙，還是其實在冷掉？<br>他看你限動卻不回訊息，代表什麼？ |
| sample_002 | 已讀不回 | 被忽視的憤怒與自尊拉扯 | 8 | 9 | 6 | 7 | 已讀不回原因分析器<br>社群活動vs回訊優先度解讀器 | 他已讀不回，卻還在發限動按讚？<br>怎麼追訊息才不會顯得卑微？ |
| sample_003 | 忽冷忽熱 | 關係失控感 | 8 | 9 | 7 | 8 | 時冷時熱行為分析器<br>對話節奏變化偵測器 | 他對你時冷時熱，到底是什麼意思？<br>你是他的真愛，還是他無聊時的消遣？ |
| sample_004 | 前任突然聯絡 | 關係失控感 | 8 | 9 | 6 | 7 | 前任行為解讀器<br>復合可能性評估工具 | 前任突然關心你，是想復合還是只是寂寞？<br>他回你限動真的有意思嗎？教你看懂前任訊號 |
| sample_005 | 曖昧對象只在半夜找你 | 關係定位不安 | 8 | 9 | 6 | 7 | 深夜訊息動機分析器<br>備胎指數檢測器 | 他只在深夜找你聊天，代表什麼？<br>你是真愛還是備胎？從聊天時間看出端倪 |
| sample_006 | 對方說忙但有時間發文 | 關係失控感 | 7 | 8 | 6 | 7 | 忙碌藉口檢測器<br>關係優先級分析器 | 他說很忙，但你看他還在發限動？<br>真忙 vs 假忙，這些細節會說話 |
| sample_007 | 對方只回表情符號或簡短句 | 關係失控感 | 7 | 8 | 6 | 7 | 對話品質分析器<br>聊天模式變化偵測器 | 為什麼他突然只回表情符號？<br>從「會接話」到「哈哈」，關係出了什麼問題？ |
| sample_008 | 分手後還看限動 | 分手後復合希望 | 7 | 8 | 6 | 7 | 前任行為解讀器<br>分手後復合機率計算機 | 前任一直看你限動，代表什麼？<br>他秒看你美照，是想復合還是習慣？ |
| sample_009 | 朋友以上戀人未滿 | 關係定位焦慮 | 8 | 9 | 6 | 7 | 曖昧關係定位分析器<br>進一步表白時機判斷器 | 他說不想破壞關係，到底是真心還是藉口？<br>朋友都說你們像情侶，為什麼他不承認？ |
| sample_010 | 不知道是不是被當備胎 | 關係失控感 | 8 | 9 | 6 | 7 | 備胎行為識別器<br>曖昧紅旗偵測器 | 你是他的唯一，還是其中之一？<br>備胎的10個明顯徵兆，你中了幾個？ |

## Detailed Signals

### sample_001 - 回訊變慢但看限動

Raw theme:
回訊變慢但看限動

Summary:
使用者因對方回訊變慢、仍觀看限動、上線卻不回而反覆解讀關係溫度。

Pain Point:
使用者無法判斷對方是忙、冷掉，還是在降低主動性，因此需要第三方協助解讀對話與互動訊號。

Social Behavior:
反覆查看對方上線狀態、限動觀看紀錄與回訊速度，並用這些微訊號推測對方投入度。

Identity Signal:
使用者擔心自己太主動、太在意，反映在曖昧關係中對自我價值與吸引力的不安。

Scores:
- emotion_intensity: 8
- shareability_score: 9
- monetization_score: 7
- retention_score: 8

Possible Products:
- 曖昧溫度計
- 限動已讀但不回解讀器
- 下一句怎麼回建議器

Possible Hooks:
- 他是真的忙，還是其實在冷掉？
- 他看你限動卻不回訊息，代表什麼？
- 你不是想太多，這些細節真的有訊號。

Observed Patterns:
- 回訊速度變慢會被使用者解讀成關係降溫訊號。
- 限動觀看與上線狀態容易成為曖昧焦慮的觸發點。
- 使用者需要的是降低不確定性的互動解讀，而不是單純情緒安慰。

### sample_002 - 已讀不回

Raw theme:
已讀不回

Summary:
使用者因對方已讀不回但仍活躍於社群而感到被故意忽視，陷入是否該再次傳訊的內心掙扎。

Pain Point:
使用者看到對方已讀不回但仍活躍於社群時，需要判斷這是故意忽視還是其他原因，同時避免在追問時顯得卑微或失去自尊。

Social Behavior:
監控對方社群動態（限動、按讚），用來驗證對方是否刻意不回訊息，並反覆考慮是否該再次傳訊。

Identity Signal:
使用者擔心顯得「卑微」，反映對於在關係中保持自尊與主動溝通之間的平衡焦慮。

Scores:
- emotion_intensity: 8
- shareability_score: 9
- monetization_score: 6
- retention_score: 7

Possible Products:
- 已讀不回原因分析器
- 社群活動vs回訊優先度解讀器
- 追訊息時機建議器

Possible Hooks:
- 他已讀不回，卻還在發限動按讚？
- 怎麼追訊息才不會顯得卑微？
- 已讀不回加上社群活躍，是故意的嗎？

Observed Patterns:
- 已讀不回搭配社群活躍會被解讀為故意忽視的強烈訊號。
- 使用者在追問與維持自尊之間存在明顯的內心衝突。
- 社群動態成為驗證對方注意力分配的重要指標。

### sample_003 - 忽冷忽熱

Raw theme:
忽冷忽熱

Summary:
使用者困惑於對方時冷時熱的對話模式，無法判斷對方的真實意圖與自己在對方心中的位置。

Pain Point:
使用者無法預測對方的互動模式，需要工具幫助識別時冷時熱行為是個性特質、情緒狀態，還是對方只是把自己當作備胎。

Social Behavior:
密切關注對方回訊的熱度變化，試圖從對話長度與互動頻率的落差中推測對方的真實意圖。

Identity Signal:
使用者擔心自己只是對方無聊時的消遣，反映出對自我價值與在關係中重要性的不確定。

Scores:
- emotion_intensity: 8
- shareability_score: 9
- monetization_score: 7
- retention_score: 8

Possible Products:
- 時冷時熱行為分析器
- 對話節奏變化偵測器
- 備胎機率計算機

Possible Hooks:
- 他對你時冷時熱，到底是什麼意思？
- 你是他的真愛，還是他無聊時的消遣？
- 為什麼他昨天聊到半夜，今天卻只回一句？

Observed Patterns:
- 時冷時熱的互動模式會讓使用者陷入持續的關係解讀焦慮。
- 對話熱度的巨大落差容易讓人質疑自己在對方心中的重要性。
- 使用者需要的是行為模式分析，而不是單純的情緒支持。

### sample_004 - 前任突然聯絡

Raw theme:
前任突然聯絡

Summary:
使用者因前任突然回覆限動並關心近況而感到困惑，無法判斷對方是想復合還是只是寂寞。

Pain Point:
使用者無法判斷前任突然聯絡的真實意圖，需要協助解讀前任行為背後的動機與可能性，避免錯誤解讀導致情緒起伏。

Social Behavior:
反覆分析前任的每個聯絡行為，試圖從限動回覆內容、頻率與時機推測復合可能性。

Identity Signal:
使用者在面對前任主動聯絡時展現出脆弱性，反映對過去關係的未完成情結與被選擇的不安。

Scores:
- emotion_intensity: 8
- shareability_score: 9
- monetization_score: 6
- retention_score: 7

Possible Products:
- 前任行為解讀器
- 復合可能性評估工具
- 前任聯絡意圖分析器

Possible Hooks:
- 前任突然關心你，是想復合還是只是寂寞？
- 他回你限動真的有意思嗎？教你看懂前任訊號
- 分手後他這樣做，代表什麼意思？

Observed Patterns:
- 前任主動聯絡會讓使用者重新燃起希望與困惑。
- 使用者需要第三方協助判斷前任行為的真實意圖。
- 限動互動成為前任重新建立聯繫的常見管道。

### sample_005 - 曖昧對象只在半夜找你

Raw theme:
曖昧對象只在半夜找你

Summary:
使用者因對方只在深夜主動聯繫且語氣曖昧，而困惑自己在對方心中的真實地位與價值。

Pain Point:
使用者無法判斷對方的深夜聯繫是真心興趣還是無聊打發時間，需要協助解讀對方行為模式背後的真實動機與關係定位。

Social Behavior:
在深夜收到曖昧訊息時會反覆思考對方動機，並在回應與保持距離之間猶豫不決。

Identity Signal:
使用者擔心自己只是對方無聊時的備胎選擇，反映對自身在關係中價值定位的不確定。

Scores:
- emotion_intensity: 8
- shareability_score: 9
- monetization_score: 6
- retention_score: 7

Possible Products:
- 深夜訊息動機分析器
- 備胎指數檢測器
- 曖昧行為模式解讀器

Possible Hooks:
- 他只在深夜找你聊天，代表什麼？
- 你是真愛還是備胎？從聊天時間看出端倪
- 半夜傳曖昧訊息的男生在想什麼？

Observed Patterns:
- 深夜聯繫容易讓人產生備胎焦慮與關係定位困惑。
- 時間模式會被解讀為對方重視程度的指標。
- 使用者在曖昧關係中會因害怕投入過深而產生回應猶豫。

### sample_006 - 對方說忙但有時間發文

Raw theme:
對方說忙但有時間發文

Summary:
使用者懷疑對方以忙碌為藉口不回訊息，因為觀察到對方仍有時間進行其他社交活動。

Pain Point:
使用者需要工具來客觀分析對方的真實優先級順序，區分「真忙」與「選擇性忙碌」的行為模式差異。

Social Behavior:
監控對方的社交媒體活動、發文時間、出席狀況，並與回訊頻率進行對比分析。

Identity Signal:
擔心自己在對方心中的優先級過低，需要透過行為證據來驗證關係地位。

Scores:
- emotion_intensity: 7
- shareability_score: 8
- monetization_score: 6
- retention_score: 7

Possible Products:
- 忙碌藉口檢測器
- 關係優先級分析器
- 社交時間分配追蹤器

Possible Hooks:
- 他說很忙，但你看他還在發限動？
- 真忙 vs 假忙，這些細節會說話
- 你在他心中排第幾？行為模式告訴你答案

Observed Patterns:
- 使用者會交叉比對對方的說詞與實際行為來判斷真實意圖。
- 社交媒體活動成為驗證對方忙碌程度的重要指標。
- 關係中的優先級焦慮需要客觀的行為分析工具來緩解。

### sample_007 - 對方只回表情符號或簡短句

Raw theme:
對方只回表情符號或簡短句

Summary:
使用者發現對方聊天變得敷衍，從以前的互動式對話變成短回覆，讓使用者感到像在獨角戲。

Pain Point:
使用者無法理解為什麼對方溝通模式突然改變，需要工具分析對話品質變化並提供應對建議，避免繼續單方面投入。

Social Behavior:
持續發送長訊息試圖維持對話品質，同時觀察並記住對方回覆模式的變化。

Identity Signal:
使用者將對話品質視為關係品質的指標，擔心自己變得無趣或對方已失去興趣。

Scores:
- emotion_intensity: 7
- shareability_score: 8
- monetization_score: 6
- retention_score: 7

Possible Products:
- 對話品質分析器
- 聊天模式變化偵測器
- 話題救援建議器

Possible Hooks:
- 為什麼他突然只回表情符號？
- 從「會接話」到「哈哈」，關係出了什麼問題？
- 你的長訊息為什麼換來短回覆？

Observed Patterns:
- 對話品質下降會被使用者解讀為關係降溫的明確訊號。
- 回覆長度不對等容易讓使用者產生獨角戲感受。
- 使用者會記住並比較過去的對話模式變化。

### sample_008 - 分手後還看限動

Raw theme:
分手後還看限動

Summary:
使用者因前任持續觀看限動、快速查看美照而反覆猜測對方是否仍有感情，還是只是習慣性行為。

Pain Point:
使用者無法區分前任的限動觀看行為是真實關注還是習慣性滑動，需要協助解讀分手後的微互動訊號以判斷復合可能性。

Social Behavior:
持續關注前任是否觀看限動，特別留意觀看速度與照片類型的關聯性，用這些微訊號推測前任心意。

Identity Signal:
使用者仍對前任抱有期待，透過限動互動尋求被在意的確認，反映對關係結束的不甘心。

Scores:
- emotion_intensity: 7
- shareability_score: 8
- monetization_score: 6
- retention_score: 7

Possible Products:
- 前任行為解讀器
- 分手後復合機率計算機
- 限動觀看模式分析器

Possible Hooks:
- 前任一直看你限動，代表什麼？
- 他秒看你美照，是想復合還是習慣？
- 分手後這些行為，其實有隱藏訊號

Observed Patterns:
- 分手後的限動觀看行為容易被解讀成復合訊號。
- 美照被快速觀看會強化使用者對前任仍有感情的推測。
- 使用者需要的是客觀分析分手後互動行為的意義，而非情感建議。

### sample_009 - 朋友以上戀人未滿

Raw theme:
朋友以上戀人未滿

Summary:
使用者處於曖昧關係中，對方享受情侶式互動但拒絕正式交往，造成關係定位不明的困擾。

Pain Point:
使用者無法確定自己在對方心中的定位，需要工具幫助判斷對方是真的想維持友誼，還是害怕承諾，或只是享受曖昧好處而不願負責。

Social Behavior:
持續參與情侶式的日常互動（單獨出遊、每日聊天），同時尋求外界對關係狀態的驗證與建議。

Identity Signal:
使用者渴望明確的關係標籤與承諾，反映對安全感和被重視程度的需求。

Scores:
- emotion_intensity: 8
- shareability_score: 9
- monetization_score: 6
- retention_score: 7

Possible Products:
- 曖昧關係定位分析器
- 進一步表白時機判斷器
- 對方真心度測試器

Possible Hooks:
- 他說不想破壞關係，到底是真心還是藉口？
- 朋友都說你們像情侶，為什麼他不承認？
- 享受曖昧好處卻不負責，這樣的人值得等嗎？

Observed Patterns:
- 享受情侶互動但拒絕承諾的行為會造成對方關係定位困擾。
- 外界觀感與當事人態度不一致時會加深使用者的混淆感。
- 使用者更需要的是對方真實意圖的判斷工具，而非單純的情感支持。

### sample_010 - 不知道是不是被當備胎

Raw theme:
不知道是不是被當備胎

Summary:
使用者在感受到曖昧示好與冷落循環中，懷疑自己被當成備胎，但仍無法抗拒對方的主動示好。

Pain Point:
使用者無法判斷自己在對方心中的真實位置，需要識別備胎行為模式的工具，以及在心軟循環中維持理性判斷的支援。

Social Behavior:
持續接受對方的曖昧示好，即使明知對方同時與多人互動，在對方主動時很難拒絕或保持距離。

Identity Signal:
使用者認知到備胎可能性但仍選擇接受，反映對關係控制力不足與自我價值設定的掙扎。

Scores:
- emotion_intensity: 8
- shareability_score: 9
- monetization_score: 6
- retention_score: 7

Possible Products:
- 備胎行為識別器
- 曖昧紅旗偵測器
- 心軟防護提醒器

Possible Hooks:
- 你是他的唯一，還是其中之一？
- 備胎的10個明顯徵兆，你中了幾個？
- 為什麼明知是備胎，還是會心軟？

Observed Patterns:
- 消失又回來的循環模式容易讓使用者產生備胎焦慮。
- 明知對方同時與多人互動，仍難以在對方主動時保持理性。
- 使用者需要的是識別不健康關係模式的工具，而非單純的情感建議。

## Cross-Sample Observations

Light mechanical aggregation only. No strategic product recommendations are made here.

### Emotion Labels Observed

- 關係失控感: 5
- 曖昧不確定焦慮: 1
- 被忽視的憤怒與自尊拉扯: 1
- 關係定位不安: 1
- 分手後復合希望: 1
- 關係定位焦慮: 1

### Score Distribution

- emotion_intensity:
  - 7: 3
  - 8: 7

- shareability_score:
  - 8: 3
  - 9: 7

- monetization_score:
  - 6: 8
  - 7: 2

- retention_score:
  - 7: 8
  - 8: 2

### Repeated Product Ideas

Exact repeats:
- 前任行為解讀器: 2

Similar clusters:
- 曖昧/關係溫度判斷: 曖昧溫度計, 時冷時熱行為分析器, 關係優先級分析器, 曖昧關係定位分析器
- 已讀不回/回訊分析: 限動已讀但不回解讀器, 已讀不回原因分析器, 忙碌藉口檢測器, 對話品質分析器
- 下一步互動建議: 下一句怎麼回建議器, 追訊息時機建議器, 話題救援建議器, 進一步表白時機判斷器
- 前任/復合解讀: 前任行為解讀器, 復合可能性評估工具, 分手後復合機率計算機, 限動觀看模式分析器
- 備胎/紅旗偵測: 備胎機率計算機, 備胎指數檢測器, 備胎行為識別器, 曖昧紅旗偵測器

### Repeated Hook Patterns

- 限動互動解讀: 5
- 忙碌 vs 冷淡判斷: 2
- 已讀不回/不回訊息: 2
- 前任/復合訊號: 2
- 備胎焦慮: 2
- 關係定位不明: 2

### Potential Issues For ChatGPT Review

- `關係失控感` appears repeatedly, which may be accurate but could reduce emotion-label comparability.
- Monetization scores are clustered at 6-7, so prioritization by monetization may be hard without further calibration.
- Shareability scores are consistently high at 8-9, which may reflect the relationship category more than sample-specific differences.
- Some hooks are strong but may lean sensational, especially around 備胎 framing.
- Product ideas are concrete, but several are variations of relationship interpretation tools and may need grouping during review.
