"use client";

import { BilingualMarket } from "./MarketGrid";
import { cardColor } from "@/lib/palettes";
import { T } from "@/lib/i18n";

interface HeatmapViewProps {
  markets: (BilingualMarket & { question: string })[];
  t: T;
  watchedIds: Set<string>;
  onToggleWatch: (id: string) => void;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export default function HeatmapView({ markets, t, watchedIds, onToggleWatch }: HeatmapViewProps) {
  if (!markets.length) return null;

  const volumes = markets.map((m) => Math.max(m.volume, 1));
  const maxVol = Math.max(...volumes);

  // Normalize volume to a tier: 3 = large, 2 = medium, 1 = small
  const getTier = (vol: number) => {
    const ratio = vol / maxVol;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.15) return 2;
    return 1;
  };

  // Column span in a 12-col grid
  const getSpan = (tier: number) => {
    if (tier === 3) return 6;  // half-width
    if (tier === 2) return 4;  // third-width
    return 3;                  // quarter-width
  };

  // Height by tier
  const getHeight = (tier: number) => {
    if (tier === 3) return 160;
    if (tier === 2) return 120;
    return 90;
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 4,
        padding: 16,
      }}
    >
      {markets.map((market, i) => {
        const pct = Math.round(market.yesPrice * 100);
        const tier = getTier(market.volume);
        const span = getSpan(tier);
        const height = getHeight(tier);
        const color = cardColor(i);
        const { r, g, b } = hexToRgb(color);
        const intensity = 0.1 + (Math.abs(pct - 50) / 50) * 0.5;
        const delta = market.oneDayChange ?? 0;
        const deltaPct = Math.round(delta * 100 * 10) / 10;
        const isWatched = watchedIds.has(market.id);

        return (
          <div
            key={market.id}
            style={{
              gridColumn: `span ${span}`,
              height,
              background: `rgba(${r},${g},${b},${intensity.toFixed(2)})`,
              border: `1px solid rgba(${r},${g},${b},0.2)`,
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.12s, opacity 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            <a
              href={`https://polymarket.com/event/${market.eventSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
            />

            {/* Question */}
            <p
              style={{
                position: "absolute", top: 6, left: 7, right: 24,
                fontSize: tier === 3 ? 11 : 9,
                lineHeight: 1.35,
                color: "var(--foreground)",
                opacity: 0.75,
                display: "-webkit-box",
                WebkitLineClamp: tier === 1 ? 2 : 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {market.question}
            </p>

            {/* Big % */}
            <div
              style={{
                position: "absolute",
                bottom: 6,
                right: 8,
                fontSize: tier === 3 ? 28 : tier === 2 ? 22 : 16,
                fontWeight: 200,
                color,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {pct}%
            </div>

            {/* Delta */}
            {Math.abs(deltaPct) >= 0.1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 7,
                  left: 7,
                  fontSize: 9,
                  fontWeight: 500,
                  color: deltaPct > 0 ? "#2e7d4f" : "#b52b27",
                  background: "rgba(255,255,255,0.75)",
                  borderRadius: 2,
                  padding: "1px 3px",
                  lineHeight: 1.4,
                }}
              >
                {deltaPct > 0 ? "▲" : "▼"}{Math.abs(deltaPct)}
              </div>
            )}

            {/* Watch star */}
            <button
              style={{
                position: "absolute", top: 4, right: 4,
                fontSize: 11, lineHeight: 1,
                color: isWatched ? "#f59e0b" : "rgba(0,0,0,0.15)",
                background: "none", border: "none",
                cursor: "pointer", zIndex: 10,
                transition: "color 0.15s",
              }}
              onClick={(e) => { e.preventDefault(); onToggleWatch(market.id); }}
            >
              {isWatched ? "★" : "☆"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
