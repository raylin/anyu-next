import crypto from "node:crypto";
import { NextResponse } from "next/server";
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

function safeTokenEquals(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

function getAdminApiToken(env: NodeJS.ProcessEnv = process.env): string | null {
  const token = env.ADMIN_API_TOKEN?.trim();

  return token && token.length > 0 ? token : null;
}

function authorizeAdminRequest(request: Request, env: NodeJS.ProcessEnv = process.env) {
  const expectedToken = getAdminApiToken(env);

  if (!expectedToken) {
    return { ok: false as const, response: jsonError(503, "admin_api_not_configured") };
  }

  const providedToken = request.headers.get("x-admin-api-token")?.trim() ?? "";

  if (!providedToken || !safeTokenEquals(providedToken, expectedToken)) {
    return { ok: false as const, response: jsonError(401, "admin_auth_failed") };
  }

  return { ok: true as const };
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
