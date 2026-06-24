"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Image as ImageIcon, GalleryHorizontal, FileText, Megaphone,
  DollarSign, Users, Heart, ShoppingBasket, Briefcase, Calendar, Settings,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { ReactNode } from "react";

const NAV = [
  { href: "/admin/dashboard",          label: "Dashboard",          Icon: LayoutDashboard  },
  { href: "/admin/media",              label: "Media",              Icon: ImageIcon        },
  { href: "/admin/gallery",            label: "Gallery",            Icon: GalleryHorizontal },
  { href: "/admin/blog",               label: "Blog",               Icon: FileText         },
  { href: "/admin/campaigns",          label: "Campaigns",          Icon: Megaphone        },
  { href: "/admin/donations",          label: "Donations",          Icon: DollarSign       },
  { href: "/admin/volunteers",         label: "Volunteers",         Icon: Users            },
  { href: "/admin/sponsorships",       label: "Sponsorships",       Icon: Heart            },
  { href: "/admin/grocery-drives",     label: "Grocery Drives",     Icon: ShoppingBasket   },
  { href: "/admin/csr",                label: "CSR Inquiries",      Icon: Briefcase        },
  { href: "/admin/festival-campaigns", label: "Festival Campaigns", Icon: Calendar         },
  { href: "/admin/settings",           label: "Settings",           Icon: Settings         },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 z-40 flex flex-col h-screen w-[220px] shrink-0
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ backgroundColor: "#0F3D22" }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div>
            <p className="text-white font-bold text-sm leading-tight">Seva Group</p>
            <p className="text-white/40 text-xs">Admin Console</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group
                  ${active
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/55 hover:text-white hover:bg-white/8"
                  }`}
              >
                <Icon size={16} className={active ? "text-[#F5A623]" : "text-inherit"} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="text-[#F5A623]" />}
              </Link>
            );
          })}
        </nav>

        {/* User + Sign out */}
        <div className="border-t border-white/10 px-3 py-4 space-y-1">
          <div className="px-3 py-2">
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router  = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;
    if (!isLoginPage && (!user || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [user, loading, isAdmin, isLoginPage, router]);

  // Login page renders without sidebar
  if (isLoginPage) return <>{children}</>;

  // Spinner while auth resolves
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#0F3D22" }}>
        <div className="h-10 w-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authorised — redirect in progress
  if (!user || !isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold text-gray-800 flex-1">Admin Panel</span>
          <span className="hidden sm:block text-sm text-gray-400">{user.email}</span>
          <div className="w-8 h-8 rounded-full bg-[#1B5E37] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user.email?.[0]?.toUpperCase() ?? "A"}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
