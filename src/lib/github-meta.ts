/**
 * Client-safe GitHub portfolio types and helpers.
 *
 * Kept separate from `./github` (server-only API client) so client components
 * can render cards without pulling in Node built-ins or Prisma.
 */

export interface RepoDeployment {
  environment: string;
  state: string; // success | in_progress | error | pending | inactive ...
  url: string | null;
}

export interface PortfolioRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  languages: { name: string; percent: number }[];
  topics: string[];
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  pushedAt: string;
  createdAt: string;
  isArchived: boolean;
  hasPages: boolean;
  pagesUrl: string | null;
  deployment: RepoDeployment | null;
}

// Deterministic brand-ish colors for common languages (used in graphics/badges).
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
