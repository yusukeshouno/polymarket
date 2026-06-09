"use client";

import { useLang } from "./LangContext";

export default function LangToggle() {
  const { lang, toggle } = useLang();

  return (
    <button
      onClick={toggle}
      className="text-xs tracking-widest transition-colors"
      aria-label="Toggle language"
    >
      <span
        style={{
          color: lang === "en" ? "var(--foreground)" : "var(--muted)",
          fontWeight: lang === "en" ? 500 : 400,
        }}
      >
        EN
      </span>
      <span style={{ color: "var(--border)", margin: "0 4px" }}>/</span>
      <span
        style={{
          color: lang === "ja" ? "var(--foreground)" : "var(--muted)",
          fontWeight: lang === "ja" ? 500 : 400,
        }}
      >
        JA
      </span>
    </button>
  );
}
