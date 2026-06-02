import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { createOrUpdatePostPaymentEmailRecoveryContact } from "@/lib/db/payment-recovery-contacts";
import { createAndSendEmailRecoveryLink } from "@/lib/notifications/email-recovery-link";
import {
  getOperatorTestMode,
  OPERATOR_TEST_SECRET_HEADER,
} from "@/lib/runtime/abuse-guard";
import { isOperatorEmailRecoverySmokeEnabled } from "@/lib/runtime/feature-flags";

type EmailRecoverySmokePayload = {
  moduleSlug?: string;
  resultId?: string;
  paymentIntentId?: string;
  entitlementId?: string;
  email?: string;
};

type ValidEmailRecoverySmokePayload = Required<EmailRecoverySmokePayload>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function parsePayload(body: unknown): EmailRecoverySmokePayload {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }

  const candidate = body as EmailRecoverySmokePayload;

  return {
    moduleSlug: typeof candidate.moduleSlug === "string" ? candidate.moduleSlug : undefined,
    resultId: typeof candidate.resultId === "string" ? candidate.resultId : undefined,
    paymentIntentId:
      typeof candidate.paymentIntentId === "string" ? candidate.paymentIntentId : undefined,
    entitlementId:
      typeof candidate.entitlementId === "string" ? candidate.entitlementId : undefined,
    email: typeof candidate.email === "string" ? candidate.email : undefined,
  };
}

function isValidPayload(
  payload: EmailRecoverySmokePayload,
): payload is ValidEmailRecoverySmokePayload {
  return (
    payload.moduleSlug === "ambiguous-temperature" &&
    Boolean(payload.email?.trim()) &&
    Boolean(payload.resultId && UUID_PATTERN.test(payload.resultId)) &&
    Boolean(payload.paymentIntentId && UUID_PATTERN.test(payload.paymentIntentId)) &&
    Boolean(payload.entitlementId && UUID_PATTERN.test(payload.entitlementId))
  );
}

export async function POST(request: Request) {
  if (!isOperatorEmailRecoverySmokeEnabled()) {
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
    return errorResponse(503, "config_error", "Email recovery smoke is not configured.");
  }

  let payload: EmailRecoverySmokePayload;

  try {
    payload = parsePayload(await request.json());
  } catch {
    return errorResponse(400, "invalid_json", "Invalid operator payload.");
  }

  if (!isValidPayload(payload)) {
    return errorResponse(400, "invalid_input", "Missing or invalid smoke input.");
  }

  const moduleSlug = payload.moduleSlug;
  const resultId = payload.resultId;
  const paymentIntentId = payload.paymentIntentId;
  const entitlementId = payload.entitlementId;
  const email = payload.email;

  try {
    const contact = await createOrUpdatePostPaymentEmailRecoveryContact({
      moduleSlug,
      analysisResultId: resultId,
      paymentIntentId,
      entitlementId,
      email,
      source: "completed_result",
      marketingOptInAt: null,
    });
    const sendResult = await createAndSendEmailRecoveryLink({
      moduleSlug,
      moduleTitle: "曖昧溫度計",
      analysisResultId: resultId,
      paymentIntentId,
      entitlementId,
      recoveryContact: contact,
    });

    return NextResponse.json({
      ok: sendResult.ok,
      provider: sendResult.provider ?? null,
      sendStatus: sendResult.status,
      category: "category" in sendResult ? sendResult.category ?? null : null,
      recoveryLinkCreated: sendResult.recoveryLinkCreated,
      emailSent: sendResult.emailSent,
      rawRecoveryTokenReturned: false,
      tokenHashReturned: false,
      rawEmailReturned: false,
      rawPaidAccessTokenReturned: false,
      rawCheckoutSessionTokenReturned: false,
      reportContentReturned: false,
    }, { status: sendResult.ok ? 200 : 503 });
  } catch {
    return errorResponse(503, "email_recovery_smoke_failed", "Email recovery smoke failed.");
  }
}
