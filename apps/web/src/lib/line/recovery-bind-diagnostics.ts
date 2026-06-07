import type { LineRecoveryBindContext } from "@/lib/line/recovery-liff-context";

export type LineRecoveryBindDiagnosticCategory =
  | "liff_sdk_load_failed"
  | "liff_init_failed"
  | "liff_login_redirect_started"
  | "liff_state_missing"
  | "liff_state_invalid"
  | "liff_state_expired"
  | "id_token_missing_after_login"
  | "bind_api_reached"
  | "bind_api_state_valid"
  | "bind_api_state_missing"
  | "bind_api_state_invalid"
  | "bind_api_line_identity_missing"
  | "bind_api_id_token_verified"
  | "bind_api_contact_saved"
  | "bind_api_recipient_secret_write_started"
  | "bind_api_recipient_secret_failed"
  | "bind_api_contact_marked_failed_after_secret_failure"
  | "bind_api_recipient_secret_created"
  | "bind_api_failed"
  | "bind_success";

export type LineRecoveryBindDiagnosticStatus =
  | "pending"
  | "login_redirect"
  | "success"
  | "fallback";

export type LineRecoveryBindApiResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error?: string | null;
      bindCategory?: string | null;
    };

export type LineRecoveryBindDiagnosticInput = {
  context: LineRecoveryBindContext;
  liffIdConfigured?: boolean;
  sdkLoadStatus?: "not_started" | "loaded" | "failed";
  initStatus?: "not_started" | "success" | "failed";
  loggedIn?: boolean;
  idTokenPresent?: boolean;
  bindApiResult?: LineRecoveryBindApiResult | null;
};

export type LineRecoveryBindDiagnosticResult = {
  status: LineRecoveryBindDiagnosticStatus;
  category: LineRecoveryBindDiagnosticCategory | null;
  safeMessage: string;
  canRetryLine: boolean;
  canUseEmailFallback: boolean;
};

const TOKEN_OR_PRIVATE_PATTERNS = [
  /pa_[A-Za-z0-9_-]{8,}/u,
  /pcs_[A-Za-z0-9_-]{8,}/u,
  /pal_[A-Za-z0-9_-]{8,}/u,
  /prl_[A-Za-z0-9_-]{8,}/u,
  /idToken/iu,
  /lineUserId/iu,
  /encrypted_recipient/iu,
  /recipient_hash/iu,
  /contact_hash/iu,
  /TradeInfo|TradeSha/iu,
];

export function getInitialLineRecoveryBindDiagnostic(
  context: LineRecoveryBindContext,
): LineRecoveryBindDiagnosticCategory | null {
  if (!context.state) {
    return "liff_state_missing";
  }

  if (!context.isStateShapeValid) {
    return "liff_state_invalid";
  }

  return null;
}

export function mapLineRecoveryBindApiFailure(input: {
  error?: string | null;
  bindCategory?: string | null;
}): LineRecoveryBindDiagnosticCategory {
  switch (input.error) {
    case "state_missing":
      return "bind_api_state_missing";
    case "state_invalid":
      return "bind_api_state_invalid";
    case "state_expired":
      return "liff_state_expired";
    case "line_user_missing":
      return "bind_api_line_identity_missing";
    case "bind_failed":
      return input.bindCategory === "recipient_secret_write_failed"
        ? "bind_api_recipient_secret_failed"
        : "bind_api_failed";
    default:
      return "bind_api_failed";
  }
}

export function evaluateLineRecoveryBindDiagnostic(
  input: LineRecoveryBindDiagnosticInput,
): LineRecoveryBindDiagnosticResult {
  const initialCategory = getInitialLineRecoveryBindDiagnostic(input.context);

  if (initialCategory) {
    return buildLineRecoveryBindDiagnosticResult(initialCategory);
  }

  if (input.liffIdConfigured === false || input.initStatus === "failed") {
    return buildLineRecoveryBindDiagnosticResult("liff_init_failed");
  }

  if (input.sdkLoadStatus === "failed") {
    return buildLineRecoveryBindDiagnosticResult("liff_sdk_load_failed");
  }

  if (input.loggedIn === false) {
    return buildLineRecoveryBindDiagnosticResult("liff_login_redirect_started");
  }

  if (input.idTokenPresent === false) {
    return buildLineRecoveryBindDiagnosticResult("id_token_missing_after_login");
  }

  if (input.bindApiResult) {
    if (input.bindApiResult.ok) {
      return buildLineRecoveryBindDiagnosticResult("bind_success");
    }

    return buildLineRecoveryBindDiagnosticResult(
      mapLineRecoveryBindApiFailure({
        error: input.bindApiResult.error,
        bindCategory: input.bindApiResult.bindCategory,
      }),
    );
  }

  return {
    status: "pending",
    category: null,
    safeMessage: "正在準備 LINE 保存流程。之後可以從 LINE 回到 ANYU 查看完整報告。",
    canRetryLine: false,
    canUseEmailFallback: false,
  };
}

export function buildLineRecoveryBindDiagnosticResult(
  category: LineRecoveryBindDiagnosticCategory,
): LineRecoveryBindDiagnosticResult {
  const fallback = category !== "bind_success" && category !== "liff_login_redirect_started";

  return {
    status:
      category === "bind_success"
        ? "success"
        : category === "liff_login_redirect_started"
          ? "login_redirect"
          : "fallback",
    category,
    safeMessage: getLineRecoveryBindDiagnosticMessage(category),
    canRetryLine: fallback,
    canUseEmailFallback: fallback,
  };
}

export function getLineRecoveryBindDiagnosticMessage(
  category: LineRecoveryBindDiagnosticCategory,
) {
  switch (category) {
    case "bind_success":
      return "已用 LINE 保存專屬查看連結。之後可以從 LINE 回到 ANYU 查看完整報告。";
    case "bind_api_reached":
    case "bind_api_state_valid":
    case "bind_api_id_token_verified":
    case "bind_api_contact_saved":
    case "bind_api_recipient_secret_write_started":
    case "bind_api_recipient_secret_created":
      return "正在確認 LINE 保存狀態。";
    case "liff_login_redirect_started":
      return "正在前往 LINE 完成身分確認。";
    case "liff_state_missing":
    case "bind_api_state_missing":
      return "缺少 LINE 保存狀態。請回到原頁，改用 Email 保存查看連結。";
    case "liff_state_invalid":
    case "bind_api_state_invalid":
      return "這個 LINE 查看連結已失效。請回到原頁，改用 Email 保存查看連結。";
    case "liff_state_expired":
      return "這個 LINE 查看連結已過期。請回到原頁重新開始，或改用 Email 保存查看連結。";
    case "id_token_missing_after_login":
    case "bind_api_line_identity_missing":
      return "LINE 身分確認沒有完成。你可以回到原頁，改用 Email 保存查看連結。";
    case "liff_sdk_load_failed":
    case "liff_init_failed":
      return "LINE 保存暫時無法啟動。你可以回到原頁，改用 Email 保存查看連結。";
    case "bind_api_recipient_secret_failed":
    case "bind_api_failed":
    default:
      return "LINE 綁定失敗也不影響付款或查看報告。你可以回到原頁，改用 Email 保存查看連結。";
  }
}

export function assertSafeLineRecoveryBindDiagnosticOutput(value: unknown) {
  const serialized = JSON.stringify(value);

  for (const pattern of TOKEN_OR_PRIVATE_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error("line_recovery_bind_diagnostic_not_sanitized");
    }
  }
}
