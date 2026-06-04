import { getLineLiffId } from "@/lib/line/config";

export type LineIdTokenVerification =
  | {
      ok: true;
      lineUserId: string;
      audience: string;
    }
  | {
      ok: false;
      error: "missing_channel_id" | "missing_token" | "line_verify_failed" | "invalid_subject";
    };

type LineVerifyResponse = {
  sub?: string;
  aud?: string;
  error?: string;
};

export function getLineLoginChannelId(input: {
  explicitChannelId?: string | null;
  liffId?: string | null;
} = {}) {
  const explicit =
    input.explicitChannelId?.trim() || process.env.LINE_LOGIN_CHANNEL_ID?.trim();

  if (explicit) {
    return explicit;
  }

  const liffId = input.liffId?.trim() || getLineLiffId();
  const derived = liffId?.split("-")[0]?.trim();

  return derived || null;
}

export async function verifyLineIdToken(input: {
  idToken?: string | null;
  channelId?: string | null;
  fetchImpl?: typeof fetch;
}): Promise<LineIdTokenVerification> {
  const idToken = input.idToken?.trim();
  const channelId = getLineLoginChannelId({ explicitChannelId: input.channelId });

  if (!idToken) {
    return { ok: false, error: "missing_token" };
  }

  if (!channelId) {
    return { ok: false, error: "missing_channel_id" };
  }

  const fetchImpl = input.fetchImpl ?? fetch;
  const body = new URLSearchParams({
    id_token: idToken,
    client_id: channelId,
  });

  const response = await fetchImpl("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    return { ok: false, error: "line_verify_failed" };
  }

  const payload = (await response.json()) as LineVerifyResponse;
  const lineUserId = payload.sub?.trim();

  if (!lineUserId) {
    return { ok: false, error: "invalid_subject" };
  }

  return {
    ok: true,
    lineUserId,
    audience: payload.aud ?? channelId,
  };
}
