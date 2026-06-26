import type { Metadata } from "next";
import VolunteerContent from "./_VolunteerContent";

export const metadata: Metadata = {
  title: "Volunteer with Seva Group Foundation | NGO Noida UP",
  description:
    "Volunteer with Seva Group Foundation — registered NGO in Noida UP. Join food camps, education drives, medical camps, and tree plantations. On-site, events, and remote skill volunteering. Join 200+ volunteers.",
  keywords: [
    "volunteer NGO Noida",
    "volunteer India NGO",
    "volunteer opportunity UP",
    "NGO volunteering Noida Extension",
    "Seva Group Foundation volunteer",
  ],
  openGraph: {
    title: "Volunteer with Seva Group Foundation | NGO Noida UP",
    description:
      "Join food camps, education drives, and medical camps in Noida Extension. On-site, events, and remote volunteering — all welcome.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function VolunteerPage() {
  return <VolunteerContent />;
}
