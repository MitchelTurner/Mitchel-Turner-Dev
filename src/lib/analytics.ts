/** Google Analytics 4 measurement ID */
export const GA_MEASUREMENT_ID = "G-YRDJ09G5DK";

/** Google Ads conversion / remarketing ID */
export const GOOGLE_ADS_ID = "AW-18361474386";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/** Fire on successful lead / contact form submissions. */
export function trackGenerateLead(source?: string): void {
  trackEvent("generate_lead", {
    value: 1.0,
    currency: "USD",
    ...(source ? { lead_source: source } : {}),
  });
  // Ads conversion (destination + event); GA4 also receives generate_lead above.
  trackEvent("conversion", {
    send_to: GOOGLE_ADS_ID,
    value: 1.0,
    currency: "USD",
  });
}

/** Primary CTA clicks (nav, hero, dock, about, etc.). */
export function trackCtaClick(
  ctaLocation: string,
  landingPage?: string,
): void {
  trackEvent("cta_click", {
    cta_location: ctaLocation,
    ...(landingPage ? { landing_page: landingPage } : { landing_page: "site" }),
  });
}

/** First interaction with a lead/contact form (once per page load). */
export function trackFormStart(formId: string, landingPage?: string): void {
  trackEvent("form_start", {
    form_id: formId,
    ...(landingPage ? { landing_page: landingPage } : { landing_page: "site" }),
  });
}

/** Portfolio "View demo" outbound clicks. */
export function trackViewDemo(repoName: string): void {
  trackEvent("view_demo", { repo_name: repoName });
}
