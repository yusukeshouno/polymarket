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

export default function HeatmapView({
  markets,
  t,
  watchedIds,
  onToggleWatch,
}: HeatmapViewProps) {
  if (!markets.length) return null;

  // Normalize volumes for sizing
  const volumes = markets.map((m) => Math.max(m.volume, 1));
  const maxVol = Math.max(...volumes);
  const minVol = Math.min(...volumes);

  // Cell area proportional to sqrt(volume) — less extreme than linear
  const getWeight = (vol: number) =>
    Math.sqrt((vol - minVol) / (maxVol - minVol + 1) + 0.1);

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-2">
        {markets.map((market, i) => {
          const pct = Math.round(market.yesPrice * 100);
          const weight = getWeight(market.volume);
          const color = cardColor(i);
          const { r, g, b } = hexToRgb(color);
          // Background opacity scales with probability distance from 50%
          const intensity = 0.12 + (Math.abs(pct - 50) / 50) * 0.55;
          const bg = `rgba(${r},${g},${b},${intensity.toFixed(2)})`;
          const isWatched = watchedIds.has(market.id);

          // Cell size: min 120px, max 320px based on weight
          const size = Math.round(120 + weight * 200);

          return (
            <a
              key={market.id}
              href={`https://polymarket.com/event/${market.eventSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex-none group"
              style={{
                width: size,
                height: size * 0.65,
                background: bg,
                borderRadius: 4,
                border: `1px solid rgba(${r},${g},${b},0.25)`,
                overflow: "hidden",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px rgba(${r},${g},${b},0.25)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Big percentage */}
              <div
                className="absolute bottom-2 right-3 tabular-nums"
                style={{ fontSize: Math.round(size * 0.18), fontWeight: 200, color, lineHeight: 1, opacity: 0.9 }}
              >
                {pct}%
              </div>

              {/* Question text */}
              <div
                className="absolute top-0 left-0 right-0 p-2"
                style={{ fontSize: 10, lineHeight: 1.3, color: "var(--foreground)", opacity: 0.8 }}
              >
                <div className="line-clamp-3">{market.question}</div>
              </div>

              {/* Delta badge */}
              {Math.abs(market.oneDayChange) > 0.005 && (
                <div
                  className="absolute top-2 right-2 text-[9px] font-medium px-1 rounded"
                  style={{
                    color: market.oneDayChange > 0 ? "#2e7d4f" : "#b52b27",
                    background: "rgba(255,255,255,0.7)",
                  }}
                >
                  {market.oneDayChange > 0 ? "▲" : "▼"}{Math.abs(Math.round(market.oneDayChange * 100 * 10) / 10)}
                </div>
              )}

              {/* Watch star */}
              <button
                className="absolute bottom-2 left-2 text-[14px] opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  onToggleWatch(market.id);
                }}
                style={{ color: isWatched ? "#f59e0b" : "var(--muted)", background: "rgba(255,255,255,0.7)", borderRadius: 4, padding: "1px 4px", lineHeight: 1 }}
              >
                {isWatched ? "★" : "☆"}
              </button>
            </a>
          );
        })}
      </div>
    </div>
  );
}
