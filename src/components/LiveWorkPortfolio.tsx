/**
 * Live Work portfolio — server component rendered on the homepage (/).
 *
 * Resolves the configured GitHub username, fetches normalized repos, and
 * renders a grid of RepoCards. Pass fresh=true to bypass the fetch cache.
 */
import Link from "next/link";
import { fetchPortfolioRepos } from "@/lib/github";
import { resolveGithubUsernameWithSource } from "@/lib/settings";
import { RepoCard } from "@/components/RepoCard";
import { ExternalSites } from "@/components/ExternalSites";

const SOURCE_HINT = {
  database: "admin dashboard",
  env: "GITHUB_USERNAME environment variable",
  config: "github.config.json",
} as const;

export async function LiveWorkPortfolio({
  fresh = false,
}: {
  fresh?: boolean;
}) {
  const resolved = await resolveGithubUsernameWithSource();
  const { username, repos, error } = await fetchPortfolioRepos(48, { fresh });

  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const deployed = repos.filter(
    (r) => r.homepage || r.pagesUrl || r.deployment,
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/70">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
          </span>
          Auto-synced from GitHub
        </span>

        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
          Live <span className="text-gradient">work</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-white/55">
          A portfolio built from{" "}
          {username ? (
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
            >
              @{username}
            </a>
          ) : (
            "my"
          )}{" "}
          public repositories — generated cover art, language breakdowns, and
          live deployment links.
        </p>

        {username && resolved.source && (
          <p className="mt-3 text-xs text-white/40">
            Syncing @{username} via {SOURCE_HINT[resolved.source]}
            {fresh ? " · just refreshed" : " · auto-refreshes every ~2 minutes"}
          </p>
        )}

        {repos.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { label: "repositories", value: repos.length },
              { label: "total stars", value: totalStars },
              { label: "with deployments", value: deployed },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl px-4 py-2">
                <span className="text-lg font-bold text-white">{s.value}</span>{" "}
                <span className="text-sm text-white/50">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {error ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-lg font-medium text-white/80">
            {username ? "Couldn't load repositories" : "No GitHub account linked"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/50">{error}</p>
          {username && (
            <Link
              href="/?fresh=1"
              className="mt-5 inline-flex rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5"
            >
              Try again
            </Link>
          )}
        </div>
      ) : repos.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-lg font-medium text-white/80">
            No public repositories found
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
            @{username} has no public, non-fork repositories to display.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}

      <ExternalSites />
    </div>
  );
}
