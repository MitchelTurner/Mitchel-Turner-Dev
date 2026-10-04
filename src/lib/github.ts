/**
 * GitHub API client for the Live Work portfolio.
 *
 * Fetches public repos for a configured username, normalizes them into
 * `PortfolioRepo` objects, and enriches each with language breakdowns and
 * optional deployment status. Responses are cached via Next.js fetch
 * revalidation to stay within GitHub's rate limits (60 req/hr unauthenticated).
 *
 * @see resolveGithubUsername in ./settings.ts for username resolution
 * @see /api/og/repo for per-repo cover graphics
 */
import { languageShares } from "./languages";
import { isPublicLiveUrl } from "./liveUrls";
import { resolveGithubUsername } from "./settings";

const API = "https://api.github.com";
// Cache GitHub responses to respect rate limits. Repo lists refresh every 2 min;
// per-repo language data can stay warmer longer.
const REPO_LIST_REVALIDATE = 120;
const REPO_DETAIL_REVALIDATE = 3600;
// Without a token GitHub allows only 60 requests/hr. Language + deployment
// enrichment costs several requests per repo, so we cap how many repos get
// deployment lookups when unauthenticated to protect the core repo-list
// request. A GITHUB_TOKEN removes this cap (5,000 req/hr).
const UNAUTH_DEPLOYMENT_LIMIT = 12;

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

interface RawRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  pushed_at: string;
  created_at: string;
  fork: boolean;
  archived: boolean;
  has_pages: boolean;
  owner: { login: string };
}

function ghHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "mitchelturner-dev",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function pagesUrlFor(repo: RawRepo): string | null {
  if (!repo.has_pages) return null;
  // GitHub Pages default URL. Custom domains aren't exposed here without an
  // extra authenticated call, so the homepage field usually covers those.
  return `https://${repo.owner.login}.github.io/${repo.name}/`;
}

async function fetchLanguages(
  owner: string,
  repo: string,
): Promise<{ name: string; percent: number }[]> {
  try {
    const res = await fetch(`${API}/repos/${owner}/${repo}/languages`, {
      headers: ghHeaders(),
      next: { revalidate: REPO_DETAIL_REVALIDATE },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, number>;
    return languageShares(data);
  } catch {
    return [];
  }
}

async function fetchDeployment(
  owner: string,
  repo: string,
): Promise<RepoDeployment | null> {
  // Deployment data (environment + status) is public for public repos, so we
  // fetch it whether or not a token is set. Without a token this counts against
  // the 60 req/hr unauthenticated limit, so callers cap how many repos are
  // enriched (see UNAUTH_DEPLOYMENT_LIMIT); a GITHUB_TOKEN raises the limit to
  // 5,000/hr and lets every repo's deployment show.
  try {
    const res = await fetch(
      `${API}/repos/${owner}/${repo}/deployments?per_page=1`,
      { headers: ghHeaders(), next: { revalidate: REPO_DETAIL_REVALIDATE } },
    );
    if (!res.ok) return null;
    const deployments = (await res.json()) as {
      id: number;
      environment: string;
    }[];
    if (!deployments.length) return null;
    const latest = deployments[0];

    const statusRes = await fetch(
      `${API}/repos/${owner}/${repo}/deployments/${latest.id}/statuses?per_page=1`,
      { headers: ghHeaders(), next: { revalidate: REPO_DETAIL_REVALIDATE } },
    );
    let state = "active";
    let url: string | null = null;
    if (statusRes.ok) {
      const statuses = (await statusRes.json()) as {
        state: string;
        environment_url: string | null;
        target_url: string | null;
      }[];
      if (statuses.length) {
        state = statuses[0].state;
        // Railway/GitHub often report a dashboard URL here — keep status for
        // the badge, but only surface a URL when it's a public live site.
        const raw =
          statuses[0].environment_url || statuses[0].target_url || null;
        url = isPublicLiveUrl(raw) ? raw : null;
      }
    }
    return { environment: latest.environment, state, url };
  } catch {
    return null;
  }
}

export interface PortfolioResult {
  username: string | null;
  repos: PortfolioRepo[];
  error: string | null;
}

// Fetch and normalize a user's public repositories for the portfolio.
// The configured username is resolved live (so admin/env changes apply
// immediately), while GitHub API responses are cached briefly to respect rate
// limits. The cache key includes the username, so switching accounts always
// fetches fresh.
export async function fetchPortfolioRepos(
  limit = 12,
  options?: { fresh?: boolean },
): Promise<PortfolioResult> {
  const username = await resolveGithubUsername();
  if (!username) {
    return { username: null, repos: [], error: "No GitHub username configured." };
  }

  const listCache = options?.fresh
    ? ({ cache: "no-store" } as const)
    : ({ next: { revalidate: REPO_LIST_REVALIDATE } } as const);

  let raw: RawRepo[];
  try {
    const res = await fetch(
      `${API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
      { headers: ghHeaders(), ...listCache },
    );
    if (res.status === 404) {
      return {
        username,
        repos: [],
        error: `GitHub user "${username}" was not found.`,
      };
    }
    if (res.status === 403) {
      return {
        username,
        repos: [],
        error:
          "GitHub API rate limit reached. Add a GITHUB_TOKEN to raise the limit.",
      };
    }
    if (!res.ok) {
      return { username, repos: [], error: `GitHub API error (${res.status}).` };
    }
    raw = (await res.json()) as RawRepo[];
  } catch {
    return { username, repos: [], error: "Could not reach the GitHub API." };
  }

  const selected = raw
    .filter((r) => !r.fork)
    .sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    })
    .slice(0, limit);

  const hasToken = Boolean(process.env.GITHUB_TOKEN?.trim());
  const deploymentLimit = hasToken
    ? selected.length
    : Math.min(selected.length, UNAUTH_DEPLOYMENT_LIMIT);

  const repos = await Promise.all(
    selected.map(async (r, index): Promise<PortfolioRepo> => {
      const [languages, deployment] = await Promise.all([
        fetchLanguages(r.owner.login, r.name),
        index < deploymentLimit
          ? fetchDeployment(r.owner.login, r.name)
          : Promise.resolve(null),
      ]);
      return {
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage && r.homepage.trim() ? r.homepage.trim() : null,
        language: r.language,
        languages,
        topics: r.topics ?? [],
        stars: r.stargazers_count,
        forks: r.forks_count,
        watchers: r.watchers_count,
        openIssues: r.open_issues_count,
        pushedAt: r.pushed_at,
        createdAt: r.created_at,
        isArchived: r.archived,
        hasPages: r.has_pages,
        pagesUrl: pagesUrlFor(r),
        deployment,
      };
    }),
  );

  return { username, repos, error: null };
}

export { LANGUAGE_COLORS, languageColor } from "./languages";
