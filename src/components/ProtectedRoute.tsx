"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (adminOnly && !isAdmin) {
      router.replace("/");
    }
  }, [user, loading, isAdmin, adminOnly, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FBF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E37] border-t-transparent" />
          <p className="text-sm text-[#1A1A1A]/50">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (adminOnly && !isAdmin) return null;

  return <>{children}</>;
}
