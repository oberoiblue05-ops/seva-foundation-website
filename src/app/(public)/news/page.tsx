import type { Metadata } from "next";
import NewsContent from "./_NewsContent";

export const metadata: Metadata = {
  title: "News & Blog | Seva Group Foundation",
  description:
    "Latest stories, impact reports, and updates from Seva Group Foundation — food camps, education drives, medical camps, and more from Noida, UP.",
  openGraph: {
    title: "News & Blog | Seva Group Foundation",
    description: "Stories, impact reports, and updates from Seva Group Foundation.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function NewsPage() {
  return <NewsContent />;
}
