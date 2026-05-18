import { afterEach, describe, expect, it } from "vitest";
import { POST as analyzePost } from "@/app/api/modules/[moduleSlug]/analyze/route";
import { POST as eventsPost } from "@/app/api/events/route";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
});

describe("runtime API config errors", () => {
  it("returns a friendly analyze error when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;

    const response = await analyzePost(
      new Request("http://localhost/api/modules/ambiguous-temperature/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "這是一段足夠長的測試輸入內容，用來檢查未設定環境下的友善錯誤。",
          situation: "已讀不回",
          anonymousSessionId: "config-test-session",
        }),
      }),
      {
        params: Promise.resolve({
          moduleSlug: "ambiguous-temperature",
        }),
      },
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "config_error",
      message: "目前分析服務尚未設定完成，請稍後再試。",
    });
  });

  it("returns a friendly events error when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;

    const response = await eventsPost(
      new Request("http://localhost/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: "page_view",
          moduleId: "ai-temperature",
          themeSlug: "ambiguous-temperature",
          experimentId: "ambiguous-temperature-fake-door-v0",
          visualVariant: "B",
          promptVersion: "product_result_prompt_v0.2",
          schemaVersion: "product_result_schema_v0",
          anonymousSessionId: "config-test-session",
        }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "config_error",
      message: "目前事件收集服務尚未設定完成，請稍後再試。",
    });
  });
});
