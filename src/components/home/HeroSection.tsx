"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Play, Heart, Utensils, Stethoscope, TreePine } from "lucide-react";
import { IMPACT_STATS } from "@/constants";

const BADGES = [
  { Icon: Heart,       value: `${IMPACT_STATS.children}+`,                   label: "Children Served" },
  { Icon: Utensils,    value: `${(IMPACT_STATS.meals / 1000).toFixed(1)}K+`, label: "Meals Provided"  },
  { Icon: Stethoscope, value: `${IMPACT_STATS.camps}+`,                      label: "Medical Camps"   },
  { Icon: TreePine,    value: `${IMPACT_STATS.trees}+`,                      label: "Trees Planted"   },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#081F0F] via-[#1B5E37] to-[#2A6B45]">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#F5A623]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0F3D22]/60 blur-3xl" />
        <svg className="absolute right-8 top-8 h-64 w-64 text-white/[0.04]" viewBox="0 0 200 200" fill="currentColor">
          <path d="M100 10C150 10 190 50 190 100c0 50-40 90-90 90C100 150 60 120 20 100c40-20 80-50 80-90z" />
        </svg>
        <svg className="absolute bottom-12 left-8 h-48 w-48 rotate-180 text-white/[0.03]" viewBox="0 0 200 200" fill="currentColor">
          <path d="M100 10C150 10 190 50 190 100c0 50-40 90-90 90C100 150 60 120 20 100c40-20 80-50 80-90z" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
        {/* Top pill */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-white/90 backdrop-blur-sm"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#F5A623]" />
          Registered NGO · Noida, UP · Serving Since 2018
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
          className="mb-6 font-heading text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-[4.25rem]"
        >
          Transforming Lives,
          <br />
          One Act of{" "}
          <em className="not-italic text-[#F5A623]">Seva</em> at a Time
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: "easeOut" }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl"
        >
          Supporting{" "}
          <span className="font-medium text-white">
            orphaned children, semi-orphans, cancer families,
          </span>{" "}
          widows, street children, and the elderly — because every life deserves dignity and love.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.36, ease: "easeOut" }}
          className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/donations"
            className="min-w-[168px] rounded-full bg-[#F5A623] px-8 py-4 text-base font-bold text-[#0F3D22] shadow-lg shadow-[#F5A623]/30 transition-all hover:scale-105 hover:bg-[#F7BA57] active:scale-95"
          >
            Donate Now
          </Link>
          <a
            href="#our-story"
            className="flex min-w-[168px] items-center justify-center gap-3 rounded-full border-2 border-white/30 px-8 py-4 text-base text-white transition-all hover:bg-white/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Play size={13} fill="white" />
            </span>
            Watch Our Story
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="grid grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4 sm:gap-8"
        >
          {BADGES.map(({ Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon size={22} className="text-[#F5A623]" />
              <span className="font-heading text-2xl font-bold text-white sm:text-3xl">{value}</span>
              <span className="text-[11px] uppercase tracking-widest text-white/50">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#impact"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 flex flex-col items-center gap-1 text-white/40 transition-colors hover:text-white/70"
        aria-label="Scroll down"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} />
        </motion.span>
      </motion.a>
    </section>
  );
}
