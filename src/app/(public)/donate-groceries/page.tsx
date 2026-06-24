import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate Groceries | Seva Group Foundation",
  description:
    "Donate groceries or pledge for our monthly grocery drives. Help feed orphaned children and elderly in Noida Extension, UP.",
  openGraph: {
    title: "Donate Groceries | Seva Group Foundation",
    description: "Pledge groceries for our monthly drives feeding orphans and elderly in Noida.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function DonateGroceriesPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl font-bold text-primary">Donate Groceries</h1>
        {/* Drive schedule */}
        {/* Pledge form */}
      </div>
    </main>
  );
}
