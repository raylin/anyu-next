import { NextResponse } from "next/server";
import { validateContactSubmission } from "@/lib/contact/validation";
import { isDbConfigured } from "@/lib/db/client";
import { createContactSubmissionRecord, insertEvent } from "@/lib/db/runtime";
import { getModuleBySlug } from "@/lib/modules/registry";

type ContactPayload = {
  resultId?: string;
  unlockIntentId?: string;
  moduleId?: string;
  themeSlug?: string;
  anonymousSessionId?: string;
  email?: string;
  lineId?: string;
  consent?: boolean;
};

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "config_error",
        message: "目前聯絡收集服務尚未設定完成，請稍後再試。",
      },
      { status: 503 },
    );
  }

  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", message: "送出的資料格式不正確。" },
      { status: 400 },
    );
  }

  if (!body.moduleId || !body.themeSlug) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", message: "缺少必要的聯絡資料。" },
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

  let normalizedContact;

  try {
    normalizedContact = validateContactSubmission({
      email: body.email,
      lineId: body.lineId,
      consent: Boolean(body.consent),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_contact",
        message: error instanceof Error ? error.message : "聯絡資料不正確。",
      },
      { status: 400 },
    );
  }

  try {
    const record = await createContactSubmissionRecord({
      resultId: body.resultId ?? null,
      unlockIntentId: body.unlockIntentId ?? null,
      moduleId: body.moduleId,
      themeSlug: body.themeSlug,
      anonymousSessionId: body.anonymousSessionId ?? null,
      email: normalizedContact.email,
      lineId: normalizedContact.lineId,
      consent: normalizedContact.consent,
    });

    await insertEvent({
      eventName: "contact_submitted",
      moduleId: body.moduleId,
      themeSlug: body.themeSlug,
      experimentId: moduleConfig.experimentId,
      visualVariant: "B",
      promptVersion: moduleConfig.promptVersion,
      schemaVersion: moduleConfig.schemaVersion,
      anonymousSessionId: body.anonymousSessionId ?? null,
      metadata: {
        resultId: body.resultId ?? null,
        unlockIntentId: body.unlockIntentId ?? null,
        contactSubmissionId: record.id,
        channel: normalizedContact.email ? "email" : "line",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "已收到你的聯絡方式，我們會把完整分析送給你。",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "contact_store_failed", message: "目前聯絡收集服務忙碌中，請稍後再試。" },
      { status: 502 },
    );
  }
}
