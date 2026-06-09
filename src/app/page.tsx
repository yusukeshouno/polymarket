import { fetchMarkets, fetchTags } from "@/lib/polymarket";
import { getLang } from "@/lib/i18n";
import { translateTexts } from "@/lib/translate";
import { LangProvider } from "@/components/LangContext";
import LangToggle from "@/components/LangToggle";
import MarketGrid, { BilingualMarket } from "@/components/MarketGrid";
import StatsSection from "@/components/StatsSection";
import FooterLabel from "@/components/FooterLabel";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ tag?: string; lang?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { tag, lang: langParam } = await searchParams;
  const initialLang = getLang(langParam);

  // Fetch markets + tags in parallel
  const [markets, tags] = await Promise.all([
    fetchMarkets(24, tag || undefined),
    fetchTags(),
  ]);

  // Always pre-fetch JA translations → client gets both instantly, zero delay on toggle
  const jaQuestions = await translateTexts(markets.map((m) => m.question));

  const bilingualMarkets: BilingualMarket[] = markets.map((m, i) => ({
    ...m,
    questionJa: jaQuestions[i] ?? m.question,
  }));

  const avg = markets.length
    ? Math.round(markets.reduce((s, m) => s + m.yesPrice, 0) / markets.length * 100)
    : 0;
  const high = markets.filter((m) => m.yesPrice >= 0.6).length;

  return (
    <LangProvider initial={initialLang}>
      <div
        className="min-h-screen"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        {/* Header */}
        <header className="border-b" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
            <h1 className="text-sm font-medium tracking-[0.2em] uppercase">
              Poly<span className="opacity-40">market</span>
            </h1>
            <div className="flex items-center gap-5">
              <UpdatedText />
              <Suspense>
                <LangToggle />
              </Suspense>
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto">
          <StatsSection count={markets.length} avg={avg} high={high} />
          <MarketGrid markets={bilingualMarkets} tags={tags} activeTag={tag} />
          <FooterLabel />
        </main>
      </div>
    </LangProvider>
  );
}

// Tiny client leaf that reads "updated" label from lang context
import UpdatedText from "@/components/UpdatedText";
