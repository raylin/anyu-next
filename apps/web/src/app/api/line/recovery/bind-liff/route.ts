import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import {
  bindVerifiedLineUserToRecoveryContact,
  isSafeLineRecoveryReturnPath,
  resolveLineRecoveryBindStateToken,
} from "@/lib/line/recovery-bind-state";
import { recordLineBindDiagnosticEvent } from "@/lib/line/recovery-bind-diagnostic-events";
import { mapLineRecoveryBindApiFailure } from "@/lib/line/recovery-bind-diagnostics";
import { verifyLineIdToken } from "@/lib/line/liff";
import type { LineRecoveryBindStatePayload } from "@/lib/line/recovery-bind-state";

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

async function recordServerBindDiagnostic(input: {
  state: LineRecoveryBindStatePayload;
  category: Parameters<typeof recordLineBindDiagnosticEvent>[0]["category"];
  hasIdToken?: boolean;
  recipientSecretCreated?: boolean;
}) {
  try {
    await recordLineBindDiagnosticEvent({
      state: input.state,
      source: "server",
      category: input.category,
      hasLiffState: true,
      hasIdToken: input.hasIdToken,
      bindApiReached: true,
      recipientSecretRequired: true,
      recipientSecretCreated: input.recipientSecretCreated,
    });
  } catch {
    // Diagnostics are best-effort and must not change bind behavior.
  }
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

  await recordServerBindDiagnostic({
    state: stateResult.payload,
    category: "bind_api_reached",
    hasIdToken: Boolean(idToken),
    recipientSecretCreated: false,
  });
  await recordServerBindDiagnostic({
    state: stateResult.payload,
    category: "bind_api_state_valid",
    hasIdToken: Boolean(idToken),
    recipientSecretCreated: false,
  });

  if (!idToken) {
    await recordServerBindDiagnostic({
      state: stateResult.payload,
      category: "bind_api_line_identity_missing",
      hasIdToken: false,
      recipientSecretCreated: false,
    });

    return jsonFailure({
      error: "line_user_missing",
      status: 400,
      returnPath: fallbackReturnPath,
    });
  }

  const identity = await verifyLineIdToken({ idToken });

  if (!identity.ok) {
    await recordServerBindDiagnostic({
      state: stateResult.payload,
      category: "bind_api_line_identity_missing",
      hasIdToken: true,
      recipientSecretCreated: false,
    });

    return jsonFailure({
      error: "line_user_missing",
      status: 401,
      returnPath: fallbackReturnPath,
    });
  }

  await recordServerBindDiagnostic({
    state: stateResult.payload,
    category: "bind_api_id_token_verified",
    hasIdToken: true,
    recipientSecretCreated: false,
  });
  const bindResult = await bindVerifiedLineUserToRecoveryContact({
    state: stateResult.payload,
    lineUserId: identity.lineUserId,
  });

  if (!bindResult.ok) {
    if (bindResult.recoveryContactId) {
      await recordServerBindDiagnostic({
        state: stateResult.payload,
        category: "bind_api_contact_saved",
        hasIdToken: true,
        recipientSecretCreated: false,
      });
      await recordServerBindDiagnostic({
        state: stateResult.payload,
        category: "bind_api_recipient_secret_write_started",
        hasIdToken: true,
        recipientSecretCreated: false,
      });
    }

    await recordServerBindDiagnostic({
      state: stateResult.payload,
      category: mapLineRecoveryBindApiFailure({
        error: "bind_failed",
        bindCategory: bindResult.category,
      }),
      hasIdToken: true,
      recipientSecretCreated: false,
    });

    if (bindResult.contactMarkedFailed) {
      await recordServerBindDiagnostic({
        state: stateResult.payload,
        category: "bind_api_contact_marked_failed_after_secret_failure",
        hasIdToken: true,
        recipientSecretCreated: false,
      });
    }

    return jsonFailure({
      error: "bind_failed",
      status: bindResult.category === "line_hash_failed" ? 503 : 500,
      returnPath: fallbackReturnPath,
      bindCategory: bindResult.category,
    });
  }

  await recordServerBindDiagnostic({
    state: stateResult.payload,
    category: "bind_api_contact_saved",
    hasIdToken: true,
    recipientSecretCreated: false,
  });
  await recordServerBindDiagnostic({
    state: stateResult.payload,
    category: "bind_api_recipient_secret_write_started",
    hasIdToken: true,
    recipientSecretCreated: false,
  });
  await recordServerBindDiagnostic({
    state: stateResult.payload,
    category: "bind_api_recipient_secret_created",
    hasIdToken: true,
    recipientSecretCreated: true,
  });
  await recordServerBindDiagnostic({
    state: stateResult.payload,
    category: "bind_success",
    hasIdToken: true,
    recipientSecretCreated: true,
  });

  return NextResponse.json({
    ok: true,
    status: "success",
    recoveryContactStatus: bindResult.status,
    returnPath: lineRecoveryReturnPath(stateResult.payload.returnPath, "line_saved"),
  });
}
