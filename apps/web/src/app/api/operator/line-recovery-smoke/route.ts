import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import {
  bindRecoveryContactToPaymentContext,
  getLatestLineRecoveryContactWithActiveRecipientSecret,
} from "@/lib/db/payment-recovery-contacts";
import { getRecentPaidResultRecoveryLinkForContact } from "@/lib/db/paid-result-recovery-links";
import { processPaidAnalysisJobById } from "@/lib/modules/paid-generation-processor";
import { createOperatorFakePaidSuccess } from "@/lib/payments/operator-fake-paid-success";
import {
  getOperatorTestMode,
  OPERATOR_TEST_SECRET_HEADER,
} from "@/lib/runtime/abuse-guard";
import { isOperatorLineRecoverySmokeEnabled } from "@/lib/runtime/feature-flags";

export const maxDuration = 90;

type LineRecoverySmokePayload = {
  moduleSlug?: string;
  idempotencyKey?: string;
};

function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function parsePayload(body: unknown): LineRecoverySmokePayload {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }

  const candidate = body as LineRecoverySmokePayload;

  return {
    moduleSlug: typeof candidate.moduleSlug === "string" ? candidate.moduleSlug : undefined,
    idempotencyKey:
      typeof candidate.idempotencyKey === "string" ? candidate.idempotencyKey : undefined,
  };
}

export async function POST(request: Request) {
  if (!isOperatorLineRecoverySmokeEnabled()) {
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
    return errorResponse(503, "config_error", "LINE recovery smoke is not configured.");
  }

  let payload: LineRecoverySmokePayload;

  try {
    payload = parsePayload(await request.json());
  } catch {
    return errorResponse(400, "invalid_json", "Invalid operator payload.");
  }

  if (payload.moduleSlug !== "ambiguous-temperature") {
    return errorResponse(400, "invalid_input", "Missing or invalid smoke input.");
  }

  try {
    const lineContact = await getLatestLineRecoveryContactWithActiveRecipientSecret({
      moduleSlug: payload.moduleSlug,
    });

    if (!lineContact) {
      return errorResponse(
        409,
        "recipient_secret_missing",
        "No eligible LINE recovery recipient is available.",
      );
    }

    const fakePaid = await createOperatorFakePaidSuccess({
      moduleSlug: payload.moduleSlug,
      resultId: lineContact.analysisResultId,
      idempotencyKey: payload.idempotencyKey,
    });

    if (!fakePaid.ok) {
      return errorResponse(fakePaid.status, fakePaid.error, "Operator fake paid success failed.");
    }

    const boundContact = await bindRecoveryContactToPaymentContext({
      recoveryContactId: lineContact.id,
      paymentIntentId: fakePaid.paymentIntent.id,
      entitlementId: fakePaid.entitlement.id,
    });

    if (!boundContact) {
      return errorResponse(503, "line_contact_bind_failed", "LINE recovery contact bind failed.");
    }

    const processorResult = await processPaidAnalysisJobById({
      generationJobId: fakePaid.generationJob.id,
      lockedBy: "operator_line_recovery_real_message_smoke",
    });
    const link = await getRecentPaidResultRecoveryLinkForContact({
      entitlementId: fakePaid.entitlement.id,
      recoveryContactId: lineContact.id,
      channel: "line",
    }).catch(() => null);
    const smokePassed = link?.status === "sent";

    return NextResponse.json({
      ok: smokePassed,
      autoSendHookExercised: true,
      fakePaidCreated: true,
      lineContactBound: true,
      recipientSecretResolvedServerSide: true,
      processorCategory: processorResult.category,
      processorJobResult: "jobResult" in processorResult ? processorResult.jobResult ?? null : null,
      lineMessageSent: link?.status === "sent",
      recoveryLinkCreated: Boolean(link),
      recoveryLinkStatus: link?.status ?? null,
      rawRecoveryTokenReturned: false,
      tokenHashReturned: false,
      rawLineUserIdReturned: false,
      privateRecipientReturned: false,
      privateRecipientHashReturned: false,
      rawPaidAccessTokenReturned: false,
      rawCheckoutSessionTokenReturned: false,
      reportContentReturned: false,
    }, { status: smokePassed ? 200 : 503 });
  } catch {
    return errorResponse(503, "line_recovery_smoke_failed", "LINE recovery smoke failed.");
  }
}
