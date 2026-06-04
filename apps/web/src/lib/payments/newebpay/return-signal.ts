type SearchParamValue = string | string[] | undefined;

export type NewebPayReturnSearchParams = {
  Status?: SearchParamValue;
  Message?: SearchParamValue;
  RespondCode?: SearchParamValue;
};

export type NewebPayBrowserReturnSignal =
  | {
      state: "expired_session";
      category: "provider_link_expired";
    }
  | {
      state: "paid_failed";
      category: "provider_return_failed";
    };

function firstSearchParam(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || "";
  }

  return value?.trim() || "";
}

function includesAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}

export function classifyNewebPayBrowserReturnSignal(
  searchParams: NewebPayReturnSearchParams,
): NewebPayBrowserReturnSignal | null {
  const status = firstSearchParam(searchParams.Status);
  const message = firstSearchParam(searchParams.Message);
  const respondCode = firstSearchParam(searchParams.RespondCode);
  const normalizedStatus = status.toUpperCase();
  const normalizedSignal = `${status} ${message} ${respondCode}`.toLowerCase();

  if (!status && !message && !respondCode) {
    return null;
  }

  if (
    includesAny(normalizedSignal, [
      "expire",
      "expired",
      "timeout",
      "timed out",
      "逾時",
      "過期",
      "失效",
    ])
  ) {
    return { state: "expired_session", category: "provider_link_expired" };
  }

  if (normalizedStatus && normalizedStatus !== "SUCCESS") {
    return { state: "paid_failed", category: "provider_return_failed" };
  }

  if (
    includesAny(normalizedSignal, [
      "failed",
      "failure",
      "cancel",
      "cancelled",
      "reject",
      "rejected",
      "失敗",
      "取消",
      "拒絕",
    ])
  ) {
    return { state: "paid_failed", category: "provider_return_failed" };
  }

  return null;
}
