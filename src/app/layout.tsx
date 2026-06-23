import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
    "Registered NGO serving orphaned children, elderly, widows in NCR since 2018. Donate, volunteer or sponsor a child today.",
  keywords: [
    "NGO India",
    "Seva Group Foundation",
    "donate India",
    "orphan support Noida",
    "charity UP India",
    "volunteer Noida",
    "sponsor a child India",
  ],
  metadataBase: new URL("https://sevagroupfdn.org"),
  openGraph: {
    title: "Seva Group Foundation | Nourishing Lives, Building Futures",
    description:
      "Registered NGO serving orphaned children, elderly & widows in NCR since 2018.",
    url: "https://sevagroupfdn.org",
    siteName: "Seva Group Foundation",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seva Group Foundation",
    description: "Registered NGO — Noida UP. Donate, volunteer, or sponsor a child.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-text">
        {children}
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
      </body>
    </html>
  );
}
