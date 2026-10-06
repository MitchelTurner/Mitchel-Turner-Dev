/**
 * Live Work always syncs this GitHub account.
 * github.config.json and GITHUB_USERNAME are expected to match it.
 */
export const PORTFOLIO_GITHUB_USERNAME = "MitchelTurner";

export type UsernameSource = "database" | "env" | "config";

function clean(value?: string | null): string {
  const trimmed = value?.trim().replace(/^@/, "") ?? "";
  if (!trimmed) return "";
  if (/^your([_-]|\s)?github/i.test(trimmed)) return "";
  if (trimmed.toLowerCase() === "username") return "";
  return trimmed;
}

function isPortfolioAccount(value: string): boolean {
  return value.toLowerCase() === PORTFOLIO_GITHUB_USERNAME.toLowerCase();
}

/**
 * Pick the GitHub account for the portfolio.
 * Blank, placeholder, or other handles in the database, env, or config
 * do not replace MitchelTurner.
 */
export function selectPortfolioUsername(input: {
  database?: string | null;
  env?: string | null;
  config?: string | null;
}): { username: string; source: UsernameSource } {
  const database = clean(input.database);
  const env = clean(input.env);
  const config = clean(input.config);

  if (isPortfolioAccount(database)) {
    return { username: PORTFOLIO_GITHUB_USERNAME, source: "database" };
  }
  if (isPortfolioAccount(env)) {
    return { username: PORTFOLIO_GITHUB_USERNAME, source: "env" };
  }
  if (isPortfolioAccount(config)) {
    return { username: PORTFOLIO_GITHUB_USERNAME, source: "config" };
  }
  return { username: PORTFOLIO_GITHUB_USERNAME, source: "config" };
}
