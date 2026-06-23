"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import {
  Home, Users, Heart, BookOpen, Utensils, Stethoscope,
  TreePine, UserCheck, Gift, HeartHandshake, Shield,
  Activity, Lock, ChevronRight, ArrowRight,
} from "lucide-react";
import { SERVICES } from "@/constants";

// ─── Icon map (icon field in SERVICES is a string name) ────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Home, Users, Heart, BookOpen, Utensils, Stethoscope,
  TreePine, UserCheck, Gift, HeartHandshake, Shield,
  Ribbon: Activity, // Ribbon not available in all versions — fall back to Activity
  Lock,
};

// ─── Variants ──────────────────────────────────────────────────────────────

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const gridRef   = useRef<HTMLDivElement>(null);
  const isInView  = useInView(gridRef, { once: true, amount: 0.1 });

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B5E37] to-[#0F3D22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="mb-5 flex items-center gap-2 text-sm text-white/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Services</span>
          </nav>
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Our Services
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/70">
            13 programmes spanning child welfare, elder care, education, health, and environment —
            rooted in Noida, reaching across NCR.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-[#F9FBF9] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            ref={gridRef}
            variants={stagger}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SERVICES.map((service) => {
              const Icon = ICON_MAP[service.icon] ?? Heart;
              return (
                <motion.div
                  key={service.slug}
                  variants={card}
                  className="glass-light glass-hover group flex flex-col rounded-2xl p-7"
                >
                  {/* Icon */}
                  <div className="mb-5 inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-[#1B5E37]/10 transition-colors group-hover:bg-[#F5A623]/15">
                    <Icon
                      size={26}
                      className="text-[#1B5E37] transition-colors group-hover:text-[#F5A623]"
                    />
                  </div>

                  <h3 className="mb-2 font-heading text-lg font-bold text-[#0F3D22]">
                    {service.title}
                  </h3>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-[#1A1A1A]/65">
                    {service.description}
                  </p>

                  <Link
                    href={`/services/${service.slug}`}
                    className="flex items-center gap-2 text-sm font-semibold text-[#1B5E37] transition-colors group-hover:text-[#F5A623]"
                  >
                    Learn More
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Donation CTA */}
      <section className="bg-[#0F3D22] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Support Any of These Programmes
          </h2>
          <p className="mt-3 text-white/60">
            Your donation goes directly to the programme you care about most.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/donations"
              className="min-w-[160px] rounded-full bg-[#F5A623] px-7 py-3.5 text-sm font-bold text-[#0F3D22] shadow-lg transition-all hover:scale-105"
            >
              Donate Now
            </Link>
            <Link
              href="/volunteer"
              className="min-w-[160px] rounded-full border-2 border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Volunteer
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
