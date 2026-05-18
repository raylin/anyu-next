import { describe, expect, it } from "vitest";
import { validateContactSubmission } from "@/lib/contact/validation";

describe("contact validation", () => {
  it("requires consent and at least one contact method", () => {
    expect(() =>
      validateContactSubmission({ email: "", lineId: "", consent: false }),
    ).toThrow();

    expect(() =>
      validateContactSubmission({ email: "", lineId: "", consent: true }),
    ).toThrow();
  });

  it("accepts a valid email or line id", () => {
    expect(
      validateContactSubmission({
        email: "hello@example.com",
        consent: true,
      }),
    ).toEqual({
      email: "hello@example.com",
      lineId: null,
      consent: true,
    });

    expect(
      validateContactSubmission({
        lineId: "@anyu_line",
        consent: true,
      }),
    ).toEqual({
      email: null,
      lineId: "@anyu_line",
      consent: true,
    });
  });
});
