/**
 * 24 distinct card accent palettes.
 * Each card gets a unique hue identity — index % 24.
 */
export const CARD_PALETTES: string[] = [
  "#b52b27", //  0 ruby
  "#c9501c", //  1 burnt sienna
  "#c07c1a", //  2 amber
  "#8f9c1f", //  3 olive
  "#2e7d4f", //  4 forest
  "#1a7a6e", //  5 deep teal
  "#1565a8", //  6 sapphire
  "#2d3f9e", //  7 indigo
  "#5a2d9e", //  8 purple
  "#8b1a6b", //  9 mulberry
  "#b5275a", // 10 rose
  "#c44a1a", // 11 terracotta
  "#6b8c1a", // 12 lime-olive
  "#1a8c6b", // 13 emerald
  "#1a6b8c", // 14 teal-blue
  "#1a3f8c", // 15 cobalt
  "#6b1a8c", // 16 violet
  "#8c1a4b", // 17 burgundy
  "#4b8c1a", // 18 fern
  "#1a8c3f", // 19 jade
  "#8c6b1a", // 20 bronze
  "#1a8c8c", // 21 cyan-teal
  "#3f1a8c", // 22 deep indigo
  "#8c3a1a", // 23 rust
];

export function cardColor(index: number): string {
  return CARD_PALETTES[index % CARD_PALETTES.length];
}
