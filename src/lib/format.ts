// Compact "time ago" formatter for repo activity timestamps.
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.floor((Date.now() - then) / 1000);
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let value = seconds;
  let unit = "second";
  for (let i = 0; i < units.length; i++) {
    const [size, label] = units[i];
    if (value < size) {
      unit = label;
      break;
    }
    value = Math.floor(value / size);
    unit = label;
  }
  const rounded = Math.max(1, Math.floor(value));
  return `${rounded} ${unit}${rounded === 1 ? "" : "s"} ago`;
}

export function ogImageUrl(repo: {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
}): string {
  const params = new URLSearchParams({
    name: repo.name,
    desc: repo.description ?? "",
    lang: repo.language ?? "",
    stars: String(repo.stars),
    forks: String(repo.forks),
    topics: repo.topics.slice(0, 4).join(","),
  });
  return `/api/og/repo?${params.toString()}`;
}

/** Cover art URL for curated "Other sites" cards — same visual system as Live Work. */
export function ogSiteImageUrl(site: {
  name: string;
  description: string;
  url?: string;
  role?: string;
  tags?: string[];
  year?: string;
}): string {
  let host = "";
  if (site.url) {
    try {
      host = new URL(site.url).hostname.replace(/^www\./, "");
    } catch {
      host = site.url;
    }
  }
  const params = new URLSearchParams({
    name: site.name,
    desc: site.description,
    role: site.role ?? (site.url ? "Live site" : "Coming soon"),
    year: site.year ?? "",
    host,
    tags: (site.tags ?? []).slice(0, 4).join(","),
  });
  return `/api/og/site?${params.toString()}`;
}
