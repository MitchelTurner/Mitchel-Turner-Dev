"use client";

import Image from "next/image";
import { languageColor, type PortfolioRepo } from "@/lib/github";
import { ogImageUrl, timeAgo } from "@/lib/format";
import { resolveLiveUrl } from "@/lib/liveUrls";
import { trackViewDemo } from "@/lib/analytics";

const DEPLOY_STATE: Record<string, { label: string; classes: string; dot: string }> = {
  success: {
    label: "Deployed",
    classes: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
    dot: "bg-emerald-400",
  },
  active: {
    label: "Live",
    classes: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
    dot: "bg-emerald-400",
  },
  in_progress: {
    label: "Deploying",
    classes: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
    dot: "bg-amber-400 animate-pulse",
  },
  pending: {
    label: "Pending",
    classes: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
    dot: "bg-amber-400",
  },
  error: {
    label: "Failed",
    classes: "bg-red-500/15 text-red-300 ring-red-400/30",
    dot: "bg-red-400",
  },
  failure: {
    label: "Failed",
    classes: "bg-red-500/15 text-red-300 ring-red-400/30",
    dot: "bg-red-400",
  },
  inactive: {
    label: "Inactive",
    classes: "bg-slate-500/15 text-slate-300 ring-slate-400/30",
    dot: "bg-slate-400",
  },
};

function ExternalLink({
  href,
  children,
  primary,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
        primary
          ? "bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-300 text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
      }`}
    >
      {children}
    </a>
  );
}

export function RepoCard({ repo }: { repo: PortfolioRepo }) {
  // Public live demo only — never Railway/GitHub dashboard URLs.
  const liveUrl = resolveLiveUrl(repo);
  const deployState = repo.deployment
    ? (DEPLOY_STATE[repo.deployment.state] ?? DEPLOY_STATE.active)
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl glass transition hover:border-white/20 hover:shadow-2xl hover:shadow-cyan-500/10">
      <div className="relative aspect-[1200/630] w-full overflow-hidden bg-black/40">
        <Image
          src={ogImageUrl(repo)}
          alt={`${repo.name} graphic`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          unoptimized
        />
        {(deployState || liveUrl) && (
          <span
            className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 backdrop-blur ${
              deployState
                ? deployState.classes
                : "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${deployState ? deployState.dot : "bg-emerald-400"}`}
            />
            {deployState
              ? `${deployState.label}${repo.deployment?.environment ? ` · ${repo.deployment.environment}` : ""}`
              : "Live"}
          </span>
        )}
        {repo.isArchived && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/70 ring-1 ring-white/15 backdrop-blur">
            Archived
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-white/55">
            {repo.description ?? "No description provided."}
          </p>
        </div>

        {repo.languages.length > 0 && (
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            {repo.languages.map((l) => (
              <div
                key={l.name}
                title={`${l.name} ${l.percent}%`}
                style={{
                  width: `${l.percent}%`,
                  backgroundColor: languageColor(l.name),
                }}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/50">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: languageColor(repo.language) }}
              />
              {repo.language}
            </span>
          )}
          <span className="inline-flex items-center gap-1">★ {repo.stars}</span>
          <span className="inline-flex items-center gap-1">⑂ {repo.forks}</span>
          <span className="ml-auto">Updated {timeAgo(repo.pushedAt)}</span>
        </div>

        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-white/45"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 border-t border-white/5 pt-3">
          {liveUrl && (
            <ExternalLink
              href={liveUrl}
              primary
              onClick={() => trackViewDemo(repo.name)}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
              View demo
            </ExternalLink>
          )}
          <ExternalLink href={repo.url}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
            </svg>
            Code
          </ExternalLink>
        </div>
      </div>
    </article>
  );
}
