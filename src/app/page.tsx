import { fetchMarkets, fetchTags } from "@/lib/polymarket";
import { getLang } from "@/lib/i18n";
import { translateTexts } from "@/lib/translate";
import { LangProvider } from "@/components/LangContext";
import LangToggle from "@/components/LangToggle";
import MarketGrid, { BilingualMarket } from "@/components/MarketGrid";
import StatsSection from "@/components/StatsSection";
import FooterLabel from "@/components/FooterLabel";
import UpdatedText from "@/components/UpdatedText";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ tag?: string; lang?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { tag, lang: langParam } = await searchParams;
  const initialLang = getLang(langParam);

  // Fetch ALL markets (no tag filter) + tags in parallel
  // Tag filtering happens client-side → instant tab switching
  const [markets, tags] = await Promise.all([
    fetchMarkets(96),   // load enough to cover all tags
    fetchTags(),
  ]);

  // Pre-fetch JA translations for all markets at once
  const jaQuestions = await translateTexts(markets.map((m) => m.question));

  const bilingualMarkets: BilingualMarket[] = markets.map((m, i) => ({
    ...m,
    questionJa: jaQuestions[i] ?? m.question,
  }));

  return (
    <LangProvider initial={initialLang}>
      <div
        className="min-h-screen"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <header className="border-b" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
            <h1 className="text-sm font-medium tracking-[0.2em] uppercase">
              Poly<span className="opacity-40">market</span>
            </h1>
            <div className="flex items-center gap-5">
              <UpdatedText />
              <Suspense><LangToggle /></Suspense>
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto">
          {/* Stats react to active tag filter (client-side) */}
          <MarketGrid
            markets={bilingualMarkets}
            tags={tags}
            initialTag={tag}
          />
          <FooterLabel />
        </main>
      </div>
    </LangProvider>
  );
}
