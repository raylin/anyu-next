import { NextResponse } from "next/server";
import { insertEvent } from "@/lib/db/runtime";
import { isDbConfigured } from "@/lib/db/client";
import {
  hasForbiddenEventMetadata,
  isAllowedEventName,
  type EventPayload,
} from "@/lib/events/types";

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "config_error",
        message: "目前事件收集服務尚未設定完成，請稍後再試。",
      },
      { status: 503 },
    );
  }

  let body: Partial<EventPayload>;

  try {
    body = (await request.json()) as Partial<EventPayload>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", message: "送出的資料格式不正確。" },
      { status: 400 },
    );
  }

  if (!body.eventName || !isAllowedEventName(body.eventName)) {
    return NextResponse.json(
      { ok: false, error: "invalid_event", message: "事件名稱不支援。" },
      { status: 400 },
    );
  }

  if (hasForbiddenEventMetadata(body.metadata)) {
    return NextResponse.json(
      { ok: false, error: "forbidden_metadata", message: "事件資料不能包含原始文字內容。" },
      { status: 400 },
    );
  }

  if (
    !body.moduleId ||
    !body.themeSlug ||
    !body.experimentId ||
    !body.promptVersion ||
    !body.schemaVersion
  ) {
    return NextResponse.json(
      { ok: false, error: "invalid_event", message: "事件缺少必要欄位。" },
      { status: 400 },
    );
  }

  try {
    const record = await insertEvent({
      eventName: body.eventName,
      moduleId: body.moduleId ?? "",
      themeSlug: body.themeSlug ?? "",
      experimentId: body.experimentId ?? "",
      visualVariant: body.visualVariant ?? "B",
      promptVersion: body.promptVersion ?? "",
      schemaVersion: body.schemaVersion ?? "",
      situationType: body.situationType ?? null,
      scoreBucket: body.scoreBucket ?? null,
      anonymousSessionId: body.anonymousSessionId ?? null,
      metadata: body.metadata ?? {},
    });

    return NextResponse.json({ ok: true, eventId: record.id });
  } catch {
    return NextResponse.json(
      { ok: false, error: "event_store_failed", message: "目前事件收集服務忙碌中，請稍後再試。" },
      { status: 502 },
    );
  }
}
