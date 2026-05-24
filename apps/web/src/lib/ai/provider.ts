import type { ProviderCallResult } from "@/lib/ai/types";

export class ProviderConfigError extends Error {}
class ProviderRuntimeError extends Error {}

type ProviderName = "anthropic" | "openai";

type ResolvedProvider = {
  name: ProviderName;
  apiKey: string;
  model: string;
};

type ProviderCallOptions = {
  model?: string;
};

export const ANTHROPIC_MAX_OUTPUT_TOKENS = 4096;

function getPreferredProvider(): ProviderName {
  return process.env.ORADAR_PROVIDER === "openai" ? "openai" : "anthropic";
}

function resolveProvider(options: ProviderCallOptions = {}): ResolvedProvider {
  const preferredProvider = getPreferredProvider();
  const requestedModel = options.model?.trim();

  if (preferredProvider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return {
      name: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model:
        requestedModel ??
        process.env.ANTHROPIC_MODEL ??
        "claude-sonnet-4-20250514",
    };
  }

  if (preferredProvider === "openai" && process.env.OPENAI_API_KEY) {
    return {
      name: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: requestedModel ?? process.env.OPENAI_MODEL ?? "gpt-5.5",
    };
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return {
      name: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model:
        requestedModel ??
        process.env.ANTHROPIC_MODEL ??
        "claude-sonnet-4-20250514",
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      name: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: requestedModel ?? process.env.OPENAI_MODEL ?? "gpt-5.5",
    };
  }

  throw new ProviderConfigError("AI provider credentials are not configured.");
}

export function getActiveProviderInfo(): { provider: ProviderName; model: string } {
  const resolvedProvider = resolveProvider();
  return { provider: resolvedProvider.name, model: resolvedProvider.model };
}

async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ProviderRuntimeError("Provider response was not valid JSON.");
  }
}

function extractOpenAiText(payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "output_text" in payload &&
    typeof payload.output_text === "string" &&
    payload.output_text.trim()
  ) {
    return payload.output_text;
  }

  if (payload && typeof payload === "object" && "output" in payload && Array.isArray(payload.output)) {
    const textParts: string[] = [];

    for (const item of payload.output) {
      if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) {
        continue;
      }

      for (const content of item.content) {
        if (
          content &&
          typeof content === "object" &&
          "type" in content &&
          (content.type === "output_text" || content.type === "text") &&
          "text" in content &&
          typeof content.text === "string"
        ) {
          textParts.push(content.text);
        }
      }
    }

    if (textParts.length > 0) {
      return textParts.join("\n");
    }
  }

  throw new ProviderRuntimeError("OpenAI response did not contain model text.");
}

function extractAnthropicText(payload: unknown): string {
  if (payload && typeof payload === "object" && "content" in payload && Array.isArray(payload.content)) {
    const textParts: string[] = [];

    for (const content of payload.content) {
      if (
        content &&
        typeof content === "object" &&
        "type" in content &&
        content.type === "text" &&
        "text" in content &&
        typeof content.text === "string"
      ) {
        textParts.push(content.text);
      }
    }

    if (textParts.length > 0) {
      return textParts.join("\n");
    }
  }

  throw new ProviderRuntimeError("Anthropic response did not contain model text.");
}

async function callOpenAi(prompt: string, provider: ResolvedProvider): Promise<ProviderCallResult> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      input: [
        {
          role: "system",
          content:
            "Return only one valid JSON object matching the provided schema. Do not include markdown fences or commentary.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
    }),
    signal: AbortSignal.timeout(90_000),
  });

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new ProviderRuntimeError("OpenAI request failed.");
  }

  return {
    text: extractOpenAiText(payload),
    provider: "openai",
    model: provider.model,
    rawResponse: payload,
  };
}

async function callAnthropic(prompt: string, provider: ResolvedProvider): Promise<ProviderCallResult> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": provider.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: ANTHROPIC_MAX_OUTPUT_TOKENS,
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

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new ProviderRuntimeError("Anthropic request failed.");
  }

  return {
    text: extractAnthropicText(payload),
    provider: "anthropic",
    model: provider.model,
    rawResponse: payload,
  };
}

export async function callAiProvider(
  prompt: string,
  options: ProviderCallOptions = {},
): Promise<ProviderCallResult> {
  const provider = resolveProvider(options);

  if (provider.name === "anthropic") {
    return callAnthropic(prompt, provider);
  }

  return callOpenAi(prompt, provider);
}

export function isProviderConfigError(error: unknown): error is ProviderConfigError {
  return error instanceof ProviderConfigError;
}

export function getProviderUserMessage(): string {
  return "目前分析服務尚未設定完成，請稍後再試。";
}
