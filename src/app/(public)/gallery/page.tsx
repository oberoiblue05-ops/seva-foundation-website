import type { Metadata } from "next";
import GalleryContent from "./_GalleryContent";

export const metadata: Metadata = {
  title: "Gallery | Seva Group Foundation",
  description:
    "Photo gallery of Seva Group Foundation's activities — food camps, education drives, medical camps, tree plantations, and more.",
  openGraph: {
    title: "Gallery | Seva Group Foundation",
    description: "Photos from our food camps, education drives, and community events.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function GalleryPage() {
  return <GalleryContent />;
}
