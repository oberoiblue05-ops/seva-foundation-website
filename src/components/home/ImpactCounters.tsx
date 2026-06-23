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
  meals: number;
  camps: number;
  trees: number;
}

const COUNTER_CONFIG = [
  { key: "children" as const, Icon: Heart,       suffix: "+",  label: "Children Supported",  description: "Orphans, semi-orphans & street children under our care" },
  { key: "meals"    as const, Icon: Utensils,    suffix: "K+", label: "Meals Served",         description: "Nutritious meals distributed to families every year" },
  { key: "camps"    as const, Icon: Stethoscope, suffix: "+",  label: "Medical Camps",        description: "Free health camps held across Noida & NCR region" },
  { key: "trees"    as const, Icon: TreePine,    suffix: "+",  label: "Trees Planted",        description: "Saplings planted as part of our Green Noida initiative" },
];

const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function ImpactCounters() {
  const ref = useRef<HTMLDivElement>(null);
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
        // silently fall back to constants
      }
    };
    fetchStats();
  }, []);

  return (
    <section id="impact" className="bg-[#0F3D22] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#F5A623]">
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
          {COUNTER_CONFIG.map(({ key, Icon, suffix, label, description }) => {
            const raw = stats[key];
            const end = key === "meals" ? raw / 1000 : raw;
            const decimals = key === "meals" ? 1 : 0;

            return (
              <motion.div
                key={key}
                variants={item}
                className="glass-dark glass-hover rounded-2xl p-8 text-center"
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#F5A623]/15">
                  <Icon size={26} className="text-[#F5A623]" />
                </div>

                <div className="font-heading text-4xl font-bold text-[#F5A623] sm:text-5xl">
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

                <p className="mt-2 font-semibold text-white">{label}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/50">{description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
