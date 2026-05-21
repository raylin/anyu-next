import { sql } from "drizzle-orm";
import { requireDb, type AppDatabase } from "@/lib/db/client";
import type { ProductResult } from "@/lib/ai/product-result-schema";

export type RetentionCleanupSummary = {
  ok: true;
  dryRun: boolean;
  analysisRequestsDeleted: number;
  analysisResultsDeleted: number;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
};

type CountRow = {
  count: number;
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
    deeper_signal_analysis: "完整分析內容已依保留政策清除。",
    possible_interpretation: "完整分析內容已依保留政策清除。",
    risk_warning: "完整分析內容已依保留政策清除。",
    what_not_to_do: ["不要依賴已過期的舊分析做判斷。"],
    reply_strategies: {
      主動推進: "內容已清除",
      低壓試探: "內容已清除",
      暫時拉開: "內容已清除",
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

  if (!input.dryRun) {
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
    startedAt: toIsoString(startedAtDate),
    finishedAt: toIsoString(finishedAtDate),
    durationMs: Math.max(0, finishedAtDate.getTime() - startedAtDate.getTime()),
  };
}
