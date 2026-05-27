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
    expect(uiNotices.inputHelper).toContain("你不需要留下姓名或聯絡資料");
    expect(uiNotices.inputHelper).toContain("請不要貼姓名、電話、地址");
    expect(uiNotices.ctaConsent).toContain("不會公開展示");
    expect(uiNotices.ctaConsent).toContain("第三方行銷");
    expect(uiNotices.resultDisclaimer).toContain("不是判決");
    expect(uiNotices.contactCapture).toContain("完整分析");
  });

  it("keeps privacy copy concrete without deletion or anonymity overpromises", () => {
    const privacyCopy = JSON.stringify({ privacyPageContent, uiNotices });

    expect(privacyCopy).not.toContain("盡量先做去識別化");
    expect(privacyCopy).not.toContain("完全匿名");
    expect(privacyCopy).not.toContain("立即刪除");
    expect(privacyCopy).not.toContain("永久不保存");
    expect(privacyCopy).toContain("約 24 小時的保留期限");
    expect(privacyCopy).toContain("實際清理可能依批次排程完成");
  });
});
