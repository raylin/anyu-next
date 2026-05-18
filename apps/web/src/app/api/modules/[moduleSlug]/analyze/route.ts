import { NextRequest, NextResponse } from "next/server";
import { getModuleBySlug } from "@/lib/modules/registry";

type ModuleAnalyzeRouteProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
};

export async function POST(
  _request: NextRequest,
  { params }: ModuleAnalyzeRouteProps,
) {
  const { moduleSlug } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    return NextResponse.json(
      { ok: false, error: "module_not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: "not_implemented",
      moduleId: moduleConfig.moduleId,
    },
    { status: 501 },
  );
}
