import { LineFulfillBridge } from "@/components/line/LineFulfillBridge";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function GlobalLineFulfillPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return <LineFulfillBridge initialSearch={serializeSearchParams(await searchParams)} />;
}

function serializeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
    } else if (value) {
      params.set(key, value);
    }
  }

  return params.toString();
}
