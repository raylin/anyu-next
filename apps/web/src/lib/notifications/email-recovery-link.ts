import { LEGAL_CONTACT_EMAIL } from "@/content/legal";
import type { PaymentRecoveryContact } from "@/lib/db/payment-recovery-contacts";
import {
  createPaidResultRecoveryLink,
  getRecentPaidResultRecoveryLinkForContact,
  isPaidResultRecoveryLinkExpired,
  markPaidResultRecoveryLinkFailed,
  markPaidResultRecoveryLinkSent,
} from "@/lib/db/paid-result-recovery-links";
import { decryptRecoveryContactValue } from "@/lib/payments/recovery-contact-crypto";
import { PAID_RESULT_RECOVERY_LINK_TTL_DAYS } from "@/lib/payments/recovery-link-token";

export type EmailRecoveryLinkSendStatus = "sent" | "noop" | "failed" | "duplicate" | "unavailable";

export type EmailSendResult = {
  ok: boolean;
  provider: "noop" | "unsupported";
  status: EmailRecoveryLinkSendStatus;
};

export type EmailMessage = {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
};

const DEFAULT_EMAIL_FROM = LEGAL_CONTACT_EMAIL;

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
  const subject = "你的 ANYU 完整報告已準備好";
  const text = [
    "你的 ANYU 完整報告已準備好。",
    "",
    `報告：${moduleTitle}`,
    `請回到 ANYU 查看：${input.recoveryUrl}`,
    "",
    `此連結將保留 ${PAID_RESULT_RECOVERY_LINK_TTL_DAYS} 天。請勿轉傳給他人。`,
    `如果連結無法開啟，請聯絡 ${LEGAL_CONTACT_EMAIL}。`,
  ].join("\n");
  const html = [
    "<p>你的 ANYU 完整報告已準備好。</p>",
    `<p>報告：${moduleTitle}</p>`,
    `<p><a href="${input.recoveryUrl}">回到 ANYU 查看完整報告</a></p>`,
    `<p>此連結將保留 ${PAID_RESULT_RECOVERY_LINK_TTL_DAYS} 天。請勿轉傳給他人。</p>`,
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

export async function sendRecoveryEmail(input: {
  message: EmailMessage;
  env?: NodeJS.ProcessEnv;
}): Promise<EmailSendResult> {
  const provider = getEmailProvider(input.env);

  if (provider === "noop" || provider === "test") {
    return { ok: true, provider: "noop", status: "noop" };
  }

  return { ok: false, provider: "unsupported", status: "unavailable" };
}

export async function createAndSendEmailRecoveryLink(input: {
  moduleSlug: string;
  moduleTitle?: string;
  analysisResultId: string;
  paymentIntentId?: string | null;
  entitlementId: string;
  recoveryContact: PaymentRecoveryContact;
  env?: NodeJS.ProcessEnv;
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

  const existing = await getRecentPaidResultRecoveryLinkForContact({
    entitlementId: input.entitlementId,
    recoveryContactId: input.recoveryContact.id,
    channel: "email",
  });

  if (existing?.status === "sent" && !isPaidResultRecoveryLinkExpired({ link: existing })) {
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
    await markPaidResultRecoveryLinkFailed({ linkId: link.link.id });

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
    env: input.env,
  });

  if (sendResult.status === "sent") {
    await markPaidResultRecoveryLinkSent({ linkId: link.link.id });
  } else if (!sendResult.ok) {
    await markPaidResultRecoveryLinkFailed({ linkId: link.link.id });
  }

  return {
    ok: sendResult.ok,
    status: sendResult.status,
    provider: sendResult.provider,
    recoveryLinkCreated: true,
    emailSent: sendResult.status === "sent",
  };
}
