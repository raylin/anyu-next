import { createHash } from "node:crypto";
import { LEGAL_CONTACT_EMAIL } from "@/content/legal";
import type { PaymentRecoveryStatusSummary } from "@/lib/db/payment-recovery-contacts";

const MODULE_REFERENCE_PREFIX: Record<string, string> = {
  "ambiguous-temperature": "AT",
};

const TAIPEI_TIME_ZONE = "Asia/Taipei";

export type PaidResultDeliverySummary = {
  moduleLabel: string;
  artifactTitle: string;
  statusLabel: "已生成";
  reportReferenceCode: string;
  generatedAtLabel: string;
  recoveryStatus: "saved" | "unsaved" | "needs_retry";
  recoveryStatusLabel: string;
  maskedRecoveryContact: string | null;
  recoveryLinkSent: boolean;
  supportEmail: string;
};

export function getPaidResultDeliverySummary(input: {
  moduleSlug: string;
  moduleLabel: string;
  analysisResultId: string;
  generatedAt?: Date | string | null;
  recoverySummary?: PaymentRecoveryStatusSummary | null;
  recoveryState?: string | null;
}): PaidResultDeliverySummary {
  const generatedAt = parseDate(input.generatedAt) ?? new Date(0);
  const recoveryStatus = getRecoveryStatus(input.recoverySummary);
  const maskedRecoveryContact = input.recoverySummary?.safeDisplayContact?.maskedValue ?? null;

  return {
    moduleLabel: input.moduleLabel,
    artifactTitle: "完整分析報告",
    statusLabel: "已生成",
    reportReferenceCode: createPaidResultReportReference({
      moduleSlug: input.moduleSlug,
      analysisResultId: input.analysisResultId,
      generatedAt,
    }),
    generatedAtLabel: formatGeneratedAtLabel(generatedAt),
    recoveryStatus,
    recoveryStatusLabel: getRecoveryStatusLabel({ recoveryStatus, maskedRecoveryContact }),
    maskedRecoveryContact,
    recoveryLinkSent: input.recoveryState === "email_sent",
    supportEmail: LEGAL_CONTACT_EMAIL,
  };
}

export function createPaidResultReportReference(input: {
  moduleSlug: string;
  analysisResultId: string;
  generatedAt: Date | string;
}) {
  const generatedAt = parseDate(input.generatedAt) ?? new Date(0);
  const prefix = MODULE_REFERENCE_PREFIX[input.moduleSlug] ?? "AR";
  const datePart = formatReferenceDate(generatedAt);
  const digest = createHash("sha256")
    .update(`${input.moduleSlug}:${input.analysisResultId}`)
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();

  return `${prefix}-${datePart}-${digest}`;
}

function getRecoveryStatus(
  recoverySummary?: PaymentRecoveryStatusSummary | null,
): PaidResultDeliverySummary["recoveryStatus"] {
  if (recoverySummary?.recommendedPostPaymentAction === "retry_email") {
    return "needs_retry";
  }

  if (recoverySummary?.hasRecoveryContact) {
    return "saved";
  }

  return "unsaved";
}

function getRecoveryStatusLabel(input: {
  recoveryStatus: PaidResultDeliverySummary["recoveryStatus"];
  maskedRecoveryContact: string | null;
}) {
  if (input.recoveryStatus === "saved") {
    return input.maskedRecoveryContact
      ? `已保存查看連結：${input.maskedRecoveryContact}`
      : "已保存查看連結";
  }

  if (input.recoveryStatus === "needs_retry") {
    return "查看連結需要重新保存";
  }

  return "尚未保存查看連結";
}

function parseDate(input?: Date | string | null) {
  if (!input) {
    return null;
  }

  const parsed = input instanceof Date ? input : new Date(input);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function formatReferenceDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TAIPEI_TIME_ZONE,
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}${month}${day}`;
}

function formatGeneratedAtLabel(date: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TAIPEI_TIME_ZONE,
  }).format(date);
}
