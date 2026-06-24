"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ChevronRight, X, ChevronLeft, ChevronRight as ChevronRightIcon, ZoomIn } from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────

type Category = "All" | "Medical Camp" | "Education" | "Food Relief" | "Tree Plantation" | "Events";
type Year     = "All" | "2024" | "2023" | "2022";

interface GalleryImage {
  id:       number;
  seed:     string;
  category: Exclude<Category, "All">;
  year:     Exclude<Year, "All">;
  caption:  string;
  tall:     boolean;
}

const IMAGES: GalleryImage[] = [
  { id:  1, seed: "gal-mc1",  category: "Medical Camp",    year: "2024", caption: "Free eye check-up camp — 300 patients served",           tall: true  },
  { id:  2, seed: "gal-edu1", category: "Education",       year: "2024", caption: "Digital literacy lab inauguration",                      tall: false },
  { id:  3, seed: "gal-fr1",  category: "Food Relief",     year: "2024", caption: "Diwali food drive — 500 family kits distributed",        tall: false },
  { id:  4, seed: "gal-tp1",  category: "Tree Plantation", year: "2024", caption: "Independence Day plantation — 200 saplings",             tall: true  },
  { id:  5, seed: "gal-ev1",  category: "Events",          year: "2024", caption: "Annual Foundation Day celebration",                      tall: false },
  { id:  6, seed: "gal-mc2",  category: "Medical Camp",    year: "2024", caption: "Dental camp for school children",                       tall: false },
  { id:  7, seed: "gal-edu2", category: "Education",       year: "2023", caption: "Scholarship award ceremony — 50 students",              tall: true  },
  { id:  8, seed: "gal-fr2",  category: "Food Relief",     year: "2023", caption: "Community kitchen — daily 500 meals",                   tall: false },
  { id:  9, seed: "gal-tp2",  category: "Tree Plantation", year: "2023", caption: "World Environment Day drive — 150 trees",               tall: false },
  { id: 10, seed: "gal-ev2",  category: "Events",          year: "2023", caption: "Volunteer orientation day — 80 new volunteers",         tall: true  },
  { id: 11, seed: "gal-mc3",  category: "Medical Camp",    year: "2023", caption: "General health camp — 450 consultations",               tall: false },
  { id: 12, seed: "gal-edu3", category: "Education",       year: "2023", caption: "Tutoring centre expansion — new classroom",             tall: false },
  { id: 13, seed: "gal-fr3",  category: "Food Relief",     year: "2022", caption: "Ration kit drive — 200 families reached",               tall: true  },
  { id: 14, seed: "gal-tp3",  category: "Tree Plantation", year: "2022", caption: "School plantation drive — 100 saplings",                tall: false },
  { id: 15, seed: "gal-ev3",  category: "Events",          year: "2022", caption: "CSR partnership signing ceremony",                      tall: false },
  { id: 16, seed: "gal-mc4",  category: "Medical Camp",    year: "2022", caption: "Blood donation camp — 60 units collected",              tall: false },
  { id: 17, seed: "gal-edu4", category: "Education",       year: "2022", caption: "Books distribution — 300 children",                     tall: true  },
  { id: 18, seed: "gal-fr4",  category: "Food Relief",     year: "2022", caption: "Holi special meal — 1,000 plates served",               tall: false },
  { id: 19, seed: "gal-ev4",  category: "Events",          year: "2022", caption: "Children's Day celebration with 250 kids",              tall: false },
  { id: 20, seed: "gal-tp4",  category: "Tree Plantation", year: "2022", caption: "Van Mahotsav plantation — 80 trees in one day",         tall: true  },
];

const CATEGORY_TABS: Category[] = ["All", "Medical Camp", "Education", "Food Relief", "Tree Plantation", "Events"];
const YEAR_TABS:     Year[]     = ["All", "2024", "2023", "2022"];

const CATEGORY_COLORS: Record<Exclude<Category, "All">, string> = {
  "Medical Camp":    "bg-blue-500/80",
  "Education":       "bg-purple-500/80",
  "Food Relief":     "bg-orange-500/80",
  "Tree Plantation": "bg-green-600/80",
  "Events":          "bg-pink-500/80",
};

// ─── Page ──────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [cat,      setCat]      = useState<Category>("All");
  const [year,     setYear]     = useState<Year>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = IMAGES.filter(
    (img) =>
      (cat  === "All" || img.category === cat) &&
      (year === "All" || img.year     === year)
  );

  // Lightbox keyboard handler
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "Escape")      setLightbox(null);
      if (e.key === "ArrowLeft")   setLightbox((p) => (p !== null && p > 0                ? p - 1 : p));
      if (e.key === "ArrowRight")  setLightbox((p) => (p !== null && p < filtered.length - 1 ? p + 1 : p));
    },
    [lightbox, filtered.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  const activeLb = lightbox !== null ? filtered[lightbox] : null;

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B5E37] to-[#0F3D22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="mb-5 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Gallery</span>
          </nav>
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">Gallery</h1>
          <p className="mt-3 text-lg text-white/70">
            Glimpses of seva in action — camps, drives, celebrations, and everyday moments of change.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[64px] z-30 bg-white/95 py-4 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_TABS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  cat === c
                    ? "bg-[#1B5E37] text-white shadow-md"
                    : "bg-[#F9FBF9] text-[#1A1A1A]/60 hover:bg-[#1B5E37]/10 hover:text-[#1B5E37]"
                }`}
              >
                {c}
              </button>
            ))}
            <span className="ml-auto flex gap-2">
              {YEAR_TABS.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    year === y
                      ? "bg-[#F5A623] text-[#0F3D22]"
                      : "bg-[#F9FBF9] text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
                  }`}
                >
                  {y}
                </button>
              ))}
            </span>
          </div>
        </div>
      </section>

      {/* Masonry grid */}
      <section className="bg-[#F9FBF9] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {filtered.length === 0 ? (
            <div className="py-24 text-center text-[#1A1A1A]/40">
              No photos for this filter combination yet.
            </div>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {filtered.map((img, i) => (
                <div key={img.id} className="mb-4 break-inside-avoid">
                  <button
                    onClick={() => setLightbox(i)}
                    className="group relative w-full overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E37]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://picsum.photos/seed/${img.seed}/${img.tall ? "400/560" : "400/300"}`}
                      alt={img.caption}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0F3D22]/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <ZoomIn size={28} className="text-white" />
                      <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${CATEGORY_COLORS[img.category]}`}>
                        {img.category}
                      </span>
                      <p className="mx-4 text-center text-xs text-white/90">{img.caption}</p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {activeLb !== null && lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          {/* Inner — stops click propagation so clicking image doesn't close */}
          <div
            className="relative flex max-h-[90vh] max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white"
              aria-label="Close lightbox"
            >
              <X size={28} />
            </button>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://picsum.photos/seed/${activeLb.seed}/${activeLb.tall ? "600/840" : "900/675"}`}
              alt={activeLb.caption}
              className="max-h-[78vh] rounded-xl object-contain shadow-2xl"
            />

            {/* Caption + badge */}
            <div className="mt-4 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${CATEGORY_COLORS[activeLb.category]}`}>
                {activeLb.category}
              </span>
              <p className="text-sm text-white/80">{activeLb.caption}</p>
              <span className="ml-auto text-xs text-white/40">{activeLb.year}</span>
            </div>

            {/* Prev / Next */}
            {lightbox > 0 && (
              <button
                onClick={() => setLightbox((p) => (p !== null ? p - 1 : p))}
                className="absolute left-0 top-1/2 -translate-x-12 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft size={26} />
              </button>
            )}
            {lightbox < filtered.length - 1 && (
              <button
                onClick={() => setLightbox((p) => (p !== null ? p + 1 : p))}
                className="absolute right-0 top-1/2 -translate-x-[-3rem] -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Next image"
              >
                <ChevronRightIcon size={26} />
              </button>
            )}

            {/* Counter */}
            <p className="mt-2 text-xs text-white/40">
              {lightbox + 1} / {filtered.length}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
