import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Seva Group Foundation",
};

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #071a0e 0%, #0F3D22 60%, #1B5E37 100%)" }}
    >
      <div className="text-center max-w-lg">
        <p className="text-[#F5A623] font-bold text-8xl mb-4 leading-none">404</p>
        <h1 className="text-3xl font-bold text-white mb-3 font-heading">Page Not Found</h1>
        <p className="text-white/60 text-lg mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/"
            className="bg-[#F5A623] text-[#1B5E37] font-bold rounded-full px-8 py-3 hover:bg-[#F7BA57] transition-all hover:scale-105 shadow-lg"
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            className="border border-white/30 text-white rounded-full px-8 py-3 hover:bg-white/10 transition-all"
          >
            Contact Us
          </Link>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm">
          {[
            { label: "Donate", href: "/donations" },
            { label: "Volunteer", href: "/volunteer" },
            { label: "Sponsor a Child", href: "/sponsor" },
            { label: "Gallery", href: "/gallery" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-white/50 hover:text-[#F5A623] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
