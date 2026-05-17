# External Dcard JSON Calibration v0 Review Bundle

## 1. Overview

This bundle calibrates the product direction using externally collected Dcard-like JSON rather than further Dcard automation.

## 2. Input Source And Parsing

- input path: `ai-collaboration/output-0517.jsonl`
- parsed format: `jsonl`
- input posts: `20`
- processed posts: `20`
- skipped posts: `0`

## 3. Data Minimization / Privacy Handling

- did not store `school`
- did not store `department`
- did not store comment ids
- did not store full raw posts
- did not store full raw comment threads
- stored only title, ids, counts, short summaries, and comment-signal abstractions

## 4. Dataset Summary

- top candidate product families:
- `伴侶價值觀雷達`: `5`
- `關係紅旗雷達`: `4`
- `親密落差解讀`: `3`
- `下一句怎麼回`: `3`
- `Relationship Radar general`: `2`

## 5. Theme Distribution

- `伴侶價值觀落差`: `5`
- `親密需求落差`: `3`
- `關係邊界`: `4`
- `交友軟體策略`: `1`
- `曖昧不確定`: `5`
- `擇偶條件焦慮`: `1`
- `uncertain`: `1`

## 6. Relationship Stage Distribution

- `交往`: `9`
- `婚姻`: `7`
- `曖昧`: `2`
- `uncertain`: `1`
- `婚前`: `1`

## 7. Core Question Type Distribution

- `大家怎麼看`: `3`
- `經驗分享`: `5`
- `uncertain`: `3`
- `我該怎麼做`: `4`
- `這正常嗎`: `1`
- `要不要繼續`: `2`
- `他是什麼意思`: `2`

## 8. Product Family Mapping

- `伴侶價值觀雷達`: `5`
- `親密落差解讀`: `3`
- `關係紅旗雷達`: `4`
- `交友軟體策略`: `1`
- `下一句怎麼回`: `3`
- `Relationship Radar general`: `2`
- `曖昧溫度計`: `2`

## 9. Action Pressure vs Monetization Strength

- action pressure:
- `medium`: `6`
- `low`: `5`
- `high`: `9`
- monetization strength:
- `medium`: `9`
- `high`: `9`
- `low`: `2`

## 10. Shareability Strength

- `high`: `4`
- `medium`: `12`
- `low`: `4`

## 11. Comment Signal Findings

Common signals seen in high-like comment summaries:

- `有女生在床上也是服務型的嗎？`
  - signal: 伴侶成長節奏、責任感或未來想像開始不同步。
  - action pressure: `medium`
  - monetization: `medium`
  - product family: `伴侶價值觀雷達`
  - why it matters: 相處很久了，才發現你們其實在看不同的未來？
- `另一半沒有內涵真的很累`
  - signal: 伴侶成長節奏、責任感或未來想像開始不同步。
  - action pressure: `medium`
  - monetization: `medium`
  - product family: `伴侶價值觀雷達`
  - why it matters: 相處很久了，才發現你們其實在看不同的未來？
- `當罪惡感遇上無法抗拒的肉體`
  - signal: 親密互動中的需求與回饋不對等，讓人開始懷疑關係品質。
  - action pressure: `low`
  - monetization: `medium`
  - product family: `親密落差解讀`
  - why it matters: 親密需求落差
- `出社會的我跟高中生交往`
  - signal: 伴侶成長節奏、責任感或未來想像開始不同步。
  - action pressure: `low`
  - monetization: `medium`
  - product family: `伴侶價值觀雷達`
  - why it matters: 相處很久了，才發現你們其實在看不同的未來？

## 12. Top MVP-Relevant Posts

- `普通男生交友軟體心得`
  - signal: 曖昧互動中的投入度不確定，卡在想推進又怕誤判。
  - action pressure: `high`
  - monetization: `high`
  - product family: `下一句怎麼回`
  - why it matters: 曖昧不確定
- `最受女生歡迎的男生身高`
  - signal: 曖昧互動中的投入度不確定，卡在想推進又怕誤判。
  - action pressure: `low`
  - monetization: `medium`
  - product family: `曖昧溫度計`
  - why it matters: 曖昧不確定
- `另一半不願意透露薪水正常嗎？`
  - signal: 伴侶在金錢透明與未來承諾上的期待出現落差。
  - action pressure: `high`
  - monetization: `high`
  - product family: `伴侶價值觀雷達`
  - why it matters: 相處很久了，才發現你們其實在看不同的未來？
- `男友對妹妹太寵愛了`
  - signal: 拒絕或界線沒有被好好接住，安全感與尊重感正在流失。
  - action pressure: `high`
  - monetization: `high`
  - product family: `關係紅旗雷達`
  - why it matters: 你已經拒絕了，為什麼對方還是聽不懂？
- `另一半沒有內涵真的很累`
  - signal: 伴侶成長節奏、責任感或未來想像開始不同步。
  - action pressure: `medium`
  - monetization: `medium`
  - product family: `伴侶價值觀雷達`
  - why it matters: 相處很久了，才發現你們其實在看不同的未來？

## 13. Top Future Product Families

- `另一半沒有內涵真的很累`
  - signal: 伴侶成長節奏、責任感或未來想像開始不同步。
  - action pressure: `medium`
  - monetization: `medium`
  - product family: `伴侶價值觀雷達`
  - why it matters: 相處很久了，才發現你們其實在看不同的未來？
- `為什麼很多人很愛問「怎麼認識的」`
  - signal: 交友軟體中的選擇、效率與自我定位成為主要壓力來源。
  - action pressure: `medium`
  - monetization: `medium`
  - product family: `交友軟體策略`
  - why it matters: 交友軟體不是沒機會，而是很多人不知道怎麼玩得不內耗。
- `另一半不願意透露薪水正常嗎？`
  - signal: 伴侶在金錢透明與未來承諾上的期待出現落差。
  - action pressure: `high`
  - monetization: `high`
  - product family: `伴侶價值觀雷達`
  - why it matters: 相處很久了，才發現你們其實在看不同的未來？
- `男友對妹妹太寵愛了`
  - signal: 拒絕或界線沒有被好好接住，安全感與尊重感正在流失。
  - action pressure: `high`
  - monetization: `high`
  - product family: `關係紅旗雷達`
  - why it matters: 你已經拒絕了，為什麼對方還是聽不懂？
- `最受男生歡迎的女生身高`
  - signal: 外在條件被放大討論，帶來自我價值與市場感的焦慮。
  - action pressure: `low`
  - monetization: `low`
  - product family: `Relationship Radar general`
  - why it matters: 擇偶條件焦慮

## 14. Sensitive / Unsuitable Topic Notes

- sensitive topic count: `12`
- `有女生在床上也是服務型的嗎？`
  - signal: 伴侶成長節奏、責任感或未來想像開始不同步。
  - action pressure: `medium`
  - monetization: `medium`
  - product family: `伴侶價值觀雷達`
  - why it matters: 相處很久了，才發現你們其實在看不同的未來？
- `當罪惡感遇上無法抗拒的肉體`
  - signal: 親密互動中的需求與回饋不對等，讓人開始懷疑關係品質。
  - action pressure: `low`
  - monetization: `medium`
  - product family: `親密落差解讀`
  - why it matters: 親密需求落差
- `出社會的我跟高中生交往`
  - signal: 伴侶成長節奏、責任感或未來想像開始不同步。
  - action pressure: `low`
  - monetization: `medium`
  - product family: `伴侶價值觀雷達`
  - why it matters: 相處很久了，才發現你們其實在看不同的未來？
- `老婆希望我外食 外約 找小三 (半開放式關係?)`
  - signal: 拒絕或界線沒有被好好接住，安全感與尊重感正在流失。
  - action pressure: `high`
  - monetization: `high`
  - product family: `關係紅旗雷達`
  - why it matters: 你已經拒絕了，為什麼對方還是聽不懂？
- `是不是⋯不應該這麼愛做愛⋯微西斯`
  - signal: 拒絕或界線沒有被好好接住，安全感與尊重感正在流失。
  - action pressure: `high`
  - monetization: `high`
  - product family: `關係紅旗雷達`
  - why it matters: 你已經拒絕了，為什麼對方還是聽不懂？

## 15. Impact On 曖昧溫度計 MVP

- current narrow MVP signal count (`曖昧溫度計` + `下一句怎麼回`): `5`
- broader adjacent family signal count (`關係紅旗雷達` + `伴侶價值觀雷達` + `Relationship Radar general`): `11`

Assessment:

- the current MVP should remain `曖昧溫度計 + 下一句怎麼回` as the first focused entry point
- however, the dataset is broad enough to suggest the opportunity space extends beyond ambiguous messaging alone

## 16. Potential Relationship Radar Expansion

Promising adjacent families from this dataset:

- `伴侶價值觀雷達`: `5`
- `親密落差解讀`: `3`
- `關係紅旗雷達`: `4`
- `交友軟體策略`: `1`
- `Relationship Radar general`: `2`

Interpretation:

- `Relationship Radar` expansion looks promising after the first MVP
- strongest adjacent tracks appear to be values/trust, red-flag/boundary cases, and broader relationship dynamics

## 17. Issues For ChatGPT Review

1. Should the first MVP remain narrowly centered on ambiguous romantic messaging, or should `關係紅旗雷達` already be elevated into the first product family set?
2. Are explicit-adjacent intimacy topics better treated as `親密落差解讀`, or should they stay outside the initial paid consumer surface?
3. Is `Relationship Radar general` too broad as a future family label, and should it be broken into narrower families sooner?

## 18. Recommendation Before Formal Tech Stack Selection

- keep the first MVP unchanged: `曖昧溫度計 + 下一句怎麼回`
- do not resume Dcard automation for now
- use external JSON and manual curation to refine:
  - `關係紅旗雷達`
  - `伴侶價值觀雷達`
  - `婚前信任檢查`
  - `親密落差解讀`
