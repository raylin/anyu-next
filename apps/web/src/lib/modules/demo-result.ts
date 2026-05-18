import type { ProductResult } from "@/lib/ai/product-result-schema";

export const aiTemperatureDemoProductResult: ProductResult = {
  free_result: {
    temperature_score: 42,
    state_label: "溫差期",
    one_sentence_read: "你不是想太多，只是你太會看見細節。",
    observed_signals: [
      "多半由你先開話題，對方接球但不一定延伸。",
      "回覆節奏有落差，熱度不固定。",
      "短句偏多，主動提問偏少。",
    ],
    uncertainty_note: "目前訊號偏向不穩，但不能只靠一段互動下定論。",
    paid_teaser: "如果你現在最卡的是下一句怎麼回，付費版會更實用。",
  },
  insight_layer: {
    title: "你卡住的，不只是回覆慢。",
    explanation:
      "讓你卡住的不是他沒回訊息，而是他明明有在活動，卻暫時沒有接你的邀約。",
    principle: "關係不確定感",
    user_facing: true,
  },
  paid_preview: {
    headline: "解鎖下一句怎麼回",
    price: "NT$49",
    included_sections: [
      "現在最不該做的一件事",
      "三種不失控回法",
      "怎麼測對方投入度但不把自己放低",
    ],
    preview_copy:
      "解鎖後你會看到：現在最不該做的一件事、三種不失控回法，以及怎麼測對方投入度但不把自己放低。",
  },
  paid_result: {
    deeper_signal_analysis:
      "他不是完全抽離，而是把互動維持在一個不需要立刻承諾的低成本區間。",
    possible_interpretation:
      "目前比較像投入度下降或節奏不一致，不代表完全沒機會，但也不適合靠追問逼答案。",
    risk_warning:
      "如果你現在用高壓方式追問，很可能只會讓你更累，卻不一定換到更清楚的答案。",
    what_not_to_do: [
      "不要連續追問『你到底怎麼想』。",
      "不要把每一次慢回都解讀成確定拒絕。",
    ],
    reply_strategies: {
      主動推進:
        "主動推進：把邀請縮小成一個容易回答的小提議，避免讓對方一次承擔太多情緒壓力。可以這樣回：「這週如果你剛好有空，我們找個 30 分鐘喝個東西也可以。」",
      低壓試探:
        "低壓試探：先不要追問定義，改用輕話題測試對方目前的互動意願。可以這樣回：「我剛剛突然想到你之前講的那家店，感覺真的蠻適合下次去看看。」",
      暫時拉開:
        "暫時拉開：如果你已經投入很多，就先把節奏收回自己身上，觀察對方會不會主動靠近。可以這樣回：「你先忙你的，等你比較有空再說也沒關係。」",
    },
  },
  share_card: {
    temperature_label: "42°",
    state_label: "溫差期",
    relationship_persona: "微訊號觀察家",
    card_sentence: "有些曖昧不是沒訊號，是訊號太小聲。",
  },
  personal_pattern_candidate: {
    pattern: "容易放大模糊訊號",
    confidence: "medium",
    evidence: "面對忽冷忽熱時，你會特別留意細節變化，想靠更多線索換到確定感。",
    should_store: true,
    user_facing_summary: "你對細節很敏感，這讓你很會看訊號，也更容易被模糊感卡住。",
  },
  metadata: {
    situation_type: "已讀不回",
    input_length: 88,
    generated_at: "2026-05-18T00:00:00.000Z",
    experiment_id: "ambiguous-temperature-fake-door-v0",
    variant: "B",
    model_provider: "anthropic",
    model_name: "claude-sonnet-4-20250514",
  },
};
