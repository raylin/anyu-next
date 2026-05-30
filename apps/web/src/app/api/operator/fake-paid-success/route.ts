import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import {
  getOperatorTestMode,
  OPERATOR_TEST_SECRET_HEADER,
} from "@/lib/runtime/abuse-guard";
import { isOperatorFakePaidSuccessEnabled } from "@/lib/runtime/feature-flags";
import { createOperatorFakePaidSuccess } from "@/lib/payments/operator-fake-paid-success";

export const maxDuration = 30;

type FakePaidSuccessPayload = {
  moduleSlug?: string;
  resultId?: string;
  idempotencyKey?: string;
};

function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function parsePayload(body: unknown): FakePaidSuccessPayload {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }

  const candidate = body as FakePaidSuccessPayload;

  return {
    moduleSlug: typeof candidate.moduleSlug === "string" ? candidate.moduleSlug : undefined,
    resultId: typeof candidate.resultId === "string" ? candidate.resultId : undefined,
    idempotencyKey:
      typeof candidate.idempotencyKey === "string" ? candidate.idempotencyKey : undefined,
  };
}

export async function POST(request: Request) {
  if (!isOperatorFakePaidSuccessEnabled()) {
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
    return errorResponse(503, "config_error", "Operator fake paid success is not configured.");
  }

  let payload: FakePaidSuccessPayload;

  try {
    payload = parsePayload(await request.json());
  } catch {
    return errorResponse(400, "invalid_json", "Invalid operator payload.");
  }

  if (!payload.moduleSlug || !payload.resultId) {
    return errorResponse(400, "invalid_input", "Missing moduleSlug or resultId.");
  }

  const result = await createOperatorFakePaidSuccess({
    moduleSlug: payload.moduleSlug,
    resultId: payload.resultId,
    idempotencyKey: payload.idempotencyKey,
  });

  if (!result.ok) {
    return errorResponse(result.status, result.error, "Operator fake paid success failed.");
  }

  return NextResponse.json({
    ok: true,
    mode: "operator_fake_paid_success",
    moduleSlug: result.moduleSlug,
    resultId: result.resultId,
    paymentIntentId: result.paymentIntent.id,
    paymentIntentStatus: result.paymentIntent.status,
    paymentIntentCreated: result.paymentIntentCreated,
    entitlementId: result.entitlement.id,
    entitlementStatus: result.entitlement.status,
    entitlementCreated: result.entitlementCreated,
    generationJobId: result.generationJob.id,
    generationJobStatus: result.generationJob.status,
    generationJobCreated: result.generationJobCreated,
    accessState: result.accessState,
    paidAccessToken: result.paidAccessToken,
    paidAccessTokenReturned: result.paidAccessTokenReturned,
    unlockPath: result.unlockPath,
    queueTrigger: {
      ok: result.queueTrigger.ok,
      category: result.queueTrigger.category,
      provider: result.queueTrigger.provider,
    },
  });
}
