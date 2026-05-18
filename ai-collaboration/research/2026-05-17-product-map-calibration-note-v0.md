# Product Map Calibration Note v0

Date: 2026-05-17

## 1. Executive Summary

- First MVP remains `曖昧溫度計 + 下一句怎麼回`.
- The broader opportunity is a multi-module AI-native relationship insight system, not a single hardcoded app.
- `暗語 ANYU` is a strong mother-brand candidate for the future portal and product family container.
- The future system should support both standalone theme pages and a later portal / discovery site.
- The operating rhythm should eventually support weekly or biweekly theme launches.
- C-stage technical selection must support multiple product families, shared runtime contracts, and rapid launch cycles.

## 2. Current First MVP Decision

First MVP:

- `曖昧溫度計`

Free entry:

- relationship temperature
- insight layer
- share card

Paid unlock:

- `下一句怎麼回`
- action strategy
- reply suggestions

Status:

- keep unchanged

## 3. Why 曖昧溫度計 Remains First

Reasons:

- lowest sensitivity among the strongest discovered product families
- easiest to share socially without feeling too private or heavy
- already compatible with the fake-door flow
- product runtime already exists
- prompt and schema are already calibrated to v0.2
- prototype already exists
- paid intent around `我現在該怎麼回` is clear and legible
- good first entry point into a future Personal Insight Graph

This means the first product still has the best speed-to-launch and the cleanest path to testing both shareability and paid intent.

## 4. Relationship Radar As Internal Umbrella

`Relationship Radar` should be treated as an internal opportunity umbrella, not necessarily the public product name.

Reason:

Users do not buy a broad category label like `Relationship Radar general`.
They buy specific questions such as:

- 他這樣是不是紅旗？
- 我該不該繼續？
- 我是不是想太多？
- 他到底是忙還是冷掉？
- 我現在該怎麼回？

So:

- `Relationship Radar` is useful for internal planning, roadmap grouping, and future platform framing
- user-facing products should stay question-shaped, theme-shaped, and emotionally immediate

## 5. Product Family Map

| Product family | User-facing concept | Core user question | Relationship stage | Likely monetization strength | Likely shareability strength | Sensitivity level | MVP timing | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `曖昧溫度計` | 關係溫度測驗 | 他是真的忙，還是在冷掉？ | 曖昧 | High | High | Low-Medium | 1st | Best first entry point |
| `下一句怎麼回` | 回覆策略解鎖 | 我現在該怎麼回？ | 曖昧 | High | Medium | Low-Medium | 1st | Paid layer of the first MVP |
| `關係紅旗雷達` | 紅旗判讀 | 這樣是不是紅旗？我該不該繼續？ | 交往 / 婚姻 / boundary cases | High | Medium | Medium | 2nd | Likely next family after MVP |
| `伴侶價值觀雷達` | 價值觀落差解讀 | 我們是不是其實在看不同的未來？ | 交往 / 婚前 / 婚姻 | Medium-High | Medium | Medium | 3rd | Strong expansion candidate from external JSON calibration |
| `婚前信任檢查` | 婚前信任與財務討論 | 談錢、承諾、透明時，這正常嗎？ | 婚前 | High | Medium-Low | Medium | 4th | Useful but narrower audience |
| `邊界感雷達` | 關係界線判讀 | 我已經拒絕了，為什麼他還是不懂？ | 曖昧 / 交往 / boundary cases | High | Medium | Medium-High | 4th | Strong action pressure, but tone must stay safe |
| `社群微訊號分析` | 限動 / 發文 / 按讚解讀 | 他有在看我，卻沒真的靠近，代表什麼？ | 曖昧 | Medium | High | Low-Medium | 5th | Better as adjacent module than first MVP |
| `交友軟體策略` | Dating app 生存術 | 交友軟體上，我該怎麼做才不內耗？ | casual | Medium-High | Medium | Low-Medium | 6th | Good for acquisition, but not the first flagship |
| `親密落差解讀` | 親密需求不對等解讀 | 是我需求太多，還是我們真的不對等？ | 交往 / 婚姻 | Medium | Medium | High | Later | Valid family, but sensitive for early paid surface |

Recommended ordering:

1. `曖昧溫度計 + 下一句怎麼回`
2. `關係紅旗雷達`
3. `伴侶價值觀雷達`
4. `婚前信任檢查 / 邊界感雷達`
5. `社群微訊號分析`
6. `交友軟體策略`
7. `親密落差解讀` later due to sensitivity

## 6. 暗語 ANYU Brand Candidate

Working mother brand:

- `暗語 ANYU`

Role:

- future portal brand
- umbrella brand
- cross-module container

First MVP display:

- `曖昧溫度計 by 暗語 ANYU`

Brand fit:

- `暗語` suggests hidden signals, unsaid meanings, private emotional codes
- `ANYU` gives it a softer, more productizable identity
- it can hold tests, fortune-telling-like experiences, relationship insight modules, and personal pattern discovery

Risks:

- too mysterious may feel manipulative or PUA-like
- the visual direction must avoid dark manipulation, cheap fortune-telling, or creepy surveillance
- the brand should emphasize understanding, not controlling other people

Suggested tagline:

- `讀懂關係裡那些沒說出口的訊號。`

Alternative lines:

- `把那些你說不清的感覺，翻譯成一點方向。`
- `小測驗、關係雷達、曖昧翻譯器。每週讀懂一種人際暗號。`

## 7. Standalone Theme Page Model

Each theme module should be able to exist as a standalone page.

Examples:

- `/ambiguous-temperature`
- `/red-flag-radar`
- `/pre-marriage-trust-check`
- `/social-signal-reader`
- `/value-gap-radar`

Each page should have:

- `theme_slug`
- `product_family`
- `landing_hook`
- `input_type`
- `result_schema`
- `prompt_version`
- `visual_accent`
- `free_sections`
- `paid_sections`
- `price_config`
- `experiment_id`
- `share_card_config`
- `event_tracking_config`

This supports a modular launch strategy where each page can be tested independently before a larger portal exists.

## 8. Future Portal / Discovery Site Model

The future portal becomes valuable after roughly 5 to 10 modules exist.

Potential portal capabilities:

- browse tests
- latest / trending modules
- relationship category
- ambiguity category
- red flag category
- long-term relationship category
- recommended next test
- previously completed tests
- personal insight profile

Important rule:

- portal should not block standalone module launches
- standalone modules come first
- portal becomes useful only after repeated modules and returning-user behavior exist

## 9. Weekly / Biweekly Theme Launch Operating Model

Target weekly version:

1. Day 1: trend heat collection
2. Day 2: topic scoring and selection
3. Day 3: topic spec, hook, and prompt/schema draft
4. Day 4: sample generation and synthetic eval
5. Day 5: theme page assembly
6. Day 6: QA and event tracking
7. Day 7: low-key launch and review

Target biweekly version:

Week 1:

- trend collection
- topic decision
- product spec
- prompt/schema
- sample eval

Week 2:

- visual polish
- implementation
- QA
- fake-door or launch
- review

Operating loop:

`collect trend heat -> decide topic -> create theme spec -> generate prompt/schema -> run eval -> launch standalone page -> collect events -> analyze -> decide iterate/archive/promote`

## 10. Topic Intake And Scoring Model

Future topic intake should be scored using at least:

- `trend_heat_score`
- `emotional_intensity`
- `action_pressure`
- `shareability`
- `monetization_strength`
- `sensitivity_risk`
- `production_effort`
- `fit_with_personal_insight_graph`

Priority should go to topics with:

- high emotional intensity
- high action pressure
- medium or high shareability
- clear paid unlock logic
- manageable sensitivity
- low implementation effort

This helps avoid spending cycles on topics that are interesting but hard to monetize, too sensitive, or too expensive to produce quickly.

## 11. Product Runtime Implications

Future modules should be config-driven.

Example:

```json
{
  "theme_slug": "ambiguous-temperature",
  "product_family": "曖昧溫度計",
  "title": "他是真的忙，還是其實在冷掉？",
  "input_type": "text",
  "prompt_path": "prompts/product_result_prompt_v0.md",
  "schema_path": "schemas/product_result_schema_v0.json",
  "visual_accent": "misty-purple",
  "free_sections": ["free_result", "insight_layer", "share_card"],
  "paid_sections": ["paid_result"],
  "price": "NT$49",
  "experiment_id": "ambiguous-temperature-fake-door-v0"
}
```

Implications:

- do not hardcode the system around one MVP
- prompts and schemas should remain versioned
- renderers should be section-aware rather than product-specific
- event tracking should be theme-aware
- price, share card behavior, and experiment ids should be configurable per module

## 12. Visual Design Implications

The visual system should support:

- standalone theme pages
- future portal navigation
- multiple product families
- family-specific visual accents
- shared components
- result cards
- share cards
- paid CTAs

Recommended direction:

- soft mysterious
- emotionally safe
- social-card friendly
- not clinical
- not cheap fortune-telling
- not PUA-like
- not enterprise SaaS

Possible visual language:

- misty purple
- warm gray
- cream white
- muted rose
- soft gradients
- subtle glow
- rounded cards
- message bubbles
- radar / temperature / moon / signal icons

`暗語 ANYU` should feel like:

- `像戀愛測驗，但比算命可信。`
- `像 AI 分析，但比工具有人味。`

## 13. Technical Implications For C-Stage Stack Selection

C-stage technical selection should explicitly evaluate:

- theme config system
- prompt versioning
- schema versioning
- `product_family` abstraction
- result renderer abstraction
- event tracking per theme
- share card generation
- paid unlock configuration
- portal readiness
- privacy and data retention
- personal pattern candidate storage
- Personal Insight Graph future path

The chosen stack must support:

- weekly or biweekly launches
- rapid theme creation
- multiple product families
- local/private research workflows
- future portal expansion

The core technical question is no longer “what stack best serves one fake-door page?”

It is:

- what stack best supports a modular product system with repeatable launches

## 14. Near-Term Roadmap

A practical near-term sequence:

1. finish Product Map Calibration Note
2. run Visual Direction Exploration v0
3. make formal C-stage technical stack selection
4. implement a production-ready theme-page foundation
5. launch `曖昧溫度計`
6. use the trend pipeline to select the second theme

## 15. Open Questions

- Should `暗語 ANYU` be the public brand or remain an internal codename until the portal exists?
- Should the first public page show `by 暗語 ANYU`, or hide the brand until there are multiple modules?
- Should the next product family be `關係紅旗雷達` or `伴侶價值觀雷達`?
- How much visual difference should each product family have?
- How soon should Personal Insight Graph be exposed to users?
- What is the minimum privacy policy required before public launch?

## 16. Recommended Next Step

Recommended next step:

- `Visual Direction Exploration v0`

Reason:

- visual requirements will affect frontend architecture
- they also affect share card generation, component design, module-level theming, and later portal behavior
- resolving the visual system first will make the later C-stage stack decision more grounded
