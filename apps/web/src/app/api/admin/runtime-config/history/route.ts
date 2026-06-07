import { NextResponse } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import {
  getRuntimeConfigAdminHistory,
  mapRuntimeConfigError,
  runtimeConfigJsonError,
} from "@/lib/runtime-config/admin-api";

export async function GET(request: Request) {
  const authorization = authorizeAdminRequest(request);

  if (!authorization.ok) {
    return authorization.response;
  }

  try {
    return NextResponse.json({
      ok: true,
      history: await getRuntimeConfigAdminHistory(new URL(request.url)),
    });
  } catch (error) {
    const mapped = mapRuntimeConfigError(error);
    return runtimeConfigJsonError(mapped.status, mapped.code);
  }
}
