const PRODUCTION_HOSTS = new Set(["anyu.tw", "www.anyu.tw"]);
const FORBIDDEN_COPY_PATTERNS = [
  /internal[-\s]?test/iu,
  /no\s+real\s+charge/iu,
  /no\s+charge/iu,
  /內測/u,
  /不收費/u,
  /LINE\s*(?:paid|delivery)/iu,
  /LINE\s*(?:付費|交付)/u,
];
const SECRET_NAME_PATTERNS = [
  /OPERATOR_TEST_SECRET/u,
  /INTERNAL_JOB_SECRET/u,
  /NEWEBPAY_HASH_KEY/u,
  /NEWEBPAY_HASH_IV/u,
  /HashKey/u,
  /HashIV/u,
  /HASH_KEY/u,
  /HASH_IV/u,
];
const TOKEN_LIKE_PATTERNS = [
  /pcs_[A-Za-z0-9_-]{8,}/u,
  /pa_[A-Za-z0-9_-]{8,}/u,
  /prl_[A-Za-z0-9_-]{8,}/u,
  /TradeInfo=[A-Za-z0-9%_-]+/u,
  /TradeSha=[A-Za-z0-9%_-]+/u,
];

function normalizeBaseUrl(value, fallback = "https://staging.anyu.tw") {
  return (value?.trim() || fallback).replace(/\/+$/u, "");
}

function assertSafeQaBaseUrl(baseUrl) {
  let parsed;

  try {
    parsed = new URL(baseUrl);
  } catch {
    return {
      ok: false,
      error: "invalid_base_url",
    };
  }

  if (PRODUCTION_HOSTS.has(parsed.hostname)) {
    return {
      ok: false,
      error: "production_target_rejected",
    };
  }

  if (
    parsed.hostname !== "staging.anyu.tw" &&
    parsed.hostname !== "localhost" &&
    parsed.hostname !== "127.0.0.1" &&
    parsed.hostname !== "::1"
  ) {
    return {
      ok: false,
      error: "unsupported_qa_target",
    };
  }

  return { ok: true };
}

function findForbiddenCopy(html) {
  return FORBIDDEN_COPY_PATTERNS
    .filter((pattern) => pattern.test(html))
    .map((pattern) => pattern.source);
}

function findSecretNameLeaks(html) {
  return SECRET_NAME_PATTERNS
    .filter((pattern) => pattern.test(html))
    .map((pattern) => pattern.source);
}

function containsTokenLikeValue(text) {
  return TOKEN_LIKE_PATTERNS.some((pattern) => pattern.test(text));
}

function redactRouteShape(value) {
  if (typeof value !== "string") {
    return null;
  }

  return value
    .replace(/\/result\/[^/?#]+/gu, "/result/[REDACTED]")
    .replace(/checkoutToken=[^&#]+/gu, "checkoutToken=[REDACTED]")
    .replace(/\/unlock\/[^/?#]+/gu, "/unlock/[REDACTED]")
    .replace(/\/r\/[^/?#]+/gu, "/r/[REDACTED]")
    .replace(/\/payment\/access\?checkoutToken=[^&#]+/gu, "/payment/access?checkoutToken=[REDACTED]");
}

function extractCheckoutHref(html, moduleSlug = "ambiguous-temperature") {
  const escapedModuleSlug = moduleSlug.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = html.match(
    new RegExp(
      `href=["']([^"']*/m/${escapedModuleSlug}/result/[^"']+/checkout)["']`,
      "u",
    ),
  );

  return match?.[1]?.replaceAll("&amp;", "&") ?? null;
}

function summarizeResultPageHtml(html, moduleSlug = "ambiguous-temperature") {
  const checkoutHref = extractCheckoutHref(html, moduleSlug);

  return {
    paidCtaVisible: html.includes("解鎖完整報告｜NT$49"),
    checkoutHrefPresent: Boolean(checkoutHref),
    checkoutHrefShape: redactRouteShape(checkoutHref),
    forbiddenCopyFound: findForbiddenCopy(html),
    secretNameLeaksFound: findSecretNameLeaks(html),
  };
}

function summarizeCheckoutStartHtml(html) {
  return {
    anyuWordmarkPresent: html.includes("暗語") && html.includes("ANYU"),
    backLinkPresent: html.includes("返回免費結果"),
    moduleIdentityPresent: html.includes("MODULE 01") && html.includes("曖昧溫度計"),
    stepperPresent:
      html.includes("付款流程") &&
      html.includes("付款") &&
      html.includes("生成") &&
      html.includes("完成"),
    pricePresent: html.includes("NT$49"),
    oneTimePresent: html.includes("一次性付款") || html.includes("單次付款"),
    nonSubscriptionPresent: html.includes("非訂閱制"),
    newebpayTrustPresent: html.includes("你將前往藍新金流完成安全付款"),
    providerNotificationTruthPresent:
      html.includes("藍新的正式通知") && html.includes("不會直接判定付款成功"),
    webDeliveryPresent: html.includes("完整報告將於網頁中提供查看"),
    recoverySoftGatePresent: html.includes("先保存查看連結"),
    recoveryEmailPrimaryPresent: html.includes("Email 查看連結"),
    recoveryLineDeferredPresent:
      html.includes("LINE 查看連結") &&
      (html.includes("用 LINE 保存查看連結") || html.includes("稍後支援")),
    recoverySkipWarningPresent: html.includes("我了解尚未保存查看連結，仍要繼續付款"),
    supportRefundPresent:
      html.includes("/refund") &&
      html.includes("hello@anyu.tw") &&
      html.includes("3–7 個工作天"),
    submitButtonPresent: html.includes("前往藍新安全付款頁"),
    sandboxCcoreTargetPresent: html.includes("https://ccore.newebpay.com/MPG/mpg_gateway"),
    formMethodPostPresent: html.includes('method="POST"') || html.includes('method="post"'),
    providerFieldNamesPresent: {
      merchantId: /name=["']MerchantID["']/iu.test(html),
      tradeInfo: /name=["']TradeInfo["']/iu.test(html),
      tradeSha: /name=["']TradeSha["']/iu.test(html),
      version: /name=["']Version["']/iu.test(html),
    },
    forbiddenCopyFound: findForbiddenCopy(html),
    secretNameLeaksFound: findSecretNameLeaks(html),
  };
}

function sanitizeRecord(value) {
  const serialized = JSON.stringify(value);

  if (containsTokenLikeValue(serialized)) {
    throw new Error("unsafe_token_like_output_detected");
  }

  return value;
}

export {
  assertSafeQaBaseUrl,
  containsTokenLikeValue,
  extractCheckoutHref,
  findForbiddenCopy,
  findSecretNameLeaks,
  normalizeBaseUrl,
  redactRouteShape,
  sanitizeRecord,
  summarizeCheckoutStartHtml,
  summarizeResultPageHtml,
};
