import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { EVENT_NAMES, hasForbiddenEventMetadata } from "@/lib/events/types";

describe("event metadata guard", () => {
  it("rejects raw text-like metadata keys", () => {
    expect(hasForbiddenEventMetadata({ text: "raw conversation" })).toBe(true);
    expect(hasForbiddenEventMetadata({ nested: { input: "raw conversation" } })).toBe(
      true,
    );
    expect(hasForbiddenEventMetadata({ email: "person@example.com" })).toBe(true);
    expect(hasForbiddenEventMetadata({ line_message_text: "A7K2Q9" })).toBe(true);
    expect(hasForbiddenEventMetadata({ line_user_id: "line-user" })).toBe(true);
    expect(hasForbiddenEventMetadata({ fulfillment_code: "A7K2Q9" })).toBe(true);
    expect(hasForbiddenEventMetadata({ unlock_token: "unlock-token" })).toBe(true);
    expect(hasForbiddenEventMetadata({ url: "https://example.test/unlock/token" })).toBe(true);
    expect(hasForbiddenEventMetadata({ DATABASE_URL: "postgres://example" })).toBe(true);
    expect(hasForbiddenEventMetadata({ LINE_CHANNEL_SECRET: "secret" })).toBe(true);
    expect(hasForbiddenEventMetadata({ token: "secret-token" })).toBe(true);
  });

  it("allows safe event metadata", () => {
    expect(
      hasForbiddenEventMetadata({
        scoreBucket: "cool",
        privacyFlags: ["email"],
        modelStrategy: "haiku_retry_sonnet_fallback",
        primaryModel: "claude-haiku-4-5-20251001",
        finalModel: "claude-sonnet-4-20250514",
        retryCount: 1,
        fallbackUsed: true,
        schemaValidationPassed: true,
        cacheHit: false,
        cacheKeyVersion: "v1",
        timingMs: {
          totalLatencyMs: 28000,
          providerLatencyMs: 24000,
        },
      }),
    ).toBe(false);
  });

  it("includes the launch-readiness passive events", () => {
    expect(EVENT_NAMES).toContain("page_view");
    expect(EVENT_NAMES).toContain("input_started");
    expect(EVENT_NAMES).toContain("analysis_started");
    expect(EVENT_NAMES).toContain("analysis_failed");
    expect(EVENT_NAMES).toContain("line_add_clicked");
    expect(EVENT_NAMES).toContain("email_fallback_opened");
    expect(EVENT_NAMES).toContain("share_card_clicked");
    expect(EVENT_NAMES).toContain("fulfillment_liff_bound");
    expect(EVENT_NAMES).toContain("fulfillment_code_matched");
    expect(EVENT_NAMES).toContain("line_webhook_received");
  });

  it("keeps the inline result CTA source on the existing paid unlock event", () => {
    const resultSource = readFileSync(
      resolve(process.cwd(), "src/components/modules/ai-temperature/AiTemperatureResult.tsx"),
      "utf8",
    );
    const unlockRoute = readFileSync(
      resolve(process.cwd(), "src/app/api/unlock-intent/route.ts"),
      "utf8",
    );

    expect(resultSource).toContain('revealContact("inline_result_cta")');
    expect(unlockRoute).toContain('body.source === "inline_result_cta" ? "inline_result_cta" : "paid_preview"');
  });
});
