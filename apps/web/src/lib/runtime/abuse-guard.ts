import { and, count, eq, gte, isNull } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { analysisRequests } from "@/lib/db/schema";

export const DEFAULT_ANALYSIS_SESSION_DAILY_LIMIT = 3;
export const DEFAULT_ANALYSIS_IP_HOURLY_LIMIT = 10;
export const DEFAULT_ANALYSIS_GLOBAL_DAILY_LIMIT = 200;

export type AnalyzeGuardError =
  | "rate_limited_session"
  | "rate_limited_ip"
  | "daily_cap_reached";

export type AnalyzeGuardResult =
  | { ok: true }
  | { ok: false; error: AnalyzeGuardError; message: string };

type InMemoryWindow = {
  windowStartedAt: number;
  count: number;
};

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const ipHourlyWindow = new Map<string, InMemoryWindow>();

function getPositiveEnvInt(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

export function getAnalysisGuardConfig() {
  return {
    sessionDailyLimit: getPositiveEnvInt(
      "ANALYSIS_SESSION_DAILY_LIMIT",
      DEFAULT_ANALYSIS_SESSION_DAILY_LIMIT,
    ),
    ipHourlyLimit: getPositiveEnvInt(
      "ANALYSIS_IP_HOURLY_LIMIT",
      DEFAULT_ANALYSIS_IP_HOURLY_LIMIT,
    ),
    globalDailyLimit: getPositiveEnvInt(
      "ANALYSIS_GLOBAL_DAILY_LIMIT",
      DEFAULT_ANALYSIS_GLOBAL_DAILY_LIMIT,
    ),
  };
}

export function getClientIpAddress(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp = forwardedFor
      .split(",")
      .map((part) => part.trim())
      .find(Boolean);

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();
  return realIp || null;
}

export function looksLikePromptInjection(input: string): boolean {
  const text = input.toLowerCase();
  const suspiciousPatterns = [
    "ignore previous",
    "ignore all previous",
    "system prompt",
    "developer message",
    "assistant instructions",
    "act as",
    "roleplay as",
    "jailbreak",
    "output exactly",
    "return only json",
    "json schema",
    "請忽略前面的指示",
    "忽略以上規則",
    "忽略之前的內容",
    "系統提示詞",
    "開發者訊息",
    "只回傳 json",
    "只輸出 json",
    "你現在是一個",
  ];

  return suspiciousPatterns.some((pattern) => text.includes(pattern));
}

export function looksLikeUnsupportedRelationshipContent(input: string): boolean {
  const text = input.trim().toLowerCase();
  const relationshipSignals = [
    "他",
    "她",
    "我們",
    "對話",
    "聊天",
    "訊息",
    "回訊",
    "已讀",
    "限動",
    "曖昧",
    "喜歡",
    "冷掉",
    "約",
    "交往",
    "分手",
    "關係",
    "忙",
    "回覆",
    "已經沒那麼喜歡",
    "seen",
    "reply",
    "relationship",
    "dating",
    "ghost",
  ];
  const unsupportedSignals = [
    "履歷",
    "求職",
    "翻譯",
    "寫程式",
    "debug",
    "sql",
    "作業",
    "報告",
    "履歷表",
    "面試",
    "股票",
    "投資",
    "健身",
    "食譜",
    "程式碼",
    "code",
    "program",
    "resume",
    "cover letter",
    "marketing plan",
    "旅行行程",
  ];

  const hasRelationshipSignal = relationshipSignals.some((signal) => text.includes(signal));
  const unsupportedMatches = unsupportedSignals.filter((signal) => text.includes(signal)).length;

  return !hasRelationshipSignal && unsupportedMatches > 0;
}

export function checkIpHourlyLimit(
  ipAddress: string | null,
  limit: number,
  now = Date.now(),
): AnalyzeGuardResult {
  if (!ipAddress) {
    return { ok: true };
  }

  const currentWindow = ipHourlyWindow.get(ipAddress);

  if (!currentWindow || now - currentWindow.windowStartedAt >= ONE_HOUR_MS) {
    ipHourlyWindow.set(ipAddress, { windowStartedAt: now, count: 1 });
    return { ok: true };
  }

  if (currentWindow.count >= limit) {
    return {
      ok: false,
      error: "rate_limited_ip",
      message: "這個裝置或網路剛剛送出太多次，請稍後再試。",
    };
  }

  currentWindow.count += 1;
  ipHourlyWindow.set(ipAddress, currentWindow);
  return { ok: true };
}

export async function checkPersistedAnalyzeLimits(input: {
  moduleId: string;
  themeSlug: string;
  anonymousSessionId?: string | null;
}): Promise<AnalyzeGuardResult> {
  const db = requireDb();
  const config = getAnalysisGuardConfig();
  const dayAgo = new Date(Date.now() - ONE_DAY_MS);

  if (input.anonymousSessionId) {
    const [sessionCountRow] = await db
      .select({ count: count() })
      .from(analysisRequests)
      .where(
        and(
          eq(analysisRequests.moduleId, input.moduleId),
          eq(analysisRequests.themeSlug, input.themeSlug),
          eq(analysisRequests.anonymousSessionId, input.anonymousSessionId),
          gte(analysisRequests.createdAt, dayAgo),
          isNull(analysisRequests.deletedAt),
        ),
      );

    if ((sessionCountRow?.count ?? 0) >= config.sessionDailyLimit) {
      return {
        ok: false,
        error: "rate_limited_session",
        message: "今天已經分析過幾次了，請明天再來看看。",
      };
    }
  }

  const [globalCountRow] = await db
    .select({ count: count() })
    .from(analysisRequests)
    .where(
      and(
        eq(analysisRequests.moduleId, input.moduleId),
        eq(analysisRequests.themeSlug, input.themeSlug),
        gte(analysisRequests.createdAt, dayAgo),
        isNull(analysisRequests.deletedAt),
      ),
    );

  if ((globalCountRow?.count ?? 0) >= config.globalDailyLimit) {
    return {
      ok: false,
      error: "daily_cap_reached",
      message: "今天的體驗名額已滿，請明天再試。",
    };
  }

  return { ok: true };
}

