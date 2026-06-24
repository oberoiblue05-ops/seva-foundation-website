import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsor a Child | Seva Group Foundation",
  description:
    "Sponsor a child for Rs. 500/month. Your support covers meals, school fees, and medical care for orphaned, semi-orphaned, or vulnerable children in Noida, UP.",
  openGraph: {
    title: "Sponsor a Child | Seva Group Foundation",
    description: "Rs. 500/month sponsors a child's meals, school fees, and medical care.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function SponsorPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl font-bold text-primary">Sponsor a Child</h1>
        {/* Child profile cards */}
        {/* Rs.500/month Razorpay flow */}
      </div>
    </main>
  );
}
