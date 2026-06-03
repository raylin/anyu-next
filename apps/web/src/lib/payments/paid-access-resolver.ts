import {
  PAID_RESULT_PROMPT_VERSION,
  PAID_RESULT_SCHEMA_VERSION,
} from "@/lib/ai/paid-result-generation";
import { hasPaidResult } from "@/lib/ai/product-result-schema";
import { getEntitlementByPaidAccessToken, type Entitlement } from "@/lib/db/entitlements";
import {
  buildPaidAnalysisJobDedupeKey,
  getGenerationJobByDedupeKey,
  getGenerationJobById,
  type GenerationJob,
} from "@/lib/db/generation-jobs";
import { getPaidResultForAnalysisResult } from "@/lib/db/paid-results";
import { getAnalysisResultWithRequestById } from "@/lib/db/runtime";
import { getModuleBySlug } from "@/lib/modules/registry";
import { isPaidGenerationJobsEnabled } from "@/lib/runtime/feature-flags";
import { isPaidAccessToken } from "@/lib/payments/paid-access-token";

type PaidResultStatusRecord = Awaited<ReturnType<typeof getPaidResultForAnalysisResult>>;
type AnalysisResultRecord = NonNullable<Awaited<ReturnType<typeof getAnalysisResultWithRequestById>>>;

export type PaidAccessResolutionState =
  | "ready"
  | "pending"
  | "processing"
  | "failed"
  | "revoked"
  | "refunded"
  | "not_found"
  | "expired"
  | "missing_generation_job"
  | "recovery_required";

export type PaidAccessResolution =
  | {
      ok: true;
      accessKind: "paid_access_token" | "paid_result_access_link";
      state: Exclude<PaidAccessResolutionState, "not_found">;
      moduleSlug: string;
      entitlement: Entitlement;
      record: AnalysisResultRecord;
      storedPaidResult: PaidResultStatusRecord;
      generationJob: GenerationJob | null;
    }
  | {
      ok: false;
      accessKind: "paid_access_token" | "paid_result_access_link";
      state: "not_found";
      errorCategory: "invalid_token" | "not_found" | "config_unavailable";
    };

function isPast(date: Date | string | null | undefined, now: Date) {
  if (!date) {
    return false;
  }

  const parsed = date instanceof Date ? date : new Date(date);

  return !Number.isNaN(parsed.getTime()) && parsed.getTime() <= now.getTime();
}

function mapJobState(
  job: GenerationJob | null,
): Exclude<PaidAccessResolutionState, "not_found"> {
  if (!job) {
    return "missing_generation_job";
  }

  if (job.status === "processing") {
    return "processing";
  }

  if (job.status === "queued" || job.status === "retry_scheduled") {
    return "pending";
  }

  if (job.status === "failed_final") {
    return "failed";
  }

  return "recovery_required";
}

async function getPaidAccessGenerationJob(input: {
  entitlement: Entitlement;
  moduleSlug: string;
}) {
  if (input.entitlement.generationJobId) {
    return getGenerationJobById(input.entitlement.generationJobId);
  }

  if (!isPaidGenerationJobsEnabled()) {
    return null;
  }

  try {
    return await getGenerationJobByDedupeKey(
      buildPaidAnalysisJobDedupeKey({
        moduleSlug: input.moduleSlug,
        analysisResultId: input.entitlement.analysisResultId,
        promptVersion: PAID_RESULT_PROMPT_VERSION,
        schemaVersion: PAID_RESULT_SCHEMA_VERSION,
      }),
    );
  } catch {
    return null;
  }
}

export async function resolvePaidAccessToken(input: {
  moduleSlug: string;
  rawToken: string;
  now?: Date;
}): Promise<PaidAccessResolution> {
  if (!isPaidAccessToken(input.rawToken)) {
    return {
      ok: false,
      accessKind: "paid_access_token",
      state: "not_found",
      errorCategory: "invalid_token",
    };
  }

  let entitlement: Entitlement | null;

  try {
    entitlement = await getEntitlementByPaidAccessToken(input.rawToken);
  } catch {
    return {
      ok: false,
      accessKind: "paid_access_token",
      state: "not_found",
      errorCategory: "config_unavailable",
    };
  }

  if (!entitlement) {
    return {
      ok: false,
      accessKind: "paid_access_token",
      state: "not_found",
      errorCategory: "not_found",
    };
  }

  return resolvePaidEntitlementAccess({
    moduleSlug: input.moduleSlug,
    entitlement,
    accessKind: "paid_access_token",
    now: input.now,
  });
}

export async function resolvePaidEntitlementAccess(input: {
  moduleSlug: string;
  entitlement: Entitlement;
  accessKind?: "paid_access_token" | "paid_result_access_link";
  now?: Date;
}): Promise<PaidAccessResolution> {
  const accessKind = input.accessKind ?? "paid_access_token";
  const moduleConfig = getModuleBySlug(input.moduleSlug);

  if (!moduleConfig || input.entitlement.moduleSlug !== input.moduleSlug) {
    return {
      ok: false,
      accessKind,
      state: "not_found",
      errorCategory: "not_found",
    };
  }

  const record = await getAnalysisResultWithRequestById(
    input.entitlement.analysisResultId,
    moduleConfig.moduleId,
    moduleConfig.slug,
  );

  if (!record) {
    return {
      ok: false,
      accessKind,
      state: "not_found",
      errorCategory: "not_found",
    };
  }

  const now = input.now ?? new Date();
  const generationJob = await getPaidAccessGenerationJob({
    entitlement: input.entitlement,
    moduleSlug: moduleConfig.slug,
  });
  const currentPaidResult = await getPaidResultForAnalysisResult({
    analysisResultId: input.entitlement.analysisResultId,
    promptVersion: PAID_RESULT_PROMPT_VERSION,
    schemaVersion: PAID_RESULT_SCHEMA_VERSION,
  });
  const storedPaidResult =
    currentPaidResult ??
    (await getPaidResultForAnalysisResult({
      analysisResultId: input.entitlement.analysisResultId,
      status: "completed",
    }));

  if (input.entitlement.status === "revoked") {
    return {
      ok: true,
      accessKind,
      state: "revoked",
      moduleSlug: moduleConfig.slug,
      entitlement: input.entitlement,
      record,
      storedPaidResult,
      generationJob,
    };
  }

  if (input.entitlement.status === "refunded") {
    return {
      ok: true,
      accessKind,
      state: "refunded",
      moduleSlug: moduleConfig.slug,
      entitlement: input.entitlement,
      record,
      storedPaidResult,
      generationJob,
    };
  }

  if (
    input.entitlement.status === "expired" ||
    isPast(input.entitlement.expiresAt, now) ||
    isPast(input.entitlement.paidAccessTokenExpiresAt, now)
  ) {
    return {
      ok: true,
      accessKind,
      state: "expired",
      moduleSlug: moduleConfig.slug,
      entitlement: input.entitlement,
      record,
      storedPaidResult,
      generationJob,
    };
  }

  if (storedPaidResult?.status === "failed") {
    return {
      ok: true,
      accessKind,
      state: "failed",
      moduleSlug: moduleConfig.slug,
      entitlement: input.entitlement,
      record,
      storedPaidResult,
      generationJob,
    };
  }

  if (storedPaidResult?.status === "processing") {
    return {
      ok: true,
      accessKind,
      state: "processing",
      moduleSlug: moduleConfig.slug,
      entitlement: input.entitlement,
      record,
      storedPaidResult,
      generationJob,
    };
  }

  if (storedPaidResult?.status === "pending") {
    return {
      ok: true,
      accessKind,
      state: "pending",
      moduleSlug: moduleConfig.slug,
      entitlement: input.entitlement,
      record,
      storedPaidResult,
      generationJob,
    };
  }

  if (
    storedPaidResult?.status === "completed" &&
    (storedPaidResult.paidResultJson || hasPaidResult(record.result.normalizedResultJson))
  ) {
    return {
      ok: true,
      accessKind,
      state: "ready",
      moduleSlug: moduleConfig.slug,
      entitlement: input.entitlement,
      record,
      storedPaidResult,
      generationJob,
    };
  }

  if (storedPaidResult?.paidResultJson || hasPaidResult(record.result.normalizedResultJson)) {
    return {
      ok: true,
      accessKind,
      state: "ready",
      moduleSlug: moduleConfig.slug,
      entitlement: input.entitlement,
      record,
      storedPaidResult,
      generationJob,
    };
  }

  return {
    ok: true,
    accessKind,
    state: mapJobState(generationJob),
    moduleSlug: moduleConfig.slug,
    entitlement: input.entitlement,
    record,
    storedPaidResult,
    generationJob,
  };
}
