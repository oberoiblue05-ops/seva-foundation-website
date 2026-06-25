import type { Metadata } from "next";
import DonateGroceriesContent from "./DonateGroceriesContent";

export const metadata: Metadata = {
  title: "Donate Groceries | Seva Group Foundation",
  description:
    "Join our monthly grocery drives in Noida Extension. Pledge dry rations, essential supplies, or donate Rs.200 to buy groceries in bulk for needy families.",
  openGraph: {
    title: "Donate Groceries | Seva Group Foundation",
    description:
      "Monthly grocery drives at our centre in Noida Extension. Drop off or we arrange pickup.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function DonateGroceriesPage() {
  return <DonateGroceriesContent />;
}
