import type { Metadata } from "next";
import ContactContent from "./_ContactContent";

export const metadata: Metadata = {
  title: "Contact Seva Group Foundation | NGO Noida | +91 82870 61147",
  description:
    "Contact Seva Group Foundation in Noida Extension. WhatsApp, email, or call. Mon-Sat 10AM-6PM. Street No.3, Saraswati Kunj, Noida Extension UP 201308.",
  keywords: [
    "contact Seva Group Foundation",
    "NGO Noida contact",
    "charity Noida Extension address",
    "donate Noida contact",
    "volunteer Noida phone",
  ],
  openGraph: {
    title: "Contact Seva Group Foundation | NGO Noida | +91 82870 61147",
    description:
      "WhatsApp us at +91 82870 61147, email contact@sevagroupfdn.org, or visit Street No.3, Saraswati Kunj, Noida Extension UP 201308.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function ContactPage() {
  return <ContactContent />;
}
