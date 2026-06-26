import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import Analytics from "@/components/Analytics";
import FestivalBanner from "@/components/FestivalBanner";
import GoogleAds from "@/components/GoogleAds";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Seva Group Foundation | Nourishing Lives, Building Futures",
    template: "%s | Seva Group Foundation",
  },
  description:
    "Registered NGO in Noida UP serving orphaned children, semi-orphans, cancer families, widows and the elderly since 2018. Donate, volunteer or sponsor a child — 80G tax exemption.",
  keywords: [
    "NGO India",
    "NGO Noida",
    "Seva Group Foundation",
    "donate India",
    "orphan support Noida",
    "charity UP India",
    "volunteer Noida",
    "sponsor a child India",
    "80G tax exemption",
    "cancer family support NGO",
    "semi-orphan support",
    "food donation drive Noida",
  ],
  metadataBase: new URL("https://sevagroupfdn.org"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Seva NGO",
  },
  openGraph: {
    title: "Seva Group Foundation | Nourishing Lives, Building Futures",
    description:
      "Registered NGO serving orphaned children, widows & the elderly in NCR since 2018. 80G tax exempt. Donate, volunteer, or sponsor a child.",
    url: "https://sevagroupfdn.org",
    siteName: "Seva Group Foundation",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seva Group Foundation",
    description: "Registered NGO — Noida UP. Donate, volunteer, or sponsor a child. 80G tax exempt.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B5E37",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-text">
        <FestivalBanner />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1B5E37",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#F5A623", secondary: "#1B5E37" },
            },
            error: {
              style: { background: "#7f1d1d" },
            },
          }}
        />
        <Analytics />
        <GoogleAds />
      </body>
    </html>
  );
}
