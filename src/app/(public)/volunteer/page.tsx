import type { Metadata } from "next";
import VolunteerContent from "./_VolunteerContent";

export const metadata: Metadata = {
  title: "Volunteer With Seva Group Foundation | NGO Noida",
  description:
    "Join 200+ volunteers making a difference in Noida. On-site, events, or remote skills. Register as a volunteer for Seva Group Foundation today.",
  keywords: [
    "volunteer NGO Noida",
    "volunteer India NGO",
    "volunteer opportunity UP",
    "NGO volunteering Noida Extension",
    "Seva Group Foundation volunteer",
  ],
  openGraph: {
    title: "Volunteer With Seva Group Foundation | NGO Noida",
    description:
      "Join food camps, education drives, and medical camps in Noida Extension. On-site, events, and remote volunteering — all welcome.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function VolunteerPage() {
  return <VolunteerContent />;
}
