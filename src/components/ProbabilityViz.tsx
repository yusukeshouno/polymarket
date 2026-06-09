"use client";

import { T } from "@/lib/i18n";
import { useMotion } from "@/lib/useMotion";

export function probColor(pct: number): string {
  if (pct >= 95) return "#1a5c35";
  if (pct >= 80) return "#2a7a4a";
  if (pct >= 70) return "#3a9060";
  if (pct >= 60) return "#5a9e72";
  if (pct >= 50) return "#8aaa60";
  if (pct >= 40) return "#b09840";
  if (pct >= 30) return "#c07830";
  if (pct >= 20) return "#c05030";
  if (pct >= 10) return "#b03030";
  return "#8a1a1a";
}

// ── A: Arc gauge ──────────────────────────────────────────────────────────────
export function ArcGauge({ pct, t }: { pct: number; t: T }) {
  const p = useMotion();
  const ap = pct * p;
  const color = probColor(pct);
  const r = 68, cx = 90, cy = 86;
  const angleDeg = (ap / 100) * 180 - 180;
  const rad = angleDeg * (Math.PI / 180);
  const nx = cx + r * Math.cos(rad), ny = cy + r * Math.sin(rad);
  const fillD = ap <= 0 ? "" : ap >= 100
    ? `M${cx-r},${cy} A${r},${r} 0 0,1 ${cx+r},${cy}`
    : `M${cx-r},${cy} A${r},${r} 0 0,1 ${nx},${ny}`;
  return (
    <div className="flex flex-col items-start">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d={`M${cx-r},${cy} A${r},${r} 0 0,1 ${cx+r},${cy}`} fill="none" stroke="var(--border)" strokeWidth="5" strokeLinecap="round" />
        {fillD && <path d={fillD} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />}
        <circle cx={ap<=0?cx-r:nx} cy={ap<=0?cy:ny} r="7" fill={ap<=0?"var(--border)":color} />
      </svg>
      <div className="flex items-baseline gap-1 -mt-2">
        <span style={{ fontSize:52, fontWeight:200, lineHeight:1, letterSpacing:"-0.02em", color }}>{Math.round(ap)}</span>
        <span style={{ fontSize:22, fontWeight:200, color:"var(--muted)" }}>%</span>
      </div>
      <div className="flex justify-between w-[180px] mt-1">
        <span style={{ fontSize:10, color:"var(--muted)" }}>0</span>
        <span style={{ fontSize:10, color:"var(--muted)" }}>100</span>
      </div>
    </div>
  );
}

// ── B: Dot grid 10×10 ─────────────────────────────────────────────────────────
export function DotGrid({ pct, t }: { pct: number; t: T }) {
  const p = useMotion(800);
  const filled = Math.round(pct * p);
  const color = probColor(pct);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-[4px]" style={{ gridTemplateColumns:"repeat(10,1fr)", width:"130px" }}>
        {Array.from({ length:100 }, (_,i) => (
          <div key={i} style={{ width:10, height:10, borderRadius:"50%",
            background: i < filled ? color : "var(--border)",
            transition: "background 0.05s",
          }} />
        ))}
      </div>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize:44, fontWeight:200, lineHeight:1, letterSpacing:"-0.02em", color }}>{Math.round(pct*p)}</span>
        <span style={{ fontSize:18, fontWeight:200, color:"var(--muted)" }}>%</span>
        <span style={{ fontSize:11, color:"var(--muted)", marginLeft:4 }}>{t.viz.outOf100}</span>
      </div>
    </div>
  );
}

// ── C: Vertical bar ───────────────────────────────────────────────────────────
export function VerticalBar({ pct, t }: { pct: number; t: T }) {
  const p = useMotion();
  const color = probColor(pct);
  return (
    <div className="flex items-end gap-5">
      <div className="flex flex-col items-center gap-1">
        <span style={{ fontSize:10, color:"var(--muted)" }}>100</span>
        <div className="relative" style={{ width:32, height:110, background:"var(--border)" }}>
          <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1, background:"var(--background)", opacity:0.8 }} />
          <div style={{ position:"absolute", bottom:0, left:0, right:0,
            height:`${Math.max(pct*p,0)}%`, background:color,
            transition:"height 0.05s",
          }} />
        </div>
        <span style={{ fontSize:10, color:"var(--muted)" }}>0</span>
      </div>
      <div>
        <div style={{ fontSize:52, fontWeight:200, lineHeight:1, letterSpacing:"-0.02em", color }}>
          {Math.round(pct*p)}<span style={{ fontSize:22, fontWeight:200, color:"var(--muted)" }}>%</span>
        </div>
        <div style={{ fontSize:10, color:"var(--muted)", letterSpacing:"0.15em", marginTop:6 }}>
          {t.viz.yesProbability.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

// ── D: Split bar YES | NO ─────────────────────────────────────────────────────
export function SplitBar({ pct, t }: { pct: number; t: T }) {
  const p = useMotion();
  const ap = pct * p;
  const no = 100 - pct;
  const color = probColor(pct);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <span style={{ fontSize:52, fontWeight:200, lineHeight:1, letterSpacing:"-0.02em", color }}>{Math.round(ap)}</span>
          <span style={{ fontSize:22, fontWeight:200, color:"var(--muted)" }}>%</span>
        </div>
        <div className="text-right pb-1">
          <span style={{ fontSize:28, fontWeight:200, color:"var(--muted)", lineHeight:1 }}>{Math.round(100-ap)}</span>
          <span style={{ fontSize:13, fontWeight:200, color:"var(--muted)" }}>%</span>
        </div>
      </div>
      <div className="flex" style={{ height:4, gap:2 }}>
        <div style={{ flex:Math.max(ap, 0.01), background:color, borderRadius:2, transition:"flex 0.05s" }} />
        <div style={{ flex:Math.max(100-ap, 0.01), background:"var(--border)", borderRadius:2 }} />
      </div>
      <div className="flex justify-between" style={{ fontSize:10, letterSpacing:"0.15em", color:"var(--muted)" }}>
        <span>{t.viz.yes}</span><span>{t.viz.no}</span>
      </div>
    </div>
  );
}

// ── E: Radial donut ───────────────────────────────────────────────────────────
export function RadialDonut({ pct, t }: { pct: number; t: T }) {
  const p = useMotion();
  const r = 46, circ = 2 * Math.PI * r;
  const fill = (pct/100 * p) * circ;
  const color = probColor(pct);
  return (
    <div className="flex items-center gap-6">
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle cx="54" cy="54" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${fill} ${circ}`} strokeDashoffset={circ/4} strokeLinecap="round" />
        <text x="54" y="48" textAnchor="middle" fontSize="26" fontWeight="200" fill={color} fontFamily="inherit">{Math.round(pct*p)}</text>
        <text x="54" y="65" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="inherit">%</text>
      </svg>
      <div style={{ fontSize:11, lineHeight:2.2 }}>
        <div style={{ color:"var(--muted)", letterSpacing:"0.12em", fontSize:10 }}>{t.viz.yes}</div>
        <div style={{ fontSize:20, fontWeight:200, lineHeight:1, color }}>
          {Math.round(pct*p)}<span style={{ fontSize:11, color:"var(--muted)" }}>%</span>
        </div>
        <div style={{ height:10 }} />
        <div style={{ color:"var(--muted)", letterSpacing:"0.12em", fontSize:10 }}>{t.viz.no}</div>
        <div style={{ fontSize:20, fontWeight:200, lineHeight:1, color:"var(--foreground)" }}>
          {Math.round(100-pct*p)}<span style={{ fontSize:11, color:"var(--muted)" }}>%</span>
        </div>
      </div>
    </div>
  );
}

// ── F: Slider ─────────────────────────────────────────────────────────────────
export function SliderTrack({ pct, t }: { pct: number; t: T }) {
  const p = useMotion();
  const ap = pct * p;
  const clampedPct = Math.max(2, Math.min(98, ap));
  const thumbX = 12 + (176 * clampedPct) / 100;
  const color = probColor(pct);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize:52, fontWeight:200, lineHeight:1, letterSpacing:"-0.02em", color }}>{Math.round(ap)}</span>
        <span style={{ fontSize:22, fontWeight:200, color:"var(--muted)" }}>%</span>
      </div>
      <div className="w-full">
        <svg width="100%" height="28" viewBox="0 0 200 28" preserveAspectRatio="xMidYMid meet">
          <line x1="12" y1="14" x2="188" y2="14" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="14" x2={thumbX} y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx={thumbX} cy="14" r="7" fill="var(--background)" stroke={color} strokeWidth="2" />
        </svg>
        <div className="flex justify-between" style={{ fontSize:10, color:"var(--muted)" }}>
          <span>{t.viz.zeroLabel}</span><span>{t.viz.midLabel}</span><span>{t.viz.hundredLabel}</span>
        </div>
      </div>
    </div>
  );
}

// ── G: Segment blocks ─────────────────────────────────────────────────────────
export function SegmentBlocks({ pct, t }: { pct: number; t: T }) {
  const p = useMotion(900);
  const filled = Math.round(pct * p / 10);
  const color = probColor(pct);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize:52, fontWeight:200, lineHeight:1, letterSpacing:"-0.02em", color }}>{Math.round(pct*p)}</span>
        <span style={{ fontSize:22, fontWeight:200, color:"var(--muted)" }}>%</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length:10 }, (_,i) => (
          <div key={i} style={{
            flex:1, height: 28+i*4,
            background: i < filled ? color : "var(--border)",
            borderRadius:2, alignSelf:"flex-end",
            transition:"background 0.08s",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── H: Waveform ───────────────────────────────────────────────────────────────
export function Waveform({ pct, t }: { pct: number; t: T }) {
  const p = useMotion(800);
  const amplitude = (pct/100) * 18 * p;
  const color = probColor(pct);
  const W=180, H=56, pts=36;
  const points = Array.from({ length:pts+1 }, (_,i) => {
    const x=(i/pts)*W;
    const y=H/2-Math.sin((i/pts)*Math.PI*4)*amplitude;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="flex flex-col gap-2">
      <svg width="180" height="56" viewBox={`0 0 ${W} ${H}`}>
        <line x1="0" y1={H/2} x2={W} y2={H/2} stroke="var(--border)" strokeWidth="1" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize:44, fontWeight:200, lineHeight:1, letterSpacing:"-0.02em", color }}>{Math.round(pct*p)}</span>
        <span style={{ fontSize:18, fontWeight:200, color:"var(--muted)" }}>%</span>
      </div>
    </div>
  );
}

// ── I: Stacked segments ───────────────────────────────────────────────────────
export function StackedSegments({ pct, t }: { pct: number; t: T }) {
  const p = useMotion();
  const color = probColor(pct);
  const rows = 5;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-[3px]">
        {Array.from({ length:rows }, (_,row) => {
          const rowPct = Math.max(0, Math.min(100, pct*p - row*20)) / 20 * 100;
          return (
            <div key={row} className="relative h-4 rounded-sm overflow-hidden" style={{ background:"var(--border)" }}>
              <div style={{ width:`${rowPct}%`, height:"100%", background:color, borderRadius:2, transition:"width 0.05s" }} />
            </div>
          );
        })}
      </div>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize:44, fontWeight:200, lineHeight:1, letterSpacing:"-0.02em", color }}>{Math.round(pct*p)}</span>
        <span style={{ fontSize:18, fontWeight:200, color:"var(--muted)" }}>%</span>
      </div>
    </div>
  );
}

// ── J: Typographic large ──────────────────────────────────────────────────────
export function TypoLarge({ pct, t }: { pct: number; t: T }) {
  const p = useMotion(900);
  const color = probColor(pct);
  const weight = 100 + Math.round((1 - Math.abs(pct-50)/50) * 300);
  return (
    <div className="flex flex-col gap-3">
      <div style={{ fontSize:88, fontWeight:weight, lineHeight:1, letterSpacing:"-0.04em", color }}>
        {Math.round(pct*p)}<span style={{ fontSize:36, color:"var(--muted)", fontWeight:200 }}>%</span>
      </div>
      <div className="relative h-px w-full" style={{ background:"var(--border)" }}>
        <div style={{ position:"absolute", top:0, left:0, height:"100%", width:`${pct*p}%`, background:color, transition:"width 0.05s" }} />
      </div>
      <div style={{ fontSize:10, color:"var(--muted)", letterSpacing:"0.15em" }}>
        {t.viz.yesProbability.toUpperCase()}
      </div>
    </div>
  );
}
