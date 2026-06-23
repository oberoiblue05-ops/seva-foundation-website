"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ChevronRight, Search, Clock, ArrowRight, Tag } from "lucide-react";

// ─── Placeholder posts ─────────────────────────────────────────────────────

export interface PlaceholderPost {
  slug:       string;
  title:      string;
  excerpt:    string;
  category:   string;
  date:       string;
  author:     string;
  coverSeed:  string;
  readTime:   string;
  tags:       string[];
}

export const BLOG_POSTS: PlaceholderPost[] = [
  {
    slug:      "food-camp-december-2024",
    title:     "500 Families Fed at Our December Food Camp",
    excerpt:   "Our biggest food distribution event of the year brought warmth and nutrition to 500 families across Noida Extension just days before Christmas.",
    category:  "Food Relief",
    date:      "December 15, 2024",
    author:    "Priya Verma",
    coverSeed: "blog-food",
    readTime:  "3 min read",
    tags:      ["food", "camp", "community"],
  },
  {
    slug:      "digital-literacy-launch-2024",
    title:     "Our Digital Literacy Programme Reaches 200 Children",
    excerpt:   "Partnering with a CSR donor, we launched a 10-computer lab that is now teaching coding basics and internet safety to 200 underprivileged kids.",
    category:  "Education",
    date:      "November 8, 2024",
    author:    "Amit Singh",
    coverSeed: "blog-edu",
    readTime:  "4 min read",
    tags:      ["education", "technology", "csr"],
  },
  {
    slug:      "tree-plantation-independence-day-2024",
    title:     "200 Saplings Planted on Independence Day",
    excerpt:   "Volunteers from across NCR gathered at three locations in Noida Extension to plant 200 native saplings as a pledge to Green India.",
    category:  "Environment",
    date:      "August 15, 2024",
    author:    "Rajesh Sharma",
    coverSeed: "blog-tree",
    readTime:  "2 min read",
    tags:      ["environment", "trees", "independence-day"],
  },
  {
    slug:      "eye-camp-medical-march-2024",
    title:     "Free Eye Camp Serves 300 Patients in One Day",
    excerpt:   "With two ophthalmologists volunteering their Sunday, we ran our largest eye camp ever — distributing 80 free spectacles and referring 12 patients for surgery.",
    category:  "Medical Camp",
    date:      "March 22, 2024",
    author:    "Sunita Gupta",
    coverSeed: "blog-eye",
    readTime:  "3 min read",
    tags:      ["health", "camp", "vision"],
  },
  {
    slug:      "sponsorship-50-children-2023",
    title:     "50 New Children Find Sponsors in 2023",
    excerpt:   "Through our child sponsorship programme, 50 more children now have monthly support covering meals, school fees, and medical care — thanks to donors across India.",
    category:  "Child Welfare",
    date:      "December 30, 2023",
    author:    "Priya Verma",
    coverSeed: "blog-sponsor",
    readTime:  "5 min read",
    tags:      ["sponsorship", "children", "impact"],
  },
  {
    slug:      "csr-partnership-techcorp-2023",
    title:     "CSR Partnership Brings Rs. 5 Lakh to Education Fund",
    excerpt:   "A Gold-tier CSR partnership with a leading IT company has added Rs. 5 lakh to our education fund — enough to support 100 children for an entire academic year.",
    category:  "CSR",
    date:      "September 5, 2023",
    author:    "Amit Singh",
    coverSeed: "blog-csr",
    readTime:  "4 min read",
    tags:      ["csr", "partnership", "education"],
  },
];

const CATEGORIES = ["All", "Food Relief", "Education", "Environment", "Medical Camp", "Child Welfare", "CSR"] as const;
type Cat = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<string, string> = {
  "Food Relief":   "bg-orange-100 text-orange-700",
  "Education":     "bg-purple-100 text-purple-700",
  "Environment":   "bg-green-100 text-green-700",
  "Medical Camp":  "bg-blue-100 text-blue-700",
  "Child Welfare": "bg-pink-100 text-pink-700",
  "CSR":           "bg-yellow-100 text-yellow-700",
};

const PAGE_SIZE = 6;

// ─── Page ──────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [search, setSearch] = useState("");
  const [cat,    setCat]    = useState<Cat>("All");
  const [page,   setPage]   = useState(1);

  const filtered = useMemo(() =>
    BLOG_POSTS.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        (search === "" ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(search.toLowerCase()))
    ),
    [cat, search]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (q: string) => { setSearch(q); setPage(1); };
  const handleCat    = (c: Cat)    => { setCat(c);    setPage(1); };

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B5E37] to-[#0F3D22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="mb-5 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">News &amp; Blog</span>
          </nav>
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">
            News &amp; Blog
          </h1>
          <p className="mt-3 text-lg text-white/70">
            Stories, updates, and impact reports from the ground.
          </p>

          {/* Search bar */}
          <div className="relative mt-8 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-full border border-white/20 bg-white/10 py-3 pl-11 pr-5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50 backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      {/* Category filters */}
      <section className="bg-white py-5 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => handleCat(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  cat === c
                    ? "bg-[#1B5E37] text-white shadow-md"
                    : "bg-[#F9FBF9] text-[#1A1A1A]/60 hover:bg-[#1B5E37]/10 hover:text-[#1B5E37]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="bg-[#F9FBF9] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {paged.length === 0 ? (
            <div className="py-24 text-center text-[#1A1A1A]/40">
              No articles found. Try a different search or category.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((post) => (
                <Link
                  key={post.slug}
                  href={`/news/${post.slug}`}
                  className="glass-light glass-hover group flex flex-col overflow-hidden rounded-2xl"
                >
                  {/* Cover */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://picsum.photos/seed/${post.coverSeed}/640/360`}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-700"}`}>
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="mb-2 font-heading text-base font-bold leading-snug text-[#0F3D22] group-hover:text-[#1B5E37] transition-colors">
                      {post.title}
                    </h2>
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-[#1A1A1A]/60 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-[#1A1A1A]/45">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>{post.readTime}</span>
                        <span>·</span>
                        <span>{post.date}</span>
                      </div>
                      <span className="flex items-center gap-1 font-semibold text-[#1B5E37] group-hover:gap-2 transition-all">
                        Read <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-9 w-9 rounded-full text-sm font-bold transition-all ${
                    page === i + 1
                      ? "bg-[#1B5E37] text-white"
                      : "bg-white text-[#1A1A1A]/60 hover:bg-[#1B5E37]/10"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Tags cloud */}
          <div className="mt-12 border-t border-[#1B5E37]/10 pt-8">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]/40">
              <Tag size={12} /> Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(BLOG_POSTS.flatMap((p) => p.tags))).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-3 py-1 text-xs text-[#1B5E37] shadow-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
