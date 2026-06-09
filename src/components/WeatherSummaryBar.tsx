"use client";

import { ProcessedMarket, WeatherCondition } from "@/lib/polymarket";

interface WeatherSummaryBarProps {
  markets: ProcessedMarket[];
}

const conditionEmoji: Record<WeatherCondition, string> = {
  sunny: "☀️",
  mostlySunny: "🌤️",
  partlyCloudy: "⛅",
  mostlyCloudy: "🌧️",
  rainy: "🌩️",
};

const conditionLabel: Record<WeatherCondition, string> = {
  sunny: "ほぼ確実",
  mostlySunny: "可能性高い",
  partlyCloudy: "五分五分",
  mostlyCloudy: "可能性低い",
  rainy: "ほぼない",
};

export default function WeatherSummaryBar({ markets }: WeatherSummaryBarProps) {
  const counts = markets.reduce(
    (acc, m) => {
      acc[m.weatherCondition] = (acc[m.weatherCondition] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const avgYes =
    markets.length > 0
      ? Math.round(
          (markets.reduce((s, m) => s + m.yesPrice, 0) / markets.length) * 100
        )
      : 0;

  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as WeatherCondition;

  return (
    <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sky-100 text-sm font-medium">今日の予測市場天気</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-5xl">{conditionEmoji[dominant] ?? "🌤️"}</span>
            <div>
              <p className="text-2xl font-black">{conditionLabel[dominant] ?? "—"}</p>
              <p className="text-sky-200 text-sm">平均確率 {avgYes}%</p>
            </div>
          </div>
        </div>

        <div className="text-right space-y-1">
          {(Object.keys(conditionEmoji) as WeatherCondition[]).map((c) =>
            counts[c] ? (
              <div key={c} className="flex items-center gap-2 text-sm justify-end">
                <span>{conditionEmoji[c]}</span>
                <span className="text-sky-100">{conditionLabel[c]}</span>
                <span className="font-bold w-5 text-right">{counts[c]}</span>
              </div>
            ) : null
          )}
          <p className="text-sky-200 text-xs pt-1">合計 {markets.length} マーケット</p>
        </div>
      </div>
    </div>
  );
}
