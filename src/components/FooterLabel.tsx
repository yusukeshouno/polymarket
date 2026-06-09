"use client";

import { useLang } from "./LangContext";
import { translations } from "@/lib/i18n";

export default function FooterLabel() {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <div className="border-t px-6 py-5" style={{ borderColor: "var(--border)" }}>
      <p className="text-xs tracking-wide" style={{ color: "var(--muted)" }}>
        {t.dataSource}
      </p>
    </div>
  );
}
