"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Lang } from "@/lib/i18n";

export default function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggle() {
    const next = lang === "en" ? "ja" : "en";
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <button
      onClick={toggle}
      className="text-xs tracking-widest transition-colors"
      style={{ color: "var(--muted)" }}
      aria-label="Toggle language"
    >
      <span style={{ color: lang === "en" ? "var(--foreground)" : "var(--muted)", fontWeight: lang === "en" ? 500 : 400 }}>
        EN
      </span>
      <span style={{ color: "var(--border)", margin: "0 4px" }}>/</span>
      <span style={{ color: lang === "ja" ? "var(--foreground)" : "var(--muted)", fontWeight: lang === "ja" ? 500 : 400 }}>
        JA
      </span>
    </button>
  );
}
