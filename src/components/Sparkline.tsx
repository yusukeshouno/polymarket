"use client";

import { useEffect, useState } from "react";

interface SparklineProps {
  tokenId: string;
  color: string;
  height?: number;
}

const VW = 200; // internal viewBox width

export default function Sparkline({ tokenId, color, height = 32 }: SparklineProps) {
  const [prices, setPrices] = useState<number[]>([]);

  useEffect(() => {
    if (!tokenId) return;
    fetch(`/api/sparkline?token=${encodeURIComponent(tokenId)}`)
      .then((r) => r.json())
      .then(setPrices)
      .catch(() => {});
  }, [tokenId]);

  if (prices.length < 2) {
    return <div style={{ height, width: "100%" }} />;
  }

  const H = height;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * VW;
    const y = H - ((p - min) / range) * (H - 6) - 3;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const lastPt = pts[pts.length - 1];
  const [lx, ly] = lastPt.split(",").map(Number);
  const first = prices[0];
  const last = prices[prices.length - 1];

  return (
    <div style={{ width: "100%", height }}>
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${VW} ${H}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        {/* Area fill */}
        <defs>
          <linearGradient id={`sg-${tokenId.slice(-6)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${H} ${pts.join(" ")} ${VW},${H}`}
          fill={`url(#sg-${tokenId.slice(-6)})`}
        />
        {/* Line */}
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
