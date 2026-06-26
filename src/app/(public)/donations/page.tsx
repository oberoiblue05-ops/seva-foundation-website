import type { Metadata } from "next";
import DonationsContent from "./_DonationsContent";

export const metadata: Metadata = {
  title: "Donate to Seva Group Foundation | NGO Noida | 80G Tax Exempt",
  description:
    "Donate to Seva Group Foundation — registered NGO in Noida UP. Support orphan care, food relief, education, and medical camps. 80G tax exemption. One-time or monthly via Razorpay UPI/card.",
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
      "Support orphan care, food relief, cancer families, education & more. 80G tax exemption available. Donate via UPI or card.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function DonationsPage() {
  return <DonationsContent />;
}
