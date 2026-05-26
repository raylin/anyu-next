import fs from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020";
import { callAiProvider } from "@/lib/ai/provider";
import { validatePaidResultSemantics } from "@/lib/ai/paid-result-semantic-validation";
import { getPaidResultPromptPath, getPaidResultSchemaPath } from "@/lib/ai/repo-paths";
import type { ProductResult, RichPaidResult } from "@/lib/ai/product-result-schema";
import type { AiTemperatureUserContext } from "@/lib/modules/ai-temperature-context";

export const PAID_RESULT_PROMPT_VERSION = "paid_result_prompt_v0.1";
export const PAID_RESULT_SCHEMA_VERSION = "paid_result_schema_v1";
export const PAID_RESULT_MAX_OUTPUT_TOKENS = 2_400;
export const PAID_RESULT_PROVIDER_FALLBACK_MODEL = "paid_template_fallback_v0";

const ajv = new Ajv2020({ allErrors: true, strict: false });
let cachedPrompt: string | null = null;
let cachedValidator: ReturnType<typeof ajv.compile<RichPaidResult>> | null = null;

async function loadPaidPromptTemplate() {
  if (cachedPrompt) {
    return cachedPrompt;
  }

  cachedPrompt = await fs.readFile(getPaidResultPromptPath(), "utf8");
  return cachedPrompt;
}

async function getPaidValidator() {
  if (cachedValidator) {
    return cachedValidator;
  }

  const schema = JSON.parse(await fs.readFile(getPaidResultSchemaPath(), "utf8"));
  cachedValidator = ajv.compile<RichPaidResult>(schema);
  return cachedValidator;
}

function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/u, "")
    .replace(/\s*```$/u, "")
    .trim();
}

export async function validatePaidResultText(
  text: string,
  freeResult: ProductResult,
): Promise<RichPaidResult> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(stripMarkdownFences(text));
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Model output was not valid JSON: ${error.message}`
        : "Model output was not valid JSON.",
    );
  }

  const validator = await getPaidValidator();

  if (!validator(parsed)) {
    throw new Error(
      validator.errors
        ?.map((issue) => `${issue.instancePath || "$"} ${issue.message ?? "is invalid"}`)
        .join("; ") ?? "Paid result failed schema validation.",
    );
  }

  const paidResult = parsed as RichPaidResult;
  validatePaidResultSemantics({
    ...freeResult,
    paid_result: paidResult,
  });
  return paidResult;
}

function getSignal(freeResult: ProductResult, index: number, fallback: string) {
  return freeResult.free_result.observed_signals[index] ?? fallback;
}

export function buildProviderFallbackPaidResult(input: {
  freeResult: ProductResult;
  userContext: AiTemperatureUserContext | null;
}): RichPaidResult {
  const { freeResult, userContext } = input;
  const relationshipStage = userContext?.relationshipStage ?? "目前這段互動";
  const userGoal = userContext?.userGoal ?? "下一步怎麼做";
  const primaryPain = userContext?.primaryPain ?? "訊號不穩";
  const replyTone = userContext?.replyTone ?? "有界線但不冷";
  const signalA = getSignal(freeResult, 0, "對方仍有互動，但主動延伸不穩定。");
  const signalB = getSignal(freeResult, 1, "回覆節奏有落差，讓你很難判斷靠近程度。");
  const signalC = getSignal(freeResult, 2, "你需要一個不加壓、也不委屈自己的下一步。");

  const paidResult: RichPaidResult = {
    fullSummary: `${relationshipStage}現在最需要的不是立刻定義關係，而是把模糊訊號拆成可觀察的下一步。${freeResult.free_result.one_sentence_read} 你可以先用${replyTone}的方式回到互動裡，讓對方有空間接球，也讓自己不用一直補訊息或猜測。接下來 48 小時，重點放在對方是否主動延伸、是否提出具體時間，以及你送出低壓訊息後，他有沒有把話題接回來。`,
    possibleStates: [
      {
        label: "仍有興趣但節奏變慢",
        likelihood: "medium",
        explanation: `${signalA} 這代表對方未必完全抽離，但目前投入速度可能比你期待的慢。先看他是否願意把話題接長，比只看回覆秒數更準。`,
      },
      {
        label: "維持低成本互動",
        likelihood: "medium",
        explanation: `${signalB} 對方可能享受輕鬆互動，卻還沒有準備好承接更明確的靠近。你可以用小邀請測試，而不是一次把壓力推高。`,
      },
      {
        label: "需要你暫時收回節奏",
        likelihood: "low",
        explanation: `${signalC} 如果你已經主動很多，暫時放慢不是冷掉，而是保留餘裕，讓你看見對方會不會自己補位。`,
      },
    ],
    signalDeepDive: [
      {
        title: "慢回不是唯一重點",
        evidence: signalA,
        whatItMayMean: "真正要觀察的是他回來時有沒有延伸內容、補近況，或主動創造下一次互動。",
      },
      {
        title: "你卡住的是不確定感",
        evidence: signalB,
        whatItMayMean: `你想解決的是「${userGoal}」，所以需要一個能測出回應品質的小動作，而不是更多猜測。`,
      },
      {
        title: "界線感會讓訊號更乾淨",
        evidence: signalC,
        whatItMayMean: `圍繞「${primaryPain}」時，太急著確認容易讓你更累；${replyTone}會比較能保留你的穩定感。`,
      },
    ],
    replyStrategies: [
      {
        label: "主動推進",
        tone: replyTone,
        whenToUse: "你還想給一次明確但不沉重的機會。",
        whyItWorks: "把邀請縮小成容易回答的小選項，可以降低壓力，也更容易看出對方是否願意接球。",
        possibleReaction: "如果他有意願，通常會給時間、替代方案，或至少把話題延伸下去。",
        followUpIfTheyReply: "如果他回得具體，就順著安排；如果仍然含糊，先不要追第二次。",
        copyableMessages: [
          "這週如果你剛好有空，我們找個 30 分鐘喝個東西也可以。",
          "我先丟一個很小的提案：如果你週末有空，我們去買杯咖啡就好。",
        ],
      },
      {
        label: "低壓試探",
        tone: replyTone,
        whenToUse: "你想測他還願不願意互動，但不想直接追問。",
        whyItWorks: "輕話題能讓對方自然回來，也避免你把所有壓力一次放到自己身上。",
        possibleReaction: "有意願的人通常會接回話題，補一點近況，或回問你一個問題。",
        followUpIfTheyReply: "如果他有延伸，就維持輕鬆節奏；如果只短回，先停在那裡。",
        copyableMessages: [
          "你最近節奏好像比較滿，我就先輕輕丟一句：那個地方下次真的可以去看看。",
          "我先不催你，只是剛好想到這件事，覺得你應該會懂。",
        ],
      },
      {
        label: "暫時拉開",
        tone: "溫和收回節奏",
        whenToUse: "你已經主動很多，開始覺得自己被拖著走。",
        whyItWorks: "先收回節奏，可以看出對方是否會主動補位，也保護你的情緒能量。",
        possibleReaction: "如果他在意這段互動，通常會在之後主動補一句或找新話題。",
        followUpIfTheyReply: "如果他回來找你，正常回應但不要立刻加碼；先看他能不能持續接球。",
        copyableMessages: [
          "你先忙你的，等你比較有空再說也沒關係。",
          "我這兩天也先忙自己的事，之後如果你想約再跟我說。",
        ],
      },
    ],
    next48HourPlan: [
      "先不要補第二段長訊息，給對方至少一天回應空間。",
      "如果仍想推進，只送出一則低壓、容易回答的小邀請。",
      "送出後觀察對方是否延伸話題，而不是只看回覆速度。",
      "如果對方只短回或跳過邀約，就先停止加碼，把注意力放回自己的安排。",
    ],
    avoidDoing: [
      "不要連續追問對方現在到底怎麼想。",
      "不要把每一次慢回都解讀成確定拒絕。",
      "不要為了換到回覆而故意丟出會讓自己後悔的訊息。",
    ],
    softInsight:
      "你不是太敏感，而是已經在替這段互動做很多解讀。下一步最好讓訊號變清楚，而不是讓自己更用力。",
    summaryCard: {
      headline: "先測接球，不急著逼答案",
      body: "目前訊號偏向節奏不一致。用低壓小邀請測一次，比連續追問更能保留你的餘裕。",
      nextMove: "選一則低壓訊息送出，然後觀察對方有沒有主動延伸。",
    },
  };

  validatePaidResultSemantics({
    ...freeResult,
    paid_result: paidResult,
  });

  return paidResult;
}

export async function generatePaidResult(input: {
  redactedInput: string;
  freeResult: ProductResult;
  userContext: AiTemperatureUserContext | null;
  providerModel?: string | null;
}) {
  const template = await loadPaidPromptTemplate();
  const promptInput = {
    redactedInput: input.redactedInput,
    userContext: input.userContext ?? {},
    freeResult: {
      free_result: input.freeResult.free_result,
      insight_layer: input.freeResult.insight_layer,
      paid_preview: input.freeResult.paid_preview,
      share_card: input.freeResult.share_card,
    },
  };
  const prompt = template.replace(
    "{{PAID_GENERATION_INPUT}}",
    JSON.stringify(promptInput, null, 2),
  );
  const providerResult = await callAiProvider(prompt, {
    model: input.providerModel ?? undefined,
    maxOutputTokens: PAID_RESULT_MAX_OUTPUT_TOKENS,
  });
  const paidResult = await validatePaidResultText(providerResult.text, input.freeResult);

  return {
    paidResult,
    provider: providerResult.provider,
    model: providerResult.model,
  };
}
