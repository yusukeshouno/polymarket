"use client";

import { T } from "@/lib/i18n";
import { probColor } from "./ProbabilityViz";

/** Deterministic pseudo-random shuffle (LCG) */
function deterministicShuffle(arr: boolean[], seed: number): boolean[] {
  const out = [...arr];
  let s = (seed * 1664525 + 1013904223) & 0x7fffffff;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    [out[i], out[s % (i + 1)]] = [out[s % (i + 1)], out[i]];
  }
  return out;
}

// ── K: Quantile dotplot — two stacked YES/NO columns ─────────────────────────
// Kay et al. CHI 2016: frequency framing, stacked columns
export function QuantileDotPlot({ pct, t }: { pct: number; t: T }) {
  const color = probColor(pct);
  const yes = Math.round(pct), no = 100 - yes;
  const D = 5, G = 2;
  return (
    <div className="flex flex-col gap-3">
      <svg width="150" height="76" viewBox="0 0 150 76">
        {Array.from({ length: Math.min(yes, 50) }, (_, i) => (
          <circle key={`y${i}`}
            cx={6 + (i % 5) * (D + G)} cy={70 - Math.floor(i / 5) * (D + G)}
            r={D / 2} fill={color} />
        ))}
        {Array.from({ length: Math.min(no, 50) }, (_, i) => (
          <circle key={`n${i}`}
            cx={82 + (i % 5) * (D + G)} cy={70 - Math.floor(i / 5) * (D + G)}
            r={D / 2} fill="var(--border)" />
        ))}
        <text x="18" y="76" textAnchor="middle" fontSize="9" fill={color} fontFamily="inherit">YES</text>
        <text x="94" y="76" textAnchor="middle" fontSize="9" fill="var(--muted)" fontFamily="inherit">NO</text>
      </svg>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 40, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>{pct}</span>
        <span style={{ fontSize: 16, fontWeight: 200, color: "var(--muted)" }}>%</span>
      </div>
    </div>
  );
}

// ── L: Random icon array (shuffled) ──────────────────────────────────────────
// Frequency framing with random placement — Economist / medical risk style
export function RandomIconArray({ pct, t }: { pct: number; t: T }) {
  const color = probColor(pct);
  const filled = Math.round(pct);
  const shuffled = deterministicShuffle(
    Array.from({ length: 100 }, (_, i) => i < filled),
    pct * 997 + 13
  );
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-[4px]" style={{ gridTemplateColumns: "repeat(10,1fr)", width: "130px" }}>
        {shuffled.map((on, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: on ? color : "var(--border)" }} />
        ))}
      </div>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 40, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>{pct}</span>
        <span style={{ fontSize: 16, fontWeight: 200, color: "var(--muted)" }}>%</span>
        <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 4 }}>{t.viz.outOf100}</span>
      </div>
    </div>
  );
}

// ── M: Person pictogram / Isotype ────────────────────────────────────────────
// Neurath/Isotype: metaphor + memory retention
function PersonIcon({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  const r = s * 0.27;
  return (
    <g>
      <circle cx={x + s / 2} cy={y + r} r={r} fill={fill} />
      <rect x={x + s * 0.22} y={y + r * 2.2} width={s * 0.56} height={s * 0.38} rx={s * 0.1} fill={fill} />
      <line x1={x + s * 0.08} y1={y + r * 2.55} x2={x + s * 0.92} y2={y + r * 2.55} stroke={fill} strokeWidth={s * 0.12} />
      <line x1={x + s * 0.32} y1={y + r * 2.2 + s * 0.38} x2={x + s * 0.16} y2={y + s} stroke={fill} strokeWidth={s * 0.12} strokeLinecap="round" />
      <line x1={x + s * 0.68} y1={y + r * 2.2 + s * 0.38} x2={x + s * 0.84} y2={y + s} stroke={fill} strokeWidth={s * 0.12} strokeLinecap="round" />
    </g>
  );
}
export function PersonPictogram({ pct, t }: { pct: number; t: T }) {
  const color = probColor(pct);
  const filled = Math.round(pct);
  const sz = 11, gap = 2, cols = 10;
  return (
    <div className="flex flex-col gap-3">
      <svg width={cols * (sz + gap)} height={cols * (sz + gap)} viewBox={`0 0 ${cols * (sz + gap)} ${cols * (sz + gap)}`}>
        {Array.from({ length: 100 }, (_, i) => (
          <PersonIcon key={i}
            x={(i % cols) * (sz + gap)} y={Math.floor(i / cols) * (sz + gap)}
            s={sz} fill={i < filled ? color : "var(--border)"} />
        ))}
      </svg>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 36, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>{pct}</span>
        <span style={{ fontSize: 14, fontWeight: 200, color: "var(--muted)" }}>%</span>
        <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 4 }}>{t.viz.outOf100}</span>
      </div>
    </div>
  );
}

// ── N: Fan chart ──────────────────────────────────────────────────────────────
// Bank of England style: central dense band → outer fading uncertainty
export function FanChart({ pct, t }: { pct: number; t: T }) {
  const color = probColor(pct);
  const cx = 90, cy = 88, maxR = 74;
  const angleDeg = (pct / 100) * 180;
  function arc(r: number, endDeg: number, op: number) {
    const e = Math.min(endDeg, 180);
    const rad = (e - 180) * Math.PI / 180;
    const ex = cx + r * Math.cos(rad), ey = cy + r * Math.sin(rad);
    const la = e > 90 ? 1 : 0;
    return <path key={`${r}-${op}`} d={`M${cx - r},${cy} A${r},${r} 0 ${la},1 ${ex},${ey} L${cx},${cy} Z`} fill={color} opacity={op} />;
  }
  return (
    <div className="flex flex-col gap-1">
      <svg width="180" height="94" viewBox="0 0 180 94">
        <path d={`M${cx - maxR},${cy} A${maxR},${maxR} 0 0,1 ${cx + maxR},${cy}`} fill="none" stroke="var(--border)" strokeWidth="1" />
        {arc(maxR, Math.min(angleDeg + 25, 180), 0.07)}
        {arc(maxR * 0.82, Math.min(angleDeg + 15, 180), 0.14)}
        {arc(maxR * 0.64, Math.min(angleDeg + 7, 180), 0.24)}
        {arc(maxR * 0.46, angleDeg, 0.95)}
        <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="var(--border)" strokeWidth="1" />
      </svg>
      <div className="flex items-baseline gap-1 -mt-1">
        <span style={{ fontSize: 40, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>{pct}</span>
        <span style={{ fontSize: 16, fontWeight: 200, color: "var(--muted)" }}>%</span>
      </div>
    </div>
  );
}

// ── O: Liquid fill gauge ──────────────────────────────────────────────────────
export function LiquidGauge({ pct, t }: { pct: number; t: T }) {
  const color = probColor(pct);
  const W = 52, H = 88;
  const fillY = H * (1 - pct / 100);
  const wave = `M0,${fillY} C13,${fillY - 5} 27,${fillY + 5} ${W},${fillY} L${W},${H} L0,${H} Z`;
  return (
    <div className="flex items-end gap-5">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect x="0" y="0" width={W} height={H} rx="6" fill="var(--border)" />
        <clipPath id={`lc${pct}`}><rect x="0" y="0" width={W} height={H} rx="6" /></clipPath>
        <path d={wave} fill={color} clipPath={`url(#lc${pct})`} />
        <line x1="0" y1={H * 0.5} x2={W} y2={H * 0.5} stroke="var(--background)" strokeWidth="1" opacity="0.5" strokeDasharray="2 2" />
        <rect x="0" y="0" width={W} height={H} rx="6" fill="none" stroke="var(--border)" strokeWidth="1.5" />
      </svg>
      <div>
        <div style={{ fontSize: 48, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>
          {pct}<span style={{ fontSize: 20, fontWeight: 200, color: "var(--muted)" }}>%</span>
        </div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.15em", marginTop: 6 }}>
          {t.viz.yesProbability.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

// ── P: Snake bar (zigzag 20 segments) ────────────────────────────────────────
// 538 snake style
export function SnakeBar({ pct, t }: { pct: number; t: T }) {
  const color = probColor(pct);
  const SEGS = 20, filled = Math.round(pct / 5);
  const sw = 11, sh = 14, sg = 2, W = 10 * (sw + sg) - sg;
  return (
    <div className="flex flex-col gap-3">
      <svg width={W + 12} height={sh * 2 + sg + 4} viewBox={`0 0 ${W + 12} ${sh * 2 + sg + 4}`}>
        {Array.from({ length: SEGS }, (_, i) => {
          const row = Math.floor(i / 10);
          const col = row === 0 ? i % 10 : 9 - (i % 10);
          return <rect key={i} x={col * (sw + sg)} y={row * (sh + sg)} width={sw} height={sh} rx="2"
            fill={i < filled ? color : "var(--border)"} />;
        })}
        <path d={`M${W + 1},${sh / 2} Q${W + 9},${sh + sg / 2} ${W + 1},${sh + sg + sh / 2}`}
          fill="none" stroke="var(--border)" strokeWidth="1.5" />
      </svg>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 40, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>{pct}</span>
        <span style={{ fontSize: 16, fontWeight: 200, color: "var(--muted)" }}>%</span>
      </div>
    </div>
  );
}

// ── Q: Probability wheel / spinner ───────────────────────────────────────────
export function ProbWheel({ pct, t }: { pct: number; t: T }) {
  const color = probColor(pct);
  const cx = 54, cy = 54, r = 46, SEGS = 10;
  const filledSegs = Math.round(pct / 10);
  function seg(i: number) {
    const s = (i / SEGS) * 2 * Math.PI - Math.PI / 2;
    const e = ((i + 1) / SEGS) * 2 * Math.PI - Math.PI / 2;
    return `M${cx},${cy} L${cx + r * Math.cos(s)},${cy + r * Math.sin(s)} A${r},${r} 0 0,1 ${cx + r * Math.cos(e)},${cy + r * Math.sin(e)} Z`;
  }
  return (
    <div className="flex items-center gap-5">
      <svg width="108" height="108" viewBox="0 0 108 108">
        {Array.from({ length: SEGS }, (_, i) => (
          <path key={i} d={seg(i)} fill={i < filledSegs ? color : "var(--border)"} stroke="var(--background)" strokeWidth="1.5" />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.36} fill="var(--background)" />
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize="18" fontWeight="200" fill={color} fontFamily="inherit">{pct}</text>
        <text x={cx} y={cy + 13} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="inherit">%</text>
      </svg>
      <div style={{ fontSize: 11, lineHeight: 2 }}>
        <div style={{ color: "var(--muted)", fontSize: 10, letterSpacing: "0.12em" }}>{t.viz.yes}</div>
        <div style={{ fontSize: 18, fontWeight: 200, color }}>{pct}%</div>
        <div style={{ height: 6 }} />
        <div style={{ color: "var(--muted)", fontSize: 10, letterSpacing: "0.12em" }}>{t.viz.no}</div>
        <div style={{ fontSize: 18, fontWeight: 200, color: "var(--foreground)" }}>{100 - pct}%</div>
      </div>
    </div>
  );
}

// ── R: Gradient density bar (confidence strip) ───────────────────────────────
// Wilke style: density gradient encodes uncertainty
export function DensityBar({ pct, t }: { pct: number; t: T }) {
  const color = probColor(pct);
  const id = `gd${pct}`;
  const p0 = Math.max(pct - 22, 0), p1 = Math.min(pct + 22, 100);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 48, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color }}>{pct}</span>
        <span style={{ fontSize: 20, fontWeight: 200, color: "var(--muted)" }}>%</span>
      </div>
      <div>
        <svg width="100%" height="44" viewBox="0 0 200 44" preserveAspectRatio="none">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity="0" />
              <stop offset={`${p0}%`} stopColor={color} stopOpacity="0.1" />
              <stop offset={`${pct}%`} stopColor={color} stopOpacity="1" />
              <stop offset={`${p1}%`} stopColor={color} stopOpacity="0.1" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="10" width="200" height="24" rx="2" fill={`url(#${id})`} />
          <line x1={pct * 2} y1="6" x2={pct * 2} y2="38" stroke={color} strokeWidth="1.5" />
        </svg>
        <div className="flex justify-between" style={{ fontSize: 10, color: "var(--muted)" }}>
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </div>
    </div>
  );
}

// ── S: VSUP color encoding ────────────────────────────────────────────────────
// Correll et al. CHI 2018: saturation = certainty, 50% = gray
export function VSUPBar({ pct, t }: { pct: number; t: T }) {
  const certainty = Math.abs(pct - 50) / 50;
  const color = probColor(pct);
  const gray = 165;
  const displayColor = certainty > 0.08 ? color : `rgb(${gray},${gray},${gray})`;
  const label = certainty < 0.15 ? "UNCERTAIN" : certainty < 0.5 ? "LIKELY" : "ALMOST CERTAIN";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 48, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.02em", color: displayColor }}>{pct}</span>
        <span style={{ fontSize: 20, fontWeight: 200, color: "var(--muted)" }}>%</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, height: "100%", width: `${pct}%`,
          background: displayColor, opacity: 0.3 + certainty * 0.7,
        }} />
      </div>
      <div style={{ fontSize: 9, letterSpacing: "0.12em", color: displayColor }}>{label}</div>
    </div>
  );
}

// ── T: Proportional area circle ───────────────────────────────────────────────
// Area ∝ probability (r = maxR × √pct)
export function ProportionalCircle({ pct, t }: { pct: number; t: T }) {
  const color = probColor(pct);
  const maxR = 50, r = pct > 0 ? maxR * Math.sqrt(pct / 100) : 0;
  const cx = 60, cy = 60;
  return (
    <div className="flex items-center gap-3">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
        {r > 0 && <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.88" />}
        {r > 5 && <>
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="18" fontWeight="200" fill="white" fontFamily="inherit">{pct}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="white" opacity="0.8" fontFamily="inherit">%</text>
        </>}
      </svg>
      <div>
        <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 8 }}>AREA ∝ PROB</div>
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 2 }}>
          <span style={{ color }}>●</span> {pct}% YES<br />
          <span style={{ color: "var(--border)" }}>○</span> {100 - pct}% NO
        </div>
      </div>
    </div>
  );
}
