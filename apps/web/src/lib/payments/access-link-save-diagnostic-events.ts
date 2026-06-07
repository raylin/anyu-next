import { desc, sql } from "drizzle-orm";
import { events } from "@/lib/db/schema";
import { insertEvent } from "@/lib/db/runtime";
import { requireDb } from "@/lib/db/client";
import { getModuleBySlug } from "@/lib/modules/registry";

export type AccessLinkSaveDiagnosticChannel = "email" | "line";
export type AccessLinkSaveDiagnosticCategory =
  | "email_save_started"
  | "email_save_result_not_found"
  | "email_save_context_invalid"
  | "email_save_contact_write_failed"
  | "email_save_contact_saved"
  | "email_save_unexpected_error"
  | "email_save_success"
  | "line_save_contact_only";
export type AccessLinkSaveDiagnosticStatus = "observed" | "succeeded" | "failed";

export type AccessLinkSaveDiagnosticMetadata = {
  resultId: string;
  moduleSlug: string;
  channel: AccessLinkSaveDiagnosticChannel;
  category: AccessLinkSaveDiagnosticCategory;
  status: AccessLinkSaveDiagnosticStatus;
  paymentIntentIdPresent?: boolean;
  contactSaved?: boolean;
  deliverable?: boolean;
  recipientSecretExists?: boolean;
};

export type AccessLinkSaveDiagnosticSummary = {
  channel: AccessLinkSaveDiagnosticChannel;
  latestCategory: AccessLinkSaveDiagnosticCategory;
  latestStatus: AccessLinkSaveDiagnosticStatus;
  eventCount: number;
  latestCreatedAtPresent: boolean;
};

export const ACCESS_LINK_SAVE_DIAGNOSTIC_EVENT_NAME = "access_link_save_diagnostic";

const ACCESS_LINK_SAVE_DIAGNOSTIC_CATEGORIES = [
  "email_save_started",
  "email_save_result_not_found",
  "email_save_context_invalid",
  "email_save_contact_write_failed",
  "email_save_contact_saved",
  "email_save_unexpected_error",
  "email_save_success",
  "line_save_contact_only",
] as const satisfies readonly AccessLinkSaveDiagnosticCategory[];

const PRIVATE_VALUE_PATTERNS = [
  /\b(?:pa|pcs|pal|prl|rlb)_[A-Za-z0-9_-]{8,}\b/u,
  /\/r\/[A-Za-z0-9_-]{12,}/u,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu,
  /lineUserId|idToken|encryptedRecipient|recipientHash|contactHash|TradeInfo|TradeSha/iu,
];

export function isAccessLinkSaveDiagnosticCategory(
  value: unknown,
): value is AccessLinkSaveDiagnosticCategory {
  return (
    typeof value === "string" &&
    ACCESS_LINK_SAVE_DIAGNOSTIC_CATEGORIES.includes(
      value as AccessLinkSaveDiagnosticCategory,
    )
  );
}

export function getAccessLinkSaveDiagnosticStatus(
  category: AccessLinkSaveDiagnosticCategory,
): AccessLinkSaveDiagnosticStatus {
  if (category === "email_save_success" || category === "email_save_contact_saved") {
    return "succeeded";
  }

  if (category === "email_save_started") {
    return "observed";
  }

  return "failed";
}

function assertSafeAccessLinkSaveDiagnosticPayload(value: unknown) {
  const serialized = JSON.stringify(value);

  for (const pattern of PRIVATE_VALUE_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error("access_link_save_diagnostic_payload_not_sanitized");
    }
  }
}

export async function recordAccessLinkSaveDiagnosticEvent(input: {
  moduleSlug: string;
  resultId: string;
  channel: AccessLinkSaveDiagnosticChannel;
  category: AccessLinkSaveDiagnosticCategory;
  paymentIntentIdPresent?: boolean;
  contactSaved?: boolean;
  deliverable?: boolean;
  recipientSecretExists?: boolean;
}) {
  const moduleConfig = getModuleBySlug(input.moduleSlug);

  if (!moduleConfig) {
    return null;
  }

  const metadata: AccessLinkSaveDiagnosticMetadata = {
    resultId: input.resultId,
    moduleSlug: input.moduleSlug,
    channel: input.channel,
    category: input.category,
    status: getAccessLinkSaveDiagnosticStatus(input.category),
  };

  if (typeof input.paymentIntentIdPresent === "boolean") {
    metadata.paymentIntentIdPresent = input.paymentIntentIdPresent;
  }

  if (typeof input.contactSaved === "boolean") {
    metadata.contactSaved = input.contactSaved;
  }

  if (typeof input.deliverable === "boolean") {
    metadata.deliverable = input.deliverable;
  }

  if (typeof input.recipientSecretExists === "boolean") {
    metadata.recipientSecretExists = input.recipientSecretExists;
  }

  assertSafeAccessLinkSaveDiagnosticPayload(metadata);

  return insertEvent({
    eventName: ACCESS_LINK_SAVE_DIAGNOSTIC_EVENT_NAME,
    moduleId: moduleConfig.moduleId,
    themeSlug: moduleConfig.slug,
    experimentId: moduleConfig.experimentId,
    visualVariant: moduleConfig.visualModule,
    promptVersion: moduleConfig.promptVersion,
    schemaVersion: moduleConfig.schemaVersion,
    metadata,
  });
}

export function summarizeAccessLinkSaveDiagnosticEvents(
  input: Array<{
    metadataJson: unknown;
    createdAt: Date | string | null;
  }>,
): Partial<Record<AccessLinkSaveDiagnosticChannel, AccessLinkSaveDiagnosticSummary>> {
  const byChannel = new Map<
    AccessLinkSaveDiagnosticChannel,
    Array<{ category: AccessLinkSaveDiagnosticCategory; createdAt: Date | string | null }>
  >();

  for (const row of input) {
    const metadata =
      row.metadataJson && typeof row.metadataJson === "object" && !Array.isArray(row.metadataJson)
        ? (row.metadataJson as Partial<AccessLinkSaveDiagnosticMetadata>)
        : null;

    if (
      !metadata ||
      (metadata.channel !== "email" && metadata.channel !== "line") ||
      !isAccessLinkSaveDiagnosticCategory(metadata.category)
    ) {
      continue;
    }

    const current = byChannel.get(metadata.channel) ?? [];
    current.push({ category: metadata.category, createdAt: row.createdAt });
    byChannel.set(metadata.channel, current);
  }

  const summary: Partial<Record<AccessLinkSaveDiagnosticChannel, AccessLinkSaveDiagnosticSummary>> = {};

  for (const [channel, rows] of byChannel.entries()) {
    const latest = rows[0];

    if (!latest) {
      continue;
    }

    summary[channel] = {
      channel,
      latestCategory: latest.category,
      latestStatus: getAccessLinkSaveDiagnosticStatus(latest.category),
      eventCount: rows.length,
      latestCreatedAtPresent: Boolean(latest.createdAt),
    };
  }

  assertSafeAccessLinkSaveDiagnosticPayload(summary);
  return summary;
}

export async function lookupAccessLinkSaveDiagnosticsByResultId(resultId: string) {
  const db = requireDb();
  const rows = await db
    .select({
      metadataJson: events.metadataJson,
      createdAt: events.createdAt,
    })
    .from(events)
    .where(
      sql`${events.eventName} = ${ACCESS_LINK_SAVE_DIAGNOSTIC_EVENT_NAME} AND ${events.metadataJson}->>'resultId' = ${resultId}`,
    )
    .orderBy(desc(events.createdAt))
    .limit(50);

  return summarizeAccessLinkSaveDiagnosticEvents(rows);
}
