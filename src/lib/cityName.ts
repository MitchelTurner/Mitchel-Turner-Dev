/**
 * Drop the city name from copy shown on the site.
 * GitHub repo slugs and live demo hosts are left unchanged so links still open.
 */
const CITY = /ketchikan/gi;

export function omitCityName(text: string): string {
  let value = text.replace(/\bketchikan\s*,\s*(?:alaska|ak)\b/gi, "Alaska");
  value = value.replace(/\bof\s+ketchikan(?:['’]s)?\b/gi, "");
  value = value.replace(CITY, "");
  value = value
    .replace(/(^|[\s(])['’]s\b/g, "$1")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/\bfrom\s+by\b/gi, "by")
    .replace(/\b(?:in|from|of|for|the)\s+\./gi, ".")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,.;:\-–—·/]+|[\s,;:\-–—·/]+$/g, "")
    .trim();
  return value;
}

/** Visible repo title. An empty result (the name was only the city) becomes "Project". */
export function displayRepoName(name: string): string {
  return omitCityName(name) || "Project";
}

export function displayCopy(text: string | null | undefined, empty = ""): string {
  if (!text) return empty;
  return omitCityName(text) || empty;
}
