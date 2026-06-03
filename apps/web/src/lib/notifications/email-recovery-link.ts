import { LEGAL_CONTACT_EMAIL } from "@/content/legal";
import {
  getEligibleEmailRecoveryContactsForCompletedPaidResult,
  getEligibleLineRecoveryContactsForCompletedPaidResult,
  type PaymentRecoveryContact,
} from "@/lib/db/payment-recovery-contacts";
import {
  createPaidResultRecoveryLink,
  findActivePaidResultAccessLinkForContact,
  markPaidResultRecoveryLinkFailed,
  markPaidResultRecoveryLinkSent,
} from "@/lib/db/paid-result-recovery-links";
import { decryptRecoveryContactValue } from "@/lib/payments/recovery-contact-crypto";
import { PAID_RESULT_RECOVERY_LINK_TTL_DAYS } from "@/lib/payments/recovery-link-token";
import { createAndSendLineRecoveryLink } from "@/lib/notifications/line-recovery-link";

export type EmailRecoveryLinkSendStatus = "sent" | "noop" | "failed" | "duplicate" | "unavailable";

export type EmailSendResult = {
  ok: boolean;
  provider: "noop" | "resend" | "unsupported";
  status: EmailRecoveryLinkSendStatus;
  category?: "missing_config" | "provider_error" | "unsupported_provider";
  providerMessageId?: string | null;
  providerStatus?: string | null;
};

export type EmailMessage = {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
};

const DEFAULT_EMAIL_FROM = LEGAL_CONTACT_EMAIL;
const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";

type EmailFetch = typeof fetch;

function sanitizeProviderMessageId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > 200 || !/^[A-Za-z0-9._:-]+$/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function emailFailureAuditCategory(input: EmailSendResult) {
  if (input.category === "missing_config" || input.category === "unsupported_provider") {
    return "provider_config_missing" as const;
  }

  if (input.providerStatus === "rate_limited") {
    return "rate_limited" as const;
  }

  if (input.providerStatus === "rejected") {
    return "provider_rejected" as const;
  }

  return "provider_request_failed" as const;
}

function getEmailProvider(env: NodeJS.ProcessEnv = process.env) {
  return env.EMAIL_PROVIDER?.trim().toLowerCase() || "noop";
}

function getEmailFrom(env: NodeJS.ProcessEnv = process.env) {
  return env.EMAIL_FROM?.trim() || DEFAULT_EMAIL_FROM;
}

function getAppUrl(env: NodeJS.ProcessEnv = process.env) {
  const configured = env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configured) {
    return null;
  }

  try {
    return new URL(configured).origin;
  } catch {
    return null;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildRecoveryLinkUrl(input: {
  rawToken: string;
  env?: NodeJS.ProcessEnv;
}) {
  const appUrl = getAppUrl(input.env);

  if (!appUrl) {
    return null;
  }

  return `${appUrl}/r/${encodeURIComponent(input.rawToken)}`;
}

export function buildRecoveryLinkEmail(input: {
  to: string;
  recoveryUrl: string;
  moduleTitle?: string;
  from?: string;
}) {
  const moduleTitle = input.moduleTitle ?? "曖昧溫度計";
  const escapedModuleTitle = escapeHtml(moduleTitle);
  const escapedRecoveryUrl = escapeHtml(input.recoveryUrl);
  const subject = "你的 ANYU 完整報告已準備好";
  const text = [
    "你的 ANYU 完整報告已準備好。",
    "",
    `報告：${moduleTitle}`,
    `點此回到 ANYU 查看完整報告：${input.recoveryUrl}`,
    "",
    `此專屬查看連結將保留 ${PAID_RESULT_RECOVERY_LINK_TTL_DAYS} 天。請勿轉傳給他人。`,
    `如果連結無法開啟，請聯絡 ${LEGAL_CONTACT_EMAIL}。`,
  ].join("\n");
  const html = [
    "<p>你的 ANYU 完整報告已準備好。</p>",
    `<p>報告：${escapedModuleTitle}</p>`,
    `<p><a href="${escapedRecoveryUrl}">回到 ANYU 查看完整報告</a></p>`,
    `<p>此專屬查看連結將保留 ${PAID_RESULT_RECOVERY_LINK_TTL_DAYS} 天。請勿轉傳給他人。</p>`,
    `<p>如果連結無法開啟，請聯絡 <a href="mailto:${LEGAL_CONTACT_EMAIL}">${LEGAL_CONTACT_EMAIL}</a>。</p>`,
  ].join("");

  return {
    to: input.to,
    from: input.from ?? DEFAULT_EMAIL_FROM,
    subject,
    text,
    html,
  } satisfies EmailMessage;
}

async function sendResendEmail(input: {
  message: EmailMessage;
  idempotencyKey?: string;
  env: NodeJS.ProcessEnv;
  fetchImpl: EmailFetch;
}): Promise<EmailSendResult> {
  const apiKey = input.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return {
      ok: false,
      provider: "resend",
      status: "unavailable",
      category: "missing_config",
      providerStatus: "config_missing",
    };
  }

  try {
    const response = await input.fetchImpl(RESEND_EMAILS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: input.message.from,
        to: input.message.to,
        subject: input.message.subject,
        html: input.message.html,
        text: input.message.text,
      }),
    });

    if (response.ok) {
      let providerMessageId: string | null = null;

      try {
        const body = await response.clone().json();

        providerMessageId = sanitizeProviderMessageId((body as { id?: unknown }).id);
      } catch {
        providerMessageId = null;
      }

      return {
        ok: true,
        provider: "resend",
        status: "sent",
        providerMessageId,
        providerStatus: "accepted",
      };
    }

    return {
      ok: false,
      provider: "resend",
      status: "failed",
      category: "provider_error",
      providerStatus: response.status === 429 ? "rate_limited" : "rejected",
    };
  } catch {
    return {
      ok: false,
      provider: "resend",
      status: "failed",
      category: "provider_error",
      providerStatus: "request_failed",
    };
  }
}

export async function sendRecoveryEmail(input: {
  message: EmailMessage;
  idempotencyKey?: string;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: EmailFetch;
}): Promise<EmailSendResult> {
  const provider = getEmailProvider(input.env);

  if (provider === "noop" || provider === "test") {
    return { ok: true, provider: "noop", status: "noop", providerStatus: "noop" };
  }

  if (provider === "resend") {
    return sendResendEmail({
      message: input.message,
      idempotencyKey: input.idempotencyKey,
      env: input.env ?? process.env,
      fetchImpl: input.fetchImpl ?? fetch,
    });
  }

  return {
    ok: false,
    provider: "unsupported",
    status: "unavailable",
    category: "unsupported_provider",
    providerStatus: "unsupported",
  };
}

export async function createAndSendEmailRecoveryLink(input: {
  moduleSlug: string;
  moduleTitle?: string;
  analysisResultId: string;
  paymentIntentId?: string | null;
  entitlementId: string;
  recoveryContact: PaymentRecoveryContact;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: EmailFetch;
}) {
  if (input.recoveryContact.contactType !== "email" || !input.recoveryContact.contactEncrypted) {
    return {
      ok: false as const,
      status: "unavailable" as const,
      category: "email_contact_unavailable",
      recoveryLinkCreated: false,
      emailSent: false,
    };
  }

  const existingActiveLink = await findActivePaidResultAccessLinkForContact({
    entitlementId: input.entitlementId,
    recoveryContactId: input.recoveryContact.id,
    channel: "email",
  });

  if (existingActiveLink) {
    return {
      ok: true as const,
      status: "duplicate" as const,
      recoveryLinkCreated: false,
      emailSent: false,
    };
  }

  const link = await createPaidResultRecoveryLink({
    moduleSlug: input.moduleSlug,
    analysisResultId: input.analysisResultId,
    paymentIntentId: input.paymentIntentId,
    entitlementId: input.entitlementId,
    recoveryContactId: input.recoveryContact.id,
    channel: "email",
    env: input.env,
  });
  const recoveryUrl = buildRecoveryLinkUrl({
    rawToken: link.rawToken,
    env: input.env,
  });

  if (!recoveryUrl) {
    await markPaidResultRecoveryLinkFailed({
      linkId: link.link.id,
      failureCategory: "unknown",
      providerStatus: "app_url_unavailable",
    });

    return {
      ok: false as const,
      status: "unavailable" as const,
      category: "app_url_unavailable",
      recoveryLinkCreated: true,
      emailSent: false,
    };
  }

  const email = decryptRecoveryContactValue({
    encryptedValue: input.recoveryContact.contactEncrypted,
    env: input.env,
  });
  const message = buildRecoveryLinkEmail({
    to: email,
    from: getEmailFrom(input.env),
    recoveryUrl,
    moduleTitle: input.moduleTitle,
  });
  const sendResult = await sendRecoveryEmail({
    message,
    idempotencyKey: `paid-result-recovery-link/${link.link.id}`,
    env: input.env,
    fetchImpl: input.fetchImpl,
  });

  if (sendResult.status === "sent") {
    await markPaidResultRecoveryLinkSent({
      linkId: link.link.id,
      providerMessageId: sendResult.providerMessageId,
      providerStatus: sendResult.providerStatus,
    });
  } else if (!sendResult.ok) {
    await markPaidResultRecoveryLinkFailed({
      linkId: link.link.id,
      failureCategory: emailFailureAuditCategory(sendResult),
      providerStatus: sendResult.providerStatus,
    });
  }

  return {
    ok: sendResult.ok,
    status: sendResult.status,
    provider: sendResult.provider,
    recoveryLinkCreated: true,
    emailSent: sendResult.status === "sent",
  };
}

export type CompletedPaidResultRecoveryEmailSendSummary = {
  attempted: number;
  sent: number;
  noop: number;
  duplicate: number;
  failed: number;
  unavailable: number;
  email: {
    attempted: number;
    sent: number;
    noop: number;
    duplicate: number;
    failed: number;
    unavailable: number;
  };
  line: {
    attempted: number;
    sent: number;
    noop: number;
    duplicate: number;
    failed: number;
    unavailable: number;
  };
};

function emptyCompletedPaidResultRecoveryEmailSendSummary(): CompletedPaidResultRecoveryEmailSendSummary {
  const emptyChannel = {
    attempted: 0,
    sent: 0,
    noop: 0,
    duplicate: 0,
    failed: 0,
    unavailable: 0,
  };

  return {
    attempted: 0,
    sent: 0,
    noop: 0,
    duplicate: 0,
    failed: 0,
    unavailable: 0,
    email: { ...emptyChannel },
    line: { ...emptyChannel },
  };
}

function recordRecoverySendSummary(
  summary: CompletedPaidResultRecoveryEmailSendSummary,
  channel: "email" | "line",
  status: EmailRecoveryLinkSendStatus,
) {
  summary[channel].attempted += 1;
  summary.attempted += 1;

  if (status === "sent") {
    summary[channel].sent += 1;
    summary.sent += 1;
  } else if (status === "noop") {
    summary[channel].noop += 1;
    summary.noop += 1;
  } else if (status === "duplicate") {
    summary[channel].duplicate += 1;
    summary.duplicate += 1;
  } else if (status === "unavailable") {
    summary[channel].unavailable += 1;
    summary.unavailable += 1;
  } else {
    summary[channel].failed += 1;
    summary.failed += 1;
  }
}

export async function sendRecoveryLinksForCompletedPaidResult(input: {
  moduleSlug: string;
  moduleTitle?: string;
  analysisResultId: string;
  paymentIntentId?: string | null;
  entitlementId?: string | null;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: EmailFetch;
}): Promise<CompletedPaidResultRecoveryEmailSendSummary> {
  const summary = emptyCompletedPaidResultRecoveryEmailSendSummary();

  if (!input.entitlementId) {
    return summary;
  }

  let contacts: PaymentRecoveryContact[];
  let lineContacts: PaymentRecoveryContact[];

  try {
    contacts = await getEligibleEmailRecoveryContactsForCompletedPaidResult({
      moduleSlug: input.moduleSlug,
      analysisResultId: input.analysisResultId,
      entitlementId: input.entitlementId,
    });
    lineContacts = await getEligibleLineRecoveryContactsForCompletedPaidResult({
      moduleSlug: input.moduleSlug,
      analysisResultId: input.analysisResultId,
      entitlementId: input.entitlementId,
    });
  } catch {
    return summary;
  }

  for (const recoveryContact of contacts) {
    try {
      const result = await createAndSendEmailRecoveryLink({
        moduleSlug: input.moduleSlug,
        moduleTitle: input.moduleTitle,
        analysisResultId: input.analysisResultId,
        paymentIntentId: input.paymentIntentId ?? recoveryContact.paymentIntentId,
        entitlementId: input.entitlementId,
        recoveryContact,
        env: input.env,
        fetchImpl: input.fetchImpl,
      });

      recordRecoverySendSummary(summary, "email", result.status);
    } catch {
      summary.email.attempted += 1;
      summary.email.failed += 1;
      summary.attempted += 1;
      summary.failed += 1;
    }
  }

  for (const recoveryContact of lineContacts) {
    try {
      const result = await createAndSendLineRecoveryLink({
        moduleSlug: input.moduleSlug,
        moduleTitle: input.moduleTitle,
        analysisResultId: input.analysisResultId,
        paymentIntentId: input.paymentIntentId ?? recoveryContact.paymentIntentId,
        entitlementId: input.entitlementId,
        recoveryContact,
        env: input.env,
        fetchImpl: input.fetchImpl,
      });

      recordRecoverySendSummary(summary, "line", result.status);
    } catch {
      summary.line.attempted += 1;
      summary.line.failed += 1;
      summary.attempted += 1;
      summary.failed += 1;
    }
  }

  return summary;
}
