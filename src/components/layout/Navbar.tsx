"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Home, Users, Heart, BookOpen, Utensils, Stethoscope,
  TreePine, UserCheck, Gift, HeartHandshake, Shield, Ribbon,
  Lock, ChevronDown, Menu, X, MessageCircle, HandHeart, ShoppingBasket, Briefcase,
} from "lucide-react";
import { SERVICES, WHATSAPP_LINK } from "@/constants";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Home, Users, Heart, BookOpen, Utensils, Stethoscope,
  TreePine, UserCheck, Gift, HeartHandshake, Shield, Ribbon, Lock,
};

const DONATE_LINKS = [
  { label: "💰 Donate Money",    href: "/donations",        icon: Gift },
  { label: "👶 Sponsor a Child", href: "/sponsor",          icon: Heart },
  { label: "🛒 Donate Groceries",href: "/donate-groceries", icon: ShoppingBasket },
  { label: "🤝 Volunteer",       href: "/volunteer",        icon: HandHeart },
];

const GET_INVOLVED_LINKS = [
  { label: "🤝 Volunteer With Us",  href: "/volunteer",        icon: HandHeart },
  { label: "👶 Sponsor a Child",    href: "/sponsor",          icon: Heart },
  { label: "🛒 Donate Groceries",   href: "/donate-groceries", icon: ShoppingBasket },
  { label: "🏢 Corporate CSR",      href: "/csr",              icon: Briefcase },
];

const NAV_ITEMS = [
  { label: "Home",          href: "/" },
  { label: "About",         href: "/about" },
  { label: "Services",      href: "#", hasDropdown: "services"  as const },
  { label: "Gallery",       href: "/gallery" },
  { label: "Blog",          href: "/news" },
  { label: "Get Involved",  href: "#", hasDropdown: "involved"  as const },
  { label: "Donate",        href: "#", hasDropdown: "donate"    as const },
  { label: "Contact",       href: "/contact" },
];

const mobileContainerV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

const mobileItemV: Variants = {
  hidden: { opacity: 0, x: 16 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.24 } },
};

export default function Navbar() {
  const pathname  = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"services" | "donate" | "involved" | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const openDropdown = (key: "services" | "donate" | "involved") => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(key);
  };

  const closeDropdown = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const { user, signOut } = useAuth();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[rgba(10,46,25,0.92)] backdrop-blur-[22px] shadow-xl shadow-[#0a2e19]/30"
            : "bg-[#1B5E37]"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2.5 shrink-0">
              <div className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(245,166,35,0.6)]">
                <Image
                  src="/seva-logo.png"
                  alt="Seva Group Foundation"
                  width={44}
                  height={44}
                  className="rounded-full"
                  priority
                />
              </div>
              <span className="font-heading text-lg font-bold text-white leading-tight">
                Seva Group<br />
                <span className="text-[#F5A623] text-sm font-medium font-sans tracking-wide">Foundation</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_ITEMS.map((navItem) => (
                <div
                  key={navItem.label}
                  className="relative"
                  onMouseEnter={() => navItem.hasDropdown && openDropdown(navItem.hasDropdown as "services" | "donate" | "involved")}
                  onMouseLeave={() => navItem.hasDropdown && closeDropdown()}
                >
                  {navItem.hasDropdown ? (
                    <button
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        "text-white/90 hover:text-white hover:bg-white/10",
                        activeDropdown === navItem.hasDropdown && "bg-white/10 text-white"
                      )}
                    >
                      {navItem.label}
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform duration-200",
                          activeDropdown === navItem.hasDropdown && "rotate-180"
                        )}
                      />
                    </button>
                  ) : (
                    <div className="relative">
                      {/* Gold dot above active link */}
                      {isActive(navItem.href) && (
                        <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#F5A623]" />
                      )}
                      <Link
                        href={navItem.href}
                        className={cn(
                          "nav-underline flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          isActive(navItem.href)
                            ? "text-[#F5A623]"
                            : "text-white/90 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {navItem.label}
                      </Link>
                    </div>
                  )}

                  {/* Services dropdown */}
                  <AnimatePresence>
                    {navItem.hasDropdown === "services" && activeDropdown === "services" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[680px] rounded-2xl glass-light shadow-2xl p-4 border border-white/20"
                        onMouseEnter={() => openDropdown("services")}
                        onMouseLeave={closeDropdown}
                      >
                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3 px-2">
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

                  {/* Get Involved dropdown */}
                  <AnimatePresence>
                    {navItem.hasDropdown === "involved" && activeDropdown === "involved" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 rounded-2xl glass-light shadow-2xl p-2 border border-white/20"
                        onMouseEnter={() => openDropdown("involved")}
                        onMouseLeave={closeDropdown}
                      >
                        {GET_INVOLVED_LINKS.map((d) => (
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

                  {/* Donate dropdown */}
                  <AnimatePresence>
                    {navItem.hasDropdown === "donate" && activeDropdown === "donate" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl glass-light shadow-2xl p-2 border border-white/20"
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

              {/* Pulsing Donate Now button */}
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-[#F5A623] animate-ping-slow pointer-events-none" />
                <Link
                  href="/donations"
                  className="relative flex items-center gap-1.5 btn-gold text-[#1B5E37] font-bold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-[#F5A623]/30"
                >
                  Donate Now
                </Link>
              </div>
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

              {/* Staggered nav items */}
              <motion.nav
                variants={mobileContainerV}
                initial="hidden"
                animate="show"
                className="p-4 space-y-1"
              >
                <motion.div variants={mobileItemV}>
                  <MobileLink href="/" label="Home" active={isActive("/")} />
                </motion.div>
                <motion.div variants={mobileItemV}>
                  <MobileLink href="/about" label="About Us" active={isActive("/about")} />
                </motion.div>

                {/* Services */}
                <motion.div variants={mobileItemV} className="pt-2 pb-1">
                  <p className="text-[#F5A623] text-xs font-bold uppercase tracking-widest px-3 mb-2">
                    Services
                  </p>
                  <div className="grid grid-cols-1 gap-0.5">
                    {SERVICES.map((s) => {
                      const Icon = ICON_MAP[s.icon] ?? Gift;
                      return (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-sm transition-colors min-h-[44px]"
                        >
                          <Icon size={14} className="text-[#F5A623] shrink-0" />
                          {s.title}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div variants={mobileItemV}>
                  <MobileLink href="/gallery" label="Gallery" active={isActive("/gallery")} />
                </motion.div>
                <motion.div variants={mobileItemV}>
                  <MobileLink href="/news" label="Blog" active={isActive("/news")} />
                </motion.div>

                <motion.div variants={mobileItemV} className="pt-2 pb-1">
                  <p className="text-[#F5A623] text-xs font-bold uppercase tracking-widest px-3 mb-2">
                    Get Involved
                  </p>
                  {GET_INVOLVED_LINKS.map((d) => (
                    <Link
                      key={d.href}
                      href={d.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-sm transition-colors min-h-[44px]"
                    >
                      <d.icon size={14} className="text-[#F5A623] shrink-0" />
                      {d.label}
                    </Link>
                  ))}
                </motion.div>

                <motion.div variants={mobileItemV} className="pt-1 pb-1">
                  <p className="text-[#F5A623] text-xs font-bold uppercase tracking-widest px-3 mb-2">
                    Donate
                  </p>
                  {DONATE_LINKS.map((d) => (
                    <Link
                      key={d.href}
                      href={d.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-sm transition-colors min-h-[44px]"
                    >
                      <d.icon size={14} className="text-[#F5A623] shrink-0" />
                      {d.label}
                    </Link>
                  ))}
                </motion.div>
                <motion.div variants={mobileItemV}>
                  <MobileLink href="/contact" label="Contact" active={isActive("/contact")} />
                </motion.div>
              </motion.nav>

              <div className="p-4 border-t border-white/10">
                <Link
                  href="/donations"
                  className="flex items-center justify-center w-full btn-gold text-[#1B5E37] font-bold py-3.5 rounded-full text-sm min-h-[48px]"
                >
                  Donate Now
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center w-full mt-3 border border-white/20 text-white py-3 rounded-full text-sm hover:bg-white/10 transition-colors min-h-[48px]"
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
                    className="flex items-center justify-center w-full mt-3 border border-white/20 text-white py-3 rounded-full text-sm hover:bg-white/10 transition-colors min-h-[48px]"
                  >
                    Login
                  </Link>
                )}
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-3 border border-white/20 text-white py-3 rounded-full text-sm hover:bg-white/10 transition-colors min-h-[48px]"
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
        "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center",
        active
          ? "bg-white/15 text-[#F5A623]"
          : "text-white/80 hover:text-white hover:bg-white/10"
      )}
    >
      {label}
    </Link>
  );
}
