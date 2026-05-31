import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { bindUnlockIntentToLine, getUnlockIntentByTokenHash, insertEvent } from "@/lib/db/runtime";
import { buildModuleUnlockPath } from "@/lib/line/config";
import { hashFulfillmentSecret, isExpired } from "@/lib/line/fulfillment";
import { verifyLineIdToken } from "@/lib/line/liff";
import {
  getModuleThemeEventMetadata,
  getModuleThemeFromUnlockToken,
  normalizeModuleThemeSource,
  normalizeModuleThemeVariant,
  type ModuleThemeSource,
  type ModuleThemeVariant,
} from "@/lib/modules/module-theme";
import { getModuleBySlug } from "@/lib/modules/registry";
import { requestDeferredPaidGeneration } from "@/lib/modules/paid-generation-service";

type BindLiffPayload = {
  moduleSlug?: string;
  unlockIntentId?: string;
  unlockToken?: string;
  idToken?: string;
  themeVariant?: ModuleThemeVariant;
  themeSource?: ModuleThemeSource;
};

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, error: "config_error", message: "LINE 短碼確認服務尚未設定完成。" },
      { status: 503 },
    );
  }

  let body: BindLiffPayload;

  try {
    body = (await request.json()) as BindLiffPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", message: "送出的資料格式不正確。" },
      { status: 400 },
    );
  }

  const unlockToken = body.unlockToken?.trim();
  const idToken = body.idToken?.trim();

  if (!body.unlockIntentId || !unlockToken || !idToken) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", message: "缺少 LINE 短碼確認資料。" },
      { status: 400 },
    );
  }

  const lineIdentity = await verifyLineIdToken({ idToken });

  if (!lineIdentity.ok) {
    return NextResponse.json(
      { ok: false, error: "invalid_line_identity", message: "LINE 身分驗證失敗，請改用短碼。" },
      { status: 401 },
    );
  }

  const record = await getUnlockIntentByTokenHash(hashFulfillmentSecret(unlockToken));

  if (!record || record.unlockIntent.id !== body.unlockIntentId) {
    return NextResponse.json(
      { ok: false, error: "invalid_token", message: "這組領取連結無效，請回到結果頁重新產生。" },
      { status: 404 },
    );
  }

  if (isExpired(record.unlockIntent.unlockTokenExpiresAt)) {
    return NextResponse.json(
      { ok: false, error: "expired_token", message: "這組領取連結已過期，請回到結果頁重新產生。" },
      { status: 410 },
    );
  }

  if (body.moduleSlug && body.moduleSlug !== record.unlockIntent.themeSlug) {
    return NextResponse.json(
      { ok: false, error: "module_mismatch", message: "這組領取連結與測驗資料不符，請回到結果頁重新產生。" },
      { status: 400 },
    );
  }

  const moduleConfig = getModuleBySlug(record.unlockIntent.themeSlug);
  const tokenTheme = getModuleThemeFromUnlockToken(unlockToken);
  const themeVariant = normalizeModuleThemeVariant(body.themeVariant) ?? tokenTheme?.variant ?? null;
  const themeSource = normalizeModuleThemeSource(body.themeSource ?? tokenTheme?.source ?? "query_hint");
  const unlockedPath = buildModuleUnlockPath({
    moduleSlug: record.unlockIntent.themeSlug,
    unlockToken,
    themeVariant,
    themeSource,
  });
  const themeMetadata = themeVariant
    ? {
        ...getModuleThemeEventMetadata({ variant: themeVariant, source: themeSource }),
        themeCarryoverSource: "unlock_intent",
      }
    : {};

  await bindUnlockIntentToLine({
    unlockIntentId: record.unlockIntent.id,
    lineUserId: lineIdentity.lineUserId,
    channel: "liff",
    delivered: true,
  });

  const paidGeneration = moduleConfig
    ? await requestDeferredPaidGeneration({
        moduleConfig,
        resultId: record.unlockIntent.resultId,
        unlockIntentId: record.unlockIntent.id,
        triggerSource: "line_bind",
      })
    : null;

  if (moduleConfig) {
    await insertEvent({
      eventName: "fulfillment_liff_bound",
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
        channel: "liff",
        status: "delivered",
        paidStatus: paidGeneration?.ok ? paidGeneration.status : "unavailable",
        ...themeMetadata,
      },
    });

    await insertEvent({
      eventName: "fulfillment_link_delivered",
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
        channel: "liff",
        status: "delivered",
        paidStatus: paidGeneration?.ok ? paidGeneration.status : "unavailable",
        ...themeMetadata,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    unlockedPath,
    paidStatus: paidGeneration?.ok ? paidGeneration.status : "missing",
  });
}
