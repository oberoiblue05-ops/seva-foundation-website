import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Seva Group Foundation | Nourishing Lives, Building Futures",
  description:
    "Registered NGO in Noida, UP serving orphaned children, semi-orphans, cancer families, widows, street children, and the elderly since 2018. Donate, volunteer, or sponsor a child today.",
  keywords: [
    "NGO Noida",
    "donate India",
    "orphan support UP",
    "sponsor a child India",
    "volunteer Noida",
    "charity NCR",
    "Seva Group Foundation",
    "80G tax exemption donation",
  ],
  openGraph: {
    title: "Seva Group Foundation — Nourishing Lives, Building Futures",
    description:
      "Serving orphaned children, widows & the elderly in NCR since 2018. Donate, volunteer, or sponsor a child.",
    images: [{ url: "/og-home.jpg", width: 1200, height: 630 }],
  },
};

// Section skeleton — used as loading placeholder for dynamic imports
function SectionSkeleton({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`h-80 animate-pulse ${dark ? "bg-[#0F3D22]" : "bg-gray-100"}`}
      aria-hidden="true"
    />
  );
}

// HeroSection: SSR on — it's above the fold and should not cause layout shift
const HeroSection = dynamic(() => import("@/components/home/HeroSection"), {
  loading: () => <SectionSkeleton dark />,
});

const ImpactCounters = dynamic(() => import("@/components/home/ImpactCounters"), {
  loading: () => <SectionSkeleton dark />,
});

const MissionSection = dynamic(() => import("@/components/home/MissionSection"), {
  loading: () => <SectionSkeleton />,
});

const LatestActivities = dynamic(() => import("@/components/home/LatestActivities"), {
  loading: () => <SectionSkeleton dark />,
});

const YouTubeSection = dynamic(() => import("@/components/home/YouTubeSection"), {
  loading: () => <SectionSkeleton dark />,
});

const DonationCTA = dynamic(() => import("@/components/home/DonationCTA"), {
  loading: () => <SectionSkeleton dark />,
});

const SocialMediaSection = dynamic(() => import("@/components/home/SocialMediaSection"), {
  loading: () => <SectionSkeleton />,
});

const TestimonialsSection = dynamic(() => import("@/components/home/TestimonialsSection"), {
  loading: () => <SectionSkeleton />,
});

const PartnerLogos = dynamic(() => import("@/components/home/PartnerLogos"), {
  loading: () => <SectionSkeleton />,
});

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "NGO",
  "name": "Seva Group Foundation",
  "url": "https://sevagroupfdn.org",
  "logo": "https://sevagroupfdn.org/icon-512.png",
  "telephone": "+918287061147",
  "email": "contact@sevagroupfdn.org",
  "sameAs": [
    "https://www.facebook.com/sevagroupfdn",
    "https://www.instagram.com/sevagroupfdn",
    "https://twitter.com/sevagroupfdn",
    "https://www.youtube.com/@sevagroupfdn",
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Street No.3, Block D, Saraswati Kunj",
    "addressLocality": "Noida Extension",
    "addressRegion": "Uttar Pradesh",
    "postalCode": "201308",
    "addressCountry": "IN",
  },
};

export default function HomePage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <HeroSection />
      <ImpactCounters />
      <MissionSection />
      <LatestActivities />
      <YouTubeSection />
      <DonationCTA />
      <SocialMediaSection />
      <TestimonialsSection />
      <PartnerLogos />
    </main>
  );
}
