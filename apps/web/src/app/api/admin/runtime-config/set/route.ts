import { NextResponse } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import {
  mapRuntimeConfigError,
  runtimeConfigJsonError,
  setRuntimeConfigAdminValue,
} from "@/lib/runtime-config/admin-api";

export async function POST(request: Request) {
  const authorization = authorizeAdminRequest(request);

  if (!authorization.ok) {
    return authorization.response;
  }

  try {
    return NextResponse.json({
      ok: true,
      config: await setRuntimeConfigAdminValue(await request.json()),
    });
  } catch (error) {
    const mapped = mapRuntimeConfigError(error);
    return runtimeConfigJsonError(mapped.status, mapped.code);
  }
}
