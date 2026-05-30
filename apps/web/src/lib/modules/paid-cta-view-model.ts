import { LEGAL_CONTACT_EMAIL } from "@/content/legal";

export type PaidCtaAvailability =
  | "review_pending"
  | "payment_unavailable"
  | "checkout_available"
  | "checkout_pending"
  | "waiting_for_payment"
  | "processing"
  | "ready"
  | "failed_retryable"
  | "failed_support"
  | "invalid_or_expired"
  | "already_unlocked";

export type PaidCtaViewModel = {
  kicker: string;
  primaryLabel: string;
  secondaryLabel: string;
  headlineSuffix: string;
  microcopy: string;
  supportCopy: string;
  primaryEnabled: boolean;
  showPrice: boolean;
  showRefundLink: boolean;
  showSupportLink: boolean;
  showPollingCopy: boolean;
};

const SUPPORT_RESPONSE_WINDOW = "3–7 個工作天內回覆處理結果";

export function getSupportResponseWindowCopy() {
  return SUPPORT_RESPONSE_WINDOW;
}

export function buildPaidCtaViewModel(input: {
  availability: PaidCtaAvailability;
  price: string;
  supportEmail?: string;
}): PaidCtaViewModel {
  const supportEmail = input.supportEmail ?? LEGAL_CONTACT_EMAIL;
  const price = input.price || "NT$49";
  const supportCopy = `若付款、連結或報告產生異常，請來信 ${supportEmail}，我們會在 ${SUPPORT_RESPONSE_WINDOW}。`;

  switch (input.availability) {
    case "checkout_available":
      return {
        kicker: "一次性查看 · 無訂閱",
        primaryLabel: `解鎖完整報告｜${price}`,
        secondaryLabel: "查看退款政策",
        headlineSuffix: price,
        microcopy: "一次性付款，非訂閱制。付款確認後，完整報告將於網頁中提供查看。",
        supportCopy,
        primaryEnabled: true,
        showPrice: true,
        showRefundLink: true,
        showSupportLink: true,
        showPollingCopy: false,
      };
    case "checkout_pending":
    case "waiting_for_payment":
      return {
        kicker: "付款確認中",
        primaryLabel: "正在確認付款",
        secondaryLabel: "聯絡客服協助",
        headlineSuffix: "付款確認中",
        microcopy: "我們正在等待金流正式通知。付款返回頁只顯示確認狀態，不會直接判定付款成功。",
        supportCopy,
        primaryEnabled: false,
        showPrice: false,
        showRefundLink: true,
        showSupportLink: true,
        showPollingCopy: true,
      };
    case "processing":
      return {
        kicker: "完整報告生成中",
        primaryLabel: "正在整理完整報告",
        secondaryLabel: "聯絡客服協助",
        headlineSuffix: "處理中",
        microcopy: "AI 生成需要一點時間，完成後此頁會更新。通常約 30–60 秒。",
        supportCopy,
        primaryEnabled: false,
        showPrice: false,
        showRefundLink: true,
        showSupportLink: true,
        showPollingCopy: true,
      };
    case "ready":
    case "already_unlocked":
      return {
        kicker: "完整報告已準備好",
        primaryLabel: "查看完整報告",
        secondaryLabel: "回到測驗",
        headlineSuffix: "已解鎖",
        microcopy: "你的完整分析已準備好。不需要重複付款。",
        supportCopy,
        primaryEnabled: true,
        showPrice: false,
        showRefundLink: false,
        showSupportLink: true,
        showPollingCopy: false,
      };
    case "failed_retryable":
      return {
        kicker: "報告暫時無法完成",
        primaryLabel: "重新檢查完整報告",
        secondaryLabel: "聯絡客服協助",
        headlineSuffix: "需要重新確認",
        microcopy: "報告暫時無法完成。若付款已完成，我們可以協助補發或退款。",
        supportCopy,
        primaryEnabled: true,
        showPrice: false,
        showRefundLink: true,
        showSupportLink: true,
        showPollingCopy: false,
      };
    case "failed_support":
    case "invalid_or_expired":
      return {
        kicker: "需要客服協助",
        primaryLabel: "聯絡客服協助",
        secondaryLabel: "查看退款政策",
        headlineSuffix: "需要協助",
        microcopy: "這組完整報告連結無效、過期，或報告暫時無法完成。若付款已完成，我們可以協助補發或退款。",
        supportCopy,
        primaryEnabled: true,
        showPrice: false,
        showRefundLink: true,
        showSupportLink: true,
        showPollingCopy: false,
      };
    case "payment_unavailable":
      return {
        kicker: "付款暫未開放",
        primaryLabel: "暫時還不能付款",
        secondaryLabel: "查看退款政策",
        headlineSuffix: price,
        microcopy: "付款入口尚未開放；你的免費結果仍可重新查看。",
        supportCopy,
        primaryEnabled: false,
        showPrice: true,
        showRefundLink: true,
        showSupportLink: true,
        showPollingCopy: false,
      };
    case "review_pending":
    default:
      return {
        kicker: "一次性查看 · 無訂閱",
        primaryLabel: "完整報告即將開放",
        secondaryLabel: "查看退款政策",
        headlineSuffix: price,
        microcopy: `完整報告解鎖功能準備中。正式開放後，可使用 ${price} 單次付款解鎖完整 AI 關係互動分析報告。`,
        supportCopy,
        primaryEnabled: false,
        showPrice: true,
        showRefundLink: true,
        showSupportLink: true,
        showPollingCopy: false,
      };
  }
}
