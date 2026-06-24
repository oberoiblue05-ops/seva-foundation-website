import type { Metadata } from "next";
import VolunteerContent from "./_VolunteerContent";

export const metadata: Metadata = {
  title: "Volunteer | Seva Group Foundation",
  description:
    "Join 200+ volunteers making a difference in Noida Extension. Register as an on-site, events, or remote skills volunteer with Seva Group Foundation.",
  openGraph: {
    title: "Volunteer with Seva Group Foundation",
    description: "Join food camps, education drives, medical camps and tree plantations in Noida, UP.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function VolunteerPage() {
  return <VolunteerContent />;
}
