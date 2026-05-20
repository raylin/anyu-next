#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import Ajv2020 from "ajv/dist/2020.js";

const SYNTHETIC_CASES = [
  {
    id: "case_01",
    situation: "不確定 / 跳過",
    text: "他最近回訊息變慢，但還是會看我的限動。我不知道他是真的忙，還是已經沒那麼喜歡我了。",
  },
  {
    id: "case_02",
    situation: "不確定 / 跳過",
    text: "我們前幾週每天聊天，但最近他變得很不主動。我問他週末要不要見面，他說再看看，之後就沒下文。",
  },
  {
    id: "case_03",
    situation: "忽冷忽熱",
    text: "他常常已讀不回，可是隔天又會突然丟一句很親密的話，讓我不知道要不要繼續投入。",
  },
  {
    id: "case_04",
    situation: "回訊變慢但看限動",
    text: "我傳了一段比較認真的訊息，他只回「哈哈真的」，但晚上還是有看我的限動。",
  },
  {
    id: "case_05",
    situation: "不確定 / 跳過",
    text: "他說最近工作很忙，但我看到他還是會跟朋友出去。我不知道要不要再主動問一次。",
  },
];

const FORBIDDEN_LANGUAGE_PATTERNS = [
  /他就是不喜歡你/u,
  /他已經不愛你/u,
  /你被拒絕/u,
  /這段關係沒救/u,
  /診斷/u,
  /有病/u,
  /PUA/u,
];

function parseArgs(argv) {
  const args = {
    model: "",
    provider: "anthropic",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const part = argv[index];
    if (part === "--model") {
      args.model = argv[index + 1] ?? "";
      index += 1;
    } else if (part === "--provider") {
      args.provider = argv[index + 1] ?? "anthropic";
      index += 1;
    }
  }

  return args;
}

function loadEnvFile(envPath) {
  const fileText = readFileSync(envPath, "utf8");

  for (const line of fileText.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function stripMarkdownFences(text) {
  const trimmed = text.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed.replace(/^```(?:json)?\s*/u, "").replace(/\s*```$/u, "").trim();
}

function getScoreBucket(score) {
  if (!Number.isFinite(score)) {
    return "unknown";
  }

  if (score <= 25) {
    return "cold";
  }

  if (score <= 50) {
    return "cool";
  }

  if (score <= 75) {
    return "warm";
  }

  return "hot";
}

function detectForbiddenLanguage(result) {
  const resultText = JSON.stringify(result);
  return FORBIDDEN_LANGUAGE_PATTERNS.some((pattern) => pattern.test(resultText));
}

function buildQualityReview(result, schemaOk, forbiddenLanguage) {
  if (!schemaOk) {
    return {
      quality_rating: "fail",
      note: "schema validation failed",
    };
  }

  if (forbiddenLanguage) {
    return {
      quality_rating: "fail",
      note: "forbidden/deterministic language detected",
    };
  }

  const observedSignalsCount = result?.free_result?.observed_signals?.length ?? 0;
  const paidPreviewCount =
    result?.paid_result?.reply_strategies &&
    typeof result.paid_result.reply_strategies === "object"
      ? Object.keys(result.paid_result.reply_strategies).length
      : 0;
  const persona = result?.share_card?.relationship_persona ?? "";
  const shareSentence = result?.share_card?.card_sentence ?? "";

  if (observedSignalsCount !== 3 || paidPreviewCount < 3) {
    return {
      quality_rating: "borderline",
      note: "structure is valid but signal/reply richness is below target",
    };
  }

  if (persona.length < 2 || shareSentence.length < 10) {
    return {
      quality_rating: "borderline",
      note: "schema is valid but persona/share resonance is weak",
    };
  }

  return {
    quality_rating: "pass",
    note: "schema stable and output shape looks usable",
  };
}

async function callAnthropic(prompt, model, apiKey) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content:
            "Return only one valid JSON object matching the provided schema. Do not include markdown fences or commentary.\n\n" +
            prompt,
        },
      ],
    }),
    signal: AbortSignal.timeout(90_000),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorType =
      payload &&
      typeof payload === "object" &&
      payload.error &&
      typeof payload.error === "object" &&
      "type" in payload.error
        ? payload.error.type
        : "provider_error";
    const errorMessage =
      payload &&
      typeof payload === "object" &&
      payload.error &&
      typeof payload.error === "object" &&
      "message" in payload.error &&
      typeof payload.error.message === "string"
        ? payload.error.message
        : "Anthropic request failed.";

    throw new Error(`${errorType}: ${errorMessage}`);
  }

  const textParts =
    payload && typeof payload === "object" && Array.isArray(payload.content)
      ? payload.content
          .filter((item) => item && typeof item === "object" && item.type === "text")
          .map((item) => item.text)
          .filter((item) => typeof item === "string" && item.trim())
      : [];

  if (textParts.length === 0) {
    throw new Error("provider_text_missing: Anthropic response did not contain model text.");
  }

  return {
    text: textParts.join("\n"),
  };
}

async function main() {
  const appRoot = process.cwd();
  const envPath = resolve(appRoot, ".env.local");
  loadEnvFile(envPath);

  const args = parseArgs(process.argv.slice(2));
  const provider = args.provider || process.env.ORADAR_PROVIDER || "anthropic";
  const model = args.model || process.env.ANTHROPIC_MODEL || "";

  if (provider !== "anthropic") {
    throw new Error("This evaluator currently supports only the Anthropic runtime path.");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  if (!model) {
    throw new Error("No model provided and ANTHROPIC_MODEL is missing.");
  }

  const promptTemplate = await readFile(
    resolve(appRoot, "src/lib/ai/assets/product_result_prompt_v0.md"),
    "utf8",
  );
  const schema = JSON.parse(
    await readFile(resolve(appRoot, "src/lib/ai/assets/product_result_schema_v0.json"), "utf8"),
  );
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  const results = [];

  for (const sample of SYNTHETIC_CASES) {
    const requestStartTimestamp = new Date().toISOString();
    const startedAt = performance.now();

    try {
      const prompt = promptTemplate
        .replace("{{RAW_CONTENT}}", sample.text)
        .replace(
          "{{SOURCE_METADATA}}",
          JSON.stringify(
            {
              situation_type: sample.situation,
              input_length: sample.text.length,
              generated_at: requestStartTimestamp,
              experiment_id: "module-01-model-latency-eval-v0",
              variant: "latency-eval",
              model_provider: provider,
              model_name: model,
            },
            null,
            2,
          ),
        );

      const providerResult = await callAnthropic(
        prompt,
        model,
        process.env.ANTHROPIC_API_KEY,
      );

      const endedAt = performance.now();
      const requestEndTimestamp = new Date().toISOString();
      const latencyMs = Math.round(endedAt - startedAt);

      let parsed = null;
      let jsonParseSuccess = false;
      let schemaValidationSuccess = false;
      let schemaErrors = [];

      try {
        parsed = JSON.parse(stripMarkdownFences(providerResult.text));
        jsonParseSuccess = true;
      } catch (error) {
        results.push({
          model,
          sample_id: sample.id,
          request_start_timestamp: requestStartTimestamp,
          request_end_timestamp: requestEndTimestamp,
          latency_ms: latencyMs,
          success: false,
          provider_error_category: "json_parse_failed",
          json_parse_success: false,
          ajv_schema_validation_success: false,
          result_score: null,
          score_bucket: null,
          state_label: null,
          persona: null,
          paid_preview_count: null,
          forbidden_language: null,
          quality_rating: "fail",
          notes: error instanceof Error ? error.message : "JSON parse failed",
        });
        continue;
      }

      schemaValidationSuccess = validate(parsed);
      if (!schemaValidationSuccess) {
        schemaErrors = (validate.errors ?? []).map(
          (error) => `${error.instancePath || "$"} ${error.message ?? "is invalid"}`,
        );
      }

      const forbiddenLanguage = detectForbiddenLanguage(parsed);
      const qualityReview = buildQualityReview(
        parsed,
        schemaValidationSuccess,
        forbiddenLanguage,
      );

      results.push({
        model,
        sample_id: sample.id,
        request_start_timestamp: requestStartTimestamp,
        request_end_timestamp: requestEndTimestamp,
        latency_ms: latencyMs,
        success: jsonParseSuccess && schemaValidationSuccess,
        provider_error_category: schemaValidationSuccess ? null : "schema_validation_failed",
        json_parse_success: jsonParseSuccess,
        ajv_schema_validation_success: schemaValidationSuccess,
        result_score: parsed?.free_result?.temperature_score ?? null,
        score_bucket: getScoreBucket(parsed?.free_result?.temperature_score),
        state_label: parsed?.free_result?.state_label ?? null,
        persona: parsed?.share_card?.relationship_persona ?? null,
        paid_preview_count:
          parsed?.paid_result?.reply_strategies &&
          typeof parsed.paid_result.reply_strategies === "object"
            ? Object.keys(parsed.paid_result.reply_strategies).length
            : 0,
        forbidden_language: forbiddenLanguage,
        quality_rating: qualityReview.quality_rating,
        notes:
          qualityReview.note +
          (schemaErrors.length > 0 ? ` | ${schemaErrors.join(" | ")}` : ""),
        one_sentence_read: parsed?.free_result?.one_sentence_read ?? null,
        share_sentence: parsed?.share_card?.card_sentence ?? null,
      });
    } catch (error) {
      const endedAt = performance.now();
      const requestEndTimestamp = new Date().toISOString();
      const latencyMs = Math.round(endedAt - startedAt);
      const message = error instanceof Error ? error.message : "Unknown provider failure";
      const providerErrorCategory = message.split(":")[0];

      results.push({
        model,
        sample_id: sample.id,
        request_start_timestamp: requestStartTimestamp,
        request_end_timestamp: requestEndTimestamp,
        latency_ms: latencyMs,
        success: false,
        provider_error_category: providerErrorCategory,
        json_parse_success: false,
        ajv_schema_validation_success: false,
        result_score: null,
        score_bucket: null,
        state_label: null,
        persona: null,
        paid_preview_count: null,
        forbidden_language: null,
        quality_rating: "fail",
        notes: message,
      });
    }
  }

  const successLatencies = results.filter((item) => item.success).map((item) => item.latency_ms);
  const sorted = [...successLatencies].sort((a, b) => a - b);
  const median =
    sorted.length === 0
      ? null
      : sorted.length % 2 === 1
        ? sorted[(sorted.length - 1) / 2]
        : Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);

  console.log(
    JSON.stringify(
      {
        provider,
        model,
        sample_count: results.length,
        success_count: results.filter((item) => item.success).length,
        median_latency_ms: median,
        results,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown failure",
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
