import type { Metadata } from "next";
import DonorWallContent from "./_DonorWallContent";

export const metadata: Metadata = {
  title: "Donor Wall | Seva Group Foundation",
  description:
    "Meet our generous donors who chose to make their contributions public. Every rupee donated transforms lives at Seva Group Foundation, Noida.",
  openGraph: {
    title: "Donor Wall | Seva Group Foundation",
    description:
      "Meet the generous supporters who are transforming lives with Seva Group Foundation.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function DonorWallPage() {
  return <DonorWallContent />;
}
