/**
 * Accept only URLs we are willing to store and render as links or images.
 * Relative site paths (uploaded covers) are allowed. Protocol-relative,
 * javascript:, and data: URLs are not.
 */
export function safeHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2000) return null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    if (trimmed.includes("\\") || trimmed.includes("..")) return null;
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname) return null;
    return url.toString();
  } catch {
    return null;
  }
}
