import type { Metadata } from "next";
import ServicesContent from "./_ServicesContent";

export const metadata: Metadata = {
  title: "Our Services | Seva Group Foundation",
  description:
    "Explore Seva Group Foundation's 13 service areas: orphan care, old-age homes, street children, education, food relief, medical camps, tree plantation, widow support, and more.",
  openGraph: {
    title: "Our Services | Seva Group Foundation",
    description:
      "13 service areas including orphan care, food relief, education, medical support, and more.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function ServicesPage() {
  return <ServicesContent />;
}
