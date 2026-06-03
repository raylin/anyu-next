import { LEGAL_CONTACT_EMAIL } from "@/content/legal";
import {
  markLineRecoveryRecipientSecretUsed,
  resolveLineRecoveryRecipientForSending,
} from "@/lib/db/payment-recovery-contact-secrets";
import type { PaymentRecoveryContact } from "@/lib/db/payment-recovery-contacts";
import {
  createPaidResultRecoveryLink,
  findActivePaidResultAccessLinkForContact,
  markPaidResultRecoveryLinkFailed,
  markPaidResultRecoveryLinkSent,
} from "@/lib/db/paid-result-recovery-links";
import { PAID_RESULT_RECOVERY_LINK_TTL_DAYS } from "@/lib/payments/recovery-link-token";

export type LineRecoveryLinkSendStatus =
  | "sent"
  | "noop"
  | "failed"
  | "duplicate"
  | "unavailable";

export type LineSendResult = {
  ok: boolean;
  provider: "noop" | "line" | "unsupported";
  status: LineRecoveryLinkSendStatus;
  category?:
    | "missing_config"
    | "provider_error"
    | "unsupported_provider"
    | "recipient_unavailable";
  providerStatus?: string | null;
};

export type LineMessage = {
  to: string;
  text: string;
};

const LINE_PUSH_ENDPOINT = "https://api.line.me/v2/bot/message/push";

type LineFetch = typeof fetch;

function lineFailureAuditCategory(input: LineSendResult) {
  if (input.category === "missing_config" || input.category === "unsupported_provider") {
    return "provider_config_missing" as const;
  }

  if (input.category === "recipient_unavailable") {
    return "recipient_unavailable" as const;
  }

  if (input.providerStatus === "rate_limited") {
    return "rate_limited" as const;
  }

  if (input.providerStatus === "rejected") {
    return "provider_rejected" as const;
  }

  return "provider_request_failed" as const;
}

function getLineRecoveryMessageProvider(env: NodeJS.ProcessEnv = process.env) {
  return env.LINE_RECOVERY_MESSAGE_PROVIDER?.trim().toLowerCase() || "noop";
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

function buildRecoveryLinkUrl(input: {
  rawToken: string;
  env?: NodeJS.ProcessEnv;
}) {
  const appUrl = getAppUrl(input.env);

  if (!appUrl) {
    return null;
  }

  return `${appUrl}/r/${encodeURIComponent(input.rawToken)}`;
}

export const buildPaidResultAccessLinkUrl = buildRecoveryLinkUrl;

export function buildRecoveryLinkLineMessage(input: {
  to: string;
  recoveryUrl: string;
  moduleTitle?: string;
}) {
  const moduleTitle = input.moduleTitle ?? "曖昧溫度計";
  const text = [
    `你的${moduleTitle}完整報告已準備好。`,
    `點這裡回到 ANYU 查看：${input.recoveryUrl}`,
    `此專屬查看連結將保留 ${PAID_RESULT_RECOVERY_LINK_TTL_DAYS} 天，請勿轉傳給他人。`,
    `如果連結無法開啟，請聯絡 ${LEGAL_CONTACT_EMAIL}。`,
  ].join("\n");

  return {
    to: input.to,
    text,
  } satisfies LineMessage;
}

export const buildPaidResultAccessLinkLineMessage = buildRecoveryLinkLineMessage;

async function sendLinePushMessage(input: {
  message: LineMessage;
  env: NodeJS.ProcessEnv;
  fetchImpl: LineFetch;
}): Promise<LineSendResult> {
  const channelAccessToken =
    input.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN?.trim() ||
    input.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();

  if (!channelAccessToken) {
    return {
      ok: false,
      provider: "line",
      status: "unavailable",
      category: "missing_config",
      providerStatus: "config_missing",
    };
  }

  try {
    const response = await input.fetchImpl(LINE_PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${channelAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: input.message.to,
        messages: [
          {
            type: "text",
            text: input.message.text,
          },
        ],
      }),
    });

    if (response.ok) {
      return { ok: true, provider: "line", status: "sent", providerStatus: "accepted" };
    }

    return {
      ok: false,
      provider: "line",
      status: "failed",
      category: "provider_error",
      providerStatus: response.status === 429 ? "rate_limited" : "rejected",
    };
  } catch {
    return {
      ok: false,
      provider: "line",
      status: "failed",
      category: "provider_error",
      providerStatus: "request_failed",
    };
  }
}

export async function sendRecoveryLineMessage(input: {
  message: LineMessage;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: LineFetch;
}): Promise<LineSendResult> {
  const provider = getLineRecoveryMessageProvider(input.env);

  if (provider === "noop" || provider === "test") {
    return { ok: true, provider: "noop", status: "noop", providerStatus: "noop" };
  }

  if (provider === "line") {
    return sendLinePushMessage({
      message: input.message,
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

export const sendLineAccessLink = sendRecoveryLineMessage;

export async function createAndSendLineRecoveryLink(input: {
  moduleSlug: string;
  moduleTitle?: string;
  analysisResultId: string;
  paymentIntentId?: string | null;
  entitlementId: string;
  recoveryContact: PaymentRecoveryContact;
  lineRecipientId?: string | null;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: LineFetch;
}) {
  if (input.recoveryContact.contactType !== "line" || !input.recoveryContact.lineUserHash) {
    return {
      ok: false as const,
      status: "unavailable" as const,
      category: "line_contact_unavailable",
      recoveryLinkCreated: false,
      lineSent: false,
    };
  }

  let lineRecipientId = input.lineRecipientId ?? null;

  if (!lineRecipientId) {
    try {
      lineRecipientId = await resolveLineRecoveryRecipientForSending({
        recoveryContactId: input.recoveryContact.id,
        env: input.env,
      });
    } catch {
      lineRecipientId = null;
    }
  }

  if (!lineRecipientId) {
    return {
      ok: false as const,
      status: "unavailable" as const,
      category: "line_recipient_unavailable",
      providerStatus: "recipient_unavailable",
      recoveryLinkCreated: false,
      lineSent: false,
    };
  }

  const existingActiveLink = await findActivePaidResultAccessLinkForContact({
    entitlementId: input.entitlementId,
    recoveryContactId: input.recoveryContact.id,
    channel: "line",
  });

  if (existingActiveLink) {
    return {
      ok: true as const,
      status: "duplicate" as const,
      recoveryLinkCreated: false,
      lineSent: false,
    };
  }

  const link = await createPaidResultRecoveryLink({
    moduleSlug: input.moduleSlug,
    analysisResultId: input.analysisResultId,
    paymentIntentId: input.paymentIntentId,
    entitlementId: input.entitlementId,
    recoveryContactId: input.recoveryContact.id,
    channel: "line",
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
      lineSent: false,
    };
  }

  const message = buildRecoveryLinkLineMessage({
    to: lineRecipientId,
    recoveryUrl,
    moduleTitle: input.moduleTitle,
  });
  const sendResult = await sendRecoveryLineMessage({
    message,
    env: input.env,
    fetchImpl: input.fetchImpl,
  });

  if (sendResult.status === "sent") {
    await markPaidResultRecoveryLinkSent({
      linkId: link.link.id,
      providerStatus: sendResult.providerStatus,
    });
    await markLineRecoveryRecipientSecretUsed({
      recoveryContactId: input.recoveryContact.id,
    }).catch(() => null);
  } else if (!sendResult.ok) {
    await markPaidResultRecoveryLinkFailed({
      linkId: link.link.id,
      failureCategory: lineFailureAuditCategory(sendResult),
      providerStatus: sendResult.providerStatus,
    });
  }

  return {
    ok: sendResult.ok,
    status: sendResult.status,
    provider: sendResult.provider,
    recoveryLinkCreated: true,
    lineSent: sendResult.status === "sent",
  };
}

export const createAndSendLineAccessLink = createAndSendLineRecoveryLink;
