import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Volunteer | Seva Group Foundation",
  description:
    "Volunteer with Seva Group Foundation in Noida, UP. Join food camps, education drives, medical camps, tree plantations, and more.",
  openGraph: {
    title: "Volunteer | Seva Group Foundation",
    description: "Join food camps, education drives, and medical camps in Noida, UP.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function VolunteerPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl font-bold text-primary">Volunteer With Us</h1>
        {/* Landing section */}
        {/* Registration form */}
      </div>
    </main>
  );
}
