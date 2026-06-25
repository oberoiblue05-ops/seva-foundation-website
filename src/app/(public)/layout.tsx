import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import ScrollProgressBar from "@/components/ScrollProgressBar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollProgressBar />
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
