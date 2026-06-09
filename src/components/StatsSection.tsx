"use client";

import { useLang } from "./LangContext";
import { translations } from "@/lib/i18n";

interface Props {
  count: number;
  avg: number;
  high: number;
}

export default function StatsSection({ count, avg, high }: Props) {
  const { lang } = useLang();
  const t = translations[lang];

  const stats = [
    { label: t.stats.markets, value: count },
    { label: t.stats.avgYes, value: `${avg}%` },
    { label: t.stats.highConf, value: high },
  ];

  return (
    <div className="grid grid-cols-3 border-b" style={{ borderColor: "var(--border)" }}>
      {stats.map((s) => (
        <div
          key={s.label}
          className="py-6 px-6 border-r last:border-r-0"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-xs tracking-widest uppercase mb-1"
            style={{ color: "var(--muted)" }}
          >
            {s.label}
          </p>
          <p className="text-3xl font-light tabular-nums">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
