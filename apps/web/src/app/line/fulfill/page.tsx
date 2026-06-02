import { LineFulfillBridge } from "@/components/line/LineFulfillBridge";
import { LineFulfillServerDiagnostic } from "@/components/line/LineFulfillServerDiagnostic";
import { LineRecoveryBindBridge } from "@/components/line/LineRecoveryBindBridge";
import { parseLineRecoveryBindContext } from "@/lib/line/recovery-liff-context";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function GlobalLineFulfillPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const initialSearch = toSearchString(resolvedSearchParams);
  const recoveryContext = parseLineRecoveryBindContext(initialSearch);

  if (recoveryContext.state) {
    return <LineRecoveryBindBridge initialSearch={initialSearch} />;
  }

  return (
    <>
      <LineFulfillBridge initialSearch={initialSearch} />
      <LineFulfillServerDiagnostic searchParams={resolvedSearchParams} />
    </>
  );
}

function toSearchString(input: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      searchParams.set(key, value);
    }
  }

  return searchParams.toString();
}
