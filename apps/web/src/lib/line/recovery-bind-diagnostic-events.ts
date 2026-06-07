import { and, desc, eq, sql } from "drizzle-orm";
import { events } from "@/lib/db/schema";
import { insertEvent } from "@/lib/db/runtime";
import { requireDb } from "@/lib/db/client";
import type { LineRecoveryBindStatePayload } from "@/lib/line/recovery-bind-state";
import {
  type LineRecoveryBindDiagnosticCategory,
} from "@/lib/line/recovery-bind-diagnostics";
import { getModuleBySlug } from "@/lib/modules/registry";

export type LineBindDiagnosticSource = "client" | "server";
export type LineBindDiagnosticStage =
  | "liff_sdk"
  | "liff_init"
  | "liff_login"
  | "liff_state"
  | "id_token"
  | "bind_api"
  | "recipient_secret";
export type LineBindDiagnosticEventStatus = "observed" | "succeeded" | "failed";

export type LineBindDiagnosticMetadata = {
  resultId: string;
  moduleSlug: string;
  source: LineBindDiagnosticSource;
  category: LineRecoveryBindDiagnosticCategory;
  stage: LineBindDiagnosticStage;
  status: LineBindDiagnosticEventStatus;
  hasLiffState?: boolean;
  hasIdToken?: boolean;
  bindApiReached?: boolean;
  recipientSecretRequired?: boolean;
  recipientSecretCreated?: boolean;
};

export type LineBindDiagnosticSummary = {
  ok: true;
  resultId: string;
  moduleSlug: string;
  latestCategory: LineRecoveryBindDiagnosticCategory;
  latestStage: LineBindDiagnosticStage;
  latestStatus: LineBindDiagnosticEventStatus;
  eventCount: number;
  latestCreatedAtPresent: boolean;
  latestCreatedAt: string | null;
  categories: Array<{
    category: LineRecoveryBindDiagnosticCategory;
    count: number;
  }>;
  recommendedActions: string[];
};

export const LINE_BIND_DIAGNOSTIC_EVENT_NAME = "line_bind_diagnostic";

const LINE_BIND_DIAGNOSTIC_CATEGORIES = [
  "liff_sdk_load_failed",
  "liff_init_failed",
  "liff_login_redirect_started",
  "liff_state_missing",
  "liff_state_invalid",
  "liff_state_expired",
  "id_token_missing_after_login",
  "bind_api_reached",
  "bind_api_state_valid",
  "bind_api_state_missing",
  "bind_api_state_invalid",
  "bind_api_line_identity_missing",
  "bind_api_id_token_verified",
  "bind_api_contact_saved",
  "bind_api_recipient_secret_write_started",
  "bind_api_recipient_secret_failed",
  "bind_api_contact_marked_failed_after_secret_failure",
  "bind_api_recipient_secret_created",
  "bind_api_failed",
  "bind_success",
] as const satisfies readonly LineRecoveryBindDiagnosticCategory[];

const PRIVATE_VALUE_PATTERNS = [
  /\b(?:pa|pcs|pal|prl|rlb)_[A-Za-z0-9_-]{8,}\b/u,
  /\/r\/[A-Za-z0-9_-]{12,}/u,
  /lineUserId|encryptedRecipient|recipientHash|contactHash|TradeInfo|TradeSha/iu,
  /"idToken"\s*:/iu,
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/u,
];

export function isLineBindDiagnosticCategory(
  value: unknown,
): value is LineRecoveryBindDiagnosticCategory {
  return (
    typeof value === "string" &&
    LINE_BIND_DIAGNOSTIC_CATEGORIES.includes(value as LineRecoveryBindDiagnosticCategory)
  );
}

export function getLineBindDiagnosticStage(
  category: LineRecoveryBindDiagnosticCategory,
): LineBindDiagnosticStage {
  switch (category) {
    case "liff_sdk_load_failed":
      return "liff_sdk";
    case "liff_init_failed":
      return "liff_init";
    case "liff_login_redirect_started":
      return "liff_login";
    case "liff_state_missing":
    case "liff_state_invalid":
    case "liff_state_expired":
    case "bind_api_state_missing":
    case "bind_api_state_invalid":
    case "bind_api_state_valid":
      return "liff_state";
    case "id_token_missing_after_login":
    case "bind_api_line_identity_missing":
    case "bind_api_id_token_verified":
      return "id_token";
    case "bind_api_recipient_secret_write_started":
    case "bind_api_recipient_secret_failed":
    case "bind_api_contact_marked_failed_after_secret_failure":
    case "bind_api_recipient_secret_created":
      return "recipient_secret";
    case "bind_api_reached":
    case "bind_api_contact_saved":
    case "bind_api_failed":
    case "bind_success":
    default:
      return "bind_api";
  }
}

export function getLineBindDiagnosticStatus(
  category: LineRecoveryBindDiagnosticCategory,
): LineBindDiagnosticEventStatus {
  if (category === "bind_success") {
    return "succeeded";
  }

  if (
    category === "liff_login_redirect_started" ||
    category === "bind_api_reached" ||
    category === "bind_api_state_valid" ||
    category === "bind_api_id_token_verified" ||
    category === "bind_api_contact_saved" ||
    category === "bind_api_recipient_secret_write_started"
  ) {
    return "observed";
  }

  if (category === "bind_api_recipient_secret_created") {
    return "succeeded";
  }

  return "failed";
}

function assertSafeLineBindDiagnosticPayload(value: unknown) {
  const serialized = JSON.stringify(value);

  for (const pattern of PRIVATE_VALUE_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error("line_bind_diagnostic_payload_not_sanitized");
    }
  }
}

function metadataFromInput(input: {
  state: LineRecoveryBindStatePayload;
  source: LineBindDiagnosticSource;
  category: LineRecoveryBindDiagnosticCategory;
  hasLiffState?: boolean;
  hasIdToken?: boolean;
  bindApiReached?: boolean;
  recipientSecretRequired?: boolean;
  recipientSecretCreated?: boolean;
}): LineBindDiagnosticMetadata {
  const metadata: LineBindDiagnosticMetadata = {
    resultId: input.state.resultId,
    moduleSlug: input.state.moduleSlug,
    source: input.source,
    category: input.category,
    stage: getLineBindDiagnosticStage(input.category),
    status: getLineBindDiagnosticStatus(input.category),
  };

  if (typeof input.hasLiffState === "boolean") {
    metadata.hasLiffState = input.hasLiffState;
  }

  if (typeof input.hasIdToken === "boolean") {
    metadata.hasIdToken = input.hasIdToken;
  }

  if (typeof input.bindApiReached === "boolean") {
    metadata.bindApiReached = input.bindApiReached;
  }

  if (typeof input.recipientSecretRequired === "boolean") {
    metadata.recipientSecretRequired = input.recipientSecretRequired;
  }

  if (typeof input.recipientSecretCreated === "boolean") {
    metadata.recipientSecretCreated = input.recipientSecretCreated;
  }

  assertSafeLineBindDiagnosticPayload(metadata);
  return metadata;
}

export async function recordLineBindDiagnosticEvent(input: {
  state: LineRecoveryBindStatePayload;
  source: LineBindDiagnosticSource;
  category: LineRecoveryBindDiagnosticCategory;
  hasLiffState?: boolean;
  hasIdToken?: boolean;
  bindApiReached?: boolean;
  recipientSecretRequired?: boolean;
  recipientSecretCreated?: boolean;
}) {
  const moduleConfig = getModuleBySlug(input.state.moduleSlug);

  if (!moduleConfig) {
    return null;
  }

  const metadata = metadataFromInput(input);

  return insertEvent({
    eventName: LINE_BIND_DIAGNOSTIC_EVENT_NAME,
    moduleId: moduleConfig.moduleId,
    themeSlug: moduleConfig.slug,
    experimentId: moduleConfig.experimentId,
    visualVariant: moduleConfig.visualModule,
    promptVersion: moduleConfig.promptVersion,
    schemaVersion: moduleConfig.schemaVersion,
    metadata,
  });
}

export function summarizeLineBindDiagnosticEvents(
  input: Array<{
    metadataJson: unknown;
    themeSlug: string;
    createdAt: Date | string | null;
  }>,
): LineBindDiagnosticSummary | null {
  const sanitized = input
    .map((row) => {
      const metadata =
        row.metadataJson && typeof row.metadataJson === "object" && !Array.isArray(row.metadataJson)
          ? (row.metadataJson as Partial<LineBindDiagnosticMetadata>)
          : null;

      if (
        !metadata ||
        typeof metadata.resultId !== "string" ||
        typeof metadata.moduleSlug !== "string" ||
        !isLineBindDiagnosticCategory(metadata.category)
      ) {
        return null;
      }

      const stage = getLineBindDiagnosticStage(metadata.category);
      const status = getLineBindDiagnosticStatus(metadata.category);

      return {
        resultId: metadata.resultId,
        moduleSlug: metadata.moduleSlug,
        category: metadata.category,
        stage,
        status,
        createdAt: row.createdAt,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (sanitized.length === 0) {
    return null;
  }

  const latest = sanitized[0];
  const counts = new Map<LineRecoveryBindDiagnosticCategory, number>();

  for (const event of sanitized) {
    counts.set(event.category, (counts.get(event.category) ?? 0) + 1);
  }

  const latestCreatedAt =
    latest.createdAt instanceof Date
      ? latest.createdAt.toISOString()
      : typeof latest.createdAt === "string"
        ? latest.createdAt
        : null;

  const summary: LineBindDiagnosticSummary = {
    ok: true,
    resultId: latest.resultId,
    moduleSlug: latest.moduleSlug,
    latestCategory: latest.category,
    latestStage: latest.stage,
    latestStatus: latest.status,
    eventCount: sanitized.length,
    latestCreatedAtPresent: Boolean(latestCreatedAt),
    latestCreatedAt,
    categories: Array.from(counts.entries()).map(([category, count]) => ({
      category,
      count,
    })),
    recommendedActions: getLineBindDiagnosticRecommendedActions(latest.category),
  };

  assertSafeLineBindDiagnosticPayload(summary);
  return summary;
}

export function getLineBindDiagnosticRecommendedActions(
  category: LineRecoveryBindDiagnosticCategory,
) {
  switch (category) {
    case "bind_success":
      return ["no_action_needed"];
    case "bind_api_reached":
    case "bind_api_state_valid":
    case "bind_api_id_token_verified":
    case "bind_api_contact_saved":
    case "bind_api_recipient_secret_write_started":
      return ["wait_for_line_bind_completion"];
    case "bind_api_recipient_secret_created":
      return ["wait_for_bind_success"];
    case "liff_sdk_load_failed":
    case "liff_init_failed":
      return ["check_liff_channel_config", "retry_line_bind", "use_email_fallback"];
    case "liff_login_redirect_started":
      return ["wait_for_line_login_return"];
    case "liff_state_missing":
    case "liff_state_invalid":
    case "liff_state_expired":
    case "bind_api_state_missing":
    case "bind_api_state_invalid":
      return ["check_liff_redirect_state", "retry_line_bind", "use_email_fallback"];
    case "id_token_missing_after_login":
    case "bind_api_line_identity_missing":
      return ["retry_line_bind", "use_email_fallback", "check_liff_channel_config"];
    case "bind_api_recipient_secret_failed":
    case "bind_api_contact_marked_failed_after_secret_failure":
    case "bind_api_failed":
    default:
      return ["retry_line_bind", "use_email_fallback", "support_review_required"];
  }
}

export async function lookupLineBindDiagnosticsByResultId(resultId: string) {
  const db = requireDb();
  const rows = await db
    .select({
      metadataJson: events.metadataJson,
      themeSlug: events.themeSlug,
      createdAt: events.createdAt,
    })
    .from(events)
    .where(
      and(
        eq(events.eventName, LINE_BIND_DIAGNOSTIC_EVENT_NAME),
        sql`${events.metadataJson}->>'resultId' = ${resultId}`,
      ),
    )
    .orderBy(desc(events.createdAt))
    .limit(50);

  return summarizeLineBindDiagnosticEvents(rows);
}
