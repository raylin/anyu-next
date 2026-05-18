import { describe, expect, it } from "vitest";
import { redactUserInput } from "@/lib/privacy/pii";

describe("redactUserInput", () => {
  it("redacts email, phone, and handle-like content", () => {
    const result = redactUserInput(
      "我的 email 是 test@example.com，手機 0912345678，LINE ID: @anyu_test",
    );

    expect(result.redactedText).toContain("[email]");
    expect(result.redactedText).toContain("[phone]");
    expect(result.redactedText).toContain("[handle]");
    expect(result.flags).toEqual(["email", "phone", "handle"]);
  });
});
