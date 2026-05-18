import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { createUnlockIntentRecord, insertEvent } from "@/lib/db/runtime";
import { getModuleBySlug } from "@/lib/modules/registry";

type UnlockIntentPayload = {
  resultId?: string;
  moduleId?: string;
  themeSlug?: string;
  anonymousSessionId?: string;
};

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "config_error",
        message: "目前解鎖收集服務尚未設定完成，請稍後再試。",
      },
      { status: 503 },
    );
  }

  let body: UnlockIntentPayload;

  try {
    body = (await request.json()) as UnlockIntentPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", message: "送出的資料格式不正確。" },
      { status: 400 },
    );
  }

  if (!body.resultId || !body.moduleId || !body.themeSlug) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", message: "缺少必要的解鎖資料。" },
      { status: 400 },
    );
  }

  const moduleConfig = getModuleBySlug(body.themeSlug);

  if (!moduleConfig || moduleConfig.moduleId !== body.moduleId) {
    return NextResponse.json(
      { ok: false, error: "module_not_found", message: "找不到這個模組。" },
      { status: 404 },
    );
  }

  try {
    const unlockIntent = await createUnlockIntentRecord({
      resultId: body.resultId,
      moduleId: body.moduleId,
      themeSlug: body.themeSlug,
      anonymousSessionId: body.anonymousSessionId ?? null,
    });

    await insertEvent({
      eventName: "paid_unlock_clicked",
      moduleId: body.moduleId,
      themeSlug: body.themeSlug,
      experimentId: moduleConfig.experimentId,
      visualVariant: "B",
      promptVersion: moduleConfig.promptVersion,
      schemaVersion: moduleConfig.schemaVersion,
      anonymousSessionId: body.anonymousSessionId ?? null,
      metadata: {
        resultId: body.resultId,
        unlockIntentId: unlockIntent.id,
      },
    });

    return NextResponse.json({ ok: true, unlockIntentId: unlockIntent.id });
  } catch {
    return NextResponse.json(
      { ok: false, error: "unlock_store_failed", message: "目前解鎖收集服務忙碌中，請稍後再試。" },
      { status: 502 },
    );
  }
}
