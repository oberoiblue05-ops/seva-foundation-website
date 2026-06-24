import type { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BASE = "https://sevagroupfdn.org";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE,                          lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
  { url: `${BASE}/about`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${BASE}/gallery`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
  { url: `${BASE}/news`,                lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
  { url: `${BASE}/donations`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  { url: `${BASE}/donor-wall`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.6 },
  { url: `${BASE}/volunteer`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/sponsor`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${BASE}/donate-groceries`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
  { url: `${BASE}/csr`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/legal`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/contact`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  // Service pages
  { url: `${BASE}/services/orphanage`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/services/old-age`,                  lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/services/street-children`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/services/education`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/services/food-relief`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/services/medical-support`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/services/tree-plantation`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/services/widows`,                   lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/services/semi-orphans`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/services/accidental-orphans`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/services/cancer-family-support`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/services/prisoner-family-children`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Dynamic blog slugs from Firestore
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const snap = await getDocs(collection(db, "blogPosts"));
    blogRoutes = snap.docs
      .filter((d) => d.data().isPublished)
      .map((d) => ({
        url:             `${BASE}/news/${d.id}`,
        lastModified:    new Date(d.data().updatedAt ?? d.data().createdAt ?? new Date()),
        changeFrequency: "monthly" as const,
        priority:        0.6,
      }));
  } catch {
    // Firestore unavailable at build time — skip dynamic routes
  }

  return [...STATIC_ROUTES, ...blogRoutes];
}
