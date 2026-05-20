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

const STRATEGIES = [
  "direct",
  "retry-on-invalid",
  "repair-on-invalid",
  "sonnet-fallback",
];

function parseArgs(argv) {
  const args = {
    model: "",
    models: [],
    provider: "anthropic",
    discover: false,
    discoverOnly: false,
    strategy: "direct",
    fallbackModel: "claude-sonnet-4-20250514",
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
    } else if (part === "--strategy") {
      args.strategy = argv[index + 1] ?? "direct";
      index += 1;
    } else if (part === "--fallback-model") {
      args.fallbackModel = argv[index + 1] ?? "claude-sonnet-4-20250514";
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

function mergeUsage(...usages) {
  const totals = {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
  };
  let hasAny = false;

  for (const usage of usages) {
    if (!usage) {
      continue;
    }

    for (const key of Object.keys(totals)) {
      const value = usage[key];
      if (typeof value === "number") {
        totals[key] += value;
        hasAny = true;
      }
    }
  }

  return hasAny
    ? totals
    : {
        input_tokens: null,
        output_tokens: null,
        cache_read_input_tokens: null,
        cache_creation_input_tokens: null,
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

function buildProductPrompt(promptTemplate, sample, requestStartTimestamp, provider, model) {
  return promptTemplate
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
}

function buildRepairPrompt(failedOutput, schema) {
  return [
    "Return only one valid JSON object.",
    "Repair the previous malformed output so it matches the required schema exactly.",
    "Do not add explanation or markdown fences.",
    "",
    "Required schema:",
    JSON.stringify(schema, null, 2),
    "",
    "Malformed previous output:",
    failedOutput,
  ].join("\n");
}

function parseAndValidate(text, validate) {
  const parsed = JSON.parse(stripMarkdownFences(text));
  const schemaValidationSuccess = validate(parsed);
  const schemaErrors = schemaValidationSuccess
    ? []
    : (validate.errors ?? []).map(
        (error) => `${error.instancePath || "$"} ${error.message ?? "is invalid"}`,
      );

  return {
    parsed,
    jsonParseSuccess: true,
    schemaValidationSuccess,
    schemaErrors,
  };
}

async function performModelAttempt({
  prompt,
  model,
  apiKey,
  validate,
  phase,
}) {
  const startedAt = performance.now();
  const providerResult = await callAnthropic(prompt, model, apiKey);
  const latencyMs = Math.round(performance.now() - startedAt);
  const usage = providerResult.usage;

  try {
    const parsedResult = parseAndValidate(providerResult.text, validate);
    return {
      phase,
      model,
      latency_ms: latencyMs,
      usage,
      text: providerResult.text,
      success: parsedResult.schemaValidationSuccess,
      provider_error_category: parsedResult.schemaValidationSuccess
        ? null
        : "schema_validation_failed",
      ...parsedResult,
    };
  } catch (error) {
    return {
      phase,
      model,
      latency_ms: latencyMs,
      usage,
      text: providerResult.text,
      success: false,
      provider_error_category: "json_parse_failed",
      jsonParseSuccess: false,
      schemaValidationSuccess: false,
      schemaErrors: [],
      parsed: null,
      notes: error instanceof Error ? error.message : "JSON parse failed",
    };
  }
}

async function executeStrategy({
  strategy,
  model,
  fallbackModel,
  apiKey,
  prompt,
  schema,
  validate,
}) {
  const attempts = [];

  const primary = await performModelAttempt({
    prompt,
    model,
    apiKey,
    validate,
    phase: "primary",
  });
  attempts.push(primary);

  if (primary.success) {
    return attempts;
  }

  if (strategy === "retry-on-invalid" || strategy === "sonnet-fallback") {
    const retry = await performModelAttempt({
      prompt,
      model,
      apiKey,
      validate,
      phase: "retry",
    });
    attempts.push(retry);

    if (retry.success) {
      return attempts;
    }
  }

  if (strategy === "repair-on-invalid" || strategy === "sonnet-fallback") {
    const latestFailed = attempts[attempts.length - 1];
    if (latestFailed.text) {
      const repair = await performModelAttempt({
        prompt: buildRepairPrompt(latestFailed.text, schema),
        model,
        apiKey,
        validate,
        phase: "repair",
      });
      attempts.push(repair);

      if (repair.success) {
        return attempts;
      }
    }
  }

  if (strategy === "sonnet-fallback") {
    const fallback = await performModelAttempt({
      prompt,
      model: fallbackModel,
      apiKey,
      validate,
      phase: "fallback",
    });
    attempts.push(fallback);
  }

  return attempts;
}

function summarizeStrategyResults(results, pricing) {
  const successful = results.filter((item) => item.success);
  const latencies = successful.map((item) => item.total_latency_ms);
  const primaryLatencies = successful.map((item) => item.primary_model_latency_ms);
  const repairLatencies = successful
    .map((item) => item.repair_latency_ms)
    .filter((value) => typeof value === "number");
  const fallbackLatencies = successful
    .map((item) => item.fallback_latency_ms)
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
    strategy: results[0]?.strategy ?? null,
    model: results[0]?.model ?? null,
    fallback_model: results[0]?.fallback_model ?? null,
    pricing_class: pricing?.label ?? null,
    sample_count: results.length,
    success_count: successful.length,
    median_total_latency_ms: medianOf(latencies),
    average_total_latency_ms: averageOf(latencies),
    median_primary_latency_ms: medianOf(primaryLatencies),
    average_repair_latency_ms: averageOf(repairLatencies),
    average_fallback_latency_ms: averageOf(fallbackLatencies),
    estimated_cost_per_1000_usd:
      avgCostPerRequestUsd != null ? roundCurrency(avgCostPerRequestUsd * 1000) : null,
    average_cost_per_request_usd: avgCostPerRequestUsd,
    schema_validation_pass_count: successful.filter(
      (item) => item.ajv_schema_validation_success,
    ).length,
    quality_counts: qualityCounts,
  };
}

async function evaluateModel({
  strategy,
  model,
  fallbackModel,
  provider,
  apiKey,
  promptTemplate,
  schema,
  validate,
}) {
  const pricing = getPricingForModel(model);
  const results = [];

  for (const sample of SYNTHETIC_CASES) {
    const requestStartTimestamp = new Date().toISOString();
    const prompt = buildProductPrompt(
      promptTemplate,
      sample,
      requestStartTimestamp,
      provider,
      model,
    );

    const attempts = await executeStrategy({
      strategy,
      model,
      fallbackModel,
      apiKey,
      prompt,
      schema,
      validate,
    });

    const finalAttempt = attempts[attempts.length - 1];
    const finalSuccess = finalAttempt.success;
    const finalParsed = finalAttempt.parsed ?? null;
    const finalUsage = mergeUsage(...attempts.map((attempt) => attempt.usage));
    const qualityReview = finalSuccess
      ? buildQualityReview(
          finalParsed,
          finalAttempt.schemaValidationSuccess,
          detectForbiddenLanguage(finalParsed),
        )
      : { quality_rating: "fail", note: finalAttempt.notes ?? finalAttempt.provider_error_category };

    results.push({
      strategy,
      model,
      fallback_model: strategy === "sonnet-fallback" ? fallbackModel : null,
      model_sequence_used: attempts.map((attempt) => `${attempt.phase}:${attempt.model}`),
      sample_id: sample.id,
      total_latency_ms: attempts.reduce((sum, attempt) => sum + attempt.latency_ms, 0),
      primary_model_latency_ms:
        attempts.find((attempt) => attempt.phase === "primary")?.latency_ms ?? null,
      repair_latency_ms:
        attempts.find((attempt) => attempt.phase === "repair")?.latency_ms ?? null,
      fallback_latency_ms:
        attempts.find((attempt) => attempt.phase === "fallback")?.latency_ms ?? null,
      success: finalSuccess,
      json_parse_success: finalAttempt.jsonParseSuccess,
      ajv_schema_validation_success: finalAttempt.schemaValidationSuccess,
      input_tokens: finalUsage.input_tokens,
      output_tokens: finalUsage.output_tokens,
      cache_read_input_tokens: finalUsage.cache_read_input_tokens,
      cache_creation_input_tokens: finalUsage.cache_creation_input_tokens,
      repair_input_tokens:
        attempts.find((attempt) => attempt.phase === "repair")?.usage?.input_tokens ?? null,
      repair_output_tokens:
        attempts.find((attempt) => attempt.phase === "repair")?.usage?.output_tokens ?? null,
      fallback_input_tokens:
        attempts.find((attempt) => attempt.phase === "fallback")?.usage?.input_tokens ?? null,
      fallback_output_tokens:
        attempts.find((attempt) => attempt.phase === "fallback")?.usage?.output_tokens ?? null,
      estimated_cost_usd: estimateCostUsd(finalUsage, pricing),
      estimated_cost_per_1000:
        estimateCostUsd(finalUsage, pricing) != null
          ? roundCurrency(estimateCostUsd(finalUsage, pricing) * 1000)
          : null,
      result_score: finalParsed?.free_result?.temperature_score ?? null,
      score_bucket: getScoreBucket(finalParsed?.free_result?.temperature_score),
      state_label: finalParsed?.free_result?.state_label ?? null,
      persona: finalParsed?.share_card?.relationship_persona ?? null,
      paid_preview_count:
        finalParsed?.paid_result?.reply_strategies &&
        typeof finalParsed.paid_result.reply_strategies === "object"
          ? Object.keys(finalParsed.paid_result.reply_strategies).length
          : 0,
      quality_rating: qualityReview.quality_rating,
      notes: qualityReview.note,
      one_sentence_read: finalParsed?.free_result?.one_sentence_read ?? null,
      share_sentence: finalParsed?.share_card?.card_sentence ?? null,
    });
  }

  return {
    strategy,
    model,
    fallbackModel,
    pricing,
    results,
    summary: summarizeStrategyResults(results, pricing),
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

  if (!args.discoverOnly && !STRATEGIES.includes(args.strategy)) {
    throw new Error(`Unsupported strategy: ${args.strategy}`);
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
        strategy: args.strategy,
        model,
        fallbackModel: args.fallbackModel,
        provider,
        apiKey: process.env.ANTHROPIC_API_KEY,
        promptTemplate,
        schema,
        validate,
      }),
    );
  }

  console.log(
    JSON.stringify(
      {
        provider,
        configured_model: configuredModel || null,
        strategy: args.strategy,
        fallback_model: args.fallbackModel,
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
