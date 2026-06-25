"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CheckCircle, Users, Star, Shield, ChevronRight } from "lucide-react";
import { CHILDREN, ORG } from "@/constants";
import SponsorModal, { type ChildForSponsor } from "@/components/SponsorModal";

// ─── Category config ────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "all",              label: "All Children" },
  { key: "orphan",           label: "Orphans" },
  { key: "semi-orphan",      label: "Semi-Orphans" },
  { key: "street-children",  label: "Street Children" },
  { key: "accidental-orphan",label: "Accidental Orphans" },
  { key: "cancer-family",    label: "Cancer-Affected" },
  { key: "prisoner-family",  label: "Prisoner Family" },
] as const;

// ─── Static impact numbers ────────────────────────────────────────────────────

const IMPACT = [
  { icon: Heart,        value: "840+",  label: "Children Supported" },
  { icon: Users,        value: "120+",  label: "Active Sponsors" },
  { icon: Star,         value: "Rs.500",label: "Per Month" },
  { icon: Shield,       value: "100%",  label: "Funds to Child" },
];

// ─── How it works steps ───────────────────────────────────────────────────────

const STEPS = [
  { n: "01", title: "Choose a Child",     desc: "Browse profiles and pick a child whose story moves you." },
  { n: "02", title: "Sponsor Rs.500/mo",  desc: "Secure monthly payment via Razorpay — cancel anytime." },
  { n: "03", title: "Get Updates",        desc: "Receive monthly progress reports and photos by email." },
  { n: "04", title: "Transform a Life",   desc: "Your support covers meals, school fees, and healthcare." },
];

// ─── Child Card ───────────────────────────────────────────────────────────────

function ChildCard({
  child,
  onSponsor,
}: {
  child: (typeof CHILDREN)[number];
  onSponsor: (c: ChildForSponsor) => void;
}) {
  const photoSrc = `https://picsum.photos/seed/${child.imageSeed}/300/300`;
  const label = child.category.replace(/-/g, " ");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Photo */}
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <Image
            src={photoSrc}
            alt={child.name}
            width={300}
            height={225}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-[#1B5E37] text-white text-[11px] font-semibold px-3 py-1 rounded-full capitalize">
          {label}
        </span>
        {/* Age badge */}
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[#1B5E37] text-[11px] font-bold px-3 py-1 rounded-full">
          Age {child.age}
        </span>
        {child.isSponsored && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white/95 rounded-xl px-5 py-3 text-center">
              <CheckCircle className="mx-auto mb-1 text-[#1B5E37]" size={24} />
              <p className="text-sm font-bold text-[#1B5E37]">Already Sponsored</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading text-lg font-bold text-[#0F3D22] mb-2">{child.name}</h3>
        <p className="text-gray-600 text-sm leading-relaxed flex-1">{child.story}</p>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[#1B5E37] font-bold text-lg">Rs.500<span className="text-xs font-normal text-gray-400">/mo</span></span>
          <button
            disabled={child.isSponsored}
            onClick={() =>
              onSponsor({
                id:        child.id,
                name:      child.name,
                age:       child.age,
                category:  child.category,
                imageSeed: child.imageSeed,
              })
            }
            className="flex items-center gap-2 bg-[#1B5E37] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#0d3320] transition-all hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Heart size={14} />
            Sponsor
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SponsorPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedChild, setSelectedChild]   = useState<ChildForSponsor | null>(null);

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? CHILDREN
        : CHILDREN.filter((c) => c.category === activeCategory),
    [activeCategory],
  );

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071a0e] via-[#0d3320] to-[#1B5E37] py-24 md:py-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,#F5A623,transparent_60%)]" />
        <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6"
          >
            Child Sponsorship
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight mb-6"
          >
            Be a Lifeline for{" "}
            <span className="text-[#F5A623]">a Child</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/75 text-lg md:text-xl leading-relaxed mb-10"
          >
            Just Rs.500 per month covers a child&apos;s meals, school fees, and medical care. Cancel anytime. 80G tax benefit included.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm"
          >
            {["80G Tax Benefit", "Secure Razorpay Payment", "Monthly Updates", "Cancel Anytime"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#F5A623]" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Impact Numbers ── */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {IMPACT.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1B5E37]/10 flex items-center justify-center mx-auto mb-3">
                  <Icon size={22} className="text-[#1B5E37]" />
                </div>
                <p className="font-heading text-2xl font-bold text-[#0F3D22]">{value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#F9FBF9] py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0F3D22] text-center mb-12">
            How Sponsorship Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="text-center relative">
                <div className="w-14 h-14 rounded-full bg-[#1B5E37] flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#F5A623] font-bold text-sm font-heading">{s.n}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight
                    size={18}
                    className="absolute top-4 right-0 text-gray-300 hidden md:block"
                  />
                )}
                <h3 className="font-bold text-[#0F3D22] text-sm mb-2">{s.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Child Profiles ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0F3D22] mb-3">
              Children Awaiting a Sponsor
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Each child has a story. Find the one that speaks to your heart.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat.key
                    ? "bg-[#1B5E37] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  onSponsor={setSelectedChild}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-16">No children in this category yet.</p>
          )}
        </div>
      </section>

      {/* ── Tax Benefit Banner ── */}
      <section className="bg-[#F9FBF9] py-12 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-[#1B5E37] font-bold text-sm mb-2 uppercase tracking-wider">80G Tax Benefit</p>
          <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0F3D22] mb-4">
            Your Sponsorship is Tax-Deductible
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Seva Group Foundation is registered under Section 80G of the Income Tax Act, 1961.
            You receive a tax deduction certificate automatically after each sponsorship payment.
            Provide your PAN while sponsoring to avail the benefit.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#1B5E37]/10 border border-[#1B5E37]/20 rounded-full px-5 py-2.5 text-sm text-[#1B5E37] font-semibold">
            <Shield size={15} />
            Donations eligible under Section 80G · 50% deduction
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="relative py-20 text-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #071a0e 0%, #1B5E37 100%)" }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,#F5A623,transparent_60%)]" />
        <div className="relative z-10 container mx-auto px-4 max-w-2xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Change a Life?
          </h2>
          <p className="text-white/70 mb-8 text-base">
            Scroll up, choose a child, and start your sponsorship today.
            Questions? Reach us at{" "}
            <a href={`mailto:${ORG.email}`} className="text-[#F5A623] hover:underline">
              {ORG.email}
            </a>
          </p>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 600, behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 bg-[#F5A623] text-[#071a0e] font-bold px-8 py-4 rounded-full hover:bg-[#e0941a] transition-all hover:shadow-xl hover:scale-105"
          >
            <Heart size={18} />
            Choose a Child to Sponsor
          </a>
        </div>
      </section>

      {/* ── Sponsor Modal ── */}
      {selectedChild && (
        <SponsorModal
          child={selectedChild}
          onClose={() => setSelectedChild(null)}
        />
      )}
    </>
  );
}
