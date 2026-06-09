export interface Market {
  id: string;
  question: string;
  slug: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  volume: number;
  liquidity: number;
  outcomes: string[];
  outcomePrices: string[];
  tags: string[];
  category: string;
}

export interface ProcessedMarket {
  id: string;
  question: string;
  slug: string;
  endDate: string;
  image: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  tags: string[];
  category: string;
  weatherCondition: WeatherCondition;
  trend: "up" | "down" | "stable";
}

export type WeatherCondition =
  | "sunny"      // 80-100% YES
  | "mostlySunny" // 60-80%
  | "partlyCloudy" // 40-60%
  | "mostlyCloudy" // 20-40%
  | "rainy";     // 0-20%

export function getWeatherCondition(yesPrice: number): WeatherCondition {
  if (yesPrice >= 0.8) return "sunny";
  if (yesPrice >= 0.6) return "mostlySunny";
  if (yesPrice >= 0.4) return "partlyCloudy";
  if (yesPrice >= 0.2) return "mostlyCloudy";
  return "rainy";
}

export function processMarket(market: Market): ProcessedMarket | null {
  if (!market.outcomePrices || !market.outcomes) return null;

  const rawPrices =
    typeof market.outcomePrices === "string"
      ? (JSON.parse(market.outcomePrices) as string[])
      : market.outcomePrices;
  const rawOutcomes =
    typeof market.outcomes === "string"
      ? (JSON.parse(market.outcomes) as string[])
      : market.outcomes;

  const prices = rawPrices.map((p) => parseFloat(p));
  const yesIdx = rawOutcomes.findIndex(
    (o) => o.toLowerCase() === "yes"
  );
  const yesPrice = yesIdx >= 0 ? prices[yesIdx] : prices[0];
  const noPrice = 1 - yesPrice;

  return {
    id: market.id,
    question: market.question,
    slug: market.slug,
    endDate: market.endDate,
    image: market.image,
    yesPrice,
    noPrice,
    volume: market.volume || 0,
    liquidity: market.liquidity || 0,
    tags: market.tags || [],
    category: market.category || "other",
    weatherCondition: getWeatherCondition(yesPrice),
    trend: yesPrice > 0.5 ? "up" : yesPrice < 0.5 ? "down" : "stable",
  };
}

export async function fetchMarkets(
  limit = 20,
  category?: string
): Promise<ProcessedMarket[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    active: "true",
    closed: "false",
    order: "volume",
    ascending: "false",
  });
  if (category) params.set("tag_id", category);

  const res = await fetch(
    `https://gamma-api.polymarket.com/markets?${params}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) throw new Error(`Polymarket API error: ${res.status}`);

  const data: Market[] = await res.json();
  return data.flatMap((m) => {
    const processed = processMarket(m);
    return processed ? [processed] : [];
  });
}

export async function fetchTags(): Promise<{ id: string; label: string }[]> {
  const res = await fetch("https://gamma-api.polymarket.com/tags?limit=20", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  return res.json();
}
