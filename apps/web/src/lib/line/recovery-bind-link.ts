import {
  createLineRecoveryBindStateToken,
  type LineRecoveryBindSource,
} from "@/lib/line/recovery-bind-state";
import { getLineLiffBaseUrl } from "@/lib/line/config";

export type LineRecoveryBindHrefResult =
  | {
      ok: true;
      href: string;
    }
  | {
      ok: false;
      error: "config_missing" | "state_invalid";
    };

export function createLineRecoveryBindHref(input: {
  moduleSlug: string;
  resultId: string;
  paymentIntentId?: string | null;
  entitlementId?: string | null;
  source: LineRecoveryBindSource;
  returnPath: string;
  marketingOptIn?: boolean;
  env?: NodeJS.ProcessEnv;
}): LineRecoveryBindHrefResult {
  const state = createLineRecoveryBindStateToken(input);

  if (!state.ok) {
    return state;
  }

  const searchParams = new URLSearchParams({
    state: state.token,
    returnPath: input.returnPath,
  });

  return {
    ok: true,
    href: buildLineRecoveryBindUrl({
      searchParams,
      env: input.env,
    }),
  };
}

function buildLineRecoveryBindUrl(input: {
  searchParams: URLSearchParams;
  env?: NodeJS.ProcessEnv;
}) {
  const baseUrl = getLineLiffBaseUrl(input.env?.NEXT_PUBLIC_LINE_LIFF_URL);

  if (!baseUrl) {
    return `/line/recovery/bind?${input.searchParams.toString()}`;
  }

  const url = new URL(baseUrl);

  if (url.hostname === "liff.line.me") {
    const [liffId] = url.pathname.split("/").filter(Boolean);
    url.pathname = liffId ? `/${liffId}` : url.pathname.replace(/\/$/u, "");
  } else {
    url.pathname = "/line/recovery/bind";
  }

  url.search = input.searchParams.toString();

  return url.toString();
}
