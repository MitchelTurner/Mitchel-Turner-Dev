import Image from "next/image";
import { EXTERNAL_SITES, type ExternalSite } from "@/lib/externalSites";
import { ogSiteImageUrl } from "@/lib/format";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ExternalSiteCard({ site }: { site: ExternalSite }) {
  const live = Boolean(site.url?.trim());
  const host = live && site.url ? hostname(site.url) : null;
  const coverSrc = site.image ?? ogSiteImageUrl(site);

  const body = (
    <>
      <div className="relative aspect-[1200/630] w-full overflow-hidden bg-black/40">
        <Image
          src={coverSrc}
          alt={`${site.name} graphic`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`object-cover transition duration-500${live ? " group-hover:scale-[1.03]" : ""}`}
          unoptimized
        />
        {live ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        ) : (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70 ring-1 ring-white/20 backdrop-blur">
            Coming soon
          </span>
        )}
        {site.year && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/70 ring-1 ring-white/15 backdrop-blur">
            {site.year}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{site.name}</h3>
            {site.role && (
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-white/50 ring-1 ring-white/10">
                {site.role}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-white/55">
            {site.description}
          </p>
        </div>

        {site.tags && site.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {site.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-white/45"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3 text-sm">
          {live && host ? (
            <>
              <span className="truncate text-white/50">{host}</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-cyan-300">
                Visit site
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </>
          ) : (
            <span className="text-white/40">Not launched yet</span>
          )}
        </div>
      </div>
    </>
  );

  if (live && site.url) {
    return (
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col overflow-hidden rounded-2xl glass transition hover:border-white/20 hover:shadow-2xl hover:shadow-cyan-500/10"
      >
        {body}
      </a>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl glass">
      {body}
    </div>
  );
}

export function ExternalSites() {
  if (EXTERNAL_SITES.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/70">
          Source not on GitHub
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Other <span className="text-gradient">sites</span>
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-white/55">
          Live projects whose code lives in private repositories or closed
          platforms — not shown in the GitHub grid above.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {EXTERNAL_SITES.map((site) => (
          <ExternalSiteCard key={site.name} site={site} />
        ))}
      </div>
    </section>
  );
}
