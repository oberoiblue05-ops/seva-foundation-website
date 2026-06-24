import type { Metadata } from "next";
import DonationsContent from "./_DonationsContent";

export const metadata: Metadata = {
  title: "Donate | Seva Group Foundation",
  description:
    "Donate to Seva Group Foundation and transform lives. One-time and recurring donations via Razorpay UPI. 80G tax exemption available.",
  openGraph: {
    title: "Donate to Seva Group Foundation",
    description:
      "Support orphan care, food relief, education & more. 80G tax exemption. Donate via UPI or card.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function DonationsPage() {
  return <DonationsContent />;
}
