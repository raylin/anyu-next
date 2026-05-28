import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { processPaidAnalysisJobs } from "@/lib/modules/paid-generation-processor";
import { getCronSecret, isCronAuthorized } from "@/lib/runtime/cron-auth";
import { isPaidGenerationProcessorEnabled } from "@/lib/runtime/feature-flags";

export const maxDuration = 90;

function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function parseDryRun(value: string | null): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}

export async function GET(request: Request) {
  if (!isDbConfigured()) {
    return errorResponse(503, "config_error", "Paid generation cron is not configured.");
  }

  if (!getCronSecret()) {
    return errorResponse(503, "config_error", "Paid generation cron is not configured.");
  }

  if (!isCronAuthorized(request.headers.get("authorization"))) {
    return errorResponse(401, "unauthorized", "Unauthorized paid generation cron request.");
  }

  if (!isPaidGenerationProcessorEnabled()) {
    return errorResponse(403, "processor_disabled", "Paid generation processor is disabled.");
  }

  const result = await processPaidAnalysisJobs({
    dryRun: parseDryRun(new URL(request.url).searchParams.get("dryRun")),
    limit: 1,
    lockedBy: "paid_generation_cron",
  });

  return NextResponse.json({
    source: "cron",
    jobType: "paid_analysis",
    ...result,
  });
}
