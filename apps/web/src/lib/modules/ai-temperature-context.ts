export const AI_TEMPERATURE_CONTEXT_GROUPS = [
  {
    key: "relationshipStage",
    label: "目前關係 · 可選",
    options: ["剛認識", "曖昧中", "見過幾次", "曾經比較靠近", "不確定 / 跳過"],
  },
  {
    key: "userGoal",
    label: "你現在想要 · 可選",
    options: ["我該怎麼回", "我要不要主動", "想確認對方投入", "想自然推進", "想保留尊嚴", "不確定 / 跳過"],
  },
  {
    key: "primaryPain",
    label: "最卡的點 · 可選",
    options: ["回覆變慢", "有互動但不約", "已讀不回", "忽冷忽熱", "怕自己太主動", "不確定 / 跳過"],
  },
  {
    key: "replyTone",
    label: "你想回給對方的語氣 · 可選",
    options: ["有界線但不冷", "輕鬆像聊天", "自然一點", "低壓試探", "坦白但不施壓", "不確定 / 跳過"],
  },
] as const;

export type AiTemperatureContextKey =
  (typeof AI_TEMPERATURE_CONTEXT_GROUPS)[number]["key"];

export type AiTemperatureUserContext = Partial<Record<AiTemperatureContextKey, string>>;

export type AiTemperatureContextGroup = {
  key: AiTemperatureContextKey;
  label: string;
  options: readonly string[];
};

export type NormalizedUserContext = {
  ok: true;
  context: AiTemperatureUserContext;
  provided: boolean;
  fieldCount: number;
};

const SKIP_VALUES = new Set(["", "不確定 / 跳過"]);

function getContextGroup(key: string) {
  return AI_TEMPERATURE_CONTEXT_GROUPS.find((group) => group.key === key);
}

export function compactUserContext(
  context: AiTemperatureUserContext,
): AiTemperatureUserContext {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value && !SKIP_VALUES.has(value)),
  ) as AiTemperatureUserContext;
}

export function normalizeUserContext(
  value: unknown,
): NormalizedUserContext | { ok: false; error: string } {
  if (value === undefined || value === null) {
    return {
      ok: true,
      context: {},
      provided: false,
      fieldCount: 0,
    };
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "validation_error" };
  }

  const normalized: AiTemperatureUserContext = {};

  for (const [key, rawValue] of Object.entries(value)) {
    const group = getContextGroup(key);

    if (!group) {
      return { ok: false, error: "validation_error" };
    }

    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    if (typeof rawValue !== "string") {
      return { ok: false, error: "validation_error" };
    }

    const candidate = rawValue.trim();

    if (SKIP_VALUES.has(candidate)) {
      continue;
    }

    if (!group.options.some((option) => option === candidate)) {
      return { ok: false, error: "validation_error" };
    }

    normalized[group.key] = candidate;
  }

  const compacted = compactUserContext(normalized);
  const fieldCount = Object.keys(compacted).length;

  return {
    ok: true,
    context: compacted,
    provided: fieldCount > 0,
    fieldCount,
  };
}

export function buildUserContextPromptNotes(
  context: AiTemperatureUserContext,
): Record<string, string> {
  const notes: Record<string, string> = {};

  if (context.relationshipStage) {
    notes.relationship_stage =
      `Use relationship stage as a soft prior: ${context.relationshipStage}. Do not overrule the conversation evidence.`;
  }

  if (context.userGoal) {
    notes.user_goal =
      `Optimize recommendations for the user's current goal: ${context.userGoal}.`;
  }

  if (context.primaryPain) {
    notes.primary_pain =
      `Address the main pain point explicitly when choosing reply strategies: ${context.primaryPain}.`;
  }

  if (context.replyTone) {
    notes.reply_tone =
      `Make copyable message examples fit this reply tone: ${context.replyTone}.`;
  }

  return notes;
}
