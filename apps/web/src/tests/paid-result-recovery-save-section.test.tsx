import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { UnlockCompleted } from "@/app/m/[moduleSlug]/unlock/[unlockToken]/page";

const moduleConfig = {
  moduleId: "ai-temperature",
  slug: "ambiguous-temperature",
  title: "曖昧溫度計",
  price: "NT$49",
};

const result = {
  free_result: {
    temperature_score: 60,
    state_label: "偏暖",
  },
  paid_preview: {
    headline: "完整分析",
  },
  paid_result: {
    fullSummary: "完整摘要",
    signalDeepDive: [],
    evidenceSummary: null,
    possibleStates: [],
    replyStrategies: [],
    avoidDoing: [],
    softInsight: "先不要失控",
    next48HourPlan: [],
    summaryCard: {
      headline: "摘要卡",
      body: "摘要內容",
      nextMove: "下一步",
    },
  },
};

function renderCompleted(input?: {
  recoverySummary?: Parameters<typeof UnlockCompleted>[0]["recoverySummary"];
  recoveryState?: string;
  recoveryEmailAction?: (formData: FormData) => Promise<void>;
}) {
  return renderToStaticMarkup(
    <UnlockCompleted
      moduleConfig={moduleConfig}
      moduleSlug="ambiguous-temperature"
      result={result}
      storedPaidResult={{
        status: "completed",
        paidResultJson: result.paid_result,
        completedAt: new Date("2026-06-01T08:30:00.000Z"),
      }}
      analysisResultId="result_1234567890_private"
      anonymousSessionId="session-1"
      scoreBucket="warm"
      resultCreatedAt={new Date("2026-06-01T00:00:00.000Z")}
      themeCarryoverSource="paid_access_token"
      recoverySummary={input?.recoverySummary}
      recoveryState={input?.recoveryState}
      recoveryEmailAction={input?.recoveryEmailAction}
    />,
  );
}

describe("paid result recovery save section", () => {
  beforeEach(() => {
    process.env.PAYMENT_RECOVERY_CONTACT_HASH_SECRET = "test-only-recovery-hash-secret";
    delete process.env.NEXT_PUBLIC_LINE_LIFF_URL;
  });

  it("shows saved confirmation with masked email only", () => {
    const html = renderCompleted({
      recoverySummary: {
        hasRecoveryContact: true,
        hasEmailRecovery: true,
        hasLineRecovery: false,
        emailStatus: "bound",
        lineStatus: "none",
        transactionalConsentPresent: true,
        marketingOptInPresent: false,
        recommendedPostPaymentAction: "confirm_saved",
        safeDisplayContact: { type: "email", maskedValue: "o***@e***.com" },
      },
    });

    expect(html).toContain("這份完整分析已保存");
    expect(html).toContain("曖昧溫度計｜完整分析報告");
    expect(html).toContain("報告編號");
    expect(html).toContain("AT-20260601-");
    expect(html).toContain("已保存找回方式：o***@e***.com");
    expect(html).toContain("新增 LINE 備用找回");
    expect(html).toContain("用 LINE 保存這份報告");
    expect(html).toContain("/line/recovery/bind?state=rlb_");
    expect(html).toContain("聯絡客服時可提供報告編號");
    expect(html).not.toContain("owner@example.com");
    expect(html).not.toContain("result_1234567890_private");
    expect(html).not.toContain("pa_");
    expect(html).not.toContain("pcs_");
    expect(html).not.toContain("prl_");
    expect(html).not.toContain("Email 交付");
    expect(html).not.toContain("LINE 交付");
    expect(html).not.toContain("LINE 領取完整分析");
    expect(html).not.toContain("完整報告會傳到 LINE");
  });

  it("distinguishes an actual sent recovery link from saved-only state", () => {
    const html = renderCompleted({
      recoveryState: "email_sent",
      recoverySummary: {
        hasRecoveryContact: true,
        hasEmailRecovery: true,
        hasLineRecovery: false,
        emailStatus: "bound",
        lineStatus: "none",
        transactionalConsentPresent: true,
        marketingOptInPresent: false,
        recommendedPostPaymentAction: "confirm_saved",
        safeDisplayContact: { type: "email", maskedValue: "o***@e***.com" },
      },
    });

    expect(html).toContain("已準備並寄出找回連結");
    expect(html).toContain("已寄出找回連結");
    expect(html).toContain("Email 不包含報告內容");
    expect(html).not.toContain("Email 交付");
  });

  it("shows non-blocking email save section when unsaved", async () => {
    async function recoveryEmailAction() {
      "use server";
    }

    const html = renderCompleted({
      recoveryEmailAction,
      recoverySummary: {
        hasRecoveryContact: false,
        hasEmailRecovery: false,
        hasLineRecovery: false,
        emailStatus: "none",
        lineStatus: "none",
        transactionalConsentPresent: false,
        marketingOptInPresent: false,
        recommendedPostPaymentAction: "suggest_email_save",
        safeDisplayContact: null,
      },
    });

    expect(html).toContain("保存這份完整分析");
    expect(html).toContain("尚未保存找回方式");
    expect(html).not.toContain("已寄出找回連結");
    expect(html).toContain("Email 找回");
    expect(html).toContain("也想收到新測驗、早鳥或限時解鎖通知");
    expect(html).toContain("LINE 找回");
    expect(html).toContain("用 LINE 保存這份報告");
    expect(html).toContain("之後可以透過 LINE 協助找回");
    expect(html).toContain("LINE 綁定失敗也不影響付款或查看報告");
    expect(html).toContain("/line/recovery/bind?state=rlb_");
    expect(html).toContain("完整報告仍以網頁查看為準");
    expect(html).toContain("若 Email 寄送服務尚未啟用，系統仍會先保存找回方式");
    expect(html).not.toContain("Email 交付");
    expect(html).not.toContain("LINE 交付");
    expect(html).not.toContain("LINE 領取完整分析");
    expect(html).not.toContain("完整報告會傳到 LINE");
    expect(html).not.toContain("會員");
  });

  it("shows saved-to-LINE state without raw LINE identifiers", () => {
    const html = renderCompleted({
      recoverySummary: {
        hasRecoveryContact: true,
        hasEmailRecovery: false,
        hasLineRecovery: true,
        emailStatus: "none",
        lineStatus: "bound",
        transactionalConsentPresent: true,
        marketingOptInPresent: false,
        recommendedPostPaymentAction: "confirm_saved",
        safeDisplayContact: null,
      },
    });

    expect(html).toContain("這份完整分析已保存");
    expect(html).toContain("已用 LINE 保存這份報告");
    expect(html).toContain("完整報告仍以此網頁查看為準");
    expect(html).not.toContain("line-user");
    expect(html).not.toContain("lineUserId");
    expect(html).not.toContain("LINE 交付");
    expect(html).not.toContain("完整報告會傳到 LINE");
  });
});
