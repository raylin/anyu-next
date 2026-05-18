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
  paid_result: {
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
