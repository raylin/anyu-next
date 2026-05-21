import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import {
  bindUnlockIntentToLine,
  getUnlockIntentByCodeHash,
  insertEvent,
  markUnlockIntentDeliveryAttempt,
} from "@/lib/db/runtime";
import { getAppBaseUrl } from "@/lib/line/config";
import { hashFulfillmentSecret, isExpired, isFulfillmentCodeShape, normalizeFulfillmentCode } from "@/lib/line/fulfillment";
import {
  buildLineSuccessMessage,
  LINE_INVALID_CODE_MESSAGE,
  LINE_WEBHOOK_SIGNATURE_HEADER,
  LINE_WELCOME_MESSAGE,
  replyLineText,
  type LineWebhookPayload,
} from "@/lib/line/webhook";
import { getModuleBySlug } from "@/lib/modules/registry";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get(LINE_WEBHOOK_SIGNATURE_HEADER);

  const { verifyLineSignature } = await import("@/lib/line/webhook");
  if (
    !verifyLineSignature({
      body: rawBody,
      signature,
      channelSecret: process.env.LINE_CHANNEL_SECRET,
    })
  ) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ ok: false, error: "config_error" }, { status: 503 });
  }

  let payload: LineWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as LineWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  for (const event of payload.events ?? []) {
    const replyToken = event.replyToken;

    if (event.type === "follow" && replyToken) {
      await replyLineText({
        replyToken,
        text: LINE_WELCOME_MESSAGE,
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      });
      continue;
    }

    if (event.type !== "message" || event.message?.type !== "text" || !replyToken) {
      continue;
    }

    const lineUserId = event.source?.userId;
    const text = event.message.text ?? "";
    const normalizedCode = normalizeFulfillmentCode(text);

    if (!lineUserId || !isFulfillmentCodeShape(normalizedCode)) {
      await replyLineText({
        replyToken,
        text: LINE_INVALID_CODE_MESSAGE,
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      });
      continue;
    }

    const record = await getUnlockIntentByCodeHash(hashFulfillmentSecret(normalizedCode));
    const isCodeExpired = !record || isExpired(record.unlockIntent.fulfillmentExpiresAt);

    if (isCodeExpired) {
      await replyLineText({
        replyToken,
        text: LINE_INVALID_CODE_MESSAGE,
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      });
      continue;
    }

    const unlockTokenExpired = isExpired(record.unlockIntent.unlockTokenExpiresAt);

    if (unlockTokenExpired) {
      await markUnlockIntentDeliveryAttempt({
        unlockIntentId: record.unlockIntent.id,
        status: "failed",
        error: "expired_unlock_token",
      });
      await replyLineText({
        replyToken,
        text: LINE_INVALID_CODE_MESSAGE,
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      });
      continue;
    }

    const moduleConfig = getModuleBySlug(record.unlockIntent.themeSlug);
    const unlockToken = record.unlockIntent.fulfillmentToken;

    if (!unlockToken) {
      await markUnlockIntentDeliveryAttempt({
        unlockIntentId: record.unlockIntent.id,
        status: "failed",
        error: "missing_unlock_token",
      });
      await replyLineText({
        replyToken,
        text: LINE_INVALID_CODE_MESSAGE,
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      });
      continue;
    }

    const publicUrl = `${getAppBaseUrl(request.url)}/m/${record.unlockIntent.themeSlug}/unlock/${unlockToken}`;

    await bindUnlockIntentToLine({
      unlockIntentId: record.unlockIntent.id,
      lineUserId,
      channel: "line_code",
      delivered: false,
    });

    const reply = await replyLineText({
      replyToken,
      text: buildLineSuccessMessage(publicUrl),
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    });

    await markUnlockIntentDeliveryAttempt({
      unlockIntentId: record.unlockIntent.id,
      status: reply.ok ? "delivered" : "failed",
      error: reply.ok ? null : reply.error,
    });

    if (moduleConfig) {
      await insertEvent({
        eventName: "line_webhook_received",
        moduleId: record.unlockIntent.moduleId,
        themeSlug: record.unlockIntent.themeSlug,
        experimentId: moduleConfig.experimentId,
        visualVariant: record.result.visualVariant,
        promptVersion: record.result.promptVersion,
        schemaVersion: record.result.schemaVersion,
        anonymousSessionId: record.unlockIntent.anonymousSessionId,
        scoreBucket: record.result.scoreBucket,
        metadata: {
          resultId: record.unlockIntent.resultId,
          unlockIntentId: record.unlockIntent.id,
          channel: "line_code",
          status: "matched",
        },
      });

      await insertEvent({
        eventName: "fulfillment_code_matched",
        moduleId: record.unlockIntent.moduleId,
        themeSlug: record.unlockIntent.themeSlug,
        experimentId: moduleConfig.experimentId,
        visualVariant: record.result.visualVariant,
        promptVersion: record.result.promptVersion,
        schemaVersion: record.result.schemaVersion,
        anonymousSessionId: record.unlockIntent.anonymousSessionId,
        scoreBucket: record.result.scoreBucket,
        metadata: {
          resultId: record.unlockIntent.resultId,
          unlockIntentId: record.unlockIntent.id,
          channel: "line_code",
          status: reply.ok ? "delivered" : "failed",
          errorCode: reply.ok ? null : reply.error,
        },
      });

      await insertEvent({
        eventName: reply.ok ? "fulfillment_link_delivered" : "fulfillment_failed",
        moduleId: record.unlockIntent.moduleId,
        themeSlug: record.unlockIntent.themeSlug,
        experimentId: moduleConfig.experimentId,
        visualVariant: record.result.visualVariant,
        promptVersion: record.result.promptVersion,
        schemaVersion: record.result.schemaVersion,
        anonymousSessionId: record.unlockIntent.anonymousSessionId,
        scoreBucket: record.result.scoreBucket,
        metadata: {
          resultId: record.unlockIntent.resultId,
          unlockIntentId: record.unlockIntent.id,
          channel: "line_code",
          status: reply.ok ? "delivered" : "failed",
          errorCode: reply.ok ? null : reply.error,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
