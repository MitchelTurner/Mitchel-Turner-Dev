/**
 * Language colors and share bars for repo cards and OG graphics.
 *
 * Kept out of the GitHub client so UI and image routes can import it without
 * pulling in Node `fs` or Prisma (that import has broken production builds).
 */

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Solidity: "#AA6746",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
};

export function languageColor(language: string | null | undefined): string {
  if (!language) return "#8b95a5";
  return LANGUAGE_COLORS[language] ?? "#8b95a5";
}

export interface LanguageShare {
  name: string;
  percent: number;
}

/**
 * Turn GitHub's bytes-per-language map into a short bar.
 * Percents are rounded, then trimmed so the slices never add up past 100
 * (independent rounding otherwise overflows the bar by a pixel or two).
 */
export function languageShares(
  bytesByLanguage: Record<string, number>,
  limit = 5,
): LanguageShare[] {
  const entries = Object.entries(bytesByLanguage).filter(([, bytes]) => bytes > 0);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (!total) return [];

  const ranked = entries
    .map(([name, bytes]) => ({
      name,
      percent: Math.round((bytes / total) * 100),
    }))
    .filter((item) => item.percent > 0)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, limit);

  let sum = ranked.reduce((totalPercent, item) => totalPercent + item.percent, 0);
  let guard = 0;
  while (sum > 100 && guard < 20) {
    const idx = ranked.reduce(
      (best, item, index) => (item.percent > ranked[best].percent ? index : best),
      0,
    );
    if (ranked[idx].percent <= 1) break;
    ranked[idx].percent -= 1;
    sum -= 1;
    guard += 1;
  }

  return ranked;
}
