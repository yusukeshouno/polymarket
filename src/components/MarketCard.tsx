"use client";

import { ProcessedMarket } from "@/lib/polymarket";
import { T } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";
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
  ArcGauge, DotGrid, VerticalBar, SplitBar,
  RadialDonut, SliderTrack, SegmentBlocks,
  Waveform, StackedSegments, TypoLarge,
] as const;

export default function MarketCard({ market, index, t, lang }: MarketCardProps) {
  const pct = Math.round(market.yesPrice * 100);
  const endDate = new Date(market.endDate);
  const locale = lang === "ja" ? ja : enUS;
  const timeLeft = formatDistanceToNow(endDate, { locale, addSuffix: true });
  const condLabel = t.conditions[market.weatherCondition];

  const VizComponent = VIZ_TYPES[index % VIZ_TYPES.length];

  return (
    <div
      className="group p-7 h-full flex flex-col gap-6 transition-colors duration-200 hover:bg-white"
      style={{ minHeight: "300px" }}
    >
      {/* Top meta */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] tabular-nums" style={{ color: "var(--muted)" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--muted)" }}>
          {condLabel}
        </span>
      </div>

      {/* Visualization */}
      <div className="flex-1 flex flex-col justify-center">
        <VizComponent pct={pct} t={t} />
      </div>

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
