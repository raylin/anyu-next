import { NextResponse } from "next/server";
import { authorizeAdminRequest, safeTokenEquals } from "@/lib/admin/auth";
import {
  assertAdminPaidResultLookupResponseIsSafe,
  isValidAdminResultId,
  lookupAdminPaidResultById,
} from "@/lib/admin/paid-result-lookup";

type RouteProps = {
  params: Promise<{
    resultId: string;
  }>;
};

function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET(request: Request, { params }: RouteProps) {
  const authorization = authorizeAdminRequest(request);

  if (!authorization.ok) {
    return authorization.response;
  }

  const { resultId } = await params;

  if (!isValidAdminResultId(resultId)) {
    return jsonError(400, "invalid_result_id");
  }

  const summary = await lookupAdminPaidResultById(resultId);

  if (!summary) {
    return jsonError(404, "result_not_found");
  }

  return NextResponse.json(assertAdminPaidResultLookupResponseIsSafe(summary));
}

export { authorizeAdminRequest, safeTokenEquals };
