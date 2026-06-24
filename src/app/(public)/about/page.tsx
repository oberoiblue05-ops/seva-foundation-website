import type { Metadata } from "next";
import AboutContent from "./_AboutContent";

export const metadata: Metadata = {
  title: "About Us | Seva Group Foundation",
  description:
    "Learn about Seva Group Foundation — our story, mission, team, and the children we serve in Noida, Uttar Pradesh since 2018.",
  openGraph: {
    title: "About Seva Group Foundation",
    description:
      "Our story, vision, team, and the children we serve across Noida Extension, UP.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function AboutPage() {
  return <AboutContent />;
}
