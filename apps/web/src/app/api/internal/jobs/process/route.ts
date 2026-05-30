import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { processPaidAnalysisJobs } from "@/lib/modules/paid-generation-processor";
import { isPaidGenerationProcessorEnabled } from "@/lib/runtime/feature-flags";
import { getInternalJobSecret, isInternalJobAuthorized } from "@/lib/runtime/internal-job-auth";

export const maxDuration = 90;

type ProcessorPayload = {
  jobType?: string;
  limit?: number;
  dryRun?: boolean;
};

function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function unauthorizedResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "unauthorized",
      message: "Unauthorized processor request.",
    },
    { status: 401 },
  );
}

function parseProcessorPayload(body: unknown): ProcessorPayload {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }

  const candidate = body as ProcessorPayload;

  return {
    jobType: candidate.jobType,
    limit: candidate.limit,
    dryRun: candidate.dryRun,
  };
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return errorResponse(503, "config_error", "Processor is not configured.");
  }

  if (!getInternalJobSecret()) {
    return errorResponse(503, "config_error", "Processor is not configured.");
  }

  if (!isInternalJobAuthorized(request.headers.get("authorization"))) {
    return unauthorizedResponse();
  }

  if (!isPaidGenerationProcessorEnabled()) {
    return errorResponse(403, "processor_disabled", "Processor is disabled.");
  }

  let payload: ProcessorPayload;

  try {
    payload = parseProcessorPayload(await request.json());
  } catch {
    return errorResponse(400, "invalid_json", "Invalid processor payload.");
  }

  if (payload.jobType && payload.jobType !== "paid_analysis") {
    return errorResponse(400, "unsupported_job_type", "Unsupported processor job type.");
  }

  const result = await processPaidAnalysisJobs({
    limit: payload.limit,
    dryRun: payload.dryRun === true,
  });

  return NextResponse.json(result);
}
