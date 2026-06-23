import Link from "next/link";
import { SOCIAL_LINKS, WHATSAPP_LINK } from "@/constants";

const PLATFORMS = [
  {
    name: "Instagram",
    handle: "@sevagroupfdn",
    url: SOCIAL_LINKS.instagram,
    color: "from-[#833AB4] via-[#FD1D1D] to-[#FCB045]",
    posts: [103, 237, 178, 316, 450, 567].slice(0, 6),
    cta: "Follow on Instagram",
    desc: "Photos & reels from our camps, drives, and daily seva.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    handle: "@sevagroupfdn",
    url: SOCIAL_LINKS.youtube,
    color: "from-[#FF0000] to-[#CC0000]",
    posts: [567, 103, 450],
    cta: "Subscribe on YouTube",
    desc: "Videos of our programs, testimonials, and impact stories.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    handle: "Seva Group Foundation",
    url: SOCIAL_LINKS.facebook,
    color: "from-[#1877F2] to-[#0D5FD1]",
    posts: [316, 178, 237, 103],
    cta: "Like on Facebook",
    desc: "Community updates, live events, and donation drives.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export default function SocialMediaSection() {
  return (
    <section className="bg-[#F9FBF9] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1B5E37]">
            Stay Connected
          </p>
          <h2 className="font-heading text-3xl font-bold text-[#0F3D22] sm:text-4xl">
            Follow Our Journey
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#1A1A1A]/60">
            See the faces behind the mission, the drives in action, and the smiles your
            donations create.
          </p>
        </div>

        {/* Platform cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {PLATFORMS.map(({ name, handle, url, color, posts, cta, desc, icon }) => (
            <div key={name} className="glass-light glass-hover overflow-hidden rounded-2xl">
              {/* Platform header */}
              <div className={`flex items-center gap-3 bg-gradient-to-r p-4 ${color}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  {icon}
                </div>
                <div>
                  <p className="font-bold text-white">{name}</p>
                  <p className="text-xs text-white/80">{handle}</p>
                </div>
              </div>

              {/* Photo grid placeholder */}
              <div className={`grid ${posts.length >= 6 ? "grid-cols-3" : posts.length >= 4 ? "grid-cols-2" : "grid-cols-1"} gap-1 p-2`}>
                {posts.map((seed) => (
                  <div
                    key={seed}
                    className="aspect-square overflow-hidden rounded-lg bg-gray-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://picsum.photos/seed/${seed + 800}/200/200`}
                      alt="Activity"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4">
                <p className="mb-3 text-sm text-[#1A1A1A]/60">{desc}</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-full border border-[#1B5E37] py-2 text-center text-sm font-semibold text-[#1B5E37] transition-colors hover:bg-[#1B5E37] hover:text-white"
                >
                  {cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp community card */}
        <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-2xl bg-[#1B5E37] p-8 sm:flex-row">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Join Our WhatsApp Community
              </h3>
              <p className="mt-1 text-sm text-white/60">
                Get updates on events, drives, and impact stories directly on WhatsApp.
              </p>
            </div>
          </div>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-[#25D366] px-7 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#20BD5C]"
          >
            Join Community
          </a>
        </div>
      </div>
    </section>
  );
}
