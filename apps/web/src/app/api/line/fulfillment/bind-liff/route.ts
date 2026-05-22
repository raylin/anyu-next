import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { bindUnlockIntentToLine, getUnlockIntentByTokenHash, insertEvent } from "@/lib/db/runtime";
import { getAppBaseUrl } from "@/lib/line/config";
import { hashFulfillmentSecret, isExpired } from "@/lib/line/fulfillment";
import { verifyLineIdToken } from "@/lib/line/liff";
import { getModuleBySlug } from "@/lib/modules/registry";

type BindLiffPayload = {
  unlockIntentId?: string;
  unlockToken?: string;
  idToken?: string;
};

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, error: "config_error", message: "LINE 領取服務尚未設定完成。" },
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
      { ok: false, error: "invalid_input", message: "缺少 LINE 領取資料。" },
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

  const moduleConfig = getModuleBySlug(record.unlockIntent.themeSlug);
  const unlockedUrl = `${getAppBaseUrl(request.url)}/m/${record.unlockIntent.themeSlug}/unlock/${unlockToken}`;

  await bindUnlockIntentToLine({
    unlockIntentId: record.unlockIntent.id,
    lineUserId: lineIdentity.lineUserId,
    channel: "liff",
    delivered: true,
  });

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
      },
    });
  }

  return NextResponse.json({ ok: true, unlockedUrl });
}
