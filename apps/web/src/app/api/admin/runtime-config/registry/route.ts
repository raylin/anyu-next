import { NextResponse } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import { serializeRuntimeConfigDefinition } from "@/lib/runtime-config/admin-api";

export async function GET(request: Request) {
  const authorization = authorizeAdminRequest(request);

  if (!authorization.ok) {
    return authorization.response;
  }

  return NextResponse.json({
    ok: true,
    registry: serializeRuntimeConfigDefinition(),
  });
}
