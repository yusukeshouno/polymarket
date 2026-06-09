import { fetchMarkets, fetchTags, ProcessedMarket } from "@/lib/polymarket";
import { getLang, translations, T } from "@/lib/i18n";
import MarketCard from "@/components/MarketCard";
import LangToggle from "@/components/LangToggle";
import { Suspense } from "react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ tag?: string; lang?: string }>;
}

function StatsBar({ markets, t }: { markets: ProcessedMarket[]; t: T }) {
  const avg = markets.length
    ? Math.round(markets.reduce((s, m) => s + m.yesPrice, 0) / markets.length * 100)
    : 0;
  const high = markets.filter((m) => m.yesPrice >= 0.6).length;

  return (
    <div className="grid grid-cols-3 border-b border-[var(--border)]">
      {[
        { label: t.stats.markets, value: markets.length },
        { label: t.stats.avgYes, value: `${avg}%` },
        { label: t.stats.highConf, value: high },
      ].map((s) => (
        <div key={s.label} className="py-6 px-6 border-r border-[var(--border)] last:border-r-0">
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--muted)" }}>{s.label}</p>
          <p className="text-3xl font-light tabular-nums">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const { tag, lang: langParam } = await searchParams;
  const lang = getLang(langParam);
  const t = translations[lang];

  const [markets, tags] = await Promise.all([
    fetchMarkets(24, tag || undefined),
    fetchTags(),
  ]);

  // Build URL helper that preserves existing params
  function tagUrl(slug?: string) {
    const p = new URLSearchParams();
    if (slug) p.set("tag", slug);
    if (langParam) p.set("lang", langParam);
    return `/?${p.toString()}`;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>

      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-sm font-medium tracking-[0.2em] uppercase">
            Poly<span className="opacity-40">market</span>
          </h1>
          <div className="flex items-center gap-5">
            <p className="text-xs tracking-wide" style={{ color: "var(--muted)" }}>
              {t.updatedEvery}
            </p>
            <Suspense>
              <LangToggle lang={lang} />
            </Suspense>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto">

        {/* Stats */}
        <StatsBar markets={markets} t={t} />

        {/* Tag filter */}
        <div className="border-b border-[var(--border)] px-6 py-4 flex items-center gap-1 overflow-x-auto">
          <Link
            href={tagUrl()}
            className={`flex-none text-xs tracking-wide px-3 py-1.5 transition-colors ${
              !tag
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.filter.all}
          </Link>
          {tags.slice(0, 14).map((tg) => (
            <Link
              key={tg.slug}
              href={tagUrl(tg.slug)}
              className={`flex-none text-xs tracking-wide px-3 py-1.5 transition-colors ${
                tag === tg.slug
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tg.label}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {markets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40" style={{ color: "var(--muted)" }}>
            <p className="text-xs tracking-widest uppercase">{t.noMarkets}</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{ borderLeft: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}
          >
            {markets.map((market, i) => (
              <a
                key={market.id}
                href={`https://polymarket.com/event/${market.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
              >
                <MarketCard market={market} index={i} t={t} lang={lang} />
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[var(--border)] px-6 py-5">
          <p className="text-xs tracking-wide" style={{ color: "var(--muted)" }}>
            {t.dataSource}
          </p>
        </div>

      </main>
    </div>
  );
}
