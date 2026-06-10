"use client";

import { ProcessedMarket } from "@/lib/polymarket";
import { T } from "@/lib/i18n";
import { cardColor } from "@/lib/palettes";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import Sparkline from "./Sparkline";
import {
  ArcGauge,
  DotGrid,
  VerticalBar,
  SplitBar,
  RadialDonut,
  SliderTrack,
  SegmentBlocks,
  Waveform,
  StackedSegments,
  TypoLarge,
} from "./ProbabilityViz";
import {
  QuantileDotPlot,
  RandomIconArray,
  PersonPictogram,
  FanChart,
  LiquidGauge,
  SnakeBar,
  ProbWheel,
  DensityBar,
  VSUPBar,
  ProportionalCircle,
} from "./ProbabilityVizNew";

interface MarketCardProps {
  market: ProcessedMarket;
  index: number;
  t: T;
  lang: "en" | "ja";
}

function formatVol(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (!isFinite(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const VIZ_TYPES = [
  // Original 10
  ArcGauge, DotGrid, VerticalBar, SplitBar,
  RadialDonut, SliderTrack, SegmentBlocks,
  Waveform, StackedSegments, TypoLarge,
  // New 10 (K–T)
  QuantileDotPlot, RandomIconArray, PersonPictogram, FanChart,
  LiquidGauge, SnakeBar, ProbWheel, DensityBar,
  VSUPBar, ProportionalCircle,
] as const;

export default function MarketCard({ market, index, t, lang }: MarketCardProps) {
  const pct = Math.round(market.yesPrice * 100);
  const endDate = new Date(market.endDate);
  const locale = lang === "ja" ? ja : enUS;
  const timeLeft = formatDistanceToNow(endDate, { locale, addSuffix: true });
  const condLabel = t.conditions[market.weatherCondition];
  const palette = cardColor(index);
  const VizComponent = VIZ_TYPES[index % VIZ_TYPES.length];

  // 24h change
  const delta = market.oneDayChange ?? 0;
  const deltaPct = Math.round(delta * 100 * 10) / 10; // e.g. +5.2
  const deltaSign = deltaPct > 0 ? "+" : "";
  const deltaColor = deltaPct > 0 ? "#2e7d4f" : deltaPct < 0 ? "#b52b27" : "var(--muted)";

  return (
    <div
      className="group p-7 h-full flex flex-col gap-5 transition-colors duration-200 hover:bg-white"
      style={{ minHeight: "300px", "--card-color": palette } as React.CSSProperties}
    >
      {/* Top meta */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] tabular-nums" style={{ color: "var(--muted)" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2">
          {/* 24h Δ */}
          {Math.abs(deltaPct) >= 0.1 && (
            <span className="text-[11px] tabular-nums font-medium flex items-center gap-0.5" style={{ color: deltaColor }}>
              {deltaPct > 0 ? "▲" : "▼"}
              {Math.abs(deltaPct)}
            </span>
          )}
          <span className="text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--muted)" }}>
            {condLabel}
          </span>
        </div>
      </div>

      {/* Visualization — fixed height, equal across all cards */}
      <div style={{ height: 180, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <VizComponent pct={pct} t={t} />
      </div>

      {/* Sparkline */}
      {market.clobTokenId && (
        <div className="flex items-center gap-2">
          <span className="text-[9px] tracking-widest uppercase" style={{ color: "var(--muted)" }}>7D</span>
          <Sparkline tokenId={market.clobTokenId} color={palette} height={28} />
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", width: "100%" }} />

      {/* Question */}
      <p className="text-[13px] leading-relaxed line-clamp-3" style={{ color: "var(--foreground)" }}>
        {market.question}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted)" }}>
        <span>{formatVol(market.volume)}</span>
        <span>{timeLeft}</span>
      </div>
    </div>
  );
}
