import { describe, expect, it } from "vitest";
import { EVENT_NAMES, hasForbiddenEventMetadata } from "@/lib/events/types";

describe("event metadata guard", () => {
  it("rejects raw text-like metadata keys", () => {
    expect(hasForbiddenEventMetadata({ text: "raw conversation" })).toBe(true);
    expect(hasForbiddenEventMetadata({ nested: { input: "raw conversation" } })).toBe(
      true,
    );
  });

  it("allows safe event metadata", () => {
    expect(
      hasForbiddenEventMetadata({ scoreBucket: "cool", privacyFlags: ["email"] }),
    ).toBe(false);
  });

  it("includes the launch-readiness passive events", () => {
    expect(EVENT_NAMES).toContain("page_view");
    expect(EVENT_NAMES).toContain("input_started");
    expect(EVENT_NAMES).toContain("analysis_started");
    expect(EVENT_NAMES).toContain("analysis_failed");
    expect(EVENT_NAMES).toContain("share_card_clicked");
  });
});
