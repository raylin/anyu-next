import { describe, expect, it } from "vitest";
import {
  LEGAL_CONTACT_EMAIL,
  disclaimerPageContent,
  legalLinks,
  privacyPageContent,
  refundPageContent,
  termsPageContent,
  uiNotices,
} from "@/content/legal";

describe("legal content", () => {
  const publicLegalCopy = JSON.stringify({
    privacyPageContent,
    refundPageContent,
    termsPageContent,
    disclaimerPageContent,
    uiNotices,
  });

  it("uses the public contact email consistently", () => {
    expect(LEGAL_CONTACT_EMAIL).toBe("hello@anyu.tw");
    expect(JSON.stringify(privacyPageContent)).toContain(LEGAL_CONTACT_EMAIL);
    expect(JSON.stringify(refundPageContent)).toContain(LEGAL_CONTACT_EMAIL);
    expect(JSON.stringify(termsPageContent)).toContain(LEGAL_CONTACT_EMAIL);
    expect(JSON.stringify(disclaimerPageContent)).toContain(LEGAL_CONTACT_EMAIL);
  });

  it("defines the expected public legal routes", () => {
    expect(legalLinks).toEqual([
      { href: "/refund", label: "退款政策" },
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
    expect(uiNotices.paidUnlockNote).toContain("NT$49");
    expect(uiNotices.paidUnlockNote).toContain("目前內測期間不會真的收費");
    expect(uiNotices.paidProductDescription).toContain("一次性數位內容");
    expect(uiNotices.paidProductDescription).toContain("網頁或 LINE 連結");
  });

  it("publishes formal service-ready legal intros without draft warnings", () => {
    const blockedDraftPhrases = [
      "v0",
      "內測草稿",
      "基礎草稿",
      "不是最終法律版本",
      "不是法律意見",
      "正式公開前",
      "合格專業人士",
    ];

    expect(privacyPageContent.heading).toBe("暗語 ANYU 隱私權政策");
    expect(privacyPageContent.intro).toContain("本政策說明暗語 ANYU 如何處理");
    expect(privacyPageContent.intro).toContain("網站公告版本為準");
    expect(termsPageContent.heading).toBe("暗語 ANYU 使用條款");
    expect(termsPageContent.intro).toContain("本條款說明使用暗語 ANYU 服務時的基本規則");
    expect(termsPageContent.intro).toContain("網站公告版本為準");
    expect(disclaimerPageContent.heading).toBe("暗語 ANYU 免責聲明");
    expect(disclaimerPageContent.intro).toContain("本聲明說明暗語 ANYU 的服務適用範圍與限制");
    expect(disclaimerPageContent.intro).toContain("不是心理治療、諮商、醫療診斷、法律建議或命理服務");

    for (const phrase of blockedDraftPhrases) {
      expect(publicLegalCopy).not.toContain(phrase);
    }
  });

  it("keeps privacy copy concrete without deletion or anonymity overpromises", () => {
    const privacyCopy = JSON.stringify({ privacyPageContent, uiNotices });

    expect(privacyCopy).not.toContain("盡量先做去識別化");
    expect(privacyCopy).not.toContain("完全匿名");
    expect(privacyCopy).not.toContain("立即刪除");
    expect(privacyCopy).not.toContain("永久不保存");
    expect(privacyCopy).toContain("約 24 小時的保留期限");
    expect(privacyCopy).toContain("實際清理可能依批次排程完成");
    expect(privacyCopy).toContain("ANYU 不應收集或保存完整卡號");
  });

  it("publishes provider-review payment copy without enabling checkout claims", () => {
    const termsCopy = JSON.stringify(termsPageContent);
    const refundCopy = JSON.stringify(refundPageContent);

    expect(termsCopy).toContain("曖昧溫度計完整分析預計為一次性數位內容");
    expect(termsCopy).toContain("建議售價 NT$49");
    expect(termsCopy).toContain("目前不會真的收費");
    expect(termsCopy).toContain("若付款成功後系統未能成功產生完整分析");
    expect(termsCopy).toContain("重複付款");
    expect(termsCopy).toContain("客服僅需付款時間、必要的訂單資訊或錯誤狀況說明");
    expect(termsCopy).toContain("本服務目前以個人小規模測試方式提供，暫未開立統一發票");
    expect(refundCopy).toContain("單次完整報告解鎖價格為 NT$49");
    expect(refundCopy).toContain("一次性數位內容服務");
    expect(refundCopy).toContain("非訂閱制");
    expect(refundCopy).toContain("重複付款");
    expect(refundCopy).toContain("付費結果連結因系統問題無法開啟");
    expect(refundCopy).toContain("不因主觀喜好");
    expect(termsCopy).not.toContain("checkout");
    expect(refundCopy).not.toContain("checkout");
    expect(termsCopy).not.toContain("NewebPay");
    expect(refundCopy).not.toContain("NewebPay");
    expect(termsCopy).not.toContain("藍新");
    expect(refundCopy).not.toContain("藍新");
  });

  it("does not publish private applicant or business-registration claims", () => {
    expect(publicLegalCopy).not.toContain("工作室");
    expect(publicLegalCopy).not.toContain("商號");
    expect(publicLegalCopy).not.toContain("公司統一編號");
    expect(publicLegalCopy).not.toContain("個人信箱");
    expect(publicLegalCopy).not.toContain("個人銀行");
    expect(publicLegalCopy).not.toContain("owner");
  });
});
