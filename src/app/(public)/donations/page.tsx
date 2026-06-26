import type { Metadata } from "next";
import DonationsContent from "./_DonationsContent";

export const metadata: Metadata = {
  title: "Donate to Seva Group Foundation | NGO Noida | 80G Tax Exempt",
  description:
    "Donate online to Seva Group Foundation. All donations are 80G tax exempt. Support orphaned children, free medical camps, and feeding programmes in Noida.",
  keywords: [
    "donate NGO India",
    "donate Noida",
    "80G tax exemption donation",
    "orphan donation India",
    "Seva Group Foundation donate",
    "UPI donation NGO",
    "charity donation Noida",
  ],
  openGraph: {
    title: "Donate to Seva Group Foundation | NGO Noida | 80G Tax Exempt",
    description:
      "All donations 80G tax exempt. Support orphaned children, medical camps, and feeding programmes in Noida. Razorpay UPI/card.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function DonationsPage() {
  return <DonationsContent />;
}
