export interface EventMarket {
  id: string;
  question: string;
  slug: string;
  endDate: string;
  endDateIso: string;
  image: string;
  active: boolean;
  closed: boolean;
  volume: number | string;
  liquidity: number | string;
  outcomes: string | string[];
  outcomePrices: string | string[];
  oneDayPriceChange?: number;
  clobTokenIds?: string[];
}

export interface PolyEvent {
  id: string;
  title: string;
  slug: string;
  endDate: string;
  image: string;
  volume: number | string;
  liquidity: number | string;
  active: boolean;
  closed: boolean;
  markets: EventMarket[];
  tags: { id: string; label: string; slug: string }[];
}

export interface ProcessedMarket {
  id: string;
  question: string;
  slug: string;
  eventSlug: string;
  endDate: string;
  image: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  tags: string[];
  weatherCondition: WeatherCondition;
  trend: "up" | "down" | "stable";
  oneDayChange: number;   // e.g. +0.05 = +5pp
  clobTokenId: string;    // for sparkline API
}

export type WeatherCondition =
  | "sunny"       // 80-100%
  | "mostlySunny" // 60-80%
  | "partlyCloudy"// 40-60%
  | "mostlyCloudy"// 20-40%
  | "rainy";      // 0-20%

export function getWeatherCondition(yesPrice: number): WeatherCondition {
  if (yesPrice >= 0.8) return "sunny";
  if (yesPrice >= 0.6) return "mostlySunny";
  if (yesPrice >= 0.4) return "partlyCloudy";
  if (yesPrice >= 0.2) return "mostlyCloudy";
  return "rainy";
}

function toNum(v: number | string | undefined): number {
  if (v === undefined || v === null) return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isFinite(n) ? n : 0;
}

function processEventMarket(
  m: EventMarket,
  tags: string[],
  eventSlug: string
): ProcessedMarket | null {
  if (!m.outcomePrices || !m.outcomes) return null;
  if (!m.active || m.closed) return null;

  const rawPrices =
    typeof m.outcomePrices === "string"
      ? (JSON.parse(m.outcomePrices) as string[])
      : m.outcomePrices;
  const rawOutcomes =
    typeof m.outcomes === "string"
      ? (JSON.parse(m.outcomes) as string[])
      : m.outcomes;

  const prices = rawPrices.map((p) => parseFloat(p));
  if (prices.some((p) => !isFinite(p))) return null;

  const yesIdx = rawOutcomes.findIndex((o) => o.toLowerCase() === "yes");
  const yesPrice = yesIdx >= 0 ? prices[yesIdx] : prices[0];

  return {
    id: m.id,
    question: m.question,
    slug: m.slug,
    eventSlug,
    endDate: m.endDateIso || m.endDate,
    image: m.image,
    yesPrice,
    noPrice: 1 - yesPrice,
    volume: toNum(m.volume),
    liquidity: toNum(m.liquidity),
    tags,
    weatherCondition: getWeatherCondition(yesPrice),
    trend: yesPrice > 0.5 ? "up" : yesPrice < 0.5 ? "down" : "stable",
    oneDayChange: typeof m.oneDayPriceChange === "number" ? m.oneDayPriceChange : 0,
    clobTokenId: m.clobTokenIds?.[0] ?? "",
  };
}

export async function fetchMarkets(
  limit = 24,
  tagSlug?: string
): Promise<ProcessedMarket[]> {
  // Fetch more events so we can filter & still fill the grid
  const fetchLimit = tagSlug ? 100 : limit * 2;
  const params = new URLSearchParams({
    limit: String(fetchLimit),
    active: "true",
    closed: "false",
    order: "volume",
    ascending: "false",
  });

  const res = await fetch(
    `https://gamma-api.polymarket.com/events?${params}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) throw new Error(`Polymarket API error: ${res.status}`);
  const events: PolyEvent[] = await res.json();

  // Filter by tag slug client-side
  const filtered = tagSlug
    ? events.filter((e) =>
        e.tags?.some((t) => t.slug === tagSlug || t.id === tagSlug)
      )
    : events;

  const results: ProcessedMarket[] = [];
  for (const event of filtered) {
    const tagSlugs = (event.tags || []).map((t) => t.slug);
    // Max 2 markets per event → forces diversity across events
    let perEvent = 0;
    for (const market of event.markets || []) {
      if (perEvent >= 2) break;
      const processed = processEventMarket(market, tagSlugs, event.slug);
      if (processed) {
        results.push(processed);
        perEvent++;
        if (results.length >= limit) break;
      }
    }
    if (results.length >= limit) break;
  }

  return results;
}

export async function fetchTags(): Promise<
  { id: string; label: string; slug: string }[]
> {
  // Get tags that actually have active events
  const res = await fetch(
    "https://gamma-api.polymarket.com/events?limit=100&active=true&closed=false&order=volume&ascending=false",
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const events: PolyEvent[] = await res.json();

  // Collect unique tags from events, sorted by frequency
  const tagCount = new Map<string, { id: string; label: string; slug: string; count: number }>();
  for (const event of events) {
    for (const tag of event.tags || []) {
      if (!tag.slug || tag.slug === "hide-from-new") continue;
      const existing = tagCount.get(tag.slug);
      if (existing) {
        existing.count++;
      } else {
        tagCount.set(tag.slug, { id: tag.id, label: tag.label, slug: tag.slug, count: 1 });
      }
    }
  }

  return Array.from(tagCount.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 16)
    .map(({ id, label, slug }) => ({ id, label, slug }));
}
