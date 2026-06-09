"use client";

/** Probability → color mapping (muted but distinct) */
export function probColor(pct: number): string {
  if (pct >= 80) return "#2d7a4f"; // deep green
  if (pct >= 60) return "#5a9e6f"; // sage green
  if (pct >= 40) return "#b08040"; // amber
  if (pct >= 20) return "#c0613a"; // terracotta
  return "#9e3a3a";                // deep red
}

// ── A: Arc gauge ─────────────────────────────────────────────────────────────
export function ArcGauge({ pct }: { pct: number }) {
  const r = 68;
  const cx = 90;
  const cy = 86;
  const color = probColor(pct);

  // angle: 0%→ left end (−180°), 100%→ right end (0°)
  const angleDeg = (pct / 100) * 180 - 180;
  const rad = angleDeg * (Math.PI / 180);
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  // For a half-circle arc (max 180°), large-arc is ALWAYS 0
  const fillD =
    pct <= 0
      ? ""
      : pct >= 100
      ? `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
      : `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${nx} ${ny}`;

  return (
    <div className="flex flex-col items-start">
      <svg width="180" height="100" viewBox="0 0 180 100">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="var(--border)" strokeWidth="5" strokeLinecap="round"
        />
        {/* Fill */}
        {fillD && (
          <path d={fillD} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
        )}
        {/* Needle dot */}
        <circle
          cx={pct <= 0 ? cx - r : nx}
          cy={pct <= 0 ? cy : ny}
          r="7"
          fill={pct <= 0 ? "var(--border)" : color}
        />
      </svg>
      <div className="flex items-baseline gap-1 -mt-2">
        <span style={{ fontSize: 52, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>
          {pct}
        </span>
        <span style={{ fontSize: 22, fontWeight: 200, color: "var(--muted)" }}>%</span>
      </div>
      <div className="flex justify-between w-[180px] mt-1">
        <span style={{ fontSize: 10, color: "var(--muted)" }}>0</span>
        <span style={{ fontSize: 10, color: "var(--muted)" }}>100</span>
      </div>
    </div>
  );
}

// ── B: Dot grid (10×10) ──────────────────────────────────────────────────────
export function DotGrid({ pct }: { pct: number }) {
  const filled = Math.round(pct);
  const color = probColor(pct);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="grid gap-[4px]"
        style={{ gridTemplateColumns: "repeat(10, 1fr)", width: "130px" }}
      >
        {Array.from({ length: 100 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: i < filled ? color : "var(--border)",
            }}
          />
        ))}
      </div>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 44, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>
          {pct}
        </span>
        <span style={{ fontSize: 18, fontWeight: 200, color: "var(--muted)" }}>%</span>
        <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>out of 100</span>
      </div>
    </div>
  );
}

// ── C: Vertical bar ──────────────────────────────────────────────────────────
export function VerticalBar({ pct }: { pct: number }) {
  const fillH = Math.max(pct, 2);
  const color = probColor(pct);

  return (
    <div className="flex items-end gap-5">
      <div className="flex flex-col items-center gap-1">
        <span style={{ fontSize: 10, color: "var(--muted)" }}>100</span>
        <div className="relative" style={{ width: 32, height: 110, background: "var(--border)" }}>
          <div style={{
            position: "absolute", top: "50%", left: 0, right: 0,
            height: 1, background: "var(--background)", opacity: 0.8,
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: `${fillH}%`,
            background: color,
            transition: "height 0.4s ease",
          }} />
        </div>
        <span style={{ fontSize: 10, color: "var(--muted)" }}>0</span>
      </div>
      <div>
        <div style={{ fontSize: 52, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>
          {pct}
          <span style={{ fontSize: 22, fontWeight: 200, color: "var(--muted)" }}>%</span>
        </div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.15em", marginTop: 6 }}>
          YES PROBABILITY
        </div>
      </div>
    </div>
  );
}

// ── D: Split bar (YES | NO) ──────────────────────────────────────────────────
export function SplitBar({ pct }: { pct: number }) {
  const no = 100 - pct;
  const color = probColor(pct);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <span style={{ fontSize: 52, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>
            {pct}
          </span>
          <span style={{ fontSize: 22, fontWeight: 200, color: "var(--muted)" }}>%</span>
        </div>
        <div className="text-right pb-1">
          <span style={{ fontSize: 28, fontWeight: 200, color: "var(--muted)", lineHeight: 1 }}>{no}</span>
          <span style={{ fontSize: 13, fontWeight: 200, color: "var(--muted)" }}>%</span>
        </div>
      </div>
      {/* Proportional bar */}
      <div className="flex" style={{ height: 4, gap: 2 }}>
        <div style={{ flex: Math.max(pct, 1), background: color, borderRadius: 2 }} />
        <div style={{ flex: Math.max(no, 1), background: "var(--border)", borderRadius: 2 }} />
      </div>
      <div className="flex justify-between"
        style={{ fontSize: 10, letterSpacing: "0.15em", color: "var(--muted)" }}>
        <span>YES</span>
        <span>NO</span>
      </div>
    </div>
  );
}

// ── E: Radial donut ──────────────────────────────────────────────────────────
export function RadialDonut({ pct }: { pct: number }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  const color = probColor(pct);

  return (
    <div className="flex items-center gap-6">
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="54" cy="54" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${fill} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
        />
        <text x="54" y="48" textAnchor="middle" fontSize="26" fontWeight="200"
          fill={color} fontFamily="inherit">
          {pct}
        </text>
        <text x="54" y="65" textAnchor="middle" fontSize="12"
          fill="var(--muted)" fontFamily="inherit">
          %
        </text>
      </svg>
      <div style={{ fontSize: 11, lineHeight: 2.2 }}>
        <div style={{ color: "var(--muted)", letterSpacing: "0.12em", fontSize: 10 }}>YES</div>
        <div style={{ fontSize: 20, fontWeight: 200, lineHeight: 1, color }}>
          {pct}<span style={{ fontSize: 11, color: "var(--muted)" }}>%</span>
        </div>
        <div style={{ height: 10 }} />
        <div style={{ color: "var(--muted)", letterSpacing: "0.12em", fontSize: 10 }}>NO</div>
        <div style={{ fontSize: 20, fontWeight: 200, lineHeight: 1, color: "var(--foreground)" }}>
          {100 - pct}<span style={{ fontSize: 11, color: "var(--muted)" }}>%</span>
        </div>
      </div>
    </div>
  );
}

// ── F: Slider track ──────────────────────────────────────────────────────────
export function SliderTrack({ pct }: { pct: number }) {
  const clampedPct = Math.max(2, Math.min(98, pct));
  const thumbX = 12 + (176 * clampedPct) / 100;
  const color = probColor(pct);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 52, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>
          {pct}
        </span>
        <span style={{ fontSize: 22, fontWeight: 200, color: "var(--muted)" }}>%</span>
      </div>
      <div className="w-full">
        <svg width="100%" height="28" viewBox="0 0 200 28" preserveAspectRatio="xMidYMid meet">
          <line x1="12" y1="14" x2="188" y2="14"
            stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="14" x2={thumbX} y2="14"
            stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx={thumbX} cy="14" r="7"
            fill="var(--background)" stroke={color} strokeWidth="2" />
        </svg>
        <div className="flex justify-between" style={{ fontSize: 10, color: "var(--muted)" }}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
