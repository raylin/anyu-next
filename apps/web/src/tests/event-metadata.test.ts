import { describe, expect, it } from "vitest";
import { hasForbiddenEventMetadata } from "@/lib/events/types";

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
});
