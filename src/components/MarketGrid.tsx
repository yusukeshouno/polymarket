"use client";

import { ProcessedMarket } from "@/lib/polymarket";
import { translations } from "@/lib/i18n";
import { useLang } from "./LangContext";
import MarketCard from "./MarketCard";
import Link from "next/link";

interface BilingualMarket extends ProcessedMarket {
  questionJa: string;
}

interface MarketGridProps {
  markets: BilingualMarket[];
  tags: { id: string; label: string; slug: string }[];
  activeTag?: string;
}

export type { BilingualMarket };

export default function MarketGrid({ markets, tags, activeTag }: MarketGridProps) {
  const { lang } = useLang();
  const t = translations[lang];

  // Swap question text based on current lang (instant — no fetch)
  const displayMarkets = markets.map((m) => ({
    ...m,
    question: lang === "ja" ? m.questionJa : m.question,
  }));

  function tagUrl(slug?: string) {
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set("tag", slug);
    } else {
      url.searchParams.delete("tag");
    }
    return url.pathname + url.search;
  }

  return (
    <>
      {/* Tag filter */}
      <div
        className="border-b px-6 py-4 flex items-center gap-1 overflow-x-auto"
        style={{ borderColor: "var(--border)" }}
      >
        <Link
          href={tagUrl()}
          className={`flex-none text-xs tracking-wide px-3 py-1.5 transition-colors ${
            !activeTag
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "hover:text-[var(--foreground)]"
          }`}
          style={!activeTag ? {} : { color: "var(--muted)" }}
        >
          {t.filter.all}
        </Link>
        {tags.slice(0, 14).map((tg) => (
          <Link
            key={tg.slug}
            href={tagUrl(tg.slug)}
            className={`flex-none text-xs tracking-wide px-3 py-1.5 transition-colors ${
              activeTag === tg.slug
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "hover:text-[var(--foreground)]"
            }`}
            style={activeTag === tg.slug ? {} : { color: "var(--muted)" }}
          >
            {tg.label}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {displayMarkets.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-40"
          style={{ color: "var(--muted)" }}
        >
          <p className="text-xs tracking-widest uppercase">{t.noMarkets}</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          style={{
            borderLeft: "1px solid var(--border)",
            borderTop: "1px solid var(--border)",
          }}
        >
          {displayMarkets.map((market, i) => (
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
              <MarketCard market={market} index={i} t={t} lang={lang} />
            </a>
          ))}
        </div>
      )}
    </>
  );
}
