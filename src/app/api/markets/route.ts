import { fetchMarkets } from "@/lib/polymarket";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const tag = searchParams.get("tag") ?? undefined;

  try {
    const markets = await fetchMarkets(limit, tag);
    return NextResponse.json(markets, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}
