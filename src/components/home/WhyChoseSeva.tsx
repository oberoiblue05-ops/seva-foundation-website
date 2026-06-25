"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { Shield, BarChart3, Target, FileCheck } from "lucide-react";

const REASONS = [
  {
    Icon:  Shield,
    title: "Verified & Registered NGO",
    desc:  "NITI Aayog registered, 80G & 12A certified. Full financial audits published annually.",
    accent: "text-[#1B5E37]",
    bg:    "bg-[#1B5E37]/10 group-hover:bg-[#1B5E37]/20",
  },
  {
    Icon:  BarChart3,
    title: "100% Fund Utilisation",
    desc:  "Zero hidden administrative deductions. Every rupee you donate reaches a real beneficiary.",
    accent: "text-amber-600",
    bg:    "bg-amber-500/10 group-hover:bg-amber-500/20",
  },
  {
    Icon:  Target,
    title: "Real, Measurable Impact",
    desc:  "Monthly reports with names, photos, and documented outcomes — not vague statistics.",
    accent: "text-blue-600",
    bg:    "bg-blue-500/10 group-hover:bg-blue-500/20",
  },
  {
    Icon:  FileCheck,
    title: "80G Tax Benefits",
    desc:  "Claim a 50% income tax deduction on all donations. Certificates issued automatically.",
    accent: "text-purple-600",
    bg:    "bg-purple-500/10 group-hover:bg-purple-500/20",
  },
];

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

const cardV: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function WhyChoseSeva() {
  const ref     = useRef<HTMLDivElement>(null);
  const inView  = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="relative bg-white py-20 overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#1B5E37]">
            Why Trust Us
          </p>
          <h2 className="font-heading text-3xl font-bold text-[#0F3D22] sm:text-4xl">
            Giving You Can Believe In
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#1A1A1A]/60 text-sm leading-relaxed">
            Seva Group Foundation is built on accountability, transparency, and measurable change.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {REASONS.map(({ Icon, title, desc, accent, bg }) => (
            <motion.div
              key={title}
              variants={cardV}
              className="card-premium group p-7"
            >
              <div
                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${bg} ${accent}`}
              >
                <Icon size={26} />
              </div>
              <h3 className="mb-2 font-heading text-[1rem] font-bold text-[#0F3D22] leading-snug">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-[#1A1A1A]/60">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
