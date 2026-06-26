import type { Metadata } from "next";
import AboutContent from "./_AboutContent";

export const metadata: Metadata = {
  title: "About Seva Group Foundation | Registered NGO Noida Since 2018",
  description:
    "Learn about Seva Group Foundation — a registered NGO in Noida serving orphaned children, elderly, widows, and underprivileged families since 2018.",
  keywords: [
    "Seva Group Foundation about",
    "NGO Noida history",
    "registered NGO UP India",
    "orphan NGO Noida",
    "charity organisation Noida Extension",
  ],
  openGraph: {
    title: "About Seva Group Foundation | Registered NGO Noida Since 2018",
    description:
      "Registered NGO in Noida serving orphaned children, elderly, widows, and underprivileged families since 2018. Our story, vision, and team.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function AboutPage() {
  return <AboutContent />;
}
