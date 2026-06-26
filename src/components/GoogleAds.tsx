"use client";

import Script from "next/script";

export default function GoogleAds() {
  const gadsId = process.env.NEXT_PUBLIC_GADS_ID;

  if (!gadsId || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gadsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gadsId}');
        `}
      </Script>
    </>
  );
}
