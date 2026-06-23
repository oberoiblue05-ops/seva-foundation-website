"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Calendar, Tag, ChevronLeft, ChevronRight } from "lucide-react";

const ACTIVITIES = [
  {
    id: 1,
    title: "Monthly Food Distribution",
    description: "Ration kits distributed to 200+ families in Chipyana Khurd and surrounding areas.",
    date: "December 2024",
    category: "Food Relief",
    imageSeed: 103,
  },
  {
    id: 2,
    title: "Free Medical Camp",
    description: "General health check-ups, medicines, and doctor consultations for 150 patients.",
    date: "November 2024",
    category: "Medical Support",
    imageSeed: 237,
  },
  {
    id: 3,
    title: "Back to School Drive",
    description: "School bags, notebooks, and uniforms distributed to 80 underprivileged children.",
    date: "June 2024",
    category: "Education",
    imageSeed: 450,
  },
  {
    id: 4,
    title: "Tree Plantation Drive",
    description: "100 saplings planted across Noida Extension with local volunteers and students.",
    date: "July 2024",
    category: "Environment",
    imageSeed: 178,
  },
  {
    id: 5,
    title: "Widow Skill Workshop",
    description: "Tailoring and handicraft training empowering 30 widows toward financial independence.",
    date: "October 2024",
    category: "Widow Support",
    imageSeed: 316,
  },
  {
    id: 6,
    title: "Street Children Rescue",
    description: "5 children rescued and placed in our orphanage with full schooling and care.",
    date: "September 2024",
    category: "Child Care",
    imageSeed: 567,
  },
];

const CARD_W = 300;
const CARD_GAP = 24;
const STEP = CARD_W + CARD_GAP;

export default function LatestActivities() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, amount: 0.3 });

  const prev = useCallback(
    () => setIndex((i) => (i === 0 ? ACTIVITIES.length - 1 : i - 1)),
    []
  );
  const next = useCallback(
    () => setIndex((i) => (i === ACTIVITIES.length - 1 ? 0 : i + 1)),
    []
  );

  // Auto-advance every 3 s (pause on hover)
  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(next, 3000);
    return () => clearInterval(t);
  }, [isPaused, next]);

  return (
    <section className="bg-[#0F3D22] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div ref={titleRef} className="mb-12 flex items-end justify-between">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#F5A623]">
              On the Ground
            </p>
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Latest Activities
            </h2>
          </motion.div>

          {/* Nav arrows */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-2"
          >
            <button
              onClick={prev}
              aria-label="Previous"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-all hover:border-[#F5A623] hover:bg-[#F5A623] hover:text-[#0F3D22]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-all hover:border-[#F5A623] hover:bg-[#F5A623] hover:text-[#0F3D22]"
            >
              <ChevronRight size={18} />
            </button>
          </motion.div>
        </div>

        {/* Carousel */}
        <div
          ref={containerRef}
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: -(ACTIVITIES.length - 1) * STEP, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.velocity.x < -100 || info.offset.x < -50) next();
              else if (info.velocity.x > 100 || info.offset.x > 50) prev();
            }}
            animate={{ x: -(index * STEP) }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="flex cursor-grab select-none active:cursor-grabbing"
            style={{ gap: CARD_GAP }}
          >
            {ACTIVITIES.map((activity) => (
              <motion.div
                key={activity.id}
                style={{ minWidth: CARD_W, width: CARD_W }}
                className="overflow-hidden rounded-2xl bg-[#1B5E37]"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={`https://picsum.photos/seed/${activity.imageSeed}/600/350`}
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="300px"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D22]/60 to-transparent" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#F5A623] px-3 py-1 text-[11px] font-bold text-[#0F3D22]">
                    <Tag size={10} />
                    {activity.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-1.5 text-xs text-white/50">
                    <Calendar size={12} />
                    {activity.date}
                  </div>
                  <h3 className="mb-2 font-heading text-base font-bold text-white leading-snug">
                    {activity.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60">
                    {activity.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {ACTIVITIES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-[#F5A623]" : "w-1.5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
