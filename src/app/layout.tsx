import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
  title: "Seva Group Foundation — Changing Lives, One Step at a Time",
  description:
    "Seva Group Foundation is a registered NGO in Noida, UP, India dedicated to supporting orphans, senior citizens, street children, widows, and underprivileged communities.",
  keywords: [
    "NGO India",
    "Seva Group Foundation",
    "donate India",
    "orphan support Noida",
    "charity UP India",
  ],
  metadataBase: new URL("https://sevagroupfdn.org"),
  openGraph: {
    title: "Seva Group Foundation",
    description: "Registered NGO helping children, elders & communities in Noida, UP.",
    url: "https://sevagroupfdn.org",
    siteName: "Seva Group Foundation",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-text">{children}</body>
    </html>
  );
}
