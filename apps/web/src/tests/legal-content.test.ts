import { describe, expect, it } from "vitest";
import {
  LEGAL_CONTACT_EMAIL,
  disclaimerPageContent,
  legalLinks,
  privacyPageContent,
  termsPageContent,
  uiNotices,
} from "@/content/legal";

describe("legal content", () => {
  it("uses the public contact email consistently", () => {
    expect(LEGAL_CONTACT_EMAIL).toBe("hello@anyu.tw");
    expect(JSON.stringify(privacyPageContent)).toContain(LEGAL_CONTACT_EMAIL);
    expect(JSON.stringify(termsPageContent)).toContain(LEGAL_CONTACT_EMAIL);
    expect(JSON.stringify(disclaimerPageContent)).toContain(LEGAL_CONTACT_EMAIL);
  });

  it("defines the expected public legal routes", () => {
    expect(legalLinks).toEqual([
      { href: "/privacy", label: "隱私權政策" },
      { href: "/terms", label: "使用條款" },
      { href: "/disclaimer", label: "免責聲明" },
    ]);
  });

  it("keeps the key short notices aligned with the legal drafts", () => {
    expect(uiNotices.inputHelper).toContain("請不要貼姓名、電話、地址");
    expect(uiNotices.ctaConsent).toContain("隱私權政策");
    expect(uiNotices.resultDisclaimer).toContain("不是判決");
    expect(uiNotices.contactCapture).toContain("完整分析");
  });
});
