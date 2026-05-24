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
    fullSummary:
      "他不是完全抽離，而是把互動維持在一個不需要立刻承諾的低成本區間。現在最有價值的不是逼出答案，而是用低壓方式確認對方是否願意重新接球。",
    possibleStates: [
      {
        label: "投入度下降但未完全退出",
        likelihood: "medium",
        explanation: "對方仍有社群活動，但暫時沒有承接邀約，代表互動意願可能變低或變保守。",
      },
      {
        label: "節奏不一致",
        likelihood: "medium",
        explanation: "他可能還願意互動，只是目前回覆節奏與你期待的靠近速度不同。",
      },
      {
        label: "需要更明確的小邀請",
        likelihood: "low",
        explanation: "如果邀約太大或太模糊，對方可能延後處理；縮小邀請能測出是否願意接近。",
      },
    ],
    signalDeepDive: [
      {
        title: "有活動不等於有空承接關係",
        evidence: "對方有社群動態，卻沒有接住邀約。",
        whatItMayMean: "這通常不是單純忙不忙，而是他暫時沒有把回覆你放在優先順位。",
      },
      {
        title: "你需要的是可觀察的下一步",
        evidence: "目前最卡的是下一句怎麼回，而不是缺少更多猜測。",
        whatItMayMean: "用低壓訊息測互動意願，比追問關係定義更容易得到乾淨訊號。",
      },
      {
        title: "尊嚴感需要被保留",
        evidence: "你已經注意到自己可能投入較多。",
        whatItMayMean: "下一步要讓對方有空間回來，也要讓你不必一直站在等待的位置。",
      },
    ],
    replyStrategies: [
      {
        label: "主動推進",
        whenToUse: "你還想給一次明確機會，而且不想把邀約弄得太沉重。",
        whyItWorks: "把邀請縮小成容易回答的小選項，可以降低壓力，也更容易看出對方是否願意接球。",
        copyableMessages: [
          "這週如果你剛好有空，我們找個 30 分鐘喝個東西也可以。",
          "我先丟一個很小的提案：如果你週末有空，我們去買杯咖啡就好。",
        ],
      },
      {
        label: "低壓試探",
        whenToUse: "你想測對方還願不願意互動，但不想直接追問。",
        whyItWorks: "輕話題能讓對方自然回來，也能避免你把壓力一次全放到自己身上。",
        copyableMessages: [
          "我剛剛突然想到你之前講的那家店，感覺真的蠻適合下次去看看。",
          "我先不催你～只是剛好想到這件事，覺得你應該會懂。",
        ],
      },
      {
        label: "暫時拉開",
        whenToUse: "你已經主動很多次，開始覺得自己被拖著走。",
        whyItWorks: "先收回節奏，可以看出對方是否會主動補位，也保護你的情緒能量。",
        copyableMessages: [
          "你先忙你的，等你比較有空再說也沒關係。",
          "我這兩天也先忙自己的事，之後如果你想約再跟我說。",
        ],
      },
    ],
    next48HourPlan: [
      "先不要補第二段長訊息，給對方至少一天回應空間。",
      "如果仍想推進，只丟一個低壓、容易回答的小邀請。",
      "送出後觀察對方是否延伸話題，而不是只看回覆速度。",
    ],
    avoidDoing: [
      "不要連續追問『你到底怎麼想』。",
      "不要把每一次慢回都解讀成確定拒絕。",
    ],
    softInsight:
      "你不是太敏感，而是已經在替這段互動做很多解讀。下一步最好讓訊號變清楚，而不是讓自己更用力。",
    summaryCard: {
      headline: "先測接球，不急著逼答案",
      body: "目前訊號偏向節奏不一致。用低壓小邀請測一次，比連續追問更能保留你的餘裕。",
      nextMove: "選一則低壓訊息送出，然後觀察對方有沒有主動延伸。",
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
