import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import {
  getOperatorTestMode,
  OPERATOR_TEST_SECRET_HEADER,
} from "@/lib/runtime/abuse-guard";
import { isOperatorRecoveryLinkSmokeEnabled } from "@/lib/runtime/feature-flags";
import { runOperatorRecoveryLinkSmoke } from "@/lib/payments/operator-recovery-link-smoke";

export const maxDuration = 90;

type RecoveryLinkSmokePayload = {
  moduleSlug?: string;
  resultId?: string;
  idempotencyKey?: string;
};

function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function parsePayload(body: unknown): RecoveryLinkSmokePayload {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }

  const candidate = body as RecoveryLinkSmokePayload;

  return {
    moduleSlug: typeof candidate.moduleSlug === "string" ? candidate.moduleSlug : undefined,
    resultId: typeof candidate.resultId === "string" ? candidate.resultId : undefined,
    idempotencyKey:
      typeof candidate.idempotencyKey === "string" ? candidate.idempotencyKey : undefined,
  };
}

export async function POST(request: Request) {
  if (!isOperatorRecoveryLinkSmokeEnabled()) {
    return errorResponse(404, "not_found", "Not found.");
  }

  const operatorMode = getOperatorTestMode(request.headers);

  if (!operatorMode.enabled) {
    return errorResponse(
      401,
      "unauthorized",
      `Missing or invalid ${OPERATOR_TEST_SECRET_HEADER}.`,
    );
  }

  if (!isDbConfigured()) {
    return errorResponse(503, "config_error", "Recovery link smoke is not configured.");
  }

  let payload: RecoveryLinkSmokePayload;

  try {
    payload = parsePayload(await request.json());
  } catch {
    return errorResponse(400, "invalid_json", "Invalid operator payload.");
  }

  if (!payload.moduleSlug || !payload.resultId) {
    return errorResponse(400, "invalid_input", "Missing moduleSlug or resultId.");
  }

  const result = await runOperatorRecoveryLinkSmoke({
    moduleSlug: payload.moduleSlug,
    resultId: payload.resultId,
    idempotencyKey: payload.idempotencyKey,
  });

  if (!result.ok) {
    return errorResponse(result.status, result.error, "Recovery link smoke failed.");
  }

  return NextResponse.json({
    ok: true,
    mode: result.mode,
    createdLink: result.createdLink,
    resolverStatus: result.resolverStatus,
    invalidLinkSafety: result.invalidLinkSafety,
    cleanup: result.cleanup,
    paymentIntentStatus: result.paymentIntentStatus,
    entitlementStatus: result.entitlementStatus,
    generationJobStatus: result.generationJobStatus,
    generationJobProcessorCategory: result.generationJobProcessorCategory,
    paidResultRenderMarker: result.paidResultRenderMarker,
    rawRecoveryTokenReturned: false,
    tokenHashReturned: false,
    rawPaidAccessTokenReturned: false,
    rawCheckoutSessionTokenReturned: false,
    emailOrLineSent: false,
  });
}

