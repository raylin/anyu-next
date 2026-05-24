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
      "3 種下一句回法",
      "對方可能的 3 種狀態",
      "48 小時觀察策略",
      "可收藏摘要卡",
    ],
    preview_copy:
      "解鎖後你會看到：3 種下一句回法、對方可能的 3 種狀態、48 小時觀察策略，以及可收藏摘要卡。",
  },
  paid_result: {
    fullSummary:
      "他不是完全抽離，而是把互動維持在一個不需要立刻承諾的低成本區間。現在最有價值的不是逼出答案，而是用低壓方式確認對方是否願意重新接球。你可以把接下來兩天當成一次小型觀察：少一點補訊息，多看對方是否會主動延伸、提出時間，或至少把話題接回來。這樣你不用靠猜，也不用把所有壓力放在自己身上。",
    possibleStates: [
      {
        label: "投入度下降但未完全退出",
        likelihood: "medium",
        explanation: "對方仍有社群活動，但暫時沒有承接邀約，代表互動意願可能變低或變保守。這不是要你立刻放棄，而是提醒你下一步要看行動，不只看他有沒有出現在社群上。",
      },
      {
        label: "節奏不一致",
        likelihood: "medium",
        explanation: "他可能還願意互動，只是目前回覆節奏與你期待的靠近速度不同。如果你用很重的方式追問，容易讓節奏更僵；用小邀請或輕話題反而比較能看出他是否願意接球。",
      },
      {
        label: "需要更明確的小邀請",
        likelihood: "low",
        explanation: "如果邀約太大或太模糊，對方可能延後處理；縮小邀請能測出是否願意接近。重點是給一個容易回答的選項，讓你看見對方是否願意提供時間或替代方案。",
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
        tone: "坦白但不施壓",
        whenToUse: "你還想給一次明確機會，而且不想把邀約弄得太沉重。",
        whyItWorks: "把邀請縮小成容易回答的小選項，可以降低壓力，也更容易看出對方是否願意接球。",
        possibleReaction: "如果對方還願意接球，通常會給出時間、替代方案，或至少延伸話題。",
        followUpIfTheyReply: "如果他回得具體，就順著約定時間；如果他仍然含糊，先不要追問第二次。",
        copyableMessages: [
          "這週如果你剛好有空，我們找個 30 分鐘喝個東西也可以。",
          "我先丟一個很小的提案：如果你週末有空，我們去買杯咖啡就好。",
          "如果你這幾天比較忙也沒關係，我只是想先問問看有沒有一個小空檔。",
        ],
      },
      {
        label: "低壓試探",
        tone: "有界線但不冷",
        whenToUse: "你想測對方還願不願意互動，但不想直接追問。",
        whyItWorks: "輕話題能讓對方自然回來，也能避免你把壓力一次全放到自己身上。",
        possibleReaction: "有意願的人通常會回到話題裡，至少補一點近況或接一個小問題。",
        followUpIfTheyReply: "如果他有延伸，就維持輕鬆節奏；如果只回表情或短句，先停在那裡。",
        copyableMessages: [
          "我剛剛突然想到你之前講的那家店，感覺真的蠻適合下次去看看。",
          "我先不催你～只是剛好想到這件事，覺得你應該會懂。",
          "你最近節奏好像比較滿，我就先輕輕丟一句：那個地方下次真的可以去看看。",
        ],
      },
      {
        label: "暫時拉開",
        tone: "溫和收回節奏",
        whenToUse: "你已經主動很多次，開始覺得自己被拖著走。",
        whyItWorks: "先收回節奏，可以看出對方是否會主動補位，也保護你的情緒能量。",
        possibleReaction: "如果對方在意這段互動，通常會在之後主動補一句或找新話題。",
        followUpIfTheyReply: "如果他回來找你，就正常回應但不要立刻加碼；先看他能不能持續接球。",
        copyableMessages: [
          "你先忙你的，等你比較有空再說也沒關係。",
          "我這兩天也先忙自己的事，之後如果你想約再跟我說。",
          "我先把節奏放慢一點，不急著約；如果你想找我，再跟我說就好。",
        ],
      },
    ],
    next48HourPlan: [
      "先不要補第二段長訊息，給對方至少一天回應空間。",
      "如果仍想推進，只丟一個低壓、容易回答的小邀請。",
      "送出後觀察對方是否延伸話題，而不是只看回覆速度。",
      "如果對方只短回或跳過邀約，就先停止加碼，把注意力放回自己的安排。",
      "48 小時後再回頭看：他有沒有主動補位、提出時間，或把話題接回來。",
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
