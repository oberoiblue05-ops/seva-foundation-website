"use client";

import type React from "react";
import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { Heart, Shield, HeartHandshake, Users, Eye, Zap } from "lucide-react";

const VALUES: { Icon: React.ElementType; title: string; desc: string }[] = [
  { Icon: Heart,         title: "Compassion",    desc: "We lead with empathy, treating every individual with kindness and respect." },
  { Icon: Shield,        title: "Integrity",     desc: "Transparent operations, honest reporting, and accountable use of every donation." },
  { Icon: HeartHandshake,title: "Service",       desc: "Selfless service is our highest calling — not charity, but kinship." },
  { Icon: Users,         title: "Community",     desc: "We build strong local networks that create lasting, ground-up change." },
  { Icon: Eye,           title: "Transparency",  desc: "Open books, public impact reports, and full donor accountability." },
  { Icon: Zap,           title: "Impact",        desc: "Every rupee is directed to maximum measurable impact in real lives." },
];

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

const cardAnim: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  show:   { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const slideIn = (dir: "left" | "right"): Variants => ({
  hidden: { opacity: 0, x: dir === "left" ? -40 : 40 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
});

export default function MissionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      className="relative overflow-hidden py-24"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(27,94,55,0.06) 0%, transparent 70%), #F9FBF9",
      }}
    >
      {/* Decorative blob */}
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#1B5E37]/5 blur-3xl" />

      {/* Large decorative quote mark */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-4 top-8 font-heading font-black leading-none text-[#F5A623]"
        style={{ fontSize: "14rem", opacity: 0.045 }}
      >
        &ldquo;
      </div>

      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-start gap-16 lg:grid-cols-2">

          {/* Left — text */}
          <motion.div
            variants={slideIn("left")}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="lg:sticky lg:top-24"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">
              Who We Are
            </p>
            <h2 className="mb-6 font-heading text-3xl font-bold text-[#0F3D22] sm:text-4xl lg:text-5xl">
              Rooted in Purpose,
              <br />
              <span className="text-[#F5A623]">Driven by Love</span>
            </h2>

            <div className="mb-8 space-y-6">
              <div className="rounded-2xl border-l-4 border-[#1B5E37] bg-white p-6 shadow-sm">
                <h3 className="mb-2 font-heading text-lg font-bold text-[#1B5E37]">
                  Our Vision
                </h3>
                <p className="text-sm leading-relaxed text-[#1A1A1A]/70">
                  A society where no child goes to bed hungry, no elder lives alone in neglect, and
                  every widow has the dignity and support to rebuild her life.
                </p>
              </div>

              <div className="rounded-2xl border-l-4 border-[#F5A623] bg-white p-6 shadow-sm">
                <h3 className="mb-2 font-heading text-lg font-bold text-[#D4881A]">
                  Our Mission
                </h3>
                <p className="text-sm leading-relaxed text-[#1A1A1A]/70">
                  To provide holistic care — food, shelter, education, medical aid, and emotional
                  support — to orphaned children, senior citizens, widows, and vulnerable families
                  across Noida and NCR through community-driven initiatives.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {["80G Tax Exemption", "Registered NGO", "Transparent Reports", "Since 2018"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#1B5E37]/20 bg-[#1B5E37]/5 px-4 py-1.5 text-xs font-medium text-[#1B5E37]"
                  >
                    ✓ {tag}
                  </span>
                )
              )}
            </div>
          </motion.div>

          {/* Right — value cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {VALUES.map(({ Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={cardAnim}
                className="glass-light glass-hover group rounded-2xl p-6"
              >
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B5E37]/10 transition-colors group-hover:bg-[#1B5E37]/15">
                  <Icon size={22} className="text-[#1B5E37]" />
                </div>
                <h3 className="mb-1.5 font-heading text-base font-bold text-[#0F3D22]">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-[#1A1A1A]/60">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
