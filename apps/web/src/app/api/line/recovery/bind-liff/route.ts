import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import {
  bindVerifiedLineUserToRecoveryContact,
  isSafeLineRecoveryReturnPath,
  resolveLineRecoveryBindStateToken,
} from "@/lib/line/recovery-bind-state";
import { verifyLineIdToken } from "@/lib/line/liff";

type LineRecoveryBindPayload = {
  state?: string;
  idToken?: string;
};

function lineRecoveryReturnPath(returnPath: string, status: string) {
  if (!isSafeLineRecoveryReturnPath(returnPath)) {
    return null;
  }

  const url = new URL(returnPath, "https://anyu.tw");
  url.searchParams.set("lineRecovery", status);

  return `${url.pathname}${url.search}`;
}

function jsonFailure(input: {
  error:
    | "config_error"
    | "invalid_json"
    | "state_missing"
    | "state_invalid"
    | "state_expired"
    | "line_user_missing"
    | "bind_failed";
  status: number;
  returnPath?: string | null;
  bindCategory?: string;
}) {
  return NextResponse.json(
    {
      ok: false,
      error: input.error,
      ...(input.returnPath ? { returnPath: input.returnPath } : {}),
      ...(input.bindCategory ? { bindCategory: input.bindCategory } : {}),
    },
    { status: input.status },
  );
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return jsonFailure({ error: "config_error", status: 503 });
  }

  let body: LineRecoveryBindPayload;

  try {
    body = (await request.json()) as LineRecoveryBindPayload;
  } catch {
    return jsonFailure({ error: "invalid_json", status: 400 });
  }

  const stateResult = resolveLineRecoveryBindStateToken({ token: body.state });

  if (!stateResult.ok) {
    const status = stateResult.error === "state_expired" ? 410 : 400;
    const error = stateResult.error === "config_missing" ? "config_error" : stateResult.error;

    return jsonFailure({ error, status: error === "config_error" ? 503 : status });
  }

  const fallbackReturnPath = lineRecoveryReturnPath(stateResult.payload.returnPath, "line_error");
  const idToken = body.idToken?.trim();

  if (!idToken) {
    return jsonFailure({
      error: "line_user_missing",
      status: 400,
      returnPath: fallbackReturnPath,
    });
  }

  const identity = await verifyLineIdToken({ idToken });

  if (!identity.ok) {
    return jsonFailure({
      error: "line_user_missing",
      status: 401,
      returnPath: fallbackReturnPath,
    });
  }

  const bindResult = await bindVerifiedLineUserToRecoveryContact({
    state: stateResult.payload,
    lineUserId: identity.lineUserId,
  });

  if (!bindResult.ok) {
    return jsonFailure({
      error: "bind_failed",
      status: bindResult.category === "line_hash_failed" ? 503 : 500,
      returnPath: fallbackReturnPath,
      bindCategory: bindResult.category,
    });
  }

  return NextResponse.json({
    ok: true,
    status: "success",
    recoveryContactStatus: bindResult.status,
    returnPath: lineRecoveryReturnPath(stateResult.payload.returnPath, "line_saved"),
  });
}
