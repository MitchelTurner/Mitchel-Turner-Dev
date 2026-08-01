"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID } from "@/lib/analytics";

function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    // Re-config on client navigations so GA4 + Ads get SPA page views.
    window.gtag("config", GA_MEASUREMENT_ID, { page_path: pagePath });
    window.gtag("config", GOOGLE_ADS_ID, { page_path: pagePath });
  }, [pathname, searchParams]);

  return null;
}

/** Google Analytics (GA4) + Google Ads tags site-wide. */
export function GoogleTag() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsRouteTracker />
      </Suspense>
    </>
  );
}

/** @deprecated Use GOOGLE_ADS_ID from @/lib/analytics */
export { GOOGLE_ADS_ID };
