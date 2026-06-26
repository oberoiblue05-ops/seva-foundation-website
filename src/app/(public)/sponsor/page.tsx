import type { Metadata } from "next";
import SponsorContent from "./_SponsorContent";

export const metadata: Metadata = {
  title: "Sponsor a Child | Rs.500/month | Seva Group Foundation NGO",
  description:
    "Sponsor an orphaned or semi-orphan child for just Rs.500/month. Provides meals, education, and care. 80G tax exempt. Seva Group Foundation, Noida.",
  keywords: [
    "sponsor a child India",
    "child sponsorship NGO",
    "orphan sponsorship Noida",
    "Rs 500 child sponsor",
    "80G child sponsorship",
    "Seva Group Foundation sponsor",
  ],
  openGraph: {
    title: "Sponsor a Child | Rs.500/month | Seva Group Foundation NGO",
    description:
      "Rs.500/month sponsors an orphaned child's meals, education, and care. 80G tax exempt. Seva Group Foundation, Noida.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function SponsorPage() {
  return <SponsorContent />;
}
