import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const tokenId = new URL(req.url).searchParams.get("token");
  if (!tokenId) return NextResponse.json([], { status: 400 });

  try {
    const res = await fetch(
      `https://clob.polymarket.com/prices-history?market=${tokenId}&interval=1w&fidelity=60`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();

    // Return simplified array of prices (latest 40 points)
    const history: { t: number; p: number }[] = data.history ?? [];
    const sampled = history.filter((_, i) => i % Math.max(1, Math.floor(history.length / 40)) === 0);
    const prices = sampled.map((h) => Math.round(h.p * 100));

    return NextResponse.json(prices, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json([]);
  }
}
