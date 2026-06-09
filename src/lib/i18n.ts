export type Lang = "en" | "ja";

export const translations = {
  en: {
    siteName: "POLYMARKET",
    siteTagline: "Prediction Market Dashboard",
    updatedEvery: "Updated every 5 min",
    stats: {
      markets: "Markets",
      avgYes: "Avg. YES",
      highConf: "High conf.",
    },
    filter: {
      all: "All",
    },
    conditions: {
      sunny: "Almost certain",
      mostlySunny: "Likely",
      partlyCloudy: "Even odds",
      mostlyCloudy: "Unlikely",
      rainy: "Very unlikely",
    },
    viz: {
      yesProbability: "Yes probability",
      yes: "YES",
      no: "NO",
      outOf100: "out of 100",
      zeroLabel: "0%",
      midLabel: "50%",
      hundredLabel: "100%",
    },
    noMarkets: "No markets found",
    dataSource: "Data — Polymarket Gamma API",
  },
  ja: {
    siteName: "ポリマーケット",
    siteTagline: "予測市場ダッシュボード",
    updatedEvery: "5分ごとに更新",
    stats: {
      markets: "マーケット",
      avgYes: "平均YES",
      highConf: "高確率",
    },
    filter: {
      all: "全て",
    },
    conditions: {
      sunny: "ほぼ確実",
      mostlySunny: "可能性高い",
      partlyCloudy: "五分五分",
      mostlyCloudy: "可能性低い",
      rainy: "ほぼない",
    },
    viz: {
      yesProbability: "YES確率",
      yes: "YES",
      no: "NO",
      outOf100: "/ 100",
      zeroLabel: "0%",
      midLabel: "50%",
      hundredLabel: "100%",
    },
    noMarkets: "マーケットが見つかりません",
    dataSource: "データ提供 — Polymarket Gamma API",
  },
} as const;

export type T = typeof translations.en;

export function getLang(param?: string): Lang {
  return param === "ja" ? "ja" : "en";
}
