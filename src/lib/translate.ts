// Google Translate unofficial API — no key required
// Cached per market ID in Next.js data cache (revalidate: 1 day)

const TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

async function translateOne(text: string): Promise<string> {
  const url = `${TRANSLATE_URL}?client=gtx&sl=en&tl=ja&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 1 day
  if (!res.ok) return text;
  const data = await res.json();
  // data[0] is array of [translated, original, ...]
  const translated = (data[0] as [string, string][])
    .map((seg) => seg[0])
    .join("");
  return translated || text;
}

export async function translateTexts(
  texts: string[]
): Promise<string[]> {
  if (texts.length === 0) return [];
  // Translate in parallel (max 10 at a time to avoid rate limits)
  const CHUNK = 10;
  const results: string[] = [];
  for (let i = 0; i < texts.length; i += CHUNK) {
    const chunk = texts.slice(i, i + CHUNK);
    const translated = await Promise.all(chunk.map(translateOne));
    results.push(...translated);
  }
  return results;
}
