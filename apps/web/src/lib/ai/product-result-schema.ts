export type PaidResultPossibleState = {
  label: string;
  likelihood: "low" | "medium" | "high";
  explanation: string;
};

export type PaidResultSignalDeepDive = {
  title: string;
  evidence: string;
  whatItMayMean: string;
};

export type PaidResultReplyStrategy = {
  label: string;
  tone?: string;
  whenToUse: string;
  whyItWorks: string;
  possibleReaction?: string;
  followUpIfTheyReply?: string;
  copyableMessages: string[];
};

export type PaidResultEvidenceSummaryItem = {
  label: string;
  summary: string;
  reason: string;
};

export type PaidResultEvidenceSummary = {
  title: string;
  items: PaidResultEvidenceSummaryItem[];
};

export type RichPaidResult = {
  fullSummary: string;
  evidenceSummary?: PaidResultEvidenceSummary;
  possibleStates: PaidResultPossibleState[];
  signalDeepDive: PaidResultSignalDeepDive[];
  replyStrategies: PaidResultReplyStrategy[];
  next48HourPlan: string[];
  avoidDoing: string[];
  softInsight: string;
  summaryCard: {
    headline: string;
    body: string;
    nextMove: string;
  };
};

export type LegacyPaidResult = {
  deeper_signal_analysis: string;
  possible_interpretation: string;
  risk_warning: string;
  what_not_to_do: string[];
  reply_strategies: {
    主動推進: string;
    低壓試探: string;
    暫時拉開: string;
  };
};

export type ProductResult = {
  free_result: {
    temperature_score: number;
    state_label: string;
    one_sentence_read: string;
    observed_signals: string[];
    uncertainty_note: string;
    paid_teaser: string;
  };
  insight_layer: {
    title: string;
    explanation: string;
    principle: string;
    user_facing: boolean;
  };
  paid_preview: {
    headline: string;
    price: string;
    included_sections: string[];
    preview_copy: string;
  };
  paid_result?: RichPaidResult;
  share_card: {
    temperature_label: string;
    state_label: string;
    relationship_persona: string;
    card_sentence: string;
  };
  personal_pattern_candidate: {
    pattern: string;
    confidence: "low" | "medium" | "high";
    evidence: string;
    should_store: boolean;
    user_facing_summary: string;
  };
  metadata: {
    situation_type: string;
    input_length: number;
    generated_at: string;
    experiment_id: string;
    variant: string;
    model_provider: string;
    model_name: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function isRichPaidResult(value: unknown): value is RichPaidResult {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.fullSummary === "string" &&
    Array.isArray(value.possibleStates) &&
    Array.isArray(value.signalDeepDive) &&
    Array.isArray(value.replyStrategies) &&
    Array.isArray(value.next48HourPlan) &&
    Array.isArray(value.avoidDoing) &&
    typeof value.softInsight === "string" &&
    isRecord(value.summaryCard)
  );
}

export function hasPaidResult(value: unknown): value is { paid_result: RichPaidResult | LegacyPaidResult } {
  return isRecord(value) && "paid_result" in value && value.paid_result != null;
}

export function normalizePaidResultForDisplay(value: unknown): RichPaidResult {
  if (isRichPaidResult(value)) {
    return value;
  }

  const legacy = isRecord(value) ? value : {};
  const replyStrategies = isRecord(legacy.reply_strategies)
    ? Object.entries(legacy.reply_strategies).map(([label, strategy]) => ({
        label,
        whenToUse: "沿用舊版完整分析的回覆建議。",
        whyItWorks: typeof strategy === "string" ? strategy : "",
        copyableMessages: typeof strategy === "string" ? [strategy] : [],
      }))
      .map((strategy) => ({
        ...strategy,
        tone: "",
        possibleReaction: "",
        followUpIfTheyReply: "",
      }))
    : [];

  return {
    fullSummary:
      typeof legacy.possible_interpretation === "string"
        ? legacy.possible_interpretation
        : "這份完整分析使用舊版格式產生，以下保留可用的重點內容。",
    possibleStates: [
      {
        label: "目前訊號",
        likelihood: "medium",
        explanation:
          typeof legacy.possible_interpretation === "string"
            ? legacy.possible_interpretation
            : "舊版結果沒有拆成三種可能狀態。",
      },
    ],
    signalDeepDive: [
      {
        title: "深層訊號",
        evidence:
          typeof legacy.deeper_signal_analysis === "string"
            ? legacy.deeper_signal_analysis
            : "",
        whatItMayMean:
          typeof legacy.risk_warning === "string" ? legacy.risk_warning : "",
      },
    ],
    replyStrategies,
    next48HourPlan: [],
    avoidDoing: toStringArray(legacy.what_not_to_do),
    softInsight: typeof legacy.risk_warning === "string" ? legacy.risk_warning : "",
    summaryCard: {
      headline: "完整分析摘要",
      body:
        typeof legacy.possible_interpretation === "string"
          ? legacy.possible_interpretation
          : "",
      nextMove: replyStrategies[0]?.copyableMessages[0] ?? "",
    },
  };
}

export function normalizeProductResultForDisplay(value: unknown): ProductResult {
  const result = value as ProductResult;
  const paidResult = hasPaidResult(value)
    ? normalizePaidResultForDisplay(value.paid_result)
    : undefined;

  return {
    ...result,
    ...(paidResult ? { paid_result: paidResult } : {}),
  };
}
