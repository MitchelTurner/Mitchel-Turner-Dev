/**
 * Curated list of live websites whose source code is NOT public on GitHub.
 *
 * The GitHub-synced "Live work" grid can only show repositories that are
 * public. Use this list for client projects, private repos, or sites built on
 * closed platforms — anything you want to showcase without linking to source.
 *
 * To add a site, copy one of the entries below and edit the fields. The
 * section on the homepage hides itself automatically when this list is empty.
 */
export type ExternalSite = {
  /** Display name of the site or project. */
  name: string;
  /** One or two sentences describing what it is. */
  description: string;
  /**
   * Public URL of the live site. Omit (or leave empty) for projects that are
   * not launched yet — the card stays visible without Visit/Live links.
   */
  url?: string;
  /** Optional short label, e.g. "Client project" or "Freelance". */
  role?: string;
  /** Optional tech / topic tags shown as chips. */
  tags?: string[];
  /** Optional year or short date shown on the card, e.g. "2025". */
  year?: string;
  /**
   * Optional cover image path (served from /public).
   * Prefer leaving this unset — cards use the same generated OG art as Live Work
   * (`/api/og/site`) so the two grids stay visually consistent.
   */
  image?: string;
};

export const EXTERNAL_SITES: ExternalSite[] = [
  {
    name: "Port of Ketchikan",
    description:
      "Online boat moorage and harbor registration for the City of Ketchikan's Port & Harbors. Boaters register a vessel and pay moorage across Ketchikan's small-boat harbors online — no trip to the harbor office required.",
    role: "Client project",
    tags: ["Web app", "Online payments", "Municipal"],
    year: "2026",
  },
];
