import { LineFulfillBridge } from "@/components/line/LineFulfillBridge";
import { LineFulfillServerDiagnostic } from "@/components/line/LineFulfillServerDiagnostic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function GlobalLineFulfillPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <>
      <LineFulfillBridge />
      <LineFulfillServerDiagnostic searchParams={resolvedSearchParams} />
    </>
  );
}
