import { fetchMarkets, fetchTags, ProcessedMarket } from "@/lib/polymarket";
import MarketCard from "@/components/MarketCard";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ tag?: string }>;
}

function StatsBar({ markets }: { markets: ProcessedMarket[] }) {
  const avg = markets.length
    ? Math.round(markets.reduce((s, m) => s + m.yesPrice, 0) / markets.length * 100)
    : 0;
  const high = markets.filter((m) => m.yesPrice >= 0.6).length;
  const low = markets.filter((m) => m.yesPrice < 0.4).length;

  return (
    <div className="grid grid-cols-3 border-b border-[var(--border)]">
      {[
        { label: "Markets", value: markets.length },
        { label: "Avg. YES", value: `${avg}%` },
        { label: "High conf.", value: high },
      ].map((s) => (
        <div key={s.label} className="py-6 px-6 border-r border-[var(--border)] last:border-r-0">
          <p className="text-xs text-[var(--muted)] tracking-widest uppercase mb-1">{s.label}</p>
          <p className="text-3xl font-light tabular-nums">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const { tag } = await searchParams;

  const [markets, tags] = await Promise.all([
    fetchMarkets(24, tag),
    fetchTags(),
  ]);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>

      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-end justify-between">
          <div>
            <h1 className="text-sm font-medium tracking-[0.2em] uppercase">
              Poly<span className="opacity-40">market</span>
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] tracking-wide">
            Updated every 5 min
          </p>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto">

        {/* Stats bar */}
        <StatsBar markets={markets} />

        {/* Filter row */}
        <div className="border-b border-[var(--border)] px-6 py-4 flex items-center gap-1 overflow-x-auto">
          <Link
            href="/"
            className={`flex-none text-xs tracking-wide px-3 py-1.5 transition-colors ${
              !tag
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            All
          </Link>
          {tags.slice(0, 14).map((t) => (
            <Link
              key={t.id}
              href={`?tag=${t.id}`}
              className={`flex-none text-xs tracking-wide px-3 py-1.5 transition-colors ${
                tag === t.id
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {markets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-[var(--muted)]">
            <p className="text-xs tracking-widest uppercase">No markets found</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{
              borderLeft: "1px solid var(--border)",
              borderTop: "1px solid var(--border)",
            }}
          >
            {markets.map((market, i) => (
              <a
                key={market.id}
                href={`https://polymarket.com/event/${market.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <MarketCard market={market} index={i} />
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[var(--border)] px-6 py-5">
          <p className="text-xs text-[var(--muted)] tracking-wide">
            Data — Polymarket Gamma API
          </p>
        </div>

      </main>
    </div>
  );
}
