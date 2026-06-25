"use client";

import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { Gift, Heart, ShoppingBasket, HandHeart } from "lucide-react";

const CARDS = [
  {
    Icon: Gift,
    title: "Donate Money",
    description:
      "Fund meals, medical camps, and education for orphans and street children. Every rupee counts.",
    cta: "Donate Now",
    href: "/donations",
    accent: "#F5A623",
    bg: "bg-[#F5A623]/10 hover:bg-[#F5A623]/15",
    border: "border-[#F5A623]/25 hover:border-[#F5A623]/50",
    iconBg: "bg-[#F5A623]/20",
    ctaClass: "bg-[#F5A623] text-[#0F3D22]",
  },
  {
    Icon: Heart,
    title: "Sponsor a Child",
    description:
      "Rs. 500/month changes a child's life. Cover their food, school fees, and medical needs.",
    cta: "Sponsor Now",
    href: "/sponsor",
    accent: "#FF6B6B",
    bg: "bg-red-500/10 hover:bg-red-500/15",
    border: "border-red-400/25 hover:border-red-400/50",
    iconBg: "bg-red-500/20",
    ctaClass: "bg-red-500 text-white",
  },
  {
    Icon: ShoppingBasket,
    title: "Donate Groceries",
    description:
      "Join our monthly grocery drives. Pledge dry rations and essential supplies for needy families.",
    cta: "Pledge Now",
    href: "/donate-groceries",
    accent: "#4CAF50",
    bg: "bg-green-400/10 hover:bg-green-400/15",
    border: "border-green-400/25 hover:border-green-400/50",
    iconBg: "bg-green-400/20",
    ctaClass: "bg-green-400 text-[#0F3D22]",
  },
  {
    Icon: HandHeart,
    title: "Volunteer",
    description:
      "Give your time and skills. Teach, cook, drive, or simply sit with someone who needs company.",
    cta: "Join Us",
    href: "/volunteer",
    accent: "#60A5FA",
    bg: "bg-blue-400/10 hover:bg-blue-400/15",
    border: "border-blue-400/25 hover:border-blue-400/50",
    iconBg: "bg-blue-400/20",
    ctaClass: "bg-blue-400 text-white",
  },
];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function DonationCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="relative bg-[#1B5E37] py-20 overflow-hidden">
      {/* Diagonal stripe texture */}
      <div className="absolute inset-0 diagonal-stripes pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#F5A623]">
            Make a Difference
          </p>
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Four Ways to Help
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Whether you donate money, food, time, or love — every act of seva
            creates a ripple of hope.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CARDS.map(({ Icon, title, description, cta, href, iconBg, bg, border, ctaClass }) => (
            <motion.div
              key={title}
              variants={card}
              className={`group flex flex-col rounded-2xl border p-7 transition-all duration-300 ${bg} ${border}`}
            >
              <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${iconBg}`}>
                <Icon size={26} className="text-white" />
              </div>

              <h3 className="mb-2 font-heading text-lg font-bold text-white">{title}</h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-white/60">{description}</p>

              <Link
                href={href}
                className={`block rounded-full py-2.5 text-center text-sm font-bold transition-all hover:opacity-90 hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 active:scale-95 ${ctaClass}`}
              >
                {cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
