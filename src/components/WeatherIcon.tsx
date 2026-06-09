"use client";

import { WeatherCondition } from "@/lib/polymarket";

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

const sizeMap = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
  xl: "text-8xl",
};

export default function WeatherIcon({
  condition,
  size = "md",
  animated = true,
}: WeatherIconProps) {
  const icons: Record<WeatherCondition, { emoji: string; label: string; animClass: string }> = {
    sunny: {
      emoji: "☀️",
      label: "晴れ",
      animClass: animated ? "animate-spin-slow" : "",
    },
    mostlySunny: {
      emoji: "🌤️",
      label: "晴れ時々曇り",
      animClass: "",
    },
    partlyCloudy: {
      emoji: "⛅",
      label: "曇り時々晴れ",
      animClass: "",
    },
    mostlyCloudy: {
      emoji: "🌧️",
      label: "雨時々曇り",
      animClass: "",
    },
    rainy: {
      emoji: "🌩️",
      label: "雨",
      animClass: animated ? "animate-bounce" : "",
    },
  };

  const { emoji, label, animClass } = icons[condition];

  return (
    <span
      className={`${sizeMap[size]} ${animClass} select-none`}
      role="img"
      aria-label={label}
      title={label}
    >
      {emoji}
    </span>
  );
}
