import { createHmac, timingSafeEqual } from "node:crypto";

export const LINE_WEBHOOK_SIGNATURE_HEADER = "x-line-signature";

export type LineWebhookEvent =
  | {
      type: "follow";
      webhookEventId?: string;
      timestamp?: number;
      replyToken?: string;
      source?: { userId?: string };
    }
  | {
      type: "message";
      webhookEventId?: string;
      timestamp?: number;
      replyToken?: string;
      source?: { userId?: string };
      message?: { type?: string; text?: string };
    }
  | {
      type: string;
      webhookEventId?: string;
      timestamp?: number;
      replyToken?: string;
      source?: { userId?: string };
      message?: { type?: string; text?: string };
    };

export type LineWebhookPayload = {
  events?: LineWebhookEvent[];
};

export function verifyLineSignature(input: {
  body: string;
  signature: string | null;
  channelSecret: string | undefined;
}): boolean {
  const channelSecret = input.channelSecret?.trim();

  if (!channelSecret || !input.signature) {
    return false;
  }

  const expected = createHmac("sha256", channelSecret).update(input.body).digest("base64");
  const left = Buffer.from(input.signature);
  const right = Buffer.from(expected);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export async function replyLineText(input: {
  replyToken: string;
  text: string;
  channelAccessToken: string | undefined;
}) {
  const channelAccessToken = input.channelAccessToken?.trim();

  if (!channelAccessToken) {
    return { ok: false, error: "missing_channel_access_token" };
  }

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      replyToken: input.replyToken,
      messages: [{ type: "text", text: input.text }],
    }),
  });

  if (!response.ok) {
    return { ok: false, error: "line_reply_failed" };
  }

  return { ok: true };
}

export const LINE_WELCOME_MESSAGE =
  "歡迎來到暗語 ANYU。\n請貼上剛剛頁面上的短碼，我會把完整分析連結送給你。";

export function buildLineSuccessMessage(url: string) {
  return `收到，這是你的完整分析連結：\n${url}`;
}

export const LINE_INVALID_CODE_MESSAGE =
  "我找不到這組短碼。請回到剛剛的結果頁重新產生一次，或改用 Email 接收。";

export const LINE_RATE_LIMITED_MESSAGE =
  "短時間內嘗試太多次了。請稍等一下，再回到結果頁重新產生短碼。";
