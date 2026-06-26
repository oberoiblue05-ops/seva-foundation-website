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

interface Dot {
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay: number;
  duration: number;
  opacity: number;
}

const DOTS: Dot[] = [
  { size: 14, top: "16%",  left: "7%",   delay: 0,   duration: 5.5, opacity: 0.25 },
  { size: 8,  top: "30%",  right: "11%", delay: 1.2, duration: 6.5, opacity: 0.18 },
  { size: 18, bottom: "28%", left: "13%", delay: 2,   duration: 7,   opacity: 0.14 },
  { size: 6,  top: "55%",  right: "22%", delay: 0.7, duration: 5,   opacity: 0.20 },
  { size: 10, bottom: "18%", right: "7%", delay: 1.8, duration: 6,  opacity: 0.16 },
  { size: 5,  top: "70%",  left: "40%",  delay: 0.4, duration: 8,   opacity: 0.12 },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* Base dark green gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(145deg, #050f07 0%, #0a1e10 25%, #0d2e18 55%, #1B5E37 100%)" }}
      />

      {/* Animated blob 1 — gold warm orb */}
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,166,35,0.14) 0%, transparent 68%)" }}
      />

      {/* Animated blob 2 — green depth */}
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.18, 0.3, 0.18] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        className="absolute -bottom-48 -right-48 w-[760px] h-[760px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(27,94,55,0.45) 0%, transparent 68%)" }}
      />

      {/* Animated blob 3 — shifting mid orb */}
      <motion.div
        animate={{ x: [0, 28, -18, 0], y: [0, -18, 14, 0], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute top-1/3 left-1/3 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 70%)" }}
      />

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none opacity-30" />

      {/* Floating gold circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {DOTS.map((dot, i) => (
          <motion.div
            key={i}
            animate={{ y: ["0%", "-22%", "0%"] }}
            transition={{ duration: dot.duration, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
            className="absolute rounded-full bg-[#F5A623]"
            style={{
              width:   dot.size,
              height:  dot.size,
              top:     dot.top,
              left:    dot.left,
              right:   dot.right,
              bottom:  dot.bottom,
              opacity: dot.opacity,
            }}
          />
        ))}
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">

        {/* Shimmer badge */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/8 px-5 py-2.5 text-white/90 backdrop-blur-sm overflow-hidden relative"
        >
          <span className="absolute inset-0 pointer-events-none -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          <span className="relative z-10 h-2 w-2 rounded-full bg-[#F5A623] animate-pulse" />
          <span className="relative z-10 text-[11px] font-bold uppercase tracking-[0.18em]">
            Registered NGO · Noida, UP · Serving Since 2018
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
          className="mb-5 font-heading font-bold text-white"
          style={{
            fontSize:   "clamp(2.6rem, 7.5vw, 5.2rem)",
            lineHeight: 1.05,
            textShadow: "0 2px 24px rgba(0,0,0,0.45), 0 0 60px rgba(0,0,0,0.2)",
          }}
        >
          Transforming Lives,
          <br />
          One Act of{" "}
          <em className="not-italic text-[#F5A623]">Seva</em> at a Time
        </motion.h1>

        {/* Gold accent line under headline */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.32, ease: "easeOut" }}
          className="mx-auto mb-7 h-[2px] w-28 origin-center"
          style={{ background: "linear-gradient(90deg, transparent, #F5A623 50%, transparent)" }}
        />

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: "easeOut" }}
          className="mx-auto mb-11 max-w-2xl leading-[1.85] text-white/72 sm:text-xl"
          style={{ fontSize: "clamp(1rem, 2.2vw, 1.2rem)" }}
        >
          Supporting{" "}
          <span className="font-semibold text-white">
            orphaned children, semi-orphans, cancer families, widows, street children, and the elderly
          </span>{" "}
          — because every life deserves dignity and love.
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
            className="relative min-w-[188px] rounded-full px-9 py-4 text-base font-bold text-[#0F3D22] transition-all hover:scale-105 hover:-translate-y-1 active:scale-95"
            style={{
              background:   "linear-gradient(135deg, #F5A623 0%, #E8930F 100%)",
              boxShadow:    "0 8px 32px rgba(245,166,35,0.45)",
              letterSpacing: "0.03em",
              textShadow:   "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Donate Now
          </Link>
          <a
            href="#our-story"
            className="flex min-w-[188px] items-center justify-center gap-3 rounded-full border-2 border-white/28 px-9 py-4 text-base text-white transition-all hover:bg-white/10 hover:-translate-y-1 backdrop-blur-sm"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Play size={13} fill="white" />
            </span>
            Watch Our Story
          </a>
        </motion.div>

        {/* Trust badges — glassmorphism pills */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="flex flex-wrap justify-center gap-3"
        >
          {BADGES.map(({ Icon, value, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-full border border-white/15 px-5 py-3 backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5A623]/20">
                <Icon size={16} className="text-[#F5A623]" />
              </div>
              <div className="text-left">
                <span className="block font-heading text-lg font-extrabold text-white leading-tight">{value}</span>
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-white/50">{label}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#impact"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 text-white/40 transition-colors hover:text-white/70"
        aria-label="Scroll down"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Scroll to explore</span>
        <motion.span
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} />
        </motion.span>
      </motion.a>
    </section>
  );
}
