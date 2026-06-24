"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #071a0e 0%, #0F3D22 60%, #1B5E37 100%)" }}
      >
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/20 border border-red-400/30 mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-white/60 mb-8">
            An unexpected error occurred. Our team has been notified.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => reset()}
              className="bg-[#F5A623] text-[#1B5E37] font-bold rounded-full px-6 py-2.5 hover:bg-[#F7BA57] transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="border border-white/30 text-white rounded-full px-6 py-2.5 hover:bg-white/10 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
