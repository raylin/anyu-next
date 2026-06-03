import {
  createPaidResultRecoveryLink,
  resolvePaidResultRecoveryLink,
  revokePaidResultRecoveryLink,
} from "@/lib/db/paid-result-recovery-links";
import { resolvePaidEntitlementAccess } from "@/lib/payments/paid-access-resolver";
import { createOperatorFakePaidSuccess } from "@/lib/payments/operator-fake-paid-success";
import { processPaidAnalysisJobById } from "@/lib/modules/paid-generation-processor";

export type OperatorRecoveryLinkSmokeResult =
  | {
      ok: true;
      mode: "operator_recovery_link_smoke";
      createdLink: true;
      resolverStatus: "passed";
      invalidLinkSafety: "passed";
      cleanup: "revoked" | "failed";
      paymentIntentStatus: string;
      entitlementStatus: string;
      generationJobStatus: string;
      generationJobProcessorCategory: string | null;
      paidResultRenderMarker: true;
    }
  | {
      ok: false;
      status: 400 | 404 | 500 | 503;
      error:
        | "module_not_found"
        | "result_not_found"
        | "fake_paid_failed"
        | "recovery_link_create_failed"
        | "recovery_link_resolve_failed"
        | "paid_access_resolve_failed"
        | "paid_result_not_ready"
        | "invalid_link_safety_failed"
        | "unexpected_error";
      category?: string;
    };

function mapFakePaidErrorStatus(status: 404 | 409 | 500 | 503): 404 | 500 | 503 {
  if (status === 404) {
    return 404;
  }

  return status === 503 ? 503 : 500;
}

export async function runOperatorRecoveryLinkSmoke(input: {
  moduleSlug: string;
  resultId: string;
  idempotencyKey?: string | null;
}): Promise<OperatorRecoveryLinkSmokeResult> {
  try {
    const fakePaid = await createOperatorFakePaidSuccess({
      moduleSlug: input.moduleSlug,
      resultId: input.resultId,
      idempotencyKey: input.idempotencyKey,
    });

    if (!fakePaid.ok) {
      if (fakePaid.error === "module_not_found") {
        return { ok: false, status: 404, error: "module_not_found" };
      }

      if (fakePaid.error === "result_not_found") {
        return { ok: false, status: 404, error: "result_not_found" };
      }

      return {
        ok: false,
        status: mapFakePaidErrorStatus(fakePaid.status),
        error: "fake_paid_failed",
        category: fakePaid.error,
      };
    }

    const processorResult = await processPaidAnalysisJobById({
      generationJobId: fakePaid.generationJob.id,
      lockedBy: "operator_recovery_link_smoke",
    });

    const linkResult = await createPaidResultRecoveryLink({
      moduleSlug: fakePaid.moduleSlug,
      analysisResultId: fakePaid.resultId,
      paymentIntentId: fakePaid.paymentIntent.id,
      entitlementId: fakePaid.entitlement.id,
      channel: "operator_test",
    });

    let cleanup: "revoked" | "failed" = "failed";

    try {
      const recoveryLink = await resolvePaidResultRecoveryLink({ rawToken: linkResult.rawToken });

      if (!recoveryLink.ok) {
        return {
          ok: false,
          status: 500,
          error: "recovery_link_resolve_failed",
          category: recoveryLink.category,
        };
      }

      const paidAccess = await resolvePaidEntitlementAccess({
        moduleSlug: recoveryLink.link.moduleSlug,
        entitlement: recoveryLink.entitlement,
        accessKind: "paid_result_access_link",
      });

      if (!paidAccess.ok) {
        return {
          ok: false,
          status: 500,
          error: "paid_access_resolve_failed",
          category: paidAccess.errorCategory,
        };
      }

      if (paidAccess.state !== "ready" || paidAccess.storedPaidResult?.status !== "completed") {
        return {
          ok: false,
          status: 503,
          error: "paid_result_not_ready",
          category: paidAccess.state,
        };
      }

      const invalidLink = await resolvePaidResultRecoveryLink({ rawToken: `pal_${"x".repeat(43)}` });

      if (invalidLink.ok) {
        return {
          ok: false,
          status: 500,
          error: "invalid_link_safety_failed",
        };
      }

      const revoked = await revokePaidResultRecoveryLink({ linkId: linkResult.link.id });
      cleanup = revoked?.status === "revoked" ? "revoked" : "failed";

      return {
        ok: true,
        mode: "operator_recovery_link_smoke",
        createdLink: true,
        resolverStatus: "passed",
        invalidLinkSafety: "passed",
        cleanup,
        paymentIntentStatus: fakePaid.paymentIntent.status,
        entitlementStatus: fakePaid.entitlement.status,
        generationJobStatus: fakePaid.generationJob.status,
        generationJobProcessorCategory: processorResult.category,
        paidResultRenderMarker: true,
      };
    } finally {
      if (cleanup !== "revoked") {
        await revokePaidResultRecoveryLink({ linkId: linkResult.link.id }).catch(() => null);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message === "payment_recovery_link_token_secret_missing") {
      return { ok: false, status: 503, error: "recovery_link_create_failed", category: error.message };
    }

    return { ok: false, status: 500, error: "unexpected_error" };
  }
}
