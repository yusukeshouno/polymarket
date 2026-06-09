"use client";

import { useState, useMemo } from "react";
import { ProcessedMarket } from "@/lib/polymarket";
import { translations } from "@/lib/i18n";
import { useLang } from "./LangContext";
import MarketCard from "./MarketCard";

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

const SORT_OPTIONS: { key: SortKey; en: string; ja: string }[] = [
  { key: "volume", en: "Volume",     ja: "出来高" },
  { key: "close",  en: "Close call", ja: "僅差"   },
  { key: "low",    en: "0%",         ja: "0%"     },
  { key: "high",   en: "100%",       ja: "100%"   },
];

function sortMarkets(markets: BilingualMarket[], key: SortKey): BilingualMarket[] {
  const copy = [...markets];
  switch (key) {
    case "volume": return copy; // already sorted by volume from API
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

  // Client-side tag filter + sort — instant
  const filtered = useMemo(
    () => activeTag ? markets.filter((m) => m.tags.includes(activeTag)) : markets,
    [markets, activeTag]
  );

  const sorted = useMemo(() => sortMarkets(filtered as BilingualMarket[], sortKey), [filtered, sortKey]);

  const displayMarkets = useMemo(
    () => sorted.slice(0, PAGE_SIZE).map((m) => ({
      ...m,
      question: lang === "ja" ? m.questionJa : m.question,
    })),
    [sorted, lang]
  );

  // Stats
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
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("tag", slug);
    else url.searchParams.delete("tag");
    window.history.replaceState({}, "", url.toString());
  }

  function handleSort(key: SortKey) {
    setSortKey(key);
    const url = new URL(window.location.href);
    if (key !== "volume") url.searchParams.set("sort", key);
    else url.searchParams.delete("sort");
    window.history.replaceState({}, "", url.toString());
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

      {/* Tag filter + Sort — same row */}
      <div className="border-b flex items-stretch" style={{ borderColor: "var(--border)" }}>
        {/* Tags — scrollable */}
        <div className="flex-1 px-6 py-4 flex items-center gap-1 overflow-x-auto min-w-0">
          <button
            onClick={() => handleTag(undefined)}
            className="flex-none text-xs tracking-wide px-3 py-1.5 transition-colors"
            style={!activeTag
              ? { background: "var(--foreground)", color: "var(--background)" }
              : { color: "var(--muted)" }}
          >
            {t.filter.all}
          </button>
          {tags.slice(0, 16).map((tg) => (
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
        </div>

        {/* Sort — right side, fixed */}
        <div
          className="flex-none flex items-center gap-0 border-l"
          style={{ borderColor: "var(--border)" }}
        >
          {SORT_OPTIONS.map((opt, i) => (
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
      </div>

      {/* Grid */}
      {displayMarkets.length === 0 ? (
        <div className="flex items-center justify-center py-40" style={{ color: "var(--muted)" }}>
          <p className="text-xs tracking-widest uppercase">{t.noMarkets}</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ borderLeft: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}
        >
          {displayMarkets.map((market, i) => (
            <a
              key={market.id}
              href={`https://polymarket.com/event/${market.eventSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
            >
              <MarketCard market={market} index={i} t={t} lang={lang} />
            </a>
          ))}
        </div>
      )}
    </>
  );
}
