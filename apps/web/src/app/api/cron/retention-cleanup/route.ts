import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import {
  getRetentionCleanupSecret,
  isRetentionCleanupAuthorized,
  runScheduledRetentionCleanup,
} from "@/lib/runtime/retention-cleanup";

function parseDryRun(value: string | null): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}

export async function GET(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "config_error",
        message: "目前清理服務尚未設定完成，請稍後再試。",
      },
      { status: 503 },
    );
  }

  if (!getRetentionCleanupSecret()) {
    return NextResponse.json(
      {
        ok: false,
        error: "config_error",
        message: "目前清理服務尚未設定完成，請稍後再試。",
      },
      { status: 503 },
    );
  }

  if (!isRetentionCleanupAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json(
      {
        ok: false,
        error: "unauthorized",
        message: "未授權的清理請求。",
      },
      { status: 401 },
    );
  }

  try {
    const summary = await runScheduledRetentionCleanup({
      dryRun: parseDryRun(new URL(request.url).searchParams.get("dryRun")),
    });

    return NextResponse.json(summary);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "cleanup_failed",
        message: "目前清理服務忙碌中，請稍後再試。",
      },
      { status: 502 },
    );
  }
}
