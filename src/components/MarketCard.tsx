"use client";

import { ProcessedMarket } from "@/lib/polymarket";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import {
  ArcGauge,
  DotGrid,
  VerticalBar,
  SplitBar,
  RadialDonut,
  SliderTrack,
} from "./ProbabilityViz";

interface MarketCardProps {
  market: ProcessedMarket;
  index: number;
}

function formatVol(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (!isFinite(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const VIZ_TYPES = [ArcGauge, DotGrid, VerticalBar, SplitBar, RadialDonut, SliderTrack] as const;

const VIZ_LABELS = [
  "Arc gauge",
  "Dot grid",
  "Vertical bar",
  "Split bar",
  "Radial donut",
  "Slider",
] as const;

const CONDITION_LABEL: Record<string, string> = {
  sunny:        "Almost certain",
  mostlySunny:  "Likely",
  partlyCloudy: "Even odds",
  mostlyCloudy: "Unlikely",
  rainy:        "Very unlikely",
};

export default function MarketCard({ market, index }: MarketCardProps) {
  const pct = Math.round(market.yesPrice * 100);
  const endDate = new Date(market.endDate);
  const timeLeft = formatDistanceToNow(endDate, { locale: ja, addSuffix: true });
  const condLabel = CONDITION_LABEL[market.weatherCondition] ?? "";

  const VizComponent = VIZ_TYPES[index % VIZ_TYPES.length];
  const vizLabel = VIZ_LABELS[index % VIZ_LABELS.length];

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
        <VizComponent pct={pct} />
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
