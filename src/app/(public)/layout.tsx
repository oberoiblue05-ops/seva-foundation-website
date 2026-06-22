import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* <Navbar /> */}
      {children}
      {/* <Footer /> */}
      {/* <WhatsAppFAB /> */}
    </>
  );
}
