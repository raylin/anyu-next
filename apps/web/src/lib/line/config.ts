import { getLineAddUrl } from "@/lib/modules/ai-temperature-ui";

export function getLineLiffId(envValue = process.env.NEXT_PUBLIC_LINE_LIFF_ID): string | null {
  const candidate = envValue?.trim();

  return candidate ? candidate : null;
}

export function getLineLiffBaseUrl(envValue = process.env.NEXT_PUBLIC_LINE_LIFF_URL): string | null {
  const candidate = envValue?.trim();

  return candidate ? candidate : null;
}

export function buildLineLiffUrl(input: {
  unlockIntentId: string;
  unlockToken: string;
  fulfillmentCode: string;
  moduleSlug?: string;
  baseUrl?: string | null;
  debug?: boolean;
}) {
  const baseUrl = input.baseUrl ?? getLineLiffBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const url = new URL(baseUrl);
  if (url.hostname === "liff.line.me") {
    const [liffId] = url.pathname.split("/").filter(Boolean);
    url.pathname = liffId ? `/${liffId}` : url.pathname.replace(/\/$/, "");
  } else {
    url.pathname = "/line/fulfill";
  }
  if (input.moduleSlug) {
    url.searchParams.set("moduleSlug", input.moduleSlug);
  }
  if (input.debug) {
    url.searchParams.set("debug", "1");
  }
  url.searchParams.set("unlockIntentId", input.unlockIntentId);
  url.searchParams.set("unlockToken", input.unlockToken);
  url.searchParams.set("code", input.fulfillmentCode);

  return url.toString();
}

export function getPublicLineConfig(input: {
  unlockIntentId: string;
  unlockToken: string;
  fulfillmentCode: string;
  moduleSlug?: string;
  debug?: boolean;
}) {
  return {
    lineAddUrl: getLineAddUrl(),
    liffId: getLineLiffId(),
    liffUrl: buildLineLiffUrl(input),
  };
}

export function buildModuleUnlockPath(input: { moduleSlug: string; unlockToken: string }) {
  return `/m/${encodeURIComponent(input.moduleSlug)}/unlock/${encodeURIComponent(input.unlockToken)}`;
}

export function getAppBaseUrl(requestUrl?: string) {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (configured) {
    return configured.startsWith("http") ? configured.replace(/\/$/, "") : `https://${configured}`;
  }

  if (requestUrl) {
    const url = new URL(requestUrl);
    return url.origin;
  }

  return "https://anyu.tw";
}
