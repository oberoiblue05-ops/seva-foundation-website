"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight, Clock, Copy, Check, ArrowLeft } from "lucide-react";
import {
  collection, addDoc, getDocs, query,
  orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BLOG_POSTS } from "../_posts";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Comment {
  id:        string;
  name:      string;
  content:   string;
  createdAt: string;
}

// ─── Full article content ───────────────────────────────────────────────────

const ARTICLE_CONTENT: Record<string, string> = {
  "food-camp-december-2024": `
    <p>Every December, as the cold sets in across Noida Extension, our kitchen fires burn brighter. This year, we set an ambitious target — feed 500 families in a single day — and we exceeded it.</p>
    <h2>The Scale of the Drive</h2>
    <p>With 80 volunteers working in three shifts starting at 5 AM, our community kitchen at Saraswati Kunj produced 2,400 meals across breakfast and lunch. Another 300 dry ration kits — each containing rice, dal, oil, salt, and biscuits — were packed and dispatched to homebound families.</p>
    <p>Local businesses donated vegetables and fuel. A dairy cooperative contributed 200 litres of milk for the children. By 2 PM, the distribution was complete.</p>
    <h2>What Your Donation Made Possible</h2>
    <p>The total cost of this drive was Rs. 1,40,000 — funded entirely by donations received through our Diwali campaign. Every rupee went to food and logistics. Not a single rupee to admin costs for this event.</p>
    <blockquote>"My children ate a hot meal today for the first time this week. Thank you." — A recipient mother, Sector 4, Noida Extension</blockquote>
    <h2>Join Our Next Drive</h2>
    <p>We run food camps quarterly. If you'd like to volunteer, donate ingredients, or sponsor a camp, reach us on WhatsApp or visit our volunteer page.</p>
  `,
  "digital-literacy-launch-2024": `
    <p>In August 2024, we inaugurated our first digital literacy lab — 10 computers, a projector, and a trained instructor — inside a repurposed room at our Noida Extension centre.</p>
    <h2>Why Digital Skills Matter</h2>
    <p>Children in our programmes come from families where no one has ever used a computer. By the time they compete for jobs, basic digital literacy will be non-negotiable. We decided this couldn't wait.</p>
    <p>The curriculum covers typing, internet safety, basic MS Office, and introductory coding through a visual block-based platform. Classes run Monday to Friday for 90 minutes each, with two batches of 20 children.</p>
    <h2>The CSR Partnership</h2>
    <p>The computers, furniture, and one year of instructor salary were funded by a Gold-tier CSR partner — an IT company that requested anonymity. Their contribution was Rs. 3.5 lakh, covering the full setup cost.</p>
    <p>We are now in talks with two more CSR partners to expand the lab to 20 computers and add a second instructor by mid-2025.</p>
  `,
  "tree-plantation-independence-day-2024": `
    <p>On August 15, 2024 — India's 78th Independence Day — we organised simultaneous plantation drives across three locations in Noida Extension. By sundown, 200 native saplings had found new homes.</p>
    <h2>Why Native Species?</h2>
    <p>We partner with the Forest Research Institute to select species suited to NCR's climate: Neem, Peepal, Jamun, and Arjun. These trees grow faster, support local fauna, and require minimal watering once established.</p>
    <p>Each sapling is registered with GPS coordinates and assigned to a volunteer "guardian" who checks on it monthly for three years. Our three-year survival rate is 80% — well above the national average.</p>
    <h2>Children as Change-Makers</h2>
    <p>60 children from our education programme participated, each planting their own sapling and taking home a "tree passport" — a small booklet to record their tree's growth. This isn't just planting; it's environmental ownership.</p>
  `,
  "eye-camp-medical-march-2024": `
    <p>On March 22, 2024 — World Water Day, coincidentally — we ran our largest medical camp to date: a free eye care camp that served 300 patients between 8 AM and 5 PM.</p>
    <h2>The Numbers</h2>
    <p>Two ophthalmologists, one optometrist, and six trained volunteers ran four examination stations simultaneously. Results: 300 eye examinations, 80 free spectacles distributed, and 12 patients referred for cataract surgery (with costs covered by our Medical Fund).</p>
    <h2>Who Came</h2>
    <p>Word spread through WhatsApp groups and our street children programme. Elderly residents, mothers with toddlers, teenagers who'd been squinting at chalkboards for months — all came. A 70-year-old woman had never had her eyes examined in her life.</p>
    <blockquote>"I can see the birds on the wire now. I haven't seen them clearly in five years." — Patient, age 68</blockquote>
    <h2>Next Camp: June 2025</h2>
    <p>We are planning a dental camp for June. If you're a dental professional interested in volunteering, please reach us on WhatsApp.</p>
  `,
  "sponsorship-50-children-2023": `
    <p>At the close of 2023, we reached a milestone that once felt impossible: 50 children in our programme now have individual monthly sponsors — real people whose Rs. 500 per month changes a child's life.</p>
    <h2>How Sponsorship Works</h2>
    <p>A sponsor is matched with a child based on the child's category and the sponsor's preference. Each month, the sponsor receives a progress update: school attendance, health status, a drawing or note from the child. There are no secrets — full transparency.</p>
    <p>The Rs. 500/month covers meals (Rs. 250), school fees pro-rated (Rs. 150), and medical contingency fund (Rs. 100). 100% of the amount reaches the child. Admin overhead for the sponsorship programme is covered separately by our general donors.</p>
    <h2>Stories Behind the Numbers</h2>
    <p>Riya (age 8, orphan) was sponsored in February 2023. By December, she had gone from failing two subjects to ranking third in her class. Her sponsor — a software engineer in Pune — tears up every time he reads her monthly update.</p>
    <p>Arjun (age 10, semi-orphan) used his first sponsored school kit to win a drawing competition. His mother sent us a photo of the ribbon.</p>
    <h2>Sponsor a Child Today</h2>
    <p>There are 38 children still waiting for a sponsor. It costs less than one restaurant dinner a month.</p>
  `,
  "csr-partnership-techcorp-2023": `
    <p>In September 2023, Seva Group Foundation signed its first Gold-tier CSR partnership — a Rs. 5 lakh commitment from a leading IT services company, directed entirely to our education fund.</p>
    <h2>What Gold-Tier CSR Means</h2>
    <p>Our CSR tiers (Silver: Rs. 1L, Gold: Rs. 5L, Platinum: Rs. 15L+) come with structured impact reporting, co-branding, employee volunteering days, and a dedicated impact certificate for compliance filings. The partner company can claim 80G deduction on the full amount.</p>
    <h2>Impact of This Partnership</h2>
    <p>The Rs. 5 lakh is allocated as follows: Rs. 3.5 lakh for the digital literacy lab (inaugurated August 2024), Rs. 1 lakh for scholarships (25 children fully funded for one academic year), and Rs. 50,000 for the tutoring centre's annual operating costs.</p>
    <h2>Employee Volunteering</h2>
    <p>15 employees from the partner company volunteered for two Saturday drives in October 2023 — one food camp and one tree plantation. Their internal employee magazine featured the partnership in a four-page spread.</p>
    <p>If your organisation is exploring CSR options for FY 2025-26, we have three Platinum slots and seven Gold slots available. Reach us at contact@sevagroupfdn.org or explore our CSR page.</p>
  `,
};

// ─── Social share icons ─────────────────────────────────────────────────────

function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  "Food Relief":   "bg-orange-100 text-orange-700",
  "Education":     "bg-purple-100 text-purple-700",
  "Environment":   "bg-green-100 text-green-700",
  "Medical Camp":  "bg-blue-100 text-blue-700",
  "Child Welfare": "bg-pink-100 text-pink-700",
  "CSR":           "bg-yellow-100 text-yellow-700",
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function ArticleContent({ slug }: { slug: string }) {
  const post    = BLOG_POSTS.find((p) => p.slug === slug);
  const content = ARTICLE_CONTENT[slug] ?? "<p>Full article coming soon.</p>";

  const [comments,   setComments]   = useState<Comment[]>([]);
  const [name,       setName]       = useState("");
  const [comment,    setComment]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [copied,     setCopied]     = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, "blogPosts", slug, "comments"),
          orderBy("createdAt", "asc")
        );
        const snap = await getDocs(q);
        setComments(
          snap.docs.map((d) => ({
            id: d.id,
            name:      (d.data().name      as string) ?? "Anonymous",
            content:   (d.data().content   as string) ?? "",
            createdAt: (d.data().createdAt as { toDate?: () => Date })?.toDate?.()?.toLocaleDateString("en-IN") ?? "Recently",
          }))
        );
      } catch {
        // Firebase not yet configured
      }
    };
    load();
  }, [slug]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "blogPosts", slug, "comments"), {
        name: name.trim(),
        content: comment.trim(),
        createdAt: serverTimestamp(),
        isApproved: false,
      });
      setComments((prev) => [
        ...prev,
        { id: Date.now().toString(), name: name.trim(), content: comment.trim(), createdAt: "Just now" },
      ]);
      setName("");
      setComment("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      alert("Could not post comment. Please try again.");
    }
    setSubmitting(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  };

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  if (!post) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#1A1A1A]/50">Article not found.</p>
          <Link href="/news" className="mt-4 inline-block text-[#1B5E37] underline">
            ← Back to News
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Cover image + hero */}
      <section className="relative">
        <div className="relative h-64 overflow-hidden sm:h-80 lg:h-[420px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://picsum.photos/seed/${post.coverSeed}/1200/500`}
            alt={post.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D22]/80 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <nav className="mb-3 flex items-center gap-2 text-sm text-white/60">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={14} />
              <Link href="/news" className="hover:text-white transition-colors">News</Link>
              <ChevronRight size={14} />
              <span className="text-white line-clamp-1">{post.title}</span>
            </nav>
            <span className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-700"}`}>
              {post.category}
            </span>
            <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Author card + meta */}
          <div className="mb-8 flex items-center gap-4 rounded-2xl bg-[#F9FBF9] p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1B5E37] font-heading text-lg font-bold text-white">
              {post.author[0]}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#0F3D22]">{post.author}</p>
              <div className="flex items-center gap-3 text-xs text-[#1A1A1A]/50">
                <span>{post.date}</span>
                <span>·</span>
                <Clock size={11} />
                <span>{post.readTime}</span>
              </div>
            </div>
            {/* Social share */}
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${pageUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white transition-opacity hover:opacity-80"
                title="Share on WhatsApp"
              >
                <WhatsAppShareIcon />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-80"
                title="Share on X/Twitter"
              >
                <TwitterIcon />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A66C2] text-white transition-opacity hover:opacity-80"
                title="Share on LinkedIn"
              >
                <LinkedInShareIcon />
              </a>
              <button
                onClick={handleCopy}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[#1A1A1A]/60 transition-all hover:bg-gray-200"
                title="Copy link"
              >
                {copied ? <Check size={14} className="text-[#1B5E37]" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Article HTML */}
          <div
            className="prose prose-green max-w-none [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#0F3D22] [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:text-[#1A1A1A]/75 [&_p]:leading-relaxed [&_p]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#F5A623] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#1A1A1A]/60 [&_blockquote]:my-6"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-gray-100 pt-6">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#F9FBF9] px-3 py-1 text-xs text-[#1B5E37]">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Comments */}
      <section className="bg-[#F9FBF9] py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-8 font-heading text-xl font-bold text-[#0F3D22]">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h2>

          {comments.length === 0 ? (
            <p className="mb-8 text-sm text-[#1A1A1A]/40">
              No comments yet. Be the first to share your thoughts.
            </p>
          ) : (
            <div className="mb-8 space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="glass-light rounded-2xl p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-[#0F3D22]">{c.name}</p>
                    <span className="text-xs text-[#1A1A1A]/40">{c.createdAt}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#1A1A1A]/70">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl bg-white p-7 shadow-sm">
            <h3 className="mb-5 font-heading text-base font-bold text-[#0F3D22]">Leave a Comment</h3>
            {submitted ? (
              <div className="rounded-xl bg-[#1B5E37]/10 p-4 text-sm text-[#1B5E37]">
                ✓ Thank you! Your comment is pending approval.
              </div>
            ) : (
              <form onSubmit={handleComment} className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name *"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20"
                />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts… *"
                  rows={4}
                  required
                  className="w-full resize-none rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[#1B5E37] px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? "Posting…" : "Post Comment"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-6 font-heading text-xl font-bold text-[#0F3D22]">Related Articles</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/news/${r.slug}`}
                className="glass-light glass-hover group overflow-hidden rounded-2xl"
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://picsum.photos/seed/${r.coverSeed}/640/360`}
                    alt={r.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <p className="mb-1 text-xs font-semibold text-[#1B5E37]">{r.category}</p>
                  <h3 className="font-heading text-sm font-bold leading-snug text-[#0F3D22]">{r.title}</h3>
                  <p className="mt-1.5 text-xs text-[#1A1A1A]/45">{r.date} · {r.readTime}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href="/news"
              className="flex items-center gap-2 text-sm font-semibold text-[#1B5E37] hover:gap-3 transition-all"
            >
              <ArrowLeft size={15} />
              All Articles
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
