import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSR Partnership | Seva Group Foundation",
  description:
    "Partner with Seva Group Foundation for your CSR obligations. Silver, Gold, and Platinum tiers. 80G tax exemption, impact reports, co-branding, and employee volunteering.",
  openGraph: {
    title: "CSR Partnership | Seva Group Foundation",
    description: "Silver, Gold, Platinum CSR tiers with 80G exemption and impact reporting.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function CSRPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl font-bold text-primary">CSR Partnership</h1>
        {/* Silver / Gold / Platinum tiers */}
        {/* Proposal form */}
        {/* Brochure PDF download */}
      </div>
    </main>
  );
}
