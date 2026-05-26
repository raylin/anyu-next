import { LineFulfillBridge } from "@/components/line/LineFulfillBridge";
import { LineFulfillServerDiagnostic } from "@/components/line/LineFulfillServerDiagnostic";

type RouteParams = Promise<{ moduleSlug?: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ModuleLineFulfillPage({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams: SearchParams;
}) {
  const routeParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <>
      <LineFulfillBridge defaultModuleSlug={routeParams.moduleSlug} />
      <LineFulfillServerDiagnostic searchParams={resolvedSearchParams} />
    </>
  );
}
