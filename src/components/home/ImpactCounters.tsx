"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import CountUp from "react-countup";
import { Heart, Utensils, Stethoscope, TreePine } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { IMPACT_STATS } from "@/constants";

interface Stats {
  children: number;
  meals:    number;
  camps:    number;
  trees:    number;
}

const COUNTER_CONFIG = [
  {
    key: "children" as const,
    Icon: Heart,
    suffix: "+",
    label: "Children Supported",
    description: "Orphans, semi-orphans & street children under our care",
    ghost: "840",
  },
  {
    key: "meals" as const,
    Icon: Utensils,
    suffix: "K+",
    label: "Meals Served",
    description: "Nutritious meals distributed to families every year",
    ghost: "8.4K",
  },
  {
    key: "camps" as const,
    Icon: Stethoscope,
    suffix: "+",
    label: "Medical Camps",
    description: "Free health camps held across Noida & NCR region",
    ghost: "50",
  },
  {
    key: "trees" as const,
    Icon: TreePine,
    suffix: "+",
    label: "Trees Planted",
    description: "Saplings planted as part of our Green Noida initiative",
    ghost: "500",
  },
];

const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// Wave divider at bottom
function WaveDivider() {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]">
      <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-14">
        <path d="M0 56L48 49C96 42 192 28 288 21C384 14 480 14 576 21C672 28 768 42 864 42C960 42 1056 28 1152 21C1248 14 1344 14 1392 14L1440 14V56H0Z" fill="#F9FBF9" />
      </svg>
    </div>
  );
}

export default function ImpactCounters() {
  const ref     = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const [stats, setStats] = useState<Stats>(IMPACT_STATS);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "impactStats"));
        if (snap.exists()) {
          const data = snap.data() as Partial<Stats>;
          setStats({
            children: data.children ?? IMPACT_STATS.children,
            meals:    data.meals    ?? IMPACT_STATS.meals,
            camps:    data.camps    ?? IMPACT_STATS.camps,
            trees:    data.trees    ?? IMPACT_STATS.trees,
          });
        }
      } catch {
        // fall back to constants
      }
    };
    fetchStats();
  }, []);

  return (
    <section id="impact" className="relative bg-[#0F3D22] py-20 pb-28 overflow-hidden">
      {/* Diagonal stripe texture */}
      <div className="absolute inset-0 diagonal-stripes pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#F5A623]">
            Our Impact
          </p>
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Numbers That Tell Our Story
          </h2>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {COUNTER_CONFIG.map(({ key, Icon, suffix, label, description, ghost }) => {
            const raw      = stats[key];
            const end      = key === "meals" ? raw / 1000 : raw;
            const decimals = key === "meals" ? 1 : 0;

            return (
              <motion.div
                key={key}
                variants={item}
                className="glass-dark glass-hover relative rounded-2xl p-8 text-center overflow-hidden"
              >
                {/* Ghost number */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute -bottom-3 -right-2 font-heading font-black text-white/[0.06] leading-none"
                  style={{ fontSize: "6rem" }}
                >
                  {ghost}
                </div>

                {/* Icon */}
                <div className="relative z-10 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#F5A623]/15 transition-all duration-300 group-hover:bg-[#F5A623]/25">
                  <Icon size={26} className="text-[#F5A623]" />
                </div>

                {/* Number with glow */}
                <div className="relative z-10 font-heading text-5xl font-extrabold text-[#F5A623] stat-glow sm:text-6xl">
                  <CountUp
                    start={0}
                    end={end}
                    duration={2.4}
                    decimals={decimals}
                    separator=","
                    enableScrollSpy
                    scrollSpyOnce
                  />
                  {suffix}
                </div>

                <p className="relative z-10 mt-2.5 font-bold text-white text-base">{label}</p>
                <p className="relative z-10 mt-1.5 text-sm leading-relaxed text-white/50">{description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Wave divider into MissionSection */}
      <WaveDivider />
    </section>
  );
}
