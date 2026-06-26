"use client";

import Script from "next/script";

export default function GoogleAds() {
  const gadsId = process.env.NEXT_PUBLIC_GADS_ID;
  const ga4Id  = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (process.env.NODE_ENV !== "production") return null;
  if (!gadsId && !ga4Id) return null;

  const primaryId = ga4Id || gadsId!;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${ga4Id  ? `gtag('config', '${ga4Id}');`  : ""}
          ${gadsId ? `gtag('config', '${gadsId}');` : ""}
        `}
      </Script>
    </>
  );
}
