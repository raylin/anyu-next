import { sql } from "drizzle-orm";
import { requireDb, type AppDatabase } from "@/lib/db/client";
import type { ProductResult } from "@/lib/ai/product-result-schema";

export type RetentionCleanupSummary = {
  ok: true;
  dryRun: boolean;
  analysisRequestsDeleted: number;
  analysisResultsDeleted: number;
  analysisPaidResults: {
    total: number;
    withRetention: number;
    overdue: number;
    eligibleForCleanup: number;
    scrubbed: number;
  };
  startedAt: string;
  finishedAt: string;
  durationMs: number;
};

type CountRow = {
  count: number;
};

type AnalysisPaidResultsRetentionRow = {
  total: number;
  with_retention: number;
  overdue: number;
  eligible_for_cleanup: number;
};

const SCRUBBED_RESULT_PLACEHOLDER: ProductResult = {
  free_result: {
    temperature_score: 50,
    state_label: "分析已過期",
    one_sentence_read: "這份分析已超過保留期限，內容已清除。",
    observed_signals: ["原始分析內容已清除"],
    uncertainty_note: "若你仍需要結果，請重新貼上情境再分析一次。",
    paid_teaser: "完整分析內容已依保留政策清除。",
  },
  insight_layer: {
    title: "內容已清除",
    explanation: "這份分析已超過資料保留期限，原始內容與生成內容已被清除。",
    principle: "僅保留最少必要的非敏感結構資訊。",
    user_facing: true,
  },
  paid_preview: {
    headline: "內容已過期",
    price: "NT$49",
    included_sections: ["完整分析內容已清除"],
    preview_copy: "若你仍想查看新的分析，請重新提交目前的互動情境。",
  },
  paid_result: {
    fullSummary: "完整分析內容已依保留政策清除。",
    possibleStates: [
      {
        label: "內容已清除",
        likelihood: "low",
        explanation: "完整分析內容已依保留政策清除。",
      },
      {
        label: "內容已清除",
        likelihood: "low",
        explanation: "完整分析內容已依保留政策清除。",
      },
      {
        label: "內容已清除",
        likelihood: "low",
        explanation: "完整分析內容已依保留政策清除。",
      },
    ],
    signalDeepDive: [
      {
        title: "內容已清除",
        evidence: "完整分析內容已依保留政策清除。",
        whatItMayMean: "完整分析內容已依保留政策清除。",
      },
      {
        title: "內容已清除",
        evidence: "完整分析內容已依保留政策清除。",
        whatItMayMean: "完整分析內容已依保留政策清除。",
      },
      {
        title: "內容已清除",
        evidence: "完整分析內容已依保留政策清除。",
        whatItMayMean: "完整分析內容已依保留政策清除。",
      },
    ],
    replyStrategies: [
      {
        label: "主動推進",
        tone: "內容已清除",
        whenToUse: "內容已清除",
        whyItWorks: "內容已清除",
        possibleReaction: "內容已清除",
        followUpIfTheyReply: "內容已清除",
        copyableMessages: ["內容已清除", "內容已清除"],
      },
      {
        label: "低壓試探",
        tone: "內容已清除",
        whenToUse: "內容已清除",
        whyItWorks: "內容已清除",
        possibleReaction: "內容已清除",
        followUpIfTheyReply: "內容已清除",
        copyableMessages: ["內容已清除", "內容已清除"],
      },
      {
        label: "暫時拉開",
        tone: "內容已清除",
        whenToUse: "內容已清除",
        whyItWorks: "內容已清除",
        possibleReaction: "內容已清除",
        followUpIfTheyReply: "內容已清除",
        copyableMessages: ["內容已清除", "內容已清除"],
      },
    ],
    next48HourPlan: ["不要依賴已過期的舊分析做判斷。", "如仍需要分析，請重新提交目前情境。", "重新提交前請移除不必要的個人資訊。"],
    avoidDoing: ["不要依賴已過期的舊分析做判斷。", "不要將已清除內容視為目前建議。"],
    softInsight: "這份完整分析已依保留政策清除。",
    summaryCard: {
      headline: "內容已清除",
      body: "這份結果已依保留政策清除。",
      nextMove: "如仍需要分析，請重新提交目前情境。",
    },
  },
  share_card: {
    temperature_label: "資料已過期",
    state_label: "分析已清除",
    relationship_persona: "內容已清除",
    card_sentence: "這份結果已依保留政策清除。",
  },
  personal_pattern_candidate: {
    pattern: "內容已清除",
    confidence: "low",
    evidence: "內容已清除",
    should_store: false,
    user_facing_summary: "這份分析已超過保留期限。",
  },
  metadata: {
    situation_type: "expired_cleanup",
    input_length: 0,
    generated_at: "retention-cleanup",
    experiment_id: "retention-cleanup-v0",
    variant: "B",
    model_provider: "system",
    model_name: "retention-cleanup",
  },
};

function toIsoString(value: Date): string {
  return value.toISOString();
}

export function getRetentionCleanupSecret(env: NodeJS.ProcessEnv = process.env): string | null {
  const secret =
    env.RETENTION_CLEANUP_SECRET?.trim() || env.CRON_SECRET?.trim() || null;

  return secret || null;
}

export function isRetentionCleanupAuthorized(
  authorizationHeader: string | null,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const secret = getRetentionCleanupSecret(env);

  if (!secret || !authorizationHeader) {
    return false;
  }

  const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim();
  return token === secret;
}

async function getCount(
  db: AppDatabase,
  query: ReturnType<typeof sql>,
): Promise<number> {
  const result = await db.execute(query);
  const row = (result.rows[0] ?? null) as CountRow | null;
  return Number(row?.count ?? 0);
}

async function getAnalysisPaidResultsRetentionCounts(
  db: AppDatabase,
  cleanupNow: Date,
): Promise<RetentionCleanupSummary["analysisPaidResults"]> {
  const result = await db.execute(sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE retention_expires_at IS NOT NULL)::int AS with_retention,
      COUNT(*) FILTER (
        WHERE retention_expires_at IS NOT NULL
          AND retention_expires_at < ${cleanupNow}
      )::int AS overdue,
      COUNT(*) FILTER (
        WHERE retention_expires_at IS NOT NULL
          AND retention_expires_at < ${cleanupNow}
          AND paid_result_json IS NOT NULL
      )::int AS eligible_for_cleanup
    FROM public.analysis_paid_results
  `);
  const row = (result.rows[0] ?? null) as AnalysisPaidResultsRetentionRow | null;
  const eligibleForCleanup = Number(row?.eligible_for_cleanup ?? 0);

  return {
    total: Number(row?.total ?? 0),
    withRetention: Number(row?.with_retention ?? 0),
    overdue: Number(row?.overdue ?? 0),
    eligibleForCleanup,
    scrubbed: eligibleForCleanup,
  };
}

export async function runScheduledRetentionCleanup(
  input: {
    dryRun?: boolean;
    now?: Date;
  } = {},
  db: AppDatabase = requireDb(),
): Promise<RetentionCleanupSummary> {
  const startedAtDate = new Date();
  const cleanupNow = input.now ?? startedAtDate;
  const placeholderJson = JSON.stringify(SCRUBBED_RESULT_PLACEHOLDER);

  const analysisRequestsDeleted = await getCount(
    db,
    sql`
      SELECT COUNT(*)::int AS count
      FROM public.analysis_requests
      WHERE retention_expires_at IS NOT NULL
        AND retention_expires_at < ${cleanupNow}
        AND (
          raw_input_redacted IS NOT NULL
          OR anonymous_session_id IS NOT NULL
          OR situation_type IS NOT NULL
          OR cache_key_version IS NOT NULL
          OR cache_key_hash IS NOT NULL
          OR jsonb_array_length(privacy_flags) > 0
          OR deleted_at IS NULL
        )
    `,
  );

  const analysisResultsDeleted = await getCount(
    db,
    sql`
      SELECT COUNT(*)::int AS count
      FROM public.analysis_results
      WHERE retention_expires_at IS NOT NULL
        AND retention_expires_at < ${cleanupNow}
        AND (
          provider_raw_json IS NOT NULL
          OR normalized_result_json IS DISTINCT FROM ${placeholderJson}::jsonb
        )
    `,
  );
  const analysisPaidResults = await getAnalysisPaidResultsRetentionCounts(
    db,
    cleanupNow,
  );

  if (!input.dryRun) {
    if (analysisPaidResults.eligibleForCleanup > 0) {
      await db.execute(sql`
        UPDATE public.analysis_paid_results
        SET paid_result_json = NULL,
            status = 'expired',
            error_code = 'retention_expired',
            updated_at = ${cleanupNow}
        WHERE retention_expires_at IS NOT NULL
          AND retention_expires_at < ${cleanupNow}
          AND paid_result_json IS NOT NULL
      `);
    }

    if (analysisResultsDeleted > 0) {
      await db.execute(sql`
        UPDATE public.analysis_results
        SET normalized_result_json = ${placeholderJson}::jsonb,
            provider_raw_json = NULL
        WHERE retention_expires_at IS NOT NULL
          AND retention_expires_at < ${cleanupNow}
          AND (
            provider_raw_json IS NOT NULL
            OR normalized_result_json IS DISTINCT FROM ${placeholderJson}::jsonb
          )
      `);
    }

    if (analysisRequestsDeleted > 0) {
      await db.execute(sql`
        UPDATE public.analysis_requests
        SET raw_input_redacted = NULL,
            anonymous_session_id = NULL,
            situation_type = NULL,
            privacy_flags = '[]'::jsonb,
            cache_key_version = NULL,
            cache_key_hash = NULL,
            deleted_at = COALESCE(deleted_at, ${cleanupNow})
        WHERE retention_expires_at IS NOT NULL
          AND retention_expires_at < ${cleanupNow}
          AND (
            raw_input_redacted IS NOT NULL
            OR anonymous_session_id IS NOT NULL
            OR situation_type IS NOT NULL
            OR cache_key_version IS NOT NULL
            OR cache_key_hash IS NOT NULL
            OR jsonb_array_length(privacy_flags) > 0
            OR deleted_at IS NULL
          )
      `);
    }
  }

  const finishedAtDate = new Date();

  return {
    ok: true,
    dryRun: Boolean(input.dryRun),
    analysisRequestsDeleted,
    analysisResultsDeleted,
    analysisPaidResults: {
      ...analysisPaidResults,
      scrubbed: input.dryRun ? 0 : analysisPaidResults.eligibleForCleanup,
    },
    startedAt: toIsoString(startedAtDate),
    finishedAt: toIsoString(finishedAtDate),
    durationMs: Math.max(0, finishedAtDate.getTime() - startedAtDate.getTime()),
  };
}
