import { describe, expect, it } from "vitest";
import { buildUnlockedResultViewMetadata } from "@/components/modules/ai-temperature/UnlockedResultViewTracker";
import { hasForbiddenEventMetadata } from "@/lib/events/types";

describe("unlocked result view tracker metadata", () => {
  it("builds only sanitized completed paid-result view metadata", () => {
    const metadata = buildUnlockedResultViewMetadata({
      moduleSlug: "ambiguous-temperature",
      themeVariant: "riso",
      themeSource: "manual_override",
      themeCarryoverSource: "unlock_intent",
      paidResultSource: "provider",
      resultAgeBucket: "lt_1h",
      operatorTest: true,
    });

    expect(metadata).toEqual({
      moduleSlug: "ambiguous-temperature",
      themeVariant: "riso",
      themeSource: "manual_override",
      themeCarryoverSource: "unlock_intent",
      paidResultSource: "provider",
      paidStatus: "completed",
      resultAgeBucket: "lt_1h",
      operatorTest: true,
    });
    expect(hasForbiddenEventMetadata(metadata)).toBe(false);
    expect(Object.keys(metadata)).not.toContain("unlockToken");
    expect(Object.keys(metadata)).not.toContain("paid_result_json");
    expect(Object.keys(metadata)).not.toContain("lineUserId");
  });
});
