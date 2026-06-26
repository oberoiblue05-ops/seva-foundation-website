import type { Metadata } from "next";
import CSRContent from "./_CSRContent";

export const metadata: Metadata = {
  title: "Corporate CSR Partnership | Seva Group Foundation Noida",
  description:
    "Partner with Seva Group Foundation for your CSR obligations in India. Silver, Gold, and Platinum partnership tiers. 80G tax exemption, co-branding, impact reports, and employee volunteering programmes.",
  keywords: [
    "CSR partnership India",
    "corporate CSR NGO",
    "CSR NGO Noida",
    "80G CSR tax exemption",
    "Seva Group Foundation CSR",
    "NGO corporate partnership UP",
  ],
  openGraph: {
    title: "Corporate CSR Partnership | Seva Group Foundation Noida",
    description:
      "Silver, Gold, Platinum CSR tiers with 80G exemption, impact reporting, and co-branding. Partner with a registered NGO in Noida.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function CSRPage() {
  return <CSRContent />;
}
