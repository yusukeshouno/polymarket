"use client";

import { useState, useMemo } from "react";
import { ProcessedMarket } from "@/lib/polymarket";
import { translations } from "@/lib/i18n";
import { useLang } from "./LangContext";
import { useWatchlist } from "@/lib/useWatchlist";
import MarketCard from "./MarketCard";
import HeatmapView from "./HeatmapView";

interface BilingualMarket extends ProcessedMarket {
  questionJa: string;
}

interface MarketGridProps {
  markets: BilingualMarket[];
  tags: { id: string; label: string; slug: string }[];
  initialTag?: string;
}

export type { BilingualMarket };

type SortKey = "volume" | "close" | "low" | "high";
type ViewMode = "grid" | "heatmap";

const SORT_OPTIONS: { key: SortKey; en: string; ja: string }[] = [
  { key: "volume", en: "Volume",     ja: "出来高" },
  { key: "close",  en: "Close call", ja: "僅差"   },
  { key: "low",    en: "0%",         ja: "0%"     },
  { key: "high",   en: "100%",       ja: "100%"   },
];

function sortMarkets(markets: BilingualMarket[], key: SortKey): BilingualMarket[] {
  const copy = [...markets];
  switch (key) {
    case "volume": return copy;
    case "close":  return copy.sort((a, b) => Math.abs(a.yesPrice - 0.5) - Math.abs(b.yesPrice - 0.5));
    case "low":    return copy.sort((a, b) => a.yesPrice - b.yesPrice);
    case "high":   return copy.sort((a, b) => b.yesPrice - a.yesPrice);
  }
}

const PAGE_SIZE = 24;

export default function MarketGrid({ markets, tags, initialTag }: MarketGridProps) {
  const { lang } = useLang();
  const t = translations[lang];
  const [activeTag, setActiveTag] = useState<string | undefined>(initialTag);
  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showWatchlist, setShowWatchlist] = useState(false);
  const { toggle: toggleWatch, has: isWatched, ids: watchedIds, count: watchCount } = useWatchlist();

  const filtered = useMemo(() => {
    let result = activeTag
      ? markets.filter((m) => m.tags.includes(activeTag))
      : markets;
    if (showWatchlist) result = result.filter((m) => watchedIds.has(m.id));
    return result;
  }, [markets, activeTag, showWatchlist, watchedIds]);

  const sorted = useMemo(() => sortMarkets(filtered as BilingualMarket[], sortKey), [filtered, sortKey]);

  const displayMarkets = useMemo(
    () => sorted.slice(0, PAGE_SIZE).map((m) => ({
      ...m,
      question: lang === "ja" ? m.questionJa : m.question,
    })),
    [sorted, lang]
  );

  const avg = displayMarkets.length
    ? Math.round(displayMarkets.reduce((s, m) => s + m.yesPrice, 0) / displayMarkets.length * 100)
    : 0;
  const high = displayMarkets.filter((m) => m.yesPrice >= 0.6).length;
  const statsItems = [
    { label: t.stats.markets, value: displayMarkets.length },
    { label: t.stats.avgYes,  value: `${avg}%` },
    { label: t.stats.highConf, value: high },
  ];

  function handleTag(slug: string | undefined) {
    setActiveTag(slug);
    setShowWatchlist(false);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("tag", slug);
    else url.searchParams.delete("tag");
    window.history.replaceState({}, "", url.toString());
  }

  function handleSort(key: SortKey) {
    setSortKey(key);
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 border-b" style={{ borderColor: "var(--border)" }}>
        {statsItems.map((s) => (
          <div key={s.label} className="py-6 px-6 border-r last:border-r-0" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--muted)" }}>{s.label}</p>
            <p className="text-3xl font-light tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Controls row: Sort | Tags | View toggle */}
      <div className="border-b flex items-stretch" style={{ borderColor: "var(--border)" }}>

        {/* Sort */}
        <div className="flex-none flex items-center border-r" style={{ borderColor: "var(--border)" }}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className="text-xs tracking-wide px-4 py-1.5 h-full transition-colors border-r last:border-r-0"
              style={{
                borderColor: "var(--border)",
                ...(sortKey === opt.key
                  ? { background: "var(--foreground)", color: "var(--background)" }
                  : { color: "var(--muted)" }),
              }}
            >
              {lang === "ja" ? opt.ja : opt.en}
            </button>
          ))}
        </div>

        {/* Tags + Watchlist */}
        <div className="flex-1 px-4 py-4 flex items-center gap-1 overflow-x-auto min-w-0">
          <button
            onClick={() => handleTag(undefined)}
            className="flex-none text-xs tracking-wide px-3 py-1.5 transition-colors"
            style={!activeTag && !showWatchlist
              ? { background: "var(--foreground)", color: "var(--background)" }
              : { color: "var(--muted)" }}
          >
            {t.filter.all}
          </button>
          {tags.slice(0, 14).map((tg) => (
            <button
              key={tg.slug}
              onClick={() => handleTag(tg.slug)}
              className="flex-none text-xs tracking-wide px-3 py-1.5 transition-colors"
              style={activeTag === tg.slug
                ? { background: "var(--foreground)", color: "var(--background)" }
                : { color: "var(--muted)" }}
            >
              {tg.label}
            </button>
          ))}
          {/* Watchlist filter */}
          <button
            onClick={() => { setShowWatchlist((v) => !v); setActiveTag(undefined); }}
            className="flex-none text-xs tracking-wide px-3 py-1.5 transition-colors ml-2"
            style={showWatchlist
              ? { background: "#f59e0b", color: "#fff" }
              : { color: watchCount > 0 ? "#f59e0b" : "var(--muted)" }}
          >
            ★ {watchCount > 0 ? watchCount : ""}
          </button>
        </div>

        {/* View toggle */}
        <div className="flex-none flex items-center border-l" style={{ borderColor: "var(--border)" }}>
          {(["grid", "heatmap"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className="px-4 py-1.5 h-full text-xs tracking-wide transition-colors border-r last:border-r-0"
              style={{
                borderColor: "var(--border)",
                ...(viewMode === v
                  ? { background: "var(--foreground)", color: "var(--background)" }
                  : { color: "var(--muted)" }),
              }}
            >
              {v === "grid" ? "⊞" : "▦"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {displayMarkets.length === 0 ? (
        <div className="flex items-center justify-center py-40" style={{ color: "var(--muted)" }}>
          <p className="text-xs tracking-widest uppercase">{t.noMarkets}</p>
        </div>
      ) : viewMode === "heatmap" ? (
        <HeatmapView
          markets={displayMarkets}
          t={t}
          watchedIds={watchedIds}
          onToggleWatch={toggleWatch}
        />
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ borderLeft: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}
        >
          {displayMarkets.map((market, i) => (
            <div
              key={market.id}
              className="relative"
              style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
            >
              {/* Watchlist star */}
              <button
                onClick={() => toggleWatch(market.id)}
                className="absolute top-3 right-3 z-10 text-base opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                style={{
                  color: isWatched(market.id) ? "#f59e0b" : "var(--border)",
                  lineHeight: 1,
                }}
                title={isWatched(market.id) ? "Remove from watchlist" : "Add to watchlist"}
              >
                {isWatched(market.id) ? "★" : "☆"}
              </button>
              <a
                href={`https://polymarket.com/event/${market.eventSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <MarketCard market={market} index={i} t={t} lang={lang} />
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
