import { desc, eq, or, sql } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { requireDb } from "@/lib/db/client";
import {
  analysisPaidResults,
  analysisResults,
  entitlements,
  events,
  generationJobs,
  paidResultAccessLinks,
  paymentAccessLinkContactSecrets,
  paymentAccessLinkContacts,
  paymentIntents,
} from "@/lib/db/schema";
import { getModuleBySlug } from "@/lib/modules/registry";
import {
  ACCESS_LINK_SAVE_DIAGNOSTIC_EVENT_NAME,
  type AccessLinkSaveDiagnosticSummary,
  summarizeAccessLinkSaveDiagnosticEvents,
} from "@/lib/payments/access-link-save-diagnostic-events";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const TERMINAL_PAYMENT_FAILURE_STATUSES = new Set([
  "failed",
  "cancelled",
  "canceled",
  "expired",
  "refunded",
]);
const PROCESSING_GENERATION_STATUSES = new Set(["queued", "processing", "running"]);

type AccessChannel = "email" | "line";
type DiagnosisCategory =
  | "result_not_found"
  | "payment_not_started"
  | "payment_waiting"
  | "payment_paid_delivery_pending"
  | "paid_processing"
  | "paid_result_ready"
  | "paid_failed"
  | "entitlement_missing"
  | "no_saved_contact"
  | "email_contact_saved"
  | "line_contact_saved"
  | "line_bind_incomplete"
  | "line_recipient_secret_missing"
  | "email_access_link_sent"
  | "line_access_link_sent"
  | "email_access_link_failed"
  | "line_access_link_failed"
  | "access_link_missing"
  | "unknown";
type RecommendedAction =
  | "wait_for_processing"
  | "ask_user_open_email_or_line_view_link"
  | "ask_user_check_email_inbox"
  | "ask_user_check_line_message"
  | "support_review_required"
  | "refund_review_needed"
  | "retry_processor_if_safe"
  | "retry_line_bind_or_use_email"
  | "no_action_needed";

type LookupRows = {
  result: {
    id: string;
    moduleId: string;
    themeSlug: string;
  } | null;
  payments: Array<{
    provider: string;
    moduleSlug: string;
    status: string;
    paidAt: Date | null;
    merchantOrderNo: string | null;
    createdAt: Date;
  }>;
  entitlements: Array<{
    status: string;
    activatedAt: Date | null;
    revokedAt: Date | null;
    refundedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
  }>;
  generationJobs: Array<{
    status: string;
    lastErrorCategory: string | null;
    createdAt: Date;
  }>;
  paidResults: Array<{
    status: string;
    completedAt: Date | null;
    failedAt: Date | null;
    errorCode: string | null;
    createdAt: Date;
  }>;
  contacts: Array<{
    id: string;
    contactType: string;
    status: string;
    transactionalConsentAt: Date;
    createdAt: Date;
  }>;
  contactSecrets: Array<{
    recoveryContactId: string;
    channel: string;
    purpose: string;
    status: string;
    revokedAt: Date | null;
    createdAt: Date;
  }>;
  accessLinks: Array<{
    channel: string;
    status: string;
    expiresAt: Date;
    usedAt: Date | null;
    revokedAt: Date | null;
    sentAt: Date | null;
    sendAttemptCount: number;
    lastFailureCategory: string | null;
    lastProviderStatus: string | null;
    providerMessageId: string | null;
    createdAt: Date;
  }>;
  saveDiagnostics?: Partial<Record<AccessChannel, AccessLinkSaveDiagnosticSummary>>;
};

export type AdminPaidResultLookupResponse = {
  ok: true;
  result: {
    resultId: string;
    moduleSlug: string | null;
    moduleLabel: string | null;
    freeResultExists: boolean;
    paidResultExists: boolean;
    paidResultStatus: string | null;
    deliveryArtifactReady: boolean;
  };
  payment: {
    paymentIntentExists: boolean;
    status: string | null;
    provider: string | null;
    paidAtPresent: boolean;
    merchantOrderNoPresent: boolean;
  };
  entitlement: {
    exists: boolean;
    status: string | null;
    active: boolean;
  };
  generation: {
    jobExists: boolean;
    status: string | null;
    failureCategory: string | null;
  };
  accessLinks: Record<AccessChannel, AccessLinkChannelSummary>;
  diagnosis: DiagnosisCategory[];
  recommendedActions: RecommendedAction[];
};

export type AccessLinkChannelSummary = {
  contactSaved: boolean;
  recipientSecretExists?: boolean;
  deliverable: boolean;
  latestContactStatus: string | null;
  latestSaveCategory: string | null;
  latestSaveStatus: string | null;
  saveAttemptCount: number;
  sent: boolean;
  active: boolean;
  used: boolean;
  revoked: boolean;
  expired: boolean;
  sendAttemptCount: number;
  lastProviderStatus: string | null;
  lastFailureCategory: string | null;
  providerMessageIdPresent: boolean;
};

export function isValidAdminResultId(resultId: string): boolean {
  return UUID_PATTERN.test(resultId);
}

function isExpired(expiresAt: Date | null | undefined, now = new Date()): boolean {
  return Boolean(expiresAt) && Number(expiresAt) <= Number(now);
}

function isActiveLink(
  link: LookupRows["accessLinks"][number] | null | undefined,
  now = new Date(),
): boolean {
  if (!link || link.revokedAt || link.status === "revoked" || link.status === "failed") {
    return false;
  }

  if (isExpired(link.expiresAt, now)) {
    return false;
  }

  return Boolean(link.sentAt || link.usedAt || link.status === "sent" || link.status === "used");
}

function buildChannelSummary(input: {
  channel: AccessChannel;
  contacts: LookupRows["contacts"];
  contactSecrets: LookupRows["contactSecrets"];
  accessLinks: LookupRows["accessLinks"];
  saveDiagnostic?: AccessLinkSaveDiagnosticSummary;
  now?: Date;
}): AccessLinkChannelSummary {
  const now = input.now ?? new Date();
  const allChannelContacts = input.contacts.filter(
    (contact) => contact.contactType === input.channel,
  );
  const latestContact = allChannelContacts[0] ?? null;
  const contacts = allChannelContacts.filter(
    (contact) =>
      contact.status !== "revoked" &&
      contact.status !== "failed" &&
      Boolean(contact.transactionalConsentAt),
  );
  const contactIds = new Set(contacts.map((contact) => contact.id));
  const channelLinks = input.accessLinks.filter((link) => link.channel === input.channel);
  const latestLink = channelLinks[0] ?? null;
  const sent = channelLinks.some((link) => Boolean(link.sentAt) || link.status === "sent" || link.status === "used");
  const active = channelLinks.some((link) => isActiveLink(link, now));
  const used = channelLinks.some((link) => Boolean(link.usedAt) || link.status === "used");
  const revoked = channelLinks.some((link) => Boolean(link.revokedAt) || link.status === "revoked");
  const expired = channelLinks.some((link) => isExpired(link.expiresAt, now));
  const failedLink = channelLinks.find((link) => link.status === "failed" || link.lastFailureCategory);
  const summary: AccessLinkChannelSummary = {
    contactSaved: contacts.length > 0,
    deliverable: contacts.length > 0,
    latestContactStatus: latestContact?.status ?? null,
    latestSaveCategory: input.saveDiagnostic?.latestCategory ?? null,
    latestSaveStatus: input.saveDiagnostic?.latestStatus ?? null,
    saveAttemptCount: input.saveDiagnostic?.eventCount ?? 0,
    sent,
    active,
    used,
    revoked,
    expired,
    sendAttemptCount: channelLinks.reduce(
      (total, link) => total + Number(link.sendAttemptCount ?? 0),
      0,
    ),
    lastProviderStatus: latestLink?.lastProviderStatus ?? null,
    lastFailureCategory: latestLink?.lastFailureCategory ?? failedLink?.lastFailureCategory ?? null,
    providerMessageIdPresent: channelLinks.some((link) => Boolean(link.providerMessageId)),
  };

  if (input.channel === "line") {
    summary.recipientSecretExists = input.contactSecrets.some(
      (secret) =>
        secret.channel === "line" &&
        secret.status === "active" &&
        !secret.revokedAt &&
        contactIds.has(secret.recoveryContactId),
    );
    summary.deliverable = contacts.length > 0 && summary.recipientSecretExists;
  }

  return summary;
}

function unique<T extends string>(items: T[]): T[] {
  return [...new Set(items)];
}

function buildDiagnosisAndActions(input: {
  resultExists: boolean;
  paymentStatus: string | null;
  entitlementExists: boolean;
  paidResultStatus: string | null;
  generationStatus: string | null;
  email: AccessLinkChannelSummary;
  line: AccessLinkChannelSummary;
}): { diagnosis: DiagnosisCategory[]; recommendedActions: RecommendedAction[] } {
  const diagnosis: DiagnosisCategory[] = [];
  const actions: RecommendedAction[] = [];

  if (!input.resultExists) {
    return {
      diagnosis: ["result_not_found"],
      recommendedActions: ["support_review_required"],
    };
  }

  if (!input.paymentStatus) {
    diagnosis.push("payment_not_started");
    actions.push("no_action_needed");
  } else if (TERMINAL_PAYMENT_FAILURE_STATUSES.has(input.paymentStatus)) {
    diagnosis.push("paid_failed");
    actions.push(input.paymentStatus === "refunded" ? "no_action_needed" : "refund_review_needed");
  } else if (input.paymentStatus !== "paid") {
    diagnosis.push("payment_waiting");
    actions.push("wait_for_processing");
  }

  if (input.paymentStatus === "paid" && !input.entitlementExists) {
    diagnosis.push("entitlement_missing");
    actions.push("retry_processor_if_safe");
  }

  if (
    input.paymentStatus === "paid" &&
    input.paidResultStatus !== "completed" &&
    input.generationStatus &&
    PROCESSING_GENERATION_STATUSES.has(input.generationStatus)
  ) {
    diagnosis.push("paid_processing");
    actions.push("wait_for_processing");
  }

  if (input.paymentStatus === "paid" && input.paidResultStatus !== "completed") {
    diagnosis.push("payment_paid_delivery_pending");
    actions.push("retry_processor_if_safe");
  }

  if (input.paidResultStatus === "failed") {
    diagnosis.push("paid_failed");
    actions.push("support_review_required");
  }

  if (input.paidResultStatus === "completed") {
    diagnosis.push("paid_result_ready");
  }

  if (!input.email.contactSaved && !input.line.contactSaved) {
    diagnosis.push("no_saved_contact");
    actions.push("support_review_required");
  }

  if (input.email.contactSaved) {
    diagnosis.push("email_contact_saved");
  }

  if (input.line.contactSaved) {
    diagnosis.push("line_contact_saved");
  }

  if (input.line.contactSaved && !input.line.recipientSecretExists) {
    diagnosis.push("line_bind_incomplete");
    diagnosis.push("line_recipient_secret_missing");
    actions.push("retry_line_bind_or_use_email");
  }

  if (input.email.sent) {
    diagnosis.push("email_access_link_sent");
    actions.push("ask_user_check_email_inbox");
  } else if (input.email.contactSaved && input.email.lastFailureCategory) {
    diagnosis.push("email_access_link_failed");
    actions.push("support_review_required");
  }

  if (input.line.sent) {
    diagnosis.push("line_access_link_sent");
    actions.push("ask_user_check_line_message");
  } else if (
    input.line.contactSaved &&
    input.line.recipientSecretExists &&
    input.line.lastFailureCategory
  ) {
    diagnosis.push("line_access_link_failed");
    actions.push("support_review_required");
  }

  if ((input.email.sent || input.line.sent) && input.paidResultStatus === "completed") {
    actions.push("ask_user_open_email_or_line_view_link");
  }

  if (
    input.paidResultStatus === "completed" &&
    (input.email.contactSaved || input.line.contactSaved) &&
    !input.email.sent &&
    !input.line.sent
  ) {
    diagnosis.push("access_link_missing");
    actions.push("retry_processor_if_safe");
  }

  if (diagnosis.length === 0) {
    diagnosis.push("unknown");
    actions.push("support_review_required");
  }

  return {
    diagnosis: unique(diagnosis),
    recommendedActions: unique(actions.length > 0 ? actions : ["support_review_required"]),
  };
}

export function buildAdminPaidResultLookupSummary(
  rows: LookupRows,
  input: { resultId: string; now?: Date },
): AdminPaidResultLookupResponse {
  const result = rows.result;
  const payment = rows.payments[0] ?? null;
  const entitlement = rows.entitlements[0] ?? null;
  const paidResult = rows.paidResults[0] ?? null;
  const generationJob = rows.generationJobs[0] ?? null;
  const moduleSlug = payment?.moduleSlug ?? result?.themeSlug ?? null;
  const moduleConfig = moduleSlug ? getModuleBySlug(moduleSlug) : undefined;
  const email = buildChannelSummary({
    channel: "email",
    contacts: rows.contacts,
    contactSecrets: rows.contactSecrets,
    accessLinks: rows.accessLinks,
    saveDiagnostic: rows.saveDiagnostics?.email,
    now: input.now,
  });
  const line = buildChannelSummary({
    channel: "line",
    contacts: rows.contacts,
    contactSecrets: rows.contactSecrets,
    accessLinks: rows.accessLinks,
    saveDiagnostic: rows.saveDiagnostics?.line,
    now: input.now,
  });
  const { diagnosis, recommendedActions } = buildDiagnosisAndActions({
    resultExists: Boolean(result),
    paymentStatus: payment?.status ?? null,
    entitlementExists: Boolean(entitlement),
    paidResultStatus: paidResult?.status ?? null,
    generationStatus: generationJob?.status ?? null,
    email,
    line,
  });

  return {
    ok: true,
    result: {
      resultId: input.resultId,
      moduleSlug,
      moduleLabel: moduleConfig?.title ?? null,
      freeResultExists: Boolean(result),
      paidResultExists: Boolean(paidResult),
      paidResultStatus: paidResult?.status ?? null,
      deliveryArtifactReady: paidResult?.status === "completed" && Boolean(paidResult.completedAt),
    },
    payment: {
      paymentIntentExists: Boolean(payment),
      status: payment?.status ?? null,
      provider: payment?.provider ?? null,
      paidAtPresent: Boolean(payment?.paidAt),
      merchantOrderNoPresent: Boolean(payment?.merchantOrderNo),
    },
    entitlement: {
      exists: Boolean(entitlement),
      status: entitlement?.status ?? null,
      active: Boolean(entitlement && entitlement.status === "active" && !entitlement.revokedAt),
    },
    generation: {
      jobExists: Boolean(generationJob),
      status: generationJob?.status ?? null,
      failureCategory: generationJob?.lastErrorCategory ?? null,
    },
    accessLinks: { email, line },
    diagnosis,
    recommendedActions,
  };
}

export async function lookupAdminPaidResultById(
  resultId: string,
  options: { db?: AppDatabase; now?: Date } = {},
): Promise<AdminPaidResultLookupResponse | null> {
  const db = options.db ?? requireDb();
  const [result] = await db
    .select({
      id: analysisResults.id,
      moduleId: analysisResults.moduleId,
      themeSlug: analysisResults.themeSlug,
    })
    .from(analysisResults)
    .where(eq(analysisResults.id, resultId))
    .limit(1);

  if (!result) {
    return null;
  }

  const [
    payments,
    entitlementRows,
    generationJobRows,
    paidResultRows,
    contactRows,
    secretRows,
    accessLinkRows,
    accessLinkSaveDiagnosticRows,
  ] = await Promise.all([
    db
      .select({
        provider: paymentIntents.provider,
        status: paymentIntents.status,
        paidAt: paymentIntents.paidAt,
        merchantOrderNo: paymentIntents.merchantOrderNo,
        moduleSlug: paymentIntents.moduleSlug,
        createdAt: paymentIntents.createdAt,
      })
      .from(paymentIntents)
      .where(eq(paymentIntents.analysisResultId, resultId))
      .orderBy(desc(paymentIntents.createdAt))
      .limit(10),
    db
      .select({
        status: entitlements.status,
        activatedAt: entitlements.activatedAt,
        revokedAt: entitlements.revokedAt,
        refundedAt: entitlements.refundedAt,
        expiresAt: entitlements.expiresAt,
        createdAt: entitlements.createdAt,
      })
      .from(entitlements)
      .where(eq(entitlements.analysisResultId, resultId))
      .orderBy(desc(entitlements.createdAt))
      .limit(10),
    db
      .select({
        status: generationJobs.status,
        lastErrorCategory: generationJobs.lastErrorCategory,
        createdAt: generationJobs.createdAt,
      })
      .from(generationJobs)
      .where(or(eq(generationJobs.inputRefId, resultId), eq(generationJobs.outputRefId, resultId)))
      .orderBy(desc(generationJobs.createdAt))
      .limit(10),
    db
      .select({
        status: analysisPaidResults.status,
        completedAt: analysisPaidResults.completedAt,
        failedAt: analysisPaidResults.failedAt,
        errorCode: analysisPaidResults.errorCode,
        createdAt: analysisPaidResults.createdAt,
      })
      .from(analysisPaidResults)
      .where(eq(analysisPaidResults.analysisResultId, resultId))
      .orderBy(desc(analysisPaidResults.createdAt))
      .limit(10),
    db
      .select({
        id: paymentAccessLinkContacts.id,
        contactType: paymentAccessLinkContacts.contactType,
        status: paymentAccessLinkContacts.status,
        transactionalConsentAt: paymentAccessLinkContacts.transactionalConsentAt,
        createdAt: paymentAccessLinkContacts.createdAt,
      })
      .from(paymentAccessLinkContacts)
      .where(eq(paymentAccessLinkContacts.analysisResultId, resultId))
      .orderBy(desc(paymentAccessLinkContacts.createdAt))
      .limit(20),
    db
      .select({
        recoveryContactId: paymentAccessLinkContactSecrets.recoveryContactId,
        channel: paymentAccessLinkContactSecrets.channel,
        purpose: paymentAccessLinkContactSecrets.purpose,
        status: paymentAccessLinkContactSecrets.status,
        revokedAt: paymentAccessLinkContactSecrets.revokedAt,
        createdAt: paymentAccessLinkContactSecrets.createdAt,
      })
      .from(paymentAccessLinkContactSecrets)
      .innerJoin(
        paymentAccessLinkContacts,
        eq(paymentAccessLinkContactSecrets.recoveryContactId, paymentAccessLinkContacts.id),
      )
      .where(eq(paymentAccessLinkContacts.analysisResultId, resultId))
      .orderBy(desc(paymentAccessLinkContactSecrets.createdAt))
      .limit(20),
    db
      .select({
        channel: paidResultAccessLinks.channel,
        status: paidResultAccessLinks.status,
        expiresAt: paidResultAccessLinks.expiresAt,
        usedAt: paidResultAccessLinks.usedAt,
        revokedAt: paidResultAccessLinks.revokedAt,
        sentAt: paidResultAccessLinks.sentAt,
        sendAttemptCount: paidResultAccessLinks.sendAttemptCount,
        lastFailureCategory: paidResultAccessLinks.lastFailureCategory,
        lastProviderStatus: paidResultAccessLinks.lastProviderStatus,
        providerMessageId: paidResultAccessLinks.providerMessageId,
        createdAt: paidResultAccessLinks.createdAt,
      })
      .from(paidResultAccessLinks)
      .where(eq(paidResultAccessLinks.analysisResultId, resultId))
      .orderBy(desc(paidResultAccessLinks.createdAt))
      .limit(30),
    db
      .select({
        metadataJson: events.metadataJson,
        createdAt: events.createdAt,
      })
      .from(events)
      .where(
        sql`${events.eventName} = ${ACCESS_LINK_SAVE_DIAGNOSTIC_EVENT_NAME} AND ${events.metadataJson}->>'resultId' = ${resultId}`,
      )
      .orderBy(desc(events.createdAt))
      .limit(50),
  ]);

  return buildAdminPaidResultLookupSummary(
    {
      result,
      payments,
      entitlements: entitlementRows,
      generationJobs: generationJobRows,
      paidResults: paidResultRows,
      contacts: contactRows,
      contactSecrets: secretRows,
      accessLinks: accessLinkRows,
      saveDiagnostics: summarizeAccessLinkSaveDiagnosticEvents(accessLinkSaveDiagnosticRows),
    },
    { resultId, now: options.now },
  );
}

export function assertAdminPaidResultLookupResponseIsSafe(
  response: unknown,
): AdminPaidResultLookupResponse {
  const serialized = JSON.stringify(response);
  const forbiddenPatterns = [
    /pa_[A-Za-z0-9_-]{8,}/u,
    /pcs_[A-Za-z0-9_-]{8,}/u,
    /pal_[A-Za-z0-9_-]{8,}/u,
    /prl_[A-Za-z0-9_-]{8,}/u,
    /\/r\/[A-Za-z0-9_-]{12,}/u,
    /token_hash/iu,
    /contact_hash/iu,
    /recipient_hash/iu,
    /encrypted_recipient/iu,
    /contact_encrypted/iu,
    /line_user_id/iu,
    /raw_input/iu,
    /source_text/iu,
    /paid_result_json/iu,
    /provider_payload/iu,
    /tradeinfo/iu,
    /tradesha/iu,
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu,
    /merchant_order_no[":]/iu,
    /provider_message_id[":]/iu,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(serialized)) {
      throw new Error("admin_paid_result_lookup_response_not_sanitized");
    }
  }

  return response as AdminPaidResultLookupResponse;
}
