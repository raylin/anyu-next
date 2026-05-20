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

const DEFAULT_CANDIDATE_MODELS = [
  "claude-sonnet-4-20250514",
  "claude-sonnet-4-6",
  "claude-haiku-4-5",
  "claude-haiku-4-5-20251001",
];

const PRICING_BY_FAMILY = [
  {
    match: /^claude-haiku-4-5/u,
    label: "Claude Haiku 4.5",
    inputPricePerMtok: 1,
    outputPricePerMtok: 5,
    cacheWrite5mMultiplier: 1.25,
    cacheWrite1hMultiplier: 2,
    cacheReadMultiplier: 0.1,
  },
  {
    match: /^claude-sonnet-4/u,
    label: "Claude Sonnet 4.x",
    inputPricePerMtok: 3,
    outputPricePerMtok: 15,
    cacheWrite5mMultiplier: 1.25,
    cacheWrite1hMultiplier: 2,
    cacheReadMultiplier: 0.1,
  },
];

function parseArgs(argv) {
  const args = {
    model: "",
    models: [],
    provider: "anthropic",
    discover: false,
    discoverOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const part = argv[index];

    if (part === "--model") {
      args.model = argv[index + 1] ?? "";
      index += 1;
    } else if (part === "--models") {
      const rawValue = argv[index + 1] ?? "";
      args.models = rawValue
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      index += 1;
    } else if (part === "--provider") {
      args.provider = argv[index + 1] ?? "anthropic";
      index += 1;
    } else if (part === "--discover") {
      args.discover = true;
    } else if (part === "--discover-only") {
      args.discover = true;
      args.discoverOnly = true;
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

function getPricingForModel(model) {
  return PRICING_BY_FAMILY.find((entry) => entry.match.test(model)) ?? null;
}

function roundCurrency(value) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function estimateCostUsd(usage, pricing) {
  if (!pricing) {
    return null;
  }

  const inputTokens = usage.input_tokens ?? 0;
  const outputTokens = usage.output_tokens ?? 0;
  const cacheReadTokens = usage.cache_read_input_tokens ?? 0;
  const cacheCreationTokens = usage.cache_creation_input_tokens ?? 0;
  const inputCost =
    (inputTokens / 1_000_000) * pricing.inputPricePerMtok +
    (outputTokens / 1_000_000) * pricing.outputPricePerMtok +
    (cacheReadTokens / 1_000_000) *
      pricing.inputPricePerMtok *
      pricing.cacheReadMultiplier +
    (cacheCreationTokens / 1_000_000) *
      pricing.inputPricePerMtok *
      pricing.cacheWrite5mMultiplier;

  return roundCurrency(inputCost);
}

function getUsage(payload) {
  if (!payload || typeof payload !== "object" || !("usage" in payload)) {
    return {
      input_tokens: null,
      output_tokens: null,
      cache_read_input_tokens: null,
      cache_creation_input_tokens: null,
    };
  }

  const usage = payload.usage;
  if (!usage || typeof usage !== "object") {
    return {
      input_tokens: null,
      output_tokens: null,
      cache_read_input_tokens: null,
      cache_creation_input_tokens: null,
    };
  }

  return {
    input_tokens:
      typeof usage.input_tokens === "number" ? usage.input_tokens : null,
    output_tokens:
      typeof usage.output_tokens === "number" ? usage.output_tokens : null,
    cache_read_input_tokens:
      typeof usage.cache_read_input_tokens === "number"
        ? usage.cache_read_input_tokens
        : null,
    cache_creation_input_tokens:
      typeof usage.cache_creation_input_tokens === "number"
        ? usage.cache_creation_input_tokens
        : null,
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
    usage: getUsage(payload),
    raw: payload,
  };
}

async function discoverAnthropicModels(apiKey) {
  const response = await fetch("https://api.anthropic.com/v1/models", {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    signal: AbortSignal.timeout(30_000),
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
        : "models_api_error";
    const errorMessage =
      payload &&
      typeof payload === "object" &&
      payload.error &&
      typeof payload.error === "object" &&
      "message" in payload.error &&
      typeof payload.error.message === "string"
        ? payload.error.message
        : "Models API request failed.";

    throw new Error(`${errorType}: ${errorMessage}`);
  }

  const models =
    payload && typeof payload === "object" && Array.isArray(payload.data)
      ? payload.data.map((model) => ({
          id: model?.id ?? null,
          display_name: model?.display_name ?? null,
          created_at: model?.created_at ?? null,
          type: model?.type ?? null,
        }))
      : [];

  return models.filter((model) => typeof model.id === "string");
}

function pickModelsToEvaluate(discoveredModelIds, configuredModel, requestedModels) {
  if (requestedModels.length > 0) {
    return [...new Set(requestedModels)];
  }

  const discoveredSet = new Set(discoveredModelIds);
  const picked = [];

  if (configuredModel) {
    picked.push(configuredModel);
  }

  for (const candidate of DEFAULT_CANDIDATE_MODELS) {
    if (discoveredSet.size === 0 || discoveredSet.has(candidate)) {
      picked.push(candidate);
    }
  }

  const haikuDiscovered = discoveredModelIds.find((modelId) =>
    modelId.startsWith("claude-haiku-4-5"),
  );
  if (haikuDiscovered) {
    picked.push(haikuDiscovered);
  }

  const sonnetDiscovered = discoveredModelIds.find((modelId) =>
    modelId.startsWith("claude-sonnet-4-6"),
  );
  if (sonnetDiscovered) {
    picked.push(sonnetDiscovered);
  }

  return [...new Set(picked.filter(Boolean))];
}

function medianOf(values) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length % 2 === 1
    ? sorted[(sorted.length - 1) / 2]
    : Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);
}

function averageOf(values) {
  if (values.length === 0) {
    return null;
  }

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}

function summarizeModelResults(modelResults, pricing) {
  const successful = modelResults.filter((item) => item.success);
  const latencies = successful.map((item) => item.latency_ms);
  const inputTokens = successful
    .map((item) => item.input_tokens)
    .filter((value) => typeof value === "number");
  const outputTokens = successful
    .map((item) => item.output_tokens)
    .filter((value) => typeof value === "number");
  const cacheReadTokens = successful
    .map((item) => item.cache_read_input_tokens)
    .filter((value) => typeof value === "number");
  const cacheCreationTokens = successful
    .map((item) => item.cache_creation_input_tokens)
    .filter((value) => typeof value === "number");
  const requestCosts = successful
    .map((item) => item.estimated_cost_usd)
    .filter((value) => typeof value === "number");
  const qualityCounts = successful.reduce(
    (counts, item) => {
      counts[item.quality_rating] = (counts[item.quality_rating] ?? 0) + 1;
      return counts;
    },
    { pass: 0, borderline: 0, fail: 0 },
  );

  const avgCostPerRequestUsd =
    requestCosts.length > 0
      ? roundCurrency(requestCosts.reduce((sum, value) => sum + value, 0) / requestCosts.length)
      : null;

  return {
    model: modelResults[0]?.model ?? null,
    pricing_class: pricing?.label ?? null,
    sample_count: modelResults.length,
    success_count: successful.length,
    median_latency_ms: medianOf(latencies),
    average_latency_ms: averageOf(latencies),
    average_input_tokens: averageOf(inputTokens),
    average_output_tokens: averageOf(outputTokens),
    average_cache_read_input_tokens: averageOf(cacheReadTokens),
    average_cache_creation_input_tokens: averageOf(cacheCreationTokens),
    average_cost_per_request_usd: avgCostPerRequestUsd,
    estimated_cost_per_1000_usd:
      avgCostPerRequestUsd != null ? roundCurrency(avgCostPerRequestUsd * 1000) : null,
    schema_validation_pass_count: successful.filter(
      (item) => item.ajv_schema_validation_success,
    ).length,
    quality_counts: qualityCounts,
  };
}

async function evaluateModel({
  model,
  provider,
  apiKey,
  promptTemplate,
  validate,
}) {
  const pricing = getPricingForModel(model);
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

      const providerResult = await callAnthropic(prompt, model, apiKey);
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
        const usage = providerResult.usage;
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
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
          cache_read_input_tokens: usage.cache_read_input_tokens,
          cache_creation_input_tokens: usage.cache_creation_input_tokens,
          estimated_cost_usd: estimateCostUsd(usage, pricing),
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
      const usage = providerResult.usage;

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
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cache_read_input_tokens: usage.cache_read_input_tokens,
        cache_creation_input_tokens: usage.cache_creation_input_tokens,
        estimated_cost_usd: estimateCostUsd(usage, pricing),
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
        input_tokens: null,
        output_tokens: null,
        cache_read_input_tokens: null,
        cache_creation_input_tokens: null,
        estimated_cost_usd: null,
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

  return {
    model,
    pricing,
    results,
    summary: summarizeModelResults(results, pricing),
  };
}

async function main() {
  const appRoot = process.cwd();
  const envPath = resolve(appRoot, ".env.local");
  loadEnvFile(envPath);

  const args = parseArgs(process.argv.slice(2));
  const provider = args.provider || process.env.ORADAR_PROVIDER || "anthropic";
  const configuredModel = process.env.ANTHROPIC_MODEL || "";

  if (provider !== "anthropic") {
    throw new Error("This evaluator currently supports only the Anthropic runtime path.");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
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

  let availableModels = [];
  let discoveryError = null;

  if (args.discover) {
    try {
      availableModels = await discoverAnthropicModels(process.env.ANTHROPIC_API_KEY);
    } catch (error) {
      discoveryError = error instanceof Error ? error.message : "Model discovery failed.";
    }
  }

  const discoveredModelIds = availableModels.map((model) => model.id);
  const modelsToEvaluate = args.discoverOnly
    ? []
    : pickModelsToEvaluate(
        discoveredModelIds,
        args.model || configuredModel,
        args.models.length > 0 ? args.models : args.model ? [args.model] : [],
      );

  const evaluations = [];
  for (const model of modelsToEvaluate) {
    evaluations.push(
      await evaluateModel({
        model,
        provider,
        apiKey: process.env.ANTHROPIC_API_KEY,
        promptTemplate,
        validate,
      }),
    );
  }

  console.log(
    JSON.stringify(
      {
        provider,
        configured_model: configuredModel || null,
        discovery_attempted: args.discover,
        discovery_error: discoveryError,
        available_models_found: availableModels,
        models_evaluated: evaluations.map((entry) => entry.model),
        evaluation_summaries: evaluations.map((entry) => entry.summary),
        results: evaluations.flatMap((entry) => entry.results),
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
