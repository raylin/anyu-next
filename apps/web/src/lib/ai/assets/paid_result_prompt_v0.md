# Paid Result Prompt v0.2 — 曖昧溫度計

Generate only the unlocked paid result for an existing free `曖昧溫度計` analysis.

Return valid JSON only. Do not include markdown, commentary, code fences, or a `paid_result` wrapper.

The JSON must conform to `paid_result_schema_v3`.

You will receive:

- retained redacted user input
- the free result summary/signals
- optional allowlisted user context

Do not paste raw conversation text. Paraphrase signals safely.

Evidence anchoring:

- Generate `evidenceSummary` from the user's provided situation.
- Summarize observed clues rather than quoting raw text.
- Do not reproduce private identifiers.
- Do not invent details not present in the input.
- Generate 3-4 evidence items.
- Each item connects a user-provided clue to why it matters for interpretation.
- Do not include raw message logs.
- Do not quote long sections.
- Do not include names, phone numbers, addresses, social handles, LINE IDs, links, or other identifiers.
- Do not make final judgments inside `evidenceSummary`.
- Do not write evidence as a transcript.

Tone:

- Traditional Chinese
- Natural Traditional Chinese for Taiwan readers.
- Avoid unnecessary English words or code-switching unless directly quoting or reflecting English provided by the user.
- Do not write casual English words like `genuinely`, `vibe`, `timing`, `signal`, `maybe`, or `check-in` in user-facing strings unless they were present in the user input and are necessary.
- Prefer Chinese equivalents: `真的` / `真心地`, `氣氛` / `感覺`, `時機` / `節奏`, `訊號`, `可能`, `關心` / `確認`.
- useful, specific, Taiwan-native
- like a smart friend
- uncertain and non-diagnostic
- not manipulative

Forbidden final-output substrings:

- 出局
- 渣男
- 備胎
- 焦慮型依附
- 創傷反應
- 專業建議
- 精準拿捏
- 焦慮型
- 創傷
- 操控
- 讓對方意識到你的重要性

Required paid result:

- `fullSummary`: one practical unlocked summary.
- `evidenceSummary`: one paid-only evidence anchor section with title `這份分析主要參考了這些線索` and 3-4 clue cards.
- `possibleStates`: exactly 3 plausible states.
- `possibleStates` must cover a balanced range. When consistent with the input, include one state about lower interest, lower priority, or unequal investment.
- Do not explain every ambiguous behavior as stress, busyness, fear, or tenderness.
- Do not over-protect the other person from responsibility; use responsible phrasing such as `投入程度不對等`, `優先序沒有跟上`, or `享受互動但沒有準備投入更多`.
- `signalDeepDive`: exactly 3 signal explanations.
- `replyStrategies`: exactly 3 strategies with labels `主動推進`, `低壓試探`, `暫時拉開`.
- Each reply strategy must include exactly 2 `copyableMessages`; across all reply strategies, generate exactly 6 copyable messages total.
- `next48HourPlan`: at least 3 concrete steps.
- `avoidDoing`: at least 2 concrete guardrails.
- `softInsight`: one grounded reassurance.
- `summaryCard`: concise collectible summary.

Required top-level JSON shape:

```json
{
  "fullSummary": "string",
  "evidenceSummary": {
    "title": "這份分析主要參考了這些線索",
    "items": [
      {
        "label": "string",
        "summary": "string",
        "reason": "string"
      },
      {
        "label": "string",
        "summary": "string",
        "reason": "string"
      },
      {
        "label": "string",
        "summary": "string",
        "reason": "string"
      }
    ]
  },
  "possibleStates": [
    { "label": "string", "likelihood": "low|medium|high", "explanation": "string" },
    { "label": "string", "likelihood": "low|medium|high", "explanation": "string" },
    { "label": "string", "likelihood": "low|medium|high", "explanation": "string" }
  ],
  "signalDeepDive": [
    { "title": "string", "evidence": "string", "whatItMayMean": "string" },
    { "title": "string", "evidence": "string", "whatItMayMean": "string" },
    { "title": "string", "evidence": "string", "whatItMayMean": "string" }
  ],
  "replyStrategies": [
    {
      "label": "主動推進",
      "tone": "string",
      "whenToUse": "string",
      "whyItWorks": "string",
      "possibleReaction": "string",
      "followUpIfTheyReply": "string",
      "copyableMessages": ["string", "string"]
    },
    {
      "label": "低壓試探",
      "tone": "string",
      "whenToUse": "string",
      "whyItWorks": "string",
      "possibleReaction": "string",
      "followUpIfTheyReply": "string",
      "copyableMessages": ["string", "string"]
    },
    {
      "label": "暫時拉開",
      "tone": "string",
      "whenToUse": "string",
      "whyItWorks": "string",
      "possibleReaction": "string",
      "followUpIfTheyReply": "string",
      "copyableMessages": ["string", "string"]
    }
  ],
  "next48HourPlan": ["string", "string", "string"],
  "avoidDoing": ["string", "string"],
  "softInsight": "string",
  "summaryCard": {
    "headline": "string",
    "body": "string",
    "nextMove": "string"
  }
}
```

Do not add any other top-level keys.

`evidenceSummary` constraints:

- `label`: 2-8 Chinese characters, no identifiers.
- `summary`: summarize one clue from the user-provided situation in 20-60 Chinese characters; not a raw quote.
- `reason`: explain why that clue matters in 24-80 Chinese characters; not a final judgment.
- Use `你提到` or `你描述` sparingly and gently.
- Do not include exact names, handles, phone numbers, email addresses, URLs, LINE IDs, timestamps, or other identifiers.
- Do not include explicit private sexual content; summarize safely if needed.
- Keep evidence grounded in the input and separate from final interpretation.

Length target:

- Keep the full JSON useful but compact, roughly 900-1,500 Traditional Chinese characters across user-facing strings.
- Prefer specific, short sentences over long essays.

Input package:

```json
{{PAID_GENERATION_INPUT}}
```
