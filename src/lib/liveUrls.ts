/**
 * Per-repository public "live demo" URLs.
 *
 * GitHub's Deployments API only exposes the hosting *dashboard* URL (e.g. a
 * `railway.com/project/...` link), not the public production domain. Map each
 * repo name (exactly as it appears on GitHub) to its public site here so the
 * "View demo" button opens the actual live app.
 *
 * Setting the repo's `homepage` field on GitHub achieves the same thing and is
 * picked up automatically — this map overrides that when needed.
 */
export const LIVE_URL_OVERRIDES: Record<string, string> = {
  Concierge: "https://personal-assistant.up.railway.app",
  CRE: "https://greenville-cre.up.railway.app",
  "Creek-Street": "https://creekstreet.org",
  DeadReckoning: "https://captains-schedule-production.up.railway.app",
  "Ebb-Flow": "https://penmanship.up.railway.app",
  "Elfin-Cove": "https://elfin-cove-production.up.railway.app",
  Economy: "https://local-economy.up.railway.app",
  FlagShip: "https://mitchelturner.dev",
  GEX: "https://gex.up.railway.app",
  "GEX-Frontend": "https://gex.up.railway.app",
  GIS: "https://ketchikan-gis.up.railway.app",
  Glasshouse: "https://glasshouse.up.railway.app",
  "Gun-Club": "https://gun-club.up.railway.app",
  Gyotaku: "https://gyotaku.up.railway.app",
  "Mitchel-Turner": "https://mitchelturner.com",
  "Mitchel-Turner-Dev": "https://mitchelturner.dev",
  "Ops-Tool": "https://ops-tool-production.up.railway.app/api/docs",
  Photos: "https://ketchikanphotos.com",
  "Planning-Reference": "https://planning-reference.up.railway.app",
  "Salmon-Run": "https://salmon-ar-production.up.railway.app",
  Throughline: "https://throughline-production.up.railway.app",
  Trails: "https://trails.up.railway.app",
  VERBATIM: "https://verbatim.up.railway.app",
  "Viral-Loops": "https://viral-loops-production.up.railway.app",
  Waterfowl: "https://waterfowl.up.railway.app",
};

/**
 * True when `url` is a public site visitors can open — not a Railway/GitHub
 * dashboard, repo page, or other private hosting console.
 */
export function isPublicLiveUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

  const host = parsed.hostname.toLowerCase();
  // Railway project dashboard (login-gated), not the deployed app.
  if (host === "railway.com" || host === "railway.app" || host === "www.railway.app") {
    return false;
  }
  // GitHub repo / deployments UI — never a live demo.
  if (host === "github.com" || host === "www.github.com") {
    return false;
  }
  return true;
}

/** GitHub homepages are sometimes stored without a scheme (`mitchelturner.com`). */
function withHttpScheme(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("//")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Resolve the best public live-demo URL for a repo.
 * Order: explicit override → GitHub homepage → deployment URL → GitHub Pages.
 * Dashboard / console URLs are discarded.
 */
export function resolveLiveUrl(repo: {
  name: string;
  homepage: string | null;
  pagesUrl: string | null;
  deployment: { url: string | null } | null;
}): string | null {
  const candidates = [
    LIVE_URL_OVERRIDES[repo.name],
    repo.homepage,
    repo.deployment?.url,
    repo.pagesUrl,
  ];
  for (const candidate of candidates) {
    const url = withHttpScheme(candidate);
    if (isPublicLiveUrl(url)) return url;
  }
  return null;
}
