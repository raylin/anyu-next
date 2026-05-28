import { NextResponse } from "next/server";
import { getBuildMarker } from "@/lib/runtime/build-marker";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "anyu-next-web",
    ...getBuildMarker(),
  });
}
