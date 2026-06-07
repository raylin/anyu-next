import { NextResponse } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import { isValidAdminResultId } from "@/lib/admin/paid-result-lookup";
import { lookupLineBindDiagnosticsByResultId } from "@/lib/line/recovery-bind-diagnostic-events";

function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET(request: Request) {
  const authorization = authorizeAdminRequest(request);

  if (!authorization.ok) {
    return authorization.response;
  }

  const url = new URL(request.url);
  const resultId = url.searchParams.get("resultId")?.trim() ?? "";

  if (!isValidAdminResultId(resultId)) {
    return jsonError(400, "invalid_result_id");
  }

  const summary = await lookupLineBindDiagnosticsByResultId(resultId);

  if (!summary) {
    return jsonError(404, "no_events_found");
  }

  return NextResponse.json(summary);
}
