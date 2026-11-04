import { NextRequest, NextResponse } from "next/server";
import { lookupDrinks } from "@/lib/drink-suggestions";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (query.length < 3 || query.length > 100) {
    return NextResponse.json(
      { suggestions: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  try {
    const suggestions = await lookupDrinks(query);
    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Online suggestions are unavailable. You can enter the details yourself.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
