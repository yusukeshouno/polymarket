"use client";

import { useLang } from "./LangContext";
import { translations } from "@/lib/i18n";

export default function UpdatedText() {
  const { lang } = useLang();
  return (
    <p className="text-xs tracking-wide" style={{ color: "var(--muted)" }}>
      {translations[lang].updatedEvery}
    </p>
  );
}
