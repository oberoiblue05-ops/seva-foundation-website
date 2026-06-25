"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      "The transparency with which Seva Group Foundation operates is truly commendable. Every month I get a detailed update on exactly how my donation was used. That level of accountability is rare.",
    name: "Rajesh Malhotra",
    role: "Software Engineer",
    city: "Delhi NCR",
    initials: "RM",
    color: "bg-[#1B5E37]",
    amount: "Monthly donor since 2022",
  },
  {
    id: 2,
    quote:
      "I've been sponsoring Riya for six months now. Seeing her progress reports — her grades, her drawings, her smile — fills my heart. Rs. 500 a month feels like the best money I ever spent.",
    name: "Anita Sharma",
    role: "School Teacher",
    city: "Noida",
    initials: "AS",
    color: "bg-[#D4881A]",
    amount: "Child sponsor",
  },
  {
    id: 3,
    quote:
      "Our company partnered with Seva Foundation for our CSR mandate. Their on-ground team is exceptional, impact reports are detailed, and the children they support truly benefit. Highly recommended.",
    name: "Suresh Patel",
    role: "Founder & CEO",
    city: "Greater Noida",
    initials: "SP",
    color: "bg-[#2E7D52]",
    amount: "CSR partner",
  },
];

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15 } },
};

const cardAnim: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function Stars() {
  return (
    <div className="flex gap-0.5 text-[#F5A623]" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="bg-[#F9FBF9] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">
            Voices of Impact
          </p>
          <h2 className="font-heading text-3xl font-bold text-[#0F3D22] sm:text-4xl">
            What Our Donors Say
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map(({ id, quote, name, role, city, initials, color, amount }) => (
            <motion.div
              key={id}
              variants={cardAnim}
              className="glass-light glass-hover flex flex-col rounded-2xl p-8"
            >
              {/* Quote mark */}
              <span
                className="mb-1 block font-heading leading-none text-[#F5A623]"
                style={{ fontSize: "6rem", opacity: 0.15 }}
              >
                &ldquo;
              </span>

              <Stars />

              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-[#1A1A1A]/70">
                {quote}
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex items-center gap-4 border-t border-[#1B5E37]/10 pt-5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}
                >
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-[#0F3D22]">{name}</p>
                  <p className="text-xs text-[#1A1A1A]/50">
                    {role} · {city}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-[#1B5E37]">{amount}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
