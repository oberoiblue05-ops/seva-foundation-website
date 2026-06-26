import type { Metadata } from "next";
import CSRContent from "./_CSRContent";

export const metadata: Metadata = {
  title: "Corporate CSR Partnership | Seva Group Foundation NGO Noida",
  description:
    "Fulfil your Section 135 CSR obligation with Seva Group Foundation. Silver, Gold, Platinum tiers. 80G certified. Impact reports provided quarterly.",
  keywords: [
    "CSR partnership India",
    "Section 135 CSR NGO",
    "corporate CSR Noida",
    "80G CSR tax exemption",
    "Seva Group Foundation CSR",
    "NGO corporate partnership UP",
  ],
  openGraph: {
    title: "Corporate CSR Partnership | Seva Group Foundation NGO Noida",
    description:
      "Fulfil Section 135 CSR with Silver, Gold, or Platinum tiers. 80G certified, quarterly impact reports, co-branding. Registered NGO, Noida.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function CSRPage() {
  return <CSRContent />;
}
