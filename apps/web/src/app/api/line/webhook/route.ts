import { NextResponse } from "next/server";
import { after } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import {
  bindUnlockIntentToLine,
  getUnlockIntentByCodeHash,
  insertEvent,
  markUnlockIntentDeliveryAttempt,
  markLineWebhookEventProcessed,
  recordLineWebhookInvalidAttempt,
  tryCreateLineWebhookEvent,
} from "@/lib/db/runtime";
import { buildModuleUnlockPath, getAppBaseUrl } from "@/lib/line/config";
import { hashFulfillmentSecret, isExpired, isFulfillmentCodeShape, normalizeFulfillmentCode } from "@/lib/line/fulfillment";
import {
  getModuleThemeEventMetadata,
  getModuleThemeFromUnlockToken,
  normalizeModuleThemeSource,
} from "@/lib/modules/module-theme";
import {
  buildLineWebhookDedupeKey,
  getLineWebhookRateWindowStart,
  isLineWebhookRateLimited,
} from "@/lib/line/webhook-hardening";
import {
  buildLinePendingMessage,
  LINE_INVALID_CODE_MESSAGE,
  LINE_RATE_LIMITED_MESSAGE,
  LINE_WEBHOOK_SIGNATURE_HEADER,
  LINE_WELCOME_MESSAGE,
  replyLineText,
  type LineWebhookPayload,
} from "@/lib/line/webhook";
import { getModuleBySlug } from "@/lib/modules/registry";
import { requestDeferredPaidGeneration } from "@/lib/modules/paid-generation-service";

function scheduleAfterResponse(task: () => Promise<void>) {
  try {
    after(task);
  } catch {
    // Unit tests run outside Next's request async-storage. Production uses `after`;
    // tests fall back to fire-and-forget without blocking route assertions.
    void task();
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get(LINE_WEBHOOK_SIGNATURE_HEADER);
  let payload: LineWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as LineWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (Array.isArray(payload.events) && payload.events.length === 0) {
    return NextResponse.json({ ok: true });
  }

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

  for (const event of payload.events ?? []) {
    const dedupeKey = buildLineWebhookDedupeKey(event);
    const dedupeStatus = await tryCreateLineWebhookEvent({
      dedupeKey,
      eventType: event.type,
    });

    if (dedupeStatus === "duplicate") {
      continue;
    }

    const replyToken = event.replyToken;

    if (event.type === "follow" && replyToken) {
      const reply = await replyLineText({
        replyToken,
        text: LINE_WELCOME_MESSAGE,
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      });
      await markLineWebhookEventProcessed({
        dedupeKey,
        status: reply.ok ? "processed" : "failed",
        errorCode: reply.ok ? null : reply.error,
      });
      continue;
    }

    if (event.type !== "message" || event.message?.type !== "text" || !replyToken) {
      await markLineWebhookEventProcessed({ dedupeKey, status: "ignored" });
      continue;
    }

    const lineUserId = event.source?.userId;
    const text = event.message.text ?? "";
    const normalizedCode = normalizeFulfillmentCode(text);

    if (!lineUserId || !isFulfillmentCodeShape(normalizedCode)) {
      const limited = lineUserId ? await recordInvalidAttempt(lineUserId) : false;
      const reply = await replyLineText({
        replyToken,
        text: limited ? LINE_RATE_LIMITED_MESSAGE : LINE_INVALID_CODE_MESSAGE,
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      });
      await markLineWebhookEventProcessed({
        dedupeKey,
        status: limited ? "rate_limited" : reply.ok ? "processed" : "failed",
        errorCode: limited ? "rate_limited" : reply.ok ? null : reply.error,
      });
      continue;
    }

    const record = await getUnlockIntentByCodeHash(hashFulfillmentSecret(normalizedCode));
    const isCodeExpired = !record || isExpired(record.unlockIntent.fulfillmentExpiresAt);

    if (isCodeExpired) {
      const limited = await recordInvalidAttempt(lineUserId);
      const reply = await replyLineText({
        replyToken,
        text: limited ? LINE_RATE_LIMITED_MESSAGE : LINE_INVALID_CODE_MESSAGE,
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      });
      await markLineWebhookEventProcessed({
        dedupeKey,
        status: limited ? "rate_limited" : reply.ok ? "processed" : "failed",
        errorCode: limited ? "rate_limited" : reply.ok ? null : reply.error,
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
      await markLineWebhookEventProcessed({
        dedupeKey,
        status: "failed",
        errorCode: "expired_unlock_token",
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
      await markLineWebhookEventProcessed({
        dedupeKey,
        status: "failed",
        errorCode: "missing_unlock_token",
      });
      continue;
    }

    const tokenTheme = getModuleThemeFromUnlockToken(unlockToken);
    const themeVariant = tokenTheme?.variant ?? null;
    const themeSource = normalizeModuleThemeSource(tokenTheme?.source ?? "query_hint");
    const publicUrl = `${getAppBaseUrl(request.url)}${buildModuleUnlockPath({
      moduleSlug: record.unlockIntent.themeSlug,
      unlockToken,
      themeVariant,
      themeSource,
    })}`;
    const themeMetadata = themeVariant
      ? {
          ...getModuleThemeEventMetadata({ variant: themeVariant, source: themeSource }),
          themeCarryoverSource: "unlock_intent",
        }
      : {};

    await bindUnlockIntentToLine({
      unlockIntentId: record.unlockIntent.id,
      lineUserId,
      channel: "line_code",
      delivered: false,
    });

    if (moduleConfig) {
      scheduleAfterResponse(async () => {
        await requestDeferredPaidGeneration({
          moduleConfig,
          resultId: record.unlockIntent.resultId,
          unlockIntentId: record.unlockIntent.id,
          triggerSource: "short_code",
        });
      });
    }

    const reply = await replyLineText({
      replyToken,
      text: buildLinePendingMessage(publicUrl),
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    });

    await markUnlockIntentDeliveryAttempt({
      unlockIntentId: record.unlockIntent.id,
      status: reply.ok ? "delivered" : "failed",
      error: reply.ok ? null : reply.error,
    });
    await markLineWebhookEventProcessed({
      dedupeKey,
      status: reply.ok ? "processed" : "failed",
      errorCode: reply.ok ? null : reply.error,
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
          dedupeStatus: "created",
          rateLimited: false,
          ...themeMetadata,
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
          dedupeStatus: "created",
          rateLimited: false,
          ...themeMetadata,
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
          dedupeStatus: "created",
          rateLimited: false,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

async function recordInvalidAttempt(lineUserId: string) {
  const record = await recordLineWebhookInvalidAttempt({
    lineUserIdHash: hashFulfillmentSecret(lineUserId),
    windowStart: getLineWebhookRateWindowStart(),
  });

  return isLineWebhookRateLimited({
    invalidAttemptCount: record.invalidAttemptCount,
  });
}
