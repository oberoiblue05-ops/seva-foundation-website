import type { Metadata } from "next";
import ContactContent from "./_ContactContent";

export const metadata: Metadata = {
  title: "Contact Us | Seva Group Foundation",
  description:
    "Get in touch with Seva Group Foundation. WhatsApp, email, or visit us at Saraswati Kunj, Noida Extension, UP 201308.",
  openGraph: {
    title: "Contact Seva Group Foundation",
    description:
      "WhatsApp, email, or visit our centre at Saraswati Kunj, Noida Extension.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function ContactPage() {
  return <ContactContent />;
}
