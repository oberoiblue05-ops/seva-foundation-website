"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import {
  ChevronRight, Heart, Shield, Zap, Users, Eye, Globe,
  Target, AlertTriangle, Activity, HandHeart,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────

const TEAM = [
  { name: "Rajesh Sharma", role: "Founder & President",   seed: "team-rs", linkedin: "#" },
  { name: "Priya Verma",   role: "Executive Director",    seed: "team-pv", linkedin: "#" },
  { name: "Amit Singh",    role: "Head of Operations",    seed: "team-as", linkedin: "#" },
  { name: "Sunita Gupta",  role: "Community Coordinator", seed: "team-sg", linkedin: "#" },
];

const TIMELINE = [
  { year: "2018", event: "Foundation established in Noida, UP" },
  { year: "2019", event: "First food camp — 500 meals served" },
  { year: "2020", event: "Orphanage programme launched" },
  { year: "2021", event: "1,000 trees planted across NCR" },
  { year: "2022", event: "Free medical camp series began" },
  { year: "2023", event: "5,000 children reached" },
  { year: "2024", event: "Digital literacy programme launched" },
];

const VALUES = [
  { Icon: Heart,  title: "Compassion",   desc: "Empathy first — every individual deserves kindness and respect." },
  { Icon: Shield, title: "Integrity",    desc: "Honest, transparent operations and accountable use of every donation." },
  { Icon: Zap,    title: "Impact",       desc: "Every rupee directed to maximum measurable change in real lives." },
  { Icon: Users,  title: "Inclusivity",  desc: "Welcoming all — regardless of religion, caste, or background." },
  { Icon: Eye,    title: "Transparency", desc: "Open books, public impact reports, and full donor accountability." },
  { Icon: Globe,  title: "Community",    desc: "Ground-up networks that create lasting, self-sustaining change." },
];

const VMG = [
  {
    Icon: Eye,
    title: "Vision",
    text: "A world where every individual — regardless of circumstance — lives with dignity, opportunity, and hope.",
    iconBg: "bg-[#1B5E37]/10",
    iconColor: "text-[#1B5E37]",
    headingColor: "text-[#1B5E37]",
  },
  {
    Icon: HandHeart,
    title: "Mission",
    text: "Serve the underprivileged through sustainable, community-driven programmes that create lasting change.",
    iconBg: "bg-[#F5A623]/15",
    iconColor: "text-[#D4881A]",
    headingColor: "text-[#D4881A]",
  },
  {
    Icon: Target,
    title: "Goal",
    text: "Reach 10,000 lives by 2027 across orphan care, elder support, education, health, and environmental initiatives.",
    iconBg: "bg-[#2E7D52]/10",
    iconColor: "text-[#2E7D52]",
    headingColor: "text-[#2E7D52]",
  },
];

const CHILDREN_CARDS = [
  {
    title: "Semi-Orphans",
    borderClass: "border-l-[#F59E0B]",
    iconColor: "text-[#F59E0B]",
    iconBg: "bg-[#F59E0B]/10",
    bulletBg: "bg-[#F59E0B]",
    Icon: Heart,
    desc: "Children who have lost one parent and live with a surviving parent struggling to make ends meet.",
    help: ["Daily nutritious meals", "After-school tutoring", "Grief counselling support"],
  },
  {
    title: "Accidental Orphans",
    borderClass: "border-l-[#EF4444]",
    iconColor: "text-[#EF4444]",
    iconBg: "bg-[#EF4444]/10",
    bulletBg: "bg-[#EF4444]",
    Icon: AlertTriangle,
    desc: "Children whose parents died in road or workplace accidents, left with no immediate support system.",
    help: ["Emergency shelter within 72 hrs", "Trauma counselling", "Full education support"],
  },
  {
    title: "Children of Cancer-Affected Parents",
    borderClass: "border-l-[#8B5CF6]",
    iconColor: "text-[#8B5CF6]",
    iconBg: "bg-[#8B5CF6]/10",
    bulletBg: "bg-[#8B5CF6]",
    Icon: Activity,
    desc: "Families bankrupted by cancer treatment, children pulled from school to help earn or care for the sick parent.",
    help: ["School fees & stationery", "Home tutoring sessions", "Meals & family counselling"],
  },
  {
    title: "Children from Prisoner Families",
    borderClass: "border-l-[#64748B]",
    iconColor: "text-[#64748B]",
    iconBg: "bg-[#64748B]/10",
    bulletBg: "bg-[#64748B]",
    Icon: Shield,
    desc: "Children facing social stigma and isolation due to a parent's incarceration — often invisible to welfare systems.",
    help: ["Confidential enrolment", "Education & skill support", "Social worker mentorship"],
  },
];

// ─── Variants (typed to avoid Framer Motion TS strict-Easing error) ────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

// ─── LinkedIn SVG (lucide-react has no brand social icons) ─────────────────

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const storyRef    = useRef<HTMLDivElement>(null);
  const vmgRef      = useRef<HTMLDivElement>(null);
  const valuesRef   = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  const teamRef     = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const storyInView    = useInView(storyRef,    { once: true, amount: 0.2  });
  const vmgInView      = useInView(vmgRef,      { once: true, amount: 0.2  });
  const valuesInView   = useInView(valuesRef,   { once: true, amount: 0.15 });
  const childrenInView = useInView(childrenRef, { once: true, amount: 0.15 });
  const teamInView     = useInView(teamRef,     { once: true, amount: 0.15 });
  const timelineInView = useInView(timelineRef, { once: true, amount: 0.2  });

  return (
    <main>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#1B5E37] to-[#0F3D22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="mb-5 flex items-center gap-2 text-sm text-white/60" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">About Us</span>
          </nav>
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            About Seva Group Foundation
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/70">
            A registered NGO rooted in Noida, UP — transforming lives through compassionate,
            sustainable programmes since 2018.
          </p>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div ref={storyRef} className="grid items-center gap-12 lg:grid-cols-2">

            <motion.div
              variants={slideLeft}
              initial="hidden"
              animate={storyInView ? "show" : "hidden"}
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">
                Our Story
              </p>
              <h2 className="mb-6 font-heading text-3xl font-bold text-[#0F3D22] sm:text-4xl">
                From One Kitchen to a Community Movement
              </h2>
              <div className="space-y-4 leading-relaxed text-[#1A1A1A]/70">
                <p>
                  Seva Group Foundation was established in 2018 by a group of neighbours in Noida Extension
                  who noticed that dozens of children in their locality were going to school hungry. What began
                  as a weekly home-cooked meal drive quickly grew into something far larger.
                </p>
                <p>
                  By 2019 we had served our first formal food camp — 500 meals in a single day. By 2020 we
                  launched our first orphanage support programme, reaching 40 children. The scale kept growing
                  as more volunteers joined and local businesses began contributing.
                </p>
                <p>
                  Today Seva Group Foundation serves 840+ children and families across orphan care, elder
                  support, education, healthcare, and environmental initiatives — with every rupee publicly
                  accounted for.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={slideRight}
              initial="hidden"
              animate={storyInView ? "show" : "hidden"}
              className="relative overflow-hidden rounded-2xl shadow-xl"
              style={{ aspectRatio: "3/2" }}
            >
              <Image
                src="https://picsum.photos/seed/seva-story/600/400"
                alt="Seva Group Foundation — Our Story"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D22]/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-sm font-medium text-white">
                  &ldquo;Seva is not charity — it is kinship.&rdquo;
                </p>
                <p className="mt-0.5 text-xs text-white/70">— Rajesh Sharma, Founder</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Vision / Mission / Goal ──────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">Our Purpose</p>
            <h2 className="font-heading text-3xl font-bold text-[#0F3D22] sm:text-4xl">
              Vision, Mission &amp; Goal
            </h2>
          </div>

          <motion.div
            ref={vmgRef}
            variants={stagger}
            initial="hidden"
            animate={vmgInView ? "show" : "hidden"}
            className="grid gap-6 md:grid-cols-3"
          >
            {VMG.map(({ Icon, title, text, iconBg, iconColor, headingColor }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="glass-light glass-hover rounded-2xl p-8"
              >
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon size={24} className={iconColor} />
                </div>
                <h3 className={`mb-3 font-heading text-xl font-bold ${headingColor}`}>{title}</h3>
                <p className="leading-relaxed text-[#1A1A1A]/70">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Our Values ───────────────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">What We Stand For</p>
            <h2 className="font-heading text-3xl font-bold text-[#0F3D22] sm:text-4xl">Our Values</h2>
          </div>

          <motion.div
            ref={valuesRef}
            variants={stagger}
            initial="hidden"
            animate={valuesInView ? "show" : "hidden"}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {VALUES.map(({ Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="glass-light glass-hover flex items-start gap-4 rounded-2xl p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B5E37]/10">
                  <Icon size={22} className="text-[#1B5E37]" />
                </div>
                <div>
                  <h3 className="mb-1 font-heading font-bold text-[#0F3D22]">{title}</h3>
                  <p className="text-sm leading-relaxed text-[#1A1A1A]/60">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── The Children We Serve ────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">Our Focus Groups</p>
            <h2 className="font-heading text-3xl font-bold text-[#0F3D22] sm:text-4xl">
              The Children We Serve
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#1A1A1A]/60">
              Beyond the label of &ldquo;orphan&rdquo; — four specific groups the system tends to overlook.
            </p>
          </div>

          <motion.div
            ref={childrenRef}
            variants={stagger}
            initial="hidden"
            animate={childrenInView ? "show" : "hidden"}
            className="grid gap-6 sm:grid-cols-2"
          >
            {CHILDREN_CARDS.map(({ title, borderClass, iconColor, iconBg, bulletBg, Icon, desc, help }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className={`glass-light glass-hover rounded-2xl border-l-4 p-7 ${borderClass}`}
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="mb-2 font-heading text-lg font-bold text-[#0F3D22]">{title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-[#1A1A1A]/65">{desc}</p>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1B5E37]">
                  How we help
                </p>
                <ul className="space-y-1.5">
                  {help.map((h) => (
                    <li key={h} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]/65">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${bulletBg}`} />
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────── */}
      <section className="bg-[#F9FBF9] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">Meet the Team</p>
            <h2 className="font-heading text-3xl font-bold text-[#0F3D22] sm:text-4xl">
              The People Behind the Mission
            </h2>
          </div>

          <motion.div
            ref={teamRef}
            variants={stagger}
            initial="hidden"
            animate={teamInView ? "show" : "hidden"}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {TEAM.map(({ name, role, seed, linkedin }) => (
              <motion.div
                key={name}
                variants={fadeUp}
                className="glass-light glass-hover group flex flex-col items-center rounded-2xl p-8 text-center"
              >
                <div className="relative mb-5 h-24 w-24 overflow-hidden rounded-full ring-4 ring-[#1B5E37]/20 transition-all group-hover:ring-[#F5A623]/50">
                  <Image
                    src={`https://picsum.photos/seed/${seed}/200/200`}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-heading font-bold text-[#0F3D22]">{name}</h3>
                <p className="mt-1 text-sm text-[#1A1A1A]/55">{role}</p>
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-1.5 text-sm text-[#1A1A1A]/35 transition-colors hover:text-[#F5A623] group-hover:text-[#F5A623]"
                  aria-label={`${name} on LinkedIn`}
                >
                  <LinkedInIcon />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Impact Timeline ──────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">Our Journey</p>
            <h2 className="font-heading text-3xl font-bold text-[#0F3D22] sm:text-4xl">
              Milestones &amp; Growth
            </h2>
          </div>

          <motion.div
            ref={timelineRef}
            initial={{ opacity: 0, y: 20 }}
            animate={timelineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {/* Desktop — horizontal */}
            <div className="hidden lg:flex items-start">
              {TIMELINE.map(({ year, event }, i) => (
                <div key={year} className="flex flex-1 flex-col items-center text-center">
                  <p className="mb-3 text-sm font-bold text-[#F5A623]">{year}</p>
                  <div className="relative flex w-full items-center">
                    {i > 0 && <div className="h-0.5 flex-1 bg-[#1B5E37]/20" />}
                    <div className="h-5 w-5 shrink-0 rounded-full border-[3px] border-[#F5A623] bg-[#1B5E37] shadow-sm" />
                    {i < TIMELINE.length - 1 && <div className="h-0.5 flex-1 bg-[#1B5E37]/20" />}
                  </div>
                  <p className="mt-3 px-2 text-xs leading-relaxed text-[#1A1A1A]/60">{event}</p>
                </div>
              ))}
            </div>

            {/* Mobile — vertical */}
            <div className="flex flex-col lg:hidden">
              {TIMELINE.map(({ year, event }, i) => (
                <div key={year} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-[3px] border-[#F5A623] bg-[#1B5E37]" />
                    {i < TIMELINE.length - 1 && (
                      <div className="my-1 w-0.5 flex-1 bg-[#1B5E37]/20" />
                    )}
                  </div>
                  <div className={i < TIMELINE.length - 1 ? "pb-8" : ""}>
                    <p className="text-sm font-bold text-[#F5A623]">{year}</p>
                    <p className="mt-0.5 text-sm text-[#1A1A1A]/65">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="bg-[#0F3D22] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Join Our Mission
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60">
            Whether you volunteer your time, sponsor a child, or simply spread the word —
            every act of seva counts.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/volunteer"
              className="min-w-[190px] rounded-full border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Volunteer With Us
            </Link>
            <Link
              href="/donations"
              className="min-w-[190px] rounded-full bg-[#F5A623] px-8 py-3.5 text-base font-bold text-[#0F3D22] shadow-lg transition-all hover:scale-105 hover:bg-[#F7BA57]"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
