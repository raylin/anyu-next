import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import {
  isLineBindDiagnosticCategory,
  recordLineBindDiagnosticEvent,
} from "@/lib/line/recovery-bind-diagnostic-events";
import { resolveLineRecoveryBindStateToken } from "@/lib/line/recovery-bind-state";

type LineBindDiagnosticPayload = {
  state?: string;
  category?: string;
  hasLiffState?: boolean;
  hasIdToken?: boolean;
  bindApiReached?: boolean;
  recipientSecretRequired?: boolean;
  recipientSecretCreated?: boolean;
};

function jsonFailure(
  error:
    | "config_error"
    | "invalid_json"
    | "invalid_category"
    | "state_missing"
    | "state_invalid"
    | "state_expired",
  status: number,
) {
  return NextResponse.json({ ok: false, error }, { status });
}

function booleanIfPresent(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return jsonFailure("config_error", 503);
  }

  let body: LineBindDiagnosticPayload;

  try {
    body = (await request.json()) as LineBindDiagnosticPayload;
  } catch {
    return jsonFailure("invalid_json", 400);
  }

  if (!isLineBindDiagnosticCategory(body.category)) {
    return jsonFailure("invalid_category", 400);
  }

  const stateResult = resolveLineRecoveryBindStateToken({ token: body.state });

  if (!stateResult.ok) {
    const error = stateResult.error === "config_missing" ? "config_error" : stateResult.error;
    const status = error === "config_error" ? 503 : error === "state_expired" ? 410 : 400;

    return jsonFailure(error, status);
  }

  await recordLineBindDiagnosticEvent({
    state: stateResult.payload,
    source: "client",
    category: body.category,
    hasLiffState: booleanIfPresent(body.hasLiffState),
    hasIdToken: booleanIfPresent(body.hasIdToken),
    bindApiReached: booleanIfPresent(body.bindApiReached),
    recipientSecretRequired: booleanIfPresent(body.recipientSecretRequired),
    recipientSecretCreated: booleanIfPresent(body.recipientSecretCreated),
  }).catch(() => null);

  return NextResponse.json({ ok: true, status: "recorded" });
}
