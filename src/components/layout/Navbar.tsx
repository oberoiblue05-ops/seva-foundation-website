"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Users, Heart, BookOpen, Utensils, Stethoscope,
  TreePine, UserCheck, Gift, HeartHandshake, Shield, Ribbon,
  Lock, ChevronDown, Menu, X, MessageCircle,
} from "lucide-react";
import { SERVICES, WHATSAPP_LINK } from "@/constants";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Home, Users, Heart, BookOpen, Utensils, Stethoscope,
  TreePine, UserCheck, Gift, HeartHandshake, Shield, Ribbon, Lock,
};

const DONATE_LINKS = [
  { label: "Donate Money", href: "/donations", icon: Gift },
  { label: "Sponsor a Child", href: "/sponsor", icon: Heart },
  { label: "Donate Groceries", href: "/donate-groceries", icon: Utensils },
  { label: "Corporate CSR", href: "/csr", icon: Users },
];

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "#", hasDropdown: "services" as const },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/news" },
  { label: "Donate", href: "#", hasDropdown: "donate" as const },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"services" | "donate" | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const openDropdown = (key: "services" | "donate") => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(key);
  };

  const closeDropdown = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const { user, signOut } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[rgba(15,61,34,0.85)] backdrop-blur-[20px] shadow-lg"
            : "bg-[#1B5E37]"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-[#F5A623]">
                <LeafIcon />
              </span>
              <span className="font-heading text-lg font-bold text-white leading-tight">
                Seva Group<br />
                <span className="text-[#F5A623] text-sm font-medium font-sans tracking-wide">Foundation</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && openDropdown(item.hasDropdown)}
                  onMouseLeave={() => item.hasDropdown && closeDropdown()}
                >
                  {item.hasDropdown ? (
                    <button
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        "text-white/90 hover:text-white hover:bg-white/10",
                        activeDropdown === item.hasDropdown && "bg-white/10 text-white"
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform duration-200",
                          activeDropdown === item.hasDropdown && "rotate-180"
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "text-[#F5A623] border-b-2 border-[#F5A623] rounded-none"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {item.label}
                    </Link>
                  )}

                  {/* Services dropdown */}
                  <AnimatePresence>
                    {item.hasDropdown === "services" && activeDropdown === "services" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[680px] rounded-2xl glass-light shadow-2xl p-4 border border-white/20"
                        onMouseEnter={() => openDropdown("services")}
                        onMouseLeave={closeDropdown}
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 px-2">
                          Our Services
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                          {SERVICES.map((service) => {
                            const Icon = ICON_MAP[service.icon] ?? Gift;
                            return (
                              <Link
                                key={service.slug}
                                href={`/services/${service.slug}`}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors group"
                              >
                                <Icon size={15} className="text-primary shrink-0 group-hover:text-accent transition-colors" />
                                <span className="text-sm text-text/80 group-hover:text-primary transition-colors">
                                  {service.title}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Donate dropdown */}
                  <AnimatePresence>
                    {item.hasDropdown === "donate" && activeDropdown === "donate" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-2xl glass-light shadow-2xl p-2 border border-white/20"
                        onMouseEnter={() => openDropdown("donate")}
                        onMouseLeave={closeDropdown}
                      >
                        {DONATE_LINKS.map((d) => (
                          <Link
                            key={d.href}
                            href={d.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors group"
                          >
                            <d.icon size={16} className="text-primary group-hover:text-accent transition-colors" />
                            <span className="text-sm text-text/80 group-hover:text-primary">{d.label}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-[#25D366] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-white/80 hover:text-white text-sm font-medium transition-colors px-3 py-2 rounded-md hover:bg-white/10"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors px-3 py-2 rounded-md hover:bg-white/10"
                >
                  Login
                </Link>
              )}
              <Link
                href="/donations"
                className="flex items-center gap-1.5 bg-[#F5A623] text-[#1B5E37] font-bold text-sm px-5 py-2 rounded-full transition-all hover:scale-105 hover:bg-[#F7BA57] shadow-md"
              >
                Donate Now
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-[#1B5E37] lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="font-heading font-bold text-white">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-white p-1.5 rounded-md hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                <MobileLink href="/" label="Home" active={isActive("/")} />
                <MobileLink href="/about" label="About Us" active={isActive("/about")} />

                {/* Services expanded */}
                <div className="pt-2 pb-1">
                  <p className="text-[#F5A623] text-xs font-semibold uppercase tracking-widest px-3 mb-2">
                    Services
                  </p>
                  <div className="grid grid-cols-1 gap-0.5">
                    {SERVICES.map((s) => {
                      const Icon = ICON_MAP[s.icon] ?? Gift;
                      return (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-sm transition-colors"
                        >
                          <Icon size={14} className="text-[#F5A623] shrink-0" />
                          {s.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <MobileLink href="/gallery" label="Gallery" active={isActive("/gallery")} />
                <MobileLink href="/news" label="Blog" active={isActive("/news")} />

                <div className="pt-2 pb-1">
                  <p className="text-[#F5A623] text-xs font-semibold uppercase tracking-widest px-3 mb-2">
                    Get Involved
                  </p>
                  {DONATE_LINKS.map((d) => (
                    <Link
                      key={d.href}
                      href={d.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-sm transition-colors"
                    >
                      <d.icon size={14} className="text-[#F5A623] shrink-0" />
                      {d.label}
                    </Link>
                  ))}
                </div>

                <MobileLink href="/volunteer" label="Volunteer" active={isActive("/volunteer")} />
                <MobileLink href="/contact" label="Contact" active={isActive("/contact")} />
              </nav>

              <div className="p-4 border-t border-white/10">
                <Link
                  href="/donations"
                  className="flex items-center justify-center w-full bg-[#F5A623] text-[#1B5E37] font-bold py-3 rounded-full text-sm"
                >
                  Donate Now
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center w-full mt-3 border border-white/20 text-white py-2.5 rounded-full text-sm hover:bg-white/10 transition-colors"
                    >
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center justify-center w-full mt-2 text-white/60 hover:text-white py-2 text-sm transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-full mt-3 border border-white/20 text-white py-2.5 rounded-full text-sm hover:bg-white/10 transition-colors"
                  >
                    Login
                  </Link>
                )}
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-3 border border-white/20 text-white py-2.5 rounded-full text-sm hover:bg-white/10 transition-colors"
                >
                  <MessageCircle size={16} />
                  WhatsApp Us
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-white/15 text-[#F5A623]"
          : "text-white/80 hover:text-white hover:bg-white/10"
      )}
    >
      {label}
    </Link>
  );
}

function LeafIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
